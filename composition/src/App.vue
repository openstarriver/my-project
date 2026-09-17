<script setup>
import { ref, onMounted } from 'vue'
import AuthView from './components/AuthView.vue'
import IntroSection from './components/IntroSection.vue'
import SliderSection from './components/SliderSection.vue'
import MessageSection from './components/MessageSection.vue'

// 控制显示状态
const showApp = ref(false)
const credentialsKey = 'zhangxianghang_credential'

// 从 localStorage 加载凭证
const loadCredentials = () => {
  try {
    const stored = localStorage.getItem(credentialsKey)
    if (stored) {
      const creds = JSON.parse(stored)
      if (Array.isArray(creds) && creds.length > 0) return true
    }
  } catch (e) {
    console.error('读取凭证失败:', e)
  }
  // 默认存在初始账号
  return true
}

// 检查是否已登录（简单检查，实际应该存储用户信息）
const checkLoggedIn = () => {
  try {
    const loggedIn = localStorage.getItem('zhangxianghang_loggedIn')
    return loggedIn === 'true'
  } catch (e) {
    return false
  }
}

onMounted(() => {
  const loggedIn = checkLoggedIn()
  showApp.value = loggedIn
})

// 进入应用
const enterApp = () => {
  localStorage.setItem('zhangxianghang_loggedIn', 'true')
  showApp.value = true
}

// 退出登录
const logout = () => {
  localStorage.removeItem('zhangxianghang_loggedIn')
  showApp.value = false
}
</script>

<template>
  <div class="app-container">
    <!-- 登录/注册视图 -->
    <AuthView v-if="!showApp" @login-success="enterApp" />

    <!-- 主应用视图 -->
    <div v-else class="app-view">
      <button class="logout-btn" @click="logout">退出登录</button>

      <section class="section" id="sec-intro">
        <IntroSection />
      </section>

      <section class="section" id="sec-slider">
        <SliderSection />
      </section>

      <section class="section" id="sec-msg">
        <MessageSection />
      </section>

      <p class="end-tip">— 到此结束 · 感谢浏览 —</p>
    </div>
  </div>
</template>

<style scoped>
.app-container {
  width: 100%;
  min-height: 100vh;
}
</style>
