<template>
  <div class="max-w-4xl mx-auto">
    <div class="card">
      <!-- 头部 -->
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">专栏</h1>
        <button
          v-if="userStore.isLoggedIn"
          @click="showCreateColumnModal = true"
          class="btn-primary text-sm"
        >
          + 创建专栏
        </button>
      </div>

      <!-- Tab 切换 -->
      <div class="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
        <button
          @click="activeTab = 'latest'"
          :class="[
            'flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors',
            activeTab === 'latest' ? 'bg-white dark:bg-gray-800 text-zhihu-blue shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900'
          ]"
        >
          最新文章
        </button>
        <button
          @click="activeTab = 'my'"
          :class="[
            'flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors',
            activeTab === 'my' ? 'bg-white dark:bg-gray-800 text-zhihu-blue shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900'
          ]"
        >
          我的专栏
        </button>
      </div>

      <!-- 最新文章列表 -->
      <div v-if="activeTab === 'latest'" class="space-y-4">
        <div v-if="latestArticles.length > 0">
          <div
            v-for="article in latestArticles"
            :key="article.id"
            class="border-b border-gray-100 dark:border-gray-700 pb-4 last:border-0"
          >
            <router-link :to="`/article/${article.id}`">
              <h3 class="font-bold text-gray-900 dark:text-white mb-2 hover:text-zhihu-blue">
                {{ article.title }}
              </h3>
              <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                {{ article.content.replace(/<[^>]+>/g, '').slice(0, 150) }}...
              </p>
              <div class="flex items-center space-x-4 text-xs text-gray-400">
                <span class="flex items-center">
                  <img
                    :src="getAuthor(article.userId)?.avatar"
                    class="w-4 h-4 rounded-full mr-1"
                  />
                  {{ getAuthor(article.userId)?.username }}
                </span>
                <span>{{ article.likes }} 赞</span>
                <span>{{ article.views }} 阅读</span>
                <span>{{ formatDate(article.createdAt) }}</span>
              </div>
            </router-link>
          </div>
        </div>
        <div v-else class="py-8 text-center text-gray-400">
          暂无文章
        </div>
      </div>

      <!-- 我的专栏列表 -->
      <div v-if="activeTab === 'my'" class="space-y-4">
        <div v-if="myColumns.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="column in myColumns"
            :key="column.id"
            class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
            @click="$router.push(`/column/${column.id}`)"
          >
            <h3 class="font-bold text-gray-900 dark:text-white mb-2">{{ column.name }}</h3>
            <p v-if="column.description" class="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {{ column.description }}
            </p>
            <div class="flex items-center space-x-4 text-xs text-gray-400">
              <span>{{ column.articleCount }} 篇文章</span>
              <span>{{ column.followerCount }} 关注</span>
            </div>
          </div>
        </div>
        <div v-else class="py-8 text-center text-gray-400">
          还没有创建专栏
        </div>
      </div>
    </div>

    <!-- 创建专栏弹窗 -->
    <div v-if="showCreateColumnModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4">创建专栏</h2>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">专栏名称</label>
            <input
              v-model="columnForm.name"
              type="text"
              class="input-field"
              placeholder="给你的专栏起个名字"
              maxlength="50"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">专栏简介</label>
            <textarea
              v-model="columnForm.description"
              rows="3"
              class="input-field"
              placeholder="简要介绍你的专栏"
              maxlength="200"
            ></textarea>
          </div>
        </div>
        <div class="flex justify-end space-x-3 mt-6">
          <button @click="showCreateColumnModal = false" class="btn-outline">取消</button>
          <button
            @click="handleCreateColumn"
            :disabled="!columnForm.name.trim()"
            class="btn-primary"
          >
            创建
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useColumnStore } from '../stores/column'
import { useUserStore } from '../stores/user'

const columnStore = useColumnStore()
const userStore = useUserStore()

const activeTab = ref('latest')
const showCreateColumnModal = ref(false)
const columnForm = ref({
  name: '',
  description: ''
})

const latestArticles = computed(() => columnStore.latestArticles)
const myColumns = computed(() => columnStore.myColumns)

function getAuthor(userId) {
  return userStore.getUserById(userId)
}

function handleCreateColumn() {
  if (!columnForm.value.name.trim()) return

  columnStore.createColumn(columnForm.value.name, columnForm.value.description)
  columnForm.value = { name: '', description: '' }
  showCreateColumnModal.value = false
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now - date
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) return '今天'
  if (days === 1) return '昨天'
  if (days < 7) return `${days} 天前`
  return date.toLocaleDateString('zh-CN')
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
