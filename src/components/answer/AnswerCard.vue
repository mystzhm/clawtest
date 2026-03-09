<template>
  <div class="card mt-4">
    <div class="flex items-start justify-between">
      <div class="flex items-start space-x-3 mb-3">
        <router-link :to="`/user/${author?.id}`">
          <img :src="author?.avatar" class="w-10 h-10 rounded-full" />
        </router-link>
        <div>
          <router-link :to="`/user/${author?.id}`" class="font-medium text-gray-900 hover:text-zhihu-blue">
            {{ author?.username }}
          </router-link>
          <p class="text-xs text-gray-500">{{ formatDate(answer.createdAt) }}</p>
        </div>
      </div>
      
      <!-- 作者操作按钮 -->
      <div v-if="isAuthor" class="flex space-x-2">
        <button @click="confirmDelete" class="text-gray-400 hover:text-red-500" title="删除">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>

    <div class="text-gray-700 whitespace-pre-wrap mb-4">{{ answer.content }}</div>

    <div class="flex items-center space-x-4">
      <button 
        @click="handleLike" 
        :class="[
          'flex items-center space-x-1 transition-colors',
          myRating === 'like' ? 'text-zhihu-blue' : 'text-gray-500 hover:text-zhihu-blue'
        ]"
      >
        <svg class="w-5 h-5" :fill="myRating === 'like' ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
        </svg>
        <span>{{ answer.likes }}</span>
      </button>
      <button 
        @click="handleDislike" 
        :class="[
          'flex items-center space-x-1 transition-colors',
          myRating === 'dislike' ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
        ]"
      >
        <svg class="w-5 h-5" :fill="myRating === 'dislike' ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
        </svg>
        <span>{{ answer.dislikes }}</span>
      </button>
    </div>

    <!-- 删除确认弹窗 -->
    <div v-if="showDeleteConfirm" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-sm mx-4">
        <h3 class="text-lg font-bold text-gray-900 mb-2">确认删除</h3>
        <p class="text-gray-600 mb-4">删除后无法恢复，确定要删除这条回答吗？</p>
        <div class="flex justify-end space-x-3">
          <button @click="showDeleteConfirm = false" class="btn-outline">取消</button>
          <button @click="handleDelete" class="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600">删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '../../stores/user'
import { useQuestionStore } from '../../stores/question'

const props = defineProps({
  answer: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['delete'])

const userStore = useUserStore()
const questionStore = useQuestionStore()
const showDeleteConfirm = ref(false)

const author = computed(() => {
  return userStore.getUserById(props.answer.authorId)
})

const isAuthor = computed(() => {
  return userStore.currentUser?.id === props.answer.authorId
})

const myRating = computed(() => {
  return questionStore.getAnswerRating(props.answer.id)
})

function handleLike() {
  questionStore.likeAnswer(props.answer.id)
}

function handleDislike() {
  questionStore.dislikeAnswer(props.answer.id)
}

function confirmDelete() {
  showDeleteConfirm.value = true
}

function handleDelete() {
  showDeleteConfirm.value = false
  emit('delete', props.answer.id)
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
