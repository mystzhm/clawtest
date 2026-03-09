<template>
  <div class="max-w-4xl mx-auto">
    <div class="mb-6">
      <h2 class="text-xl font-bold text-gray-900">
        搜索结果: {{ keyword }}
        <span class="text-sm font-normal text-gray-500 ml-2">{{ results.length }} 个结果</span>
      </h2>
    </div>

    <div class="space-y-4">
      <QuestionCard
        v-for="question in results"
        :key="question.id"
        :question="question"
      />
    </div>

    <div v-if="results.length === 0" class="card text-center text-gray-500">
      没有找到相关问题
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useQuestionStore } from '../stores/question'
import QuestionCard from '../components/question/QuestionCard.vue'

const route = useRoute()
const questionStore = useQuestionStore()

const keyword = computed(() => route.query.q || '')
const results = computed(() => {
  if (!keyword.value) return []
  return questionStore.searchQuestions(keyword.value)
})
</script>
