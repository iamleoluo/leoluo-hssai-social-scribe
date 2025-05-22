<template>
  <section
    class="relative text-white text-center overflow-hidden transition-all duration-500"
    :class="store.hasUploaded ? 'h-[400px]' : 'h-[calc(100vh)]'"
  >
    <!-- 背景圖層 -->
    <div
      class="absolute inset-0 z-0"
      :style="`background-image: url(${bgUrl}); background-size: cover; background-position: center;`"
    ></div>

    <!-- 遮罩層 -->
    <div class="absolute inset-0 bg-black bg-opacity-40 z-10"></div>

    <div class="relative z-10 flex flex-col items-center justify-center h-full px-4">
      <h1 class="text-3xl font-bold mb-2">社工專屬的智慧報告助手</h1>
      <p class="text-lg mb-6">支援錄音上傳與逐字稿產出，AI自動生成訪視報告，效率再升級。</p>

      <div class="space-x-4 flex">
        <input
          type="file"
          accept="audio/*"
          class="hidden"
          ref="audioInput"
          @change="handleAudioUpload"
        />
        <button
          class="flex bg-purple-700 text-white px-4 py-2 rounded hover:bg-purple-800"
          @click="triggerAudioInput"
        >
          <img src="@/assets/microphone.png" alt="start-record-icon" class="h-5 mr-1" />
          上傳錄音檔
        </button>

        <input
          type="file"
          accept=".txt"
          class="hidden"
          ref="textInput"
          @change="handleTranscriptUpload"
        />
        <button
          class="flex bg-gray-50 text-purple-700 px-4 py-2 rounded border border-purple-700 hover:bg-gray-300"
          @click="triggerTextInput"
        >
          <img src="@/assets/document.png" alt="start-record-icon" class="h-5 mr-1" />
          上傳逐字稿
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import bgUrl from '@/assets/banner-background-img.png'
import { useSessionStore } from '../../stores/useSessionStore'
import apiClient from '@/api/axiosClient'
import { handleAudioUpload } from '@/utils/handleAudioUpload'

const props = defineProps<{
  scrollTarget: HTMLElement | null
}>()

const scrollToEditor = () => {
  props.scrollTarget?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const audioInput = ref<HTMLInputElement | null>(null)
const textInput = ref<HTMLInputElement | null>(null)
const store = useSessionStore()

const triggerAudioInput = () => audioInput.value?.click()
const triggerTextInput = () => textInput.value?.click()

const correctTranscriptWithOpenAI = async (transcript: string) => {
  store.setTranscriptStage('correcting')

  const systemPrompt = `你是一位中文逐字稿校對助手，請幫我修正語音辨識轉換的逐字稿中可能錯誤的字詞。不要改變語意，只做錯字修正，並在適當的時候加上換行符號增加可讀性。`

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: transcript }
      ],
      temperature: 0.2
    })
  })

  const data = await response.json()
  const correctedText = data.choices?.[0]?.message?.content?.trim()

  if (correctedText) {
    store.setTranscriptText(correctedText)
  } else {
    console.warn('GPT 回傳內容為空，保留原始逐字稿')
  }
}

// TODO: 處理 API

const handleAudioUpload = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  store.reset()

  store.setAudioFile(file)
  store.setTranscriptStage('transcribing')

  try {
    const formData = new FormData()
    formData.append('audio', file, file.name || 'recording.webm')

    const response = await fetch(`${apiClient.defaults.baseURL}/transcribe`, {
      method: 'POST',
      body: formData
    })

    const data = await response.json()
    const transcript = data.text?.trim()

    if (!transcript) throw new Error('轉錄結果為空')
    store.setTranscriptText(transcript)

    // ✅ 接著送給 OpenAI 做校正
    await correctTranscriptWithOpenAI(transcript)
    scrollToEditor()
  } catch (e) {
    console.error('轉錄失敗', e)
    store.setTranscriptText('[轉錄失敗，請稍後再試]')
  } finally {
    store.setTranscriptStage('done')
  }
}

const handleTranscriptUpload = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    store.reset()
    store.setTranscriptFile(file)

    const reader = new FileReader()
    reader.onload = () => {
      const text = reader.result as string
      store.setTranscriptText(text)
      scrollToEditor()
    }
    reader.onerror = () => {
      console.error('讀取逐字稿檔案失敗')
    }

    reader.readAsText(file, 'utf-8') // 可改成 'big5' 等編碼
  }
}
</script>
