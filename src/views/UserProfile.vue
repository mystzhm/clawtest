<template>
  <div class="max-w-4xl mx-auto">
    <div class="card">
      <div class="flex items-start space-x-6">
        <img :src="user?.avatar" class="w-24 h-24 rounded-full" />
        <div class="flex-1">
          <h1 class="text-2xl font-bold text-gray-900">{{ user?.username }}</h1>
          <p class="text-gray-600 mt-2">{{ user?.bio || '这个人很懒，什么都没写...' }}</p>
          <div class="flex items-center space-x-6 mt-4 text-sm text-gray-500">
            <span>{{ user?.followers }} 关注者</span>
            <span>{{ user?.following }} 关注中</span>
            <span>加入于 {{ formatDate(user?.createdAt) }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-6">
      <h2 class="text-lg font-bold text-gray-900 mb-4">TA 的提问</h2>
      <QuestionCard
        v-for="question in userQuestions"
        :key="question.id"
        :question="question"
      />
      <div v-if="userQuestions.length === 0" class="card text-center text-gray-500">
        暂无提问
      </div>
    </div>

    <div class="mt-6">
      <h2 class="text-lg font-bold text-gray-900 mb-4">TA 的回答</h2>
      <div v-for="answer in userAnswers" :key="answer.id" class="card">
        <router-link :to="`/question/${answer.questionId}`" class="text-zhihu-blue hover:underline text-sm">
          查看原问题
        </router-link>
        <p class="text-gray-700 mt-2 line-clamp-3">{{ answer.content }}</p>
        <p class="text-sm text-gray-500 mt-2">{{ answer.likes }} 赞同</p>
      </div>
      <div v-if="userAnswers.length === 0" class="card text-center text-gray-500">
        暂无回答
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '../stores/user'
import { useQuestionStore } from '../stores/question'
import QuestionCard from '../components/question/QuestionCard.vue'

const route = useRoute()
const userStore = useUserStore()
const questionStore = useQuestionStore()

const user = ref(null)

const userQuestions = computed(() => {
  return questionStore.questions.filter(q => q.authorId === user.value?.id)
})

const userAnswers = computed(() => {
  return questionStore.answers.filter(a => a.authorId === user.value?.id)
})

onMounted(() => {
  user.value = userStore.getUserById(route.params.id)
})

function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN')
}
</script>
