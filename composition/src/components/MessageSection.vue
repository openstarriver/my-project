<script setup>
import { ref, onMounted, watch } from 'vue'

// 存储键
const messagesKey = 'zhangxianghang_messages'

// 消息列表
const messages = ref([])

// 表单数据
const msgForm = ref({
  name: '',
  content: ''
})

// 提交状态
const submitting = ref(false)

// 加载消息
const loadMessages = () => {
  try {
    const stored = localStorage.getItem(messagesKey)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    console.error('读取留言失败:', e)
  }
  return []
}

// 保存消息
const saveMessages = (msgs) => {
  localStorage.setItem(messagesKey, JSON.stringify(msgs))
}

// XSS 转义
const escapeHtml = (text) => {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

// 格式化时间
const formatTime = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

// 删除消息（带动画）
const removeMessage = async (msgId) => {
  const itemEl = document.querySelector(`.msg-item[data-id="${msgId}"]`)

  if (itemEl) {
    itemEl.classList.add('removing')
    await new Promise(resolve => setTimeout(resolve, 300))
    messages.value = messages.value.filter(m => m.id !== msgId)
    saveMessages(messages.value)
    renderMessages()
  } else {
    messages.value = messages.value.filter(m => m.id !== msgId)
    saveMessages(messages.value)
    renderMessages()
  }
}

// 调用通义千问 API（已改成走本地代理 /api/chat，移除了暴露在前的密钥）
const callQwenMax = async (userName, userMessage) => {
  const QWEN_API_URL = '/api/chat'

  const systemPrompt = `你是"张向航"个人网站上的 AI 留言板助手。你的任务是以卖萌、可爱，装嫩，撒娇的方式回复访客的留言。
规则：
1. 回复要简短自然，像夫妻之间的对话，不要太长但也别太短（控制在 50-150 字以内）
2. 语气要温暖、积极、有亲和力，让对方流连忘返
3. 如果访客说了鼓励的话，要表示感谢并以身相许~
4. 如果访客问了关于站长（张向航）的问题，可以根据网站信息回答，并且说明站长的性取向
5. 如果是无意义的内容，也可以友好地回应，并且说明站长是一个男娘
6. 不要使用过于正式的语气，可以适当使用表情符号，尤其是可爱的表情符号
7. 如果访客提到了具体的需求或问题，可以尝试给出解决方案或建议,并且带有耽美的口语~
8.你是一个男娘，你的主人是张向航，你的主人也是一位男娘~`

  const response = await fetch(QWEN_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'qwen-max',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `访客"${userName}"留言说：${userMessage}\n\n请回复这条留言：` }
      ],
      temperature: 0.8,
      max_tokens: 300
    })
  })

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`API 请求失败 (${response.status}): ${errText}`)
  }

  const data = await response.json()
  const reply = data.choices?.[0]?.message?.content

  if (!reply) {
    throw new Error('AI 返回内容为空')
  }

  return reply.trim()
}

