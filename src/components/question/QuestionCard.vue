<template>
  <div
    class="card hover:shadow-md transition-all cursor-pointer active:scale-[0.98]"
    @click="goToDetail"
  >
    <!-- 标题 -->
    <h3
      class="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-2 hover:text-zhihu-blue line-clamp-2"
    >
      {{ question.title }}
    </h3>

    <!-- 内容摘要 -->
    <p class="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2 sm:line-clamp-3">
      {{ question.content }}
    </p>

    <!-- 作者信息（移动端显示） -->
    <div class="flex items-center space-x-2 mb-3 sm:hidden">
      <img
        :src="author?.avatar"
        class="w-5 h-5 rounded-full"
        @click.stop="router.push(`/user/${author?.id}`)"
      />
      <span
        class="text-xs text-gray-500"
        @click.stop="router.push(`/user/${author?.id}`)"
      >
        {{ author?.username }}
      </span>
      <span class="text-xs text-gray-400">·</span>
      <span class="text-xs text-gray-400">{{ formatDate(question.createdAt) }}</span>
    </div>

    <!-- 底部信息 -->
    <div class="flex items-center justify-between flex-wrap gap-2">
      <!-- 左侧统计 -->
      <div class="flex items-center space-x-3 sm:space-x-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
        <span class="flex items-center space-x-1">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span>{{ answerCount }} 回答</span>
        </span>
        <span class="flex items-center space-x-1">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <span>{{ question.views || 0 }}</span>
        </span>
      </div>

      <!-- 右侧标签 -->
      <div class="flex flex-wrap gap-1.5 sm:gap-2">
        <span
          v-for="tag in question.tags?.slice(0, 3)"
          :key="tag"
          class="text-xs bg-blue-50 dark:bg-blue-900/20 text-zhihu-blue px-2 py-0.5 sm:py-1 rounded"
        >
          {{ tag }}
        </span>
        <span
          v-if="question.tags?.length > 3"
          class="text-xs text-gray-400"
        >
          +{{ question.tags.length - 3 }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuestionStore } from '../../stores/question'
import { useUserStore } from '../../stores/user'

const props = defineProps({
  question: {
    type: Object,
    required: true
  }
})

const router = useRouter()
const questionStore = useQuestionStore()
const userStore = useUserStore()

const answerCount = computed(() => {
  return questionStore.answers.filter(a => a.questionId === props.question.id).length
})

const author = computed(() => {
  return userStore.getUserById(props.question.authorId)
})

function goToDetail() {
  router.push(`/question/${props.question.id}`)
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now - date
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) return '今天'
  if (days === 1) return '昨天'
  if (days < 7) return `${days}天前`
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

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
