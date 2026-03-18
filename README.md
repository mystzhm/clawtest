# 知答 - 前端问答社区系统

> 以前端功能无限逼近真实知乎系统为核心目标，持续迭代中...

## 🎯 项目简介

知答是一个功能完整的知乎克隆，使用 Vue 3 + Pinia + Tailwind CSS 构建，所有数据存储在 localStorage 中，无需后端即可完整体验知乎的核心功能。

### 核心特性

- 🌙 **深色模式**：支持浅色/深色/跟随系统三种模式
- 📱 **移动端适配**：响应式布局 + 底部导航栏
- 💬 **实时通知**：关注/评论/点赞/私信通知
- 📝 **富文本编辑**：Markdown 编辑器 + 草稿自动保存
- 🔍 **智能搜索**：分类搜索 + 搜索建议 + 搜索历史
- 📊 **数据统计**：可视化统计图表 + 成就徽章
- 🎨 **UI 优化**：动画/过渡/加载/骨架屏

## ✨ 功能演示

### 已实现功能（32个）

#### 核心功能
- ✅ 用户注册/登录/登出
- ✅ 个人主页（Tab 切换、分页）
- ✅ 提问系统（富文本编辑器、标签）
- ✅ 回答系统（点赞/踩、评论）
- ✅ 评论系统（一级评论 + 嵌套回复，支持多级）
- ✅ 通知中心（分类通知、未读红点）
- ✅ 搜索功能（问题/话题/用户/文章）
- ✅ 热榜功能（热度算法、排行榜）
- ✅ 关注/粉丝系统
- ✅ 分享功能（链接/二维码/社交平台）

#### 内容系统
- ✅ 专栏系统（创建专栏、写文章、文章详情）
- ✅ 收藏夹功能（创建/编辑/删除收藏夹）
- ✅ 话题广场（热门话题、关注话题）
- ✅ 邀请回答功能
- ✅ 想法/动态（朋友圈、短内容发布）

#### 用户系统
- ✅ 用户设置（资料/安全/隐私/通知）
- ✅ 用户数据统计（SVG/CSS 图表、成就徽章）
- ✅ 私信功能（会话列表、聊天界面、未读提示）
- ✅ 头像上传（支持 URL）

#### 交互体验
- ✅ 深色模式（浅色/深色/跟随系统）
- ✅ 移动端适配（响应式布局、底部导航）
- ✅ UI 细节优化（动画、过渡、加载）
- ✅ 数据可视化（活跃度折线图、内容分布饼图）
- ✅ @用户功能（提及搜索、弹窗）
- ✅ 消息通知聚合（消息中心、类型分组）
- ✅ 搜索增强（分类搜索、搜索建议、搜索历史、热词）

## 🛠️ 技术栈

- **前端框架**: Vue 3.4+ (Composition API)
- **构建工具**: Vite 5.x
- **状态管理**: Pinia 2.x
- **路由**: Vue Router 4.x
- **样式**: Tailwind CSS 4.x
- **数据持久化**: localStorage
- **Markdown**: 自定义解析器
- **部署**: GitHub Pages
- **CI/CD**: GitHub Actions

## 📁 项目结构

