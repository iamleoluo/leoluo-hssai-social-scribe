<template>
  <div class="report-config-panel p-6">
    <!-- 頁面標題 -->
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-800 mb-2">報告設定</h2>
      <p class="text-gray-600">選擇報告模板和需要生成的段落</p>
    </div>

    <!-- 模板選擇區域 -->
    <Card class="mb-6">
      <template #title>
        <span class="flex items-center gap-2">
          <i class="pi pi-file-edit text-blue-600"></i>
          報告模板選擇
        </span>
      </template>
      <template #content>
        <div class="space-y-4">
          <div>
            <label for="template-select" class="block text-sm font-medium text-gray-700 mb-2">
              選擇模板類型
            </label>
            <Dropdown
              id="template-select"
              v-model="selectedTemplate"
              :options="templateOptions"
              optionLabel="name"
              optionValue="value"
              placeholder="請選擇報告模板"
              class="w-full"
              @change="onTemplateChange"
            />
          </div>
          
          <!-- 模板說明 -->
          <div v-if="selectedTemplate" class="bg-blue-50 p-4 rounded-lg">
            <h4 class="font-medium text-blue-800 mb-2">模板說明</h4>
            <p class="text-blue-700 text-sm">{{ getTemplateDescription(selectedTemplate) }}</p>
          </div>
        </div>
      </template>
    </Card>

    <!-- 段落選擇區域 -->
    <Card class="mb-6" v-if="selectedTemplate">
      <template #title>
        <span class="flex items-center gap-2">
          <i class="pi pi-list text-green-600"></i>
          段落選擇
        </span>
      </template>
      <template #content>
        <div class="space-y-4">
          <div class="text-sm text-gray-600 mb-4">
            選擇需要生成的報告段落（至少選擇一個）
          </div>
          
          <!-- 全選/取消全選 -->
          <div class="flex items-center gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
            <Checkbox 
              v-model="selectAll" 
              :binary="true"
              @change="onSelectAllChange"
            />
            <label class="font-medium text-gray-700">全選段落</label>
          </div>
          
          <!-- 段落選項 -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div 
              v-for="section in availableSections" 
              :key="section.value"
              class="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Checkbox 
                v-model="selectedSections" 
                :value="section.value"
                @change="onSectionChange"
              />
              <div class="flex-1">
                <label class="font-medium text-gray-700 cursor-pointer">
                  {{ section.name }}
                </label>
                <p class="text-sm text-gray-500 mt-1">{{ section.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </template>
    </Card>

    <!-- 自定義設定區域 -->
    <Card class="mb-6" v-if="selectedTemplate && selectedSections.length > 0">
      <template #title>
        <span class="flex items-center gap-2">
          <i class="pi pi-cog text-purple-600"></i>
          自定義設定 (選填)
        </span>
      </template>
      <template #content>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              特殊要求或備註
            </label>
            <Textarea 
              v-model="customNotes"
              rows="3"
              placeholder="例如：特別注重子女議題的分析、強調法律相關建議等..."
              class="w-full"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              報告風格偏好
            </label>
            <div class="flex gap-4">
              <div class="flex items-center">
                <RadioButton v-model="reportStyle" value="formal" />
                <label class="ml-2">正式風格</label>
              </div>
              <div class="flex items-center">
                <RadioButton v-model="reportStyle" value="detailed" />
                <label class="ml-2">詳細分析</label>
              </div>
              <div class="flex items-center">
                <RadioButton v-model="reportStyle" value="concise" />
                <label class="ml-2">簡潔摘要</label>
              </div>
            </div>
          </div>
        </div>
      </template>
    </Card>

    <!-- 操作按鈕 -->
    <div class="flex justify-between items-center pt-4 border-t">
      <div class="text-sm text-gray-500">
        <span v-if="configValidation.isValid" class="text-green-600 flex items-center gap-1">
          <i class="pi pi-check-circle"></i>
          設定完成，可以生成報告
        </span>
        <span v-else class="text-orange-600 flex items-center gap-1">
          <i class="pi pi-exclamation-triangle"></i>
          {{ configValidation.message }}
        </span>
      </div>
      
      <div class="flex gap-3">
        <Button 
          label="重置設定" 
          icon="pi pi-refresh" 
          severity="secondary" 
          @click="resetConfig"
          outlined
        />
        <Button 
          label="下一步：生成報告" 
          icon="pi pi-arrow-right" 
          :disabled="!configValidation.isValid"
          @click="proceedToReport"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import Card from 'primevue/card'
import Dropdown from 'primevue/dropdown'
import Checkbox from 'primevue/checkbox'
import Textarea from 'primevue/textarea'
import RadioButton from 'primevue/radiobutton'
import Button from 'primevue/button'
import { useSessionStore } from '@/stores/useSessionStore'
import { storeToRefs } from 'pinia'

const sessionStore = useSessionStore()
const { transcriptText, reportText, sessionId, autoGeneratePersonGraph } = storeToRefs(sessionStore)

// 模板選項
const templateOptions = ref([
  { name: '司法社工家庭訪視模板', value: '司法社工家庭訪視模板' },
  { name: '士林地院家事服務中心格式(ChatGPT)', value: '士林地院家事服務中心格式(ChatGPT)' },
  { name: '士林地院家事服務中心格式(Claude)', value: '士林地院家事服務中心格式(Claude)' },
  { name: '珍珠社會福利協會格式(ChatGPT)', value: '珍珠社會福利協會格式(ChatGPT)' },
  { name: '珍珠社會福利協會格式(Claude)', value: '珍珠社會福利協會格式(Claude)' }
])

// 可用段落
const availableSections = ref([
  { 
    name: '主述問題', 
    value: 'main_issue', 
    description: '案主提出的主要問題和訴求' 
  },
  { 
    name: '個案概況', 
    value: 'case_overview', 
    description: '個案的基本情況和背景資料' 
  },
  { 
    name: '家庭狀況', 
    value: 'family_situation', 
    description: '家庭成員關係和互動情況' 
  },
  { 
    name: '子女議題', 
    value: 'children_issues', 
    description: '子女相關的問題和需求' 
  },
  { 
    name: '訴訟狀況', 
    value: 'legal_status', 
    description: '法律程序和訴訟進展' 
  },
  { 
    name: '經濟狀況', 
    value: 'financial_status', 
    description: '家庭經濟能力和資源' 
  },
  { 
    name: '社工評估', 
    value: 'social_worker_assessment', 
    description: 'AI生成的專業評估和建議' 
  },
  { 
    name: '處遇建議', 
    value: 'intervention_recommendations', 
    description: '具體的處置建議和方案' 
  },
  { 
    name: '後續追蹤', 
    value: 'follow_up', 
    description: '後續服務和追蹤計畫' 
  }
])

// 響應式狀態
const selectedTemplate = ref('')
const selectedSections = ref<string[]>([])
const selectAll = ref(false)
const customNotes = ref('')
const reportStyle = ref('formal')

// 計算屬性
const configValidation = computed(() => {
  if (!selectedTemplate.value) {
    return { isValid: false, message: '請選擇報告模板' }
  }
  if (selectedSections.value.length === 0) {
    return { isValid: false, message: '請至少選擇一個報告段落' }
  }
  return { isValid: true, message: '設定完成' }
})

// 方法
const getTemplateDescription = (template: string) => {
  const descriptions: Record<string, string> = {
    '司法社工家庭訪視模板': '適用於家事法庭的標準社工訪視報告格式',
    '士林地院家事服務中心格式(ChatGPT)': '士林地方法院專用格式，使用ChatGPT生成',
    '士林地院家事服務中心格式(Claude)': '士林地方法院專用格式，使用Claude生成',
    '珍珠社會福利協會格式(ChatGPT)': '珍珠協會專用格式，使用ChatGPT生成',
    '珍珠社會福利協會格式(Claude)': '珍珠協會專用格式，使用Claude生成'
  }
  return descriptions[template] || '專業社工報告格式'
}

const onTemplateChange = () => {
  // 模板變更時重置段落選擇
  selectedSections.value = []
  selectAll.value = false
}

const onSelectAllChange = () => {
  if (selectAll.value) {
    selectedSections.value = availableSections.value.map(s => s.value)
  } else {
    selectedSections.value = []
  }
}

const onSectionChange = () => {
  selectAll.value = selectedSections.value.length === availableSections.value.length
}

const resetConfig = () => {
  selectedTemplate.value = ''
  selectedSections.value = []
  selectAll.value = false
  customNotes.value = ''
  reportStyle.value = 'formal'
}

const proceedToReport = async () => {
  // 保存配置到sessionStore
  const config = {
    selectedTemplate: selectedTemplate.value,
    selectedSections: selectedSections.value,
    customSettings: {
      notes: customNotes.value,
      style: reportStyle.value
    }
  }
  
  // 這裡將來會與新的store整合，目前先用現有的sessionStore
  console.log('報告配置:', config)
  
  // 開始生成報告
  await generateReportWithConfig(config)
}

// 生成報告的核心函數
const generateReportWithConfig = async (config: any) => {
  const transcript = transcriptText.value?.trim()
  if (!transcript) {
    alert('目前尚未有逐字稿內容')
    return
  }
  
  // 保存選擇的模板到sessionStore
  sessionStore.setSelectedTemplate(config.selectedTemplate)
  sessionStore.setReportStage('generating')
  sessionStore.setReportText('') // 清空
  
  // 跳轉到報告初稿分頁 (索引 2)
  sessionStore.setActiveTab(2)

  try {
    const response = await fetch('/api/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        text: transcript,
        template: config.selectedTemplate,
        selectedSections: config.selectedSections,
        customSettings: config.customSettings,
        sessionId: sessionId.value
      })
    })
    
    if (!response.body) {
      sessionStore.setReportStage('done')
      return
    }
    
    const reader = response.body.getReader()
    const decoder = new TextDecoder('utf-8')
    let buffer = ''
    
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      
      buffer += decoder.decode(value, { stream: true })
      let lines = buffer.split('\n')
      buffer = lines.pop() || ''
      
      for (const line of lines) {
        if (!line.trim()) continue
        try {
          const obj = JSON.parse(line)
          sessionStore.setReportText(reportText.value + obj.content)
        } catch (e) {
          // 可加錯誤處理
        }
      }
    }
    
    sessionStore.setReportStage('done')
    
    // 報告生成完成後，如果啟用自動生成人物關係圖，則自動觸發
    if (autoGeneratePersonGraph.value) {
      await generatePersonGraphFromReport()
    }
  } catch (err) {
    console.error('生成報告失敗', err)
    sessionStore.setReportText('[生成失敗，請稍後再試]')
    sessionStore.setReportStage('done')
  }
}

