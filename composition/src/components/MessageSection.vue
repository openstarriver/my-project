<script setup>
import { ref, reactive, computed, onMounted } from 'vue'

const messagesKey = 'zhangxianghang_messages'
const AI_API_URL = '/api/chat'


/* ============================================================
   状态定义
   ============================================================ */

// 留言列表（按时间正序存放，界面上倒序展示，最新的在最上面）
const messages = ref([])

// 留言表单：昵称 + 内容
const msgForm = ref({ name: '', content: '' })

// 提交中标记：AI 回复期间禁用按钮，避免重复提交
const submitting = ref(false)

// 正在播放删除动画的留言 id 集合。
// 先给元素挂上 .removing 让淡出动画播完，再真正从数据里删除
const removingIds = ref([])

// 界面倒序展示：数组末尾是最新的留言，反转后最新的一条排在最上面
const reversedMessages = computed(() => [...messages.value].reverse())


/* ============================================================
   工具函数
   ============================================================ */

// 从 localStorage 读取留言
const loadMessages = () => {
  try {
    const stored = localStorage.getItem(messagesKey)
    if (!stored) return []
    const parsed = JSON.parse(stored)
    // 防御：存储内容若被外部改坏（比如变成 null 或对象），
    // 直接当作空列表，避免渲染时 .length 报错导致整个页面白屏
    return Array.isArray(parsed) ? parsed : []
  } catch (e) {
    console.error('读取留言失败:', e)
    return []
  }
}

// 把留言写入 localStorage
// 只落盘稳定字段：aiStatus / aiError 这类临时状态不存，
// 否则刷新后会永久卡在"正在思考…"或一条早已过期的报错上
const saveMessages = () => {
  const snapshot = messages.value.map(m => ({
    id: m.id,
    name: m.name,
    content: m.content,
    time: m.time,
    aiReply: m.aiReply || null
  }))
  localStorage.setItem(messagesKey, JSON.stringify(snapshot))
}

// 格式化时间为 "2026-09-20 20:30"
const formatTime = (date) => {
  const pad = (n) => String(n).padStart(2, '0')
  const ymd = [date.getFullYear(), pad(date.getMonth() + 1), pad(date.getDate())].join('-')
  const hm = [pad(date.getHours()), pad(date.getMinutes())].join(':')
  return `${ymd} ${hm}`
}

// 生成留言 id
// 直接用 Date.now() 的话，同一毫秒内连发两条会拿到相同 id，
// 之后删掉其中一条会把另一条也一起删掉，所以补一个自增序号保证唯一
let idSeq = 0
const nextId = () => `${Date.now()}-${idSeq++}`


/* ============================================================
   AI 调用
   ============================================================ */

// 请求通义千问生成回复
const callQwenMax = async (userName, userMessage) => {
  const systemPrompt = `你是"张向航"个人网站上的 AI 留言板助手。你的任务是以卖萌、可爱，装嫩，撒娇的方式回复访客的留言。
规则：
1. 回复要简短自然，像夫妻之间的对话，不要太长但也别太短（控制在 50-150 字以内）
2. 语气要温暖、积极、有亲和力，让对方流连忘返
3. 如果访客说了鼓励的话，要表示感谢
4. 如果访客问了关于站长（张向航）的问题，可以根据网站信息回答
5. 如果是无意义的内容，也可以友好地回应，并且说明站长是一个男娘
6. 不要使用过于正式的语气，可以适当使用表情符号，尤其是可爱的表情符号
7. 如果访客提到了具体的需求或问题，可以尝试给出解决方案或建议`

  const response = await fetch(AI_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
    // 上游的报错内容不直接透给访客，只告诉他们失败了、状态码是多少
    throw new Error(`AI 服务暂时不可用（${response.status}）`)
  }

  const data = await response.json()
  const reply = data.choices?.[0]?.message?.content

  if (!reply) throw new Error('AI 没有返回内容，请稍后重试')

  return reply.trim()
}


/* ============================================================
   交互逻辑
   ============================================================ */

