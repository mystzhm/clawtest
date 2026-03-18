import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useRecommendStore = defineStore('recommend', () => {
  // 推荐配置
  const config = ref({
    followingWeight: 3,      // 关注用户的内容权重
    topicWeight: 2,          // 关注话题的内容权重
    hotWeight: 1,            // 热门内容权重
    timeDecay: 0.5           // 时间衰减系数
  })

  function getCurrentUserId() {
    return JSON.parse(localStorage.getItem('currentUser'))?.id || null
  }

  // 计算问题的推荐分数
  function calculateQuestionScore(question) {
    const userId = getCurrentUserId()
    let score = 0

    // 1. 关注用户的加分
    if (userId) {
      const followingList = JSON.parse(localStorage.getItem('followingList') || '{}')
      const following = followingList[userId] || []
      if (following.includes(question.authorId)) {
        score += 100 * config.value.followingWeight
      }
    }

    // 2. 关注话题的加分
    if (userId && question.tags) {
      const followedTopics = JSON.parse(localStorage.getItem('followedTopics') || '[]')
      const userFollowed = followedTopics.filter(f => f.userId === userId).map(f => f.topicId)
      const topics = JSON.parse(localStorage.getItem('topics') || '[]')

      question.tags.forEach(tag => {
        const topic = topics.find(t => t.name === tag)
        if (topic && userFollowed.includes(topic.id)) {
          score += 50 * config.value.topicWeight
        }
      })
    }

    // 3. 热度加分
    const answers = JSON.parse(localStorage.getItem('answers') || '[]')
    const questionAnswers = answers.filter(a => a.questionId === question.id)
    const totalLikes = questionAnswers.reduce((sum, a) => sum + a.likes, 0)
    const answerCount = questionAnswers.length

    const hotScore = (question.views || 0) * 0.1 +
                     answerCount * 10 +
                     totalLikes * 5
    score += hotScore * config.value.hotWeight

    // 4. 时间衰减
    const now = Date.now()
    const createdAt = new Date(question.createdAt).getTime()
    const hoursSinceCreation = (now - createdAt) / (1000 * 60 * 60)
    const timeDecayScore = Math.exp(-hoursSinceCreation / (24 * 7)) // 7天半衰期
    score *= timeDecayScore

    return score
  }

  // 获取推荐问题列表
  function getRecommendedQuestions(limit = 20) {
    const questions = JSON.parse(localStorage.getItem('questions') || '[]')

    // 计算每个问题的推荐分数
    const questionsWithScore = questions.map(q => ({
      ...q,
      _score: calculateQuestionScore(q)
    }))

    // 按分数降序排序
    questionsWithScore.sort((a, b) => b._score - a._score)

    return questionsWithScore.slice(0, limit)
  }

  // 获取推荐理由
  function getRecommendReason(question) {
    const userId = getCurrentUserId()
    const reasons = []

    if (userId) {
      const followingList = JSON.parse(localStorage.getItem('followingList') || '{}')
      const following = followingList[userId] || []

      if (following.includes(question.authorId)) {
        const users = JSON.parse(localStorage.getItem('users') || '[]')
        const author = users.find(u => u.id === question.authorId)
        if (author) {
          reasons.push(`你关注了 ${author.username}`)
        }
      }

      if (question.tags && question.tags.length > 0) {
        const followedTopics = JSON.parse(localStorage.getItem('followedTopics') || '[]')
        const userFollowed = followedTopics.filter(f => f.userId === userId).map(f => f.topicId)
        const topics = JSON.parse(localStorage.getItem('topics') || '[]')

        const matchedTopics = question.tags.filter(tag => {
          const topic = topics.find(t => t.name === tag)
          return topic && userFollowed.includes(topic.id)
        })

        if (matchedTopics.length > 0) {
          reasons.push(`你关注的话题：${matchedTopics.join('、')}`)
        }
      }
    }

    const answers = JSON.parse(localStorage.getItem('answers') || '[]')
    const answerCount = answers.filter(a => a.questionId === question.id).length
    const totalLikes = answers
      .filter(a => a.questionId === question.id)
      .reduce((sum, a) => sum + a.likes, 0)

    if (answerCount > 10) {
      reasons.push(`有 ${answerCount} 个回答`)
    }

    if (totalLikes > 50) {
      reasons.push(`获得 ${totalLikes} 个赞`)
    }

    if (question.views > 1000) {
      reasons.push(`${question.views} 人浏览`)
    }

    return reasons.length > 0 ? reasons[0] : '为你推荐'
  }

  // 获取相似问题推荐
  function getSimilarQuestions(questionId, limit = 5) {
    const questions = JSON.parse(localStorage.getItem('questions') || '[]')
    const currentQuestion = questions.find(q => q.id === questionId)

    if (!currentQuestion) return []

    // 计算相似度
    const similarities = questions
      .filter(q => q.id !== questionId)
      .map(q => {
        let score = 0

        // 标签相似度
        if (currentQuestion.tags && q.tags) {
          const commonTags = currentQuestion.tags.filter(t => q.tags.includes(t))
          score += commonTags.length * 10
        }

        // 作者相同
        if (currentQuestion.authorId === q.authorId) {
          score += 5
        }

        return { ...q, _similarity: score }
      })

    // 按相似度排序
    similarities.sort((a, b) => b._similarity - a._similarity)

    return similarities.slice(0, limit)
  }

  // 更新配置
  function updateConfig(newConfig) {
    config.value = { ...config.value, ...newConfig }
    localStorage.setItem('recommendConfig', JSON.stringify(config.value))
  }

  return {
    config,
    calculateQuestionScore,
    getRecommendedQuestions,
    getRecommendReason,
    getSimilarQuestions,
    updateConfig
  }
})
