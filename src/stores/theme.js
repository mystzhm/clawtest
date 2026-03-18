import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  // 主题：light | dark | system
  const theme = ref(localStorage.getItem('theme') || 'system')

  // 监听系统主题变化
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

  // 获取实际主题
  function getActualTheme() {
    if (theme.value === 'system') {
      return mediaQuery.matches ? 'dark' : 'light'
    }
    return theme.value
  }

  // 应用主题
  function applyTheme(newTheme) {
    const actualTheme = newTheme === 'system'
      ? (mediaQuery.matches ? 'dark' : 'light')
      : newTheme

    if (actualTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  // 设置主题
  function setTheme(newTheme) {
    theme.value = newTheme
    localStorage.setItem('theme', newTheme)
    applyTheme(newTheme)
  }

  // 切换主题
  function toggleTheme() {
    const currentActual = getActualTheme()
    setTheme(currentActual === 'dark' ? 'light' : 'dark')
  }

  // 监听主题变化
  watch(theme, (newTheme) => {
    applyTheme(newTheme)
  }, { immediate: true })

  // 监听系统主题变化
  mediaQuery.addEventListener('change', (e) => {
    if (theme.value === 'system') {
      applyTheme('system')
    }
  })

  return {
    theme,
    getActualTheme,
    setTheme,
    toggleTheme
  }
})
