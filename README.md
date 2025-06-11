# HSSAI 社工助手前端系統

## 📋 專案簡介

**HSSAI 社工助手前端系統** 是一個基於 Vue 3 + TypeScript 的現代化 Web 應用程式，專為社工專業人員設計，提供智能化的訪談記錄處理和報告生成服務。系統整合了多項 AI 技術，包括語音轉文字、自動報告生成，以及智能人物關係圖分析等功能。

### 🎯 核心價值

- **提升工作效率**：自動化處理訪談記錄，減少文書作業時間
- **增強服務品質**：AI 輔助分析，提供更全面的案件洞察
- **標準化流程**：統一的報告格式和處理流程
- **易於使用**：直觀的用戶界面，降低學習成本

---

## ✨ 主要功能模組

### 1. 📝 逐字稿管理系統
- **音檔上傳與播放**：支援多種音檔格式，內建音檔播放器
- **智能轉錄**：整合語音轉文字 API，自動生成逐字稿
- **逐字稿編輯**：所見即所得編輯器，支援即時編輯和格式化
- **文件匯入匯出**：支援 TXT 檔案匯入，可匯出為多種格式
- **版本控制**：自動儲存編輯歷程

### 2. 📊 AI 報告生成系統
- **智能分析**：基於逐字稿內容，AI 自動分析關鍵資訊
- **報告模板**：支援多種社工報告模板，可客製化設定
- **流式生成**：即時顯示 AI 生成過程，提升用戶體驗
- **格式化輸出**：支援 PDF、Word 等多種格式匯出
- **內容編輯**：生成後可進行人工修改和調整

### 3. 🕸️ 人物關係圖系統
- **智能抽取**：AI 自動分析逐字稿中的人物關係
- **視覺化呈現**：使用 Vis.js 繪製互動式關係圖
- **關係編輯**：支援手動調整人物關係和屬性
- **JSON 格式**：標準化的資料結構，便於後續處理
- **圖表匯出**：支援匯出為圖片或 JSON 檔案

### 4. 🎛️ 工作台管理
- **分頁式介面**：清晰的功能分區，提升操作效率
- **狀態管理**：統一的會話狀態管理，支援斷點續傳
- **自動儲存**：定期自動儲存工作進度
- **批次處理**：支援多檔案批次處理功能

---

## 🏗️ 技術架構

### 前端技術棧

| 技術 | 版本 | 用途 |
|------|------|------|
| **Vue.js** | 3.4.21 | 核心框架，提供響應式 UI |
| **TypeScript** | 5.4.0 | 類型安全，提升代碼品質 |
| **Vite** | 6.3.5 | 構建工具，快速開發體驗 |
| **Vue Router** | 4.3.0 | 單頁應用路由管理 |
| **Pinia** | 2.1.7 | 狀態管理，支援持久化 |
| **PrimeVue** | 3.53.1 | UI 組件庫，企業級體驗 |
| **Tailwind CSS** | 3.4.3 | 原子化 CSS 框架 |

### 核心依賴

| 套件 | 版本 | 功能說明 |
|------|------|----------|
| **Vis Network** | 9.1.10 | 關係圖視覺化 |
| **Axios** | 1.7.2 | HTTP 客戶端，API 通信 |
| **WaveSurfer.js** | 7.9.5 | 音檔波形顯示與播放 |
| **PDFMake** | 0.2.10 | PDF 文件生成 |
| **Chart.js** | 4.4.8 | 圖表繪製 |
| **D3.js** | 7.9.0 | 數據視覺化 |
| **RecordRTC** | 5.6.2 | 瀏覽器錄音功能 |
| **OpenCC** | 1.0.5 | 繁簡中文轉換 |

### 開發工具

| 工具 | 版本 | 用途 |
|------|------|------|
| **ESLint** | 8.57.0 | 代碼檢查，維護代碼品質 |
| **Prettier** | 3.2.5 | 代碼格式化 |
| **Vue TSC** | 2.0.11 | TypeScript 類型檢查 |
| **Autoprefixer** | 10.4.19 | CSS 前綴自動添加 |

---

## 📁 專案結構

