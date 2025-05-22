<template>
  <BasicLayout>
    <Button @click="toggleRecording">
      <template #icon>
        <i v-if="!isRecording" class="pi pi-microphone"></i>
        <i v-else class="pi pi-stop-circle"></i>
      </template>
    </Button>
    <div v-if="isRecording" class="recording-dots">
      <div class="dot"></div>
      <div class="dot"></div>
      <div class="dot"></div>
    </div>
    {{ result }}
  </BasicLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BasicLayout from '@/components/BasicLayout.vue'
import Button from 'primevue/button'
import apiClient from '@/api/axiosClient'

const isRecording = ref(false)
let mediaRecorder: MediaRecorder | null = null
let chunks: Blob[] = []
let audioStream: MediaStream | null = null

const result = ref('')

const toggleRecording = async () => {
  if (!isRecording.value) {
    // 開始錄音，取得音訊串流
    audioStream = await navigator.mediaDevices.getUserMedia({ audio: true })
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
      result.value = data.text
    }
    mediaRecorder.start()
    isRecording.value = true
  } else {
    // 停止錄音
    mediaRecorder?.stop()
    isRecording.value = false
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
  width: 10px;
  height: 10px;
  background-color: #333;
  border-radius: 50%;
  animation: pulse 1s infinite;
}

/* 透過不同的 animation delay 製造出依序律動的效果 */
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
