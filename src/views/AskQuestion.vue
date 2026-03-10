<template>
  <div class="max-w-3xl mx-auto">
    <div class="card">
      <h2 class="text-xl font-bold text-gray-900 mb-6">提出问题</h2>

      <form @submit.prevent="submitQuestion">
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">问题标题</label>
          <input
            v-model="title"
            type="text"
            placeholder="用一句话描述你的问题"
            class="input-field"
            required
            :disabled="isLoading"
          />
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">问题描述</label>
          <textarea
            v-model="content"
            rows="6"
            placeholder="详细描述你的问题，让回答者更好地理解..."
            class="input-field"
            required
            :disabled="isLoading"
          ></textarea>
        </div>

        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">话题标签</label>
          <input
            v-model="tags"
            type="text"
            placeholder="用逗号分隔，如：前端, Vue, JavaScript"
            class="input-field"
            :disabled="isLoading"
          />
          <p class="text-xs text-gray-500 mt-1">添加标签让问题更容易被发现</p>
        </div>

        <p v-if="error" class="text-red-500 text-sm mb-4">{{ error }}</p>

        <div class="flex justify-end space-x-3">
          <router-link to="/" class="btn-outline">取消</router-link>
          <button 
            type="submit" 
            :disabled="!title.trim() || !content.trim() || isLoading" 
            class="btn-primary"
          >
            {{ isLoading ? '发布中...' : '发布问题' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuestionStore } from '../stores/question'
import { useUserStore } from '../stores/user'

const router = useRouter()
const questionStore = useQuestionStore()
const userStore = useUserStore()

const title = ref('')
const content = ref('')
const tags = ref('')
const error = ref('')
const isLoading = ref(false)

async function submitQuestion() {
  if (!title.value.trim() || !content.value.trim()) return
  
  if (!userStore.currentUser) {
    error.value = '请先登录'
    return
  }

  isLoading.value = true
  error.value = ''
  
  try {
    const question = await questionStore.createQuestion(
      title.value,
      content.value,
      tags.value,
      userStore.currentUser.id
    )
    router.push(`/question/${question.id}`)
  } catch (e) {
    error.value = e.message || '发布失败'
  } finally {
    isLoading.value = false
  }
}
</script>
