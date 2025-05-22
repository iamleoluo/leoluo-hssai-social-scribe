import { defineStore } from 'pinia'

export const useSessionStore = defineStore('session', {
  state: () => ({
    audioFile: null as File | null,
    transcriptFile: null as File | null,
    transcriptText: '',
    reportText: '',
    hasSubmitted: false,
    transcriptStage: 'idle' as 'idle' | 'transcribing' | 'correcting' | 'done',
    reportStage: 'idle' as 'idle' | 'generating' | 'done',
    activeTabIndex: 0,
    selectedTemplate: ''
  }),
  getters: {
    hasUploaded: (state) => {
      return (
        !!state.audioFile || !!state.transcriptFile || !!state.transcriptText || !!state.reportText
      )
    },
    hasTypescript: (state) => !!state.transcriptText,
    hasReport: (state) => !!state.reportText
  },
  actions: {
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
    reset() {
      this.audioFile = null
      this.transcriptFile = null
      this.transcriptText = ''
      this.reportText = ''
      this.reportStage = 'idle'
      this.transcriptStage = 'idle'
      this.activeTabIndex = 0
      this.selectedTemplate = ''
      localStorage.removeItem('pinia')
    }
  },
  persist: {
    storage: localStorage,
    paths: ['transcriptText', 'reportText', 'selectedTemplate', 'activeTabIndex']
  }
})
