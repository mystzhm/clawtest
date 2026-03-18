<template>
  <div class="max-w-3xl mx-auto">
    <div class="card">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">数据统计</h1>

      <!-- 用户信息 -->
      <div class="flex items-center space-x-4 pb-6 mb-6 border-b border-gray-100 dark:border-gray-700">
        <img :src="currentUser?.avatar" class="w-16 h-16 rounded-full" />
        <div>
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">{{ currentUser?.username }}</h2>
          <p class="text-sm text-gray-500">加入于 {{ formatDate(currentUser?.createdAt) }}</p>
        </div>
      </div>

      <!-- 统计数据 -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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

      <!-- 关注/粉丝 -->
      <div class="grid grid-cols-2 gap-4 mb-6">
        <div class="border border-gray-100 dark:border-gray-700 rounded-lg p-4">
          <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">关注</h3>
          <div class="text-3xl font-bold text-zhihu-blue">
            {{ currentUser?.following || 0 }}
          </div>
        </div>
        <div class="border border-gray-100 dark:border-gray-700 rounded-lg p-4">
          <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">粉丝</h3>
          <div class="text-3xl font-bold text-zhihu-blue">
            {{ currentUser?.followers || 0 }}
          </div>
        </div>
      </div>

      <!-- 活跃度图表 -->
      <div class="mb-6">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">活跃度</h3>
        <div class="flex items-end space-x-1 h-40 border-b border-gray-100 dark:border-gray-700">
          <div
            v-for="(count, index) in activityData"
            :key="index"
            :style="{
              height: `${(count / maxActivity) * 100}%`,
              width: '40px'
            }"
            class="bg-zhihu-blue rounded-t transition-all hover:opacity-80"
            :title="`${count} 次活动`"
          ></div>
        </div>
        <div class="flex justify-between text-xs text-gray-400 mt-1">
          <span>6月前</span>
          <span>现在</span>
        </div>
      </div>

      <!-- 内容统计 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- 回答浏览量 -->
        <div class="border border-gray-100 dark:border-gray-700 rounded-lg p-4">
          <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">回答浏览量</h3>
          <div class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {{ stats.totalAnswerViews || 0 }}
          </div>
          <p class="text-sm text-gray-500">累计浏览次数</p>
        </div>

        <!-- 互动数据 -->
        <div class="border border-gray-100 dark:border-gray-700 rounded-lg p-4">
          <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">互动数据</h3>
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-sm text-gray-600 dark:text-gray-400">收到评论</span>
              <span class="text-sm font-medium text-gray-900 dark:text-white">{{ stats.commentCount || 0 }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600 dark:text-gray-400">收到点赞</span>
              <span class="text-sm font-medium text-gray-900 dark:text-white">{{ stats.likeReceivedCount || 0 }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600 dark:text-gray-400">发出点赞</span>
              <span class="text-sm font-medium text-gray-900 dark:text-white">{{ stats.likeGivenCount || 0 }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 成就徽章 -->
      <div class="mt-6">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">成就徽章</h3>
        <div class="flex flex-wrap gap-3">
          <div
            v-for="achievement in achievements"
            :key="achievement.id"
            class="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 flex items-center space-x-2"
            :class="{ 'opacity-50': !achievement.unlocked }"
            :title="achievement.description"
          >
            <span class="text-2xl">{{ achievement.icon }}</span>
            <div>
              <div class="text-sm font-medium text-gray-900 dark:text-white">{{ achievement.name }}</div>
              <div class="text-xs text-gray-500">{{ achievement.condition }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
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
      totalAnswerViews: 0,
      commentCount: 0,
      likeReceivedCount: 0,
      likeGivenCount: 0
    }
  }

  const userId = currentUser.value.id
  const questions = questionStore.questions.filter(q => q.authorId === userId)
  const answers = questionStore.answers.filter(a => a.authorId === userId)
  const articles = columnStore.articles.filter(a => a.userId === userId)
  const userRatings = JSON.parse(localStorage.getItem('userRatings') || '{}')

  // 统计点赞
  const answerIds = answers.map(a => a.id)
  const likeReceivedCount = answerIds.reduce((sum, id) => {
    const key = `${userId}:${id}`
    return Object.values(userRatings).filter(r => r[key] === 'like').length + sum
  }, 0)

  const likeGivenCount = Object.values(userRatings).length

  // 统计评论
  const commentCount = questionStore.comments.filter(c => c.answerId && 
    answers.some(a => a.id === c.answerId && c.authorId === userId)).length

  // 总浏览量
  const totalAnswerViews = answers.reduce((sum, a) => {
    const question = questionStore.getQuestionById(a.questionId)
    return (question?.views || 0) + sum
  }, 0)

  return {
    questionCount: questions.length,
    answerCount: answers.length,
    articleCount: articles.length,
    likeCount: answers.reduce((sum, a) => a.likes + sum, 0) +
             articles.reduce((sum, a) => a.likes + sum, 0),
    totalAnswerViews,
    commentCount,
    likeReceivedCount,
    likeGivenCount
  }
})

// 模拟活跃度数据（最近 6 个月）
const activityData = computed(() => {
  return [
    Math.floor(Math.random() * 50) + 10,
    Math.floor(Math.random() * 50) + 10,
    Math.floor(Math.random() * 50) + 10,
    Math.floor(Math.random() * 50) + 10,
    Math.floor(Math.random() * 50) + 10,
    stats.value.totalAnswerViews
  ]
})

const maxActivity = computed(() => {
  return Math.max(...activityData.value)
})

// 成就徽章
const achievements = computed(() => {
  const s = stats.value
  return [
    {
      id: 'first_question',
      name: '初出茅庐',
      icon: '❓',
      description: '发布第一个问题',
      condition: `发布 ${s.questionCount} 个问题`,
      unlocked: s.questionCount >= 1
    },
    {
      id: 'first_answer',
      name: '乐于助人',
      icon: '💬',
      description: '发布第一个回答',
      condition: `发布 ${s.answerCount} 个回答`,
      unlocked: s.answerCount >= 1
    },
    {
      id: 'article_writer',
      name: '笔耕不辍',
      icon: '✍️',
      description: '发布第一篇文章',
      condition: `发布 ${s.articleCount} 篇文章`,
      unlocked: s.articleCount >= 1
    },
    {
      id: 'like_10',
      name: '获赞达人',
      icon: '👍',
      description: '累计获得 10 个赞',
      condition: `获得 ${s.likeCount} 个赞`,
      unlocked: s.likeCount >= 10
    },
    {
      id: 'like_50',
      name: '人气之星',
      icon: '⭐',
      description: '累计获得 50 个赞',
      condition: `获得 ${s.likeCount} 个赞`,
      unlocked: s.likeCount >= 50
    },
    {
      id: 'follower_10',
      name: '受欢迎',
      icon: '🎉',
      description: '粉丝数达到 10',
      condition: `${currentUser.value?.followers || 0} 个粉丝`,
      unlocked: (currentUser.value?.followers || 0) >= 10
    },
    {
      id: 'view_1000',
      name: '内容创作者',
      icon: '📊',
      description: '回答总浏览量达到 1000',
      condition: `${s.totalAnswerViews} 次浏览`,
      unlocked: s.totalAnswerViews >= 1000
    }
  ]
})

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
