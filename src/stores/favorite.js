import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useFavoriteStore = defineStore('favorite', () => {
  // 收藏夹列表
  const favorites = ref(JSON.parse(localStorage.getItem('favorites') || '[]'))

  // 收藏关系 { answerId: [favoriteId1, favoriteId2, ...] }
  const favoriteRelations = ref(JSON.parse(localStorage.getItem('favoriteRelations') || '{}'))

  function getCurrentUserId() {
    return JSON.parse(localStorage.getItem('currentUser'))?.id || 'anonymous'
  }

  // 创建收藏夹
  function createFavorite(name, description = '', isPublic = true) {
    const userId = getCurrentUserId()
    if (!userId) {
      throw new Error('请先登录')
    }

    const favorite = {
      id: Date.now().toString(),
      userId,
      name: name.trim().slice(0, 50),
      description: description.trim().slice(0, 200),
      isPublic,
      itemCount: 0,
      createdAt: new Date().toISOString()
    }

    favorites.value.push(favorite)
    saveFavorites()
    return favorite
  }

  // 更新收藏夹
  function updateFavorite(favoriteId, data) {
    const userId = getCurrentUserId()
    const index = favorites.value.findIndex(f => f.id === favoriteId && f.userId === userId)
    if (index === -1) return null

    if (data.name !== undefined) {
      favorites.value[index].name = data.name.trim().slice(0, 50)
    }
    if (data.description !== undefined) {
      favorites.value[index].description = data.description.trim().slice(0, 200)
    }
    if (data.isPublic !== undefined) {
      favorites.value[index].isPublic = data.isPublic
    }

    saveFavorites()
    return favorites.value[index]
  }

  // 删除收藏夹
  function deleteFavorite(favoriteId) {
    const userId = getCurrentUserId()
    const index = favorites.value.findIndex(f => f.id === favoriteId && f.userId === userId)
    if (index === -1) return false

    favorites.value.splice(index, 1)

    // 删除相关的收藏关系
    Object.keys(favoriteRelations.value).forEach(answerId => {
      favoriteRelations.value[answerId] = favoriteRelations.value[answerId].filter(fid => fid !== favoriteId)
    })

    saveFavorites()
    saveFavoriteRelations()
    return true
  }

  // 收藏回答
  function addAnswerToFavorites(answerId, favoriteIds) {
    const userId = getCurrentUserId()

    // 验证收藏夹属于当前用户
    const validFavoriteIds = favoriteIds.filter(fid => {
      const fav = favorites.value.find(f => f.id === fid && f.userId === userId)
      return !!fav
    })

    if (validFavoriteIds.length === 0) {
      throw new Error('请选择收藏夹')
    }

    if (!favoriteRelations.value[answerId]) {
      favoriteRelations.value[answerId] = []
    }

    // 添加收藏关系（去重）
    validFavoriteIds.forEach(fid => {
      if (!favoriteRelations.value[answerId].includes(fid)) {
        favoriteRelations.value[answerId].push(fid)
      }
    })

    // 更新收藏夹数量
    validFavoriteIds.forEach(fid => {
      const fav = favorites.value.find(f => f.id === fid)
      if (fav) {
        fav.itemCount++
      }
    })

    saveFavorites()
    saveFavoriteRelations()
    return validFavoriteIds
  }

  // 取消收藏
  function removeAnswerFromFavorites(answerId, favoriteId) {
    const userId = getCurrentUserId()
    const fav = favorites.value.find(f => f.id === favoriteId && f.userId === userId)
    if (!fav) return false

    if (!favoriteRelations.value[answerId]) return false

    const index = favoriteRelations.value[answerId].indexOf(favoriteId)
    if (index === -1) return false

    favoriteRelations.value[answerId].splice(index, 1)
    fav.itemCount = Math.max(0, fav.itemCount - 1)

    saveFavorites()
    saveFavoriteRelations()
    return true
  }

  // 获取用户的收藏夹
  const myFavorites = computed(() => {
    const userId = getCurrentUserId()
    return favorites.value.filter(f => f.userId === userId)
  })

  // 获取收藏夹中的回答
  function getAnswersByFavorite(favoriteId) {
    const answers = JSON.parse(localStorage.getItem('answers') || '[]')

    return Object.entries(favoriteRelations.value)
      .filter(([_, fids]) => fids.includes(favoriteId))
      .map(([answerId, _]) => answers.find(a => a.id === answerId))
      .filter(Boolean)
  }

  // 检查回答是否被收藏
  function isAnswerFavorited(answerId, favoriteId) {
    return favoriteRelations.value[answerId]?.includes(favoriteId) || false
  }

  // 获取回答所在的收藏夹列表
  function getAnswerFavoriteIds(answerId) {
    return favoriteRelations.value[answerId] || []
  }

  // 保存数据
  function saveFavorites() {
    localStorage.setItem('favorites', JSON.stringify(favorites.value))
  }

  function saveFavoriteRelations() {
    localStorage.setItem('favoriteRelations', JSON.stringify(favoriteRelations.value))
  }

  return {
    favorites,
    myFavorites,
    favoriteRelations,
    createFavorite,
    updateFavorite,
    deleteFavorite,
    addAnswerToFavorites,
    removeAnswerFromFavorites,
    getAnswersByFavorite,
    isAnswerFavorited,
    getAnswerFavoriteIds
  }
})
