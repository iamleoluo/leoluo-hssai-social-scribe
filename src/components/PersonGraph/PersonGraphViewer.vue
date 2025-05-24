<template>
  <div>
    <label class="font-semibold">人物關係圖 JSON 檢視：</label>
    <pre class="bg-gray-100 p-2 rounded overflow-x-auto text-sm min-h-[100px]">{{ prettyJson }}</pre>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps<{ json: string }>()
const prettyJson = computed(() => {
  if (!props.json) return '（尚未有資料）'
  try {
    return JSON.stringify(JSON.parse(props.json), null, 2)
  } catch {
    return 'JSON 格式錯誤，請檢查內容！'
  }
})
</script>

<style scoped>
pre {
  white-space: pre-wrap;
  word-break: break-all;
}
</style> 