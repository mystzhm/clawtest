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

      // 给回答作者发送点赞通知
      if (answer.authorId !== getCurrentUserId()) {
        createLikeNotification(answer.authorId, getCurrentUserId(), 'answer', answer)
      }
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
    // 同时删除相关评论
    comments.value = comments.value.filter(c => c.answerId !== answerId)

    localStorage.setItem('answers', JSON.stringify(answers.value))
    localStorage.setItem('comments', JSON.stringify(comments.value))
    return true
  }

  // ========== 评论系统 ==========

  // 获取回答的评论列表
  function getCommentsByAnswerId(answerId, sortBy = 'time') {
    const answerComments = comments.value.filter(c => c.answerId === answerId && !c.replyTo)
    if (sortBy === 'time') {
      answerComments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    } else {
      // 按热度（点赞数）
      answerComments.sort((a, b) => b.likes - a.likes)
    }
    return answerComments
  }

  // 获取评论的回复
  function getRepliesByCommentId(commentId) {
    return comments.value
      .filter(c => c.replyTo === commentId)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  }

  // 创建评论
  function createComment(answerId, content, replyTo = null, replyToUserId = null) {
    const cleanContent = escapeHtml(content.trim().slice(0, 1000))

    if (!cleanContent) {
      throw new Error('评论内容不能为空')
    }

    const comment = {
      id: Date.now().toString(),
      answerId,
      content: cleanContent,
      authorId: getCurrentUserId(),
      replyTo, // 回复的评论ID（null 表示一级评论）
      replyToUserId, // 回复的用户ID
      likes: 0,
      createdAt: new Date().toISOString()
    }

    comments.value.push(comment)

    // 如果是回复用户或回复评论，给回答作者和被回复者发送通知
    const answer = answers.value.find(a => a.id === answerId)
    if (answer) {
      // 给回答作者发通知（一级评论）
      if (!replyTo && answer.authorId !== getCurrentUserId()) {
        const question = questions.value.find(q => q.id === answer.questionId)
        createCommentNotification(answer.authorId, getCurrentUserId(), answer, question)
      }
      // 给被回复的用户发通知（回复评论）
      else if (replyToUserId && replyToUserId !== getCurrentUserId()) {
        const question = questions.value.find(q => q.id === answer.questionId)
        createCommentNotification(replyToUserId, getCurrentUserId(), answer, question)
      }
    }

    localStorage.setItem('comments', JSON.stringify(comments.value))
    return comment
  }

  // 删除评论
  function deleteComment(commentId) {
    const index = comments.value.findIndex(c => c.id === commentId)
    if (index === -1) return false

    // 只能删除自己的评论
    const comment = comments.value[index]
    if (comment.authorId !== getCurrentUserId()) {
      return false
    }

    // 删除评论及其所有回复
    const idsToDelete = [commentId]
    const findReplies = (parentId) => {
      comments.value.forEach(c => {
        if (c.replyTo === parentId && !idsToDelete.includes(c.id)) {
          idsToDelete.push(c.id)
          findReplies(c.id)
        }
      })
    }
    findReplies(commentId)

    comments.value = comments.value.filter(c => !idsToDelete.includes(c.id))
    localStorage.setItem('comments', JSON.stringify(comments.value))
    return true
  }

  // 点赞评论
  function likeComment(commentId) {
    const comment = comments.value.find(c => c.id === commentId)
    if (!comment) return { success: false }

    const key = `comment:${getRatingKey(commentId)}`
    const currentRating = userRatings.value[key]

    if (currentRating === 'like') {
      comment.likes--
      delete userRatings.value[key]
    } else {
      comment.likes++
      userRatings.value[key] = 'like'

      // 给评论作者发送点赞通知
      if (comment.authorId !== getCurrentUserId()) {
        const answer = answers.value.find(a => a.id === comment.answerId)
        const question = questions.value.find(q => q.id === answer?.questionId)
        const notifications = JSON.parse(localStorage.getItem('notifications') || '[]')
        const users = JSON.parse(localStorage.getItem('users') || '[]')
        const fromUser = users.find(u => u.id === getCurrentUserId())

        notifications.unshift({
          id: Date.now().toString(),
          type: 'like',
          userId: comment.authorId,
          fromUserId: getCurrentUserId(),
          fromUsername: fromUser?.username || '匿名用户',
          fromAvatar: fromUser?.avatar || '',
          targetType: 'comment',
          targetId: comment.id,
          targetTitle: question?.title || '评论',
          targetPreview: comment.content?.slice(0, 50) || '',
          read: false,
          createdAt: new Date().toISOString()
        })
        localStorage.setItem('notifications', JSON.stringify(notifications))
      }
    }

    localStorage.setItem('comments', JSON.stringify(comments.value))
    localStorage.setItem('userRatings', JSON.stringify(userRatings.value))
    return { success: true, rating: userRatings.value[key] }
  }

  // 获取评论的点赞状态
  function getCommentRating(commentId) {
    const key = `comment:${getRatingKey(commentId)}`
    return userRatings.value[key] || null
  }

  // 获取评论数量
  function getCommentCount(answerId) {
    return comments.value.filter(c => c.answerId === answerId).length
  }

  // 创建评论通知
  function createCommentNotification(targetUserId, fromUserId, answer, question) {
    const users = JSON.parse(localStorage.getItem('users') || '[]')
    const fromUser = users.find(u => u.id === fromUserId)

    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]')
    notifications.unshift({
      id: Date.now().toString(),
      type: 'comment',
      userId: targetUserId,
      fromUserId: fromUserId,
      fromUsername: fromUser?.username || '匿名用户',
      fromAvatar: fromUser?.avatar || '',
      targetType: 'answer',
      targetId: answer.id,
      targetTitle: question?.title || '问题',
      targetPreview: answer.content?.slice(0, 50) || '',
      read: false,
      createdAt: new Date().toISOString()
    })
    localStorage.setItem('notifications', JSON.stringify(notifications))
  }

  // 创建点赞通知
  function createLikeNotification(targetUserId, fromUserId, targetType, target) {
    const users = JSON.parse(localStorage.getItem('users') || '[]')
    const fromUser = users.find(u => u.id === fromUserId)
    const question = questions.value.find(q => q.id === target.questionId)

    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]')
    notifications.unshift({
      id: Date.now().toString(),
      type: 'like',
      userId: targetUserId,
      fromUserId: fromUserId,
      fromUsername: fromUser?.username || '匿名用户',
      fromAvatar: fromUser?.avatar || '',
      targetType,
      targetId: target.id,
      targetTitle: question?.title || '回答',
      targetPreview: target.content?.slice(0, 50) || '',
      read: false,
      createdAt: new Date().toISOString()
    })
    localStorage.setItem('notifications', JSON.stringify(notifications))
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
    resetPagination,
    // 评论系统
    getCommentsByAnswerId,
    getRepliesByCommentId,
    createComment,
    deleteComment,
    likeComment,
    getCommentRating,
    getCommentCount
  }
})
