<script setup>
import { ref } from 'vue'

const emits = defineEmits(['login-success'])

// 显示状态：'login' | 'register'
const view = ref('login')

// 表单数据
const loginForm = ref({
  account: '',
  password: ''
})

const registerForm = ref({
  account: '',
  password: '',
  confirm: ''
})

// 凭证存储键
const credentialsKey = 'zhangxianghang_credential'

// 加载凭证
const loadCredentials = () => {
  try {
    const stored = localStorage.getItem(credentialsKey)
    if (stored) {
      const creds = JSON.parse(stored)
      if (Array.isArray(creds) && creds.length > 0) return creds
    }
  } catch (e) {
    console.error('读取凭证失败:', e)
  }
  // 默认初始账号
  return [{ account: '123456', password: '123456' }]
}

// 保存凭证
const saveCredentials = (creds) => {
  localStorage.setItem(credentialsKey, JSON.stringify(creds))
}

// 切换视图
const switchToRegister = () => {
  view.value = 'register'
}

const switchToLogin = () => {
  view.value = 'login'
}

// 登录
const doLogin = () => {
  const acc = loginForm.value.account.trim()
  const pwd = loginForm.value.password

  if (!acc || !pwd) {
    alert('请输入账号和密码~')
    return
  }

  const creds = loadCredentials()
  const matched = creds.some(c => c.account === acc && c.password === pwd)

  if (matched) {
    loginForm.value.account = ''
    loginForm.value.password = ''
    emits('login-success')
  } else {
    alert('账号或密码错误，请重试~\n（初始账号密码均为 123456）')
  }
}

// 注册
const doRegister = () => {
  const acc = registerForm.value.account.trim()
  const pwd = registerForm.value.password
  const confirm = registerForm.value.confirm

  if (!acc || !pwd) {
    alert('账号和密码不能为空~')
    return
  }

  if (pwd !== confirm) {
    alert('两次密码输入不一致~')
    return
  }

  const creds = loadCredentials()

  if (creds.some(c => c.account === acc)) {
    alert('该账号已存在，请直接登录或换一个账号名~')
    return
  }

  // 追加新账号到数组，而不是覆盖
  creds.push({ account: acc, password: pwd })
  saveCredentials(creds)

  alert('注册成功！现在可以用新账号登录了~')

  // 清空表单
  registerForm.value.account = ''
  registerForm.value.password = ''
  registerForm.value.confirm = ''

  // 切换回登录视图
  switchToLogin()
}
</script>

<template>
  <div id="loginView">
    <!-- 登录视图 -->
    <div class="card auth-card" v-if="view === 'login'">
      <h2>请先登录你的账号</h2>
      <div class="auth-fields">
        <label>账号：<input
          type="text"
          v-model="loginForm.account"
          placeholder="请输入账号"
          @keydown.enter="doLogin"
        /></label>
        <label>密码：<input
          type="password"
          v-model="loginForm.password"
          placeholder="请输入密码"
          @keydown.enter="doLogin"
        /></label>
      </div>
      <button type="button" class="auth-btn" @click="doLogin">登 录</button>
      <div class="auth-link"><a href="#" @click.prevent="switchToRegister">还没有账号？立即注册</a></div>
    </div>

    <!-- 注册视图 -->
    <div class="card auth-card" v-else>
      <h2>创建 / 修改账号</h2>
      <div class="auth-fields">
        <label>账号：<input
          type="text"
          v-model="registerForm.account"
          placeholder="请输入账号"
        /></label>
        <label>密码：<input
          type="password"
          v-model="registerForm.password"
          placeholder="请输入密码"
        /></label>
        <label>确认密码：<input
          type="password"
          v-model="registerForm.confirm"
          placeholder="请再次输入密码"
        /></label>
      </div>
      <button type="button" class="auth-btn" @click="doRegister">注 册</button>
      <div class="auth-link"><a href="#" @click.prevent="switchToLogin">已有账号？返回登录</a></div>
    </div>
  </div>
</template>
