# AI社工助手前端

## 專案簡介

本專案為「AI社工助手」的前端，支援逐字稿編輯、AI 報告初稿生成，以及 AI 自動抽取人物關係圖的可視化功能。前端採用 Vue 3 + Vite + TypeScript，並與後端 Flask/FastAPI 進行流式串接。

---

## 主要功能

- **逐字稿分頁**：上傳、編輯逐字稿，支援下載。
- **報告初稿分頁**：AI 生成家事報告初稿，支援流式顯示與下載。
- **人物關係圖分頁**：
  - 輸入逐字稿，AI 自動抽取人物與關係，回傳純 JSON 結構
  - 可編輯、複製、下載 JSON
  - 支援渲染（初期為 JSON 檢視，後續可接 Vis.js 畫圖）

---

## 人物關係圖分頁使用說明

1. 進入「人物關係圖」分頁，逐字稿會自動帶入（可手動修改）。
2. 點擊「生成人物關係 JSON」按鈕，前端會流式串接 `/PersonGraph` API，取得 AI 回傳的 JSON。
3. JSON 內容可直接編輯、複製、下載。
4. 點擊「渲染」可美化顯示 JSON（未來可接 Vis.js 互動圖）。
5. 下方有 JSON 檢視元件（PersonGraphViewer），可即時顯示內容。

---

## 串接後端 API 與 proxy 設定

### 預設開發環境
- 後端 API 預設為 `http://127.0.0.1:5050`
- 前端所有 `/PersonGraph`、`/run` 請求會自動 proxy 到後端

### 如何設定/切換 proxy

請編輯 `frontend/vite.config.ts`：

```ts
server: {
  proxy: {
    '/PersonGraph': 'http://127.0.0.1:5050',
    '/run': 'http://127.0.0.1:5050'
  }
}
```

- 若後端 API 部署在其他主機或 port，請修改 proxy 目標即可。
- 修改後需**重啟前端開發伺服器**（`npm run dev`）。

### fetch 寫法
- 請直接用 `/PersonGraph`、`/run` 這種相對路徑，無需寫完整 URL。
- 例如：
  ```js
  fetch('/PersonGraph', { ... })
  fetch('/run', { ... })
  ```

---

## 重要檔案與元件說明

### 頁面與全域入口

- **`src/App.vue`**  
  全域入口元件，負責組合 NavBar、Footer、Toast、主內容（RouterView）。所有頁面都會被包在這個 layout 下。

- **`src/main.ts`**  
  前端啟動入口，註冊 Pinia 狀態管理、PrimeVue UI、Toast/Confirm 服務、全域樣式與主題，並掛載 App。

- **`src/views/HomeView.vue`**  
  主頁面，組合 DashboardPanel 與各分頁 slot，負責主要的 UI 佈局與分頁切換。

### 路由與狀態管理

- **`src/router/index.ts`**  
  Vue Router 設定，目前只註冊 HomeView（`/`、`/home`），可擴充多頁面。

- **`src/stores/useSessionStore.ts`**  
  Pinia 狀態管理，集中管理逐字稿、報告、tab 狀態、上傳檔案等。支援本地持久化（localStorage），並提供多個 actions/getters 方便元件間資料同步。

### 主要功能元件

- **`src/components/TypescriptEditor/TypescriptEditor.vue`**  
  逐字稿編輯器，支援逐字稿上傳、編輯、下載，並可觸發 AI 報告生成。流式串接 `/run` API，內容累加顯示。

- **`src/components/ReportSession/ReportEditor.vue`**  
  報告初稿顯示元件，顯示 AI 產生的報告內容，支援下載。內容由 TypescriptEditor 觸發生成。

- **`src/components/PersonGraph/PersonGraphEditor.vue`**  
  人物關係圖主元件，負責逐字稿→呼叫 `/PersonGraph` API→流式取得 JSON→可編輯、複製、下載、渲染。內容累加顯示，與 TypescriptEditor 寫法一致。

- **`src/components/PersonGraph/PersonGraphViewer.vue`**  
  人物關係圖 JSON 檢視元件，接收 JSON props，格式化美化顯示。未來可擴充 Vis.js 互動圖。

### 其他共用元件

- **`src/components/Dashboard/DashboardPanel.vue`**  
  分頁（Tab）切換元件，slot 方式插入各分頁內容。負責 activeTabIndex 狀態同步。

- **`src/components/NavBar/NavBar.vue`**  
  全域導覽列，顯示專案標題、導航等。

- **`src/components/Footer/AppFooter.vue`**  
  全域頁腳。

- **`src/components/Banner/BannerUpload.vue`**  
  上傳區塊，支援音檔/逐字稿上傳。

- **`src/components/Player/PlayerPanel.vue`**  
  音檔播放元件，支援逐字稿對應音檔播放。

- **`src/components/ModeLayout.vue` / `BasicLayout.vue`**  
  佈局元件，支援不同 UI 風格。

- **`src/components/CustodyMultiSelect.vue`**  
  多選下拉元件，常用於親權選擇。

### 其他

- **`vite.config.ts`**  
  Vite 設定檔，包含 proxy 設定（/PersonGraph, /run 代理到後端）、路徑 alias、Markdown 支援等。

---

## 開發啟動

1. 安裝依賴：
   ```bash
   npm install
   ```
2. 啟動前端開發伺服器：
   ```bash
   npm run dev
   ```
3. 確認後端（Flask/FastAPI）已啟動於 proxy 設定的 port
4. 開啟瀏覽器進入 `http://localhost:5173`（或 Vite 給的網址）

---

## 常見問題

- **人物關係圖分頁沒反應？**
  - 請確認後端 `/PersonGraph` API 有啟動，且 proxy 設定正確
  - 若用 Ollama，請確認模型已啟動且有 GPU 支援
- **CORS 問題？**
  - 請務必用 proxy，或後端開啟 CORS 支援
- **流式內容顯示異常？**
  - 請確認前端 fetch 寫法與 TypescriptEditor/ReportEditor 一致，內容需累加

---

## 進階擴充建議

- 人物關係圖渲染可接 Vis.js，支援互動、點擊節點顯示資訊
- JSON 編輯區可加自動校驗、格式化
- 支援多語言、主題切換
- 與後端 API 版本自動偵測

---

如有任何問題，請參考原始碼註解或聯絡開發者。
