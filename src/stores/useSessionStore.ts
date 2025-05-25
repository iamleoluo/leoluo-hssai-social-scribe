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
  const transcriptStage = ref<'idle' | 'transcribing' | 'correcting' | 'done'>('idle')
  const reportStage = ref<'idle' | 'generating' | 'done'>('idle')
  const activeTabIndex = ref(0)
  const selectedTemplate = ref('')
  const personGraphJson = ref('')
  const personGraphStage = ref<'idle' | 'generating' | 'done'>('idle')
  const autoGeneratePersonGraph = ref(true)

  // getters
  const hasUploaded = computed(() =>
    !!audioFile.value || !!transcriptFile.value || !!transcriptText.value || !!reportText.value
  )
  const hasTypescript = computed(() => !!transcriptText.value)
  const hasReport = computed(() => !!reportText.value)
  const hasPersonGraph = computed(() => !!personGraphJson.value)

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
  function setTranscriptStage(stage: 'idle' | 'transcribing' | 'correcting' | 'done') {
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
    localStorage.removeItem('pinia')
  }
  function clearSession() {
    sessionId.value = ''
    reset()
  }

  return {
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
    hasUploaded,
    hasTypescript,
    hasReport,
    hasPersonGraph,
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
    reset,
    clearSession
  }
}, {
  persist: {
    storage: localStorage,
    paths: ['sessionId', 'transcriptText', 'reportText', 'selectedTemplate', 'activeTabIndex', 'personGraphJson', 'autoGeneratePersonGraph']
  }
})
