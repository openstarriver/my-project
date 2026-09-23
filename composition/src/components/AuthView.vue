<script setup>
import { ref } from 'vue'

/* ============================================================
   登录 / 注册组件
   只有账号密码校验通过才会向父组件抛出 login-success，
   父组件收到后才切换到主站内容
   ============================================================ */

// 向父组件（App.vue）抛出的事件
const emits = defineEmits(['login-success'])

// 当前显示哪个视图：'login' 登录页 | 'register' 注册页
const view = ref('login')

// 登录表单
const loginForm = ref({ account: '', password: '' })

// 注册表单
const registerForm = ref({ account: '', password: '', confirm: '' })

// 账号数据存在 localStorage 里的键名
const credentialsKey = 'zhangxianghang_credential'


/* ============================================================
   账号数据读写
   ============================================================ */

// 读取全部已注册账号
// 第一次打开网站时 localStorage 里是空的，这时返回一个内置的初始账号
const loadCredentials = () => {
  try {
    const stored = localStorage.getItem(credentialsKey)
    if (stored) {
      const creds = JSON.parse(stored)
      // 校验每个元素都是带着账号密码的对象再收下。
      // 光判 Array.isArray 还不够：存储被改坏成 [null] 时，
      // 后面 creds.some(c => c.account) 一样会抛 TypeError 白屏
      if (Array.isArray(creds)) {
        const valid = creds.filter(c => c && c.account && c.password)
        if (valid.length) return valid
      }
    }
  } catch (e) {
    console.error('读取凭证失败:', e)
  }
  // 默认初始账号：账号密码均为 123456
  return [{ account: '123456', password: '123456' }]
}

// 保存账号列表
const saveCredentials = (creds) => {
  localStorage.setItem(credentialsKey, JSON.stringify(creds))
}


/* ============================================================
   视图切换
   ============================================================ */

// 登录页与注册页互切
const setView = (target) => {
  view.value = target
}


/* ============================================================
   登录
   ============================================================ */

const doLogin = () => {
  const acc = loginForm.value.account.trim()
  const pwd = loginForm.value.password

  // 空值校验
  if (!acc || !pwd) {
    alert('请输入账号和密码~')
    return
  }

  // 与已注册账号逐一比对，全部匹配上才算通过
  const matched = loadCredentials().some(c => c.account === acc && c.password === pwd)

  if (!matched) {
    alert('账号或密码错误，请重试~\n（初始账号密码均为 123456）')
    return
  }

  // 校验通过：清空表单再通知父组件放行
  loginForm.value.account = ''
  loginForm.value.password = ''
  emits('login-success')
}


/* ============================================================
   注册
   ============================================================ */

const doRegister = () => {
  const acc = registerForm.value.account.trim()
  const pwd = registerForm.value.password
  const confirm = registerForm.value.confirm

  if (!acc || !pwd) {
    alert('账号和密码不能为空~')
    return
  }

  // 两次密码必须一致
  if (pwd !== confirm) {
    alert('两次密码输入不一致~')
    return
  }

  const creds = loadCredentials()

  // 账号不能重复
  if (creds.some(c => c.account === acc)) {
    alert('该账号已存在，请直接登录或换一个账号名~')
    return
  }

  // 追加到已有账号数组（注意是 push 追加，不是覆盖）
  creds.push({ account: acc, password: pwd })
  saveCredentials(creds)

  alert('注册成功！现在可以用新账号登录了~')

  // 清空表单并切回登录页
  registerForm.value.account = ''
  registerForm.value.password = ''
  registerForm.value.confirm = ''
  setView('login')
}
</script>

<template>
  <div id="loginView">
    <!-- ============ 登录视图 ============ -->
    <div class="card auth-card" v-if="view === 'login'">
      <h2>请先登录你的账号</h2>

      <div class="auth-fields">
        <!-- 按回车也能直接提交 -->
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
      <div class="auth-link"><a href="#" @click.prevent="setView('register')">还没有账号？立即注册</a></div>
    </div>

    <!-- ============ 注册视图 ============ -->
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
      <div class="auth-link"><a href="#" @click.prevent="setView('login')">已有账号？返回登录</a></div>
    </div>
  </div>
</template>
