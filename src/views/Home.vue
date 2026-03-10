<template>
  <div class="flex gap-6">
    <!-- 左侧分类 -->
    <aside class="hidden lg:block w-48 flex-shrink-0">
      <div class="card sticky top-20">
        <h3 class="font-bold text-gray-900 mb-3">话题分类</h3>
        <ul class="space-y-2">
          <li>
            <button
              @click="handleTagClick(null)"
              :class="[
                'text-sm w-full text-left',
                selectedTag === null ? 'text-zhihu-blue font-medium' : 'text-gray-600 hover:text-zhihu-blue'
              ]"
            >
              全部
            </button>
          </li>
          <li v-for="tag in popularTags" :key="tag">
            <button
              @click="handleTagClick(tag)"
              :class="[
                'text-sm w-full text-left',
                selectedTag === tag ? 'text-zhihu-blue font-medium' : 'text-gray-600 hover:text-zhihu-blue'
              ]"
            >
              {{ tag }}
            </button>
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
          @click="handleTabClick(tab.key)"
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

      <!-- 关注 Tab 内容 -->
      <template v-if="activeTab === 'following'">
        <!-- 未登录提示 -->
        <div v-if="!userStore.isLoggedIn" class="card text-center py-12">
          <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p class="text-gray-500 mb-4">登录后查看关注动态</p>
          <router-link to="/login" class="btn-primary">去登录</router-link>
        </div>

        <!-- 没有关注任何人 -->
        <template v-else-if="followingUsers.length === 0">
          <div class="card text-center py-8 mb-4">
            <p class="text-gray-500 mb-2">你还没有关注任何人</p>
            <p class="text-sm text-gray-400">关注感兴趣的用户，查看他们的最新动态</p>
          </div>
          
          <!-- 推荐用户 -->
          <h3 class="font-bold text-gray-900 mb-4">推荐关注</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div v-for="user in recommendedUsers" :key="user.id" class="card flex items-center space-x-4">
              <router-link :to="`/user/${user.id}`">
                <img :src="user.avatar" class="w-12 h-12 rounded-full" />
              </router-link>
              <div class="flex-1 min-w-0">
                <router-link :to="`/user/${user.id}`" class="font-medium text-gray-900 hover:text-zhihu-blue">
                  {{ user.username }}
                </router-link>
                <p class="text-sm text-gray-500 truncate">{{ user.bio }}</p>
              </div>
              <button
                @click="handleFollow(user.id)"
                class="btn-outline text-sm whitespace-nowrap"
              >
                关注
              </button>
            </div>
          </div>
        </template>

        <!-- 显示关注用户的问题 -->
        <template v-else>
          <!-- 关注的用户列表 -->
          <div class="card mb-4">
            <h3 class="font-medium text-gray-900 mb-3">我关注的人 ({{ followingUsers.length }})</h3>
            <div class="flex flex-wrap gap-3">
              <router-link
                v-for="user in followingUsers"
                :key="user.id"
                :to="`/user/${user.id}`"
                class="flex items-center space-x-2 bg-gray-50 rounded-full px-3 py-1 hover:bg-gray-100"
              >
                <img :src="user.avatar" class="w-6 h-6 rounded-full" />
                <span class="text-sm text-gray-700">{{ user.username }}</span>
              </router-link>
            </div>
          </div>

          <!-- 关注用户的问题 -->
          <div class="space-y-4">
            <QuestionCard
              v-for="question in followingQuestions"
              :key="question.id"
              :question="question"
            />
          </div>

          <div v-if="followingQuestions.length === 0" class="card text-center py-12">
            <p class="text-gray-500">你关注的人还没有发布问题</p>
          </div>
        </template>
      </template>

      <!-- 推荐/热门 问题列表 -->
      <template v-else>
        <div class="space-y-4">
          <QuestionCard
            v-for="question in currentPageQuestions"
            :key="question.id"
            :question="question"
          />
        </div>

        <!-- 空状态 -->
        <div v-if="currentPageQuestions.length === 0" class="text-center text-gray-500 py-12">
          <p v-if="selectedTag">暂无「{{ selectedTag }}」相关问题</p>
          <p v-else>暂无问题，来提出第一个问题吧！</p>
        </div>

        <!-- 分页控件 -->
        <div v-if="filteredTotalPages > 1" class="card mt-6">
          <div class="flex items-center justify-center space-x-2">
            <button
              @click="handlePageChange(currentPage - 1)"
              :disabled="currentPage === 1"
              :class="[
                'px-3 py-1 rounded border transition-colors',
                currentPage === 1
                  ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                  : 'border-gray-300 text-gray-600 hover:bg-gray-50'
              ]"
            >
              上一页
            </button>

            <div class="flex items-center space-x-1">
              <button
                v-for="page in displayPages"
                :key="page"
                @click="handlePageChange(page)"
                :class="[
                  'px-3 py-1 rounded border transition-colors text-sm',
                  page === currentPage
                    ? 'bg-zhihu-blue text-white border-zhihu-blue'
                    : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                ]"
              >
                {{ page }}
              </button>
            </div>

            <button
              @click="handlePageChange(currentPage + 1)"
              :disabled="currentPage === filteredTotalPages"
              :class="[
                'px-3 py-1 rounded border transition-colors',
                currentPage === filteredTotalPages
                  ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                  : 'border-gray-300 text-gray-600 hover:bg-gray-50'
              ]"
            >
              下一页
            </button>

            <span class="text-sm text-gray-500 ml-4">
              {{ currentPage }} / {{ filteredTotalPages }} 页
            </span>
          </div>
        </div>
      </template>
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
import { ref, computed, onMounted } from 'vue'
import { useQuestionStore } from '../stores/question'
import { useUserStore } from '../stores/user'
import QuestionCard from '../components/question/QuestionCard.vue'

