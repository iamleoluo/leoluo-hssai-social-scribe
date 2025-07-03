<template>
  <div class="w-full h-full p-4">
    <!-- 標題和切換區域 -->
    <div class="mb-4">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-bold">關係圖分析</h2>
        
        <!-- 圖表類型切換 -->
        <div class="flex bg-gray-100 rounded-lg p-1">
          <button 
            @click="switchGraphType('person')"
            :class="[
              'px-4 py-2 text-sm font-medium rounded-md transition-all',
              currentGraphType === 'person' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            ]"
          >
            <i class="pi pi-users mr-2"></i>
            通用關係圖
          </button>
          <button 
            @click="switchGraphType('family')"
            :class="[
              'px-4 py-2 text-sm font-medium rounded-md transition-all',
              currentGraphType === 'family' 
                ? 'bg-white text-green-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            ]"
          >
            <i class="pi pi-home mr-2"></i>
            家庭關係圖
          </button>
        </div>
      </div>
      
      <!-- 類型說明 -->
      <p class="text-sm text-gray-600 mt-2">
        <span v-if="currentGraphType === 'person'">
          分析所有人際關係、社會網絡、朋友同事等互動關係
        </span>
        <span v-else>
          專注家庭結構、血緣關係、婚姻關係、居住安排等家庭內部關係
        </span>
      </p>
    </div>
    
    <!-- 左右佈局 -->
    <div class="flex gap-4">
      <!-- 左側：關係圖顯示區 -->
      <div class="flex-1 h-[calc(100vh-120px)]">
        <PersonGraphViewer :graph-type="currentGraphType" />
      </div>
      
      <!-- 右側：對話區 -->
      <div class="flex-1 h-[calc(100vh-120px)]">
        <!-- 統一使用PersonGraphChat組件，支持兩種圖表類型 -->
        <PersonGraphChat :graph-type="currentGraphType" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import PersonGraphViewer from './PersonGraphViewer.vue'
import PersonGraphChat from './PersonGraphChat.vue'

// 當前圖表類型狀態
const currentGraphType = ref<'person' | 'family'>('person')

// 切換圖表類型
const switchGraphType = (type: 'person' | 'family') => {
  currentGraphType.value = type
  console.log(`切換到${type === 'person' ? '通用關係圖' : '家庭關係圖'}模式`)
}
</script>

