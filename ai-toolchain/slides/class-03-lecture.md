# C3 講稿 — Tool 呼叫

> 對應 `class-03-content.md`；build 注入 `addNotes()`。每節【銜接】→【講解要點】→【demo】→【Q&A】。

---

## §1 這堂要解決什麼
【銜接】「C2 讓 LLM 能『查資料』；C3 讓它能『做事』——算數、查 DB、發 API。但不能直接讓它『跑 Python』，那是危險的。」
【講解要點】（4 分鐘）function calling 四步：定義函数→LLM 吐指令 JSON→你的 code 執行→結果回吐。心智模型：Tool=LLM 的手，腦說「手該抓什麼」，手是你的程式。
【demo 提示】—
【Q&A】問「為什麼不能讓 LLM 直接執行？」→ 答：不可控+危險；執行權要留在你的程式。

## §2 function calling 原理
【銜接】「看一次完整往返長什麼樣。」
【講解要點】（6 分鐘）走 get_weather 例：你帶 tools 清單→LLM 吐 tool_calls JSON→你執行→role=tool 回吐→LLM 出最終答案。強調執行權在你。
【demo 提示】貼往返訊息序列，逐條講 role。
【Q&A】問「LLM 怎麼知道該用哪個工具？」→ 答：靠 function 的 description+parameters。

## §3 Schema 設計
【銜接】「本節是核心——schema 決定 Tool 好不好用。」
【講解要點】（10 分鐘）6 原則：description 寫給 LLM 看、param 精確、enum 收斂、標 required、一 function 一職責、別做萬能 function。
【demo 提示】貼 get_weather schema；口頭：「description 太短=LLM 選錯。」
【Q&A】問「為什麼 amount 不要用 string？」→ 答：LLM 會吐 "1,000"、"1000" 混；用 int+enum。

## §4 本地執行+結果回吐
【銜接】「看實際 code 怎麼接住 tool_calls。」
【講解要點】（8 分鐘）帶 run_loop：讀 msg.tool_calls→執行→append messages→回 role=tool；最多幾輪防死循環。
【demo 提示】live 跑一個 tool call 闭环；顯示 messages 累積。
【Q&A】問「role=tool 是幹嘛？」→ 答：把執行結果放回去給 LLM 看。

## §5 錯誤處理
【銜接】「跨系統協作，任何一端都可能錯。」
【講解要點】（6 分鐘）JSON 不合 schema→回給 LLM 修正（別 crash）；工具丟異常→回 error 讓它改路；死循環→max steps（C4）。
【demo 提示】故意讓 get_weather city="不存在的城市" 拋錯，看 LLM 收到 error 的反應。
【Q&A】問「工具出錯直接讓程式掛？」→ 答：不，catch 後結構化回傳讓 LLM 決策。

## §6 Tool vs JSON mode
【銜接】「和 C1 的界線一次講清。」
【講解要點】（4 分鐘）JSON mode=LLM 吐「資料」（不執行）；Tool=LLM 吐「指令」（你執行）。前者產出、後者動作。
【demo 提示】並排兩張表。
【Q&A】問「什麼時候用哪個？」→ 答：只要結構化結果用 JSON mode；要查 DB/發 API 用 Tool。

## §7 常見錯誤
【銜接】「6 個坑掃一遍。」
【講解要點】（4 分鐘）description 短/loose type/沒 max steps/異常沒回傳/把執行寫進 prompt/萬能 function。
【demo 提示】—
【Q&A】問「萬能 function 具體有什麼害？」→ 答：參數填錯率暴增；拆成單一職責。

## §8 本卡 Lab
【銜接】「作業：1–2 個 function＋一次錯誤處理。」
【講解要點】（6 分鐘）定義 function、闭环、故意讓工具失敗驗證不崩、證據=function-call JSON+執行 log。
【demo 提示】貼 lab-03.md。
【Q&A】問「要幾個工具？」→ 答：1–2 個足夠；重點在 schema 精確+錯誤回傳。
