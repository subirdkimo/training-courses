# AI 工具鏈訓練 — RAG＋Tool＋Agent 生產級應用

> 版本：v1.0　|　適用環境：Python 3.11+ / Node.js 20+　|　LLM：OpenAI GPT-4.1 / Anthropic Claude / 任何提供 structured-output 之商用 API
> 每堂課 **1 小時**（60 min；含 demo＋Lab 講解），共 **7 堂課**（觀念＋實作）。
> 起課 **2026-10-09**（週五），落週一/三/五。

---

## 課程目標

讓學員從 API 選型到生產上線，具備獨立交付「**RAG＋工具呼叫＋Agent**」三合一的生產級 AI 應用的完整能力：

1. **選型**：能依工作負載（成本/延遲/上下文/合規）挑出 1 套 LLM API/SDK＋向量庫＋框架。
2. **提示**：能寫出**結構化、可測試、可回歸**的 prompt（system/user/多輪＋JSON mode），不是「靠手感」。
3. **RAG**：能自己實作切塊→embedding→向量檢索→組裝 answer 的全鏈，並用 recall/faithfulness 雙指標自我評測。
4. **Tool**：能用 function calling / structured output 讓 LLM 穩定地吐 JSON 指令到本地執行（不是「regex 抓」）。
5. **Agent**：能寫 ReAct 迴路＋錯誤重試＋停止條件，做出**會思考**的多步代理（不是「chain 一串 function」）。
6. **評測**：能用 ≥20 案例回歸集＋分數/成本/latency 三軸，做**可重跑可比較**的 A/B 決策。
7. **上線**：能部署一個可被內部同事使用的完整應用（含 API、錯誤處理、日誌），交付一份「可讀」的操作手册。

**驗收基準**：課程結束後 30 天內，學員能獨立完成一個**新主題**（非課程案例）的同樣架構交付——選型、提示、RAG、Tool、Agent、評測、上線全鏈，並交報告。

---

## 課程總覽（7 堂課）

| 堂 | 主題 | 時長 | 類型 |
|----|------|------|------|
| 0 | AI 工具選型與帳號準備（含 API 經濟模型） | 1 hr | 觀念＋實作 |
| 1 | Prompt 工程與 API 呼叫（結構化輸出＋多輪＋JSON mode） | 1 hr | 觀念＋實作 |
| 2 | RAG 基礎（切塊/向量/檢索/組裝/評估召回） | 1 hr | 觀念＋實作 |
| 3 | Tool 呼叫（function calling + schema 設計 + 本地執行） | 1 hr | 實作 |
| 4 | Agent 與多步推理（ReAct + 錯誤重試 + 停止條件） | 1 hr | 觀念＋實作 |
| 5 | 評測與監控（回歸集 / 分數 / 成本 / latency 三軸） | 1 hr | 觀念＋實作 |
| 6 | 整合上線與結案（部署 + 交付 + 結案報告） | 1 hr | 實作＋彙總 |

> **總時長**：7 小時教學＋實作（含 Lab 演示）。
> 每堂課皆含 **Agenda、教學內容、講師投影片（.pptx 核可後產）、Lab 手冊、課後作業（該卡證據）**。
> **延伸**：Class 5 課末可選做「Agent 成本失控案例分析」（10 分鐘），時間彈性取捨。

---

## 版本與工具基線（2026 基準）

### LLM API（三選一即可，課程範例以 OpenAI 為主）
- **OpenAI**：`gpt-4.1-mini`（主力）／`gpt-4.1`（複雜推理）；structured outputs；tool calling。
- **Anthropic Claude**：`claude-sonnet-4-20250514`／`claude-haiku-4-20250414`；extended thinking；tool_use。
- **Any 相容 OpenAI SDK 的**（Azure OpenAI、Gemini-via-generativelayer、Ollama 本地）：只要 SDK 有 `response_format` / `tools` 參數。

> **原則**：**不用** 開源模型做本課程（教學聚焦「商業 API + 結構化輸出 + Tool 生態」，本地模型僅在延伸環節提）。

