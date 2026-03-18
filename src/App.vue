<template>
  <div :class="['min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors']">
    <!-- 全屏加载 -->
    <Loading v-if="loading" :fullscreen="true" />

    <Header />
    <main class="max-w-6xl mx-auto px-4 py-6">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Header from './components/common/Header.vue'
import Footer from './components/common/Footer.vue'
import Loading from './components/common/Loading.vue'
import { useThemeStore } from './stores/theme'

const themeStore = useThemeStore()
const loading = ref(true)

// 初始化主题
onMounted(() => {
  themeStore.setTheme(themeStore.theme)
  // 模拟加载延迟
  setTimeout(() => {
    loading.value = false
  }, 300)
})
</script>

<style>
/* 页面过渡动画 */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.3s ease;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
}
</style>
