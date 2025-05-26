<template>
  <div class="w-full max-w-4xl mx-auto p-4">
    <h2 class="text-lg font-bold mb-4">人物關係圖</h2>
    
    <!-- 模式切換 -->
    <div class="mb-4">
      <div class="flex space-x-2">
        <button
          @click="editMode = 'auto'"
          :class="[
            'px-4 py-2 rounded-lg',
            editMode === 'auto' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
          ]"
        >
          智能對話編輯
        </button>
        <button
          @click="editMode = 'manual'"
          :class="[
            'px-4 py-2 rounded-lg',
            editMode === 'manual' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
          ]"
        >
          手動編輯
        </button>
      </div>
    </div>

    <!-- 智能對話編輯模式 -->
    <div v-if="editMode === 'auto'">
      <PersonGraphChat />
    </div>

    <!-- 手動編輯模式 -->
    <div v-else>
      <textarea
        v-model="transcript"
        class="w-full border rounded p-2 mb-2"
        rows="4"
        placeholder="請貼上逐字稿，或自動帶入逐字稿內容"
      ></textarea>
      <div class="mb-2">
        <button
          class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-800"
          :disabled="loading"
          @click="generateGraph"
        >
          {{ loading ? '生成中...' : '生成人物關係 JSON' }}
        </button>
      </div>
      <div>
        <label class="font-semibold">JSON 編輯區：</label>
        <textarea
          v-model="jsonText"
          class="w-full border rounded p-2 font-mono text-sm mb-2"
          rows="10"
          placeholder="這裡會顯示 AI 回傳的 JSON，可手動編輯..."
        ></textarea>
        <div class="flex space-x-2 mb-2">
          <button
            class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-800"
            :disabled="!jsonText"
            @click="copyJson"
          >複製 JSON</button>
          <button
            class="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-800"
            :disabled="!jsonText"
            @click="downloadJson"
          >下載 JSON</button>
          <button
            class="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-800"
            :disabled="!jsonText"
            @click="renderGraph"
          >渲染</button>
        </div>
      </div>
      <div>
        <label class="font-semibold">渲染結果：</label>
        <pre class="bg-gray-100 p-2 rounded overflow-x-auto text-sm min-h-[100px]">{{ renderResult }}</pre>
      </div>
    </div>

    <!-- 人物關係圖顯示 -->
    <div class="mt-6">
      <PersonGraphViewer />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useSessionStore } from '@/stores/useSessionStore'
import PersonGraphViewer from './PersonGraphViewer.vue'
import PersonGraphChat from './PersonGraphChat.vue'

const sessionStore = useSessionStore()
const transcript = ref('')
const loading = ref(false)
const renderResult = ref('')
const editMode = ref<'auto' | 'manual'>('auto')

// 使用 store 中的人物關係圖數據
const jsonText = computed({
  get: () => sessionStore.personGraphJson,
  set: (value: string) => {
    // 直接修改 store 中的值
    sessionStore.personGraphJson = value
  }
})

onMounted(() => {
  // 自動帶入逐字稿
  transcript.value = sessionStore.transcriptText || ''
})

async function generateGraph() {
  if (!transcript.value.trim()) {
    alert('請先輸入逐字稿內容')
    return
  }
  loading.value = true
  sessionStore.personGraphJson = ''
  sessionStore.personGraphStage = 'generating'
  renderResult.value = ''
  
  try {
    const response = await fetch('/api/PersonGraph', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        text: transcript.value,
        sessionId: sessionStore.sessionId
      })
    })
    if (!response.body) throw new Error('No response body')
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
          content += obj.content
        } catch (e) {
          // 忽略解析錯誤
        }
      }
    }
    sessionStore.personGraphJson = content
    sessionStore.personGraphStage = 'done'
  } catch (err) {
    alert('生成失敗: ' + err)
    sessionStore.personGraphStage = 'done'
  } finally {
    loading.value = false
  }
}

function copyJson() {
  if (!jsonText.value) return
  navigator.clipboard.writeText(jsonText.value)
  alert('已複製 JSON')
}

function downloadJson() {
  if (!jsonText.value) return
  const blob = new Blob([jsonText.value], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'person_graph.json'
  a.click()
  URL.revokeObjectURL(url)
}

function renderGraph() {
  try {
    JSON.parse(jsonText.value)
    renderResult.value = '格式正確，已嘗試渲染圖形'
    sessionStore.personGraphJson = jsonText.value
  } catch (e) {
    renderResult.value = 'JSON 格式錯誤，請檢查內容！'
  }
}
</script>

<style scoped>
pre {
  white-space: pre-wrap;
  word-break: break-all;
}
</style> 