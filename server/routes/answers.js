import express from 'express'
import db from '../models/database.js'
import { v4 as uuidv4 } from 'uuid'

const router = express.Router()

// 获取问题的回答列表
router.get('/question/:questionId', (req, res) => {
  const answers = db.prepare(`
    SELECT a.*, u.username as author_name, u.avatar as author_avatar
    FROM answers a
    LEFT JOIN users u ON a.author_id = u.id
    WHERE a.question_id = ?
    ORDER BY a.likes DESC, a.created_at DESC
  `).all(req.params.questionId)
  
  res.json(answers)
})

// 获取用户的回答列表
router.get('/user/:userId', (req, res) => {
  const answers = db.prepare(`
    SELECT a.*, q.title as question_title
    FROM answers a
    LEFT JOIN questions q ON a.question_id = q.id
    WHERE a.author_id = ?
    ORDER BY a.created_at DESC
  `).all(req.params.userId)
  
  res.json(answers)
})

// 创建回答
router.post('/', (req, res) => {
  const { questionId, content, authorId } = req.body
  
  if (!content || !authorId || !questionId) {
    return res.status(400).json({ error: '参数不完整' })
  }
  
  const id = uuidv4()
  
  db.prepare(`
    INSERT INTO answers (id, question_id, content, author_id)
    VALUES (?, ?, ?, ?)
  `).run(id, questionId, content, authorId)
  
  const answer = db.prepare(`
    SELECT a.*, u.username as author_name, u.avatar as author_avatar
    FROM answers a
    LEFT JOIN users u ON a.author_id = u.id
    WHERE a.id = ?
  `).get(id)
  
  res.json(answer)
})

// 更新回答
router.put('/:id', (req, res) => {
  const { content } = req.body
  
  db.prepare(`
    UPDATE answers SET content = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(content, req.params.id)
  
  const answer = db.prepare(`
    SELECT a.*, u.username as author_name, u.avatar as author_avatar
    FROM answers a
    LEFT JOIN users u ON a.author_id = u.id
    WHERE a.id = ?
  `).get(req.params.id)
  
  res.json(answer)
})

// 删除回答
router.delete('/:id', (req, res) => {
  db.prepare(`DELETE FROM answers WHERE id = ?`).run(req.params.id)
  res.json({ success: true })
})

// 点赞/踩
router.post('/:id/rate', (req, res) => {
  const { userId, rating } = req.body // rating: 'like' or 'dislike'
  
  if (!['like', 'dislike'].includes(rating)) {
    return res.status(400).json({ error: '无效的评分类型' })
  }
  
  // 检查是否已评分
  const existing = db.prepare(`
    SELECT rating FROM answer_ratings WHERE answer_id = ? AND user_id = ?
  `).get(req.params.id, userId)
  
  if (existing) {
    if (existing.rating === rating) {
      // 取消评分
      db.prepare(`DELETE FROM answer_ratings WHERE answer_id = ? AND user_id = ?`).run(req.params.id, userId)
      
      // 更新计数
      if (rating === 'like') {
        db.prepare(`UPDATE answers SET likes = likes - 1 WHERE id = ?`).run(req.params.id)
      } else {
        db.prepare(`UPDATE answers SET dislikes = dislikes - 1 WHERE id = ?`).run(req.params.id)
      }
      
      return res.json({ rating: null })
    } else {
      // 改变评分
      db.prepare(`
        UPDATE answer_ratings SET rating = ? WHERE answer_id = ? AND user_id = ?
      `).run(rating, req.params.id, userId)
      
      // 更新计数
      if (rating === 'like') {
        db.prepare(`
          UPDATE answers SET likes = likes + 1, dislikes = dislikes - 1 WHERE id = ?
        `).run(req.params.id)
      } else {
        db.prepare(`
          UPDATE answers SET likes = likes - 1, dislikes = dislikes + 1 WHERE id = ?
        `).run(req.params.id)
      }
      
      return res.json({ rating })
    }
  }
  
  // 新评分
  db.prepare(`
    INSERT INTO answer_ratings (answer_id, user_id, rating)
    VALUES (?, ?, ?)
  `).run(req.params.id, userId, rating)
  
  // 更新计数
  if (rating === 'like') {
    db.prepare(`UPDATE answers SET likes = likes + 1 WHERE id = ?`).run(req.params.id)
  } else {
    db.prepare(`UPDATE answers SET dislikes = dislikes + 1 WHERE id = ?`).run(req.params.id)
  }
  
  res.json({ rating })
})

// 获取用户对回答的评分
router.get('/:id/rating', (req, res) => {
  const { userId } = req.query
  
  const rating = db.prepare(`
    SELECT rating FROM answer_ratings WHERE answer_id = ? AND user_id = ?
  `).get(req.params.id, userId)
  
  res.json({ rating: rating?.rating || null })
})

export default router
