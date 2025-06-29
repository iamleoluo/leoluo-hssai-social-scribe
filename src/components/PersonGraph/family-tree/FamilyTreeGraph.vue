<template>
  <div class="family-tree-container">
    <div ref="familyTreeRef" class="family-tree-wrapper"></div>
    <div v-if="isLoading" class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
      <div class="text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
        <div class="text-gray-600">正在載入家族樹...</div>
      </div>
    </div>
    <div v-if="error" class="absolute inset-0 flex items-center justify-center bg-red-50">
      <div class="text-center text-red-600">
        <i class="pi pi-exclamation-triangle text-2xl mb-2"></i>
        <div>{{ error }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import FamilyTree from '@balkangraph/familytree.js'

// Props
interface Props {
  graphJson: string
}

const props = defineProps<Props>()

// Refs
const familyTreeRef = ref<HTMLElement>()
const isLoading = ref(false)
const error = ref<string>('')
let familyTreeInstance: any = null

// 解析和驗證數據
const parseGraphData = (jsonString: string) => {
  try {
    console.log('FamilyTree 收到原始數據:', jsonString.substring(0, 200) + '...')
    
    const rawData = JSON.parse(jsonString)
    console.log('FamilyTree 解析後數據類型:', typeof rawData, Array.isArray(rawData))
    
    let data = rawData
    
    // 處理可能的數據包裝格式
    if (rawData && typeof rawData === 'object' && !Array.isArray(rawData)) {
      // 如果是 vis.js 格式，嘗試轉換
      if (rawData.nodes && Array.isArray(rawData.nodes)) {
        console.log('檢測到 vis.js 格式，嘗試轉換為 FamilyTree.js 格式')
        data = convertVisToFamilyTree(rawData)
      } 
      // 如果包裝在其他結構中
      else if (rawData.data && Array.isArray(rawData.data)) {
        data = rawData.data
      }
      // 如果有其他可能的結構
      else {
        throw new Error('無法識別的數據格式。期望: FamilyTree.js 數組格式或 vis.js 格式')
      }
    }
    
    // 驗證是否為數組格式（FamilyTree.js 格式）
    if (!Array.isArray(data)) {
      throw new Error(`家族樹數據必須是數組格式，收到: ${typeof data}`)
    }
    
    if (data.length === 0) {
      throw new Error('家族樹數據不能為空數組')
    }
    
    // 驗證每個節點的必要字段
    data.forEach((node: any, index: number) => {
      if (!node.id && node.id !== 0) {
        throw new Error(`節點 ${index} 缺少 id 字段`)
      }
      if (!node.name) {
        throw new Error(`節點 ${index} 缺少 name 字段`)
      }
    })
    
    console.log('FamilyTree 驗證通過，節點數量:', data.length)
    return data
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : '未知錯誤'
    console.error('FamilyTree 數據解析錯誤:', errorMsg, jsonString.substring(0, 500))
    throw new Error(`JSON 解析錯誤: ${errorMsg}`)
  }
}

// 將 vis.js 格式轉換為 FamilyTree.js 格式
const convertVisToFamilyTree = (visData: any): any[] => {
  console.log('開始轉換 vis.js 到 FamilyTree.js 格式')
  
  const familyTreeNodes: any[] = []
  const nodeMap = new Map()
  
  // 第一步：創建基本節點
  visData.nodes.forEach((node: any, index: number) => {
    const familyNode: any = {
      id: index + 1, // FamilyTree.js 需要數字ID
      name: node.label || node.id || `節點${index + 1}`,
      gender: 'male', // 默認值，可以根據節點屬性調整
      tags: [] as string[],
      visId: node.id // 保存原始ID用於關係映射
    }
    
    // 處理其他屬性
    if (node.age) familyNode.birth_year = (new Date().getFullYear() - parseInt(node.age)).toString()
    if (node.gender) familyNode.gender = node.gender
    if (node.attributes) {
      familyNode.tags = Object.entries(node.attributes)
        .map(([key, value]) => `${key}: ${value}`)
    }
    
    familyTreeNodes.push(familyNode)
    nodeMap.set(node.id, familyNode)
  })
  
  // 第二步：處理關係（簡化版，主要建立基本連接）
  if (visData.edges) {
    visData.edges.forEach((edge: any) => {
      const fromNode = Array.from(nodeMap.values()).find((n: any) => n.visId === edge.from)
      const toNode = Array.from(nodeMap.values()).find((n: any) => n.visId === edge.to)
      
      if (fromNode && toNode && edge.label) {
        // 根據關係標籤嘗試建立家族關係
        const relationship = edge.label.toLowerCase()
        
        if (relationship.includes('夫妻') || relationship.includes('配偶')) {
          if (!fromNode.pids) fromNode.pids = []
          if (!toNode.pids) toNode.pids = []
          fromNode.pids.push(toNode.id)
          toNode.pids.push(fromNode.id)
        }
      }
    })
  }
  
  // 清理 visId
  familyTreeNodes.forEach(node => {
    delete node.visId
  })
  
  console.log('轉換完成，FamilyTree 節點數量:', familyTreeNodes.length)
  return familyTreeNodes
}

// 初始化家族樹
const initializeFamilyTree = async () => {
  if (!familyTreeRef.value || !props.graphJson) return
  
  try {
    isLoading.value = true
    error.value = ''
    
    const treeData = parseGraphData(props.graphJson)
    
    // 銷毀現有實例
    if (familyTreeInstance) {
      familyTreeInstance.destroy()
      familyTreeInstance = null
    }
    
    await nextTick()
    
    // 創建新的 FamilyTree 實例
    familyTreeInstance = new FamilyTree(familyTreeRef.value, {
      nodes: treeData,
      template: 'hugo', // 使用現代風格模板
      scaleInitial: 0.8,
      
      // 節點綁定配置
      nodeBinding: {
        field_0: 'name',
        field_1: 'tags',
        field_2: 'birth_year'
      },
      
      // 工具列配置
      toolbar: {
        zoom: true,
        fit: true
      }
    } as any)
    
    // 事件監聽
    familyTreeInstance.on('click', (sender: any, args: any) => {
      console.log('節點點擊:', args)
    })
    
    familyTreeInstance.on('expcollclick', (sender: any, args: any) => {
      console.log('展開/收縮:', args)
    })
    
  } catch (err) {
    error.value = err instanceof Error ? err.message : '初始化家族樹時發生錯誤'
    console.error('FamilyTree 初始化錯誤:', err)
  } finally {
    isLoading.value = false
  }
}

// 監聽 graphJson 變化
watch(
  () => props.graphJson,
  () => {
    initializeFamilyTree()
  },
  { immediate: true }
)

// 生命周期
onMounted(() => {
  initializeFamilyTree()
})

onUnmounted(() => {
  if (familyTreeInstance) {
    familyTreeInstance.destroy()
    familyTreeInstance = null
  }
})

// 響應式處理
const handleResize = () => {
  if (familyTreeInstance && familyTreeRef.value) {
    familyTreeInstance.fit()
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.family-tree-container {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 400px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #f9fafb;
  overflow: hidden;
}

.family-tree-wrapper {
  width: 100%;
  height: 100%;
}

/* 自定義 FamilyTree.js 樣式 */
:deep(.bft-toolbar) {
  background: rgba(255, 255, 255, 0.95);
  border-bottom: 1px solid #e5e7eb;
}

:deep(.bft-toolbar button) {
  margin: 2px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

:deep(.bft-toolbar button:hover) {
  background: #f3f4f6;
}

/* 節點樣式自定義 */
:deep(.node) {
  cursor: pointer;
  transition: all 0.3s ease;
}

:deep(.node:hover) {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 連接線樣式 */
:deep(.link) {
  stroke: #6b7280;
  stroke-width: 2;
}

/* 搜尋框樣式 */
:deep(.bft-search) {
  border-radius: 6px;
  border: 1px solid #d1d5db;
  padding: 6px 12px;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .family-tree-container {
    min-height: 300px;
  }
  
  :deep(.bft-toolbar) {
    font-size: 12px;
  }
  
  :deep(.bft-toolbar button) {
    padding: 4px 6px;
    font-size: 11px;
  }
}
</style>