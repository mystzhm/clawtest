<template>
  <div :class="['min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors']">
    <Header />
    <main class="max-w-6xl mx-auto px-4 py-6">
      <router-view />
    </main>
    <Footer />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import Header from './components/common/Header.vue'
import Footer from './components/common/Footer.vue'
import { useThemeStore } from './stores/theme'

const themeStore = useThemeStore()

// 初始化主题
onMounted(() => {
  themeStore.setTheme(themeStore.theme)
})
</script>
