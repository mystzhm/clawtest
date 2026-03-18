<template>
  <div class="max-w-4xl mx-auto">
    <div class="card">
      <!-- 头部 -->
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-900">我的收藏夹</h1>
        <button
          @click="showCreateModal = true"
          class="btn-primary text-sm"
        >
          + 新建收藏夹
        </button>
      </div>

      <!-- 收藏夹列表 -->
      <div v-if="myFavorites.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="favorite in myFavorites"
          :key="favorite.id"
          class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
          @click="viewFavorite(favorite.id)"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <h3 class="font-medium text-gray-900 mb-1">{{ favorite.name }}</h3>
              <p v-if="favorite.description" class="text-sm text-gray-500 mb-2 line-clamp-2">
                {{ favorite.description }}
              </p>
              <div class="flex items-center space-x-2 text-xs text-gray-400">
                <span class="flex items-center">
                  <svg class="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  {{ favorite.itemCount }} 条内容
                </span>
                <span>•</span>
                <span>{{ formatDate(favorite.createdAt) }}</span>
              </div>
            </div>
            <div class="flex flex-col space-y-2 ml-4">
              <button
                @click.stop="editFavorite(favorite)"
                class="text-gray-400 hover:text-zhihu-blue"
                title="编辑"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                @click.stop="deleteFavorite(favorite.id)"
                class="text-gray-400 hover:text-red-500"
                title="删除"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="py-16 text-center">
        <svg class="w-20 h-20 mx-auto mb-4 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
        <p class="text-gray-400 mb-2">还没有收藏夹</p>
        <p class="text-sm text-gray-300">创建收藏夹，收藏有价值的回答</p>
      </div>
    </div>

    <!-- 创建/编辑收藏夹弹窗 -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 class="text-xl font-bold text-gray-900 mb-4">
          {{ editingFavorite ? '编辑收藏夹' : '新建收藏夹' }}
        </h2>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">收藏夹名称</label>
            <input
              v-model="form.name"
              type="text"
              class="input-field"
              placeholder="给收藏夹起个名字"
              maxlength="50"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">描述（可选）</label>
            <textarea
              v-model="form.description"
              rows="3"
              class="input-field"
              placeholder="简要描述这个收藏夹的内容"
              maxlength="200"
            ></textarea>
          </div>
          <div class="flex items-center">
            <input
              v-model="form.isPublic"
              type="checkbox"
              id="isPublic"
              class="rounded border-gray-300 text-zhihu-blue focus:ring-zhihu-blue"
            />
            <label for="isPublic" class="ml-2 text-sm text-gray-600">公开收藏夹</label>
          </div>
        </div>
        <div class="flex justify-end space-x-3 mt-6">
          <button @click="closeModal" class="btn-outline">取消</button>
          <button
            @click="saveFavorite"
            :disabled="!form.name.trim()"
            class="btn-primary"
          >
            保存
          </button>
        </div>
      </div>
    </div>

    <!-- 收藏夹详情弹窗 -->
    <div v-if="showDetailModal && selectedFavorite" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
      <div class="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 my-8">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-xl font-bold text-gray-900">{{ selectedFavorite.name }}</h2>
            <p v-if="selectedFavorite.description" class="text-sm text-gray-500 mt-1">
              {{ selectedFavorite.description }}
            </p>
          </div>
          <button @click="showDetailModal = false" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- 收藏的回答列表 -->
        <div v-if="favoriteAnswers.length > 0" class="space-y-4 max-h-[60vh] overflow-y-auto">
          <div
            v-for="answer in favoriteAnswers"
            :key="answer.id"
            class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <router-link :to="`/question/${answer.questionId}`" @click="showDetailModal = false">
              <h3 class="font-medium text-gray-900 mb-2">
                {{ getQuestionTitle(answer.questionId) }}
              </h3>
              <p class="text-sm text-gray-600 line-clamp-3 mb-3">{{ answer.content }}</p>
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4 text-xs text-gray-400">
                  <span class="flex items-center">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                    </svg>
                    {{ answer.likes }}
                  </span>
                  <span>{{ formatDate(answer.createdAt) }}</span>
                </div>
                <button
                  @click.stop="removeFromFavorite(answer.id, selectedFavorite.id)"
                  class="text-sm text-gray-400 hover:text-red-500"
                >
                  取消收藏
                </button>
              </div>
            </router-link>
          </div>
        </div>
        <div v-else class="py-8 text-center text-gray-400">
          暂无收藏内容
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useFavoriteStore } from '../stores/favorite'
import { useQuestionStore } from '../stores/question'

const router = useRouter()
const favoriteStore = useFavoriteStore()
const questionStore = useQuestionStore()

const showCreateModal = ref(false)
const showDetailModal = ref(false)
const editingFavorite = ref(null)
const selectedFavorite = ref(null)

const form = ref({
  name: '',
  description: '',
  isPublic: true
})

const myFavorites = computed(() => favoriteStore.myFavorites)

const favoriteAnswers = computed(() => {
  if (!selectedFavorite.value) return []
  return favoriteStore.getAnswersByFavorite(selectedFavorite.value.id)
})

function viewFavorite(favoriteId) {
  selectedFavorite.value = favoriteStore.favorites.find(f => f.id === favoriteId)
  showDetailModal.value = true
}

function editFavorite(favorite) {
  editingFavorite.value = favorite
  form.value = {
    name: favorite.name,
    description: favorite.description,
    isPublic: favorite.isPublic
  }
  showCreateModal.value = true
}

function deleteFavorite(favoriteId) {
  if (confirm('确定要删除这个收藏夹吗？')) {
    favoriteStore.deleteFavorite(favoriteId)
  }
}

function saveFavorite() {
  if (!form.value.name.trim()) return

  if (editingFavorite.value) {
    favoriteStore.updateFavorite(editingFavorite.value.id, form.value)
  } else {
    favoriteStore.createFavorite(form.value.name, form.value.description, form.value.isPublic)
  }

  closeModal()
}

function closeModal() {
  showCreateModal.value = false
  editingFavorite.value = null
  form.value = {
    name: '',
    description: '',
    isPublic: true
  }
}

function removeFromFavorite(answerId, favoriteId) {
  if (confirm('确定要取消收藏吗？')) {
    favoriteStore.removeAnswerFromFavorites(answerId, favoriteId)
    favoriteAnswers.value // 触发重新计算
  }
}

function getQuestionTitle(questionId) {
  const question = questionStore.getQuestionById(questionId)
  return question?.title || '问题'
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

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
