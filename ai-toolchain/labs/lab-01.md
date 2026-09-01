# Lab C1 — Prompt 工程與 API 呼叫（結構化輸出）

> 目標：讓 LLM **穩定吐出合法 JSON**（連 10 次結構一致），用 system/user 三角色＋JSON mode／schema。
> 前置：C0 已跑通 smoke test（SDK 已裝、`.env` 已配）。
> 交付（C1 證據）：10 次 JSON 輸出貼文／截圖＋你的 system prompt 檔。

## 1. 定義 schema
```python
# schema.py
SCHEMA = {
  "type": "object",
  "properties": {
    "product":  {"type": "string"},
    "quantity": {"type": "integer"},
    "change":   {"type": "string"}
  },
  "required": ["product", "quantity"],
}
```

## 2. 抽取器（JSON mode + temperature=0）
```python
# extractor.py
import os, json, time, dotenv
from openai import OpenAI
from schema import SCHEMA
dotenv.load_dotenv()
client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])

SYSTEM = "你是訂單資料抽取器。只回符合 schema 的 JSON，不要任何說明。"

def extract(user_text, retries=2):
    for attempt in range(retries + 1):
        r = client.chat.completions.create(
            model="gpt-4.1-mini",
            temperature=0,
            response_format={"type": "json_object"},   # 或 structured outputs schema
            messages=[
              {"role": "system", "content": SYSTEM},
              {"role": "user",   "content": user_text},
            ],
        )
        try:
            return json.loads(r.choices[0].message.content)
        except json.JSONDecodeError:
            if attempt >= retries:
                raise
    ...
```

## 3. 連跑 10 次，確認 10/10 合法
```python
from extractor import extract
CASE = "客戶說：『我上週三訂了一箱 A4 紙，想改送到 5 號』"
results = [extract(CASE) for _ in range(10)]
for x in results:
    print(x)
# 預期：10 行都是 {"product":"A4 紙","quantity":1,"change":"改送到5號"}（值可微調，結構必須一致）
```

## 4. 對照實驗（證明 JSON mode 的價值）
- 关掉 `response_format`、temperature 調到 1.0，跑 5 次，**記錄至少 1 次夾帶文字/json.loads 炸**的輸出。
- 這一步是给你「看」為什麼要結構化輸出。

## 5. 提交
```bash
git add schema.py extractor.py test_10x.py notes/c1.md
git commit -m "C1 提示工程：JSON mode 抽取器 +10 次連跑驗證"
```

## 驗證
- [ ] 10/10 次都回合法 JSON、結構一致。
- [ ] 對照實驗至少抓到 1 次不穩定輸出（證明結構化輸出的必要）。
- [ ] 你的 system prompt 有明確「只回 JSON」的約束。
- [ ] 已 `git commit`。

## 證據提交
> C1 完成，2026-10-13。證據：10 次 JSON 輸出貼文見 notes/c1.md；對照實驗截圖见附件 c1_unstable.png；system prompt 貼文如下……