// 发表留言
const submitMessage = async () => {
  // 提交期间直接挡住。按钮虽然 disabled 了，但在输入框里按回车
  // 照样会触发表单的 submit 事件 —— 不拦这一道，连按两次回车
  // 会发出两条一模一样的留言，并且并排打两次 AI 接口
  if (submitting.value) return

  const name = msgForm.value.name.trim()
  const content = msgForm.value.content.trim()

  if (!name) return alert('请输入昵称哦~')
  if (!content) return alert('留言内容不能为空~')

  submitting.value = true

  // 必须用 reactive 包装后再入库：
  // 直接存普通对象的话，后面改 aiReply 不会触发界面更新（改的是原始对象，绕过了响应式代理）
  const created = reactive({
    id: nextId(),
    name,
    content,
    time: formatTime(new Date()),
    aiReply: null,
    aiStatus: 'loading', // loading | done | error
    aiError: ''
  })

  messages.value.push(created)

  // 先落盘，保证就算 AI 挂了，留言本身刷新后也不会丢
  try {
    saveMessages()
  } catch (e) {
    console.error('保存留言失败:', e)
    messages.value.pop() // 存不下就回滚，别让界面和存储对不上
    submitting.value = false
    return alert('留言保存失败，请检查浏览器是否禁用了本地存储')
  }

  // 清空表单
  msgForm.value.name = ''
  msgForm.value.content = ''

  // 请求 AI 回复
  try {
    created.aiReply = await callQwenMax(name, content)
    created.aiStatus = 'done'
    saveMessages() // 把回复一起存下来，刷新后依然能看到
  } catch (err) {
    console.error('AI 回复失败:', err)
    created.aiStatus = 'error'
    created.aiError = err.message || 'AI 暂时无法回复，请稍后重试'
  } finally {
    submitting.value = false
  }
}

// 删除留言
const removeMessage = async (msgId) => {
  // 播放淡出动画
  removingIds.value = [...removingIds.value, msgId]
  await new Promise(resolve => setTimeout(resolve, 300))

  // 动画播完再从数据里移除，并同步到 localStorage
  messages.value = messages.value.filter(m => m.id !== msgId)
  removingIds.value = removingIds.value.filter(id => id !== msgId)

  try {
    saveMessages()
  } catch (e) {
    console.error('保存留言失败:', e)
  }
}


/* ============================================================
   生命周期
   ============================================================ */

onMounted(() => {
  // 页面加载时把历史留言读回来
  messages.value = loadMessages()
})
</script>

<template>
  <div class="msg-card">
    <h2 class="msg-title">💬 留言板 <span class="ai-badge">🤖 AI 自动回复</span></h2>

    <!-- 留言表单 -->
    <form class="msg-form" @submit.prevent="submitMessage">
      <label>昵称：<input
        type="text"
        v-model="msgForm.name"
        placeholder="请输入你的昵称"
        maxlength="20"
        required
      /></label>

      <label class="msg-label-top">留言：
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

    <!-- 留言总数（实时统计） -->
    <div class="msg-list-header">全部留言 ({{ messages.length }})</div>

    <!-- 留言列表：数据一变界面自动更新，无需手动操作 DOM -->
    <div class="msg-list" id="msg-list">
      <div v-if="!messages.length" class="msg-empty">暂无留言，快来抢沙发吧~</div>

      <div
        v-for="m in reversedMessages"
        :key="m.id"
        class="msg-item"
        :class="{ removing: removingIds.includes(m.id) }"
        :data-id="m.id"
      >
        <!-- 昵称 + 时间 + 删除按钮 -->
        <div class="msg-item-header">
          <span class="msg-item-name">{{ m.name }}</span>
          <div class="msg-item-meta">
            <span class="msg-item-time">{{ m.time }}</span>
            <button class="msg-delete-btn" @click="removeMessage(m.id)">删除</button>
          </div>
        </div>

        <!-- 留言正文 -->
        <div class="msg-item-content">{{ m.content }}</div>

        <!-- AI 回复成功 -->
        <div v-if="m.aiReply" class="ai-reply">
          <div class="ai-reply-header">
            <div class="ai-icon">AI</div>通义千问 回复
          </div>
          <div class="ai-reply-content">{{ m.aiReply }}</div>
        </div>

        <!-- AI 回复中 -->
        <div v-else-if="m.aiStatus === 'loading'" class="ai-reply">
          <div class="ai-reply-header">
            <div class="ai-icon">AI</div>通义千问正在思考...
          </div>
          <div class="ai-reply-loading">
            正在生成回复
            <div class="dot-anim">
              <span></span><span></span><span></span>
            </div>
          </div>
        </div>

        <!-- AI 回复失败 -->
        <div v-else-if="m.aiStatus === 'error'" class="ai-reply">
          <div class="ai-reply-header">
            <div class="ai-icon">AI</div>通义千问回复失败
          </div>
          <div class="ai-reply-error">⚠️ {{ m.aiError }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
