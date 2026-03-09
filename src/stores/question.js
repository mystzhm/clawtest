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

  // 初始化示例数据
  if (questions.value.length === 0) {
    initSampleData()
  }

  function initSampleData() {
    const sampleQuestions = [
      {
        id: '1',
        title: '如何学习前端开发？',
        content: '我是一名后端开发者，想学习前端开发，应该从哪里开始？有什么推荐的学习路径和资源吗？',
        authorId: 'system',
        tags: ['前端', '学习', '编程'],
        views: 1234,
        createdAt: '2024-01-15T10:00:00.000Z'
      },
      {
        id: '2',
        title: 'Vue 3 和 React 18 哪个更值得学习？',
        content: '作为一个新手，想选择一个前端框架深入学习，Vue 3 和 React 18 各有什么优缺点？',
        authorId: 'system',
        tags: ['Vue', 'React', '前端框架'],
        views: 2567,
        createdAt: '2024-01-14T08:30:00.000Z'
      },
      {
        id: '3',
        title: '如何提高代码质量？',
        content: '在团队开发中，如何保证代码质量？有什么好的代码审查实践和工具推荐？',
        authorId: 'system',
        tags: ['代码质量', '最佳实践', '团队协作'],
        views: 890,
        createdAt: '2024-01-13T15:20:00.000Z'
      }
    ]

    const sampleAnswers = [
      {
        id: '1',
        questionId: '1',
        content: '建议从 HTML、CSS、JavaScript 基础开始，然后学习一个主流框架（Vue 或 React）。推荐资源：\n\n1. MDN Web Docs\n2. freeCodeCamp\n3. Vue/React 官方文档\n\n多做项目练习，实践是最好的学习方式。',
        authorId: 'system',
        likes: 42,
        dislikes: 2,
        createdAt: '2024-01-15T11:00:00.000Z'
      },
      {
        id: '2',
        questionId: '1',
        content: '如果是中国开发者，建议先学 Vue，中文社区更活跃，文档也更友好。等基础扎实后再学 React 拓展视野。',
        authorId: 'system',
        likes: 28,
        dislikes: 5,
        createdAt: '2024-01-15T12:30:00.000Z'
      }
    ]

    questions.value = sampleQuestions
    answers.value = sampleAnswers
    localStorage.setItem('questions', JSON.stringify(sampleQuestions))
    localStorage.setItem('answers', JSON.stringify(sampleAnswers))
  }

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
