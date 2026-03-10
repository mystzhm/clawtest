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
        <!-- 编辑模式 -->
        <template v-if="isEditing">
          <input
            v-model="editForm.title"
            type="text"
            class="input-field text-xl font-bold mb-4"
            placeholder="问题标题"
          />
          <textarea
            v-model="editForm.content"
            rows="6"
            class="input-field mb-4"
            placeholder="问题描述"
          ></textarea>
          <input
            v-model="editForm.tags"
            type="text"
            class="input-field mb-4"
            placeholder="标签（用逗号分隔）"
          />
          <div class="flex justify-end space-x-3">
            <button @click="cancelEdit" class="btn-outline">取消</button>
            <button @click="saveEdit" :disabled="!editForm.title.trim() || isLoading" class="btn-primary">保存</button>
          </div>
        </template>

        <!-- 查看模式 -->
        <template v-else>
          <div class="flex justify-between items-start">
            <h1 class="text-2xl font-bold text-gray-900 mb-4 flex-1">{{ question.title }}</h1>
            <!-- 作者操作按钮 -->
            <div v-if="isAuthor" class="flex space-x-2 ml-4">
              <button @click="startEdit" class="text-gray-400 hover:text-zhihu-blue" title="编辑">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button @click="confirmDelete" class="text-gray-400 hover:text-red-500" title="删除">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
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
        </template>
      </div>

      <!-- 删除确认弹窗 -->
      <div v-if="showDeleteConfirm" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 max-w-sm mx-4">
          <h3 class="text-lg font-bold text-gray-900 mb-2">确认删除</h3>
          <p class="text-gray-600 mb-4">删除后无法恢复，确定要删除这个问题吗？</p>
          <div class="flex justify-end space-x-3">
            <button @click="showDeleteConfirm = false" class="btn-outline">取消</button>
            <button @click="doDeleteQuestion" class="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600">删除</button>
          </div>
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
            :disabled="isLoading"
          ></textarea>
          <div class="flex justify-end mt-3">
            <button @click="submitAnswer" :disabled="!newAnswer.trim() || isLoading" class="btn-primary">
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
          @delete="deleteAnswer"
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
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuestionStore } from '../stores/question'
import { useUserStore } from '../stores/user'
import AnswerCard from '../components/answer/AnswerCard.vue'

const route = useRoute()
const router = useRouter()
const questionStore = useQuestionStore()
const userStore = useUserStore()

const question = ref(null)
const answers = ref([])
const newAnswer = ref('')
const notFound = ref(false)
const isEditing = ref(false)
const showDeleteConfirm = ref(false)
const isLoading = ref(false)

const editForm = reactive({
  title: '',
  content: '',
  tags: ''
})

const author = computed(() => {
  return userStore.getUserById(question.value?.authorId)
})

const isAuthor = computed(() => {
  return userStore.currentUser?.id === question.value?.authorId
})

onMounted(async () => {
  await loadQuestion()
})

async function loadQuestion() {
  const id = route.params.id
  isLoading.value = true
  try {
    question.value = await questionStore.getQuestionById(id)
    
    if (!question.value) {
      notFound.value = true
      return
    }
    
    answers.value = await questionStore.getAnswersByQuestionId(id)
  } catch (error) {
    console.error('加载问题失败:', error)
    notFound.value = true
  } finally {
    isLoading.value = false
  }
}

function startEdit() {
  editForm.title = question.value.title
  editForm.content = question.value.content
  editForm.tags = question.value.tags.join(', ')
  isEditing.value = true
}

function cancelEdit() {
  isEditing.value = false
}

async function saveEdit() {
  if (!editForm.title.trim()) return
  
  isLoading.value = true
  try {
    await questionStore.updateQuestion(question.value.id, {
      title: editForm.title,
      content: editForm.content,
      tags: editForm.tags
    })
    
    question.value = await questionStore.getQuestionById(question.value.id)
    isEditing.value = false
  } catch (error) {
    console.error('更新问题失败:', error)
  } finally {
    isLoading.value = false
  }
}

function confirmDelete() {
  showDeleteConfirm.value = true
}

async function doDeleteQuestion() {
  isLoading.value = true
  try {
    await questionStore.deleteQuestion(question.value.id)
    router.push('/')
  } catch (error) {
    console.error('删除问题失败:', error)
  } finally {
    isLoading.value = false
  }
}

async function deleteAnswer(answerId) {
  await questionStore.deleteAnswer(answerId)
  answers.value = await questionStore.getAnswersByQuestionId(question.value.id)
}

async function submitAnswer() {
  if (!newAnswer.value.trim()) return
  isLoading.value = true
  try {
    await questionStore.createAnswer(question.value.id, newAnswer.value, userStore.currentUser.id)
    newAnswer.value = ''
    answers.value = await questionStore.getAnswersByQuestionId(question.value.id)
  } catch (error) {
    console.error('发布回答失败:', error)
  } finally {
    isLoading.value = false
  }
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
