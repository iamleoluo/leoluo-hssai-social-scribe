<template>
  <div class="transition-all duration-1000 ease-in-out w-full text-gray-800">
    <Message v-if="sessionStore.transcriptStage !== 'idle'">{{ stageMessage }}</Message>

    <template
      v-if="
        sessionStore.transcriptStage === 'transcribing' ||
        sessionStore.transcriptStage === 'correcting'
      "
    >
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
      <textarea
        ref="textareaRef"
        class="w-full h-auto min-h-[50vh] border p-2 rounded resize-none"
        v-model="sessionStore.transcriptText"
      />
      <div class="w-full mx-auto flex justify-center space-x-4">
        <button
          class="flex justify-center items-center text-center mt-4 bg-amber-500 text-white px-4 py-2 rounded hover:bg-amber-700"
          @click="download"
        >
          <img src="@/assets/downloads.png" alt="icon" class="h-5 mr-1" />
          下載逐字稿
        </button>

        <!-- <button
          class="mt-4 text-purple-700 px-4 py-2 flex rounded border border-purple-700 hover:bg-gray-50"
          @click="submit"
        >
          <img src="@/assets/add.png" alt="generate-icon" class="h-5 mr-1" />
          生成報告
        </button> -->
        <SplitButton
          label="submit"
          class="mt-4 text-purple-700 flex"
          :model="templateOptions"
          severity="help"
          ref="splitButtonRef"
          @click="openMenu"
        >
          <img src="@/assets/add.png" alt="icon" class="h-5 mr-1" />
          生成報告
        </SplitButton>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import axios from 'axios'
import Message from 'primevue/message'
import { useSessionStore } from '@/stores/useSessionStore'
import { storeToRefs } from 'pinia'
import { transcriptStageMessageMap } from '@/utils/stageMessages'
import SplitButton from 'primevue/splitbutton'

const sessionStore = useSessionStore()
const { 
  transcriptStage, 
  transcriptText, 
  reportText, 
  sessionId, 
  activeTabIndex, 
  autoGeneratePersonGraph 
} = storeToRefs(sessionStore)

const stageMessage = computed(() => transcriptStageMessageMap[transcriptStage.value])

// 初始化會話ID
onMounted(() => {
  sessionStore.initializeSession()
})

const splitButtonRef = ref<InstanceType<typeof SplitButton> | null>(null)

const openMenu = () => {
  const menuBtn = (splitButtonRef.value as any)?.$el?.querySelector(
    '[data-pc-name="menubutton"]'
  ) as HTMLElement

  if (menuBtn) {
    menuBtn.focus()
    menuBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  } else {
    console.warn('找不到 SplitButton 的 menu button')
  }
}

const templates = [
  '司法社工家庭訪視模板',
  '士林地院家事服務中心格式(ChatGPT)',
  '士林地院家事服務中心格式(Claude)',
  '珍珠社會福利協會格式(ChatGPT)',
  '珍珠社會福利協會格式(Claude)'
]

const templateOptions = templates.map((template) => ({
  label: template,
  command: () => {
    sessionStore.setSelectedTemplate(template)
    generateReportStream(template)
  }
}))

const generateReportStream = async (template: string) => {
  sessionStore.setSelectedTemplate(template)
  const transcript = transcriptText.value?.trim()
  if (!transcript) {
    alert('目前尚未有逐字稿內容')
    return
  }
  sessionStore.setReportStage('generating')
  sessionStore.setReportText('') // 清空
  activeTabIndex.value = 1

  try {
    const response = await fetch('/api/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        text: transcript,
        template: template,  // 新增模板參數
        sessionId: sessionId.value
      })
    })
    if (!response.body) {
      sessionStore.setReportStage('done')
      return
    }
    const reader = response.body.getReader()
    const decoder = new TextDecoder('utf-8')
    let buffer = ''
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      let lines = buffer.split('\n')
      buffer = lines.pop() || ''
      for (const line of lines) {
        if (!line.trim()) continue
        try {
          const obj = JSON.parse(line)
          sessionStore.setReportText(reportText.value + obj.content)
        } catch (e) {
          // 可加錯誤處理
        }
      }
    }
    sessionStore.setReportStage('done')
    
    // 報告生成完成後，如果啟用自動生成人物關係圖，則自動觸發
    if (autoGeneratePersonGraph.value) {
      await generatePersonGraphFromReport()
    }
  } catch (err) {
    console.error('生成報告失敗', err)
    sessionStore.setReportText('[生成失敗，請稍後再試]')
    sessionStore.setReportStage('done')
  }
}

// 新增：從報告自動生成人物關係圖
const generatePersonGraphFromReport = async () => {
  const reportTextValue = reportText.value?.trim()
  if (!reportTextValue) {
    console.warn('沒有報告內容，無法生成人物關係圖')
    return
  }

  sessionStore.setPersonGraphStage('generating')
  sessionStore.setPersonGraphJson('') // 清空

  try {
    const response = await fetch('/api/PersonGraph', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        text: reportTextValue,  // 使用報告內容而不是逐字稿
        sessionId: sessionId.value
      })
    })
    if (!response.body) {
      sessionStore.setPersonGraphStage('done')
      return
    }
    const reader = response.body.getReader()
    const decoder = new TextDecoder('utf-8')
    let buffer = ''
    let content = ''
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      let lines = buffer.split('\n')
      buffer = lines.pop() || ''
      for (const line of lines) {
        if (!line.trim()) continue
        try {
          const obj = JSON.parse(line)
          content += obj.content // 累加所有 content
        } catch (e) {
          // 忽略解析錯誤
        }
      }
    }
    sessionStore.setPersonGraphJson(content)
    sessionStore.setPersonGraphStage('done')
    console.log('人物關係圖自動生成完成')
  } catch (err) {
    console.error('生成人物關係圖失敗', err)
    sessionStore.setPersonGraphStage('done')
  }
}

const download = () => {
  const text = transcriptText.value.trim()
  if (!text) {
    alert('沒有可下載的內容')
    return
  }

  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = 'transcript.txt'
  a.click()

  URL.revokeObjectURL(url)
}
</script>
