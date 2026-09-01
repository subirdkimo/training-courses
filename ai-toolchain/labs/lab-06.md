# Lab C6 — 整合上線與結案

> 目標：把 C1–C5 組件**拼成一個可被外部呼叫的完整應用**（含分流/auth/降級/埋點），並交付 **1 頁交付報告**＝結案。
> 前置：C1–C5 全卡 done（有可用的抽取器/RAG/Tool/Agent/回歸集）。
> 交付（C6 證據）：API 呼叫截圖（	curl 請求/回應）＋1 頁交付報告＋一段完整 trace log。

## 1. 組裝 pipeline（含分流/降級）
```python
# pipeline.py
from extractor import extract            # C1
from rag.ask import ask as rag_ask        # C2
from agent import act as agent_run         # C4
from budget import check_budget, BudgetExceeded   # C0 成本閘門

def route(text):
    # 分流：簡單抽取→輕路徑；需查資料→RAG；多步任務→Agent
    if any(k in text for k in ("幾度","天氣")):   return "agent"
    if any(k in text for k in ("政策","退貨","價格")): return "rag"
    return "extract"   # 預設輕路徑

def process(text):
    check_budget()                          # 成本閘門→BudgetExceeded
    path = route(text)
    if path == "rag":     return {"path":"rag",     "answer":rag_ask(text)}
    if path == "agent":   return {"path":"agent",   "answer":agent_run(text)}
    return {"path":"extract","answer":extract(text)}
```

## 2. API 層（FastAPI）
```python
# app.py
from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from pipeline import process
from budget import BudgetExceeded

app = FastAPI()
class Ask(BaseModel):
    text: str

def auth(key: str = Depends(check_key)):    # 每使用者獨立 key+限流
    return key

@app.post("/ask", dependencies=[Depends(auth)])
def ask(req: Ask):
    try:
        return process(req.text)
    except BudgetExceeded:
        raise HTTPException(503, "成本超限，請稍後重试")
    except Exception:
        raise HTTPException(500, "internal error")     # 不洩密
```
> 降級：`pipeline` 內主路徑異常 → 退回「舊答案/僅 LLM+明確告知無資料」（見 content §4.2）。

## 3. 埋點（接 C5 指標）
```python
# 每筆請求記：request_id / 走了哪條路 / tokens / latency / 成本
# 輸出到 JSON log；儀表板看 p50/p95/錯誤率/成本 trend
```

## 4. 跑真實請求
```bash
uvicorn app:app --port 8000
curl -s -X POST http://localhost:8000/ask \
  -H "Authorization: Bearer <key>" -H "Content-Type: application/json" \
  -d '{"text":"A4 紙退貨期限幾日？"}'
# 觀察：走了 rag 路徑、有 answer、有 request_id
```

## 5. 1 頁交付報告（寫 notes/c6.md）
| 區塊 | 內容 |
|------|------|
| 能做什麼 | 一句話＋3 個範例 |
| 架構 | 1 圖（哪類請求走 RAG/Tool/Agent） |
| 品質 | C5 三軸分數 |
| 成本 | 月預估＋預算上限 |
| 可靠性 | 降級策略＋監控指標 |
| 怎麼用 | endpoint＋curl＋key 從哪來 |
| 已知限制 | 不支援什麼/什麼情況會答錯 |
| 下一步 | 擴量/加功能/改模型 |

## 6. 提交
```bash
git add pipeline.py app.py budget.py notes/c6.md
git commit -m "C6 整合上線：/ask API +分流+降級+埋點 + 1頁交付報告"
```

## 驗證
- [ ] `POST /ask` 可被外部呼叫，回正確 path+answer。
- [ ] 有 auth；錯誤不外洩細節（回 500 不洩密）。
- [ ] 至少 1 條降級路徑（主路徑異常時仍能回可接受結果）。
- [ ] 埋點含 request_id/路徑/tokens/latency/成本。
- [ ] 交付報告 8 區塊齊全。
- [ ] 已 `git commit`。

## 證據提交
> C6 完成，2026-10-29。證據：curl 請求/回應截圖附件 c6_api.png；1 頁交付報告見 notes/c6.md；完整 trace log（request_id+走了哪條路+成本）附件 c6_trace.log。
> **全 7 卡 done** → 等待 ai_assist 寄結案彙總信。
