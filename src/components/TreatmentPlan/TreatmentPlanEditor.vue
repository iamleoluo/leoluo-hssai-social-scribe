<template>
  <div class="treatment-plan-editor p-6">
    <!-- 頁面標題 -->
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-800 mb-2">處遇計畫</h2>
      <p class="text-gray-600">基於報告內容生成專業的社工處遇計畫</p>
    </div>

    <!-- 狀態檢查 -->
    <div v-if="!hasReport" class="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
      <div class="flex items-center gap-2 text-orange-700">
        <i class="pi pi-exclamation-triangle"></i>
        <span class="font-medium">尚未生成報告</span>
      </div>
      <p class="text-orange-600 mt-2">請先完成報告生成，才能建立處遇計畫。</p>
      <Button 
        label="前往報告設定" 
        icon="pi pi-arrow-left" 
        severity="warning" 
        outlined
        class="mt-3"
        @click="goToReportConfig"
      />
    </div>

    <!-- 處遇計畫內容 -->
    <div v-else>
      <!-- 生成控制區域 -->
      <Card class="mb-6" v-if="!hasTreatmentPlan || isRegenerating">
        <template #title>
          <span class="flex items-center gap-2">
            <i class="pi pi-cog text-blue-600"></i>
            處遇計畫生成
          </span>
        </template>
        <template #content>
          <div class="space-y-4">
            <!-- 報告摘要 -->
            <div class="bg-gray-50 p-4 rounded-lg">
              <h4 class="font-medium text-gray-800 mb-2">報告摘要</h4>
              <p class="text-gray-600 text-sm">{{ reportSummary }}</p>
            </div>

            <!-- 主述議題提取 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                主要議題（可編輯）
              </label>
              <Textarea 
                v-model="mainIssue"
                rows="3"
                placeholder="系統將自動從報告中提取主要議題，您也可以手動調整..."
                class="w-full"
              />
            </div>

            <!-- 案件類型 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                案件類型
              </label>
              <Dropdown
                v-model="caseType"
                :options="caseTypeOptions"
                optionLabel="name"
                optionValue="value"
                placeholder="請選擇案件類型"
                class="w-full"
              />
            </div>

            <!-- 社工服務領域 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                社工服務領域（可複選，影響處遇計畫建議）
              </label>
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

            <!-- 生成按鈕 -->
            <div class="flex justify-center pt-4">
              <Button 
                :label="isGenerating ? '生成中...' : '生成處遇計畫'"
                :icon="isGenerating ? 'pi pi-spin pi-spinner' : 'pi pi-plus'"
                :disabled="isGenerating || !mainIssue.trim()"
                :loading="isGenerating"
                @click="generateTreatmentPlan"
                size="large"
              />
            </div>
          </div>
        </template>
      </Card>

      <!-- 處遇計畫編輯區域 -->
      <Card v-if="hasTreatmentPlan" class="mb-6">
        <template #title>
          <div class="flex justify-between items-center w-full">
            <span class="flex items-center gap-2">
              <i class="pi pi-file-edit text-green-600"></i>
              處遇計畫內容
            </span>
            <div class="flex gap-2">
              <Button 
                icon="pi pi-refresh" 
                severity="secondary" 
                outlined
                @click="regeneratePlan"
                v-tooltip="'重新生成'"
              />
              <Button 
                icon="pi pi-pencil" 
                :severity="isEditing ? 'success' : 'secondary'"
                :outlined="!isEditing"
                @click="toggleEdit"
                v-tooltip="isEditing ? '完成編輯' : '編輯模式'"
              />
            </div>
          </div>
        </template>
        <template #content>
          <div class="space-y-4">
            <!-- 生成時間 -->
            <div class="text-sm text-gray-500 mb-4" v-if="generatedAt">
              生成時間：{{ formatDate(generatedAt) }}
            </div>

            <!-- 處遇計畫內容 -->
            <div v-if="isGenerating" class="space-y-4">
              <!-- 生成中的骨架載入 -->
              <div class="animate-pulse space-y-3">
                <div class="h-4 bg-gray-200 rounded w-1/4"></div>
                <div class="h-4 bg-gray-200 rounded w-3/4"></div>
                <div class="h-4 bg-gray-200 rounded w-1/2"></div>
                <div class="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
              <div class="text-center text-gray-500 py-4">
                <i class="pi pi-spin pi-spinner mr-2"></i>
                正在生成處遇計畫，請稍候...
              </div>
            </div>

            <div v-else>
              <Textarea 
                v-model="treatmentContent"
                :readonly="!isEditing"
                rows="20"
                class="w-full font-mono text-sm"
                :class="{ 'bg-gray-50': !isEditing }"
              />
            </div>
          </div>
        </template>
      </Card>

      <!-- 操作按鈕 -->
      <div class="flex justify-between items-center pt-4 border-t" v-if="hasTreatmentPlan">
        <div class="text-sm text-gray-500">
          <span class="flex items-center gap-1">
            <i class="pi pi-check-circle text-green-600"></i>
            處遇計畫已完成
          </span>
        </div>
        
        <div class="flex gap-3">
          <Button 
            label="下載計畫" 
            icon="pi pi-download" 
            severity="secondary" 
            outlined
            @click="downloadPlan"
          />
          <Button 
            label="下一步：人物關係圖" 
            icon="pi pi-arrow-right" 
            @click="goToPersonGraph"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Textarea from 'primevue/textarea'
