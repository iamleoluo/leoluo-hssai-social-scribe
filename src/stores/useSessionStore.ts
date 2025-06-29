// File: stores/useSessionStore.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { v4 as uuidv4 } from 'uuid'

export const useSessionStore = defineStore('session', () => {
  // state
  const sessionId = ref('')
  const audioFile = ref<File | null>(null)
  const transcriptFile = ref<File | null>(null)
  const transcriptText = ref('')
  const reportText = ref('')
  const hasSubmitted = ref(false)
  const transcriptStage = ref<'idle' | 'transcribing' | 'correcting' | 'done' | 'error'>('idle')
  const reportStage = ref<'idle' | 'generating' | 'done' | 'error'>('idle')
  const activeTabIndex = ref(0)
  const selectedTemplate = ref('')
  const personGraphJson = ref('')
  const personGraphStage = ref<'idle' | 'generating' | 'done'>('idle')
  const autoGeneratePersonGraph = ref(true)
  
  // 新增：報告設定狀態
  const reportConfig = ref({
    selectedTemplate: '',
    selectedSections: [] as string[],
    customSettings: {} as Record<string, any>,
    isComplete: false
  })
  
  // 新增：處遇計畫狀態
  const treatmentPlan = ref({
    content: '',
    isGenerated: false,
    isEditing: false,
    generatedAt: null as Date | null
  })
  
  // 新增：分頁控制狀態
  const currentStep = ref(1) // 1-5
  const stepValidation = ref([false, false, false, false, false])
  const treatmentPlanStage = ref<'idle' | 'generating' | 'done' | 'error'>('idle')

  // getters
  const hasUploaded = computed(() =>
    !!audioFile.value || !!transcriptFile.value || !!transcriptText.value || !!reportText.value
  )
  const hasTypescript = computed(() => !!transcriptText.value)
  const hasReport = computed(() => !!reportText.value)
  const hasPersonGraph = computed(() => !!personGraphJson.value)
  const hasReportConfig = computed(() => reportConfig.value.isComplete)
  const hasTreatmentPlan = computed(() => !!treatmentPlan.value.content)

  // actions
  function initializeSession() {
    if (!sessionId.value) sessionId.value = uuidv4()
  }
  function setSelectedTemplate(template: string) {
    selectedTemplate.value = template
  }
  function setActiveTab(index: number) {
    activeTabIndex.value = index
  }
  function setTranscriptStage(stage: 'idle' | 'transcribing' | 'correcting' | 'done' | 'error') {
    transcriptStage.value = stage
  }
  function setReportStage(stage: 'idle' | 'generating' | 'done') {
    reportStage.value = stage
  }
  function setAudioFile(file: File) {
    audioFile.value = file
  }
  function setTranscriptFile(file: File) {
    transcriptFile.value = file
  }
  function setTranscriptText(text: string) {
    transcriptText.value = text
  }
  function setReportText(text: string) {
    reportText.value = text
  }
  function markSubmitted() {
    hasSubmitted.value = true
  }
  function setPersonGraphJson(json: string) {
    personGraphJson.value = json
  }
  function setPersonGraphStage(stage: 'idle' | 'generating' | 'done') {
    personGraphStage.value = stage
  }
  function setAutoGeneratePersonGraph(auto: boolean) {
    autoGeneratePersonGraph.value = auto
  }
  
  // 新增：報告設定相關 actions
  function setReportConfig(config: Partial<typeof reportConfig.value>) {
    reportConfig.value = { ...reportConfig.value, ...config }
    // 自動驗證設定完整性
    reportConfig.value.isComplete = validateReportConfig()
    stepValidation.value[1] = reportConfig.value.isComplete
  }
  
  function validateReportConfig() {
    return !!(reportConfig.value.selectedTemplate && 
             reportConfig.value.selectedSections.length > 0)
  }
  
  // 新增：處遇計畫相關 actions
  function setTreatmentPlan(plan: Partial<typeof treatmentPlan.value>) {
    treatmentPlan.value = { ...treatmentPlan.value, ...plan }
    stepValidation.value[3] = !!plan.content
  }
  
  function setTreatmentPlanStage(stage: 'idle' | 'generating' | 'done' | 'error') {
    treatmentPlanStage.value = stage
  }
  
  // 新增：分頁控制 actions
  function setCurrentStep(step: number) {
    if (step >= 1 && step <= 5) {
      currentStep.value = step
      activeTabIndex.value = step - 1
    }
  }
  
  function updateStepValidation(stepIndex: number, isValid: boolean) {
    if (stepIndex >= 0 && stepIndex < 5) {
      stepValidation.value[stepIndex] = isValid
    }
  }
  function reset() {
    audioFile.value = null
    transcriptFile.value = null
    transcriptText.value = ''
    reportText.value = ''
    reportStage.value = 'idle'
    transcriptStage.value = 'idle'
    activeTabIndex.value = 0
    selectedTemplate.value = ''
    personGraphJson.value = ''
    personGraphStage.value = 'idle'
    // 重置新增的狀態
    reportConfig.value = {
      selectedTemplate: '',
      selectedSections: [],
      customSettings: {},
      isComplete: false
    }
    treatmentPlan.value = {
      content: '',
      isGenerated: false,
      isEditing: false,
      generatedAt: null
    }
    currentStep.value = 1
    stepValidation.value = [false, false, false, false, false]
    treatmentPlanStage.value = 'idle'
    localStorage.removeItem('pinia')
  }
  function clearSession() {
    sessionId.value = ''
    reset()
  }

  return {
    // 現有狀態
    sessionId,
    audioFile,
    transcriptFile,
    transcriptText,
    reportText,
    hasSubmitted,
    transcriptStage,
    reportStage,
    activeTabIndex,
    selectedTemplate,
    personGraphJson,
    personGraphStage,
    autoGeneratePersonGraph,
    // 新增狀態
    reportConfig,
    treatmentPlan,
    currentStep,
    stepValidation,
    treatmentPlanStage,
    // getters
    hasUploaded,
    hasTypescript,
    hasReport,
    hasPersonGraph,
    hasReportConfig,
    hasTreatmentPlan,
    // 現有 actions
    initializeSession,
    setSelectedTemplate,
    setActiveTab,
    setTranscriptStage,
    setReportStage,
    setAudioFile,
    setTranscriptFile,
    setTranscriptText,
    setReportText,
    markSubmitted,
    setPersonGraphJson,
    setPersonGraphStage,
    setAutoGeneratePersonGraph,
    // 新增 actions
    setReportConfig,
    validateReportConfig,
    setTreatmentPlan,
    setTreatmentPlanStage,
    setCurrentStep,
    updateStepValidation,
    reset,
    clearSession
  }
}, {
  persist: {
    storage: localStorage,
    paths: ['sessionId', 'transcriptText', 'reportText', 'selectedTemplate', 'activeTabIndex', 'personGraphJson', 'autoGeneratePersonGraph', 'reportConfig', 'treatmentPlan', 'currentStep']
  }
})