```
frontend/
├── 📂 public/                    # 靜態資源
├── 📂 src/
│   ├── 📂 api/                   # API 接口層
│   │   └── axiosClient.ts        # Axios 配置
│   ├── 📂 assets/                # 靜態資源 (圖片、字體等)
│   ├── 📂 components/            # Vue 組件
│   │   ├── 📂 Banner/            # 上傳橫幅組件
│   │   ├── 📂 Dashboard/         # 儀表板組件
│   │   ├── 📂 Footer/            # 頁腳組件
│   │   ├── 📂 NavBar/            # 導航欄組件
│   │   ├── 📂 PersonGraph/       # 人物關係圖組件
│   │   │   ├── PersonGraphEditor.vue    # 關係圖編輯器
│   │   │   ├── PersonGraphChat.vue      # 關係圖對話介面
│   │   │   ├── PersonGraphViewer.vue    # 關係圖檢視器
│   │   │   └── 📂 vis-network/          # Vis.js 相關組件
│   │   ├── 📂 Player/            # 音檔播放器組件
│   │   ├── 📂 ReportSession/     # 報告會話組件
│   │   │   └── ReportEditor.vue  # 報告編輯器
│   │   ├── 📂 TypescriptEditor/  # 逐字稿編輯器組件
│   │   │   └── TypescriptEditor.vue
│   │   ├── BasicLayout.vue       # 基礎佈局組件
│   │   ├── ModeLayout.vue        # 模式佈局組件
│   │   └── CustodyMultiSelect.vue # 多選下拉組件
│   ├── 📂 primevue-presets/      # PrimeVue 主題預設
│   ├── 📂 router/                # 路由配置
│   │   └── index.ts
│   ├── 📂 stores/                # Pinia 狀態管理
│   │   └── useSessionStore.ts    # 會話狀態管理
│   ├── 📂 utils/                 # 工具函數
│   │   ├── pdfMake.ts           # PDF 生成工具
│   │   ├── sessionManager.ts    # 會話管理工具
│   │   └── stageMessages.ts     # 階段提示訊息
│   ├── 📂 views/                # 頁面組件
│   │   └── HomeView.vue         # 主頁面
│   ├── App.vue                  # 根組件
│   ├── main.ts                  # 應用程式入口
│   ├── style.css                # 全域樣式
│   └── shims-vue.d.ts           # Vue TypeScript 聲明
├── 📄 package.json              # 專案配置與依賴
├── 📄 vite.config.ts            # Vite 構建配置
├── 📄 tailwind.config.js        # Tailwind CSS 配置
├── 📄 tsconfig.json             # TypeScript 配置
├── 📄 .eslintrc.cjs             # ESLint 配置
├── 📄 .prettierrc.json          # Prettier 配置
└── 📄 README.md                 # 專案說明文件
```

---

## 🚀 快速開始

### 環境需求

- **Node.js**: >= 18.0.0
- **npm**: >= 8.0.0 或 **yarn**: >= 1.22.0
- **瀏覽器**: Chrome 90+, Firefox 88+, Safari 14+

### 安裝與啟動

1. **克隆專案**
   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. **安裝依賴**
   ```bash
   npm install
   # 或
   yarn install
   ```

3. **啟動開發伺服器**
   ```bash
   npm run dev
   # 或
   yarn dev
   ```

4. **開啟瀏覽器**
   - 開發環境預設運行於 `http://localhost:5173`
   - 系統會自動開啟瀏覽器

### 開發指令

| 指令 | 功能 |
|------|------|
| `npm run dev` | 啟動開發伺服器 |
| `npm run build` | 構建生產版本 |
| `npm run preview` | 預覽生產版本 |
| `npm run type-check` | TypeScript 類型檢查 |
| `npm run lint` | ESLint 代碼檢查 |
| `npm run format` | Prettier 代碼格式化 |

---

## 🔧 配置說明

### API 配置

系統使用兩套 API 配置方式：

#### 1. Vite Proxy 配置 (開發環境)
```typescript
// vite.config.ts
server: {
  proxy: {
    '/api': 'http://127.0.0.1:5353'
  }
}
```

#### 2. Axios 客戶端配置 (生產環境)
```typescript
// src/api/axiosClient.ts
const apiClient = axios.create({
  baseURL: 'https://hssai-custodiAI.phys.nthu.edu.tw/api',
  headers: {
    'Content-Type': 'application/json'
  }
})
```

### 環境變數配置

創建 `.env.local` 檔案設定環境變數：

```bash
# API 基礎 URL
VITE_API_BASE_URL=https://your-api-domain.com/api

# 開發模式標記
VITE_DEV_MODE=true

# 啟用除錯模式
VITE_DEBUG=true
```

### 主題配置

系統支援深色/淺色主題切換，配置位於：
- `src/primevue-presets/lara/` - PrimeVue 主題預設
- `tailwind.config.js` - Tailwind CSS 色彩配置

---

## 🌐 後端整合

### API 端點

