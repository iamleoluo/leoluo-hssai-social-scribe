<template>
  <!-- <div
    class="w-1/2 p-6 border-l transition-opacity duration-500 ease-in-out"
    v-if="store.hasSubmitted && store.reportText.trim() !== ''"
  > -->
  <div class="w-full px-2 transition-opacity duration-1000 ease-in-out text-gray-800">
    <!-- <label class="block mb-2 text-lg font-semibold">AI 生成報告</label> -->
    <Message v-if="sessionStore.reportStage === 'generating'">{{ stageMessage }}</Message>
    <div class="pt-6 pb-3 mb-4 px-4 rounded-xl bg-slate-100">
      <div class="text-md font-semibold flex mb-2">
        <img src="@/assets/settings.png" alt="start-record-icon" class="h-5 mr-2" />
        生成報告設定如下：
      </div>
      <div>
        <div class="mb-2">1. 當前選擇的報告模板：{{ sessionStore.selectedTemplate }}</div>
        <div class="mb-2">
          2. 生成報告包含下列內容：
          <span v-for="item in templateMessages" :key="item"> {{ item }} |</span>
        </div>
      </div>
    </div>
    <template v-if="sessionStore.reportStage === 'generating'">
      <!-- 模擬 textarea 的骨架 loading 區塊 -->
      <div class="w-full h-64 border p-2 rounded animate-pulse space-y-2">
        <div class="flex space-x-2">
          <div class="h-4 bg-gray-200 rounded w-[60%]"></div>
          <div class="h-4 bg-gray-200 rounded w-[20%]"></div>
        </div>
        <div class="h-4 bg-gray-200 rounded w-[90%]"></div>
        <div class="flex space-x-5">
          <div class="h-4 bg-gray-200 mb-4 rounded w-[30%]"></div>
          <div class="h-4 bg-gray-200rounded w-[40%]"></div>
        </div>
        <div class="h-4 bg-gray-200 rounded w-[85%]"></div>
        <div class="h-4 bg-gray-200 rounded w-[50%]"></div>
        <div class="flex space-x-1">
          <div class="h-4 bg-gray-200 mb-6 rounded w-[40%]"></div>
          <div class="h-4 bg-gray-200 rounded w-[30%]"></div>
          <div class="h-4 bg-gray-200 rounded w-[15%]"></div>
        </div>
        <div class="h-4 bg-gray-200 rounded w-[70%]"></div>
        <div class="flex space-x-2">
          <div class="h-4 bg-gray-200 rounded w-[45%]"></div>
          <div class="h-4 bg-gray-200 rounded w-[35%]"></div>
        </div>
      </div>
    </template>

    <template v-else>
      <textarea class="w-full min-h-[50vh] border p-2 rounded" v-model="sessionStore.reportText" />
      <div class="w-full mx-auto flex justify-center space-x-4">
        <button
          class="flex justify-center items-center text-center mt-4 bg-amber-500 text-white px-4 py-2 rounded hover:bg-amber-700"
          @click="download"
        >
          <img src="@/assets/downloads.png" alt="icon" class="h-5 mr-1" />
          下載報告
        </button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Message from 'primevue/message'
import { useSessionStore } from '@/stores/useSessionStore'
import { reportStageMessageMap, templateMessageMap } from '@/utils/stageMessages'
const sessionStore = useSessionStore()
const stageMessage = computed(() => reportStageMessageMap[sessionStore.reportStage])
const templateMessages = computed(() => templateMessageMap[sessionStore.selectedTemplate])
const download = () => {
  const text = sessionStore.reportText.trim()
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
