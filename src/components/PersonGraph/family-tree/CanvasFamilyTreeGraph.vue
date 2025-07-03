<template>
  <div class="canvas-family-tree">
    <div class="canvas-container">
      <canvas 
        ref="canvasRef" 
        :width="canvasWidth" 
        :height="canvasHeight"
        @mousedown="handleMouseDown"
        @mousemove="handleMouseMove"
        @mouseup="handleMouseUp"
        @click="handleClick"
        class="family-tree-canvas"
      ></canvas>
    </div>
    
    <!-- 簡化的選擇指示器 -->
    <div class="selection-indicator" v-if="selectedNode">
      <div class="selected-info">
        <span class="selected-name">已選中：{{ selectedNode.name }}</span>
        <span class="selected-age" v-if="selectedNode.age">{{ selectedNode.age }}歲</span>
        <span class="selected-status">{{ selectedNode.dead ? '歿' : '存' }}</span>
      </div>
    </div>
    
    <!-- Canvas Debug區域 -->
    <div class="debug-panel mt-4 p-3 bg-gray-100 border rounded-lg text-xs">
      <div class="flex items-center justify-between mb-2">
        <div class="font-semibold">Canvas Debug - 原始數據：</div>
        <div class="flex gap-2">
          <button 
            @click="applyDebugData"
            class="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
            :disabled="!isDebugDataValid"
          >
            應用修改
          </button>
          <button 
            @click="resetDebugData"
            class="px-3 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600"
          >
            重置
          </button>
        </div>
      </div>
      <textarea 
        v-model="editableDebugData"
        class="w-full h-32 bg-white p-2 rounded border font-mono text-xs resize-none"
        :class="{ 'border-red-500': !isDebugDataValid }"
        placeholder="編輯JSON數據..."
      ></textarea>
      <div v-if="!isDebugDataValid" class="text-red-500 text-xs mt-1">
        JSON格式錯誤，請檢查語法
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick, computed } from 'vue'

// Canvas相關
const canvasRef = ref<HTMLCanvasElement | null>(null)
const canvasWidth = ref(1000)
const canvasHeight = ref(700)

// 繪圖參數
const size = 20
const nodeVerticalDistance = 115
const childHorizontalDistance = 100
const coupleDistance = 100
const coverDistance = 10

// 滑鼠事件
const mousePressed = ref(false)
const pressMouseX = ref(0)
const pressMouseY = ref(0)
const moveX = ref(0)
const moveY = ref(0)
const movedX = ref(0)
const movedY = ref(0)

// 節點數據
interface FamilyNode {
  id: number
  name: string
  sex: number // 0=女性, 1=男性
  age: string | null
  me: boolean
  dead: boolean
  together: boolean
  father_id?: number | null
  mother_id?: number | null
  couple_id?: number | null
  // Canvas繪圖屬性
  x: number
  y: number
  father?: FamilyNode | null
  mother?: FamilyNode | null
  couple?: FamilyNode | null
  children: FamilyNode[]
}

const nodeList = ref<FamilyNode[]>([])
const selectedNode = ref<FamilyNode | null>(null)
const paintedNodes = ref<boolean[]>([])

// Debug數據
const debugData = computed(() => {
  return JSON.stringify(props.graphData, null, 2)
})

// 可編輯的debug數據
const editableDebugData = ref('')

// 驗證JSON格式
const isDebugDataValid = computed(() => {
  if (!editableDebugData.value.trim()) return true
  try {
    JSON.parse(editableDebugData.value)
    return true
  } catch {
    return false
  }
})

// 應用debug數據修改
const applyDebugData = () => {
  if (!isDebugDataValid.value) return
  
  try {
    const parsedData = JSON.parse(editableDebugData.value)
    if (Array.isArray(parsedData)) {
      loadGraphData(parsedData)
      console.log('Canvas Debug: 已應用新的數據', parsedData)
    } else {
      alert('數據必須是陣列格式')
    }
  } catch (e) {
    alert('JSON格式錯誤')
  }
}

// 重置debug數據
const resetDebugData = () => {
  editableDebugData.value = debugData.value
}

// Props
interface Props {
  graphData?: any[]
}

const props = withDefaults(defineProps<Props>(), {
  graphData: () => []
})

