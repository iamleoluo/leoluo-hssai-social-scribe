import { defineStore } from 'pinia'
import { v4 as uuidv4 } from 'uuid'

export const useSessionStore = defineStore('session', {
  state: () => ({
    // 用戶識別
    sessionId: '',
    
    // 原有狀態
    audioFile: null as File | null,
    transcriptFile: null as File | null,
    transcriptText: '',
    reportText: '',
    hasSubmitted: false,
    transcriptStage: 'idle' as 'idle' | 'transcribing' | 'correcting' | 'done',
    reportStage: 'idle' as 'idle' | 'generating' | 'done',
    activeTabIndex: 0,
    selectedTemplate: '',
    
    // 新增：人物關係圖狀態
    personGraphJson: '',
    personGraphStage: 'idle' as 'idle' | 'generating' | 'done',
    
    // 新增：自動工作流程設定
    autoGeneratePersonGraph: true
  }),
  getters: {
    hasUploaded: (state: any) => {
      return (
        !!state.audioFile || !!state.transcriptFile || !!state.transcriptText || !!state.reportText
      )
    },
    hasTypescript: (state: any) => !!state.transcriptText,
    hasReport: (state: any) => !!state.reportText,
    hasPersonGraph: (state: any) => !!state.personGraphJson
  },
  actions: {
    // 初始化會話ID
    initializeSession() {
      if (!this.sessionId) {
        this.sessionId = uuidv4()
      }
    },
    
    // 原有 actions
    setSelectedTemplate(template: string) {
      this.selectedTemplate = template
    },
    setActiveTab(index: number) {
      this.activeTabIndex = index
    },
    setTranscriptStage(stage: 'idle' | 'transcribing' | 'correcting' | 'done') {
      this.transcriptStage = stage
    },
    setReportStage(stage: 'idle' | 'generating' | 'done') {
      this.reportStage = stage
    },
    setAudioFile(file: File) {
      this.audioFile = file
    },
    setTranscriptFile(file: File) {
      this.transcriptFile = file
    },
    setTranscriptText(text: string) {
      this.transcriptText = text
    },
    setReportText(text: string) {
      this.reportText = text
    },
    markSubmitted() {
      this.hasSubmitted = true
    },
    
    // 新增：人物關係圖相關 actions
    setPersonGraphJson(json: string) {
      this.personGraphJson = json
    },
    setPersonGraphStage(stage: 'idle' | 'generating' | 'done') {
      this.personGraphStage = stage
    },
    setAutoGeneratePersonGraph(auto: boolean) {
      this.autoGeneratePersonGraph = auto
    },
    
    // 重置功能
    reset() {
      this.audioFile = null
      this.transcriptFile = null
      this.transcriptText = ''
      this.reportText = ''
      this.reportStage = 'idle'
      this.transcriptStage = 'idle'
      this.activeTabIndex = 0
      this.selectedTemplate = ''
      this.personGraphJson = ''
      this.personGraphStage = 'idle'
      // 保留 sessionId，不重置
      localStorage.removeItem('pinia')
    },
    
    // 清除會話（完全重置，包含 sessionId）
    clearSession() {
      this.sessionId = ''
      this.reset()
    }
  },
  persist: {
    storage: localStorage,
    paths: ['sessionId', 'transcriptText', 'reportText', 'selectedTemplate', 'activeTabIndex', 'personGraphJson', 'autoGeneratePersonGraph']
  }
})
