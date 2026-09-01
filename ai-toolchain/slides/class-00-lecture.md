# C0 講稿 — AI 工具選型與帳號準備

> 每節對應 `class-00-content.md` 的一個 section；build script 讀本檔注入 `addNotes()`。
> 每節含：【銜接】→【講解要點】→【demo 提示】→【Q&A 預設】。

---

## §1 這堂要解決什麼
【銜接】「各位好，這 7 禮拜我們要把『會用 LLM」做成『能交付生產級 AI 應用』。今天 C0 先講最多人翻車的第一課——選型。」
【講解要點】（3 分鐘）三個坑：選錯工具後期重做／key 管不好洩漏超標／沒估成本帳單嚇死人。
【demo 提示】切到 terminal，顯示 `ls ai-toolchain-lab/`，預告今天要把 smoke test 跑通。
【Q&A】問「為什麼不直接用開源模型？」→ 答：教學聚焦商業 API 的結構化輸出與工具生態；本地模型只在 C5/C6 延伸提。

## §2 選型三軸
【銜接】「選型不是『哪個最強』，是『哪個最合你的 workload』。」
【講解要點】（8 分鐘）帶 cost/latency/context 三軸，每軸舉一個真實 tradeoff（例：8K vs 128K 在 RAG 的差 16 倍）。強調「用真實數字裁，不憑感覺」。
【demo 提示】貼出主流 API 對照表（OpenAI/Claude/Azure）；口頭：「本課挑一個就夠，別一次接三家。」
【Q&A】問「哪家最便宜？」→ 答：便宜不保證對；要看你的 in/out token 比例與延遲要求。

## §3 帳號與 Key 管理
【銜接】「選完，第一件工程事＝把 key 管好。」
【講解要點】（6 分鐘）.env/.env.example/.gitignore 三件套；獨立 key＋預算上限；「key=信用卡+CVV 丟桌上」心智模型。
【demo 提示】live 建 `.env`＋`.env.example`＋`.gitignore`，`git status` 證明 .env 沒被追蹤。
【Q&A】問「key 能不能放 config 檔？」→ 答：可以但會被 git 吃，務必 gitignore；最穩是環境變量/secret manager。

## §4 Smoke test
【銜接】「這節是今天的核心交付——最小可跑的 call。」
【講解要點】（4 分鐘）講 messages/role/usage 三個關鍵；強調「抓 tokens 與 latency，後面成本估算要用」。
【demo 提示】run §4 程式，截輸出（含 tokens/latency）；示範 AuthenticationError 長什麼樣。
【Q&A】問「429 是什麼？」→ 答：速率限制，等 60s 重試；查額度。

## §5 成本估算法
【銜接】「跑通了，但要會算它會花多少錢。」
【講解要點】（5 分鐘）成本=token×量×價，「量」是最大變數；口頭走一遍例（5 万次→US$24/月）。
【demo 提示】拿真實 provider 價目算一次；強調「先估再選」。
【Q&A】問「怎麼控成本？」→ 答：熱路徑用小/快模型、RAG 調小切塊、設 budget cap。

## §6 常見選型錯誤
【銜接】「把 5 個坑一次講完，避開就行。」
【講解要點】（4 分鐘）快速過清單；強調「只看單價」最常見。
【demo 提示】—
【Q&A】問「什麼時候該接多家 API？」→ 答：合規/降級需求才接；純便宜理由不值得維護成本。

## §7 本卡 Lab
【銜接】「今天作業照 lab-00 做，明天截止前交。」
【講解要點】（4 分鐘）4 步：建專案/跑 smoke test/寫 3 行選型理由/抓證據。強調證據=smoke test 輸出＋理由。
【demo 提示】把 lab-00.md 貼在投影片，讓學員照做。
【Q&A】問「smoke test 要跑幾次？」→ 答：至少 3 次看 latency 穩定性；記 tokens。
