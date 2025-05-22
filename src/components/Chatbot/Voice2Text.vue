<template>
  <div class="md:mx-2 flex flex-row">
    <div v-if="isRecording" class="recording-dots mx-2">
      <div class="dot"></div>
      <div class="dot"></div>
      <div class="dot"></div>
    </div>
    <Button class="!p-2 !rounded-2xl !mx-2" @click="toggleRecording">
      <template #icon>
        <i v-if="!isRecording" class="pi pi-microphone"></i>
        <i v-else class="pi pi-stop-circle"></i>
      </template>
    </Button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Button from 'primevue/button'
import apiClient from '@/api/axiosClient'

// 發出轉換結果給父層
const emit = defineEmits(['update:inputMessage'])

const isRecording = ref(false)
let mediaRecorder: MediaRecorder | null = null
let chunks: Blob[] = []
let audioStream: MediaStream | null = null

// 用於無聲檢測
let audioContext: AudioContext | null = null
let analyser: AnalyserNode | null = null
let dataArray: Uint8Array | null = null
let silenceInterval: number | null = null
let silenceStart: number | null = null

// 門檻設定：平均偏差低於這個值視為無聲（可根據環境調整）
const SILENCE_THRESHOLD = 5
// 無聲持續時間 10 秒
const SILENCE_DURATION = 5 * 1000

const checkSilence = () => {
  if (!analyser || !dataArray) return
  // 取得時間域資料
  analyser.getByteTimeDomainData(dataArray)
  let sum = 0
  for (let i = 0; i < dataArray.length; i++) {
    // 取絕對值差異
    sum += Math.abs(dataArray[i] - 128)
  }
  const avg = sum / dataArray.length
  // 如果平均低於門檻，視為無聲
  if (avg < SILENCE_THRESHOLD) {
    if (silenceStart === null) {
      silenceStart = Date.now()
    } else {
      const elapsed = Date.now() - silenceStart
      if (elapsed >= SILENCE_DURATION) {
        // 超過 10 秒無聲，自動停止錄音
        stopRecording()
      }
    }
  } else {
    // 有聲時重置計時器
    silenceStart = null
  }
}

const startSilenceCheck = () => {
  // 每 250 毫秒檢查一次
  silenceInterval = window.setInterval(checkSilence, 250)
}

const stopSilenceCheck = () => {
  if (silenceInterval !== null) {
    clearInterval(silenceInterval)
    silenceInterval = null
  }
  silenceStart = null
}

const stopRecording = async () => {
  // 停止無聲檢查
  stopSilenceCheck()
  // 結束錄音
  mediaRecorder?.stop()
  isRecording.value = false
  // 關閉 AudioContext
  if (audioContext) {
    audioContext.close()
    audioContext = null
  }
}

const toggleRecording = async () => {
  if (!isRecording.value) {
    // 錄音開始前先清空父層訊息
    emit('update:inputMessage', '')
    // 取得音訊串流
    audioStream = await navigator.mediaDevices.getUserMedia({ audio: true })

    // 建立 AudioContext 與 Analyser 用於檢測音量
    audioContext = new AudioContext()
    const source = audioContext.createMediaStreamSource(audioStream)
    analyser = audioContext.createAnalyser()
    analyser.fftSize = 256
    source.connect(analyser)
    dataArray = new Uint8Array(analyser.frequencyBinCount)

    // 開始無聲檢測
    startSilenceCheck()

    // 建立並啟動錄音機
    mediaRecorder = new MediaRecorder(audioStream)
    chunks = []
    mediaRecorder.ondataavailable = (event) => {
      chunks.push(event.data)
    }
    mediaRecorder.onstop = async () => {
      // 停止所有音訊 tracks
      if (audioStream) {
        audioStream.getTracks().forEach((track) => track.stop())
        audioStream = null
      }
      const blob = new Blob(chunks, { type: 'audio/webm' })
      const formData = new FormData()
      formData.append('audio', blob, 'recording.webm')
      const response = await fetch(`${apiClient.defaults.baseURL}/transcribe`, {
        method: 'POST',
        body: formData
      })
      const data = await response.json()
      emit('update:inputMessage', data.text)
    }
    mediaRecorder.start()
    isRecording.value = true
  } else {
    // 手動停止錄音時，也停止無聲檢測
    stopSilenceCheck()
    mediaRecorder?.stop()
    isRecording.value = false
    if (audioContext) {
      audioContext.close()
      audioContext = null
    }
  }
}
</script>

<style scoped>
.recording-dots {
  display: flex;
  gap: 8px;
  margin-top: 10px;
  justify-content: center;
  align-items: center;
}

.dot {
  width: 0.5rem;
  height: 0.5rem;
  background-color: #333;
  border-radius: 50%;
  animation: pulse 1s infinite;
}

.dot:nth-child(1) {
  animation-delay: 0s;
}
.dot:nth-child(2) {
  animation-delay: 0.2s;
}
.dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.4;
  }
  50% {
    transform: scale(1.5);
    opacity: 0.7;
  }
}
</style>
