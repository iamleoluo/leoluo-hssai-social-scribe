<template>
  <div class="h-full flex flex-col">
    <div v-if="currentGraphStage === 'generating'" class="flex-1 flex items-center justify-center text-gray-500">
      <div class="text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
        <div>正在生成{{ graphType === 'person' ? '通用關係圖' : '家庭關係圖' }}...</div>
      </div>
    </div>
    <div v-else-if="!currentJson || !currentJson.trim()" class="flex-1 flex items-center justify-center text-gray-400">
      <div class="text-center">
        <i :class="graphType === 'person' ? 'pi pi-users' : 'pi pi-home'" class="text-4xl mb-2"></i>
        <div>尚未有{{ graphType === 'person' ? '通用關係圖' : '家庭關係圖' }}資料</div>
      </div>
    </div>
    <div v-else-if="!isValidJson" class="h-full flex flex-col">
      <div class="text-red-500 mb-2">JSON 格式錯誤，請檢查內容！</div>
      <pre class="bg-gray-100 p-2 rounded overflow-auto text-sm flex-1">{{ currentJson }}</pre>
    </div>
    <div v-else class="h-full">
      <!-- 人物關係圖使用 vis.js -->
      <VisNetworkGraph 
        v-if="graphType === 'person'" 
        :graphJson="currentJson" 
      />
      <!-- 家庭關係圖使用 Canvas -->
      <CanvasFamilyTreeGraph 
        v-else-if="graphType === 'family'" 
        :graphData="parsedFamilyData" 
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePersonGraphStore } from '@/stores/modules/personGraphStore'
import VisNetworkGraph from './vis-network/VisNetworkGraph.vue'
import CanvasFamilyTreeGraph from './family-tree/CanvasFamilyTreeGraph.vue'

// Props
interface Props {
  graphType: 'person' | 'family'
}

const props = withDefaults(defineProps<Props>(), {
  graphType: 'person'
})

const personGraphStore = usePersonGraphStore()

// 根據圖表類型獲取對應數據
const currentJson = computed(() => personGraphStore.getGraphJson(props.graphType))
const currentGraphStage = computed(() => personGraphStore.getGraphStage(props.graphType))

const isValidJson = computed(() => {
  if (!currentJson.value) return false
  try {
    JSON.parse(currentJson.value)
    return true
  } catch {
    return false
  }
})

// 解析家庭關係圖數據
const parsedFamilyData = computed(() => {
  if (props.graphType !== 'family' || !currentJson.value || !isValidJson.value) return []
  try {
    const parsed = JSON.parse(currentJson.value)
    console.log('PersonGraphViewer: 解析家庭關係圖數據', parsed)
    return parsed
  } catch {
    console.log('PersonGraphViewer: 解析家庭關係圖數據失敗')
    return []
  }
})
</script>

<style scoped>
pre {
  white-space: pre-wrap;
  word-break: break-all;
}
</style> 