| 端點 | 方法 | 功能 | 參數 |
|------|------|------|------|
| `/api/transcript` | POST | 語音轉文字 | `{ audioFile: File }` |
| `/api/generate-report` | POST | 生成報告 | `{ transcript: string, template: string }` |
| `/api/person-graph` | POST | 生成人物關係圖 | `{ transcript: string }` |
| `/api/save-session` | POST | 儲存會話 | `{ sessionData: object }` |

### 流式資料處理

系統支援 Server-Sent Events (SSE) 進行即時資料串流：

```typescript
// 流式 API 呼叫範例
const response = await fetch('/api/generate-report', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ transcript, template })
})

const reader = response.body?.getReader()
const decoder = new TextDecoder()

while (true) {
  const { done, value } = await reader.read()
  if (done) break
  
  const chunk = decoder.decode(value)
  // 處理接收到的資料塊
  processStreamChunk(chunk)
}
```

### 後端專案

後端 API 請參考：[basic-backend-design-for-auto-generating-social-work-visit-reports-using-Docker](https://github.com/iamleoluo/basic-backend-design-for-auto-generating-social-work-visit-reports-using-Docker.git)

---

## 🎨 使用者介面

### 設計系統

- **色彩方案**: 基於 Material Design 3.0 規範
- **字體**: Inter 字體系列，支援多語言
- **圖標**: PrimeIcons 圖標庫
- **響應式**: 支援桌面、平板、手機多端適配

### 組件庫

系統基於 PrimeVue 構建，提供豐富的 UI 組件：
- **表單組件**: 輸入框、選擇器、上傳器等
- **數據展示**: 表格、圖表、樹狀結構等
- **導航組件**: 選單、標籤頁、麵包屑等
- **反饋組件**: 對話框、通知、載入指示器等

### 主題客製化

```typescript
// 自定義主題色彩
const customTheme = {
  primary: '#4F46E5',      // 主要色彩
  secondary: '#1C1D8F',    // 次要色彩
  success: '#10B981',      // 成功色彩
  warning: '#F59E0B',      // 警告色彩
  danger: '#EF4444',       // 危險色彩
}
```

---

## 📱 功能詳細說明

### 逐字稿編輯系統

**檔案支援格式**:
- 音檔: MP3, WAV, M4A, OGG
- 文字檔: TXT, DOCX, PDF

**核心功能**:
- 拖拽上傳檔案
- 自動語音轉文字
- 即時編輯與預覽
- 自動儲存與回復
- 匯出多種格式

**技術實現**:
```typescript
// 自動儲存功能
const autoSave = debounce(() => {
  sessionStore.setTranscriptText(transcriptText.value)
}, 1000)

watch(transcriptText, autoSave)
```

### AI 報告生成系統

**報告模板類型**:
- 家事調解報告
- 兒童保護評估
- 老人照護評估
- 身心障礙者服務評估

**生成流程**:
1. 分析逐字稿內容
2. 抽取關鍵資訊
3. 匹配報告模板
4. 流式生成內容
5. 格式化輸出

### 人物關係圖系統

**資料結構**:
```json
{
  "nodes": [
    {
      "id": "person1",
      "label": "張三",
      "type": "individual",
      "attributes": {
        "age": 45,
        "gender": "male",
        "role": "父親"
      }
    }
  ],
  "edges": [
    {
      "from": "person1",
      "to": "person2",
      "label": "父子關係",
      "relationship": "family"
    }
  ]
}
```

**視覺化選項**:
- 節點樣式客製化
- 關係線條樣式
- 佈局演算法選擇
- 互動式操作

---

## 🔒 安全性考量

### 資料保護
- **本地儲存**: 敏感資料僅儲存於本地 localStorage
- **傳輸加密**: 所有 API 通信使用 HTTPS
- **檔案上傳**: 檔案格式與大小限制
- **XSS 防護**: 輸入內容過濾與轉義

### 隱私保護
- **資料匿名化**: 自動移除個人識別資訊
- **會話管理**: 定期清理過期會話
- **存取控制**: 基於角色的權限管理

---

## 🚀 部署指南

### 開發環境部署

```bash
# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev
```

### 生產環境部署

#### 1. 構建應用程式
```bash
# 構建生產版本
npm run build

# 構建產物位於 dist/ 目錄
ls dist/
```

#### 2. 使用 Nginx 部署
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    root /path/to/frontend/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://backend-server:5353;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

#### 3. 使用 Docker 部署
```dockerfile
# Dockerfile
FROM node:18-alpine as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM nginx:alpine as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 環境配置檢查清單

- [ ] API 端點配置正確
- [ ] 環境變數設定完成
- [ ] SSL 憑證安裝 (生產環境)
- [ ] 防火牆規則配置
- [ ] 監控與日誌配置

---

## 🧪 測試

### 測試策略
- **單元測試**: 使用 Vitest 進行組件單元測試
- **整合測試**: API 整合測試
- **端對端測試**: 使用 Cypress 進行 E2E 測試
- **效能測試**: 使用 Lighthouse 進行效能評估

### 運行測試
```bash
# 單元測試
npm run test:unit

# 端對端測試
npm run test:e2e

# 測試覆蓋率
npm run test:coverage
```

---

## 🛠️ 開發指南

### 代碼規範

**命名規範**:
- 檔案名稱: PascalCase (組件) / camelCase (工具函數)
- 變數名稱: camelCase
- 常數名稱: UPPER_SNAKE_CASE
- CSS 類別: kebab-case

**組件開發**:
```vue
<template>
  <!-- 模板內容 -->
</template>

<script setup lang="ts">
// 使用 Composition API
import { ref, computed, onMounted } from 'vue'

// 介面定義
interface Props {
  title: string
  data: any[]
}

// Props 定義
const props = defineProps<Props>()

// 響應式資料
const loading = ref(false)

// 計算屬性
const processedData = computed(() => {
  return props.data.filter(item => item.active)
})
</script>

<style scoped>
/* 組件樣式 */
</style>
```

### Git 工作流程

**分支策略**:
- `main`: 主分支，穩定版本
- `develop`: 開發分支
- `feature/*`: 功能分支
- `hotfix/*`: 緊急修復分支

**提交訊息格式**:
```
type(scope): description

feat(auth): add user login functionality
fix(api): resolve data fetching issue
docs(readme): update installation guide
```

### 效能優化

**程式碼分割**:
```typescript
// 路由層級程式碼分割
const HomeView = () => import('@/views/HomeView.vue')
```

**圖片優化**:
- 使用 WebP 格式
- 實作 lazy loading
- 適當的圖片尺寸

**Bundle 優化**:
- Tree shaking
- 依賴分析
- 壓縮優化

---

## 📊 監控與維護

### 效能監控
- **Core Web Vitals**: LCP, FID, CLS 指標監控
- **Bundle Size**: 構建產物大小追蹤
- **API Response Time**: API 回應時間監控

### 錯誤追蹤
- **前端錯誤**: 使用 Sentry 進行錯誤收集
- **使用者行為**: 使用者操作行為分析
- **效能分析**: 頁面載入效能分析

### 維護計畫
- **定期更新**: 依賴套件安全更新
- **效能優化**: 定期效能評估與優化
- **功能擴充**: 根據使用者回饋新增功能

---

## 🤝 貢獻指南

### 開發環境設定
1. Fork 專案到個人帳號
2. 克隆 Fork 的專案
3. 安裝依賴並啟動開發環境
4. 創建功能分支進行開發

### 提交程式碼
1. 確保程式碼符合規範 (`npm run lint`)
2. 執行測試確保無錯誤 (`npm run test`)
3. 提交 Pull Request
4. 等待程式碼審查

### 問題回報
請使用 GitHub Issues 回報問題，包含：
- 詳細的問題描述
- 重現步驟
- 環境資訊
- 相關截圖或錯誤訊息

---

## 📋 更新日誌

### v1.0.0 (2024-01-15)
- ✨ 初始版本發布
- 🎯 完整的逐字稿編輯功能
- 🤖 AI 報告生成系統
- 🕸️ 人物關係圖視覺化

### v1.1.0 (2024-02-01)
- 🚀 效能優化
- 🎨 UI/UX 改進
- 🐛 錯誤修復
- 📱 響應式設計優化

---

## 📞 技術支援

### 聯絡方式
- **專案維護者**: [GitHub Profile]
- **問題回報**: [GitHub Issues]
- **技術討論**: [GitHub Discussions]

### 常見問題

**Q: 為什麼音檔上傳失敗？**
A: 請檢查檔案格式是否支援，檔案大小是否超過限制。

**Q: AI 生成報告很慢？**
A: 這是正常現象，AI 處理需要時間，請耐心等待。

**Q: 關係圖無法顯示？**
A: 請確認瀏覽器支援 WebGL，或嘗試重新整理頁面。

---

## 📄 授權條款

本專案採用 MIT 授權條款，詳見 [LICENSE](LICENSE) 檔案。

---

## �� 致謝

感謝所有為本專案做出貢獻的開發者和使用者。特別感謝：

- Vue.js 社群提供優秀的開發工具
- PrimeVue 團隊提供美觀的 UI 組件
- 所有開源專案的貢獻者

---

**版本**: v1.1.0  
**最後更新**: 2024-02-01  
**維護狀態**: 🟢 積極維護中
