# C3 — Tool 呼叫（function calling + schema 設計 + 本地執行）

> 時長：1 hr　|　投影片：`class-03-...pptx`（核可後產）　|　Lab：`lab-03.md`
> 交付：讓 LLM **穩定吐出合法 function-call JSON**，本地執行後把結果回吐，完成「LLM 做事」的閉環。

---

## 1. 這堂要解決什麼

C2 讓 LLM 能「**查資料**」；C3 讓它能「**做事**」——呼叫外部能力（算數、查 DB、發 API、跑計算）。

問題：你**不能**直接讓 LLM「執行 Python」，那是危險且不可靠的。
正確做法＝**function calling**（也叫 tool calling）：
1. 你**定義**一組函数（名/參數/schema）。
2. LLM **判斷要不要用、用哪個、參數填什麼** → 吐一個 JSON。
3. **你的 code** 執行該函数 → 把結果**回吐**給 LLM。
4. LLM 基於結果**決定下一步**或給最終答案。

> **心智模型**：Tool＝**LLM 的手**。LLM 的「腦」（理解/決策）本身不會動手指，但能**說出手該抓什麼**（function call JSON）；真正出力的是**你的程式**（手）。
> 純 prompt/JSON mode（C1）＝腦子自己算；Tool（C3）＝腦子**指派**手去做——**可靠度與能力都上了一個台階**。

**驗收口**：一個 function call 闭环（LLM 吐 JSON→你執行→結果回吐→LLM 用結果回答）。

---

## 2. function calling 的原理

```
你 -> LLM:  問題 + 可用 tools 清單（name/description/parameters schema）
LLM -> 你:  { "tool_calls": [ {"name":"get_weather","arguments":{"city":"Tokyo"}} ] }
你:         執行 get_weather("Tokyo") -> 21°C
你 -> LLM:  把結果放進 tool result（role=tool）
LLM -> 你:  最終自然語言答案「東京現在 21 度」
```

**關鍵**：LLM **不執行**、只「**吐指令**」；執行權一律在你手上——這是 Tool 能上生產的**安全前提**。

---

## 3. Schema 設計（決定 Tool 能不能用好的核心）

每個 function 要給 `name / description / parameters`（parameters 用 **JSON Schema**）：

```python
tools = [{
  "type": "function",
  "function": {
    "name": "get_weather",
    "description": "取得指定城市目前天氣。城市用英文。",   # 這句對 LLM 選工具非常重要
    "parameters": {
      "type": "object",
      "properties": {
        "city": {"type": "string", "description": "城市名，e.g. Tokyo"}
      },
      "required": ["city"]
    }
  }
}]
```

### schema 設計原則（新手最常翻車的地方）

| 原則 | 說明 | 反例（會導致 LLM 填錯） |
|------|------|------------------------|
| **description 寫給 LLM 看** | 講清「何時用、參數語義」 | 只寫 `name:"g"` |
| **param 要精確** | type 明確（int 別用 string） | `amount: string` 讓 LLM 吐 `"1,000"` |
| **enum 收斂選擇** | 有限選項用 enum | `unit: string` 讓它吐 "kg"/"KG"/"kilogram" |
| **required 標清必填** | 別讓 LLM 漏必填欄 | 漏 required → 空值 |
| **一個 function 一個職責** | 別做萬能 function | `do_thing(action, x, y, z)` |

> **心智模型**：function 的 schema＝**給 LLM 看的 API 合約**。
> 你和 LLM 之間的「介面」就是這份 schema——**寫清楚，LLM 就會填對；寫含糊，它就猜（而且常猜錯）**。

---

## 4. 本地執行 + 結果回吐

