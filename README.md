# 知答 - 知乎风格问答社区

一个基于 Vue 3 + SQLite 的知乎风格问答社区系统。

## 功能特性

- 🔐 用户注册/登录
- ❓ 发布/编辑/删除问题
- 💬 回答问题
- 👍 点赞/踩（互斥）
- 👥 关注用户
- 🔍 搜索功能
- 📱 响应式设计
- 💾 SQLite 持久化存储

## 技术栈

### 前端
- **框架**: Vue 3 + Vite
- **样式**: TailwindCSS v4
- **状态管理**: Pinia
- **路由**: Vue Router

### 后端
- **运行时**: Node.js
- **框架**: Express
- **数据库**: SQLite (better-sqlite3)
- **认证**: bcryptjs

## 快速开始

### 方式一：完整模式（SQLite 后端）

```bash
# 克隆项目
git clone https://github.com/mystzhm/clawtest.git
cd clawtest

# 安装前端依赖
npm install

# 安装后端依赖
cd server && npm install && cd ..

# 启动后端服务器（终端1）
npm run server

# 启动前端开发服务器（终端2）
npm run dev

# 访问 http://localhost:5173/clawtest/
```

### 方式二：同时启动前后端

```bash
npm run dev:all
```

## 环境配置

创建 `.env` 文件：

```env
VITE_API_URL=http://localhost:3001/api
```

## 测试账号

**统一密码**: `Test@123`

| 用户名 | 邮箱 |
|--------|------|
| 张明_程序员 | zhangming@zhida.com |
| 李雪_UI设计师 | lixue@zhida.com |
| 王强_产品经理 | wangqiang@zhida.com |
| 陈小雨_大学生 | chenxiaoyu@zhida.com |
| 刘洋_创业者 | liuyang@zhida.com |

## 🚀 部署指南

### 架构说明

本项目采用前后端分离架构：
- **前端**: 静态文件，部署到 GitHub Pages
- **后端**: Node.js 服务，需要部署到支持 Node.js 的平台

```
┌─────────────────┐         ┌─────────────────┐
│  GitHub Pages   │  HTTP   │  后端服务器      │
│  (前端静态文件)  │ ──────> │  (Node + SQLite)│
│                 │  API    │                 │
└─────────────────┘         └─────────────────┘
```

### 第一步：部署后端

推荐使用 **Render**（免费层）：

1. 访问 https://render.com 并注册/登录
2. 点击 "New +" → "Web Service"
3. 连接你的 GitHub 仓库 `mystzhm/clawtest`
4. 配置：
   - **Name**: `clawtest-api`
   - **Region**: Singapore（或离你最近的）
   - **Branch**: main
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

5. 点击 "Deploy Web Service"
6. 等待部署完成，获得 URL（如 `https://clawtest-api.onrender.com`）

**备选方案**：
- Railway (https://railway.app)
- Fly.io (https://fly.io)
- Vercel（需要调整代码）

### 第二步：配置前端环境变量

在 GitHub 仓库设置中：

1. 进入 Settings → Secrets and variables → Actions
2. 添加 **Repository variable**：
   - Name: `VITE_API_URL`
   - Value: `https://你的后端地址.onrender.com/api`

### 第三步：启用 GitHub Pages

1. 进入仓库 Settings → Pages
2. Source 选择 "GitHub Actions"
3. 推送代码后自动部署

### 第四步：推送代码

```bash
git add .
git commit -m "配置部署"
git push origin main
```

GitHub Actions 会自动构建并部署前端到：
`https://mystzhm.github.io/clawtest/`

### 验证部署

1. 访问前端地址
2. 尝试登录测试账号
3. 发布问题或回答

## API 接口

### 用户
- `GET /api/users` - 获取所有用户
- `POST /api/users/register` - 注册
- `POST /api/users/login` - 登录
- `POST /api/users/:id/follow` - 关注用户
- `DELETE /api/users/:id/follow` - 取消关注

### 问题
- `GET /api/questions` - 获取问题列表
- `GET /api/questions/:id` - 获取单个问题
- `POST /api/questions` - 创建问题
- `PUT /api/questions/:id` - 更新问题
- `DELETE /api/questions/:id` - 删除问题
- `GET /api/questions/search/:keyword` - 搜索

### 回答
- `GET /api/answers/question/:questionId` - 获取回答
- `POST /api/answers` - 创建回答
- `POST /api/answers/:id/rate` - 点赞/踩

## 项目结构

```
clawtest/
├── src/                    # 前端源码
│   ├── api/                # API 接口
│   ├── components/         # 组件
│   ├── stores/             # Pinia 状态管理
│   ├── router/             # 路由
│   └── views/              # 页面
├── server/                 # 后端源码
│   ├── models/             # 数据模型
│   ├── routes/             # API 路由（预留）
│   ├── data/               # SQLite 数据库（不提交）
│   └── index.js            # 服务入口
├── .github/workflows/      # GitHub Actions
│   └── deploy.yml          # 自动部署配置
├── render.yaml             # Render 部署配置
└── vite.config.js          # Vite 配置
```

## 本地开发注意事项

- SQLite 数据库文件 (`*.db`, `*.db-shm`, `*.db-wal`) 不会提交到 Git
- 每次部署到 Render 会创建新的空数据库
- 如需持久化生产数据，考虑使用外部数据库（PostgreSQL、MySQL 等）

## License

MIT
