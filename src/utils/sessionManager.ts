import { useSessionStore } from '@/stores/useSessionStore'

/**
 * 會話管理工具類
 */
export class SessionManager {
  private store = useSessionStore()

  /**
   * 清理後端會話文件
   */
  async cleanupBackendSession(sessionId?: string): Promise<boolean> {
    const id = sessionId || this.store.sessionId
    if (!id) return false

    try {
      const response = await fetch(`/cleanup/${id}`, {
        method: 'DELETE'
      })
      const result = await response.json()
      return result.status === 'success'
    } catch (error) {
      console.error('清理後端會話失敗:', error)
      return false
    }
  }

  /**
   * 完全清理會話（前端 + 後端）
   */
  async clearSession(): Promise<void> {
    const sessionId = this.store.sessionId
    
    // 清理後端文件
    if (sessionId) {
      await this.cleanupBackendSession(sessionId)
    }
    
    // 清理前端狀態
    this.store.clearSession()
  }

  /**
   * 重置會話內容但保留會話ID
   */
  async resetSession(): Promise<void> {
    // 不清理後端文件，只重置前端狀態
    this.store.reset()
  }

  /**
   * 檢查會話是否有內容
   */
  hasContent(): boolean {
    return this.store.hasUploaded
  }

  /**
   * 獲取當前會話ID
   */
  getSessionId(): string {
    return this.store.sessionId
  }

  /**
   * 初始化會話
   */
  initializeSession(): void {
    this.store.initializeSession()
  }
}

// 導出單例實例
export const sessionManager = new SessionManager() 