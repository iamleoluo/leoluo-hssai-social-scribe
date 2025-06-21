// File: stores/modules/personGraphStore.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const usePersonGraphStore = defineStore('personGraph', () => {
  // 狀態
  const personGraphJson = ref('')
  const personGraphStage = ref<'idle' | 'generating' | 'done' | 'error'>('idle')
  const autoGeneratePersonGraph = ref(true)
  
  // 計算屬性
  const hasPersonGraph = computed(() => !!personGraphJson.value)
  const isGenerating = computed(() => personGraphStage.value === 'generating')
  
  // 動作
  function setPersonGraphJson(json: string) {
    personGraphJson.value = json
  }
  
  function setPersonGraphStage(stage: 'idle' | 'generating' | 'done' | 'error') {
    personGraphStage.value = stage
  }
  
  function setAutoGeneratePersonGraph(auto: boolean) {
    autoGeneratePersonGraph.value = auto
  }
  
  function reset() {
    personGraphJson.value = ''
    personGraphStage.value = 'idle'
  }
  
  return {
    // 狀態
    personGraphJson,
    personGraphStage,
    autoGeneratePersonGraph,
    
    // 計算屬性
    hasPersonGraph,
    isGenerating,
    
    // 動作
    setPersonGraphJson,
    setPersonGraphStage,
    setAutoGeneratePersonGraph,
    reset
  }
}, {
  persist: {
    storage: localStorage,
    paths: ['personGraphJson', 'autoGeneratePersonGraph']
  }
})