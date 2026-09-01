# AI 工具鏈訓練 — 學員操作手冊

> 課程：RAG＋Tool＋Agent 生產級應用｜7 卡（C0–C6）｜起課 2026-10-09
> 每卡交付一組**關鍵詞＋日期＋證據**。本手冊＝你從開課到結案要做的每一步。

---

## 開課前必備（C0 前就緒）

- [ ] Python 3.11+（`python3 --version`）
- [ ] 至少 1 個**商用 LLM API** access key（OpenAI / Anthropic / Azure 任一）
- [ ] git 帳號（能 push 一個私有 repo）
- [ ] 本地 `ai-toolchain-lab/` 專案＋`.env`（放 key，**禁**進 git）

> 成本警戒線：整門 7 卡，每學員 API 消耗目標 **< US$5/月**（C0 給估算法）。

---

## 里程碑卡表

| id | 里程碑 | 本場重點 | 上課日 | 截止（+2 天） | 需附 |
|---|---|---|---|---|---|
| C0 | 選型備料 | 選 LLM API/SDK＋key＋smoke test | 10-09 | 10-11 | 證據 |
| C1 | 提示工程 | system/user/多輪＋JSON mode | 10-13 | 10-15 | 日期＋證據 |
| C2 | 檢索增強 | 切塊→embedding→向量庫→檢索 | 10-15 | 10-17 | 日期＋證據 |
| C3 | 工具調用 | function calling＋本地執行 | 10-20 | 10-22 | 日期＋證據 |
| C4 | 自主代理 | ReAct 迴路＋錯誤重試＋停止 | 10-22 | 10-24 | 日期＋證據 |
| C5 | 評測監控 | ≥20 案例回歸集＋三軸分數 | 10-27 | 10-29 | 日期＋證據 |
| C6 | 整合上線 | RAG+Tool+Agent 整合＋部署＋報告 | 10-29 | 10-31 | 日期＋證據 |

> **卡名刻意互不重複**（選型/提示/檢索/工具/代理/評測/整合），回覆時帶卡號最穩（例「C2 完成」）。

---

## 課程資料（GitHub 下載）

投影片（.pptx 直接下載，滑鼠右鍵另存）：

| 卡 | 投影片 |
|---|---|
| C0 | [class-00-ai-tool-selection](https://raw.githubusercontent.com/subirdkimo/training-courses/main/ai-toolchain/slides/class-00-ai-tool-selection.pptx) |
| C1 | [class-01-prompt-engineering](https://raw.githubusercontent.com/subirdkimo/training-courses/main/ai-toolchain/slides/class-01-prompt-engineering.pptx) |
| C2 | [class-02-rag-basics](https://raw.githubusercontent.com/subirdkimo/training-courses/main/ai-toolchain/slides/class-02-rag-basics.pptx) |
| C3 | [class-03-tool-calling](https://raw.githubusercontent.com/subirdkimo/training-courses/main/ai-toolchain/slides/class-03-tool-calling.pptx) |
| C4 | [class-04-agent-react](https://raw.githubusercontent.com/subirdkimo/training-courses/main/ai-toolchain/slides/class-04-agent-react.pptx) |
| C5 | [class-05-evaluation](https://raw.githubusercontent.com/subirdkimo/training-courses/main/ai-toolchain/slides/class-05-evaluation.pptx) |
| C6 | [class-06-integration-deploy](https://raw.githubusercontent.com/subirdkimo/training-courses/main/ai-toolchain/slides/class-06-integration-deploy.pptx) |

Lab 手冊＋講義＋課程總覽／行程：[training-courses/ai-toolchain](https://github.com/subirdkimo/training-courses/tree/main/ai-toolchain)

> 所有資料以 GitHub 為唯一真源，連結永久有效；投影片＝raw 直接下載、md 文件＝blob 瀏覽器排版。

---

## 每卡標準動作（同一節奏）

1. **上課**：週一/三/五 17:30（DAP 邀請內有投影片＋Lab 連結）。
2. **做 Lab**：照 `labs/lab-NN.md` 分步做，本地跑通。
3. **抓證據**：screenshot／log／repo 連結／附件**任一**（越具體越好）。
4. **回信**：回覆該卡**首封信**，格式：
   > `C<卡號> 完成，<YYYY-MM-DD>。證據：<screenshot/連結/附件任一>`
5. **截止**：上課日 +2 天（超時會被跟催；跟催日＝週一/三/五 ≥10:00）。

---

## 回覆格式（對照）

**正確**（關鍵詞＋日期＋證據齊）：
> C2 完成，2026-10-15。證據：檢索 top3 截圖見附件 rag_top3.png；answer 連結 https://...

**缺項**（會被退回補）：
> 做完了。（缺卡號／日期／證據）

**進度異常**（卡住/延誤/無法做）：直接說，例
> C4 卡住：agent 死循環，token 跑超過預算。想約 10 分鐘問一下。
（ai_assist 會**立即升審**，不等跟催週期。）

---

## 證據標準（每卡驗收口）

| 卡 | 最少證據 |
|---|---|
| C0 | smoke test log（model / tokens / latency 任一）＋選型理由 3 行 |
| C1 | JSON 結構化輸出截圖＋你的 prompt 檔貼文 |
| C2 | 檢索 top-3＋answer 截圖＋資料集 ≥10 段 |
| C3 | LLM 吐 function-call JSON＋本地執行 log |
| C4 | 3+ 步 ReAct trace（含 1 次錯誤重試） |
| C5 | ≥20 案例回歸集＋三軸分數表 |
| C6 | 完整應用（URL/README）＋1 頁交付報告 |

---

## 聯絡

- 問題／補交／改期：回信 `ai_assist@dimension.com.tw`（或回覆該卡首封）。
- 結案：全卡 `done` 後 ai_assist 寄**結案彙總信**（里程碑表＋每卡證據清單）。