// 初始化Canvas
const initCanvas = () => {
  const canvas = canvasRef.value
  if (!canvas) return
  
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  
  ctx.lineWidth = 2
  ctx.fillStyle = "white"
  
  // 初始化測試數據或使用傳入的數據
  if (props.graphData && props.graphData.length > 0) {
    loadGraphData(props.graphData)
  } else {
    // 如果沒有數據，創建空狀態
    nodeList.value = []
  }
  
  paint()
}

// 載入圖表數據
const loadGraphData = (data: any[]) => {
  console.log('loadGraphData: 開始載入數據', data)
  nodeList.value = data.map(node => ({
    ...node,
    x: 0,
    y: 0,
    father: null,
    mother: null,
    couple: null,
    children: []
  }))
  
  console.log('loadGraphData: 初始化節點列表', nodeList.value)
  
  // 建立關係引用
  nodeList.value.forEach(node => {
    if (node.father_id !== null && node.father_id !== undefined) {
      node.father = nodeList.value.find(n => n.id === node.father_id) || null
    }
    if (node.mother_id !== null && node.mother_id !== undefined) {
      node.mother = nodeList.value.find(n => n.id === node.mother_id) || null
    }
    if (node.couple_id !== null && node.couple_id !== undefined) {
      node.couple = nodeList.value.find(n => n.id === node.couple_id) || null
    }
  })
  
  // 驗證並修復配偶關係的雙向性
  nodeList.value.forEach(node => {
    if (node.couple && node.couple.couple_id !== node.id) {
      console.warn(`配偶關係不對稱: ${node.name}(${node.id}) -> ${node.couple.name}(${node.couple.id})，但反向引用缺失`)
      // 自動修復：設置雙向引用
      node.couple.couple = node
      node.couple.couple_id = node.id
    }
  })
  
  // 建立子女關係
  nodeList.value.forEach(node => {
    node.children = nodeList.value.filter(child => 
      child.father_id === node.id || child.mother_id === node.id
    )
  })
  
  // 數據完整性檢查
  validateDataIntegrity()
  
  console.log('loadGraphData: 建立關係後的節點列表', nodeList.value)
}

// 數據完整性檢查
const validateDataIntegrity = () => {
  const issues: string[] = []
  
  nodeList.value.forEach(node => {
    // 檢查無效父親引用
    if (node.father_id !== null && node.father_id !== undefined && !node.father) {
      issues.push(`${node.name}: 父親ID ${node.father_id} 不存在`)
    }
    
    // 檢查無效母親引用
    if (node.mother_id !== null && node.mother_id !== undefined && !node.mother) {
      issues.push(`${node.name}: 母親ID ${node.mother_id} 不存在`)
    }
    
    // 檢查無效配偶引用
    if (node.couple_id !== null && node.couple_id !== undefined && !node.couple) {
      issues.push(`${node.name}: 配偶ID ${node.couple_id} 不存在`)
    }
    
    // 檢查父親性別
    if (node.father && node.father.sex !== 1) {
      issues.push(`${node.name}: 父親 ${node.father.name} 性別錯誤(應為男性)`)
    }
    
    // 檢查母親性別
    if (node.mother && node.mother.sex !== 0) {
      issues.push(`${node.name}: 母親 ${node.mother.name} 性別錯誤(應為女性)`)
    }
    
    // 檢查孤立節點（非案主且無任何關係）
    if (!node.me && !node.father && !node.mother && !node.couple && node.children.length === 0) {
      issues.push(`${node.name}: 孤立節點，沒有任何關係連接`)
    }
  })
  
  if (issues.length > 0) {
    console.warn('數據完整性問題:', issues)
  } else {
    console.log('數據完整性檢查通過')
  }
}

// 測試數據
const initTestData = () => {
  const testNodes: FamilyNode[] = [
    {
      id: 0,
      name: "案主",
      sex: 1,
      age: "35",
      me: true,
      dead: false,
      together: true,
      father_id: 2,
      mother_id: 3,
      couple_id: 1,
      x: canvasWidth.value / 2,
      y: canvasHeight.value / 2,
      father: null,
      mother: null,
      couple: null,
      children: []
    },
    {
      id: 1,
      name: "配偶",
      sex: 0,
      age: "33",
      me: false,
      dead: false,
      together: true,
      couple_id: 0,
      x: 0,
      y: 0,
      father: null,
      mother: null,
      couple: null,
      children: []
    },
    {
      id: 2,
      name: "父親",
      sex: 1,
      age: "60",
      me: false,
      dead: false,
      together: false,
      x: 0,
      y: 0,
      father: null,
      mother: null,
      couple: null,
      children: []
    },
    {
      id: 3,
      name: "母親",
      sex: 0,
      age: "58",
      me: false,
      dead: false,
      together: false,
      x: 0,
      y: 0,
      father: null,
      mother: null,
      couple: null,
      children: []
    }
  ]
  
  nodeList.value = testNodes
  
  // 建立關係
  nodeList.value[0].father = nodeList.value[2]
  nodeList.value[0].mother = nodeList.value[3]
  nodeList.value[0].couple = nodeList.value[1]
  nodeList.value[1].couple = nodeList.value[0]
  
  // 建立子女關係
  nodeList.value[2].children = [nodeList.value[0]]
  nodeList.value[3].children = [nodeList.value[0]]
}

