import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { questionApi, answerApi } from '../api'
import { useUserStore } from './user'

export const useQuestionStore = defineStore('question', () => {
  const questions = ref([])
  const answers = ref([])
  const userRatings = ref({}) // { answerId: 'like' | 'dislike' }
  const isLoading = ref(false)
  
  // 分页状态
  const currentPage = ref(1)
  const pageSize = ref(10)
  const totalQuestions = ref(0)

  const totalPages = computed(() => {
    return Math.ceil(totalQuestions.value / pageSize.value)
  })

  const sortedQuestions = computed(() => {
    return [...questions.value].sort((a, b) =>
      new Date(b.created_at) - new Date(a.created_at)
    )
  })

  const paginatedQuestions = computed(() => {
    return sortedQuestions.value
  })

  // 初始化：加载问题数据
  async function init() {
    isLoading.value = true
    try {
      const result = await questionApi.getAll({ page: 1, pageSize: 100 })
      questions.value = result.questions || []
      totalQuestions.value = result.questions?.length || 0
    } catch (error) {
      console.error('加载问题失败:', error)
      questions.value = []
    } finally {
      isLoading.value = false
    }
  }

  async function createQuestion(title, content, tags, authorId) {
    isLoading.value = true
    try {
      const tagArray = tags.split(',').map(t => t.trim()).filter(Boolean).slice(0, 5)
      const question = await questionApi.create(title, content, authorId, tagArray)
      questions.value.unshift(question)
      return question
    } catch (error) {
      throw new Error(error.message || '创建问题失败')
    } finally {
      isLoading.value = false
    }
  }

  async function getQuestionById(id) {
    // 先从本地找
    let question = questions.value.find(q => q.id === id)
    if (question) {
      // 更新浏览量
      try {
        const updated = await questionApi.getById(id)
        const idx = questions.value.findIndex(q => q.id === id)
        if (idx !== -1) {
          questions.value[idx] = updated
        }
        return updated
      } catch (error) {
        return question
      }
    }
    
    // 从服务器获取
    try {
      question = await questionApi.getById(id)
      return question
    } catch (error) {
      return null
    }
  }

  async function getAnswersByQuestionId(questionId) {
    try {
      const result = await answerApi.getByQuestion(questionId)
      answers.value = result
      return result
    } catch (error) {
      console.error('加载回答失败:', error)
      return []
    }
  }

  async function createAnswer(questionId, content, authorId) {
    isLoading.value = true
    try {
      const answer = await answerApi.create(questionId, content, authorId)
      answers.value.push(answer)
      return answer
    } catch (error) {
      throw new Error(error.message || '创建回答失败')
    } finally {
      isLoading.value = false
    }
  }

  async function likeAnswer(answerId, userId) {
    try {
      const result = await answerApi.rate(answerId, userId, 'like')
      userRatings.value[answerId] = result.rating
      // 更新本地回答数据
      await refreshAnswer(answerId)
      return { success: true, rating: result.rating }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  async function dislikeAnswer(answerId, userId) {
    try {
      const result = await answerApi.rate(answerId, userId, 'dislike')
      userRatings.value[answerId] = result.rating
      // 更新本地回答数据
      await refreshAnswer(answerId)
      return { success: true, rating: result.rating }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  async function refreshAnswer(answerId) {
    // 重新加载问题的所有回答
    const answer = answers.value.find(a => a.id === answerId)
    if (answer) {
      await getAnswersByQuestionId(answer.question_id)
    }
  }

  async function getAnswerRating(answerId, userId) {
    try {
      const result = await answerApi.getRating(answerId, userId)
      userRatings.value[answerId] = result.rating
      return result.rating
    } catch (error) {
      return null
    }
  }

  async function searchQuestions(keyword) {
    isLoading.value = true
    try {
      const result = await questionApi.search(keyword, 1, 100)
      return result.questions || []
    } catch (error) {
      console.error('搜索失败:', error)
      return []
    } finally {
      isLoading.value = false
    }
  }

  async function updateQuestion(questionId, data) {
    isLoading.value = true
    try {
      const updated = await questionApi.update(questionId, data)
      const idx = questions.value.findIndex(q => q.id === questionId)
      if (idx !== -1) {
        questions.value[idx] = updated
      }
      return updated
    } catch (error) {
      throw new Error(error.message || '更新问题失败')
    } finally {
      isLoading.value = false
    }
  }

  async function deleteQuestion(questionId) {
    try {
      await questionApi.delete(questionId)
      questions.value = questions.value.filter(q => q.id !== questionId)
      answers.value = answers.value.filter(a => a.question_id !== questionId)
      return true
    } catch (error) {
      console.error('删除问题失败:', error)
      return false
    }
  }

  async function deleteAnswer(answerId) {
    try {
      await answerApi.delete(answerId)
      answers.value = answers.value.filter(a => a.id !== answerId)
      return true
    } catch (error) {
      console.error('删除回答失败:', error)
      return false
    }
  }

  function setCurrentPage(page) {
    if (page < 1 || page > totalPages.value) return
    currentPage.value = page
  }

  function nextPage() {
    setCurrentPage(currentPage.value + 1)
  }

  function prevPage() {
    setCurrentPage(currentPage.value - 1)
  }

  function resetPagination() {
    currentPage.value = 1
  }

  // 加载用户评分状态
  async function loadUserRatings(userId) {
    // 遍历当前加载的回答，获取评分状态
    for (const answer of answers.value) {
      if (!userRatings.value[answer.id]) {
        await getAnswerRating(answer.id, userId)
      }
    }
  }

  return {
    questions,
    answers,
    userRatings,
    sortedQuestions,
    paginatedQuestions,
    currentPage,
    pageSize,
    totalPages,
    isLoading,
    init,
    createQuestion,
    getQuestionById,
    getAnswersByQuestionId,
    createAnswer,
    updateQuestion,
    deleteQuestion,
    deleteAnswer,
    likeAnswer,
    dislikeAnswer,
    getAnswerRating,
    searchQuestions,
    setCurrentPage,
    nextPage,
    prevPage,
    resetPagination,
    loadUserRatings
  }
})
