<template>
  <!-- 全屏加载 -->
  <div v-if="fullscreen" class="loading-overlay">
    <div class="spinner"></div>
    <p class="text-gray-500 mt-4">加载中...</p>
  </div>

  <!-- 卡片加载（骨架屏） -->
  <div v-else class="skeleton-loading p-4">
    <!-- 头像 + 用户名 -->
    <div class="flex items-center space-x-3 mb-4">
      <div class="skeleton w-10 h-10 rounded-full"></div>
      <div class="flex-1">
        <div class="skeleton w-32 h-4 rounded mb-2"></div>
        <div class="skeleton w-24 h-3 rounded"></div>
      </div>
    </div>

    <!-- 内容 -->
    <div class="space-y-3">
      <div class="skeleton w-full h-4 rounded"></div>
      <div class="skeleton w-3/4 h-4 rounded"></div>
      <div class="skeleton w-1/2 h-4 rounded"></div>
      <div class="skeleton w-5/6 h-4 rounded"></div>
      <div class="skeleton w-2/3 h-4 rounded"></div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  fullscreen: {
    type: Boolean,
    default: false
  }
})
</script>
