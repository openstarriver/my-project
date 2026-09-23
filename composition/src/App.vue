<script setup>
import { ref } from 'vue'
import AuthView from './components/AuthView.vue'
import IntroSection from './components/IntroSection.vue'
import SliderSection from './components/SliderSection.vue'
import MessageSection from './components/MessageSection.vue'

/* ============================================================
   登录态管理
   ============================================================ */

// 登录态存储键。登录成功后置为 'true'，
// 刷新页面时读它来判断要不要跳过登录页
const LOGIN_KEY = 'zhangxianghang_loggedIn'

// 读取登录态
const checkLoggedIn = () => {
  try {
    return localStorage.getItem(LOGIN_KEY) === 'true'
  } catch (e) {
    // 浏览器禁用本地存储时，稳妥起见当作未登录处理
    return false
  }
}

// 是否已登录：false 显示登录页，true 显示主站内容。
// 必须在这里同步取一次，不能留到 onMounted 里再赋值 ——
// 那样首帧渲染的永远是登录页，已登录的人每次刷新都会
// 看到登录表单闪一下、再被主站顶掉。
const showApp = ref(checkLoggedIn())

// 登录成功回调：由 AuthView 校验通过后触发
const enterApp = () => {
  try {
    localStorage.setItem(LOGIN_KEY, 'true')
  } catch (e) {
    console.error('记录登录态失败:', e)
  }
  showApp.value = true
}

// 退出登录：清掉登录态并退回登录页
const logout = () => {
  try {
    localStorage.removeItem(LOGIN_KEY)
  } catch (e) {
    console.error('清除登录态失败:', e)
  }
  showApp.value = false
}
</script>

<template>
  <div class="app-container">
    <!-- 未登录：只显示登录/注册页，主站内容完全不渲染 -->
    <AuthView v-if="!showApp" @login-success="enterApp" />

    <!-- 已登录：显示主站三个板块 -->
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
/* 根容器：撑满整屏，让内部各板块能各自占满一屏 */
.app-container {
  width: 100%;
  min-height: 100vh;
}
</style>
