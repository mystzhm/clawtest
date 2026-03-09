<template>
  <div class="max-w-4xl mx-auto">
    <!-- 404 提示 -->
    <div v-if="notFound" class="card text-center py-16">
      <svg class="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <h2 class="text-2xl font-bold text-gray-900 mb-2">问题不存在</h2>
      <p class="text-gray-500 mb-6">该问题可能已被删除或从未存在</p>
      <router-link to="/" class="btn-primary">返回首页</router-link>
    </div>

    <!-- 问题内容 -->
    <template v-else-if="question">
      <div class="card">
        <h1 class="text-2xl font-bold text-gray-900 mb-4">{{ question.title }}</h1>
        <p class="text-gray-700 mb-4 whitespace-pre-wrap">{{ question.content }}</p>
        <div class="flex items-center justify-between text-sm text-gray-500">
          <div class="flex items-center space-x-4">
            <router-link :to="`/user/${author?.id}`" class="flex items-center space-x-2 hover:text-zhihu-blue">
              <img :src="author?.avatar" class="w-6 h-6 rounded-full" />
              <span>{{ author?.username }}</span>
            </router-link>
            <span>{{ formatDate(question.createdAt) }}</span>
          </div>
          <span>{{ question.views }} 浏览</span>
        </div>
        <div class="flex flex-wrap gap-2 mt-4">
          <span
            v-for="tag in question.tags"
            :key="tag"
            class="text-xs bg-blue-50 text-zhihu-blue px-2 py-1 rounded"
          >
            {{ tag }}
          </span>
        </div>
      </div>

      <!-- 回答 -->
      <div class="mt-6">
        <h2 class="text-lg font-bold text-gray-900 mb-4">{{ answers.length }} 个回答</h2>

        <!-- 写回答 -->
        <div v-if="userStore.isLoggedIn" class="card">
          <textarea
            v-model="newAnswer"
            rows="4"
            placeholder="写下你的回答..."
            class="input-field"
          ></textarea>
          <div class="flex justify-end mt-3">
            <button @click="submitAnswer" :disabled="!newAnswer.trim()" class="btn-primary">
              发布回答
            </button>
          </div>
        </div>
        <div v-else class="card text-center text-gray-500">
          <router-link to="/login" class="text-zhihu-blue hover:underline">登录</router-link> 后参与回答
        </div>

        <!-- 回答列表 -->
        <AnswerCard
          v-for="answer in answers"
          :key="answer.id"
          :answer="answer"
        />
      </div>
    </template>

    <!-- 加载中 -->
    <div v-else class="card text-center py-12">
      <p class="text-gray-500">加载中...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useQuestionStore } from '../stores/question'
import { useUserStore } from '../stores/user'
import AnswerCard from '../components/answer/AnswerCard.vue'

const route = useRoute()
const questionStore = useQuestionStore()
const userStore = useUserStore()

const question = ref(null)
const answers = ref([])
const newAnswer = ref('')
const notFound = ref(false)

const author = computed(() => {
  return userStore.getUserById(question.value?.authorId)
})

onMounted(() => {
  loadQuestion()
})

function loadQuestion() {
  const id = route.params.id
  question.value = questionStore.getQuestionById(id)
  
  if (!question.value) {
    notFound.value = true
    return
  }
  
  questionStore.incrementViews(id)
  answers.value = questionStore.getAnswersByQuestionId(id)
}

function submitAnswer() {
  if (!newAnswer.value.trim()) return
  questionStore.createAnswer(question.value.id, newAnswer.value)
  newAnswer.value = ''
  answers.value = questionStore.getAnswersByQuestionId(question.value.id)
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
