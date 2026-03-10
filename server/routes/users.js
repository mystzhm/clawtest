import express from 'express'
import db from '../models/database.js'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

const router = express.Router()

// 获取所有用户
router.get('/', (req, res) => {
  const users = db.prepare(`
    SELECT id, username, email, avatar, bio, followers, following, created_at
    FROM users
    ORDER BY created_at DESC
  `).all()
  res.json(users)
})

// 获取单个用户
router.get('/:id', (req, res) => {
  const user = db.prepare(`
    SELECT id, username, email, avatar, bio, followers, following, created_at
    FROM users WHERE id = ?
  `).get(req.params.id)
  
  if (!user) {
    return res.status(404).json({ error: '用户不存在' })
  }
  res.json(user)
})

// 注册
router.post('/register', (req, res) => {
  const { username, email, password, bio } = req.body
  
  // 检查是否已存在
  const existing = db.prepare('SELECT id FROM users WHERE email = ? OR username = ?').get(email, username)
  if (existing) {
    return res.status(400).json({ error: '邮箱或用户名已存在' })
  }
  
  const hashedPassword = bcrypt.hashSync(password, 10)
  const id = uuidv4()
  const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}`
  
  db.prepare(`
    INSERT INTO users (id, username, email, password, avatar, bio)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, username, email, hashedPassword, avatar, bio || '')
  
  const user = db.prepare(`
    SELECT id, username, email, avatar, bio, followers, following, created_at
    FROM users WHERE id = ?
  `).get(id)
  
  res.json(user)
})

// 登录
router.post('/login', (req, res) => {
  const { email, password } = req.body
  
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email)
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: '邮箱或密码错误' })
  }
  
  // 返回不含密码的用户信息
  const { password: _, ...userInfo } = user
  res.json(userInfo)
})

// 更新用户资料
router.put('/:id', (req, res) => {
  const { bio, avatar } = req.body
  
  db.prepare(`
    UPDATE users SET bio = ?, avatar = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(bio, avatar, req.params.id)
  
  const user = db.prepare(`
    SELECT id, username, email, avatar, bio, followers, following, created_at
    FROM users WHERE id = ?
  `).get(req.params.id)
  
  res.json(user)
})

// 关注用户
router.post('/:id/follow', (req, res) => {
  const { followerId } = req.body
  const followingId = req.params.id
  
  if (followerId === followingId) {
    return res.status(400).json({ error: '不能关注自己' })
  }
  
  try {
    db.prepare(`
      INSERT INTO follows (follower_id, following_id)
      VALUES (?, ?)
    `).run(followerId, followingId)
    
    // 更新关注数
    db.prepare(`
      UPDATE users SET following = (
        SELECT COUNT(*) FROM follows WHERE follower_id = ?
      ) WHERE id = ?
    `).run(followerId, followerId)
    
    // 更新粉丝数
    db.prepare(`
      UPDATE users SET followers = (
        SELECT COUNT(*) FROM follows WHERE following_id = ?
      ) WHERE id = ?
    `).run(followingId, followingId)
    
    res.json({ success: true })
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT') {
      res.json({ success: true, message: '已关注' })
    } else {
      res.status(500).json({ error: '关注失败' })
    }
  }
})

// 取消关注
router.delete('/:id/follow', (req, res) => {
  const { followerId } = req.body
  const followingId = req.params.id
  
  db.prepare(`
    DELETE FROM follows WHERE follower_id = ? AND following_id = ?
  `).run(followerId, followingId)
  
  // 更新关注数
  db.prepare(`
    UPDATE users SET following = (
      SELECT COUNT(*) FROM follows WHERE follower_id = ?
    ) WHERE id = ?
  `).run(followerId, followerId)
  
  // 更新粉丝数
  db.prepare(`
    UPDATE users SET followers = (
      SELECT COUNT(*) FROM follows WHERE following_id = ?
    ) WHERE id = ?
  `).run(followingId, followingId)
  
  res.json({ success: true })
})

// 检查是否关注
router.get('/:id/following', (req, res) => {
  const { userId } = req.query
  const result = db.prepare(`
    SELECT 1 FROM follows WHERE follower_id = ? AND following_id = ?
  `).get(userId, req.params.id)
  
  res.json({ isFollowing: !!result })
})

// 获取关注的用户列表
router.get('/:id/following-list', (req, res) => {
  const users = db.prepare(`
    SELECT u.id, u.username, u.avatar, u.bio, u.followers, u.following, u.created_at
    FROM users u
    JOIN follows f ON u.id = f.following_id
    WHERE f.follower_id = ?
  `).all(req.params.id)
  
  res.json(users)
})

export default router
