<template>
  <div class="max-w-4xl mx-auto">
    <!-- 话题信息 -->
    <div v-if="topic" class="card mb-6">
      <div class="flex items-start justify-between mb-4">
        <div class="flex-1">
          <div class="flex items-center space-x-3 mb-3">
            <div class="w-16 h-16 rounded-full bg-zhihu-blue/10 flex items-center justify-center text-2xl font-bold text-zhihu-blue">
              {{ topic.name?.charAt(0) }}
            </div>
            <div>
              <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ topic.name }}</h1>
              <p v-if="topic.description" class="text-sm text-gray-500 mt-1">{{ topic.description }}</p>
            </div>
          </div>
          <div class="flex items-center space-x-4 text-sm text-gray-400">
            <span>{{ topic.followerCount || 0 }} 关注</span>
            <span>{{ questionCount }} 问题</span>
            <span>{{ articleCount }} 文章</span>
          </div>
        </div>
        <button
          @click="handleFollow"
          :class="[
            'px-6 py-2 rounded-full font-medium',
            topicStore.isFollowing(topic.id) ? 'bg-gray-100 text-gray-600' : 'bg-zhihu-blue text-white'
          ]"
        >
          {{ topicStore.isFollowing(topic.id) ? '已关注' : '关注' }}
        </button>
      </div>
    </div>

    <!-- Tab 切换 -->
    <div class="flex space-x-1 mb-4 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
      <button
        @click="activeTab = 'questions'"
        :class="[
          'flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors',
          activeTab === 'questions' ? 'bg-white dark:bg-gray-800 text-zhihu-blue shadow-sm' : 'text-gray-600 dark:text-gray-300'
        ]"
      >
        问题 {{ questionCount }}
      </button>
      <button
        @click="activeTab = 'articles'"
        :class="[
          'flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors',
          activeTab === 'articles' ? 'bg-white dark:bg-gray-800 text-zhihu-blue shadow-sm' : 'text-gray-600 dark:text-gray-300'
        ]"
      >
        文章 {{ articleCount }}
      </button>
      <button
        @click="activeTab = 'discussion'"
        :class="[
          'flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors',
          activeTab === 'discussion' ? 'bg-white dark:bg-gray-800 text-zhihu-blue shadow-sm' : 'text-gray-600 dark:text-gray-300'
        ]"
      >
        讨论
      </button>
    </div>

    <!-- 内容列表 -->
    <div>
      <!-- 问题列表 -->
      <div v-if="activeTab === 'questions'">
        <div v-if="questions.length > 0" class="space-y-4">
          <div
            v-for="question in questions"
            :key="question.id"
            class="border-b border-gray-100 dark:border-gray-700 pb-4"
          >
            <router-link :to="`/question/${question.id}`">
              <h3 class="font-medium text-gray-900 dark:text-white mb-2 hover:text-zhihu-blue">
                {{ question.title }}
              </h3>
              <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{{ question.content }}</p>
              <div class="flex items-center space-x-4 text-xs text-gray-400 mt-2">
                <span>{{ question.views || 0 }} 浏览</span>
                <span>{{ question.answerCount || 0 }} 回答</span>
                <span>{{ formatDate(question.createdAt) }}</span>
              </div>
            </router-link>
          </div>
        </div>
        <div v-else class="py-8 text-center text-gray-400">
          该话题下还没有问题
        </div>
      </div>

      <!-- 文章列表 -->
      <div v-if="activeTab === 'articles'">
        <div v-if="articles.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="article in articles"
            :key="article.id"
            class="card cursor-pointer hover:shadow-md transition-shadow"
            @click="$router.push(`/article/${article.id}`)"
          >
            <h3 class="font-medium text-gray-900 dark:text-white mb-2 hover:text-zhihu-blue">
              {{ article.title }}
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">{{ article.content.replace(/<[^>]+>/g, '') }}</p>
            <div class="flex items-center space-x-4 text-xs text-gray-400 mt-2">
              <span class="flex items-center">
                <svg class="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {{ article.likes }}
              </span>
              <span>{{ article.views || 0 }} 阅读</span>
              <span>{{ formatDate(article.createdAt) }}</span>
            </div>
          </div>
        </div>
        <div v-else class="py-8 text-center text-gray-400">
          该话题下还没有文章
        </div>
      </div>

      <!-- 讨论区 -->
      <div v-if="activeTab === 'discussion'">
        <div class="space-y-4">
          <div
            v-for="item in discussions"
            :key="item.id"
            class="border-b border-gray-100 dark:border-gray-700 pb-4"
          >
            <div class="flex items-start space-x-3">
              <img :src="getUser(item.userId)?.avatar" class="w-10 h-10 rounded-full" />
              <div class="flex-1">
                <div class="flex items-center space-x-2 mb-1">
                  <router-link :to="`/user/${item.userId}`" class="font-medium text-gray-900 dark:text-white hover:text-zhihu-blue">
                    {{ getUser(item.userId)?.username }}
                  </router-link>
                  <span class="text-xs text-gray-400">{{ formatDate(item.createdAt) }}</span>
                </div>
                <p class="text-sm text-gray-600 dark:text-gray-400">{{ item.content }}</p>
                <div class="flex items-center space-x-4 mt-2">
                  <button class="text-xs text-gray-400 hover:text-zhihu-blue">点赞</button>
                  <button class="text-xs text-gray-400 hover:text-zhihu-blue">回复</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-if="discussions.length === 0" class="py-8 text-center text-gray-400">
          该话题下还没有讨论
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useTopicStore } from '../stores/topic'
import { useQuestionStore } from '../stores/question'
import { useColumnStore } from '../stores/column'
import { useUserStore } from '../stores/user'

const route = useRoute()
const topicStore = useTopicStore()
const questionStore = useQuestionStore()
const columnStore = useColumnStore()
const userStore = useUserStore()

const activeTab = ref('questions')

const topic = computed(() => topicStore.getTopicById(route.params.id))
const questions = computed(() => topicStore.getQuestionsByTopic(topic.value?.name))
const articles = computed(() => topicStore.getArticlesByTopic(topic.value?.name))

const questionCount = computed(() => questions.value.length)
const articleCount = computed(() => articles.value.length)

// 模拟讨论数据
const discussions = computed(() => {
  // 模拟一些讨论内容
  return [
    {
      id: '1',
      userId: '1',
      content: '这个话题很有趣，希望能了解更多！',
      createdAt: new Date(Date.now() - 86400000).toISOString() // 1天前
    },
    {
      id: '2',
      userId: '2',
      content: '我也在学习这个，一起加油！',
      createdAt: new Date(Date.now() - 172800000).toISOString() // 2天前
    }
  ]
})

function handleFollow() {
  if (!userStore.isLoggedIn) {
    alert('请先登录')
    return
  }

  if (topicStore.isFollowing(topic.value.id)) {
    topicStore.unfollowTopic(topic.value.id)
  } else {
    topicStore.followTopic(topic.value.id)
  }
}

function getUser(userId) {
  return userStore.getUserById(userId)
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now - date
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60))
    if (hours === 0) {
      const minutes = Math.floor(diff / (1000 * 60))
      return minutes <= 1 ? '刚刚' : `${minutes} 分钟前`
    }
    return `${hours} 小时前`
  } else if (days < 7) {
    return `${days} 天前`
  } else {
    return date.toLocaleDateString('zh-CN')
  }
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
