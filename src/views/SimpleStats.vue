<template>
  <div class="max-w-4xl mx-auto">
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">数据统计</h1>

    <!-- 核心数据卡片 -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
        <div class="text-3xl font-bold text-zhihu-blue">{{ stats.questionCount }}</div>
        <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">提问</div>
      </div>
      <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
        <div class="text-3xl font-bold text-green-600 dark:text-green-400">{{ stats.answerCount }}</div>
        <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">回答</div>
      </div>
      <div class="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 text-center">
        <div class="text-3xl font-bold text-purple-600 dark:text-purple-400">{{ stats.articleCount }}</div>
        <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">文章</div>
      </div>
      <div class="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 text-center">
        <div class="text-3xl font-bold text-orange-600 dark:text-orange-400">{{ stats.likeCount }}</div>
        <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">获赞</div>
      </div>
    </div>

    <!-- 简易图表 -->
    <div class="grid md:grid-cols-2 gap-6 mb-8">
      <!-- 活跃度趋势 -->
      <div class="card">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">活跃度趋势</h3>
        <div class="h-48 flex items-end space-x-1 border-b border-gray-100 dark:border-gray-700 pb-2">
          <div
            v-for="(value, index) in activityData"
            :key="index"
            :style="{
              height: `${(value / maxActivity) * 100}%`,
              width: '30px',
              backgroundColor: value > 0 ? '#0084FF' : '#e5e7eb'
            }"
            class="rounded-t transition-all"
            :title="`第 ${index + 1} 月: ${value} 次活动`"
          ></div>
        </div>
        <div class="flex justify-between text-xs text-gray-400 mt-1">
          <span>6个月前</span>
          <span>现在</span>
        </div>
      </div>

      <!-- 内容分布 -->
      <div class="card">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">内容分布</h3>
        <div class="flex items-center justify-center h-48">
          <svg class="w-40 h-40" viewBox="0 0 36 36">
            <!-- 提问扇区 -->
            <circle cx="18" cy="18" r="15.915" fill="#e5e7eb" />
            <path
              :d="getQuestionArc(stats.questionCount, total)"
              fill="#0084FF"
            />
            <!-- 回答扇区 -->
            <path
              :d="getAnswerArc(stats.answerCount, total)"
              fill="#10B981"
            />
            <!-- 文章扇区 -->
            <path
              :d="getArticleArc(stats.articleCount, total)"
              fill="#8B5CF6"
            />
          </svg>
        </div>
        <div class="flex justify-center space-x-4 text-sm">
          <div class="flex items-center">
            <div class="w-3 h-3 rounded-full bg-blue-500"></div>
            <span class="ml-1 text-gray-700">提问 {{ stats.questionCount }}</span>
          </div>
          <div class="flex items-center">
            <div class="w-3 h-3 rounded-full bg-green-500"></div>
            <span class="ml-1 text-gray-700">回答 {{ stats.answerCount }}</span>
          </div>
          <div class="flex items-center">
            <div class="w-3 h-3 rounded-full bg-purple-500"></div>
            <span class="ml-1 text-gray-700">文章 {{ stats.articleCount }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 详细数据 -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="card">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">账号信息</h3>
        <div class="space-y-3 text-sm">
          <div class="flex justify-between py-2 border-b border-gray-50 dark:border-gray-700">
            <span class="text-gray-600 dark:text-gray-400">用户 ID</span>
            <span class="text-gray-900 dark:text-white">{{ currentUser?.id }}</span>
          </div>
          <div class="flex justify-between py-2 border-b border-gray-50 dark:border-gray-700">
            <span class="text-gray-600 dark:text-gray-400">注册时间</span>
            <span class="text-gray-900 dark:text-white">{{ formatDate(currentUser?.createdAt) }}</span>
          </div>
          <div class="flex justify-between py-2">
            <span class="text-gray-600 dark:text-gray-400">粉丝数</span>
            <span class="text-gray-900 dark:text-white">{{ currentUser?.followers || 0 }}</span>
          </div>
        </div>
      </div>

      <div class="card">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">互动数据</h3>
        <div class="space-y-3">
          <div class="flex justify-between items-center py-2">
            <span class="text-gray-600 dark:text-gray-400">收到评论</span>
            <span class="text-gray-900 dark:text-white font-medium">{{ stats.commentCount || 0 }}</span>
          </div>
          <div class="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
            <div :style="{ width: Math.min(100, (stats.commentCount || 0) / 10 * 100) + '%' }" class="h-2 bg-blue-500 rounded-full"></div>
          </div>
          <div class="flex justify-between items-center py-2 mt-1">
            <span class="text-gray-600 dark:text-gray-400">收到点赞</span>
            <span class="text-gray-900 dark:text-white font-medium">{{ stats.likeReceivedCount || 0 }}</span>
          </div>
          <div class="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
            <div :style="{ width: Math.min(100, (stats.likeReceivedCount || 0) / 50 * 100) + '%' }" class="h-2 bg-green-500 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useUserStore } from '../stores/user'
import { useQuestionStore } from '../stores/question'
import { useColumnStore } from '../stores/column'

const userStore = useUserStore()
const questionStore = useQuestionStore()
const columnStore = useColumnStore()

const currentUser = computed(() => userStore.currentUser)

// 统计数据
const stats = computed(() => {
  if (!currentUser.value) {
    return {
      questionCount: 0,
      answerCount: 0,
      articleCount: 0,
      likeCount: 0,
      commentCount: 0,
      likeReceivedCount: 0
    }
  }

  const userId = currentUser.value.id
  const questions = questionStore.questions.filter(q => q.authorId === userId)
  const answers = questionStore.answers.filter(a => a.authorId === userId)
  const articles = columnStore.articles.filter(a => a.userId === userId)

  // 总点赞数
  const answerLikes = answers.reduce((sum, a) => a.likes + sum, 0)
  const articleLikes = articles.reduce((sum, a) => a.likes + sum, 0)

  // 收到的点赞
  const userRatings = JSON.parse(localStorage.getItem('userRatings') || '{}')
  const ratings = Object.values(userRatings)
  const likeReceivedCount = ratings.filter(r => r.type === 'like').length

  // 收到的评论
  const commentCount = questionStore.comments.filter(c => {
    const answer = answers.find(a => a.id === c.answerId)
    return answer && answer.authorId === userId
  }).length

  return {
    questionCount: questions.length,
    answerCount: answers.length,
    articleCount: articles.length,
    likeCount: answerLikes + articleLikes,
    commentCount,
    likeReceivedCount
  }
})

const total = computed(() => {
  const s = stats.value
  return s.questionCount + s.answerCount + s.articleCount
})

const maxActivity = computed(() => {
  const s = stats.value
  return Math.max(s.totalAnswerViews || 0, s.questionCount * 10, s.answerCount * 10, s.articleCount * 10)
})

// 模拟活跃度数据（6个月）
const activityData = computed(() => {
  const s = stats.value
  return [
    s.questionCount * 2 + s.answerCount * 3 + s.articleCount * 2,
    s.questionCount * 3 + s.answerCount * 4 + s.articleCount * 3,
    s.questionCount * 4 + s.answerCount * 5 + s.articleCount * 4,
    s.questionCount * 5 + s.answerCount * 6 + s.articleCount * 5,
    s.questionCount * 6 + s.answerCount * 7 + s.articleCount * 6,
    s.questionCount * 7 + s.answerCount * 8 + s.articleCount * 7
  ]
})

// SVG 扇区计算
function getQuestionArc(count, total) {
  if (total === 0) count = 0
  const percentage = count / total
  const startAngle = -90
  const endAngle = startAngle + percentage * 360
  
  const x1 = 18 + 15.915 * Math.cos((startAngle * Math.PI) / 180)
  const y1 = 18 + 15.915 * Math.sin((startAngle * Math.PI) / 180)
  const x2 = 18 + 15.915 * Math.cos((endAngle * Math.PI) / 180)
  const y2 = 18 + 15.915 * Math.sin((endAngle * Math.PI) / 180)
  
  const largeArc = percentage > 0.5 ? 1 : 0
  return `M 18 18 L ${x1} ${y1} A 15.915 15.915 0 ${largeArc} 1 ${x2} ${y2} Z`
}

function getAnswerArc(count, total) {
  const questionCount = stats.value.questionCount
  const offset = questionCount > 0 ? (questionCount / total) * 360 : 0
  
  if (total === 0) count = 0
  const percentage = count / total
  const startAngle = -90 + offset
  const endAngle = startAngle + percentage * 360
  
  const x1 = 18 + 15.915 * Math.cos((startAngle * Math.PI) / 180)
  const y1 = 18 + 15.915 * Math.sin((startAngle * Math.PI) / 180)
  const x2 = 18 + 15.915 * Math.cos((endAngle * Math.PI) / 180)
  const y2 = 18 + 15.915 * Math.sin((endAngle * Math.PI) / 180)
  
  const largeArc = percentage > 0.5 ? 1 : 0
  return `M 18 18 L ${x1} ${y1} A 15.915 15.915 0 ${largeArc} 1 ${x2} ${y2} Z`
}

function getArticleArc(count, total) {
  const questionCount = stats.value.questionCount
  const answerCount = stats.value.answerCount
  const offset = (questionCount + answerCount) > 0 ? ((questionCount + answerCount) / total) * 360 : 0
  
  if (total === 0) count = 0
  const percentage = count / total
  const startAngle = -90 + offset
  const endAngle = startAngle + percentage * 360
  
  const x1 = 18 + 15.915 * Math.cos((startAngle * Math.PI) / 180)
  const y1 = 18 + 15.915 * Math.sin((startAngle * Math.PI) / 180)
  const x2 = 18 + 15.915 * Math.cos((endAngle * Math.PI) / 180)
  const y2 = 18 + 15.915 * Math.sin((endAngle * Math.PI) / 180)
  
  const largeArc = percentage > 0.5 ? 1 : 0
  return `M 18 18 L ${x1} ${y1} A 15.915 15.915 0 ${largeArc} 1 ${x2} ${y2} Z`
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
