# C1 — Prompt 工程與 API 呼叫（結構化輸出＋多輪＋JSON mode）

> 時長：1 hr　|　投影片：`class-01-…pptx`（核可後產）　|　Lab：`lab-01.md`
> 交付：能寫出結構化、可測試的 prompt，讓 LLM **穩定吐出合法 JSON**（含失敗重試）。

---

## 1. 這堂要解決什麼

C0 把 LLM「接上」了；C1 要把它「**鎖住**」。
最常見的 AI 應用失敗不是「答錯」，是「**格式不穩定**」：
- 你要 JSON，它一半回 JSON、一半回「以下是你要的 JSON」。
- 同樣問題問 3 次，3 次 3 個結構 → 下游 code 崩。

**本卡核心**：把 prompt 從「靠手感的咒語」升級成「**合約**」——明確輸入、明確輸出、可測試、可回歸。

**驗收口**：同一 prompt 連續 10 次都吐**合法、同結構**的 JSON。

---

## 2. Prompt 的三個角色（system / user / assistant）

LLM API 把對話分成「角色訊息」，不同角色有不同的「語氣職權」：

| 角色 | 誰寫 | 用在哪 | 特性 |
|------|------|--------|------|
| **system** | 開發者 | 設定人設／規則／輸出格式 | **最優先**，跨多輪恒定；改它就改整個行為 |
| **user** | 使用者 | 本次實際問題／輸入 | 每次請求的內容主體 |
| **assistant** | LLM（也常被預填） | 之前的回答／few-shot 範例 | 影響「接下來怎麼走」 |

> **心智模型**：system＝**員工手冊**（規則、格式、邊界，長期有效）；user＝**今天的工單**；assistant＝**前幾單怎麼辦的紀錄**。
> **格式約束放 system**（長期穩定），**具體問題放 user**（每次變）——混在一起是新手最大 bug。

```python
messages = [
  {"role": "system", "content": "你是訂單資料抽取器。只回 JSON，不要任何解釋。"},
  {"role": "user",   "content": "客戶說：『我上週三訂了一箱 A4 紙，想改送到 5 號』"},
]
```

### 多輪上下文（conversation memory）
- API **本身無狀態**——每次你都要把**歷史**一起塞回去（`messages` 是完整 array）。
- 省 token 技巧：只塞最近 N 輪＋必要摘要，不是塞全部歷史。

---

## 3. 參數：temperature / max_tokens / top_p

| 參數 | 作用 | 取值建議 |
|------|------|----------|
| **temperature** | 隨機性/多樣性（0=最確定，高=更隨性） | **結構化/抽取 task：0 或 0.2**；創意寫作：0.7–1.0 |
| **max_tokens** | 上限產出 token | 給足夠但別濫給（省 cost）；JSON 固定格式給緊湊值 |
| **top_p** | 核採樣（ cumulative 概率截斷） | 一般不用動；與 temperature 二選一調 |

> **心智模型**：要「**穩定可重現**」的結構輸出，就把 temperature 壓到 0 級——**確定性 > 創意**。
> 溫度調高只在「要變化/多樣答案」時才有值（例如 brainstorm）。

---

## 4. 結構化輸出：JSON mode / structured outputs（本卡關鍵）

**問題**：純 prompt 說「回 JSON」，模型偶爾會夾帶文字→ `json.loads` 炸。

**解法分三級**（由弱到強）：

| 級 | 機制 | 穩定度 | 適用 |
|----|------|--------|------|
| 1 | prompt 說明＋自己 `json.loads`（失敗重試） | 中 | 舊 API / 跨平台 |
| 2 | **JSON mode**（`response_format={"type":"json_object"}`） | 高 | OpenAI 等支援者 |
| 3 | **structured outputs**（帶 JSON Schema 強約束） | 最高 | 嚴肅生產（本課目標） |

### 結構化輸出範例（JSON mode 層級）

```python
import json
schema = {
  "type": "object",
  "properties": {
    "product":  {"type": "string"},
    "quantity": {"type": "integer"},
    "change":   {"type": "string"}
  },
  "required": ["product", "quantity"]
}
r = client.chat.completions.create(
    model="gpt-4.1-mini",
    temperature=0,
    response_format={"type": "json_object"},
    messages=[
      {"role":"system","content":"抽取訂單資訊，只回符合 schema 的 JSON。"},
      {"role":"user",  "content":"客戶說：『我上週三訂了一箱 A4 紙，想改送到 5 號』"},
    ],
)
data = json.loads(r.choices[0].message.content)
print(data)  # e.g. {"product":"A4 紙","quantity":1,"change":"改送到5號"}
```

### 失败重試（生產必加）

```python
def extract(client, user_text, retries=2):
    for attempt in range(retries+1):
        r = client.chat.completions.create(..., temperature=0)
        try:
            return json.loads(r.choices[0].message.content)
        except json.JSONDecodeError:
            if attempt >= retries:
                raise
    ...
```

> **心智模型**：結構化輸出＝**把「輸出格式」從 prompt 的『請求』變成 API 的『保證』**。LLM 只負責「填值」，格式由 schema 兜底——這是 AI 應用能上生產的基礎。

---

## 5. 心智模型：prompt＝合約

- **輸入端**：你要什麼（角色、任務、邊界）——放 system。
- **輸出端**：要長什麼樣（schema、欄位、語義）——放 system＋schema。
- **每次變的**：具體資料——放 user。
- **可測試**：同一輸入，多次輸出結構一致（C5 用回歸集驗證）。

> **跟 C5 的分界**：C1 只做「**一個**輸出穩定」；C5 做「**一群**輸出可比較、可回歸」——先把單點鎖死，才會寫回歸集。

---

## 6. 常見 prompt 錯誤

1. **格式約束放 user**（該放 system）→ 多輪後行為漂移。
2. **temperature 調太高**做抽取 → 同一句 3 次 3 個答案。
3. **「請只回 JSON」卻沒 schema** → 偶爾夾帶文字（要用 JSON mode/schema）。
4. **max_tokens 太小** → JSON 被截斷、`json.loads` 炸（給足但別濫給）。
5. **一次讓 LLM 做 5 件事** → 每件都做得半吊子（拆成多步，C4 Agent 會處理）。
6. **把「解釋」也當輸出要**（「請解釋為什麼」）→ 混進 JSON 裡（明確說「只回 JSON」）。

---

## 7. 本卡 Lab

照 `lab-01.md`：
1. 建一個「自然語言訂單 → 結構化 JSON」的抽取器（system+user）。
2. 開 JSON mode／schema，`temperature=0`。
3. 同一句 **連跑 10 次**，確認 10/10 合法 JSON、結構一致。
4. **證據**：10 次輸出的 JSON 貼文/截圖＋你的 system prompt 檔。

> 下一卡（C2）：光靠 prompt 處理不了「私域資料」「最新文件」——引入 **RAG**（檢索＋生成）。