// Canvas事件處理
const handleMouseDown = (e: MouseEvent) => {
  const rect = canvasRef.value?.getBoundingClientRect()
  if (!rect) return
  
  pressMouseX.value = e.clientX - rect.left
  pressMouseY.value = e.clientY - rect.top
  mousePressed.value = true
}

const handleMouseMove = (e: MouseEvent) => {
  if (!mousePressed.value) return
  
  const rect = canvasRef.value?.getBoundingClientRect()
  if (!rect) return
  
  const mouseX = e.clientX - rect.left
  const mouseY = e.clientY - rect.top
  
  moveX.value = mouseX - pressMouseX.value
  moveY.value = mouseY - pressMouseY.value
  
  paint2()
}

const handleMouseUp = () => {
  movedX.value += moveX.value
  movedY.value += moveY.value
  moveX.value = 0
  moveY.value = 0
  mousePressed.value = false
  paint2()
}

const handleClick = (e: MouseEvent) => {
  const rect = canvasRef.value?.getBoundingClientRect()
  if (!rect) return
  
  const mouseX = e.clientX - rect.left
  const mouseY = e.clientY - rect.top
  
  // 檢查是否點擊到節點
  for (const node of nodeList.value) {
    const nodeX = node.x + moveX.value + movedX.value
    const nodeY = node.y + moveY.value + movedY.value
    
    if (Math.abs(mouseX - nodeX) <= size && Math.abs(mouseY - nodeY) <= size) {
      selectedNode.value = node
      paint2()
      return
    }
  }
  
  selectedNode.value = null
  paint2()
}

// 按鈕操作
const changeDead = () => {
  if (selectedNode.value) {
    selectedNode.value.dead = !selectedNode.value.dead
    paint()
  }
}

const changeMe = () => {
  if (selectedNode.value) {
    // 清除其他節點的me標記
    nodeList.value.forEach(node => node.me = false)
    selectedNode.value.me = true
    paint()
  }
}

const changeSex = () => {
  if (selectedNode.value) {
    if (selectedNode.value.couple) {
      alert("已有伴侶無法更改性別")
      return
    }
    selectedNode.value.sex = 1 - selectedNode.value.sex
    paint()
  }
}

const changeTogether = () => {
  if (selectedNode.value) {
    selectedNode.value.together = !selectedNode.value.together
    paint()
  }
}

const insertChildBack = () => {
  if (!selectedNode.value) {
    alert("請選擇人物")
    return
  }
  
  if (!selectedNode.value.couple) {
    alert("沒有伴侶")
    return
  }
  
  const newChild: FamilyNode = {
    id: nodeList.value.length,
    name: `小孩${nodeList.value.length}`,
    sex: 0,
    age: "5",
    me: false,
    dead: false,
    together: true,
    x: 0,
    y: 0,
    father: selectedNode.value.sex === 1 ? selectedNode.value : selectedNode.value.couple,
    mother: selectedNode.value.sex === 0 ? selectedNode.value : selectedNode.value.couple,
    couple: null,
    children: []
  }
  
  newChild.father_id = newChild.father?.id
  newChild.mother_id = newChild.mother?.id
  
  nodeList.value.push(newChild)
  selectedNode.value.children.push(newChild)
  selectedNode.value.couple?.children.push(newChild)
  
  paint()
}

