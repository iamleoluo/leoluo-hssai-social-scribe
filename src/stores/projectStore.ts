// src/stores/projectStore.ts
import { defineStore } from 'pinia'

export interface Project {
  id: string
  name: string
  createdAt: string
  audio?: string
  transcript?: string
  aiDocument?: string
  duration?: number
  settings?: Record<string, any>
}

export const useProjectStore = defineStore('project', {
  state: () => ({
    projectList: [] as Project[],
    currentProjectId: null as string | null,
    tempName: '', // 專案名稱
    tempAudio: '', // 錄音資料
    tempTranscript: '', // 逐字稿
    tempAiDocument: '',
    tempSettings: {} as Record<string, any> // AI 生成的內容
  }),

  getters: {
    currentProject(state): Project | null {
      return state.projectList.find((p) => p.id === state.currentProjectId) || null
    },
    isNewProject(state): boolean {
      return state.currentProjectId === null
    },
    isEditingProject(state): boolean {
      return !!state.tempName?.trim()
    }
  },

  actions: {
    generateDefaultName(): string {
      const now = new Date()
      const y = now.getFullYear()
      const m = String(now.getMonth() + 1).padStart(2, '0')
      const d = String(now.getDate()).padStart(2, '0')
      const h = String(now.getHours()).padStart(2, '0')
      const min = String(now.getMinutes()).padStart(2, '0')
      const s = String(now.getSeconds()).padStart(2, '0')
      return `新專案 at ${y}-${m}-${d} ${h}_${min}_${s}`
    },

    startNewProject() {
      console.log('hi')
      this.currentProjectId = null
      this.tempName = this.generateDefaultName()
      this.tempAudio = ''
      this.tempTranscript = ''
      this.tempAiDocument = ''
      this.tempSettings = {} // ← 清空設定
    },

    cancelEditing() {
      if (this.currentProjectId === null) {
        this.tempName = ''
        this.tempAudio = ''
        this.tempTranscript = ''
        this.tempAiDocument = ''
        this.currentProjectId = null
        this.tempSettings = {}
        return
      }

      const project = this.projectList.find((p) => p.id === this.currentProjectId)
      if (project) {
        this.tempName = ''
        this.tempAudio = ''
        this.tempTranscript = ''
        this.tempAiDocument = ''
        // 或你也可以選擇：填回原資料顯示但不可編輯
      }
    },

    loadProject(id: string) {
      const project = this.projectList.find((p) => p.id === id)
      if (project) {
        this.currentProjectId = id
        this.tempName = project.name
        this.tempAudio = project.audio || ''
        this.tempTranscript = project.transcript || ''
        this.tempAiDocument = project.aiDocument || ''
        this.tempSettings = project.settings || {}
      }
    },

    saveProject(duration?: number) {
      if (this.isNewProject) {
        const newProject: Project = {
          id: crypto.randomUUID(),
          name: this.tempName,
          createdAt: new Date().toISOString(),
          audio: this.tempAudio,
          transcript: this.tempTranscript,
          aiDocument: this.tempAiDocument,
          settings: this.tempSettings,
          duration
        }
        this.projectList.unshift(newProject)
        this.currentProjectId = newProject.id
      } else {
        const project = this.currentProject
        if (project) {
          project.name = this.tempName
          project.audio = this.tempAudio
          project.transcript = this.tempTranscript
          project.aiDocument = this.tempAiDocument
          if (duration !== undefined) project.duration = duration
          project.settings = this.tempSettings
        }
      }
    }
  }
})