import Dropdown from 'primevue/dropdown'
import Checkbox from 'primevue/checkbox'
import { useSessionStore } from '@/stores/useSessionStore'
import { storeToRefs } from 'pinia'

const sessionStore = useSessionStore()
const { reportText, sessionId } = storeToRefs(sessionStore)

// 響應式狀態
const treatmentContent = ref('')
const isGenerating = ref(false)
const isEditing = ref(false)
const isRegenerating = ref(false)
const mainIssue = ref('')
const caseType = ref('family_mediation')
const selectedServiceFields = ref<string[]>([])
const generatedAt = ref<Date | null>(null)
const customNotes = ref('')
const reportStyle = ref('formal')

// 案件類型選項
const caseTypeOptions = ref([
  { name: '家事商談', value: 'family_mediation' },
  { name: '親子關係', value: 'parent_child' },
  { name: '婚姻諮商', value: 'marriage_counseling' },
  { name: '兒少保護', value: 'child_protection' },
  { name: '家庭暴力', value: 'domestic_violence' },
  { name: '其他家事案件', value: 'other_family' }
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

// 計算屬性
const hasReport = computed(() => !!reportText.value?.trim())
const hasTreatmentPlan = computed(() => !!treatmentContent.value?.trim())
const reportSummary = computed(() => {
  const report = reportText.value?.trim()
  if (!report) return '尚無報告內容'
  
  // 簡單提取前200字作為摘要
  const summary = report.substring(0, 200)
  return summary.length < report.length ? summary + '...' : summary
})

// 方法
const extractMainIssue = () => {
  const report = reportText.value?.trim()
  if (!report) return ''
  
  // 嘗試從報告中提取主述問題
  const lines = report.split('\n')
  for (const line of lines) {
    if (line.includes('主述') || line.includes('主要問題') || line.includes('問題')) {
      const extracted = line.replace(/^[一二三四五六七八九十、\d\.\s]*/, '').trim()
      if (extracted.length > 10) {
        return extracted.substring(0, 100) + (extracted.length > 100 ? '...' : '')
      }
    }
  }
  
  return '請根據報告內容描述主要議題'
}

const generateTreatmentPlan = async () => {
  if (!mainIssue.value.trim()) {
    alert('請先填寫主要議題')
    return
  }
  
  isGenerating.value = true
  treatmentContent.value = ''
  
  try {
    const response = await fetch('/api/treatment-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reportContent: reportText.value,
        mainIssue: mainIssue.value,
        caseType: caseType.value,
        serviceFields: selectedServiceFields.value,
        customSettings: {
          notes: customNotes.value,
          style: reportStyle.value
        },
        sessionId: sessionId.value
      })
    })
    
    if (!response.body) {
      isGenerating.value = false
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
          treatmentContent.value += obj.content
        } catch (e) {
          // 忽略解析錯誤
        }
      }
    }
    
    generatedAt.value = new Date()
    isGenerating.value = false
    isRegenerating.value = false
    
  } catch (err) {
    console.error('生成處遇計畫失敗', err)
    treatmentContent.value = '[生成失敗，請稍後再試]'
    isGenerating.value = false
    isRegenerating.value = false
  }
}

const regeneratePlan = () => {
  isRegenerating.value = true
  generateTreatmentPlan()
}

const toggleEdit = () => {
  isEditing.value = !isEditing.value
}

const downloadPlan = () => {
  const content = treatmentContent.value.trim()
  if (!content) {
    alert('沒有可下載的內容')
    return
  }
  
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  
  const a = document.createElement('a')
  a.href = url
  a.download = 'treatment_plan.txt'
  a.click()
  
  URL.revokeObjectURL(url)
}

const goToReportConfig = () => {
  sessionStore.setActiveTab(1) // 報告設定分頁
}

const goToPersonGraph = () => {
  sessionStore.setActiveTab(4) // 人物關係圖分頁
}

const formatDate = (date: Date) => {
  return date.toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 監聽報告變化，自動提取主述議題
watch(reportText, () => {
  if (reportText.value && !mainIssue.value) {
    mainIssue.value = extractMainIssue()
  }
}, { immediate: true })

// 組件掛載時初始化
onMounted(() => {
  if (reportText.value && !mainIssue.value) {
    mainIssue.value = extractMainIssue()
  }
})
</script>

<style scoped>
.treatment-plan-editor {
  max-width: 1000px;
  margin: 0 auto;
}

.font-mono {
  font-family: 'Courier New', monospace;
}
</style>