// 自動生成人物關係圖
const generatePersonGraphFromReport = async () => {
  const reportTextValue = reportText.value?.trim()
  if (!reportTextValue) {
    console.warn('沒有報告內容，無法生成人物關係圖')
    return
  }

  sessionStore.setPersonGraphStage('generating')
  sessionStore.setPersonGraphJson('')

  try {
    const response = await fetch('/api/PersonGraph', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        text: reportTextValue,
        sessionId: sessionId.value
      })
    })
    
    if (!response.body) {
      sessionStore.setPersonGraphStage('done')
      return
    }
    
    const reader = response.body.getReader()
    const decoder = new TextDecoder('utf-8')
    let buffer = ''
    let content = ''
    
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      
      buffer += decoder.decode(value, { stream: true })
      let lines = buffer.split('\n')
      buffer = lines.pop() || ''
      
      for (const line of lines) {
        if (!line.trim()) continue
        try {
          const obj = JSON.parse(line)
          content += obj.content
        } catch (e) {
          // 忽略解析錯誤
        }
      }
    }
    
    sessionStore.setPersonGraphJson(content)
    sessionStore.setPersonGraphStage('done')
    console.log('人物關係圖自動生成完成')
  } catch (err) {
    console.error('生成人物關係圖失敗', err)
    sessionStore.setPersonGraphStage('done')
  }
}

// 監聽段落選擇變化
watch(selectedSections, () => {
  selectAll.value = selectedSections.value.length === availableSections.value.length
})
</script>

<style scoped>
.report-config-panel {
  max-width: 900px;
  margin: 0 auto;
}
</style>