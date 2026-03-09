import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { escapeHtml, truncateText } from '../utils/security'

export const useQuestionStore = defineStore('question', () => {
  const questions = ref(JSON.parse(localStorage.getItem('questions') || '[]'))
  const answers = ref(JSON.parse(localStorage.getItem('answers') || '[]'))
  const comments = ref(JSON.parse(localStorage.getItem('comments') || '[]'))
  // 用户点赞/踩记录: { answerId: 'like' | 'dislike' }
  const userRatings = ref(JSON.parse(localStorage.getItem('userRatings') || '{}'))
  
  // 分页状态
  const currentPage = ref(1)
  const pageSize = ref(10)

  function getCurrentUserId() {
    return JSON.parse(localStorage.getItem('currentUser'))?.id || 'anonymous'
  }

  function getRatingKey(answerId) {
    return `${getCurrentUserId()}:${answerId}`
  }

  function createQuestion(title, content, tags) {
    // 内容验证和清理
    const cleanTitle = escapeHtml(title.trim().slice(0, 100))
    const cleanContent = escapeHtml(content.trim().slice(0, 5000))
    const cleanTags = tags.split(',')
      .map(t => escapeHtml(t.trim()))
      .filter(Boolean)
      .slice(0, 5)

    if (!cleanTitle || !cleanContent) {
      throw new Error('标题和内容不能为空')
    }

    const question = {
      id: Date.now().toString(),
      title: cleanTitle,
      content: cleanContent,
      authorId: getCurrentUserId(),
      tags: cleanTags,
      views: 0,
      createdAt: new Date().toISOString()
    }
    questions.value.unshift(question)
    localStorage.setItem('questions', JSON.stringify(questions.value))
    return question
  }

  function getQuestionById(id) {
    return questions.value.find(q => q.id === id)
  }

  function getAnswersByQuestionId(questionId) {
    return answers.value.filter(a => a.questionId === questionId)
      .sort((a, b) => b.likes - a.likes)
  }

  function createAnswer(questionId, content) {
    // 内容验证和清理
    const cleanContent = escapeHtml(content.trim().slice(0, 5000))
    
    if (!cleanContent) {
      throw new Error('回答内容不能为空')
    }

    const answer = {
      id: Date.now().toString(),
      questionId,
      content: cleanContent,
      authorId: getCurrentUserId(),
      likes: 0,
      dislikes: 0,
      createdAt: new Date().toISOString()
    }
    answers.value.push(answer)
    localStorage.setItem('answers', JSON.stringify(answers.value))
    return answer
  }

  function likeAnswer(answerId) {
    const answer = answers.value.find(a => a.id === answerId)
    if (!answer) return { success: false, message: '回答不存在' }

    const key = getRatingKey(answerId)
    const currentRating = userRatings.value[key]

    if (currentRating === 'like') {
      // 取消点赞
      answer.likes--
      delete userRatings.value[key]
    } else {
      // 点赞
      if (currentRating === 'dislike') {
        answer.dislikes--
      }
      answer.likes++
      userRatings.value[key] = 'like'
    }

    localStorage.setItem('answers', JSON.stringify(answers.value))
    localStorage.setItem('userRatings', JSON.stringify(userRatings.value))
    return { success: true, rating: userRatings.value[key] }
  }

  function dislikeAnswer(answerId) {
    const answer = answers.value.find(a => a.id === answerId)
    if (!answer) return { success: false, message: '回答不存在' }

    const key = getRatingKey(answerId)
    const currentRating = userRatings.value[key]

    if (currentRating === 'dislike') {
      // 取消踩
      answer.dislikes--
      delete userRatings.value[key]
    } else {
      // 踩
      if (currentRating === 'like') {
        answer.likes--
      }
      answer.dislikes++
      userRatings.value[key] = 'dislike'
    }

    localStorage.setItem('answers', JSON.stringify(answers.value))
    localStorage.setItem('userRatings', JSON.stringify(userRatings.value))
    return { success: true, rating: userRatings.value[key] }
  }

  function getAnswerRating(answerId) {
    const key = getRatingKey(answerId)
    return userRatings.value[key] || null
  }

  function incrementViews(questionId) {
    const question = questions.value.find(q => q.id === questionId)
    if (question) {
      question.views++
      localStorage.setItem('questions', JSON.stringify(questions.value))
    }
  }

  function searchQuestions(keyword) {
    const kw = keyword.toLowerCase()
    return questions.value.filter(q =>
      q.title.toLowerCase().includes(kw) ||
      q.content.toLowerCase().includes(kw) ||
      q.tags.some(t => t.toLowerCase().includes(kw))
    )
  }

  function updateQuestion(questionId, data) {
    const question = questions.value.find(q => q.id === questionId)
    if (!question) return false

    if (data.title) {
      question.title = escapeHtml(data.title.trim().slice(0, 100))
    }
    if (data.content !== undefined) {
      question.content = escapeHtml(data.content.trim().slice(0, 5000))
    }
    if (data.tags !== undefined) {
      question.tags = data.tags.split(',')
        .map(t => escapeHtml(t.trim()))
        .filter(Boolean)
        .slice(0, 5)
    }
    question.updatedAt = new Date().toISOString()

    localStorage.setItem('questions', JSON.stringify(questions.value))
    return question
  }

  function deleteQuestion(questionId) {
    const index = questions.value.findIndex(q => q.id === questionId)
    if (index === -1) return false

    questions.value.splice(index, 1)
    // 同时删除相关回答
    answers.value = answers.value.filter(a => a.questionId !== questionId)

    localStorage.setItem('questions', JSON.stringify(questions.value))
    localStorage.setItem('answers', JSON.stringify(answers.value))
    return true
  }

  function deleteAnswer(answerId) {
    const index = answers.value.findIndex(a => a.id === answerId)
    if (index === -1) return false

    answers.value.splice(index, 1)
    localStorage.setItem('answers', JSON.stringify(answers.value))
    return true
  }

  // 计算总页数
  const totalPages = computed(() => {
    return Math.ceil(sortedQuestions.value.length / pageSize.value)
  })

  // 当前页的问题列表
  const paginatedQuestions = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    return sortedQuestions.value.slice(start, end)
  })

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

  const sortedQuestions = computed(() => {
    return [...questions.value].sort((a, b) =>
      new Date(b.createdAt) - new Date(a.createdAt)
    )
  })

  return {
    questions,
    answers,
    comments,
    sortedQuestions,
    paginatedQuestions,
    currentPage,
    pageSize,
    totalPages,
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
    incrementViews,
    searchQuestions,
    setCurrentPage,
    nextPage,
    prevPage,
    resetPagination
  }
})
