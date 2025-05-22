<template>
  <div class="transition-all duration-1000 ease-in-out w-full text-gray-800">
    <Message v-if="sessionStore.transcriptStage !== 'idle'">{{ stageMessage }}</Message>

    <template
      v-if="
        sessionStore.transcriptStage === 'transcribing' ||
        sessionStore.transcriptStage === 'correcting'
      "
    >
      <!-- 模擬 textarea 的骨架 loading 區塊 -->
      <div class="w-full h-64 border p-2 rounded animate-pulse space-y-2">
        <div class="flex space-x-2">
          <div class="h-4 bg-gray-200 rounded w-[60%]"></div>
          <div class="h-4 bg-gray-200 rounded w-[20%]"></div>
        </div>
        <div class="h-4 bg-gray-200 rounded w-[90%]"></div>
        <div class="flex space-x-5">
          <div class="h-4 bg-gray-200 mb-4 rounded w-[30%]"></div>
          <div class="h-4 bg-gray-200rounded w-[40%]"></div>
        </div>
        <div class="h-4 bg-gray-200 rounded w-[85%]"></div>
        <div class="h-4 bg-gray-200 rounded w-[50%]"></div>
        <div class="flex space-x-1">
          <div class="h-4 bg-gray-200 mb-6 rounded w-[40%]"></div>
          <div class="h-4 bg-gray-200 rounded w-[30%]"></div>
          <div class="h-4 bg-gray-200 rounded w-[15%]"></div>
        </div>
        <div class="h-4 bg-gray-200 rounded w-[70%]"></div>
        <div class="flex space-x-2">
          <div class="h-4 bg-gray-200 rounded w-[45%]"></div>
          <div class="h-4 bg-gray-200 rounded w-[35%]"></div>
        </div>
      </div>
    </template>

    <template v-else>
      <textarea
        ref="textareaRef"
        class="w-full h-auto min-h-[50vh] border p-2 rounded resize-none"
        v-model="sessionStore.transcriptText"
      />
      <div class="w-full mx-auto flex justify-center space-x-4">
        <button
          class="flex justify-center items-center text-center mt-4 bg-amber-500 text-white px-4 py-2 rounded hover:bg-amber-700"
          @click="download"
        >
          <img src="@/assets/downloads.png" alt="icon" class="h-5 mr-1" />
          下載逐字稿
        </button>

        <!-- <button
          class="mt-4 text-purple-700 px-4 py-2 flex rounded border border-purple-700 hover:bg-gray-50"
          @click="submit"
        >
          <img src="@/assets/add.png" alt="generate-icon" class="h-5 mr-1" />
          生成報告
        </button> -->
        <SplitButton
          label="submit"
          class="mt-4 text-purple-700 flex"
          :model="templateOptions"
          severity="help"
          ref="splitButtonRef"
          @click="openMenu"
        >
          <img src="@/assets/add.png" alt="icon" class="h-5 mr-1" />
          生成報告
        </SplitButton>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import axios from 'axios'
import Message from 'primevue/message'
import { useSessionStore } from '@/stores/useSessionStore'
import { transcriptStageMessageMap } from '@/utils/stageMessages'
import SplitButton from 'primevue/splitbutton'

const sessionStore = useSessionStore()
const stageMessage = computed(() => transcriptStageMessageMap[sessionStore.transcriptStage])

const splitButtonRef = ref<InstanceType<typeof SplitButton> | null>(null)

const openMenu = () => {
  const menuBtn = splitButtonRef.value?.$el?.querySelector(
    '[data-pc-name="menubutton"]'
  ) as HTMLElement

  if (menuBtn) {
    menuBtn.focus()
    menuBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  } else {
    console.warn('找不到 SplitButton 的 menu button')
  }
}

const templates = ['司法社工家庭訪視模板']

const templateOptions = templates.map((template) => ({
  label: template,
  command: () => {
    sessionStore.setSelectedTemplate(template)
    submit(template)
  }
}))

