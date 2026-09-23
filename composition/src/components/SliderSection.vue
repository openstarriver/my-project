<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

/* ============================================================
   轮播图数据
   这五张是写死的，运行期不会变，用普通常量就够 ——
   包成 ref 只会白白多套一层响应式代理
   ============================================================ */
const slides = [
  { title: '电子科技大学', subtitle: '求实求真 · 大气大为' },
  { title: '编程世界', subtitle: '用代码改变未来' },
  { title: '电竞梦想', subtitle: '永不言弃 · 勇往直前' },
  { title: '足球场上', subtitle: '奔跑吧少年' },
  { title: '坚定所信', subtitle: '来自北方的热情' }
]

// 当前展示第几张（从 0 开始）
const currentIndex = ref(0)

// 自动播放的定时器句柄，组件卸载时要清掉，否则会内存泄漏
let autoPlayTimer = null

// 自动播放间隔（毫秒）
const AUTOPLAY_DELAY = 1500

// 总张数
const totalSlides = slides.length

// 轨道位移：靠这个计算属性驱动，不再手动操作 DOM
// 第 n 张就往左移动 n * 100%
const trackStyle = computed(() => ({
  transform: `translateX(-${currentIndex.value * 100}%)`
}))


/* ============================================================
   切换逻辑
   ============================================================ */

// 推进一张（到最后一张后回到第一张）。只改下标，不碰定时器 ——
// 自动播放每一拍都调它，在里面重置定时器等于每 3 秒重建一次
const advance = () => {
  currentIndex.value = (currentIndex.value + 1) % totalSlides
}

// 下面三个是给按钮和指示点用的：先切换，再重新计时。
// 不重置的话，刚点完「下一张」，原来那个定时器可能马上就要到点，
// 会紧接着又跳一张 —— 看起来就像点一次跳了两张
const nextSlide = () => {
  advance()
  startAutoPlay()
}

// 上一张（在第一张时跳到最后一张）
const prevSlide = () => {
  currentIndex.value = (currentIndex.value - 1 + totalSlides) % totalSlides
  startAutoPlay()
}

// 跳转到指定张（点击底部指示点）
const goToSlide = (index) => {
  currentIndex.value = index
  startAutoPlay()
}

// 开始自动播放
const startAutoPlay = () => {
  // 先清掉旧的定时器：鼠标反复进出时若不清理，会同时跑起好几个定时器，播放速度越来越快
  stopAutoPlay()
  autoPlayTimer = setInterval(advance, AUTOPLAY_DELAY)
}

// 停止自动播放
const stopAutoPlay = () => {
  if (autoPlayTimer) {
    clearInterval(autoPlayTimer)
    autoPlayTimer = null
  }
}


/* ============================================================
   生命周期
   ============================================================ */

onMounted(() => {
  startAutoPlay()
})

onUnmounted(() => {
  stopAutoPlay()
})
</script>

<template>
  <div class="slider-card">
    <h2>轮播图展示</h2>

    <!-- 鼠标移入暂停自动播放，移出继续 -->
    <div class="slider" id="slider" @mouseenter="stopAutoPlay" @mouseleave="startAutoPlay">
      <!-- 幻灯片轨道：位移由 trackStyle 计算属性实时驱动 -->
      <div class="slides" id="slider-slides" :style="trackStyle">
        <div v-for="(slide, index) in slides" :key="index" class="slide">
          <h3>{{ slide.title }}</h3>
          <p>{{ slide.subtitle }}</p>
        </div>
      </div>

      <!-- 左按钮 -->
      <button class="btn btn-left" @click="prevSlide">&#10094;</button>

      <!-- 右按钮 -->
      <button class="btn btn-right" @click="nextSlide">&#10095;</button>

      <!-- 指示点 -->
      <div class="dots">
        <span
          v-for="(slide, index) in slides"
          :key="index"
          class="dot"
          :class="{ active: index === currentIndex }"
          @click="goToSlide(index)"
        ></span>
      </div>
    </div>

    <!-- 页码计数器 -->
    <p class="slide-counter">第 {{ currentIndex + 1 }} / {{ totalSlides }} 张</p>

    <p class="scroll-hint scroll-hint--muted">↓ 继续向下滚动</p>
  </div>
</template>
