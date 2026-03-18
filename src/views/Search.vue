<template>
  <div class="max-w-3xl mx-auto">
    <div class="card">
      <!-- 搜索框 -->
      <div class="flex items-center space-x-3 mb-6">
        <div class="flex-1 relative">
          <input
            v-model="searchKeyword"
            @input="handleInput"
            @keyup.enter="handleSearch"
            type="text"
            :placeholder="placeholder"
            class="input-field pr-12"
          />
          <button
            @click="handleSearch"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-zhihu-blue"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
        <button
          @click="clearSearch"
          class="text-gray-400 hover:text-gray-600"
        >
          清空
        </button>
      </div>

      <!-- 搜索类型切换 -->
      <div class="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
        <button
          v-for="type in searchTypes"
          :key="type.key"
          @click="searchType = type.key"
          :class="[
            'flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors',
            searchType === type.key
              ? 'bg-white dark:bg-gray-800 text-zhihu-blue shadow-sm'
              : 'text-gray-600 dark:text-gray-300'
          ]"
        >
          {{ type.label }}
        </button>
      </div>

      <!-- 搜索建议 -->
      <div v-if="showSuggestions && suggestions.length > 0" class="mb-4 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div
          v-for="suggestion in suggestions"
          :key="suggestion"
          @click="searchKeyword = suggestion; handleSearch()"
          class="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded cursor-pointer"
        >
          {{ suggestion }}
        </div>
      </div>

      <!-- 搜索结果 -->
      <div v-if="hasSearched" class="space-y-4">
        <!-- 无结果 -->
        <div v-if="results.length === 0" class="py-8 text-center">
          <svg class="w-16 h-16 mx-auto mb-4 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p class="text-gray-400">没有找到相关{{ searchType === 'questions' ? '问题' : searchType === 'topics' ? '话题' : searchType === 'users' ? '用户' : '内容' }}</p>
        </div>

        <!-- 搜索结果列表 -->
        <div v-else>
          <!-- 问题结果 -->
          <div v-if="searchType === 'questions'">
            <div
              v-for="item in results"
              :key="item.id"
              class="border-b border-gray-100 dark:border-gray-700 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              @click="router.push(`/question/${item.id}`)"
            >
              <h3 class="font-medium text-gray-900 dark:text-white mb-2 hover:text-zhihu-blue">
                <span v-html="highlightKeyword(item.title)"></span>
              </h3>
              <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {{ item.content }}
              </p>
              <div class="flex items-center space-x-4 text-xs text-gray-400 mt-2">
                <span>{{ item.views || 0 }} 浏览</span>
                <span>{{ formatDate(item.createdAt) }}</span>
              </div>
            </div>
          </div>

          <!-- 话题结果 -->
          <div v-if="searchType === 'topics'">
            <div
              v-for="item in results"
              :key="item.id"
              class="border-b border-gray-100 dark:border-gray-700 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              @click="router.push(`/topic/${item.id}`)"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <h3 class="font-medium text-gray-900 dark:text-white mb-2 hover:text-zhihu-blue">
                    <span v-html="highlightKeyword(item.name)"></span>
                  </h3>
                  <p v-if="item.description" class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {{ item.description }}
                  </p>
                </div>
                <button
                  @click.stop="toggleFollow(item.id)"
                  :class="[
                    'px-3 py-1 rounded-full text-sm transition-colors',
                    item.isFollowing ? 'bg-gray-100 dark:bg-gray-700 text-gray-600' : 'bg-zhihu-blue text-white'
                  ]"
                >
                  {{ item.isFollowing ? '已关注' : '关注' }}
                </button>
              </div>
              <div class="flex items-center space-x-4 text-xs text-gray-400 mt-2">
                <span>{{ item.questionCount || 0 }} 问题</span>
                <span>{{ item.followerCount || 0 }} 关注</span>
              </div>
            </div>
          </div>

          <!-- 用户结果 -->
          <div v-if="searchType === 'users'">
            <div
              v-for="item in results"
              :key="item.id"
              class="border-b border-gray-100 dark:border-gray-700 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              @click="router.push(`/user/${item.id}`)"
            >
              <div class="flex items-center space-x-3">
                <img :src="item.avatar" class="w-12 h-12 rounded-full" />
                <div class="flex-1">
                  <h3 class="font-medium text-gray-900 dark:text-white mb-1">
                    <span v-html="highlightKeyword(item.username)"></span>
                  </h3>
                  <p v-if="item.bio" class="text-sm text-gray-500 line-clamp-1">{{ item.bio }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- 加载更多 -->
          <div v-if="hasMoreResults" class="text-center py-4">
            <button
              @click="loadMore"
              :disabled="loading"
              class="text-zhihu-blue hover:underline text-sm"
            >
              {{ loading ? '加载中...' : '加载更多' }}
            </button>
          </div>
        </div>
      </div>

      <!-- 热门搜索 -->
      <div v-if="!hasSearched" class="mt-6">
        <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-4">热门搜索</h2>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="keyword in hotSearches"
            :key="keyword"
            @click="searchKeyword = keyword; handleSearch()"
            class="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            {{ keyword }}
          </button>
        </div>
      </div>

      <!-- 搜索历史 -->
      <div v-if="!hasSearched && searchStore.searchHistory.length > 0" class="mt-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-bold text-gray-900 dark:text-white">搜索历史</h2>
          <button
            @click="searchStore.clearHistory"
            class="text-sm text-gray-400 hover:text-gray-600"
          >
            清空
          </button>
        </div>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="keyword in searchStore.searchHistory.slice(0, 10)"
            :key="keyword"
            @click="searchKeyword = keyword; handleSearch()"
            class="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center space-x-2"
          >
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ keyword }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuestionStore } from '../stores/question'
import { useTopicStore } from '../stores/topic'
import { useUserStore } from '../stores/user'
import { useSearchStore } from '../stores/search'

