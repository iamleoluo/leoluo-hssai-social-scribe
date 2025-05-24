<template>
  <div>
    <div v-if="!json || !json.trim()" class="text-gray-400">（尚未有資料）</div>
    <div v-else-if="!isValidJson">
      <div class="text-red-500">JSON 格式錯誤，請檢查內容！</div>
      <pre class="bg-gray-100 p-2 rounded overflow-x-auto text-sm">{{ json }}</pre>
    </div>
    <div v-else>
      <VisNetworkGraph :graphJson="json" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import VisNetworkGraph from './vis-network/VisNetworkGraph.vue'
const props = defineProps<{ json: string }>()

const isValidJson = computed(() => {
  if (!props.json) return false
  try {
    JSON.parse(props.json)
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