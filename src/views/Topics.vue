<template>
  <div class="max-w-4xl mx-auto">
    <div class="card">
      <!-- 头部 -->
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">话题广场</h1>
        <div class="flex items-center space-x-2">
          <input
            v-model="searchKeyword"
            type="text"
            placeholder="搜索话题..."
            class="input-field w-64"
          />
        </div>
      </div>

      <!-- 我关注的话题 -->
      <div v-if="userStore.isLoggedIn && myFollowedTopics.length > 0" class="mb-6">
        <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-3">我关注的话题</h2>
        <div class="flex flex-wrap gap-3">
          <router-link
            v-for="topic in myFollowedTopics"
            :key="topic.id"
            :to="`/topic/${topic.id}`"
            class="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-zhihu-blue rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
          >
            {{ topic.name }}
          </router-link>
        </div>
      </div>

      <!-- 热门话题 -->
      <div>
        <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-3">热门话题</h2>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div
            v-for="topic in filteredTopics"
            :key="topic.id"
            class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
            @click="$router.push(`/topic/${topic.id}`)"
          >
            <div class="flex items-start justify-between mb-2">
              <h3 class="font-bold text-gray-900 dark:text-white">{{ topic.name }}</h3>
              <button
                @click.stop="toggleFollow(topic.id)"
                :class="[
                  'px-3 py-1 rounded-full text-sm transition-colors',
                  topicStore.isFollowing(topic.id)
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                    : 'bg-zhihu-blue text-white hover:bg-zhihu-blue-hover'
                ]"
              >
                {{ topicStore.isFollowing(topic.id) ? '已关注' : '关注' }}
              </button>
            </div>
            <p v-if="topic.description" class="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
              {{ topic.description }}
            </p>
            <div class="flex items-center space-x-4 text-xs text-gray-400">
              <span>{{ topic.questionCount || 0 }} 问题</span>
              <span>{{ topic.articleCount || 1 }} 文章</span>
              <span>{{ topic.followerCount || 0 }} 关注</span>
            </div>
          </div>
        </div>

        <div v-if="filteredTopics.length === 0" class="py-8 text-center text-gray-400">
          没有找到相关话题
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useTopicStore } from '../stores/topic'
import { useUserStore } from '../stores/user'

const topicStore = useTopicStore()
const userStore = useUserStore()

const searchKeyword = ref('')

const filteredTopics = computed(() => {
  if (!searchKeyword.value.trim()) {
    return topicStore.hotTopics
  }
  return topicStore.searchTopics(searchKeyword.value)
})

const myFollowedTopics = computed(() => topicStore.myFollowedTopics)

function toggleFollow(topicId) {
  if (!userStore.isLoggedIn) {
    alert('请先登录')
    return
  }

  if (topicStore.isFollowing(topicId)) {
    topicStore.unfollowTopic(topicId)
  } else {
    topicStore.followTopic(topicId)
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
</style>
