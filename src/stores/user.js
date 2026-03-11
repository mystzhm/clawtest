import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getSafeAvatarUrl } from '../utils/security'
import { generateSeedData } from '../data/seedData'

// 默认系统用户
const SYSTEM_USER = {
  id: 'system',
  username: '系统管理员',
  email: 'system@zhida.com',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=system',
  bio: '知答社区官方账号',
  followers: 0,
  following: 0,
  createdAt: '2024-01-01T00:00:00.000Z'
}

// 默认匿名用户
const ANONYMOUS_USER = {
  id: 'anonymous',
  username: '匿名用户',
  email: '',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=anonymous',
  bio: '',
  followers: 0,
  following: 0,
  createdAt: new Date().toISOString()
}

export const useUserStore = defineStore('user', () => {
  let storedUsers = JSON.parse(localStorage.getItem('users') || 'null')
  
  // 如果没有用户数据，初始化种子数据
  if (!storedUsers || storedUsers.length === 0) {
    const seedData = generateSeedData()
    storedUsers = seedData.users
    localStorage.setItem('users', JSON.stringify(storedUsers))
    // 同时初始化问题和回答
    localStorage.setItem('questions', JSON.stringify(seedData.questions))
    localStorage.setItem('answers', JSON.stringify(seedData.answers))
    localStorage.setItem('seedDataInitialized', 'true')
  }
  
  const currentUser = ref(JSON.parse(localStorage.getItem('currentUser') || 'null'))
  const users = ref(storedUsers)
  
  // 关注关系: { userId: [followingUserId1, followingUserId2, ...] }
  const followingList = ref(JSON.parse(localStorage.getItem('followingList') || '{}'))
  
  // 根据 followingList 重新计算所有用户的关注数和粉丝数
  function syncFollowingCounts() {
    // 重置所有用户的关注数
    users.value.forEach(u => {
      u.following = followingList.value[u.id]?.length || 0
      u.followers = 0
    })
    
    // 计算粉丝数
    Object.entries(followingList.value).forEach(([userId, following]) => {
      following.forEach(targetId => {
        const targetUser = users.value.find(u => u.id === targetId)
        if (targetUser) {
          targetUser.followers++
        }
      })
    })
    
    // 更新 currentUser
    if (currentUser.value) {
      const updated = users.value.find(u => u.id === currentUser.value.id)
      if (updated) {
        currentUser.value = updated
      }
    }
    
    localStorage.setItem('users', JSON.stringify(users.value))
    if (currentUser.value) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser.value))
    }
  }
  
  // 初始化时同步数据
  syncFollowingCounts()

  const isLoggedIn = computed(() => !!currentUser.value)

  function register(username, email, password) {
    if (users.value.find(u => u.email === email)) {
      throw new Error('邮箱已被注册')
    }
    if (users.value.find(u => u.username === username)) {
      throw new Error('用户名已存在')
    }

    const user = {
      id: Date.now().toString(),
      username,
      email,
      password,
      avatar: getSafeAvatarUrl(`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}`),
      bio: '',
      followers: 0,
      following: 0,
      createdAt: new Date().toISOString()
    }

    users.value.push(user)
    localStorage.setItem('users', JSON.stringify(users.value))
    return user
  }

  function login(email, password) {
    const user = users.value.find(u => u.email === email && u.password === password)
    if (!user) {
      throw new Error('邮箱或密码错误')
    }
    currentUser.value = user
    localStorage.setItem('currentUser', JSON.stringify(user))
    return user
  }

  function logout() {
    currentUser.value = null
    localStorage.removeItem('currentUser')
  }

  function updateProfile(data) {
    Object.assign(currentUser.value, data)
    const idx = users.value.findIndex(u => u.id === currentUser.value.id)
    if (idx !== -1) {
      users.value[idx] = currentUser.value
      localStorage.setItem('users', JSON.stringify(users.value))
    }
    localStorage.setItem('currentUser', JSON.stringify(currentUser.value))
  }

  function getUserById(id) {
    if (!id) return ANONYMOUS_USER
    if (id === 'system') return SYSTEM_USER
    if (id === 'anonymous') return ANONYMOUS_USER
    
    const user = users.value.find(u => u.id === id)
    return user || ANONYMOUS_USER
  }

  // 关注用户
  function followUser(userId) {
    if (!currentUser.value) return false
    if (userId === currentUser.value.id) return false // 不能关注自己
    
    const currentUserId = currentUser.value.id
    if (!followingList.value[currentUserId]) {
      followingList.value[currentUserId] = []
    }
    
    if (!followingList.value[currentUserId].includes(userId)) {
      followingList.value[currentUserId].push(userId)
      
      // 更新关注数
      const user = users.value.find(u => u.id === currentUserId)
      if (user) user.following = followingList.value[currentUserId].length
      
      // 更新粉丝数
      const targetUser = users.value.find(u => u.id === userId)
      if (targetUser) {
        targetUser.followers = Object.values(followingList.value)
          .filter(list => list.includes(userId)).length
      }
      
      saveFollowingData()
      return true
    }
    return false
  }

  // 取消关注
  function unfollowUser(userId) {
    if (!currentUser.value) return false
    
    const currentUserId = currentUser.value.id
    if (!followingList.value[currentUserId]) return false
    
    const index = followingList.value[currentUserId].indexOf(userId)
    if (index > -1) {
      followingList.value[currentUserId].splice(index, 1)
      
      // 更新关注数
      const user = users.value.find(u => u.id === currentUserId)
      if (user) user.following = followingList.value[currentUserId].length
      
      // 更新粉丝数
      const targetUser = users.value.find(u => u.id === userId)
      if (targetUser) {
        targetUser.followers = Object.values(followingList.value)
          .filter(list => list.includes(userId)).length
      }
      
      saveFollowingData()
      return true
    }
    return false
  }

  // 检查是否已关注
  function isFollowing(userId) {
    if (!currentUser.value) return false
    const currentUserId = currentUser.value.id
    return followingList.value[currentUserId]?.includes(userId) || false
  }

  // 获取关注的用户ID列表
  function getFollowingIds() {
    if (!currentUser.value) return []
    return followingList.value[currentUser.value.id] || []
  }

  // 获取关注的用户列表
  function getFollowingUsers() {
    const ids = getFollowingIds()
    return users.value.filter(u => ids.includes(u.id))
  }

  // 保存关注数据
  function saveFollowingData() {
    localStorage.setItem('followingList', JSON.stringify(followingList.value))
    localStorage.setItem('users', JSON.stringify(users.value))
    // 更新 currentUser
    if (currentUser.value) {
      const updated = users.value.find(u => u.id === currentUser.value.id)
      if (updated) {
        currentUser.value = updated
        localStorage.setItem('currentUser', JSON.stringify(updated))
      }
    }
  }

  return {
    currentUser,
    users,
    isLoggedIn,
    followingList,
    register,
    login,
    logout,
    updateProfile,
    getUserById,
    followUser,
    unfollowUser,
    isFollowing,
    getFollowingIds,
    getFollowingUsers
  }
})
