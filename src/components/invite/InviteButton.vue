<template>
  <div class="invite-users">
    <button
      @click="showModal = true"
      class="flex items-center space-x-1 text-gray-500 hover:text-zhihu-blue transition-colors text-sm"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
      </svg>
      <span>邀请回答</span>
    </button>

    <!-- 邀请弹窗 -->
    <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
        <h2 class="text-lg font-bold text-gray-900 mb-4">邀请用户回答</h2>

        <!-- 搜索框 -->
        <div class="mb-4">
          <input
            v-model="searchKeyword"
            type="text"
            placeholder="搜索用户..."
            class="input-field"
          />
        </div>

        <!-- 用户列表 -->
        <div class="flex-1 overflow-y-auto space-y-2">
          <div
            v-for="user in filteredUsers"
            :key="user.id"
            class="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg"
          >
            <router-link :to="`/user/${user.id}`" class="flex items-center space-x-3">
              <img :src="user.avatar" class="w-10 h-10 rounded-full" />
              <div>
                <div class="font-medium text-gray-900">{{ user.username }}</div>
                <div class="text-xs text-gray-400">{{ user.bio || '这个人很懒' }}</div>
              </div>
            </router-link>
            <button
              v-if="isInvited(user.id)"
              disabled
              class="text-sm px-3 py-1 bg-gray-100 text-gray-400 rounded-full"
            >
              已邀请
            </button>
            <button
              v-else
              @click="inviteUser(user)"
              class="text-sm px-3 py-1 bg-zhihu-blue text-white rounded-full hover:bg-zhihu-blue-hover"
            >
              邀请
            </button>
          </div>

          <div v-if="filteredUsers.length === 0" class="py-8 text-center text-gray-400">
            没有找到用户
          </div>
        </div>

        <!-- 底部 -->
        <div class="flex justify-end mt-4 pt-4 border-t">
          <button @click="showModal = false" class="btn-outline">关闭</button>
        </div>
      </div>
    </div>

    <!-- 邀请成功提示 -->
    <div v-if="showSuccessMsg" class="fixed top-4 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg z-50">
      邀请已发送
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '../../stores/user'
import { useInviteStore } from '../../stores/invite'

const props = defineProps({
  questionId: {
    type: String,
    required: true
  },
  questionTitle: {
    type: String,
    required: true
  }
})

const userStore = useUserStore()
const inviteStore = useInviteStore()

const showModal = ref(false)
const searchKeyword = ref('')
const showSuccessMsg = ref(false)

const filteredUsers = computed(() => {
  const keyword = searchKeyword.value.toLowerCase().trim()
  const currentUserId = userStore.currentUser?.id

  return userStore.users
    .filter(u => u.id !== currentUserId) // 排除自己
    .filter(u => {
      if (!keyword) return true
      return u.username.toLowerCase().includes(keyword)
    })
    .slice(0, 20) // 限制显示数量
})

function isInvited(userId) {
  return inviteStore.isInvited(props.questionId, userId)
}

function inviteUser(user) {
  const currentUserId = userStore.currentUser?.id
  if (!currentUserId) return

  inviteStore.createInvite(props.questionId, currentUserId, user.id, props.questionTitle)

  showSuccessMsg.value = true
  setTimeout(() => {
    showSuccessMsg.value = false
  }, 2000)
}
</script>