\`\`\`
clawtest/
├── src/
│   ├── assets/
│   │   └── main.css
│   ├── components/
│   │   ├── answer/
│   │   │   └── AnswerCard.vue
│   │   ├── comment/
│   │   │   ├── CommentSection.vue
│   │   │   └── CommentItem.vue
│   │   ├── common/
│   │   │   ├── Header.vue
│   │   │   ├── Footer.vue
│   │   │   └── Loading.vue
│   │   ├── editor/
│   │   │   └── MarkdownEditor.vue
│   │   ├── invite/
│   │   │   └── InviteButton.vue
│   │   ├── mention/
│   │   │   └── MentionPopup.vue
│   │   ├── notification/
│   │   │   └── NotificationBell.vue
│   │   ├── share/
│   │   │   └── ShareButton.vue
│   │   ├── theme/
│   │   │   └── ThemeToggle.vue
│   │   └── user/
│   │       └── UserAvatar.vue
│   ├── stores/ (Pinia Stores)
│   │   ├── user.js
│   │   ├── question.js
│   │   ├── column.js
│   │   ├── favorite.js
│   │   ├── message.js
│   │   ├── topic.js
│   │   ├── notification.js
│   │   ├── editor.js
│   │   ├── theme.js
│   │   ├── hotList.js
│   │   ├── search.js
│   │   └── thought.js
│   ├── views/ (页面组件)
│   │   ├── Home.vue
│   │   ├── QuestionDetail.vue
│   │   ├── AskQuestion.vue
│   │   ├── Login.vue
│   │   ├── Register.vue
│   │   ├── Search.vue
│   │   ├── UserProfile.vue
│   │   ├── HotList.vue
│   │   ├── Favorites.vue
│   │   ├── Columns.vue
│   │   ├── WriteArticle.vue
│   │   ├── ArticleDetail.vue
│   │   ├── Messages.vue
│   │   ├── Chat.vue
│   │   ├── Topics.vue
│   │   ├── TopicDetail.vue
│   │   ├── Settings.vue
│   │   ├── Stats.vue
│   │   ├── SimpleStats.vue
│   │   ├── PublishThought.vue
│   │   └── Thoughts.vue
│   ├── router/
│   │   └── index.js
│   ├── App.vue
│   └── main.js
├── docs/
├── .gitignore
├── package.json
├── tailwind.config.js
└── vite.config.js
\`\`\`

## 🚀 快速开始

### 安装依赖
\`\`\`bash
npm install
\`\`\`

### 启动开发服务器
\`\`\`bash
npm run dev
\`\`\`

### 构建生产版本
\`\`\`bash
npm run build
\`\`\`

### 预览生产版本
\`\`\`bash
npm run preview
\`\`\`

## 📄 页面路由

| 路由 | 页面 | 说明 | 是否需要登录 |
|------|------|------|--------------|
| `/` | 首页 | 问题列表（推荐/关注/热榜） | 否 |
| `/question/:id` | 问题详情 | 问题 + 回答列表 + 评论 | 否 |
| `/ask` | 提问 | 发布新问题 | 是 |
| `/search` | 搜索 | 搜索结果页面 | 否 |
| `/user/:id` | 用户主页 | 回答/提问/关注/粉丝 | 否 |
| `/login` | 登录 | 用户登录 | 否 |
| `/register` | 注册 | 用户注册 | 否 |
| `/hot` | 热榜 | 热门问题排行 | 否 |
| `/columns` | 专栏 | 专栏列表 | 否 |
| `/column/:id` | 专栏详情 | 专栏下文章列表 | 否 |
| `/write` | 写文章 | 创建新文章 | 是 |
| `/write/:id` | 编辑文章 | 编辑已有文章 | 是 |
| `/article/:id` | 文章详情 | 文章内容 | 否 |
| `/topics` | 话题广场 | 热门话题 | 否 |
| `/topic/:id` | 话题详情 | 话题下内容 | 否 |
| `/favorites` | 收藏夹 | 我的收藏夹 | 是 |
| `/messages` | 私信列表 | 消息会话 | 是 |
| `/message/:userId` | 聊天 | 私信聊天界面 | 是 |
| `/settings` | 设置 | 个人设置 | 是 |
| `/stats` | 数据统计 | 统计图表 | 是 |
| `/thoughts` | 想法 | 想法流 | 否 |
| `/notifications` | 通知中心 | 全部通知 | 是 |

## 🔌 安全特性

- **XSS 防护**: 所有用户输入都经过 HTML 转义
- **CSRF 防护**: 本地存储无需 CSRF 防护
- **输入验证**: 长度限制、格式验证
- **头像 URL**: 使用 DiceBear 安全头像服务

## 📦 数据持久化

所有数据存储在 \`localStorage\` 中：

- \`users\`: 用户列表
- \`currentUser\`: 当前登录用户
- \`questions\`: 问题列表
- \`answers\`: 回答列表
- \`comments\`: 评论列表
- \`favorites\`: 收藏夹列表
- \`favoriteRelations\`: 收藏关系
- \`columns\`: 专栏列表
- \`articles\`: 文章列表
- \`topics\`: 话题列表
- \`followedTopics\`: 关注的话题
- \`messages\`: 私信消息
- \`conversations\`: 私信会话
- \`notifications\`: 通知列表
- \`thoughts\`: 想法列表
- \`thoughtRatings\`: 想法点赞记录

## 🎨 主题定制

- **浅色模式**: 默认白色背景，适合白天
- **深色模式**: 深色背景，适合夜间
- **跟随系统**: 自动跟随系统主题

## 📱 移动端支持

- **响应式布局**: 所有页面适配移动端
- **底部导航**: 移动端固定底部导航栏
- **汉堡菜单**: 移动端折叠菜单
- **触控优化**: 按钮尺寸、间距优化

## 🔧 开发指南

### 添加新 Store
\`\`\`javascript
// src/stores/example.js
import { defineStore } from 'pinia'

export const useExampleStore = defineStore('example', () => {
  const state = ref(null)

  function exampleAction() {
    // ...
  }

  return {
    state,
    exampleAction
  }
})
\`\`\`

### 添加新页面
\`\`\`javascript
// src/views/NewPage.vue
<script setup>
import { ref } from 'vue'

const data = ref('')
</script>

<template>
  <div class="card">
    <h1>新页面</h1>
  </div>
</template>
\`\`\`

### 添加路由
\`\`\`javascript
// src/router/index.js
{
  path: '/new-page',
  name: 'NewPage',
  component: () => import('../views/NewPage.vue')
}
\`\`\`

## 🐛 已知问题

1. **数据量大时性能问题**: localStorage 存储有上限（约 5-10MB）
2. **移动端图片上传**: Base64 图片较大时可能影响性能
3. **深色模式部分样式**: 某些第三方组件可能不完全支持
4. **搜索功能**: 简单的字符串匹配，没有全文搜索

## 🔄 未来规划

### Phase 1: 高级功能
- [ ] 虚拟滚动（无限加载）
- [ ] 代码分割（按路由懒加载）
- [ ] Service Worker（离线缓存）
- [ ] PWA 支持
- [ ] 图片上传（七牛云存储）
- [ ] 视频支持
- [ ] Live/圆桌功能
- [ ] 专栏关注功能

### Phase 2: 社交增强
- [ ] 群聊功能
- [ ] 私信已读回执
- [ ] 表情支持
- [ ] @用户功能（提醒通知）
- [ ] 消息通知聚合
- [ ] 推荐算法（协同过滤）
- [ ] 用户行为分析

### Phase 3: 内容增强
- [ ] 话题详情页（内容聚合）
- [ ] 搜索筛选（时间/热度/用户）
- [ ] 热门话题推荐
- [ ] 数据可视化（ECharts 图表）
- [ ] 数据导出功能
- [ ] 内容审核机制
- [ ] 举报系统
- [ ] 匿名回答

### Phase 4: 性能优化
- [ ] 图片懒加载
- [ ] 骨架屏加载
- [ ] 页面切换动画
- [ ] 列表加载动画
- [ ] 按钮点击反馈
- [ ] 性能监控（Lighthouse）

## 📝 License

MIT License

## 👨‍💻 贡献

欢迎提交 Issue 和 Pull Request！

## 🙏 致谢

- [Vue.js](https://vuejs.org/)
- [Pinia](https://pinia.vuejs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [DiceBear](https://www.dicebear.com/)
- [知乎](https://www.zhihu.com/)

---

**持续更新中...** 🚀
