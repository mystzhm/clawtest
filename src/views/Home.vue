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

      <!-- 关注提示 -->
      <div v-if="activeTab === 'following'" class="card text-center py-8">
        <p class="text-gray-500 mb-4">关注功能开发中，敬请期待！</p>
        <p class="text-sm text-gray-400">届时您可以关注感兴趣的用户，查看他们的动态</p>
      </div>

      <!-- 问题列表 -->
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
        <div v-if="totalPages > 1" class="card mt-6">
          <div class="flex items-center justify-center space-x-2">
            <!-- 上一页 -->
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

            <!-- 页码 -->
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

            <!-- 下一页 -->
            <button
              @click="handlePageChange(currentPage + 1)"
              :disabled="currentPage === totalPages"
              :class="[
                'px-3 py-1 rounded border transition-colors',
                currentPage === totalPages
                  ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                  : 'border-gray-300 text-gray-600 hover:bg-gray-50'
              ]"
            >
              下一页
            </button>

            <!-- 页码信息 -->
            <span class="text-sm text-gray-500 ml-4">
              {{ currentPage }} / {{ totalPages }} 页
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
import { ref, computed, watch } from 'vue'
import { useQuestionStore } from '../stores/question'
import QuestionCard from '../components/question/QuestionCard.vue'

const questionStore = useQuestionStore()

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
const totalPages = computed(() => questionStore.totalPages)
const pageSize = computed(() => questionStore.pageSize)

// 当前页的问题列表
const currentPageQuestions = computed(() => {
  let questions = questionStore.paginatedQuestions
  
  // 如果有标签过滤，应用过滤后再分页
  if (selectedTag.value) {
    questions = questionStore.sortedQuestions.filter(q => 
      q.tags.some(t => t.includes(selectedTag.value) || selectedTag.value.includes(t))
    )
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    questions = questions.slice(start, end)
  }
  
  // 按排序方式
  if (activeTab.value === 'hot') {
    return questions.sort((a, b) => b.views - a.views)
  }
  return questions
})

// 显示的页码（简化显示，最多显示5个页码）
const displayPages = computed(() => {
  const pages = []
  const max = Math.min(totalPages.value, 7) // 最多显示7个页码
  
  let start = Math.max(1, currentPage.value - 3)
  let end = Math.min(start + max - 1, totalPages.value)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

const hotQuestions = computed(() => {
  return [...questionStore.questions].sort((a, b) => b.views - a.views).slice(0, 5)
})

// 标签点击时重置分页
function handleTagClick(tag) {
  selectedTag.value = tag
  questionStore.resetPagination()
}

// Tab 切换时重置分页
function handleTabClick(tabKey) {
  activeTab.value = tabKey
  questionStore.resetPagination()
}

// 页码切换
function handlePageChange(page) {
  if (page < 1 || page > totalPages.value) return
  questionStore.setCurrentPage(page)
  // 滚动到顶部
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>
