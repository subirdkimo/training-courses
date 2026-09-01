# C0 — AI 工具選型與帳號準備

> 時長：1 hr　|　投影片：`class-00-…pptx`（核可後產）　|　Lab：`lab-00.md`
> 交付：選 1 套 LLM API/SDK＋向量庫＋框架，跑通 smoke test，給出選型理由與成本估算。

---

## 1. 這堂要解決什麼

很多人做 AI 應用的第一個坑**不是 code**，是**選錯工具**：
- 選了貴/慢/上下文太短的模型 → 後期全部重做。
- 沒管好 API key → 泄露、超標、無法上線。
- 沒估成本 → 第一月帳單 US$300，嚇到專案被砍。

本卡目標：**在你寫任何「AI 邏輯」之前，先把「地基」選對、管好、算清。**

**驗收口**：`smoke test` 跑通＋選型理由（3 行）＋月度成本估算。

---

## 2. 選型三軸（成本 / 延遲 / 上下文）

沒有「最強模型」，只有「最合 workload」的模型。三軸要一起看：

| 軸 | 問自己 | 影響 |
|----|--------|------|
| **成本（$/1K tokens）** | 這功能每月跑幾次？in/out token 各多少？ | 直接決定帳單；in 通常遠貴於 out 或反之 |
| **延遲（p50/p95）** | 使用者在等？(chat 要 <2s)、還是背景批處理？(10s 可接受) | 決定要不要用小/快模型跑熱路徑 |
| **上下文長度（context window）** | 要不要塞大文件（RAG）/多歷史（agent）？ | 128K 與 8K 差 16 倍，RAG 場景關鍵 |

> **心智模型**：選型＝「花對的錢、在對的延遲內、給得下對長的上下文」。
> 三軸常衝突（便宜=慢、快=短、長=貴）——**用你 workload 的真實數字去裁**，不要憑感覺。

### 主流商用 LLM API 對照（2026 基準，以「有 structured output + tool calling」為前提）

| API | 主力模型 | 上下文 | 相對成本 | 適用 |
|-----|----------|--------|----------|------|
| **OpenAI** | gpt-4.1-mini / gpt-4.1 | 128K | 中 | 通用、生態最全、課程主用 |
| **Anthropic Claude** | sonnet / haiku | 200K | 中高 | 長文、工具鏈穩定 |
| **Azure OpenAI** | 同 OpenAI | 128K | 中高 | 需合規/內網 |

> **原則**：本課程**挑 1 個**即可（以下範例用 OpenAI），**不要**一次接三家比較——那要留到 Class 5（評測）用回歸集系統比。

---

## 3. 帳號與 Key 管理

### 3.1 API key 的正確姿勢

- key **永不出現**在 code / git / log 裡；一律放 **環境變量**（`.env`）。
- `.env` 加入 `.gitignore`；**建一個 `.env.example`**（只放變名佔位）供團隊。
- 每個專案／環境（dev/prod）**獨立 key**，可單獨 revoke。
- 定期查用量（provider 儀表板）＋設**預算上限**（budget cap / alert）。

```python
# .env（禁進 git）
OPENAI_API_KEY=sk-xxxxxxxx...
# .env.example（進 git）
OPENAI_API_KEY=your-key-here
```

```python
# 讀取：一律走環境變量，不要硬編
import os
from openai import OpenAI
client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])  # 缺環境變量直接報錯，不讓空 key 混進去
```

> **心智模型**：key＝信用卡＋CVV 一起丟桌上＝事故。環境變量＋.gitignore＋預算上限＝三層保險，缺一層都可能漏錢。

### 3.2 SDK 版本與安裝

```bash
pip install "openai>=1.30" "chromadb>=0.5" "python-dotenv>=1.0"
```
- OpenAI Python SDK v1.x（`client.chat.completions.create`）。
- `python-dotenv`：載入 `.env` 到 `os.environ`。

---

## 4. Smoke test（本卡核心交付）

最小 runnable：一個 call，回一個字，抓 tokens／延遲。

```python
import os, time
from openai import OpenAI
import dotenv
dotenv.load_dotenv()

client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])
t0 = time.perf_counter()
r = client.chat.completions.create(
    model="gpt-4.1-mini",
    messages=[{"role": "user", "content": "用一句話說明什麼是 RAG。"}],
)
dt = time.perf_counter() - t0
print(r.choices[0].message.content)
print(f"tokens={r.usage.total_tokens} latency={dt:.2f}s")
```

**跑通＝C0 證據**：截圖/貼這段輸出（含 model/tokens/latency）。

### smoke test 失敗對照表（排錯用）

| 症狀 | 最可能原因 | 解法 |
|------|-----------|------|
| `AuthenticationError` 401 | key 錯/沒讀到環境變量 | 檢查 `.env`、`load_dotenv()`、變名拼寫 |
| `RateLimitError` 429 | 超速率/未啟用 | 等 60s 重試；查 provider 額度 |
| 超時 | 網路/region | 換 region；開 proxy；改用更近端點 |
| `model not found` 404 | 模型名寫錯 | 查 provider 的模型清單（不同 API 名字不同） |

---

## 5. 成本估算法（必會，C5 會再用到）

```
月成本 ≈ (月請求數 × 平均 in tokens + 月請求數 × 平均 out tokens) 加總
        × (in 單價 + out 單價)
```

**例**：chat 應用，月 5 萬次，每次 in 800 / out 200 tokens：
- in：50000×800 = 40M tokens；out：50000×200 = 10M tokens。
- 按某 mini 模型 in≈$0.4/M、out≈$0.8/M（**教學示意價，以 provider 實際價目為準**）：
  ≈ 40×0.4 + 10×0.8 = **US$24/月**。
- **結論**：先估、再選；**預算超限時**，優先降 in（RAG 切塊調小）比降模型級別更划算。

> **心智模型**：成本是**乘出來**的（token×量×價），不是「選個便宜模型」就完事——**量**才是最大變數，控量（快/小模型跑熱路徑、貴模型只跑難題）比控價有效。

---

## 6. 常見選型錯誤（避坑清單）

1. **只看單價**，忽略延遲/上下文/結構化輸出支援 → 後期重做。
2. **熱路徑都用最貴模型** → 成本爆炸（該用 mini 跑 90% 簡單请求）。
3. **RAG 塞整份長文件** 進 prompt → token 爆、召回稀釋（該切塊+檢索）。
4. **key 沒 budget cap** → 一次死循環刷到破產（C4/C5 會再講）。
5. **一次接多家 API** → 維護成本遠大於收益（除非有明確合規/降級理由）。

---

## 7. 本卡 Lab

照 `lab-00.md`：
1. 建 `ai-toolchain-lab/` ＋ `.env`/`.env.example`/`.gitignore`。
2. 安裝 SDK，跑 §4 的 smoke test。
3. 寫 3 行選型理由（成本/延遲/上下文各一）＋ §5 的月度成本估算。
4. **證據**：smoke test 輸出＋選型理由 3 行。

> 下一卡（C1）：從「跑通」進到「**可控輸出**」——system/user 多輪＋JSON mode／structured outputs。