const insertChildFront = () => {
  if (!selectedNode.value) {
    alert("請選擇人物")
    return
  }
  
  if (!selectedNode.value.couple) {
    alert("沒有伴侶")
    return
  }
  
  const newChild: FamilyNode = {
    id: nodeList.value.length,
    name: `小孩${nodeList.value.length}`,
    sex: 1,
    age: "8",
    me: false,
    dead: false,
    together: true,
    x: 0,
    y: 0,
    father: selectedNode.value.sex === 1 ? selectedNode.value : selectedNode.value.couple,
    mother: selectedNode.value.sex === 0 ? selectedNode.value : selectedNode.value.couple,
    couple: null,
    children: []
  }
  
  newChild.father_id = newChild.father?.id
  newChild.mother_id = newChild.mother?.id
  
  nodeList.value.push(newChild)
  selectedNode.value.children.unshift(newChild)
  selectedNode.value.couple?.children.unshift(newChild)
  
  paint()
}

const resetCanvas = () => {
  initCanvas()
}

const updateCanvas = () => {
  paint2()
}

// 位置計算
const resetAllSite = () => {
  if (nodeList.value.length === 0) return
  
  // 找到案主節點（me=true或id=0）
  const mainNode = nodeList.value.find(node => node.me) || nodeList.value.find(node => node.id === 0) || nodeList.value[0]
  if (!mainNode) return
  
  // 設置案主在畫布中心
  mainNode.x = canvasWidth.value / 2
  mainNode.y = canvasHeight.value / 2
  
  // 從案主開始計算所有位置
  resetParentSite(mainNode.id)
  resetCoupleSite(mainNode.id)
  resetChildrenSite(mainNode.id)
  
  // 處理孤立節點（沒有關係連接的節點）
  handleOrphanNodes()
}

// 處理孤立節點
const handleOrphanNodes = () => {
  const orphanNodes = nodeList.value.filter(node => 
    !node.me && 
    node.x === 0 && 
    node.y === 0 && 
    !node.father && 
    !node.mother && 
    !node.couple && 
    node.children.length === 0
  )
  
  if (orphanNodes.length > 0) {
    console.log(`發現 ${orphanNodes.length} 個孤立節點:`, orphanNodes.map(n => n.name))
    
    // 將孤立節點放置在畫布左上角
    orphanNodes.forEach((node, index) => {
      node.x = 100 + (index * 120)
      node.y = 100
      console.log(`孤立節點 ${node.name} 放置在 (${node.x}, ${node.y})`)
    })
  }
}

const resetParentSite = (nodeId: number) => {
  const node = nodeList.value.find(n => n.id === nodeId)
  if (!node || !node.father || !node.mother) return
  
  // 避免重複計算
  if (node.father.x !== 0 && node.father.y !== 0) return
  
  node.father.x = node.x - coupleDistance / 2
  node.mother.x = node.x + coupleDistance / 2
  node.father.y = node.y - nodeVerticalDistance
  node.mother.y = node.y - nodeVerticalDistance
  
  resetParentSite(node.father.id)
  resetParentSite(node.mother.id)
  resetChildrenSite(node.mother.id)
}

const resetCoupleSite = (nodeId: number) => {
  const node = nodeList.value.find(n => n.id === nodeId)
  if (!node || !node.couple) return
  
  // 避免重複計算
  if (node.couple.x !== 0 && node.couple.y !== 0) return
  
  node.couple.y = node.y
  if (node.sex === 0) {
    node.couple.x = node.x - coupleDistance
  } else {
    node.couple.x = node.x + coupleDistance
  }
  
  resetParentSite(node.couple.id)
  resetChildrenSite(node.couple.id)
}

const resetChildrenSite = (nodeId: number) => {
  const node = nodeList.value.find(n => n.id === nodeId)
  if (!node || node.children.length === 0) return
  
  // 避免重複計算
  const nodeIndex = nodeList.value.findIndex(n => n.id === nodeId)
  if (nodeIndex === -1 || paintedNodes.value[nodeIndex]) return
  paintedNodes.value[nodeIndex] = true
  
  // 計算子女位置（以父母中心為基準）
  let baseX = node.x
  if (node.couple && node.sex === 1) {
    // 如果是男性且有配偶，以夫妻中心為基準
    baseX = (node.x + node.couple.x) / 2
  }
  
  node.children.forEach((child, i) => {
    // 避免重複設置已有位置的子女
    if (child.x === 0 && child.y === 0) {
      child.x = baseX + (childHorizontalDistance * i) - ((node.children.length - 1) * childHorizontalDistance / 2)
      child.y = node.y + nodeVerticalDistance
    }
    resetChildrenSite(child.id)
  })
}

