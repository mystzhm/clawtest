import express from 'express'
import cors from 'cors'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { mkdirSync, existsSync } from 'fs'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import db from './models/database.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// 确保数据目录存在
const dataDir = join(__dirname, 'data')
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true })
}

const app = express()
const PORT = process.env.PORT || 3001

// 中间件
app.use(cors())
app.use(express.json())

// ========== 工具函数 ==========

// 转换 snake_case 到 camelCase
function toCamelCase(obj) {
  if (Array.isArray(obj)) {
    return obj.map(toCamelCase)
  }
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
      acc[camelKey] = obj[key]
      return acc
    }, {})
  }
  return obj
}

// ========== 用户 API ==========

// 获取所有用户
app.get('/api/users', (req, res) => {
  const users = db.prepare(`
    SELECT id, username, email, avatar, bio, followers, following, created_at
    FROM users ORDER BY created_at DESC
  `).all()
  res.json(toCamelCase(users))
})

// 获取单个用户
app.get('/api/users/:id', (req, res) => {
  const user = db.prepare(`
    SELECT id, username, email, avatar, bio, followers, following, created_at
    FROM users WHERE id = ?
  `).get(req.params.id)
  
  if (!user) {
    return res.status(404).json({ error: '用户不存在' })
  }
  res.json(toCamelCase(user))
})

// 注册
app.post('/api/users/register', async (req, res) => {
  const { username, email, password, bio } = req.body
  
  const existing = db.prepare('SELECT id FROM users WHERE email = ? OR username = ?').get(email, username)
  if (existing) {
    return res.status(400).json({ error: '邮箱或用户名已存在' })
  }
  
  const id = uuidv4()
  const hashedPassword = await bcrypt.hash(password, 10)
  const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}`
  
  db.prepare(`
    INSERT INTO users (id, username, email, password, avatar, bio)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, username, email, hashedPassword, avatar, bio || '')
  
  const user = db.prepare(`
    SELECT id, username, email, avatar, bio, followers, following, created_at
    FROM users WHERE id = ?
  `).get(id)
  
  res.json(toCamelCase(user))
})

// 登录
app.post('/api/users/login', async (req, res) => {
  const { email, password } = req.body
  
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email)
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: '邮箱或密码错误' })
  }
  
  const { password: _, ...userInfo } = user
  res.json(toCamelCase(userInfo))
})

// 关注用户
app.post('/api/users/:id/follow', (req, res) => {
  const { followerId } = req.body
  const followingId = req.params.id
  
  if (followerId === followingId) {
    return res.status(400).json({ error: '不能关注自己' })
  }
  
  try {
    db.prepare(`INSERT INTO follows (follower_id, following_id) VALUES (?, ?)`).run(followerId, followingId)
    syncFollowCounts(followerId, followingId)
    res.json({ success: true })
  } catch (err) {
    res.json({ success: true, message: '已关注' })
  }
})

// 取消关注
app.delete('/api/users/:id/follow', (req, res) => {
  const { followerId } = req.body
  const followingId = req.params.id
  
  db.prepare(`DELETE FROM follows WHERE follower_id = ? AND following_id = ?`).run(followerId, followingId)
  syncFollowCounts(followerId, followingId)
  res.json({ success: true })
})

// 获取关注的用户列表
app.get('/api/users/:id/following', (req, res) => {
  const users = db.prepare(`
    SELECT u.id, u.username, u.avatar, u.bio, u.followers, u.following, u.created_at
    FROM users u JOIN follows f ON u.id = f.following_id
    WHERE f.follower_id = ?
  `).all(req.params.id)
  res.json(toCamelCase(users))
})

// 检查是否关注
app.get('/api/users/:id/is-following', (req, res) => {
  const { userId } = req.query
  const follow = db.prepare(`
    SELECT 1 FROM follows WHERE follower_id = ? AND following_id = ?
  `).get(userId, req.params.id)
  res.json({ isFollowing: !!follow })
})