### 向量庫
- **Chroma**（`chromadb>=0.5`）：本課程主用（內嵌式、無 server、`.chroma` 本地目錄）。
- **PgVector**（`psycopg[binary] + pgvector>=0.2`）：Class 5 延伸（生產級，Postgres 生態）。
- **Milvus / Qdrant / Pinecone**：僅提，不實作（架構同）。

### Embedding
- **OpenAI `text-embedding-3-small`**（主力）：1536 維、便宜、跨語言尚可。
- **`text-embedding-3-large`**（Class 5 對比）：3072 維、貴 2 倍、召回略好。
- **BGE-m3（本地）**：延伸（多語、長文）。

### 框架（本課程刻意不用）
- **不** 用 LangChain / LlamaIndex 做核心實作——**先學原始件**（API→prompt→vector→tool→loop），再決定要不要框架。
- Framework 的價值在 Class 5 延伸提及（「何時該引框架」）。

### 語言與工具
- **Python 3.11+**（課程主語）；`openai>=1.30`、`chromadb>=0.5`、`pytest>=8`、`rich`（日誌美化）。
- **Node.js 20+ + TS**：僅 C6「上線 API 層」選修（FastAPI／Express 皆可）。
- **Git**：每卡一 commit，證據 commit message 必含卡號。

---

## 授課方式與實作環境

- **講師示範**：投影片講解原理 → **即時跑 code**（每卡 2–3 段可直接 copy 的 Python）。
- **學員 Lab**：每位學員在**本地電腦**建 `ai-toolchain-lab/` 專案（git 追蹤）。
- **Lab 前置**（C0 前須備妥）：
  - Python 3.11+ 與 `pip`
  - 至少 1 個**商用 LLM API access key**（OpenAI / Anthropic / Azure 任一）
  - 1 個**向量資料夾**（Chroma 預設 `.chroma/`）
  - git 帳號（可 push 到 GitHub 私有 repo 即可）
- **成本警戒線**：課程 7 堂合計 API 消耗，每學員應低於 **US$5 / 月**（Class 0 會給估算法）。

---

## 課程檔案清單

| 檔案 | 內容 |
|------|------|
| `00-course-overview.md` | 本檔（課程總覽） |
| `01-course-agenda.md` | 每卡 min-min 時程表（含 Lab 段） |
| `student_guide.md` | 學員操作手冊（里程碑表＋操作步驟＋證據標準） |
| `slides/class-NN-content.md` ×7 | 教學內容源（120–250 行/卡） |
| `slides/class-NN-lecture.md` ×7 | 逐頁講稿（每 section 一小節／demo 提示／Q&A） |
| `slides/build_class_NN.cjs` ×7 | pptxgenjs build 腳本（15–20 頁/卡，**核可後才產 .pptx**） |
| `labs/lab-NN.md` ×7 | 分步實習（前置→步驟→預期輸出→證據提交） |

---

## 先修能力

- 具備 Python 3 基礎（function、dict、list comprehension、`requests` 或類似 HTTP client）。
- 具備 git 基本操作（clone / add / commit / push）。
- 具備 HTTP / REST API 概念（GET/POST、JSON、status code）。
- **不需**具備 ML/DL 訓練經驗（本課程聚焦「API 使用者／整合者」，非「訓練者」）。
- **建議**：有過任一組 API 的 call 經驗（例如 Slack / GitHub / Stripe）。

---

## 評量方式

- **每卡 1 個可驗證交付**（证据）：
  - C0 選型備料 → smoke test log
  - C1 提示工程 → JSON mode 結構化輸出截圖 + prompt 檔
  - C2 RAG 基礎 → 檢索 top-3 + answer 截圖 + 資料集小集
  - C3 Tool 呼叫 → LLM 吐 function-call JSON + 本地執行 log
  - C4 Agent → 3+ 步 ReAct trace log（含錯誤重試）
  - C5 評測監控 → ≥20 案例回歸集 + 分數表（三軸）
  - C6 整合上線 → 完整應用 URL/README + 交付報告
- **總結**：C6 交付報告即結案（1 頁：架構圖、成本、latency、下一步）。
