import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { escapeHtml } from '../utils/security'

export const useThoughtStore = defineStore('thought', () => {
  // 想法列表
  const thoughts = ref(JSON.parse(localStorage.getItem('thoughts') || '[]'))
  // 关注的人的想法列表
  const followingThoughts = ref(JSON.parse(localStorage.getItem('followingThoughts') || '[]'))

  function getCurrentUserId() {
    return JSON.parse(localStorage.getItem('currentUser'))?.id || 'anonymous'
  }

  // 创建想法
  function createThought(content, images = [], topic = '') {
    const userId = getCurrentUserId()
    if (!userId) throw new Error('请先登录')

    const cleanContent = escapeHtml(content.trim().slice(0, 500))

    if (!cleanContent) {
      throw new Error('内容不能为空')
    }

    const thought = {
      id: Date.now().toString(),
      userId,
      content: cleanContent,
      images, // Base64 图片数组
      topic, // 话题标签
      likes: 0,
      comments: 0,
      createdAt: new Date().toISOString()
    }

    thoughts.value.unshift(thought)
    saveThoughts()
    return thought
  }

  // 删除想法
  function deleteThought(thoughtId) {
    const userId = getCurrentUserId()
    const index = thoughts.value.findIndex(t => t.id === thoughtId && t.userId === userId)
    if (index === -1) return false

    thoughts.value.splice(index, 1)
    saveThoughts()
    return true
  }

  // 点赞想法
  function likeThought(thoughtId) {
    const thought = thoughts.value.find(t => t.id === thoughtId)
    if (!thought) return { success: false }

    const userId = getCurrentUserId()
    const key = `thought:${userId}:${thoughtId}`
    const ratings = JSON.parse(localStorage.getItem('thoughtRatings') || '{}')
    const currentRating = ratings[key]

    if (currentRating === 'like') {
      thought.likes--
      delete ratings[key]
    } else {
      thought.likes++
      ratings[key] = 'like'
    }

    localStorage.setItem('thoughtRatings', JSON.stringify(ratings))
    saveThoughts()
    return { success: true, rating: ratings[key] }
  }

  // 获取点赞状态
  function getThoughtRating(thoughtId) {
    const userId = getCurrentUserId()
    const key = `thought:${userId}:${thoughtId}`
    const ratings = JSON.parse(localStorage.getItem('thoughtRatings') || '{}')
    return ratings[key] || null
  }

  // 添加评论
  function addComment(thoughtId, comment) {
    const thought = thoughts.value.find(t => t.id === thoughtId)
    if (!thought) return false

    if (!thought.comments) {
      thought.comments = []
    }

    thought.comments.push({
      id: Date.now().toString(),
      content: comment,
      createdAt: new Date().toISOString()
    })

    thought.commentCount = (thought.commentCount || 0) + 1

    saveThoughts()
    return true
  }

  // 获取我的想法
  const myThoughts = computed(() => {
    const userId = getCurrentUserId()
    return thoughts.value.filter(t => t.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  })

  // 获取所有想法（关注动态）
  const allThoughts = computed(() => {
    // 合并自己想法和关注的人的想法
    const userId = getCurrentUserId()
    const myIds = new Set([userId])

    return [...thoughts.value]
      .filter(t => myIds.has(t.userId))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  })

  // 获取想法
  function getThoughtById(id) {
    return thoughts.value.find(t => t.id === id)
  }

  // 保存数据
  function saveThoughts() {
    localStorage.setItem('thoughts', JSON.stringify(thoughts.value))
  }

  return {
    thoughts,
    myThoughts,
    allThoughts,
    createThought,
    deleteThought,
    likeThought,
    getThoughtRating,
    addComment,
    getThoughtById
  }
})
