<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

// 幻灯片数据
const slides = ref([
  { title: '电子科技大学', subtitle: '求实求真 · 大气大为' },
  { title: '编程世界', subtitle: '用代码改变未来' },
  { title: '电竞梦想', subtitle: '永不言弃 · 勇往直前' },
  { title: '足球场上', subtitle: '奔跑吧少年' },
  { title: '黑龙江', subtitle: '来自北方的热情' }
])

// 当前索引
const currentIndex = ref(0)
let autoPlayTimer = null

// 总页数
const totalSlides = computed(() => slides.value.length)

// 更新轮播图
const updateSlider = () => {
  const slider = document.getElementById('slider-slides')
  if (slider) {
    slider.style.transform = `translateX(-${currentIndex.value * 100}%)`
  }
}

// 下一张
const nextSlide = () => {
  currentIndex.value = (currentIndex.value + 1) % totalSlides.value
  updateSlider()
}

// 上一张
const prevSlide = () => {
  currentIndex.value = (currentIndex.value - 1 + totalSlides.value) % totalSlides.value
  updateSlider()
}

// 跳转到指定页
const goToSlide = (index) => {
  currentIndex.value = index
  updateSlider()
}

// 开始自动播放
const startAutoPlay = () => {
  autoPlayTimer = setInterval(nextSlide, 3000)
}

// 停止自动播放
const stopAutoPlay = () => {
  if (autoPlayTimer) {
    clearInterval(autoPlayTimer)
    autoPlayTimer = null
  }
}

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

    <div class="slider" id="slider" @mouseenter="stopAutoPlay" @mouseleave="startAutoPlay">
      <div class="slides" id="slider-slides">
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
    <p class="slide-counter">{{ currentIndex + 1 }} / {{ totalSlides }}</p>

    <p class="scroll-hint" style="color:#a0aec0;">↓ 继续向下滚动</p>
  </div>
</template>
