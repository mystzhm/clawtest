import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { userApi, seedApi } from '../api'

// 默认匿名用户
const ANONYMOUS_USER = {
  id: 'anonymous',
  username: '匿名用户',
  email: '',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=anonymous',
  bio: '',
  followers: 0,
  following: 0,
  created_at: new Date().toISOString()
}

export const useUserStore = defineStore('user', () => {
  const currentUser = ref(null)
  const users = ref([])
  const followingIds = ref([])
  const isLoading = ref(false)

  const isLoggedIn = computed(() => !!currentUser.value)

  // 初始化：加载用户数据
  async function init() {
    isLoading.value = true
    try {
      // 先尝试初始化种子数据
      await seedApi.init(false)
      
      // 加载用户列表
      users.value = await userApi.getAll()
      
      // 恢复登录状态（从 sessionStorage）
      const savedUser = sessionStorage.getItem('currentUser')
      if (savedUser) {
        currentUser.value = JSON.parse(savedUser)
        await loadFollowingIds()
      }
    } catch (error) {
      console.error('初始化失败:', error)
    } finally {
      isLoading.value = false
    }
  }

  // 加载当前用户的关注列表
  async function loadFollowingIds() {
    if (!currentUser.value) {
      followingIds.value = []
      return
    }
    try {
      const following = await userApi.getFollowingList(currentUser.value.id)
      followingIds.value = following.map(u => u.id)
    } catch (error) {
      console.error('加载关注列表失败:', error)
      followingIds.value = []
    }
  }

  async function register(username, email, password, bio) {
    isLoading.value = true
    try {
      const user = await userApi.register(username, email, password, bio)
      users.value.push(user)
      return user
    } catch (error) {
      throw new Error(error.message || '注册失败')
    } finally {
      isLoading.value = false
    }
  }

  async function login(email, password) {
    isLoading.value = true
    try {
      const user = await userApi.login(email, password)
      currentUser.value = user
      sessionStorage.setItem('currentUser', JSON.stringify(user))
      await loadFollowingIds()
      return user
    } catch (error) {
      throw new Error(error.message || '登录失败')
    } finally {
      isLoading.value = false
    }
  }

  function logout() {
    currentUser.value = null
    followingIds.value = []
    sessionStorage.removeItem('currentUser')
  }

  async function updateProfile(data) {
    if (!currentUser.value) return
    
    isLoading.value = true
    try {
      const updated = await userApi.updateProfile(currentUser.value.id, data)
      currentUser.value = updated
      sessionStorage.setItem('currentUser', JSON.stringify(updated))
      
      // 更新列表中的用户
      const idx = users.value.findIndex(u => u.id === updated.id)
      if (idx !== -1) {
        users.value[idx] = updated
      }
    } catch (error) {
      throw new Error(error.message || '更新失败')
    } finally {
      isLoading.value = false
    }
  }

  function getUserById(id) {
    if (!id || id === 'anonymous') return ANONYMOUS_USER
    const user = users.value.find(u => u.id === id)
    return user || ANONYMOUS_USER
  }

  // 关注用户
  async function followUser(userId) {
    if (!currentUser.value) return false
    if (userId === currentUser.value.id) return false
    
    try {
      await userApi.follow(userId, currentUser.value.id)
      if (!followingIds.value.includes(userId)) {
        followingIds.value.push(userId)
      }
      // 重新加载用户数据以更新计数
      users.value = await userApi.getAll()
      const updated = users.value.find(u => u.id === currentUser.value.id)
      if (updated) {
        currentUser.value = updated
        sessionStorage.setItem('currentUser', JSON.stringify(updated))
      }
      return true
    } catch (error) {
      console.error('关注失败:', error)
      return false
    }
  }

  // 取消关注
  async function unfollowUser(userId) {
    if (!currentUser.value) return false
    
    try {
      await userApi.unfollow(userId, currentUser.value.id)
      followingIds.value = followingIds.value.filter(id => id !== userId)
      // 重新加载用户数据以更新计数
      users.value = await userApi.getAll()
      const updated = users.value.find(u => u.id === currentUser.value.id)
      if (updated) {
        currentUser.value = updated
        sessionStorage.setItem('currentUser', JSON.stringify(updated))
      }
      return true
    } catch (error) {
      console.error('取消关注失败:', error)
      return false
    }
  }

  // 检查是否已关注
  function isFollowing(userId) {
    if (!currentUser.value) return false
    return followingIds.value.includes(userId)
  }

  // 获取关注的用户ID列表
  function getFollowingIds() {
    return followingIds.value
  }

  // 获取关注的用户列表
  function getFollowingUsers() {
    return users.value.filter(u => followingIds.value.includes(u.id))
  }

  // 重新加载数据
  async function reloadUsers() {
    try {
      users.value = await userApi.getAll()
    } catch (error) {
      console.error('重新加载用户失败:', error)
    }
  }

  return {
    currentUser,
    users,
    isLoggedIn,
    isLoading,
    init,
    register,
    login,
    logout,
    updateProfile,
    getUserById,
    followUser,
    unfollowUser,
    isFollowing,
    getFollowingIds,
    getFollowingUsers,
    reloadUsers
  }
})
