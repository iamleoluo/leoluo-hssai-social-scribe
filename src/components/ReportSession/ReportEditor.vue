<template>
  <div>
    <textarea
      class="w-full min-h-[50vh] border p-2 rounded"
      v-model="sessionStore.reportText"
      :readonly="sessionStore.reportStage === 'generating'"
    />
    <div v-if="sessionStore.reportStage === 'generating'" class="text-gray-500 mt-2">
      正在產生報告初稿...
    </div>
    <div v-else>
      <div class="w-full mx-auto flex justify-center space-x-4">
        <button
          class="flex justify-center items-center text-center mt-4 bg-amber-500 text-white px-4 py-2 rounded hover:bg-amber-700"
          @click="download"
        >
          <img src="@/assets/downloads.png" alt="icon" class="h-5 mr-1" />
          下載報告
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Message from 'primevue/message'
import { useSessionStore } from '@/stores/useSessionStore'
import { storeToRefs } from 'pinia'
import { reportStageMessageMap, templateMessageMap } from '@/utils/stageMessages'

const sessionStore = useSessionStore()
const { reportText, reportStage, selectedTemplate } = storeToRefs(sessionStore)

const stageMessage = computed(() => reportStageMessageMap[reportStage.value])
const templateMessages = computed(() => {
  const template = selectedTemplate.value as keyof typeof templateMessageMap
  return templateMessageMap[template] || []
})

const download = () => {
  const text = reportText.value.trim()
  if (!text) {
    alert('沒有可下載的內容')
    return
  }

  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = 'report.txt'
  a.click()

  URL.revokeObjectURL(url)
}
</script>
