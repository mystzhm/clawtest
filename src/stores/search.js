import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSearchStore = defineStore('search', () => {
  // 搜索历史
  const searchHistory = ref(JSON.parse(localStorage.getItem('searchHistory') || '[]'))

  // 热门搜索
  const hotSearches = ref([
    '前端开发',
    '后端开发',
    '人工智能',
    '产品设计',
    '职业规划',
    'Vue.js',
    'React',
    'Python'
  ])

  // 保存搜索历史
  function addToHistory(keyword) {
    if (!keyword || !keyword.trim()) return

    const keywordTrim = keyword.trim()
    // 删除已存在的相同关键词
    const index = searchHistory.value.indexOf(keywordTrim)
    if (index > -1) {
      searchHistory.value.splice(index, 1)
    }

    // 添加到开头
    searchHistory.value.unshift(keywordTrim)

    // 只保留最近 20 条
    if (searchHistory.value.length > 20) {
      searchHistory.value = searchHistory.value.slice(0, 20)
    }

    localStorage.setItem('searchHistory', JSON.stringify(searchHistory.value))
  }

  // 清空搜索历史
  function clearHistory() {
    searchHistory.value = []
    localStorage.setItem('searchHistory', JSON.stringify([]))
  }

  // 获取搜索建议
  function getSuggestions(keyword) {
    if (!keyword || !keyword.trim()) return []

    const kw = keyword.toLowerCase().trim()
    const suggestions = []

    // 从历史中查找
    searchHistory.value.forEach(item => {
      if (item.toLowerCase().includes(kw) && !suggestions.includes(item)) {
        suggestions.push(item)
      }
    })

    // 从热门搜索中查找
    hotSearches.value.forEach(item => {
      if (item.toLowerCase().includes(kw) && !suggestions.includes(item)) {
        suggestions.push(item)
      }
    })

    return suggestions.slice(0, 10)
  }

  return {
    searchHistory,
    hotSearches,
    addToHistory,
    clearHistory,
    getSuggestions
  }
})
