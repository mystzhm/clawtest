<template>
  <header class="bg-white shadow-sm sticky top-0 z-50">
    <div class="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
      <!-- Logo -->
      <router-link to="/" class="flex items-center space-x-2">
        <div class="w-8 h-8 bg-zhihu-blue rounded-lg flex items-center justify-center">
          <span class="text-white font-bold text-lg">知</span>
        </div>
        <span class="text-xl font-bold text-gray-900">知答</span>
      </router-link>

      <!-- Nav -->
      <nav class="hidden md:flex items-center space-x-6">
        <router-link to="/" class="text-gray-600 hover:text-zhihu-blue">首页</router-link>
        <router-link to="/hot" class="text-gray-600 hover:text-zhihu-blue">热榜</router-link>
        <router-link to="/?tab=following" class="text-gray-600 hover:text-zhihu-blue">关注</router-link>
      </nav>

      <!-- Search -->
      <div class="flex-1 max-w-md mx-4">
        <div class="relative">
          <input
            v-model="searchKeyword"
            @keyup.enter="handleSearch"
            type="text"
            placeholder="搜索问题..."
            class="w-full bg-gray-100 rounded-full px-4 py-2 pr-10 focus:outline-none focus:bg-white focus:ring-2 focus:ring-zhihu-blue"
          />
          <button @click="handleSearch" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-zhihu-blue">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </div>

      <!-- User -->
      <div class="flex items-center space-x-3">
        <router-link v-if="userStore.isLoggedIn" to="/ask" class="btn-primary text-sm">
          提问题
        </router-link>
        <!-- 通知铃铛 -->
        <NotificationBell v-if="userStore.isLoggedIn" />
        <!-- 收藏夹 -->
        <router-link v-if="userStore.isLoggedIn" to="/favorites" class="text-gray-500 hover:text-zhihu-blue" title="收藏夹">
          <svg class="w-6 h-6" :class="{ 'text-yellow-500': hasFavorites }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </router-link>
        <template v-if="userStore.isLoggedIn">
          <router-link :to="`/user/${userStore.currentUser.id}`" class="flex items-center space-x-2">
            <img :src="userStore.currentUser.avatar" class="w-8 h-8 rounded-full" />
            <span class="text-sm hidden md:block">{{ userStore.currentUser.username }}</span>
          </router-link>
          <button @click="userStore.logout()" class="text-gray-500 hover:text-red-500 text-sm">退出</button>
        </template>
        <template v-else>
          <router-link to="/login" class="text-zhihu-blue hover:text-zhihu-blue-hover">登录</router-link>
          <router-link to="/register" class="btn-primary text-sm">注册</router-link>
        </template>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../stores/user'
import NotificationBell from '../notification/NotificationBell.vue'

const router = useRouter()
const userStore = useUserStore()
const searchKeyword = ref('')

function handleSearch() {
  if (searchKeyword.value.trim()) {
    router.push({ path: '/search', query: { q: searchKeyword.value.trim() } })
  }
}
</script>
