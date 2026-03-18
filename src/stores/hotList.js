import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useHotListStore = defineStore('hotList', () => {
  // 热榜问题列表
  const hotQuestions = ref(JSON.parse(localStorage.getItem('hotQuestions') || '[]'))

  // 计算热度算法
  function calculateHeat(question) {
    if (!question) return 0

    // 基础热度 = 浏览量 × 1 + 回答数 × 10 + 点赞数 × 5
    const answers = JSON.parse(localStorage.getItem('answers') || '[]')
    const answerCount = answers.filter(a => a.questionId === question.id).length
    const likes = answers.filter(a => a.questionId === question.id).reduce((sum, a) => sum + a.likes, 0)

    // 时间衰减（24小时内问题额外加分）
    const now = new Date()
    const createdAt = new Date(question.createdAt)
    const hoursSinceCreation = (now - createdAt) / (1000 * 60 * 60)
    const timeBonus = hoursSinceCreation < 24 ? (24 - hoursSinceCreation) * 5 : 0

    // 浏览量权重
    const viewWeight = question.views || 0

    // 热度 = 浏览量 + 回答数 × 10 + 总点赞数 × 5 + 时间奖励
    const heat = viewWeight + (answerCount * 10) + (likes * 5) + timeBonus

    return Math.floor(heat)
  }

  // 更新热榜
  function updateHotList() {
    const questions = JSON.parse(localStorage.getItem('questions') || '[]')
    const questionsWithHeat = questions.map(q => ({
      ...q,
      heat: calculateHeat(q)
    }))

    // 按热度降序排序
    hotQuestions.value = questionsWithHeat.sort((a, b) => b.heat - a.heat)

    // 保存到 localStorage
    localStorage.setItem('hotQuestions', JSON.stringify(hotQuestions.value))
  }

  // 获取热榜标签
  function getHotBadge(question) {
    const hoursSinceCreation = (new Date() - new Date(question.createdAt)) / (1000 * 60 * 60)

    if (hoursSinceCreation < 1) {
      return { text: '新上榜', color: 'bg-red-500' }
    } else if (hoursSinceCreation < 3) {
      return { text: '热度飙升', color: 'bg-orange-500' }
    } else if (hoursSinceCreation < 24) {
      return { text: '热议', color: 'bg-zhihu-blue' }
    } else {
      return null
    }
  }

  // 模拟热榜更新（实际应用中应该定期从后端获取）
  function mockHotListUpdate() {
    updateHotList()
  }

  // 获取热榜前 N 条
  function getTopHotQuestions(limit = 50) {
    if (hotQuestions.value.length === 0) {
      updateHotList()
    }
    return hotQuestions.value.slice(0, limit)
  }

  return {
    hotQuestions,
    calculateHeat,
    updateHotList,
    mockHotListUpdate,
    getTopHotQuestions,
    getHotBadge
  }
})
