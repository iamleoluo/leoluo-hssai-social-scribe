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
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-2">
            <div 
              v-for="section in availableSections" 
              :key="section.value"
              :class="[
                'flex items-start gap-2 p-2 border rounded transition-colors',
                section.required ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
              ]"
            >
              <Checkbox 
                v-model="selectedSections" 
                :value="section.value"
                :disabled="section.required"
                @change="onSectionChange"
                class="mt-0.5"
              />
              <div class="flex-1 min-w-0">
                <label class="text-xs font-medium cursor-pointer block" :class="section.required ? 'text-blue-800' : 'text-gray-700'">
                  {{ section.name }}
                  <span v-if="section.required" class="text-blue-600">(必選)</span>
                </label>
                <p class="text-xs mt-1 line-clamp-2" :class="section.required ? 'text-blue-600' : 'text-gray-500'">
                  {{ section.description }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </template>
    </Card>

    <!-- 社工服務領域選擇 -->
    <Card class="mb-6" v-if="selectedTemplate && selectedSections.length > 0">
      <template #title>
        <span class="flex items-center gap-2">
          <i class="pi pi-users text-orange-600"></i>
          社工服務領域 (處遇計畫用)
        </span>
      </template>
      <template #content>
        <div class="space-y-4">
          <div class="text-sm text-gray-600 mb-4">
            選擇適用的社工服務領域，將影響處遇計畫的建議內容（可複選）
          </div>
          
          <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div 
              v-for="field in serviceFields" 
              :key="field.value"
              class="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Checkbox 
                v-model="selectedServiceFields" 
                :value="field.value"
              />
              <label class="text-sm font-medium text-gray-700 cursor-pointer">
                {{ field.name }}
              </label>
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

// 模板選項 - 基於新版架構
const templateOptions = ref([
  { name: 'AI社工助手通用模板 v1.0', value: 'ai_social_worker_v1' },
  { name: '士林地院家事服務中心格式', value: 'shilin_court_format' },
  { name: '珍珠社會福利協會格式', value: 'pearl_welfare_format' }
])

// 可用段落 - 基於新版架構
const availableSections = ref([
  // 必顯示項目
  { 
    name: '一、主述議題', 
    value: 'main_issue', 
    description: '求助者的身分、求助方式、求助問題',
    required: true
  },
  { 
    name: '二、個案概況', 
    value: 'case_overview', 
    description: '家庭狀況、子女狀況、人物關係圖',
    required: true
  },
  
  // 可選項目
  { 
    name: '三-1. 法律相關狀況', 
    value: 'legal_status', 
    description: '訴訟、保護令、刑事案件、家暴等法律議題'
  },
  { 
    name: '三-2. 經濟或財務狀況', 
    value: 'financial_status', 
    description: '收入來源、經濟提供者、保險、負債、謀生能力'
  },
  { 
    name: '三-3. 人身或安全狀況', 
    value: 'safety_status', 
    description: '攻擊風險、家暴受虐、性騷擾、人身安全問題'
  },
  { 
    name: '三-4. 心理或情緒狀況', 
    value: 'psychological_status', 
    description: '人格特質、情緒穩定度、身心狀況、自傷傾向'
  },
  { 
    name: '三-5. 教養或教育狀況', 
    value: 'education_status', 
    description: '親職能力、教養困難、課後照顧、學業表現'
  },
  { 
    name: '三-6. 早療或幼兒狀況', 
    value: 'early_intervention_status', 
    description: '互動頻率、情感支持、家務分工、隔代教養'
  },
  { 
    name: '三-7. 醫療或生理狀況', 
    value: 'medical_status', 
    description: '罹病診治史、身心障礙、慢性疾病、服藥情況'
  },
  { 
    name: '三-8. 支持系統或狀況', 
    value: 'support_system', 
    description: '正式/非正式支持系統、委任律師、資源使用能力'
  },
  { 
    name: '三-9. 文化與傳統狀況', 
    value: 'cultural_status', 
    description: '國籍、民族、宗教信仰、生活習慣、語言溝通'
  },
  
  // 需求與評估
  { 
    name: '四-1. 個案需求與期待', 
    value: 'case_needs', 
    description: '個案想法規劃、表達需求、期待協助'
  },
  { 
    name: '四-2. 家庭功能評估', 
    value: 'family_assessment', 
    description: 'AI專業評估：優勢、劣勢、危機、機會'
  },
  { 
    name: '四-3. 整體評估建議', 
    value: 'overall_assessment', 
    description: 'AI專業評估：能動性、主要問題、協助需求'
  }
])

// 社工服務領域選項
const serviceFields = ref([
  { name: '司法與矯治', value: 'judicial_correction' },
  { name: '經濟扶助', value: 'economic_assistance' },
  { name: '新(原)住民', value: 'new_residents' },
  { name: '保護服務', value: 'protection_services' },
  { name: '兒童與少年', value: 'children_youth' },
  { name: '學校與教育', value: 'school_education' },
  { name: '婦女與家庭', value: 'women_family' },
  { name: '醫務相關', value: 'medical_related' },
  { name: '心理與精神', value: 'psychological_mental' },
  { name: '身心障礙', value: 'disability' },
  { name: '老人與長照', value: 'elderly_longterm_care' }
])

// 響應式狀態
const selectedTemplate = ref('')
const selectedSections = ref<string[]>([])
const selectedServiceFields = ref<string[]>([])
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
    'ai_social_worker_v1': '基於AI社工助手通用架構v1.0設計，適合司法、學校、醫療、特教、經濟、心理、長照、早療等領域的社工訪視紀錄',
    'shilin_court_format': '士林地方法院家事服務中心專用格式，著重於法律相關議題和家庭評估',
    'pearl_welfare_format': '珍珠社會福利協會專用格式，注重會談摘要和評估建議'
  }
  return descriptions[template] || '專業社工報告格式'
}

const onTemplateChange = () => {
  // 模板變更時重置段落選擇，但自動選擇必要項目
  const requiredSections = availableSections.value
    .filter(section => section.required)
    .map(section => section.value)
  
  selectedSections.value = requiredSections
  selectedServiceFields.value = []
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
  selectedServiceFields.value = []
  selectAll.value = false
  customNotes.value = ''
  reportStyle.value = 'formal'
}

const proceedToReport = async () => {
  // 保存配置到sessionStore
  const config = {
    selectedTemplate: selectedTemplate.value,
    selectedSections: selectedSections.value,
    selectedServiceFields: selectedServiceFields.value,
    customSettings: {
      notes: customNotes.value,
      style: reportStyle.value
    }
  }
  
  console.log('報告配置 (基於新架構):', config)
  
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
  max-width: 1200px;
  margin: 0 auto;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>