export const transcriptStageMessageMap: Record<
  'idle' | 'transcribing' | 'correcting' | 'done',
  string
> = {
  idle: '',
  transcribing: '語音轉逐字稿中，請稍候…',
  correcting: '正在校正逐字稿內容…',
  done: '逐字稿完成！'
}

export const reportStageMessageMap: Record<'idle' | 'generating' | 'done', string> = {
  idle: '',
  generating: '正在產生報告初稿...',
  done: '報告初稿完成！'
}

export const templateMessageMap: Record<'司法社工家庭訪視模板', Array<string>> = {
  司法社工家庭訪視模板: ['主訴議題', '家庭狀況', '子女狀況', '法律議題', '社工評估(AI生成)']
}
