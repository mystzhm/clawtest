<template>
  <div class="max-w-4xl mx-auto">
    <div class="card">
      <!-- 用户信息卡片 -->
      <div class="flex items-start space-x-6 pb-6 border-b border-gray-100">
        <img
          :src="user?.avatar"
          class="w-24 h-24 rounded-full border-4 border-white shadow-md"
        />
        <div class="flex-1">
          <h1 class="text-2xl font-bold text-gray-900 mb-2">{{ user?.username }}</h1>
          <p v-if="user?.bio" class="text-gray-600 mb-4">{{ user.bio }}</p>

          <!-- 统计数据 -->
          <div class="flex items-center space-x-6">
            <div class="flex items-center space-x-1">
              <span class="font-bold text-gray-900">{{ followingCount }}</span>
              <span class="text-gray-500">关注</span>
            </div>
            <div class="flex items-center space-x-1">
              <span class="font-bold text-gray-900">{{ followersCount }}</span>
              <span class="text-gray-500">粉丝</span>
            </div>
            <div class="flex items-center space-x-1">
              <span class="font-bold text-gray-900">{{ answersCount }}</span>
              <span class="text-gray-500">回答</span>
            </div>
            <div class="flex items-center space-x-1">
              <span class="font-bold text-gray-900">{{ questionsCount }}</span>
              <span class="text-gray-500">提问</span>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div v-if="!isCurrentUser" class="flex items-center space-x-3 mt-4">
            <button
              v-if="isFollowing"
              @click="handleUnfollow"
              class="px-4 py-1.5 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 transition-colors"
            >
              取消关注
            </button>
            <button
              v-else
              @click="handleFollow"
              class="btn-primary"
            >
              关注
            </button>
            <router-link
              :to="`/message/${userId}`"
              class="px-4 py-1.5 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 transition-colors"
            >
              发私信
            </router-link>
          </div>
          <div v-else class="flex items-center space-x-3 mt-4">
            <router-link
              to="/settings/profile"
              class="px-4 py-1.5 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 transition-colors"
            >
              编辑资料
            </router-link>
          </div>
        </div>
      </div>

      <!-- Tab 切换 -->
      <div class="flex space-x-1 mt-6 bg-gray-100 p-1 rounded-lg">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          @click="activeTab = tab.key"
          :class="[
            'flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors',
            activeTab === tab.key
              ? 'bg-white text-zhihu-blue shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          ]"
        >
          {{ tab.label }}
          <span v-if="tab.count !== undefined" class="ml-1 text-gray-400">
            {{ tab.count }}
          </span>
        </button>
      </div>

      <!-- 内容区域 -->
      <div class="mt-6">
        <!-- 回答列表 -->
        <div v-if="activeTab === 'answers'" class="space-y-4">
          <div v-if="userAnswers.length > 0">
            <div v-for="answer in paginatedAnswers" :key="answer.id" class="card cursor-pointer hover:shadow-md transition-shadow">
              <router-link :to="`/question/${answer.questionId}`">
                <h3 class="font-medium text-gray-900 mb-2">
                  {{ getQuestionTitle(answer.questionId) }}
                </h3>
                <p class="text-sm text-gray-600 line-clamp-3">{{ answer.content }}</p>
                <div class="flex items-center space-x-4 mt-3 text-xs text-gray-400">
                  <span class="flex items-center">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                    </svg>
                    {{ answer.likes }}
                  </span>
                  <span>{{ formatDate(answer.createdAt) }}</span>
                </div>
              </router-link>
            </div>
            <!-- 分页 -->
            <div v-if="totalAnswerPages > 1" class="flex justify-center mt-6 space-x-2">
              <button
                @click="prevAnswerPage"
                :disabled="currentAnswerPage === 1"
                class="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
              >
                上一页
              </button>
              <span class="px-3 py-1">{{ currentAnswerPage }} / {{ totalAnswerPages }}</span>
              <button
                @click="nextAnswerPage"
                :disabled="currentAnswerPage === totalAnswerPages"
                class="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
              >
                下一页
              </button>
            </div>
          </div>
          <div v-else class="py-8 text-center text-gray-400">
            暂无回答
          </div>
        </div>

        <!-- 提问列表 -->
        <div v-if="activeTab === 'questions'" class="space-y-4">
          <div v-if="userQuestions.length > 0">
            <div v-for="question in paginatedQuestions" :key="question.id" class="card cursor-pointer hover:shadow-md transition-shadow">
              <router-link :to="`/question/${question.id}`">
                <h3 class="font-medium text-gray-900 mb-2">{{ question.title }}</h3>
                <p class="text-sm text-gray-600 line-clamp-2">{{ question.content }}</p>
                <div class="flex items-center space-x-4 mt-3 text-xs text-gray-400">
                  <span class="flex items-center">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    {{ question.views || 0 }}
                  </span>
                  <span>{{ formatDate(question.createdAt) }}</span>
                </div>
              </router-link>
            </div>
            <!-- 分页 -->
            <div v-if="totalQuestionPages > 1" class="flex justify-center mt-6 space-x-2">
              <button
                @click="prevQuestionPage"
                :disabled="currentQuestionPage === 1"
                class="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
              >
                上一页
              </button>
              <span class="px-3 py-1">{{ currentQuestionPage }} / {{ totalQuestionPages }}</span>
              <button
                @click="nextQuestionPage"
                :disabled="currentQuestionPage === totalQuestionPages"
                class="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
              >
                下一页
              </button>
            </div>
          </div>
          <div v-else class="py-8 text-center text-gray-400">
            暂无提问
          </div>
        </div>

        <!-- 关注列表 -->
        <div v-if="activeTab === 'following'" class="space-y-3">
          <div v-if="followingUsers.length > 0">
            <div
              v-for="followingUser in followingUsers"
              :key="followingUser.id"
              class="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <router-link :to="`/user/${followingUser.id}`" class="flex items-center space-x-3">
                <img :src="followingUser.avatar" class="w-10 h-10 rounded-full" />
                <div>
                  <div class="font-medium text-gray-900">{{ followingUser.username }}</div>
                  <div class="text-xs text-gray-400">{{ followingUser.bio || '这个人很懒' }}</div>
                </div>
              </router-link>
              <button
                @click="handleUnfollowUser(followingUser.id)"
                class="text-sm px-3 py-1 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50"
              >
                取消关注
              </button>
            </div>
          </div>
          <div v-else class="py-8 text-center text-gray-400">
            暂无关注
          </div>
        </div>

        <!-- 粉丝列表 -->
        <div v-if="activeTab === 'followers'" class="space-y-3">
          <div v-if="followers.length > 0">
            <div
              v-for="follower in followers"
              :key="follower.id"
              class="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <router-link :to="`/user/${follower.id}`" class="flex items-center space-x-3">
                <img :src="follower.avatar" class="w-10 h-10 rounded-full" />
                <div>
                  <div class="font-medium text-gray-900">{{ follower.username }}</div>
                  <div class="text-xs text-gray-400">{{ follower.bio || '这个人很懒' }}</div>
                </div>
              </router-link>
              <button
                v-if="!isFollowingUser(follower.id)"
                @click="handleFollowUser(follower.id)"
                class="text-sm px-3 py-1 bg-zhihu-blue text-white rounded-full hover:bg-zhihu-blue-hover"
              >
                关注
              </button>
              <button
                v-else
                @click="handleUnfollowUser(follower.id)"
                class="text-sm px-3 py-1 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50"
              >
                取消关注
              </button>
            </div>
          </div>
          <div v-else class="py-8 text-center text-gray-400">
            暂无粉丝
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '../stores/user'
import { useQuestionStore } from '../stores/question'

