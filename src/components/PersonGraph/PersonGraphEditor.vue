<template>
  <div class="w-full max-w-3xl mx-auto p-4">
    <h2 class="text-lg font-bold mb-2">人物關係圖</h2>
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
    <PersonGraphViewer :json="jsonText" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSessionStore } from '@/stores/useSessionStore'
import PersonGraphViewer from './PersonGraphViewer.vue'

const sessionStore = useSessionStore()
const transcript = ref('')
const jsonText = ref('')
const loading = ref(false)
const renderResult = ref('')

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
  jsonText.value = ''
  renderResult.value = ''
  try {
    const response = await fetch('/PersonGraph', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: transcript.value })
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
          content += obj.content // 累加所有 content
        } catch (e) {
          // 忽略解析錯誤
        }
      }
    }
    jsonText.value = content
  } catch (err) {
    alert('生成失敗: ' + err)
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
  // 只做格式校驗和提示，圖形會自動刷新
  try {
    JSON.parse(jsonText.value)
    renderResult.value = '格式正確，已嘗試渲染圖形'
    // 強制觸發 Vue 更新（可選）
    jsonText.value = jsonText.value
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