<template>
  <div class="h-full flex flex-col">
    <div v-if="personGraphStage === 'generating'" class="flex-1 flex items-center justify-center text-gray-500">
      正在生成人物關係圖...
    </div>
    <div v-else-if="!json || !json.trim()" class="flex-1 flex items-center justify-center text-gray-400">（尚未有資料）</div>
    <div v-else-if="!isValidJson" class="h-full flex flex-col">
      <div class="text-red-500 mb-2">JSON 格式錯誤，請檢查內容！</div>
      <pre class="bg-gray-100 p-2 rounded overflow-auto text-sm flex-1">{{ json }}</pre>
    </div>
    <div v-else class="h-full">
      <VisNetworkGraph :graphJson="json" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSessionStore } from '@/stores/useSessionStore'
import VisNetworkGraph from './vis-network/VisNetworkGraph.vue'

const sessionStore = useSessionStore()

// 從 store 中獲取人物關係圖數據
const json = computed(() => sessionStore.personGraphJson)
const personGraphStage = computed(() => sessionStore.personGraphStage)

const isValidJson = computed(() => {
  if (!json.value) return false
  try {
    JSON.parse(json.value)
    return true
  } catch {
    return false
  }
})
</script>

<style scoped>
pre {
  white-space: pre-wrap;
  word-break: break-all;
}
</style> 