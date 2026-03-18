import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { escapeHtml } from '../utils/security'

export const useColumnStore = defineStore('column', () => {
  // 专栏列表
  const columns = ref(JSON.parse(localStorage.getItem('columns') || '[]'))
  // 文章列表
  const articles = ref(JSON.parse(localStorage.getItem('articles') || '[]'))

  function getCurrentUserId() {
    return JSON.parse(localStorage.getItem('currentUser'))?.id || 'anonymous'
  }

  // ========== 专栏管理 ==========

  // 创建专栏
  function createColumn(name, description = '', cover = '') {
    const userId = getCurrentUserId()
    if (!userId) throw new Error('请先登录')

    const column = {
      id: Date.now().toString(),
      userId,
      name: name.trim().slice(0, 50),
      description: description.trim().slice(0, 200),
      cover,
      articleCount: 0,
      followerCount: 0,
      createdAt: new Date().toISOString()
    }

    columns.value.push(column)
    saveColumns()
    return column
  }

  // 更新专栏
  function updateColumn(columnId, data) {
    const userId = getCurrentUserId()
    const index = columns.value.findIndex(c => c.id === columnId && c.userId === userId)
    if (index === -1) return null

    if (data.name !== undefined) {
      columns.value[index].name = data.name.trim().slice(0, 50)
    }
    if (data.description !== undefined) {
      columns.value[index].description = data.description.trim().slice(0, 200)
    }
    if (data.cover !== undefined) {
      columns.value[index].cover = data.cover
    }

    saveColumns()
    return columns.value[index]
  }

  // 删除专栏
  function deleteColumn(columnId) {
    const userId = getCurrentUserId()
    const index = columns.value.findIndex(c => c.id === columnId && c.userId === userId)
    if (index === -1) return false

    columns.value.splice(index, 1)
    // 删除专栏下的所有文章
    articles.value = articles.value.filter(a => a.columnId !== columnId)

    saveColumns()
    saveArticles()
    return true
  }

  // 获取用户的专栏
  const myColumns = computed(() => {
    const userId = getCurrentUserId()
    return columns.value.filter(c => c.userId === userId)
  })

  // 获取专栏
  function getColumnById(columnId) {
    return columns.value.find(c => c.id === columnId)
  }

  // ========== 文章管理 ==========

  // 创建文章
  function createArticle(columnId, title, content, cover = '') {
    const userId = getCurrentUserId()
    if (!userId) throw new Error('请先登录')

    const column = columns.value.find(c => c.id === columnId && c.userId === userId)
    if (!column) throw new Error('专栏不存在')

    const cleanTitle = escapeHtml(title.trim().slice(0, 100))
    const cleanContent = content.trim()

    if (!cleanTitle || !cleanContent) {
      throw new Error('标题和内容不能为空')
    }

    const article = {
      id: Date.now().toString(),
      columnId,
      userId,
      title: cleanTitle,
      content: cleanContent,
      cover,
      views: 0,
      likes: 0,
      comments: 0,
      createdAt: new Date().toISOString()
    }

    articles.value.unshift(article)
    column.articleCount++

    saveArticles()
    saveColumns()
    return article
  }

  // 更新文章
  function updateArticle(articleId, data) {
    const userId = getCurrentUserId()
    const article = articles.value.find(a => a.id === articleId && a.userId === userId)
    if (!article) return null

    if (data.title !== undefined) {
      article.title = escapeHtml(data.title.trim().slice(0, 100))
    }
    if (data.content !== undefined) {
      article.content = data.content.trim()
    }
    if (data.cover !== undefined) {
      article.cover = data.cover
    }
    article.updatedAt = new Date().toISOString()

    saveArticles()
    return article
  }

  // 删除文章
  function deleteArticle(articleId) {
    const userId = getCurrentUserId()
    const index = articles.value.findIndex(a => a.id === articleId && a.userId === userId)
    if (index === -1) return false

    const article = articles.value[index]
    const column = columns.value.find(c => c.id === article.columnId)
    if (column) {
      column.articleCount = Math.max(0, column.articleCount - 1)
    }

    articles.value.splice(index, 1)
    saveArticles()
    saveColumns()
    return true
  }

  // 获取文章
  function getArticleById(articleId) {
    return articles.value.find(a => a.id === articleId)
  }

  // 获取专栏的文章
  function getArticlesByColumn(columnId) {
    return articles.value
      .filter(a => a.columnId === columnId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }

  // 获取用户的文章
  function getArticlesByUser(userId) {
    return articles.value
      .filter(a => a.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }

  // 获取最新文章
  const latestArticles = computed(() => {
    return [...articles.value].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  })

  // 增加浏览量
  function incrementViews(articleId) {
    const article = articles.value.find(a => a.id === articleId)
    if (article) {
      article.views++
      saveArticles()
    }
  }

  // 点赞文章
  function likeArticle(articleId) {
    const article = articles.value.find(a => a.id === articleId)
    if (!article) return { success: false }

    const userId = getCurrentUserId()
    const key = `article:${userId}:${articleId}`
    const ratings = JSON.parse(localStorage.getItem('articleRatings') || '{}')
    const currentRating = ratings[key]

    if (currentRating === 'like') {
      article.likes--
      delete ratings[key]
    } else {
      article.likes++
      ratings[key] = 'like'
    }

    localStorage.setItem('articleRatings', JSON.stringify(ratings))
    saveArticles()
    return { success: true, rating: ratings[key] }
  }

  // 获取点赞状态
  function getArticleRating(articleId) {
    const userId = getCurrentUserId()
    const key = `article:${userId}:${articleId}`
    const ratings = JSON.parse(localStorage.getItem('articleRatings') || '{}')
    return ratings[key] || null
  }

  // 保存数据
  function saveColumns() {
    localStorage.setItem('columns', JSON.stringify(columns.value))
  }

  function saveArticles() {
    localStorage.setItem('articles', JSON.stringify(articles.value))
  }

  return {
    columns,
    articles,
    myColumns,
    latestArticles,
    createColumn,
    updateColumn,
    deleteColumn,
    getColumnById,
    createArticle,
    updateArticle,
    deleteArticle,
    getArticleById,
    getArticlesByColumn,
    getArticlesByUser,
    incrementViews,
    likeArticle,
    getArticleRating
  }
})
