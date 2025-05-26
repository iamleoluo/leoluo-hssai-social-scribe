<template>
  <Dialog 
    :visible="modelValue"
    @update:visible="$emit('update:modelValue', $event)"
    header="📖 使用說明" 
    :style="{ width: '90vw', maxWidth: '600px' }"
    modal
    :draggable="false"
  >
    <!-- 功能概覽 -->
    <div class="mb-6 p-4 border-l-4 border-l-blue-500 bg-blue-50 rounded-r-lg">
      <h3 class="text-lg font-semibold mb-2 text-blue-700 flex items-center">
        <i class="pi pi-star mr-2"></i>功能概覽
      </h3>
      <p class="text-gray-700 leading-relaxed">
        這個工具可以幫助社工快速將訪談錄音轉換為專業的社工報告，並自動生成人物關係圖，讓您專注於服務本身而非文書工作。
      </p>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
        <div class="text-center p-3 bg-white rounded-lg">
          <i class="pi pi-microphone text-2xl text-purple-600 mb-2 block"></i>
          <div class="font-medium text-sm">語音轉文字</div>
          <div class="text-xs text-gray-500">自動轉錄</div>
        </div>
        <div class="text-center p-3 bg-white rounded-lg">
          <i class="pi pi-file-edit text-2xl text-green-600 mb-2 block"></i>
          <div class="font-medium text-sm">智能報告</div>
          <div class="text-xs text-gray-500">專業格式</div>
        </div>
        <div class="text-center p-3 bg-white rounded-lg">
          <i class="pi pi-sitemap text-2xl text-orange-600 mb-2 block"></i>
          <div class="font-medium text-sm">關係圖譜</div>
          <div class="text-xs text-gray-500">視覺化呈現</div>
        </div>
      </div>
    </div>

    <!-- 使用步驟 -->
    <div class="mb-6 p-4 border-l-4 border-l-green-500 bg-green-50 rounded-r-lg">
      <h3 class="text-lg font-semibold mb-3 text-green-700 flex items-center">
        <i class="pi pi-list mr-2"></i>使用步驟
      </h3>
      
      <div class="space-y-3">
        <div class="flex items-start space-x-3">
          <Tag value="1" severity="info" class="flex-shrink-0" />
          <div>
            <div class="font-medium text-sm">準備資料</div>
            <p class="text-xs text-gray-600 mt-1">
              上傳訪談錄音檔（支援 MP3、WAV、M4A）或直接貼上逐字稿文字
            </p>
          </div>
        </div>
        
        <div class="flex items-start space-x-3">
          <Tag value="2" severity="info" class="flex-shrink-0" />
          <div>
            <div class="font-medium text-sm">處理逐字稿</div>
            <p class="text-xs text-gray-600 mt-1">
              系統會自動將錄音轉為文字，您可以編輯修改內容
            </p>
          </div>
        </div>
        
        <div class="flex items-start space-x-3">
          <Tag value="3" severity="info" class="flex-shrink-0" />
          <div>
            <div class="font-medium text-sm">生成報告</div>
            <p class="text-xs text-gray-600 mt-1">
              切換到「報告初稿」頁籤，AI 會自動將逐字稿整理成專業報告
            </p>
          </div>
        </div>
        
        <div class="flex items-start space-x-3">
          <Tag value="4" severity="info" class="flex-shrink-0" />
          <div>
            <div class="font-medium text-sm">查看關係圖</div>
            <p class="text-xs text-gray-600 mt-1">
              在「人物關係圖」頁籤中查看自動生成的關係圖，可透過對話方式修改
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- 貼心提醒 -->
    <div class="p-4 border-l-4 border-l-amber-500 bg-amber-50 rounded-r-lg">
      <h3 class="text-lg font-semibold mb-2 text-amber-700 flex items-center">
        <i class="pi pi-lightbulb mr-2"></i>貼心提醒
      </h3>
      <ul class="space-y-2 text-sm text-gray-700">
        <li class="flex items-start">
          <i class="pi pi-check-circle text-green-500 mr-2 mt-0.5 flex-shrink-0"></i>
          建議錄音環境安靜，語音清晰以提高轉錄準確度
        </li>
        <li class="flex items-start">
          <i class="pi pi-check-circle text-green-500 mr-2 mt-0.5 flex-shrink-0"></i>
          可以隨時編輯逐字稿內容，確保資訊正確
        </li>
        <li class="flex items-start">
          <i class="pi pi-check-circle text-green-500 mr-2 mt-0.5 flex-shrink-0"></i>
          生成的報告可以複製貼上到其他文件中使用
        </li>
        <li class="flex items-start">
          <i class="pi pi-check-circle text-green-500 mr-2 mt-0.5 flex-shrink-0"></i>
          關係圖支援互動操作，可拖拽節點調整位置
        </li>
        <li class="flex items-start">
          <i class="pi pi-check-circle text-green-500 mr-2 mt-0.5 flex-shrink-0"></i>
          所有資料在瀏覽器本地處理，保護個案隱私
        </li>
      </ul>
    </div>
    
    <template #footer>
      <div class="flex justify-end space-x-2">
        <Button label="我知道了" icon="pi pi-check" @click="$emit('update:modelValue', false)" />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import Tag from 'primevue/tag'

defineProps<{
  modelValue: boolean
}>()

defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()
</script> 