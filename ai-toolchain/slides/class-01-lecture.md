# C1 講稿 — Prompt 工程與 API 呼叫

> 對應 `class-01-content.md`；build 注入 `addNotes()`。每節【銜接】→【講解要點】→【demo】→【Q&A】。

---

## §1 這堂要解決什麼
【銜接】「C0 把 LLM 接上來了，但它『格式不穩定』——你要 JSON 它一半給 JSON 一半給廢話。今天把它鎖住。」
【講解要點】（4 分鐘）核心：prompt 從「手感咒語」升級成「合約」——明確輸入/輸出、可測試。驗收口：同一 prompt 連 10 次都吐合法同結構 JSON。
【demo 提示】—
【Q&A】問「為什麼格式不稳定？」→ 答：純 prompt 是「請求」不是「保證」；要用 JSON mode/schema。

## §2 三個角色
【銜接】「先理解 API 怎麼切『誰說的話』。」
【講解要點】（8 分鐘）system=员工手册（規則/格式/邊界）、user=今天的工單、assistant=前幾單紀錄。強調「格式約束放 system，每次變的放 user」。
【demo 提示】貼 orders 抽取的 system+user 例子；口頭：「放錯位置=多輪後行為漂移。」
【Q&A】問「多輪歷史要全丟嗎？」→ 答：不用，塞最近 N 輪+摘要省 token。

## §3 參數 temperature/max_tokens/top_p
【銜接】「三個最常調的旋钮。」
【講解要點】（8 分鐘）結構化 task 溫度壓 0（確定性>創意）；max_tokens 給足但別濫；top_p 一般不動。
【demo 提示】同一 prompt 溫度 0 vs 1.0 各跑 3 次對比，讓學員「看」隨機性差異。
【Q&A】問「創意寫作也用 0 嗎？」→ 答：不， brainstorm 要 0.7–1.0；抽取/結構要 0。

## §4 結構化輸出
【銜接】「本節是關鍵——把『輸出格式』升級成 API 的保證。」
【講解要點】（10 分鐘）三級：prompt+json.loads（弱）/JSON mode（中）/structured outputs+schema（強，本課目標）。強調「LLM 只負責填值，格式由 schema 兜底」。
【demo 提示】run JSON mode 抽取，示範 `json.loads` 成功；再示範「不加 mode 時偶爾夾帶文字」炸掉。
【Q&A】問「失敗了怎麼辦？」→ 答：套失敗重試（retries=2）；仍失敗就回明確錯誤。

## §5 心智模型 prompt=合約
【銜接】「用一張合約的視角統整。」
【講解要點】（5 分鐘）輸入端=system、輸出端=schema、每次變的=user；可測試=結構一致（C5 驗證）。
【demo 提示】—
【Q&A】問「跟 C5 什麼關係？」→ 答：C1 鎖單點、C5 測一群可回歸。

## §6 常見錯誤
【銜接】「6 個坑掃一遍。」
【講解要點】（4 分鐘）格式放錯位置/溫度太高/沒 schema/max_tokens 太小/一次做 5 件事/要解釋混進 JSON。
【demo 提示】—
【Q&A】問「一次讓 LLM 做多件事行嗎？」→ 答：能，但每件半吊子；拆多步（C4 會處理）。

## §7 本卡 Lab
【銜接】「作業：訂單→JSON 抽取器，連跑 10 次證明穩定。」
【講解要點】（4 分鐘）4 步；證據=10 次 JSON 貼文+你的 system prompt 檔。
【demo 提示】貼 lab-01.md。
【Q&A】問「10 次都要成功？」→ 答：是，這就是『結構一致』的驗收口。