```python
def get_weather(city):  # 你的真正邏輯（可能查 API/DB）
    return {"city": city, "temp_c": 21}

def run_loop(client, user_text, tools, tool_fn):
    messages = [{"role":"user","content":user_text}]
    for _ in range(3):  # 最多 3 輪（防死循环；C4 會正式處理）
        r = client.chat.completions.create(model="gpt-4.1-mini", messages=messages, tools=tools)
        msg = r.choices[0].message
        if msg.tool_calls:
            for tc in msg.tool_calls:
                fn = tool_fn[tc.function.name]
                args = json.loads(tc.function.arguments)
                result = fn(**args)                      # 你的 code 執行
                messages.append(msg.model_dump())        # LLM 的 tool_call 訊息
                messages.append({"role":"tool","tool_call_id":tc.id,
                                 "content":json.dumps(result)})
        else:
            return msg.content          # 最終答案
    return "（超步數，停止）"
```

> **心智模型**：`tool_calls`＝LLM 舉手說「我要用 X 工具、參數是…」；`role=tool`＝你**把執行結果放回去**。兩邊一問一答，才是 Tool 闭环。
> **執行權在你能否上生產的線**——LLM 永遠在「說」，你的程式在「做」。

---

## 5. 錯誤處理（生產必備）

| 錯誤場景 | 對策 |
|----------|------|
| LLM 吐的 JSON 參數不合 schema | `json.loads`/驗 schema 失敗 → 回給 LLM「參數錯誤：…」讓它修正（別直接 crash） |
| 工具執行丟異常（DB 斷/超時） | catch → 回「{error: ...}」讓 LLM 知道失敗、改走別路/報告 |
| LLM 重複呼叫同一工具（死循環） | 設**最大步數**＋**成本閘門**（C4 正式處理） |
| 參數值不合法（城市不存在） | 回明確錯誤訊息，讓 LLM 換參數或告知使用者 |

> **心智模型**：Tool 呼叫是「**跨系統協作**」，任何一端都可能失敗——
> 要像寫**分散式 system** 一樣處理：**假設對方會錯**，把錯誤**結構化回傳**給 LLM，讓它決策，而非讓程式直接掛。

---

## 6. Tool vs JSON mode（C1）的分界

| | JSON mode / structured output（C1） | function calling（C3） |
|---|---|---|
| LLM 做什麼 | 吐**資料**（結構化結果） | 吐**指令**（要執行什麼） |
| 是否執行 | **不執行**（你解析結果） | **你的 code 執行**後回吐 |
| 典型用途 | 抽取/分類/格式化 | 查 DB/發 API/算数/跑流程 |
| 關鍵 | schema 定義**輸出長什麼樣** | schema 定義**能做什麼、參數是啥** |

> **心智模型**：JSON mode 是「**產出**」；Tool 是「**動作**」。
> 前者 LLM 交作業後你就用；後者 LLM 下指令、你執行、再回報——**Tool 是「會動手」的升級版**。

---

## 7. 常見 Tool 錯誤

1. **description 太短/含糊** → LLM 選錯工具或選不到（description 是給 LLM 的說明）。
2. **param 用 loose type**（string 裝 int/enum）→ LLM 吐 `"1,000"`/大小寫亂（用 int + enum）。
3. **沒設最大步數** → LLM 反覆呼叫同一工具刷 token（C4 加閘門）。
4. **工具丟異常沒回傳** → LLM 以為成功、繼續下一步（要 catch 後回 `error`）。
5. **把「執行」寫进 prompt**（「請你去查資料庫」）→ LLM 沒有手，會幻覺（要用真 tool 機制）。
6. **一個 function 做太多事**（萬能 function）→ LLM 參數填錯率暴增（拆成多個單一職責 function）。

---

## 8. 本卡 Lab

照 `lab-03.md`：
1. 定義 1–2 個 function（例：`get_weather`、`calculator`），寫好 schema（description + 精確 param + enum）。
2. LLM 吐 `tool_calls` → 本地執行 → 結果 `role=tool` 回吐 → LLM 給最終答案。
3. 故意讓一個工具拋錯，驗證 LLM 收到 error 後**不崩、能改走別路/報告**。
4. **證據**：LLM 吐的 function-call JSON 截圖＋本地執行 log（含一次錯誤處理）。

> 下一卡（C4）：把「一次工具」升級成「**多步任務**」——**Agent**（ReAct＋錯誤重試＋停止條件）。
