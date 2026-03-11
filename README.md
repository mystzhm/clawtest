# 知答 - 知乎风格问答社区

一个基于 Vue 3 的知乎风格问答社区系统，使用纯前端技术实现，数据存储在浏览器 LocalStorage。

## 功能特性

- 🔐 用户注册/登录
- ❓ 发布问题
- 💬 回答问题
- 👍 点赞/踩
- 🔍 搜索功能
- 👤 用户主页
- 📱 响应式设计

## 技术栈

- **框架**: Vue 3 + Vite
- **样式**: TailwindCSS
- **状态管理**: Pinia
- **路由**: Vue Router
- **数据存储**: LocalStorage

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 在线访问

部署在 GitHub Pages: https://mystzhm.github.io/clawtest/

## 项目结构

```
src/
├── components/       # 组件
│   ├── common/       # 通用组件
│   ├── question/     # 问题相关
│   └── answer/       # 回答相关
├── views/            # 页面视图
├── stores/           # Pinia 状态管理
├── router/           # 路由配置
└── assets/           # 静态资源
```

## License

MIT
