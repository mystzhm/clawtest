<template>
  <div class="theme-toggle relative">
    <button
      @click="showDropdown = !showDropdown"
      class="p-2 text-gray-500 hover:text-zhihu-blue transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
      title="主题设置"
    >
      <!-- 太阳图标（浅色模式） -->
      <svg v-if="actualTheme === 'light'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
      <!-- 月亮图标（深色模式） -->
      <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
    </button>

    <!-- 下拉面板 -->
    <div v-if="showDropdown" class="absolute right-0 top-full mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50 min-w-[160px]">
      <button
        @click="setTheme('light')"
        :class="[
          'w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2',
          theme === 'light' ? 'text-zhihu-blue' : 'text-gray-700 dark:text-gray-300'
        ]"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        <span>浅色</span>
        <span v-if="theme === 'light'" class="ml-auto">✓</span>
      </button>
      <button
        @click="setTheme('dark')"
        :class="[
          'w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2',
          theme === 'dark' ? 'text-zhihu-blue' : 'text-gray-700 dark:text-gray-300'
        ]"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
        <span>深色</span>
        <span v-if="theme === 'dark'" class="ml-auto">✓</span>
      </button>
      <button
        @click="setTheme('system')"
        :class="[
          'w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2',
          theme === 'system' ? 'text-zhihu-blue' : 'text-gray-700 dark:text-gray-300'
        ]"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        <span>跟随系统</span>
        <span v-if="theme === 'system'" class="ml-auto">✓</span>
      </button>
    </div>

    <!-- 点击外部关闭 -->
    <div v-if="showDropdown" class="fixed inset-0 z-40" @click="showDropdown = false"></div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useThemeStore } from '../../stores/theme'

const themeStore = useThemeStore()
const showDropdown = ref(false)

const theme = computed(() => themeStore.theme)
const actualTheme = computed(() => themeStore.getActualTheme())

function setTheme(newTheme) {
  themeStore.setTheme(newTheme)
  showDropdown.value = false
}
</script>

<style scoped>
.theme-toggle {
  position: relative;
}
</style>