// 繪圖函數
const paint = () => {
  console.log('paint: 開始繪製，節點數量:', nodeList.value.length)
  
  // 重置所有節點座標（除了案主）
  nodeList.value.forEach((node, index) => {
    if (!node.me && node.id !== 0) {
      node.x = 0
      node.y = 0
    }
  })
  
  paintedNodes.value = new Array(nodeList.value.length).fill(false)
  resetAllSite()
  paint2()
  console.log('paint: 繪製完成')
}

const paint2 = () => {
  const canvas = canvasRef.value
  if (!canvas) return
  
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  
  // 清除畫布
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  
  // 繪制節點
  nodeList.value.forEach(node => {
    const nodeX = node.x + moveX.value + movedX.value
    const nodeY = node.y + moveY.value + movedY.value
    
    // 設置顏色
    ctx.strokeStyle = selectedNode.value?.id === node.id ? "red" : "black"
    
    if (!node.dead) {
      // 活著的人
      if (node.sex === 0) {
        // 女性 - 圓形
        ctx.beginPath()
        ctx.arc(nodeX, nodeY, size, 0, Math.PI * 2)
        ctx.stroke()
      } else {
        // 男性 - 方形
        ctx.beginPath()
        ctx.strokeRect(nodeX - size, nodeY - size, size * 2, size * 2)
      }
      
      // 標記案主
      if (node.me) {
        ctx.beginPath()
        ctx.moveTo(nodeX - size + 5, nodeY - size + 5)
        ctx.lineTo(nodeX + size - 5, nodeY + size - 5)
        ctx.moveTo(nodeX + size - 5, nodeY - size + 5)
        ctx.lineTo(nodeX - size + 5, nodeY + size - 5)
        ctx.stroke()
      }
    } else {
      // 死亡標記
      if (node.sex === 0) {
        ctx.beginPath()
        ctx.arc(nodeX, nodeY, size, 0, Math.PI * 2)
        ctx.stroke()
      } else {
        ctx.beginPath()
        ctx.strokeRect(nodeX - size, nodeY - size, size * 2, size * 2)
      }
      
      // X標記
      ctx.beginPath()
      ctx.moveTo(nodeX - size + 5, nodeY - size + 5)
      ctx.lineTo(nodeX + size - 5, nodeY + size - 5)
      ctx.moveTo(nodeX + size - 5, nodeY - size + 5)
      ctx.lineTo(nodeX - size + 5, nodeY + size - 5)
      ctx.stroke()
    }
    
    // 顯示年齡
    if (node.age) {
      ctx.font = "16px Arial"
      ctx.fillStyle = "black"
      ctx.fillText(node.age, nodeX - 10, nodeY + size + 20)
    }
    
    // 顯示名字
    ctx.font = "14px Arial"
    ctx.fillStyle = "black"
    ctx.fillText(node.name, nodeX - 20, nodeY - size - 10)
  })
  
  // 繪制關係線
  drawRelationshipLines()
}

const drawRelationshipLines = () => {
  const canvas = canvasRef.value
  if (!canvas) return
  
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  
  ctx.strokeStyle = "black"
  ctx.lineWidth = 2
  
  console.log('drawRelationshipLines: 開始繪製關係線', nodeList.value.length, '個節點')
  
  nodeList.value.forEach(node => {
    drawCoupleLine(node)
    drawChildrenLine(node)
  })
}

// 繪製夫妻關係線（參考tree.html的DrawCoupleLine）
const drawCoupleLine = (node: FamilyNode) => {
  const canvas = canvasRef.value
  if (!canvas) return
  
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  
  // 只有男性繪製夫妻線，避免重複
  if (node.couple && node.sex === 1 && node.couple.x > 0 && node.couple.y > 0) {
    const nodeX = node.x + moveX.value + movedX.value
    const nodeY = node.y + moveY.value + movedY.value
    const coupleX = node.couple.x + moveX.value + movedX.value
    const coupleY = node.couple.y + moveY.value + movedY.value
    
    ctx.strokeStyle = "black"
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(nodeX, nodeY + size - 2)
    ctx.lineTo(nodeX, nodeY + nodeVerticalDistance * 2/7)
    ctx.lineTo(coupleX, coupleY + nodeVerticalDistance * 2/7)
    ctx.lineTo(coupleX, coupleY + size)
    ctx.stroke()
    console.log(`繪製夫妻連線: ${node.name} -> ${node.couple.name}`)
  }
}