// 更新用户资料
app.put('/api/users/:id', (req, res) => {
  const { username, bio, avatar } = req.body
  
  if (username) {
    const existing = db.prepare('SELECT id FROM users WHERE username = ? AND id != ?').get(username, req.params.id)
    if (existing) {
      return res.status(400).json({ error: '用户名已存在' })
    }
  }
  
  db.prepare(`
    UPDATE users SET 
      username = COALESCE(?, username),
      bio = COALESCE(?, bio),
      avatar = COALESCE(?, avatar),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(username || null, bio || null, avatar || null, req.params.id)
  
  const user = db.prepare(`
    SELECT id, username, email, avatar, bio, followers, following, created_at
    FROM users WHERE id = ?
  `).get(req.params.id)
  
  res.json(toCamelCase(user))
})

// 同步关注计数
function syncFollowCounts(followerId, followingId) {
  db.prepare(`UPDATE users SET following = (SELECT COUNT(*) FROM follows WHERE follower_id = ?) WHERE id = ?`).run(followerId, followerId)
  db.prepare(`UPDATE users SET followers = (SELECT COUNT(*) FROM follows WHERE following_id = ?) WHERE id = ?`).run(followingId, followingId)
}

// ========== 问题 API ==========

// 获取问题列表
app.get('/api/questions', (req, res) => {
  const { page = 1, pageSize = 10, tag, authorId, sort = 'latest' } = req.query
  const offset = (parseInt(page) - 1) * parseInt(pageSize)
  
  let sql = `
    SELECT q.*, u.username as author_name, u.avatar as author_avatar,
    GROUP_CONCAT(qt.tag) as tags,
    (SELECT COUNT(*) FROM answers a WHERE a.question_id = q.id) as answer_count
    FROM questions q
    LEFT JOIN users u ON q.author_id = u.id
    LEFT JOIN question_tags qt ON q.id = qt.question_id
    WHERE 1=1
  `
  const params = []
  
  if (tag) {
    sql += ` AND qt.tag LIKE ?`
    params.push(`%${tag}%`)
  }
  
  if (authorId) {
    sql += ` AND q.author_id = ?`
    params.push(authorId)
  }
  
  sql += ` GROUP BY q.id`
  sql += sort === 'hot' ? ` ORDER BY q.views DESC` : ` ORDER BY q.created_at DESC`
  sql += ` LIMIT ? OFFSET ?`
  params.push(parseInt(pageSize), offset)
  
  const questions = db.prepare(sql).all(...params).map(q => toCamelCase({
    ...q,
    tags: q.tags ? q.tags.split(',') : []
  }))
  
  res.json({ questions, page: parseInt(page), pageSize: parseInt(pageSize) })
})

// 获取单个问题
app.get('/api/questions/:id', (req, res) => {
  const question = db.prepare(`
    SELECT q.*, u.username as author_name, u.avatar as author_avatar
    FROM questions q LEFT JOIN users u ON q.author_id = u.id
    WHERE q.id = ?
  `).get(req.params.id)
  
  if (!question) {
    return res.status(404).json({ error: '问题不存在' })
  }
  
  const tags = db.prepare(`SELECT tag FROM question_tags WHERE question_id = ?`).all(req.params.id).map(t => t.tag)
  db.prepare(`UPDATE questions SET views = views + 1 WHERE id = ?`).run(req.params.id)
  
  res.json(toCamelCase({ ...question, tags, views: question.views + 1 }))
})

// 创建问题
app.post('/api/questions', (req, res) => {
  const { title, content, authorId, tags } = req.body
  const id = uuidv4()
  
  db.prepare(`INSERT INTO questions (id, title, content, author_id) VALUES (?, ?, ?, ?)`).run(id, title, content || '', authorId)
  
  if (tags?.length) {
    const insertTag = db.prepare(`INSERT INTO question_tags (question_id, tag) VALUES (?, ?)`)
    tags.forEach(tag => insertTag.run(id, tag))
  }
  
  const question = db.prepare(`
    SELECT q.*, u.username as author_name, u.avatar as author_avatar
    FROM questions q LEFT JOIN users u ON q.author_id = u.id WHERE q.id = ?
  `).get(id)
  
  res.json(toCamelCase({ ...question, tags: tags || [] }))
})

// 更新问题
app.put('/api/questions/:id', (req, res) => {
  const { title, content, tags } = req.body
  
  db.prepare(`UPDATE questions SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(title, content, req.params.id)
  
  if (tags) {
    db.prepare(`DELETE FROM question_tags WHERE question_id = ?`).run(req.params.id)
    const insertTag = db.prepare(`INSERT INTO question_tags (question_id, tag) VALUES (?, ?)`)
    tags.forEach(tag => insertTag.run(req.params.id, tag))
  }
  
  const question = db.prepare(`SELECT * FROM questions WHERE id = ?`).get(req.params.id)
  const questionTags = db.prepare(`SELECT tag FROM question_tags WHERE question_id = ?`).all(req.params.id).map(t => t.tag)
  
  res.json(toCamelCase({ ...question, tags: questionTags }))
})

// 删除问题
app.delete('/api/questions/:id', (req, res) => {
  db.prepare(`DELETE FROM questions WHERE id = ?`).run(req.params.id)
  res.json({ success: true })
})

// 搜索问题
app.get('/api/questions/search/:keyword', (req, res) => {
  const { page = 1, pageSize = 10 } = req.query
  const offset = (parseInt(page) - 1) * parseInt(pageSize)
  const keyword = `%${req.params.keyword}%`
  
  const questions = db.prepare(`
    SELECT q.*, u.username as author_name, u.avatar as author_avatar,
    GROUP_CONCAT(qt.tag) as tags,
    (SELECT COUNT(*) FROM answers a WHERE a.question_id = q.id) as answer_count
    FROM questions q
    LEFT JOIN users u ON q.author_id = u.id
    LEFT JOIN question_tags qt ON q.id = qt.question_id
    WHERE q.title LIKE ? OR q.content LIKE ?
    GROUP BY q.id
    ORDER BY q.created_at DESC
    LIMIT ? OFFSET ?
  `).all(keyword, keyword, parseInt(pageSize), offset).map(q => toCamelCase({
    ...q,
    tags: q.tags ? q.tags.split(',') : []
  }))
  
  res.json({ questions, page: parseInt(page), pageSize: parseInt(pageSize) })
})

// ========== 回答 API ==========

// 获取问题的回答
app.get('/api/answers/question/:questionId', (req, res) => {
  const answers = db.prepare(`
    SELECT a.*, u.username as author_name, u.avatar as author_avatar
    FROM answers a LEFT JOIN users u ON a.author_id = u.id
    WHERE a.question_id = ? ORDER BY a.likes DESC, a.created_at DESC
  `).all(req.params.questionId)
  res.json(toCamelCase(answers))
})

// 创建回答
app.post('/api/answers', (req, res) => {
  const { questionId, content, authorId } = req.body
  const id = uuidv4()
  
  db.prepare(`INSERT INTO answers (id, question_id, content, author_id) VALUES (?, ?, ?, ?)`).run(id, questionId, content, authorId)
  
  const answer = db.prepare(`
    SELECT a.*, u.username as author_name, u.avatar as author_avatar
    FROM answers a LEFT JOIN users u ON a.author_id = u.id WHERE a.id = ?
  `).get(id)
  
  res.json(toCamelCase(answer))
})

// 删除回答
app.delete('/api/answers/:id', (req, res) => {
  db.prepare(`DELETE FROM answers WHERE id = ?`).run(req.params.id)
  res.json({ success: true })
})

// 获取用户的回答
app.get('/api/answers/user/:userId', (req, res) => {
  const answers = db.prepare(`
    SELECT a.*, q.title as question_title, u.username as author_name, u.avatar as author_avatar
    FROM answers a 
    LEFT JOIN users u ON a.author_id = u.id
    LEFT JOIN questions q ON a.question_id = q.id
    WHERE a.author_id = ? 
    ORDER BY a.created_at DESC
  `).all(req.params.userId)
  res.json(toCamelCase(answers))
})

// 更新回答
app.put('/api/answers/:id', (req, res) => {
  const { content } = req.body
  
  db.prepare(`UPDATE answers SET content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(content, req.params.id)
  
  const answer = db.prepare(`
    SELECT a.*, u.username as author_name, u.avatar as author_avatar
    FROM answers a LEFT JOIN users u ON a.author_id = u.id WHERE a.id = ?
  `).get(req.params.id)
  
  res.json(toCamelCase(answer))
})

// 获取回答的评分状态
app.get('/api/answers/:id/rating', (req, res) => {
  const { userId } = req.query
  const rating = db.prepare(`
    SELECT rating FROM answer_ratings WHERE answer_id = ? AND user_id = ?
  `).get(req.params.id, userId)
  
  res.json({ rating: rating?.rating || null })
})

// 点赞/踩
app.post('/api/answers/:id/rate', (req, res) => {
  const { userId, rating } = req.body
  
  const existing = db.prepare(`SELECT rating FROM answer_ratings WHERE answer_id = ? AND user_id = ?`).get(req.params.id, userId)
  
  if (existing) {
    if (existing.rating === rating) {
      db.prepare(`DELETE FROM answer_ratings WHERE answer_id = ? AND user_id = ?`).run(req.params.id, userId)
      db.prepare(`UPDATE answers SET ${rating}s = ${rating}s - 1 WHERE id = ?`).run(req.params.id)
      return res.json({ rating: null })
    } else {
      db.prepare(`UPDATE answer_ratings SET rating = ? WHERE answer_id = ? AND user_id = ?`).run(rating, req.params.id, userId)
      db.prepare(`UPDATE answers SET likes = likes + ?, dislikes = dislikes + ? WHERE id = ?`).run(
        rating === 'like' ? 1 : -1,
        rating === 'dislike' ? 1 : -1,
        req.params.id
      )
      return res.json({ rating })
    }
  }
  
  db.prepare(`INSERT INTO answer_ratings (answer_id, user_id, rating) VALUES (?, ?, ?)`).run(req.params.id, userId, rating)
  db.prepare(`UPDATE answers SET ${rating}s = ${rating}s + 1 WHERE id = ?`).run(req.params.id)
  res.json({ rating })
})

// ========== 种子数据 ==========

app.post('/api/seed', (req, res) => {
  const { force } = req.body
  
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count
  if (userCount > 0 && !force) {
    return res.json({ message: '数据已存在' })
  }
  
  if (force) {
    db.exec(`
      DELETE FROM answer_ratings;
      DELETE FROM follows;
      DELETE FROM question_tags;
      DELETE FROM answers;
      DELETE FROM questions;
      DELETE FROM users;
    `)
  }
  
  // 测试用户
  const testUsers = [
    { username: '张明_程序员', email: 'zhangming@zhida.com', password: 'Test@123', bio: '全栈开发工程师' },
    { username: '李雪_UI设计师', email: 'lixue@zhida.com', password: 'Test@123', bio: '资深UI设计师' },
    { username: '王强_产品经理', email: 'wangqiang@zhida.com', password: 'Test@123', bio: '产品经理' },
    { username: '陈小雨_大学生', email: 'chenxiaoyu@zhida.com', password: 'Test@123', bio: '计算机专业学生' },
    { username: '刘洋_创业者', email: 'liuyang@zhida.com', password: 'Test@123', bio: '创业者' },
  ]
  
  testUsers.forEach((user) => {
    const id = uuidv4()
    const hashedPassword = bcrypt.hashSync(user.password, 10)
    const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.username)}`
    db.prepare(`INSERT INTO users (id, username, email, password, avatar, bio) VALUES (?, ?, ?, ?, ?, ?)`).run(id, user.username, user.email, hashedPassword, avatar, user.bio)
  })
  
  // 测试问题和回答
  const users = db.prepare('SELECT id FROM users').all()
  
  const testQuestions = [
    { title: '如何学习前端开发？', content: '我想转行做前端，请问有什么好的学习路径推荐吗？', tags: ['前端开发', '学习'] },
    { title: '2024年最值得学习的编程语言是什么？', content: '作为一个新手，想了解一下现在市场需求最大的编程语言', tags: ['编程', '职业发展'] },
    { title: 'Vue 3 和 React 哪个更适合新项目？', content: '公司准备开始一个新项目，在技术选型上有些纠结', tags: ['前端开发', 'Vue', 'React'] },
  ]
  
  testQuestions.forEach((q, idx) => {
    const id = uuidv4()
    const authorId = users[idx % users.length].id
    db.prepare(`INSERT INTO questions (id, title, content, author_id) VALUES (?, ?, ?, ?)`).run(id, q.title, q.content, authorId)
    q.tags.forEach(tag => {
      db.prepare(`INSERT INTO question_tags (question_id, tag) VALUES (?, ?)`).run(id, tag)
    })
    
    // 添加回答
    const answerAuthor = users[(idx + 1) % users.length].id
    const answerId = uuidv4()
    db.prepare(`INSERT INTO answers (id, question_id, content, author_id, likes) VALUES (?, ?, ?, ?, ?)`).run(
      answerId, id, `这是一个关于"${q.title}"的回答示例，希望对你有帮助！`, answerAuthor, Math.floor(Math.random() * 50)
    )
  })
  
  res.json({ message: `成功创建 ${testUsers.length} 个用户和 ${testQuestions.length} 个问题` })
})

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

// 启动
app.listen(PORT, () => {
  console.log(`🚀 服务器运行在 http://localhost:${PORT}`)
})
