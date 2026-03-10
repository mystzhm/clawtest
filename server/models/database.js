import Database from 'better-sqlite3'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// 数据库文件路径
const dbPath = join(__dirname, '..', 'data', 'zhida.db')

// 创建数据库连接
const db = new Database(dbPath)

// 启用外键约束
db.pragma('journal_mode = WAL')

// 初始化表结构
function initTables() {
  // 用户表
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      avatar TEXT,
      bio TEXT,
      followers INTEGER DEFAULT 0,
      following INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // 问题表
  db.exec(`
    CREATE TABLE IF NOT EXISTS questions (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT,
      author_id TEXT NOT NULL,
      views INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (author_id) REFERENCES users(id)
    )
  `)

  // 问题标签表
  db.exec(`
    CREATE TABLE IF NOT EXISTS question_tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question_id TEXT NOT NULL,
      tag TEXT NOT NULL,
      FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
    )
  `)

  // 回答表
  db.exec(`
    CREATE TABLE IF NOT EXISTS answers (
      id TEXT PRIMARY KEY,
      question_id TEXT NOT NULL,
      content TEXT,
      author_id TEXT NOT NULL,
      likes INTEGER DEFAULT 0,
      dislikes INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
      FOREIGN KEY (author_id) REFERENCES users(id)
    )
  `)

  // 关注关系表
  db.exec(`
    CREATE TABLE IF NOT EXISTS follows (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      follower_id TEXT NOT NULL,
      following_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(follower_id, following_id),
      FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `)

  // 点赞记录表
  db.exec(`
    CREATE TABLE IF NOT EXISTS answer_ratings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      answer_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      rating TEXT CHECK(rating IN ('like', 'dislike')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(answer_id, user_id),
      FOREIGN KEY (answer_id) REFERENCES answers(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `)

  // 创建索引
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_questions_author ON questions(author_id);
    CREATE INDEX IF NOT EXISTS idx_questions_created ON questions(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_answers_question ON answers(question_id);
    CREATE INDEX IF NOT EXISTS idx_answers_author ON answers(author_id);
    CREATE INDEX IF NOT EXISTS idx_question_tags_question ON question_tags(question_id);
    CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
    CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);
  `)
}

// 初始化
initTables()

export default db
