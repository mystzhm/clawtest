<template>
  <div class="flex gap-6">
    <!-- 左侧分类 -->
    <aside class="hidden lg:block w-48 flex-shrink-0">
      <div class="card sticky top-20">
        <h3 class="font-bold text-gray-900 mb-3">话题分类</h3>
        <ul class="space-y-2">
          <li v-for="tag in popularTags" :key="tag">
            <a href="#" class="text-gray-600 hover:text-zhihu-blue text-sm">{{ tag }}</a>
          </li>
        </ul>
      </div>
    </aside>

    <!-- 主内容 -->
    <main class="flex-1">
      <!-- Tab -->
      <div class="card flex space-x-6 border-b pb-3 mb-4">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          @click="activeTab = tab.key"
          :class="[
            'text-sm font-medium pb-2 border-b-2 transition-colors',
            activeTab === tab.key
              ? 'text-zhihu-blue border-zhihu-blue'
              : 'text-gray-500 border-transparent hover:text-gray-900'
          ]"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- 问题列表 -->
      <div class="space-y-4">
        <QuestionCard
          v-for="question in displayQuestions"
          :key="question.id"
          :question="question"
        />
      </div>

      <div v-if="displayQuestions.length === 0" class="text-center text-gray-500 py-12">
        暂无问题，来提出第一个问题吧！
      </div>
    </main>

    <!-- 右侧推荐 -->
    <aside class="hidden xl:block w-72 flex-shrink-0">
      <div class="card sticky top-20">
        <h3 class="font-bold text-gray-900 mb-3">热门问题</h3>
        <ul class="space-y-3">
          <li v-for="(q, idx) in hotQuestions" :key="q.id">
            <router-link :to="`/question/${q.id}`" class="flex items-start space-x-2 group">
              <span class="text-xs font-bold text-gray-400 mt-1">{{ idx + 1 }}</span>
              <span class="text-sm text-gray-700 group-hover:text-zhihu-blue line-clamp-2">{{ q.title }}</span>
            </router-link>
          </li>
        </ul>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuestionStore } from '../stores/question'
import QuestionCard from '../components/question/QuestionCard.vue'

const questionStore = useQuestionStore()

const tabs = [
  { key: 'recommend', label: '推荐' },
  { key: 'following', label: '关注' },
  { key: 'hot', label: '热门' }
]

const activeTab = ref('recommend')
const popularTags = ['前端开发', '后端', '人工智能', '职场', '生活', '科技', '教育', '创业']

const displayQuestions = computed(() => {
  let questions = [...questionStore.sortedQuestions]
  if (activeTab.value === 'hot') {
    return questions.sort((a, b) => b.views - a.views)
  }
  return questions
})

const hotQuestions = computed(() => {
  return [...questionStore.questions].sort((a, b) => b.views - a.views).slice(0, 5)
})
</script>
