<template>
  <div class="max-w-4xl mx-auto">
    <div class="card">
      <!-- 头部 -->
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-900 flex items-center">
          <svg class="w-7 h-7 mr-2 text-red-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.66 11.2C17.43 10.9 17.15 10.64 16.89 10.38C16.22 9.78 15.46 9.35 14.82 8.72C13.33 7.26 13 4.85 13.95 3C13 3.23 12.17 3.75 11.46 4.32C8.87 6.4 7.85 10.07 9.07 13.22C9.11 13.32 9.15 13.42 9.15 13.55C9.15 13.77 9 13.97 8.8 14.05C8.57 14.15 8.33 14.09 8.14 13.93C8.08 13.88 8.04 13.83 8 13.76C6.87 12.33 6.69 10.28 7.45 8.64C5.78 10 4.87 12.3 5 14.47C5.06 14.97 5.12 15.47 5.29 15.97C5.43 16.57 5.7 17.17 6 17.7C7.08 19.43 8.95 20.67 10.96 20.92C13.1 21.19 15.39 20.8 17.03 19.32C18.86 17.66 19.5 15 18.56 12.72L18.43 12.46C18.22 12 17.66 11.2 17.66 11.2Z" />
          </svg>
          知乎热榜
        </h1>
        <button
          @click="refreshHotList"
          :disabled="refreshing"
          class="flex items-center space-x-1 text-sm text-gray-500 hover:text-zhihu-blue transition-colors"
        >
          <svg
            class="w-4 h-4"
            :class="{ 'animate-spin': refreshing }"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>{{ refreshing ? '更新中...' : '刷新' }}</span>
        </button>
      </div>

      <!-- 热榜列表 -->
      <div v-if="hotQuestions.length > 0" class="space-y-4">
        <div
          v-for="(question, index) in hotQuestions"
          :key="question.id"
          class="group"
        >
          <router-link
            :to="`/question/${question.id}`"
            class="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <!-- 排名 -->
            <div
              :class="[
                'flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-lg font-bold',
                index < 3 ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'
              ]"
            >
              {{ index + 1 }}
            </div>

            <!-- 问题内容 -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center space-x-2 mb-1">
                <!-- 热榜标签 -->
                <span
                  v-if="getHotBadge(question)"
                  :class="[
                    'text-xs px-2 py-0.5 rounded text-white',
                    getHotBadge(question).color
                  ]"
                >
                  {{ getHotBadge(question).text }}
                </span>

                <!-- 热度值 -->
                <span class="text-xs text-gray-400">{{ formatHeat(question.heat) }} 热度</span>
              </div>

              <!-- 标题 -->
              <h3 class="text-base font-medium text-gray-900 group-hover:text-zhihu-blue transition-colors line-clamp-2">
                {{ question.title }}
              </h3>

              <!-- 摘要 -->
              <p class="text-sm text-gray-500 mt-1 line-clamp-2">
                {{ question.content }}
              </p>

              <!-- 元数据 -->
              <div class="flex items-center space-x-4 mt-2 text-xs text-gray-400">
                <span>{{ getAnswerCount(question.id) }} 回答</span>
                <span>{{ question.views || 0 }} 浏览</span>
                <span>{{ formatDate(question.createdAt) }}</span>
              </div>

              <!-- 标签 -->
              <div v-if="question.tags && question.tags.length > 0" class="flex flex-wrap gap-2 mt-2">
                <span
                  v-for="tag in question.tags"
                  :key="tag"
                  class="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded"
                >
                  {{ tag }}
                </span>
              </div>
            </div>

            <!-- 热度趋势图标（前三名） -->
            <div v-if="index < 3" class="flex-shrink-0">
              <svg class="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
            </div>
          </router-link>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="py-16 text-center">
        <svg class="w-20 h-20 mx-auto mb-4 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
        <p class="text-gray-400 mb-2">暂无热榜</p>
        <p class="text-sm text-gray-300">问题太少，无法生成热榜</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useHotListStore } from '../stores/hotList'
import { useQuestionStore } from '../stores/question'

const hotListStore = useHotListStore()
const questionStore = useQuestionStore()

const refreshing = ref(false)

const hotQuestions = computed(() => hotListStore.hotQuestions)

function getHotBadge(question) {
  return hotListStore.getHotBadge(question)
}

function getAnswerCount(questionId) {
  return questionStore.getAnswersByQuestionId(questionId).length
}

function formatHeat(heat) {
  if (heat >= 10000) {
    return `${(heat / 10000).toFixed(1)}w`
  } else if (heat >= 1000) {
    return `${(heat / 1000).toFixed(1)}k`
  }
  return heat.toString()
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

async function refreshHotList() {
  refreshing.value = true
  await new Promise(resolve => setTimeout(resolve, 500)) // 模拟网络延迟
  hotListStore.mockHotListUpdate()
  refreshing.value = false
}

onMounted(() => {
  refreshHotList()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp:2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
