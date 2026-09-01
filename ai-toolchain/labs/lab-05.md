# Lab C5 — 評測與監控

> 目標：建一組 **≥20 案例回歸集**，對任一組件（抽取/RAG/Tool/Agent）跑**分數＋成本＋latency** 三軸，並列出線上監控指標。
> 前置：C1–C4 任一組件已可跑（本例用 C1 抽取器做 A/B）。
> 交付（C5 證據）：≥20 案例回歸集＋兩變體三軸分數表。

## 1. 建回歸集（≥20 案例，含 ≥5 邊界/負例）
```python
# evalset.py
CASES = [
  {"id":"c01","tag":"extract","input":"我上週三訂了一箱 A4 紙，想改送到 5 號",
   "assert":{"product":"A4 紙","quantity":1}},
  {"id":"c02","tag":"extract","input":"兩箱 500 張的 A3 紙",
   "assert":{"product":"A3 紙","quantity":2}},
  ...                       # 正常案例至 c15
  # 邊界/負例（>=5）
  {"id":"c16","tag":"extract","input":"（空）","assert_none":True},
  {"id":"c17","tag":"extract","input":"我要退貨，上個月買的筆","assert_missing":"quantity"},
  {"id":"c18","tag":"extract","input":"三箱 A4 紙但只送一半","assert_conflict":True},
  {"id":"c19","tag":"rag",   "input":"退貨期限幾號？","expect_has":"7 日"},
  {"id":"c20","tag":"agent", "input":"查東京天氣並算 3*3","expect_steps":">=2"},
]
assert len(CASES) >= 20, "回歸集要 >=20 案例"
```

## 2. 打分引擎（規則 assert 優先）
```python
# score.py
def grade(case, output):
    if case.get("assert_none"): return output in ("", None) or "不確定" in str(output)
    if "assert" in case:
        return all(output.get(k)==v for k,v in case["assert"].items())
    if "expect_has" in case:
        return case["expect_has"] in str(output)
    return True
```

## 3. A/B 跑分（變體=換 prompt 或換模型）
```python
# ab.py
import time, statistics
from extractor import extract as A                # 變體 A（舊 prompt/模型）
from extractor import extract_b as B             # 變體 B（改 prompt/換模型）
from evalset import CASES; from score import grade

def run_variant(fn, label):
    hits, costs, lats = 0, 0.0, []
    for c in CASES:
        t0=time.perf_counter(); out=fn(c["input"]); lat=time.perf_counter()-t0
        hits += grade(c, out); lats.append(lat)
    p50,p95 = (round(statistics.quantiles(lats,n=100)[k],3) for k in (4,9))
    print(f"{label}: 分數={hits}/{len(CASES)}  latency p50={p50}s p95={p95}s")
run_variant(A,"A"); run_variant(B,"B")
```

## 4. 三軸對照表（寫進 notes/c5.md）
| 版本 | 分數（20 案例） | 成本/月(US$) | p50 | p95 |
|------|----------------|--------------|-----|-----|
| A    | _/20 | _ | _ | _ |
| B    | _/20 | _ | _ | _ |
→ 寫一句「我選 __，因為（三軸一起讀的理由）」。

## 5. 線上監控指標清單（≥5 項＋告警閾值）
1. 單請求 in/out tokens＋成本 → 閾：>中位數×3
2. latency p50/p95 → 閾：p95>3s 持續 5min
3. 錯誤率（4xx/5xx/JSON 解析失敗）→ 閾：>2%
4. 工具呼叫失敗率 → 閾：>5%
5. token/請求 trend → 閾：突增 3 倍

## 6. 提交
```bash
git add evalset.py score.py ab.py notes/c5.md
git commit -m "C5 評測監控：>=20 案例回歸集 + 兩變體三軸分數 + 線上指標清單"
```

## 驗證
- [ ] 回歸集 ≥20 案例（含 ≥5 邊界/負例）。
- [ ] 兩變體各跑出「分數/成本/latency p50+p95」。
- [ ] 有明確定案「選哪個版本」＋三軸理由。
- [ ] 線上監控指標清單 ≥5 項＋閾值。
- [ ] 已 `git commit`。

## 證據提交
> C5 完成，2026-10-27。證據：≥20 案例回歸集見 evalset.py；A/B 三軸分數表見 notes/c5.md；線上指標清單附件 c5_metrics.png。
