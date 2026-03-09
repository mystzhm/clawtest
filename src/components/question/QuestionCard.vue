<template>
  <div class="card hover:shadow-md transition-shadow cursor-pointer" @click="goToDetail">
    <h3 class="text-lg font-bold text-gray-900 mb-2 hover:text-zhihu-blue">
      {{ question.title }}
    </h3>
    <p class="text-gray-600 text-sm mb-3 line-clamp-2">{{ question.content }}</p>

    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-4 text-sm text-gray-500">
        <span>{{ answerCount }} 回答</span>
        <span>{{ question.views }} 浏览</span>
      </div>
      <div class="flex flex-wrap gap-2">
        <span
          v-for="tag in question.tags"
          :key="tag"
          class="text-xs bg-blue-50 text-zhihu-blue px-2 py-1 rounded"
        >
          {{ tag }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuestionStore } from '../../stores/question'

const props = defineProps({
  question: {
    type: Object,
    required: true
  }
})

const router = useRouter()
const questionStore = useQuestionStore()

const answerCount = computed(() => {
  return questionStore.answers.filter(a => a.questionId === props.question.id).length
})

function goToDetail() {
  router.push(`/question/${props.question.id}`)
}
</script>
