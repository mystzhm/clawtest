import express from 'express'
import db from '../models/database.js'
import { v4 as uuidv4 } from 'uuid'

const router = express.Router()

// 获取问题列表（支持分页和过滤）
router.get('/', (req, res) => {
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
  
  // 排序
  if (sort === 'hot') {
    sql += ` ORDER BY q.views DESC`
  } else {
    sql += ` ORDER BY q.created_at DESC`
  }
  
  // 分页
  sql += ` LIMIT ? OFFSET ?`
  params.push(parseInt(pageSize), offset)
  
  const questions = db.prepare(sql).all(...params)
  
  // 处理标签
  const formattedQuestions = questions.map(q => ({
    ...q,
    tags: q.tags ? q.tags.split(',') : []
  }))
  
  // 获取总数
  let countSql = `SELECT COUNT(DISTINCT q.id) as total FROM questions q`
  const countParams = []
  
  if (tag) {
    countSql += ` LEFT JOIN question_tags qt ON q.id = qt.question_id WHERE qt.tag LIKE ?`
    countParams.push(`%${tag}%`)
  }
  
  if (authorId) {
    if (tag) {
      countSql += ` AND q.author_id = ?`
    } else {
      countSql += ` WHERE q.author_id = ?`
    }
    countParams.push(authorId)
  }
  
  const { total } = db.prepare(countSql).get(...countParams) || { total: 0 }
  
  res.json({
    questions: formattedQuestions,
    pagination: {
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      total,
      totalPages: Math.ceil(total / parseInt(pageSize))
    }
  })
})

// 获取单个问题
router.get('/:id', (req, res) => {
  const question = db.prepare(`
    SELECT q.*, u.username as author_name, u.avatar as author_avatar
    FROM questions q
    LEFT JOIN users u ON q.author_id = u.id
    WHERE q.id = ?
  `).get(req.params.id)
  
  if (!question) {
    return res.status(404).json({ error: '问题不存在' })
  }
  
  // 获取标签
  const tags = db.prepare(`
    SELECT tag FROM question_tags WHERE question_id = ?
  `).all(req.params.id).map(t => t.tag)
  
  // 增加浏览量
  db.prepare(`UPDATE questions SET views = views + 1 WHERE id = ?`).run(req.params.id)
  
  res.json({
    ...question,
    tags,
    views: question.views + 1
  })
})

// 创建问题
router.post('/', (req, res) => {
  const { title, content, authorId, tags } = req.body
  
  if (!title || !authorId) {
    return res.status(400).json({ error: '标题和作者不能为空' })
  }
  
  const id = uuidv4()
  
  db.prepare(`
    INSERT INTO questions (id, title, content, author_id)
    VALUES (?, ?, ?, ?)
  `).run(id, title, content || '', authorId)
  
  // 添加标签
  if (tags && tags.length > 0) {
    const insertTag = db.prepare(`
      INSERT INTO question_tags (question_id, tag) VALUES (?, ?)
    `)
    tags.forEach(tag => {
      insertTag.run(id, tag)
    })
  }
  
  const question = db.prepare(`
    SELECT q.*, u.username as author_name, u.avatar as author_avatar
    FROM questions q
    LEFT JOIN users u ON q.author_id = u.id
    WHERE q.id = ?
  `).get(id)
  
  res.json({
    ...question,
    tags: tags || []
  })
})

// 更新问题
router.put('/:id', (req, res) => {
  const { title, content, tags } = req.body
  
  db.prepare(`
    UPDATE questions 
    SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(title, content || '', req.params.id)
  
  // 更新标签
  if (tags) {
    db.prepare(`DELETE FROM question_tags WHERE question_id = ?`).run(req.params.id)
    const insertTag = db.prepare(`
      INSERT INTO question_tags (question_id, tag) VALUES (?, ?)
    `)
    tags.forEach(tag => {
      insertTag.run(req.params.id, tag)
    })
  }
  
  const question = db.prepare(`
    SELECT q.*, u.username as author_name, u.avatar as author_avatar
    FROM questions q
    LEFT JOIN users u ON q.author_id = u.id
    WHERE q.id = ?
  `).get(req.params.id)
  
  const questionTags = db.prepare(`
    SELECT tag FROM question_tags WHERE question_id = ?
  `).all(req.params.id).map(t => t.tag)
  
  res.json({
    ...question,
    tags: questionTags
  })
})

// 删除问题
router.delete('/:id', (req, res) => {
  db.prepare(`DELETE FROM questions WHERE id = ?`).run(req.params.id)
  res.json({ success: true })
})

// 搜索问题
router.get('/search/:keyword', (req, res) => {
  const { keyword } = req.params
  const { page = 1, pageSize = 10 } = req.query
  const offset = (parseInt(page) - 1) * parseInt(pageSize)
  
  const questions = db.prepare(`
    SELECT q.*, u.username as author_name, u.avatar as author_avatar,
    GROUP_CONCAT(qt.tag) as tags,
    (SELECT COUNT(*) FROM answers a WHERE a.question_id = q.id) as answer_count
    FROM questions q
    LEFT JOIN users u ON q.author_id = u.id
    LEFT JOIN question_tags qt ON q.id = qt.question_id
    WHERE q.title LIKE ? OR q.content LIKE ? OR qt.tag LIKE ?
    GROUP BY q.id
    ORDER BY q.created_at DESC
    LIMIT ? OFFSET ?
  `).all(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`, parseInt(pageSize), offset)
  
  const formattedQuestions = questions.map(q => ({
    ...q,
    tags: q.tags ? q.tags.split(',') : []
  }))
  
  res.json(formattedQuestions)
})

export default router
