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
          ></textarea>
        </div>

        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">话题标签</label>
          <input
            v-model="tags"
            type="text"
            placeholder="用逗号分隔，如：前端, Vue, JavaScript"
            class="input-field"
          />
          <p class="text-xs text-gray-500 mt-1">添加标签让问题更容易被发现</p>
        </div>

        <div class="flex justify-end space-x-3">
          <router-link to="/" class="btn-outline">取消</router-link>
          <button type="submit" :disabled="!title.trim() || !content.trim()" class="btn-primary">
            发布问题
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

const router = useRouter()
const questionStore = useQuestionStore()

const title = ref('')
const content = ref('')
const tags = ref('')

function submitQuestion() {
  if (!title.value.trim() || !content.value.trim()) return

  const question = questionStore.createQuestion(
    title.value,
    content.value,
    tags.value
  )

  router.push(`/question/${question.id}`)
}
</script>