const route = useRoute()
const userStore = useUserStore()
const questionStore = useQuestionStore()

const activeTab = ref('answers')
const currentAnswerPage = ref(1)
const currentQuestionPage = ref(1)
const pageSize = 10

const tabs = computed(() => [
  { key: 'answers', label: '回答', count: answersCount.value },
  { key: 'questions', label: '提问', count: questionsCount.value },
  { key: 'following', label: '关注' },
  { key: 'followers', label: '粉丝' }
])

const userId = computed(() => route.params.id)
const currentUser = computed(() => userStore.currentUser)
const user = computed(() => userStore.getUserById(userId.value))

const isCurrentUser = computed(() => {
  return currentUser.value?.id === userId.value
})

const isFollowing = computed(() => {
  return userStore.isFollowing(userId.value)
})

const followingCount = computed(() => user?.value?.following || 0)
const followersCount = computed(() => user?.value?.followers || 0)

// 用户回答
const userAnswers = computed(() => {
  return questionStore.answers.filter(a => a.authorId === userId.value)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
})

const answersCount = computed(() => userAnswers.value.length)

const paginatedAnswers = computed(() => {
  const start = (currentAnswerPage.value - 1) * pageSize
  const end = start + pageSize
  return userAnswers.value.slice(start, end)
})

const totalAnswerPages = computed(() => Math.ceil(answersCount.value / pageSize))

// 用户提问
const userQuestions = computed(() => {
  return questionStore.questions.filter(q => q.authorId === userId.value)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
})

const questionsCount = computed(() => userQuestions.value.length)

const paginatedQuestions = computed(() => {
  const start = (currentQuestionPage.value - 1) * pageSize
  const end = start + pageSize
  return userQuestions.value.slice(start, end)
})

const totalQuestionPages = computed(() => Math.ceil(questionsCount.value / pageSize))

// 关注的用户
const followingUsers = computed(() => {
  return userStore.getFollowingUsers()
})

// 粉丝
const followers = computed(() => {
  const followingList = JSON.parse(localStorage.getItem('followingList') || '{}')
  const followerIds = Object.entries(followingList)
    .filter(([_, following]) => following.includes(userId.value))
    .map(([followerId, _]) => followerId)

  return userStore.users.filter(u => followerIds.includes(u.id))
})

function isFollowingUser(id) {
  return userStore.isFollowing(id)
}

function handleFollow() {
  userStore.followUser(userId.value)
}

function handleUnfollow() {
  userStore.unfollowUser(userId.value)
}

function handleFollowUser(id) {
  userStore.followUser(id)
}

function handleUnfollowUser(id) {
  userStore.unfollowUser(id)
}

function getQuestionTitle(questionId) {
  const question = questionStore.getQuestionById(questionId)
  return question?.title || '问题'
}

function prevAnswerPage() {
  if (currentAnswerPage.value > 1) {
    currentAnswerPage.value--
  }
}

function nextAnswerPage() {
  if (currentAnswerPage.value < totalAnswerPages.value) {
    currentAnswerPage.value++
  }
}

function prevQuestionPage() {
  if (currentQuestionPage.value > 1) {
    currentQuestionPage.value--
  }
}

function nextQuestionPage() {
  if (currentQuestionPage.value < totalQuestionPages.value) {
    currentQuestionPage.value++
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
