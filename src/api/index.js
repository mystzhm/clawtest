// API 基础配置
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

// 通用请求方法
async function request(url, options = {}) {
  const response = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: '请求失败' }))
    throw new Error(error.error || '请求失败')
  }
  
  return response.json()
}

// 用户相关 API
export const userApi = {
  // 获取所有用户
  getAll: () => request('/users'),
  
  // 获取单个用户
  getById: (id) => request(`/users/${id}`),
  
  // 注册
  register: (username, email, password, bio) => 
    request('/users/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password, bio }),
    }),
  
  // 登录
  login: (email, password) => 
    request('/users/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  
  // 更新资料
  updateProfile: (id, data) => 
    request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  // 关注用户
  follow: (userId, followerId) => 
    request(`/users/${userId}/follow`, {
      method: 'POST',
      body: JSON.stringify({ followerId }),
    }),
  
  // 取消关注
  unfollow: (userId, followerId) => 
    request(`/users/${userId}/follow`, {
      method: 'DELETE',
      body: JSON.stringify({ followerId }),
    }),
  
  // 检查是否关注
  isFollowing: (userId, targetId) => 
    request(`/users/${targetId}/following?userId=${userId}`),
  
  // 获取关注的用户列表
  getFollowingList: (userId) => 
    request(`/users/${userId}/following-list`),
}

// 问题相关 API
export const questionApi = {
  // 获取问题列表
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return request(`/questions?${query}`)
  },
  
  // 获取单个问题
  getById: (id) => request(`/questions/${id}`),
  
  // 创建问题
  create: (title, content, authorId, tags) => 
    request('/questions', {
      method: 'POST',
      body: JSON.stringify({ title, content, authorId, tags }),
    }),
  
  // 更新问题
  update: (id, data) => 
    request(`/questions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  // 删除问题
  delete: (id) => 
    request(`/questions/${id}`, {
      method: 'DELETE',
    }),
  
  // 搜索问题
  search: (keyword, page = 1, pageSize = 10) => 
    request(`/questions/search/${encodeURIComponent(keyword)}?page=${page}&pageSize=${pageSize}`),
}

// 回答相关 API
export const answerApi = {
  // 获取问题的回答
  getByQuestion: (questionId) => 
    request(`/answers/question/${questionId}`),
  
  // 获取用户的回答
  getByUser: (userId) => 
    request(`/answers/user/${userId}`),
  
  // 创建回答
  create: (questionId, content, authorId) => 
    request('/answers', {
      method: 'POST',
      body: JSON.stringify({ questionId, content, authorId }),
    }),
  
  // 更新回答
  update: (id, content) => 
    request(`/answers/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    }),
  
  // 删除回答
  delete: (id) => 
    request(`/answers/${id}`, {
      method: 'DELETE',
    }),
  
  // 点赞/踩
  rate: (id, userId, rating) => 
    request(`/answers/${id}/rate`, {
      method: 'POST',
      body: JSON.stringify({ userId, rating }),
    }),
  
  // 获取评分状态
  getRating: (id, userId) => 
    request(`/answers/${id}/rating?userId=${userId}`),
}

// 种子数据 API
export const seedApi = {
  // 初始化种子数据
  init: (force = false) => 
    request('/seed', {
      method: 'POST',
      body: JSON.stringify({ force }),
    }),
}
