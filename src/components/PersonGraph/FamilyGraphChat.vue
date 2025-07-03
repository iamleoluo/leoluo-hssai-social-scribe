<template>
  <div class="h-full flex flex-col p-4">
    <h2 class="text-lg font-bold mb-4">家庭關係圖智能編輯</h2>
    
    <!-- 上下文信息顯示 -->
    <div class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <h3 class="text-sm font-semibold text-blue-800 mb-2">AI 可用的上下文信息：</h3>
      <div class="flex flex-wrap gap-4 text-sm text-blue-700">
        <div class="flex items-center">
          <span class="w-2 h-2 rounded-full mr-2" :class="sessionStore.transcriptText ? 'bg-green-500' : 'bg-gray-400'"></span>
          逐字稿 ({{ sessionStore.transcriptText ? `${sessionStore.transcriptText.length} 字符` : '無' }})
        </div>
        <div class="flex items-center">
          <span class="w-2 h-2 rounded-full mr-2" :class="currentGraphJson ? 'bg-green-500' : 'bg-gray-400'"></span>
          家庭關係圖 ({{ currentGraphJson ? '已載入' : '無' }})
        </div>
        <div class="flex items-center">
          <span class="w-2 h-2 rounded-full mr-2" :class="sessionStore.reportText ? 'bg-green-500' : 'bg-gray-400'"></span>
          報告內容 ({{ sessionStore.reportText ? '已生成' : '無' }})
        </div>
      </div>
    </div>
    
    <!-- 對話歷史區域 -->
    <div class="border rounded-lg p-4 mb-4 flex-1 overflow-y-auto bg-gray-50">
      <div v-if="chatHistory.length === 0" class="text-gray-500 text-center py-8">
        開始對話來編輯您的家庭關係圖...
      </div>
      
      <div v-for="(message, index) in chatHistory" :key="index" class="mb-4">
        <!-- 用戶消息 -->
        <div v-if="message.role === 'user'" class="flex justify-end">
          <div class="bg-blue-500 text-white rounded-lg px-4 py-2 max-w-xs">
            {{ message.content }}
          </div>
        </div>
        
        <!-- AI 回應 -->
        <div v-else class="flex justify-start">
          <div class="bg-white border rounded-lg px-4 py-2 max-w-xs">
            {{ message.content }}
          </div>
        </div>
      </div>
      
      <!-- 載入中指示器 -->
      <div v-if="isLoading" class="flex justify-start">
        <div class="bg-white border rounded-lg px-4 py-2">
          <div class="flex items-center space-x-2">
            <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            <span>AI 正在思考...</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 輸入區域 -->
    <div class="flex space-x-2 mb-4">
      <input
        v-model="userInput"
        @keyup.enter="sendMessage"
        :disabled="isLoading"
        class="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="例如：請移除張三這個角色，或者：請加強李四和王五的關係..."
      />
      <button
        @click="sendMessage"
        :disabled="isLoading || !userInput.trim()"
        class="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
      >
        發送
      </button>
    </div>
    
    <!-- 快速指令按鈕 -->
    <div class="mt-auto">
      <p class="text-sm text-gray-600 mb-2">快速指令：</p>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="quickCommand in quickCommands"
          :key="quickCommand"
          @click="userInput = quickCommand"
          class="text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-full"
        >
          {{ quickCommand }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useSessionStore } from '@/stores/useSessionStore'
import { usePersonGraphStore } from '@/stores/modules/personGraphStore'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const sessionStore = useSessionStore()
const personGraphStore = usePersonGraphStore()
const userInput = ref('')
const isLoading = ref(false)
const chatHistory = ref<ChatMessage[]>([])

// 家庭關係圖專用的快速指令
const quickCommands = computed(() => [
  '請基於逐字稿重新生成家庭關係圖',
  '請突出血緣關係和婚姻關係',
  '請標示居住安排和同住成員',
  '請加強世代關係的層級結構',
  '請添加逐字稿中提到的家庭成員',
  '請重新組織家庭結構使其更清晰'
])

// 獲取當前圖表的JSON數據
const currentGraphJson = computed(() => personGraphStore.getGraphJson('family'))

onMounted(() => {
  // 如果有現有的關係圖，添加歡迎消息
  if (currentGraphJson.value) {
    const suggestions = '• 調整家庭結構\n• 添加或移除家庭成員\n• 修改血緣/婚姻關係\n• 重新組織世代層級'
    
    chatHistory.value.push({
      role: 'assistant',
      content: `我已經為您載入了現有的家庭關係圖。您可以告訴我需要如何修改，例如：\n${suggestions}`,
      timestamp: new Date()
    })
  }
})

async function sendMessage() {
  if (!userInput.value.trim() || isLoading.value) return
  
  const message = userInput.value.trim()
  
  // 添加用戶消息到歷史
  chatHistory.value.push({
    role: 'user',
    content: message,
    timestamp: new Date()
  })
  
  userInput.value = ''
  isLoading.value = true
  
  try {
    const response = await fetch('/api/PersonGraphChat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: message,
        currentGraph: currentGraphJson.value,
        transcript: sessionStore.transcriptText,
        sessionId: sessionStore.sessionId,
        graphType: 'family'  // 使用家庭關係圖類型
      })
    })
    
    if (!response.body) throw new Error('No response body')
    
    const reader = response.body.getReader()
    const decoder = new TextDecoder('utf-8')
    let buffer = ''
    let aiResponse = ''
    let newGraphJson = ''
    
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
          if (obj.type === 'response') {
            aiResponse += obj.content
          } else if (obj.type === 'graph') {
            // 直接使用完整的 JSON 內容，不再累加
            newGraphJson = obj.content
          }
        } catch (e) {
          // 忽略解析錯誤
        }
      }
    }
    
    // 添加 AI 回應到歷史
    if (aiResponse) {
      chatHistory.value.push({
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      })
    }
    
    // 更新關係圖
    if (newGraphJson) {
      try {
        // 驗證 JSON 格式
        JSON.parse(newGraphJson)
        personGraphStore.setGraphJson('family', newGraphJson)
      } catch (e) {
        console.error('接收到的 JSON 格式錯誤:', newGraphJson)
        chatHistory.value.push({
          role: 'assistant',
          content: '抱歉，生成的家庭關係圖格式有誤，請重試。',
          timestamp: new Date()
        })
      }
    }
    
  } catch (error) {
    console.error('發送消息失敗:', error)
    chatHistory.value.push({
      role: 'assistant',
      content: '抱歉，處理您的請求時發生錯誤，請稍後再試。',
      timestamp: new Date()
    })
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
/* 自定義滾動條 */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>