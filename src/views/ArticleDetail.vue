<template>
  <div class="max-w-3xl mx-auto">
    <!-- 404 -->
    <div v-if="notFound" class="card text-center py-16">
      <svg class="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <h2 class="text-2xl font-bold text-gray-900 mb-2">文章不存在</h2>
      <router-link to="/columns" class="btn-primary">返回专栏</router-link>
    </div>

    <!-- 文章内容 -->
    <template v-else-if="article">
      <!-- 增加浏览量 -->
      {{ incrementViews() }}

      <div class="card">
        <!-- 封面 -->
        <img v-if="article.cover" :src="article.cover" class="w-full rounded-lg mb-6 max-h-96 object-cover" />

        <!-- 专栏信息 -->
        <div class="flex items-center space-x-2 text-sm text-gray-500 mb-4">
          <router-link :to="`/column/${column?.id}`" class="hover:text-zhihu-blue">
            {{ column?.name }}
          </router-link>
          <span>·</span>
          <span>{{ formatDate(article.createdAt) }}</span>
          <span>·</span>
          <span>{{ article.views }} 阅读</span>
        </div>

        <!-- 标题 -->
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-6">{{ article.title }}</h1>

        <!-- 作者信息 -->
        <div class="flex items-center justify-between mb-6 pb-6 border-b border-gray-100 dark:border-gray-700">
          <div class="flex items-center space-x-3">
            <router-link :to="`/user/${author?.id}`">
              <img :src="author?.avatar" class="w-12 h-12 rounded-full" />
            </router-link>
            <div>
              <router-link :to="`/user/${author?.id}`" class="font-bold text-gray-900 dark:text-white hover:text-zhihu-blue">
                {{ author?.username }}
              </router-link>
              <p class="text-sm text-gray-500">{{ author?.bio || '这个人很懒' }}</p>
            </div>
          </div>

          <!-- 作者操作 -->
          <div v-if="isAuthor" class="flex space-x-2">
            <router-link :to="`/write/${article.id}`" class="text-gray-400 hover:text-zhihu-blue" title="编辑">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </router-link>
            <button @click="handleDelete" class="text-gray-400 hover:text-red-500" title="删除">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        <!-- 文章内容（Markdown 渲染） -->
        <div class="prose prose-lg max-w-none dark:text-gray-300" v-html="renderedContent"></div>

        <!-- 底部操作 -->
        <div class="flex items-center space-x-6 mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
          <button
            @click="handleLike"
            :class="[
              'flex items-center space-x-2 transition-colors',
              myRating === 'like' ? 'text-zhihu-blue' : 'text-gray-500 hover:text-zhihu-blue'
            ]"
          >
            <svg class="w-6 h-6" :fill="myRating === 'like' ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
            </svg>
            <span>{{ article.likes }}</span>
          </button>

          <ShareButton :url="shareUrl" />
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useColumnStore } from '../stores/column'
import { useUserStore } from '../stores/user'
import ShareButton from '../components/share/ShareButton.vue'

const route = useRoute()
const router = useRouter()
const columnStore = useColumnStore()
const userStore = useUserStore()

const article = ref(null)
const notFound = ref(false)
let viewed = false

const column = computed(() => {
  return columnStore.getColumnById(article.value?.columnId)
})

const author = computed(() => {
  return userStore.getUserById(article.value?.userId)
})

const isAuthor = computed(() => {
  return userStore.currentUser?.id === article.value?.userId
})

const myRating = computed(() => {
  return columnStore.getArticleRating(article.value?.id)
})

const shareUrl = computed(() => {
  return `${window.location.origin}${route.fullPath}`
})

// 简单的 Markdown 渲染
const renderedContent = computed(() => {
  if (!article.value?.content) return ''
  let md = article.value.content

  // 转义 HTML
  md = md.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  // 标题
  md = md.replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold mt-6 mb-3">$1</h3>')
  md = md.replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-6 mb-3">$1</h2>')
  md = md.replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-6 mb-4">$1</h1>')

  // 粗体和斜体
  md = md.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
  md = md.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>')
  md = md.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')

  // 代码块
  md = md.replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-100 dark:bg-gray-700 p-4 rounded my-4 overflow-x-auto"><code>$1</code></pre>')

  // 行内代码
  md = md.replace(/`(.*?)`/g, '<code class="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-sm">$1</code>')

  // 链接
  md = md.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-zhihu-blue hover:underline" target="_blank">$1</a>')

  // 图片
  md = md.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full rounded my-4" />')

  // 引用
  md = md.replace(/^&gt; (.*$)/gim, '<blockquote class="border-l-4 border-gray-300 pl-4 my-4 text-gray-600 dark:text-gray-400">$1</blockquote>')

  // 列表
  md = md.replace(/^- (.*$)/gim, '<li class="ml-4">$1</li>')
  md = md.replace(/^\d+\. (.*$)/gim, '<li class="ml-4">$1</li>')

  // 段落
  md = md.replace(/\n\n/g, '</p><p class="my-4">')
  md = `<p class="my-4">${md}</p>`

  return md
})

onMounted(() => {
  loadArticle()
})

function loadArticle() {
  const id = route.params.id
  article.value = columnStore.getArticleById(id)
  if (!article.value) {
    notFound.value = true
  }
}

function incrementViews() {
  if (viewed || !article.value) return
  viewed = true
  columnStore.incrementViews(article.value.id)
}

function handleLike() {
  columnStore.likeArticle(article.value.id)
}

function handleDelete() {
  if (confirm('确定要删除这篇文章吗？')) {
    columnStore.deleteArticle(article.value.id)
    router.push('/columns')
  }
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<style scoped>
.prose :deep(h1),
.prose :deep(h2),
.prose :deep(h3) {
  color: inherit;
}
</style>
