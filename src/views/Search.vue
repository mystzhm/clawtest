<template>
  <div class="max-w-4xl mx-auto">
    <div class="mb-6">
      <h2 class="text-xl font-bold text-gray-900">
        搜索结果: "{{ keyword }}"
        <span class="text-sm font-normal text-gray-500 ml-2">{{ results.length }} 个结果</span>
      </h2>
    </div>

    <!-- 搜索结果列表 -->
    <div class="space-y-4">
      <div
        v-for="question in results"
        :key="question.id"
        class="card hover:shadow-md transition-shadow cursor-pointer"
        @click="goToDetail(question.id)"
      >
        <!-- 标题高亮 -->
        <h3
          class="text-lg font-bold text-gray-900 mb-2 hover:text-zhihu-blue"
          v-html="highlightedTitle(question.title)"
        ></h3>
        
        <!-- 内容摘要高亮 -->
        <p
          class="text-gray-600 text-sm mb-3 line-clamp-2"
          v-html="highlightedContent(question.content)"
        ></p>

        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4 text-sm text-gray-500">
            <span>{{ answerCount(question.id) }} 回答</span>
            <span>{{ question.views }} 浏览</span>
          </div>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="tag in question.tags"
              :key="tag"
              :class="[
                'text-xs px-2 py-1 rounded',
                isTagHighlighted(tag) 
                  ? 'bg-yellow-100 text-yellow-800 font-medium' 
                  : 'bg-blue-50 text-zhihu-blue'
              ]"
            >
              {{ tag }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 无结果 -->
    <div v-if="results.length === 0 && keyword" class="card text-center py-12">
      <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <p class="text-gray-500 mb-2">没有找到「{{ keyword }}」相关问题</p>
      <router-link to="/ask" class="text-zhihu-blue hover:underline">提出新问题</router-link>
    </div>

    <!-- 空搜索 -->
    <div v-if="!keyword" class="card text-center py-12">
      <p class="text-gray-500">请输入搜索关键词</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuestionStore } from '../stores/question'
import { useHighlight } from '../composables/useHighlight'

const route = useRoute()
const router = useRouter()
const questionStore = useQuestionStore()
const { highlightKeyword, getSnippet } = useHighlight()

const keyword = computed(() => route.query.q || '')

const results = computed(() => {
  if (!keyword.value) return []
  return questionStore.searchQuestions(keyword.value)
})

function highlightedTitle(title) {
  return highlightKeyword(title, keyword.value)
}

function highlightedContent(content) {
  const snippet = getSnippet(content, keyword.value, 80)
  return highlightKeyword(snippet, keyword.value)
}

function isTagHighlighted(tag) {
  return tag.toLowerCase().includes(keyword.value.toLowerCase())
}

function answerCount(questionId) {
  return questionStore.answers.filter(a => a.questionId === questionId).length
}

function goToDetail(id) {
  router.push(`/question/${id}`)
}
</script>