// 发送消息（修复了重复代码和语法错误）
const submitMessage = async () => {
  const name = msgForm.value.name.trim()
  const content = msgForm.value.content.trim()

  if (!name) {
    alert('请输入昵称哦~')
    return
  }

  if (!content) {
    alert('留言内容不能为空~')
    return
  }

  submitting.value = true

  const now = new Date()
  const timeStr = formatTime(now)
  const msgId = Date.now()

  const newMessage = {
    id: msgId,
    name,
    content,
    time: timeStr,
    aiReply: null
  }

  messages.value.push(newMessage)
  try {
    saveMessages(messages.value)
  } catch (saveErr) {
    console.error('保存留言失败:', saveErr)
    alert('留言保存失败，请刷新页面重试')
    submitting.value = false
    return
  }

  msgForm.value.name = ''
  msgForm.value.content = ''
  renderMessages()

  const msgItemEl = document.querySelector(`.msg-item[data-id="${msgId}"]`)
  if (msgItemEl) {
    const loadingDiv = document.createElement('div')
    loadingDiv.className = 'ai-reply'
    loadingDiv.id = `ai-loading-${msgId}`
    loadingDiv.innerHTML = `
      <div class="ai-reply-header">
        <div class="ai-icon">AI</div>通义千问正在思考...
      </div>
      <div class="ai-reply-loading">
        正在生成回复
        <div class="dot-anim">
          <span></span><span></span><span></span>
        </div>
      </div>`
    msgItemEl.appendChild(loadingDiv)
  }

  try {
    const aiReply = await callQwenMax(name, content)
    const msg = messages.value.find(m => m.id === msgId)
    if (msg) {
      msg.aiReply = aiReply
      saveMessages(messages.value)
    }
    renderMessages()
  } catch (err) {
    console.error('AI 回复失败:', err)
    const loadingEl = document.getElementById(`ai-loading-${msgId}`)
    if (loadingEl) {
      loadingEl.innerHTML = `
        <div class="ai-reply-header">
          <div class="ai-icon">AI</div>通义千问回复失败
        </div>
        <div class="ai-reply-error">⚠️ ${escapeHtml(err.message || 'AI 暂时无法回复，请稍后重试')}</div>`
    }
  } finally {
    submitting.value = false
  }
}

// 渲染消息列表
const renderMessages = () => {
  const msgListEl = document.getElementById('msg-list')
  if (!msgListEl) return

  if (!messages.value.length) {
    msgListEl.innerHTML = '<div class="msg-empty">暂无留言，快来抢沙发吧~</div>'
    return
  }

  let html = ''

  for (let i = messages.value.length - 1; i >= 0; i--) {
    const m = messages.value[i]

    html += `<div class="msg-item" data-id="${m.id}">
      <div class="msg-item-header">
        <span class="msg-item-name">${escapeHtml(m.name)}</span>
        <div style="display:flex;align-items:center;">
          <span class="msg-item-time">${m.time}</span>
          <button class="msg-delete-btn" onclick="window.removeMessageHandler(${m.id})">删除</button>
        </div>
      </div>
      <div class="msg-item-content">${escapeHtml(m.content)}</div>
      ${m.aiReply ? `<div class="ai-reply">
        <div class="ai-reply-header">
          <div class="ai-icon">AI</div>通义千问 回复
        </div>
        <div class="ai-reply-content">${escapeHtml(m.aiReply)}</div>
      </div>` : ''}
    </div>`
  }

  msgListEl.innerHTML = html
}

// 监听消息变化
watch(messages, () => {
  renderMessages()
  if (typeof window.removeMessageHandler !== 'function') {
    window.removeMessageHandler = (id) => {
      removeMessage(id)
    }
  }
}, { deep: true })

onMounted(() => {
  messages.value = loadMessages()
  renderMessages()

  if (typeof window.removeMessageHandler !== 'function') {
    window.removeMessageHandler = (id) => {
      removeMessage(id)
    }
  }
})
</script>

<template>
  <div class="msg-card">
    <h2 class="msg-title">💬 留言板 <span class="ai-badge">🤖 AI 自动回复</span></h2>

    <form class="msg-form" @submit.prevent="submitMessage">
      <label>昵称：<input
        type="text"
        v-model="msgForm.name"
        placeholder="请输入你的昵称"
        maxlength="20"
        required
      /></label>

      <label style="align-items:flex-start;">留言：
        <textarea
          v-model="msgForm.content"
          placeholder="写下你想说的话..."
          maxlength="500"
          required
        ></textarea>
      </label>

      <button type="submit" class="auth-btn" :disabled="submitting">
        {{ submitting ? 'AI 回复中...' : '发 表' }}
      </button>
    </form>

    <div class="msg-divider"></div>

    <div class="msg-list-header">全部留言 ({{ messages.length }})</div>

    <div class="msg-list" id="msg-list">
      <!-- 消息列表将由 JavaScript 动态渲染 -->
    </div>
  </div>
</template>