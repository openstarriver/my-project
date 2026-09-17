<script setup>
import { ref } from 'vue'

const introData = ref({
  name: '张向航',
  school: '电子科技大学',
  age: '19 岁',
  hobbies: '打游戏 · 看动漫 · 踢足球 · 看电竞',
  hometown: '黑龙江',
  dream: '成为一名优秀的学生，为母校争光',
  phone: '15046096995',
  personality: '沉稳 · 乐观 · 积极向上'
})

// 头像图片路径
const avatarPath = ref('/image_821241156679754.png')
</script>

<template>
  <div class="intro-card">
    <img :src="avatarPath" alt="中二的脸" />
    <h1>{{ introData.name }}</h1>
    <p class="subtitle">{{ introData.school }}</p>
    <div class="intro-divider"></div>

    <div class="info-card">
      <p><span>年龄：</span>{{ introData.age }}</p>
      <p><span>爱好：</span>{{ introData.hobbies }}</p>
      <p><span>来自：</span>{{ introData.hometown }}</p>
      <p><span>梦想：</span>{{ introData.dream }}</p>
      <p><span>手机号：</span>{{ introData.phone }}</p>
      <p><span>性格：</span>{{ introData.personality }}</p>
    </div>

    <p class="scroll-hint">↓ 向下滚动查看更多</p>
  </div>
</template>
