import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  const currentUser = ref(JSON.parse(localStorage.getItem('currentUser') || 'null'))
  const users = ref(JSON.parse(localStorage.getItem('users') || '[]'))

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
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
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
    return users.value.find(u => u.id === id)
  }

  return {
    currentUser,
    users,
    isLoggedIn,
    register,
    login,
    logout,
    updateProfile,
    getUserById
  }
})