const questionStore = useQuestionStore()
const userStore = useUserStore()

onMounted(async () => {
  // 初始化数据
  await Promise.all([
    userStore.init(),
    questionStore.init()
  ])
})

const tabs = [
  { key: 'recommend', label: '推荐' },
  { key: 'following', label: '关注' },
  { key: 'hot', label: '热门' }
]

const activeTab = ref('recommend')
const selectedTag = ref(null)
const popularTags = ['前端开发', '后端', '人工智能', '职场', '生活', '科技', '教育', '创业']

// 分页状态
const currentPage = computed(() => questionStore.currentPage)
const pageSize = computed(() => questionStore.pageSize)

// 关注的用户列表
const followingUsers = computed(() => userStore.getFollowingUsers())

// 关注用户的问题
const followingQuestions = computed(() => {
  const followingIds = userStore.getFollowingIds()
  if (followingIds.length === 0) return []
  
  return questionStore.sortedQuestions.filter(q => followingIds.includes(q.authorId))
})

// 推荐用户（排除自己）
const recommendedUsers = computed(() => {
  return userStore.users
    .filter(u => u.id !== userStore.currentUser?.id)
    .slice(0, 6)
})

// 当前页的问题列表
const currentPageQuestions = computed(() => {
  let questions = [...questionStore.sortedQuestions]
  
  if (selectedTag.value) {
    questions = questions.filter(q => 
      q.tags.some(t => t.includes(selectedTag.value) || selectedTag.value.includes(t))
    )
  }
  
  if (activeTab.value === 'hot') {
    questions = questions.sort((a, b) => b.views - a.views)
  }
  
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return questions.slice(start, end)
})

const filteredTotalPages = computed(() => {
  let questions = [...questionStore.sortedQuestions]
  
  if (selectedTag.value) {
    questions = questions.filter(q => 
      q.tags.some(t => t.includes(selectedTag.value) || selectedTag.value.includes(t))
    )
  }
  
  return Math.ceil(questions.length / pageSize.value)
})

const displayPages = computed(() => {
  const pages = []
  const total = filteredTotalPages.value
  if (total <= 1) return pages
  
  const max = Math.min(total, 7)
  let start = Math.max(1, currentPage.value - 3)
  let end = Math.min(start + max - 1, total)
  
  if (end - start + 1 < max) {
    start = Math.max(1, end - max + 1)
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

const hotQuestions = computed(() => {
  return [...questionStore.questions].sort((a, b) => b.views - a.views).slice(0, 5)
})

function handleTagClick(tag) {
  selectedTag.value = tag
  questionStore.resetPagination()
}

function handleTabClick(tabKey) {
  activeTab.value = tabKey
  questionStore.resetPagination()
}

function handlePageChange(page) {
  if (page < 1 || page > filteredTotalPages.value) return
  questionStore.setCurrentPage(page)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function handleFollow(userId) {
  userStore.followUser(userId)
}
</script>
