<template>
  <div class="card mt-4">
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

    <div class="text-gray-700 whitespace-pre-wrap mb-4">{{ answer.content }}</div>

    <div class="flex items-center space-x-4">
      <button @click="handleLike" class="flex items-center space-x-1 text-gray-500 hover:text-zhihu-blue">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
        </svg>
        <span>{{ answer.likes }}</span>
      </button>
      <button @click="handleDislike" class="flex items-center space-x-1 text-gray-500 hover:text-red-500">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
        </svg>
        <span>{{ answer.dislikes }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useUserStore } from '../../stores/user'
import { useQuestionStore } from '../../stores/question'

const props = defineProps({
  answer: {
    type: Object,
    required: true
  }
})

const userStore = useUserStore()
const questionStore = useQuestionStore()

const author = computed(() => {
  return userStore.getUserById(props.answer.authorId)
})

function handleLike() {
  questionStore.likeAnswer(props.answer.id)
}

function handleDislike() {
  questionStore.dislikeAnswer(props.answer.id)
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN')
}
</script>
