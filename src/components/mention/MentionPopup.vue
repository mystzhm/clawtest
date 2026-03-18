<template>
  <div class="mention-popup" v-if="showPopup">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-2 z-50 w-64">
      <div class="flex items-center space-x-2 mb-2 pb-2 border-b border-gray-100 dark:border-gray-700">
        <svg class="w-4 h-4 text-zhihu-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span class="text-xs text-gray-500">提及用户</span>
        <button @click="closePopup" class="ml-auto text-gray-400 hover:text-gray-600">×</button>
      </div>
      <div class="max-h-48 overflow-y-auto space-y-1">
        <div
          v-for="user in filteredUsers"
          :key="user.id"
          @click="selectUser(user)"
          class="flex items-center space-x-2 p-1.5 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer"
        >
          <img :src="user.avatar" class="w-8 h-8 rounded-full" />
          <span class="text-sm text-gray-900 dark:text-white truncate">{{ user.username }}</span>
        </div>
        <div v-if="filteredUsers.length === 0" class="text-center text-xs text-gray-400 py-2">
          没有找到用户
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '../stores/user'

const props = defineProps({
  show: Boolean,
  targetId: String,
  onSelect: Function
})

const emit = defineEmits(['select'])

const userStore = useUserStore()
const showPopup = computed(() => props.show)

const filteredUsers = computed(() => {
  if (!props.targetId || !props.targetId.trim()) {
    return userStore.users.slice(0, 5)
  }
  return userStore.users.filter(u =>
    u.username.toLowerCase().includes(props.targetId.toLowerCase())
  ).slice(0, 5)
})

function closePopup() {
  emit('close')
}

function selectUser(user) {
  emit('select', user)
}
</script>

<style scoped>
.mention-popup {
  position: absolute;
  z-index: 100;
}

.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
