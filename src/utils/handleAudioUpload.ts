import { useSessionStore } from '@/stores/useSessionStore'
import apiClient from '@/api/axiosClient'

let ffmpeg: any

export const handleAudioUpload = async (
  event: Event,
  scrollToEditor: () => void,
  correctTranscriptWithOpenAI: (text: string) => Promise<void>
) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  const store = useSessionStore()
  store.reset()
  store.setAudioFile(file)
  store.setTranscriptStage('transcribing')

  try {
    // ✅ 動態載入 ffmpeg（解決 Vite ESM 相容問題）
    if (!ffmpeg) {
      const { createFFmpeg, fetchFile } = await import('@ffmpeg/ffmpeg')
      ffmpeg = createFFmpeg({ log: true })
      await ffmpeg.load()
      ffmpeg.fetchFile = fetchFile
    }

    const fileName = 'input.wav'
    ffmpeg.FS('writeFile', fileName, await ffmpeg.fetchFile(file))

    const outPattern = 'output_%03d.wav'
    await ffmpeg.run(
      '-i',
      fileName,
      '-f',
      'segment',
      '-segment_time',
      '30',
      '-c',
      'copy',
      outPattern
    )

    let index = 0
    let fullTranscript = ''
    while (true) {
      const name = `output_${index.toString().padStart(3, '0')}.wav`
      try {
        const data = ffmpeg.FS('readFile', name)
        const blob = new Blob([data.buffer], { type: 'audio/wav' })

        const formData = new FormData()
        formData.append('audio', blob, `segment_${index}.wav`)
        const response = await fetch(`${apiClient.defaults.baseURL}/transcribe`, {
          method: 'POST',
          body: formData
        })

        const resJson = await response.json()
        fullTranscript += (resJson.text?.trim() || '') + '\n'
        index++
      } catch {
        break
      }
    }

    if (!fullTranscript.trim()) throw new Error('轉錄結果為空')

    store.setTranscriptText(fullTranscript.trim())
    await correctTranscriptWithOpenAI(fullTranscript)
    scrollToEditor()
  } catch (e) {
    console.error('轉錄失敗', e)
    store.setTranscriptText('[轉錄失敗，請稍後再試]')
  } finally {
    store.setTranscriptStage('done')
  }
}
