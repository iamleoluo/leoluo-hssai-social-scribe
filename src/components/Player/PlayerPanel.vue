<template>
  <div class="w-full mx-auto">
    <button
      @click="togglePlay"
      class="bg-red-500 hover:bg-red-700 text-white px-4 py-2 rounded flex items-center mx-auto"
    >
      <img :src="isPlaying ? pauseIcon : playIcon" class="h-5 mr-2" alt="play-pause" />
      {{ isPlaying ? '暫停播放' : '播放錄音' }}
    </button>
    <div class="flex justify-between text-sm text-gray-600 mb-1 px-1">
      <span>{{ formatTime(currentTime) }}</span>
      <span>{{ formatTime(totalTime) }}</span>
    </div>
    <div ref="waveformRef" class="mb-4"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import WaveSurfer from 'wavesurfer.js'
import playIcon from '@/assets/play.png'
import pauseIcon from '@/assets/pause.png'

const props = defineProps<{ file: File }>()

const waveformRef = ref<HTMLDivElement | null>(null)
const wavesurfer = ref<WaveSurfer | null>(null)

const isPlaying = ref(false)
const currentTime = ref(0)
const totalTime = ref(0)

const formatTime = (s: number) => {
  const minutes = Math.floor(s / 60)
  const seconds = Math.floor(s % 60)
    .toString()
    .padStart(2, '0')
  return `${minutes}:${seconds}`
}

const togglePlay = () => {
  if (wavesurfer.value) {
    wavesurfer.value.playPause()
    isPlaying.value = wavesurfer.value.isPlaying()
  }
}

watch(currentTime, (val) => {
  if (wavesurfer.value && !wavesurfer.value.isPlaying()) {
    isPlaying.value = false
  }
})

onMounted(() => {
  const reader = new FileReader()
  reader.onload = () => {
    const blob = reader.result as ArrayBuffer

    wavesurfer.value = WaveSurfer.create({
      container: waveformRef.value!,
      waveColor: '#999',
      progressColor: '#7e5bef',
      height: 60,
      responsive: true,
      barWidth: 2
    })

    wavesurfer.value.loadBlob(new Blob([blob]))

    wavesurfer.value.on('ready', () => {
      totalTime.value = wavesurfer.value!.getDuration()
    })

    wavesurfer.value.on('audioprocess', () => {
      currentTime.value = wavesurfer.value!.getCurrentTime()
    })

    wavesurfer.value.on('finish', () => {
      isPlaying.value = false
      currentTime.value = 0
    })
  }
  reader.readAsArrayBuffer(props.file)
})

onUnmounted(() => {
  wavesurfer.value?.destroy()
})
</script>