const router = useRouter()
const route = useRoute()
const questionStore = useQuestionStore()
const topicStore = useTopicStore()
const userStore = useUserStore()
const searchStore = useSearchStore()

const searchKeyword = ref('')
const searchType = ref('questions')
const hasSearched = ref(false)
const results = ref([])
const loading = ref(false)
const showSuggestions = ref(false)

const searchTypes = [
  { key: 'questions', label: '问题' },
  { key: 'topics', label: '话题' },
  { key: 'users', label: '用户' }
]

const placeholder = computed(() => {
  const placeholders = {
    questions: '搜索问题...',
    topics: '搜索话题...',
    users: '搜索用户...'
  }
  return placeholders[searchType.value] || '搜索...'
})

const suggestions = computed(() => {
  return searchStore.getSuggestions(searchKeyword.value)
})

const hotSearches = computed(() => {
  return searchStore.hotSearches
})

const hasMoreResults = ref(false)

onMounted(() => {
  // 从 URL 获取搜索关键词
  const query = route.query.q
  if (query) {
    searchKeyword.value = query
    handleSearch()
  }
})

function handleInput() {
  if (searchKeyword.value.trim()) {
    showSuggestions.value = true
  } else {
    showSuggestions.value = false
  }
}

function handleSearch() {
  if (!searchKeyword.value.trim()) return

  hasSearched.value = true
  showSuggestions.value = false
  searchStore.addToHistory(searchKeyword.value.trim())

  loading.value = true
  results.value = []

  // 根据搜索类型获取结果
  if (searchType.value === 'questions') {
    results.value = questionStore.searchQuestions(searchKeyword.value)
  } else if (searchType.value === 'topics') {
    results.value = topicStore.searchTopics(searchKeyword.value)
  } else if (searchType.value === 'users') {
    results.value = userStore.users.filter(u =>
      u.username.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      u.bio?.toLowerCase().includes(searchKeyword.value.toLowerCase())
    ).map(u => ({
      ...u,
      isFollowing: userStore.isFollowing(u.id)
    }))
  }

  // 模拟加载延迟
  setTimeout(() => {
    loading.value = false
  }, 300)
}

function clearSearch() {
  searchKeyword.value = ''
  hasSearched.value = false
  results.value = []
  showSuggestions.value = false
}

function highlightKeyword(text) {
  if (!searchKeyword.value || !text) return text
  const keyword = searchKeyword.value.trim()
  const regex = new RegExp(`(${keyword})`, 'gi')
  return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-600 px-1 rounded">$1</mark>')
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN')
}

function toggleFollow(topicId) {
  if (!userStore.isLoggedIn) {
    alert('请先登录')
    return
  }

  if (topicStore.isFollowing(topicId)) {
    topicStore.unfollowTopic(topicId)
  } else {
    topicStore.followTopic(topicId)
  }

  // 刷新结果
  handleSearch()
}

function loadMore() {
  // 模拟加载更多
  loading.value = true
  setTimeout(() => {
    loading.value = false
    hasMoreResults.value = false
  }, 500)
}
</script>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