// 繪製親子關係線（參考tree.html的DrawChildrenLine）
const drawChildrenLine = (node: FamilyNode) => {
  const canvas = canvasRef.value
  if (!canvas) return
  
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  
  // 只有有子女的節點才繪製親子線
  if (node.children.length === 0) return
  
  // 檢查所有子女是否都有有效座標
  const validChildren = node.children.filter(child => child.x > 0 && child.y > 0)
  if (validChildren.length === 0) return
  
  const nodeX = node.x + moveX.value + movedX.value
  const nodeY = node.y + moveY.value + movedY.value
  
  ctx.strokeStyle = "black"
  ctx.lineWidth = 2
  ctx.beginPath()
  
  if (node.couple && node.sex === 1 && node.couple.x > 0 && node.couple.y > 0) {
    // 有配偶的情況：從父母中心延伸
    const coupleX = node.couple.x + moveX.value + movedX.value
    const coupleY = node.couple.y + moveY.value + movedY.value
    const parentCenterX = (coupleX + nodeX) / 2
    
    // 父母中間往下的垂直線
    ctx.moveTo(parentCenterX, nodeY + nodeVerticalDistance * 2/7)
    ctx.lineTo(parentCenterX, nodeY + nodeVerticalDistance * 5/8)
    
    // 橫線連接所有子女
    if (validChildren.length > 1) {
      const firstChildX = validChildren[0].x + moveX.value + movedX.value
      const lastChildX = validChildren[validChildren.length - 1].x + moveX.value + movedX.value
      ctx.moveTo(firstChildX, nodeY + nodeVerticalDistance * 5/8)
      ctx.lineTo(lastChildX, nodeY + nodeVerticalDistance * 5/8)
    }
    
    // 每個子女的垂直連線
    validChildren.forEach(child => {
      const childX = child.x + moveX.value + movedX.value
      const childY = child.y + moveY.value + movedY.value
      
      ctx.moveTo(childX, nodeY + nodeVerticalDistance * 5/8)
      ctx.lineTo(childX, childY - size + 1)
    })
  } else {
    // 單親情況：直接從該節點延伸
    const baseY = nodeY + nodeVerticalDistance * 2/7
    
    // 橫線連接所有子女
    if (validChildren.length > 1) {
      const firstChildX = validChildren[0].x + moveX.value + movedX.value
      const lastChildX = validChildren[validChildren.length - 1].x + moveX.value + movedX.value
      ctx.moveTo(firstChildX, baseY)
      ctx.lineTo(lastChildX, baseY)
    }
    
    // 每個子女的垂直連線
    validChildren.forEach(child => {
      const childX = child.x + moveX.value + movedX.value
      const childY = child.y + moveY.value + movedY.value
      
      ctx.moveTo(childX, baseY)
      ctx.lineTo(childX, childY - size + 1)
    })
    
    // 父/母往下的垂直線
    ctx.moveTo(nodeX, nodeY + size - 2)
    ctx.lineTo(nodeX, baseY)
  }
  
  ctx.stroke()
  console.log(`繪製親子連線: ${node.name} 有 ${validChildren.length} 個有效子女`)
}

// 監聽數據變化
watch(() => props.graphData, (newData) => {
  console.log('CanvasFamilyTreeGraph: 接收到新數據', newData)
  if (newData && newData.length > 0) {
    console.log('CanvasFamilyTreeGraph: 載入數據並重新繪製')
    loadGraphData(newData)
    paint()
  } else {
    console.log('CanvasFamilyTreeGraph: 數據為空或無效')
  }
  // 同步更新可編輯的debug數據
  editableDebugData.value = JSON.stringify(newData || [], null, 2)
}, { deep: true })

onMounted(() => {
  nextTick(() => {
    initCanvas()
    // 初始化可編輯debug數據
    editableDebugData.value = debugData.value
  })
})
</script>

<style scoped>
.canvas-family-tree {
  position: relative;
  padding: 20px;
  height: 100%;
}

.canvas-container {
  width: 100%;
  height: calc(100% - 60px);
}

.family-tree-canvas {
  border: 1px solid #ccc;
  cursor: crosshair;
  width: 100%;
  height: 100%;
}

.selection-indicator {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(34, 197, 94, 0.9);
  color: white;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 10;
}

.selected-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.selected-name {
  font-weight: 600;
}

.selected-age {
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}

.selected-status {
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}
</style>