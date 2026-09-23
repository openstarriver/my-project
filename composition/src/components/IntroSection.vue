<script setup>
/* ============================================================
   板块一：个人介绍
   内容全部来自下面这个数据对象，改资料只改这里即可，
   模板不用动。

   两个常量都不需要 ref：它们是写死的，运行期不会被改，
   套上响应式只会多一层没用的代理
   ============================================================ */

// 个人信息数据
const introData = {
  name: '张向航',
  school: '电子科技大学',
  age: '19 岁',
  hobbies: '打游戏 · 看动漫 · 踢足球 · 看电竞',
  dream: '成为一名优秀的学生，为母校争光',
  phone: '15046096995',
  personality: '沉稳 · 乐观 · 积极向上'
}

// 头像图片路径
// 对应 public/image_821241156679754.png，
// 构建时会原样拷到网站根目录，所以这里用绝对路径 / 开头
const avatarPath = '/image_821241156679754.png'
</script>

<template>
  <div class="intro-card">
    <!-- 头像：鼠标悬停会放大并发光 -->
    <img :src="avatarPath" alt="中二的脸" />

    <!-- 姓名与学校 -->
    <h1>{{ introData.name }}</h1>
    <p class="subtitle">{{ introData.school }}</p>

    <!-- 姓名下方的渐变装饰短线 -->
    <div class="intro-divider"></div>

    <!-- 个人信息明细 -->
    <div class="info-card">
      <p><span>年龄：</span>{{ introData.age }}</p>
      <p><span>爱好：</span>{{ introData.hobbies }}</p>
      <p><span>梦想：</span>{{ introData.dream }}</p>
      <p><span>手机号：</span>{{ introData.phone }}</p>
      <p><span>性格：</span>{{ introData.personality }}</p>
    </div>

    <p class="scroll-hint">↓ 向下滚动查看更多</p>
  </div>
</template>
