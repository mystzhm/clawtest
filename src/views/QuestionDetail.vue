<template>
  <div class="max-w-4xl mx-auto">
    <!-- 问题 -->
    <div class="card">
      <h1 class="text-2xl font-bold text-gray-900 mb-4">{{ question?.title }}</h1>
      <p class="text-gray-700 mb-4 whitespace-pre-wrap">{{ question?.content }}</p>
      <div class="flex items-center justify-between text-sm text-gray-500">
        <div class="flex items-center space-x-4">
          <router-link :to="`/user/${author?.id}`" class="flex items-center space-x-2 hover:text-zhihu-blue">
            <img :src="author?.avatar" class="w-6 h-6 rounded-full" />
            <span>{{ author?.username }}</span>
          </router-link>
          <span>{{ formatDate(question?.createdAt) }}</span>
        </div>
        <span>{{ question?.views }} 浏览</span>
      </div>
      <div class="flex flex-wrap gap-2 mt-4">
        <span
          v-for="tag in question?.tags"
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

const author = computed(() => {
  return userStore.getUserById(question.value?.authorId)
})

onMounted(() => {
  loadQuestion()
})

function loadQuestion() {
  const id = route.params.id
  question.value = questionStore.getQuestionById(id)
  if (question.value) {
    questionStore.incrementViews(id)
    answers.value = questionStore.getAnswersByQuestionId(id)
  }
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
  return date.toLocaleDateString('zh-CN')
}
</script>