const submit = async (template: string) => {
  console.log('使用模板生成報告：', template)
  sessionStore.setSelectedTemplate(template)
  const transcript = sessionStore.transcriptText?.trim()
  if (!transcript) {
    alert('目前尚未有逐字稿內容')
    return
  }

  sessionStore.setReportStage('generating') // ⬅️ 1. 設定正在生成中
  sessionStore.activeTabIndex = 1 // ⬅️ 1. 切換到「報告初稿」Tab (index 根據你的順序)

  const fullPrompt = `
請你根據下面的逐字稿內容，幫我整理成結構化的家事商談報告，以下是一個範例：

一、主述問題
案主至中心接受家事商談前個別會談。
二、個案概況
(一)家庭
1.案主夫妻透過友人介紹認識進而交往，交往 1 年結婚，但案主遺忘結婚契機。
2.案主夫妻育有案女(100 年次、長安國中 2 年級)及案子(103 年次、長安國小五年級)。
3.原案主夫妻與案父母、案女、案兄同住臺北市北投區，後因案岳母擔心案妻與案母同
住恐產生婆媳問題，因此於臺北市中山區購屋讓案主夫妻及兩名案子女居住。
4.案主自述過往與案妻相處無太多衝突，假日一家四口會與親友一同露營；案主每日偕
同案妻開車接送兩名案子女上學，並獨自接兩名案子女回家。
5.案主表示與案妻於教育理念不同，案妻期待安排兩名案子女出國深造，因此需要一筆
可觀教育費，但案主自認家境未如案妻優越，不認同案妻教育理念。
6.案主從事家族企業之油墨業務，1 個月薪資 6 萬，每月提供 4 萬 5 仟予案妻作為家
用，不足由案妻向案岳母索取。
7.案妻為家管，後期經常網購消費，並經常向案岳母索錢網購，案岳母不滿已負擔購
屋、案家水電費，要求案妻向案主索取金錢，導致案主夫妻開始產生衝突，案主強調衝
突多為冷戰。
8.111 年 10 月案主酒後向案妻坦承外遇並提議離婚，案妻難以接受以至至精神科就
醫，案主見案妻倍受打擊，提議搬回臺北市北投區，案妻同意，隔日案主搬回與案父
母、案兄同住至今。
9.112 年春節前案妻寄送存證信函，案主夫妻皆委任律師至律師事務所進行協商，案妻
要求案主提供 60 萬、案妻單獨行使兩名案子女親權、每月會面 1 次、案主每月負擔 5
萬扶養費，且因擔心案主不願支付，案主需簽本票，案主不滿條件苛刻而未答應。
10.案岳父母於印尼經營火鍋店，案大舅子(同志)及案妻皆曾至美國/加拿大留學，現案
大舅子回印尼接管家業。
(二)子女議題
1.案主夫妻分居後案主仍然和過往一樣接送兩名案子女上下學，並替一家四口購買晚
餐。
2.兩名案子女不曾詢問案主夫妻分居原因，亦未提問案主夫妻關係，案主因案妻與案女
同房，推測兩名案子女應該知悉部份案情。
3.案主夫妻分居期間，案女不曾和案主外出用餐；案子去年則與案主用餐 1-2 次。案主
未參加兩名案子女學校運動會。
4.平時兩名案子女不會主動聯繫案主，案主透過訊息與兩名案子女聯繫，兩名案子女多未回應，僅案主拿物品至案妻家，案子願意下樓拿取。
5.案主自述以責打方式管教兩名案子女，自案女國中起即未再責打，案妻卻以此主張案
女因案主責打受影響致近期需接受心理諮商。
6.案父母及案主委任律師皆期待案主爭取其中 1 名案子女親權，但案主無意爭取親權，
案主在乎會面。
7.案主對家事商談期待：討論大方向之會面時間、頻率及方式及扶養費(3 萬元)。
(三)訴訟
1.案主夫妻於律師事務所協商未果，113 年 5 月案妻聲請訴請離婚及酌定親權；8 月調
解不成立；114 年 1 月親股法官開庭，並告知此案應隸屬臺北地院管轄，將移送本案至
臺北地院，但因案主夫妻均認為至士林地院較近，故轉至中心進行家事商談，避免兩造
需舟車勞頓至臺北地院開庭。
2.案主訴訟策略為否認外遇，主張酒後胡言亂語，案主不願離婚。
3.案主期待好聚好散，但感覺案妻仍是不甘心。
三、社工評估
案主對案妻所提離婚條件，多主張難滿足案妻要求金額，未見案主在親權上特別要求。

需要包含下面這些內容：
主訴議題（簡短摘要）, 家庭狀況（條列式）, 子女狀況（條列式）, 訴訟（條列式）, '社工評估(AI生成)'

請根據逐字稿內容，進行必要的整合與重組，避免逐字複製，並以客觀、清晰、社工報告常用的第三人稱文風撰寫。  
若原文資訊不清楚，請合理推測但絕對要避免虛構。

以下是逐字稿：
${transcript}
  `.trim()

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [
          { role: 'system', content: '你是一位熟悉家事報告撰寫的社工人員助手' },
          { role: 'user', content: fullPrompt }
        ],
        temperature: 0.2
      },
      {
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    )

    const report = response.data.choices?.[0]?.message?.content?.trim()
    if (!report) throw new Error('OpenAI 回傳內容為空')
    sessionStore.setReportText(report)
  } catch (err) {
    console.error('生成報告失敗', err)
    sessionStore.setReportText('[生成失敗，請稍後再試]')
  } finally {
    sessionStore.setReportStage('done') // ⬅️ 3. 結束後標示為 done
  }
}

const download = () => {
  const text = sessionStore.transcriptText.trim()
  if (!text) {
    alert('沒有可下載的內容')
    return
  }

  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = 'transcript.txt'
  a.click()

  URL.revokeObjectURL(url)
}
</script>
