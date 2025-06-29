// File: stores/modules/personGraphStore.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const usePersonGraphStore = defineStore('personGraph', () => {
  // 人物關係圖狀態
  const personGraphJson = ref('')
  const personGraphStage = ref<'idle' | 'generating' | 'done' | 'error'>('idle')
  const autoGeneratePersonGraph = ref(true)
  
  // 家庭關係圖狀態
  const familyGraphJson = ref('')
  const familyGraphStage = ref<'idle' | 'generating' | 'done' | 'error'>('idle')
  const autoGenerateFamilyGraph = ref(true)
  
  // 計算屬性
  const hasPersonGraph = computed(() => !!personGraphJson.value)
  const hasFamilyGraph = computed(() => !!familyGraphJson.value)
  const isPersonGraphGenerating = computed(() => personGraphStage.value === 'generating')
  const isFamilyGraphGenerating = computed(() => familyGraphStage.value === 'generating')
  
  // 通用計算屬性 - 根據類型返回對應數據
  function getGraphJson(type: 'person' | 'family') {
    return type === 'person' ? personGraphJson.value : familyGraphJson.value
  }
  
  function getGraphStage(type: 'person' | 'family') {
    return type === 'person' ? personGraphStage.value : familyGraphStage.value
  }
  
  function isGraphGenerating(type: 'person' | 'family') {
    return type === 'person' ? isPersonGraphGenerating.value : isFamilyGraphGenerating.value
  }
  
  // 人物關係圖動作
  function setPersonGraphJson(json: string) {
    personGraphJson.value = json
  }
  
  function setPersonGraphStage(stage: 'idle' | 'generating' | 'done' | 'error') {
    personGraphStage.value = stage
  }
  
  function setAutoGeneratePersonGraph(auto: boolean) {
    autoGeneratePersonGraph.value = auto
  }
  
  // 家庭關係圖動作
  function setFamilyGraphJson(json: string) {
    familyGraphJson.value = json
  }
  
  function setFamilyGraphStage(stage: 'idle' | 'generating' | 'done' | 'error') {
    familyGraphStage.value = stage
  }
  
  function setAutoGenerateFamilyGraph(auto: boolean) {
    autoGenerateFamilyGraph.value = auto
  }
  
  // 通用動作
  function setGraphJson(type: 'person' | 'family', json: string) {
    if (type === 'person') {
      setPersonGraphJson(json)
    } else {
      setFamilyGraphJson(json)
    }
  }
  
  function setGraphStage(type: 'person' | 'family', stage: 'idle' | 'generating' | 'done' | 'error') {
    if (type === 'person') {
      setPersonGraphStage(stage)
    } else {
      setFamilyGraphStage(stage)
    }
  }
  
  function reset() {
    personGraphJson.value = ''
    personGraphStage.value = 'idle'
    familyGraphJson.value = ''
    familyGraphStage.value = 'idle'
  }
  
  return {
    // 人物關係圖狀態
    personGraphJson,
    personGraphStage,
    autoGeneratePersonGraph,
    
    // 家庭關係圖狀態
    familyGraphJson,
    familyGraphStage,
    autoGenerateFamilyGraph,
    
    // 計算屬性
    hasPersonGraph,
    hasFamilyGraph,
    isPersonGraphGenerating,
    isFamilyGraphGenerating,
    
    // 通用獲取方法
    getGraphJson,
    getGraphStage,
    isGraphGenerating,
    
    // 人物關係圖動作
    setPersonGraphJson,
    setPersonGraphStage,
    setAutoGeneratePersonGraph,
    
    // 家庭關係圖動作
    setFamilyGraphJson,
    setFamilyGraphStage,
    setAutoGenerateFamilyGraph,
    
    // 通用動作
    setGraphJson,
    setGraphStage,
    reset
  }
}, {
  persist: {
    storage: localStorage,
    paths: ['personGraphJson', 'autoGeneratePersonGraph', 'familyGraphJson', 'autoGenerateFamilyGraph']
  }
})