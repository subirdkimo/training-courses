# Lab C0 — AI 工具選型與帳號準備

> 目標：選定 1 套 LLM API/SDK，把 API key 管好，跑通 smoke test，寫出選型理由與成本估算。
> 前置：Python 3.11+、至少 1 個商用 LLM access key、git 帳號。
> 交付（C0 證據）：smoke test 輸出＋選型理由 3 行＋月成本估算。

## 1. 建專案
```bash
mkdir ai-toolchain-lab && cd ai-toolchain-lab
git init
```

## 2. 環境變量（key 管理）
```.gitignore
.env
__pycache__/
.chroma/
```
```bash
# .env（本地，禁進 git）
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxx
# .env.example（進 git，只佔位）
OPENAI_API_KEY=your-key-here
```
```bash
git add .gitignore .env.example && git status   # 確認 .env 未被追蹤
```

## 3. 裝 SDK
```bash
pip install "openai>=1.30" "python-dotenv>=1.0" "chromadb>=0.5"
```

## 4. Smoke test
```python
# smoke_test.py
import os, time, dotenv
from openai import OpenAI
dotenv.load_dotenv()
client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])

t0 = time.perf_counter()
r = client.chat.completions.create(
    model="gpt-4.1-mini",
    messages=[{"role": "user", "content": "用一句話說明什麼是 RAG。"}],
)
print("answer:", r.choices[0].message.content)
print(f"tokens={r.usage.total_tokens} latency={time.perf_counter()-t0:.2f}s")
```
```bash
python smoke_test.py          # 至少跑 3 次看 latency 穩定性
```

## 5. 選型理由＋成本估算（寫進 `notes/select.md`）
- **選型理由（3 行）**：成本軸／延遲軸／上下文軸各一句。
- **月成本估算**：月請求數 × (in token×單價 + out token×單價)，用 provider 價目表算。

## 6. 提交
```bash
git add smoke_test.py notes/select.md .env.example .gitignore
git commit -m "C0 選型備料：smoke test +選型理由+成本估算"
```

## 驗證
- [ ] `git status` 顯示 `.env` 未被追蹤。
- [ ] smoke test 跑通，輸出含 `tokens` 與 `latency`。
- [ ] `notes/select.md` 有 3 行選型理由＋月成本估算。
- [ ] 已 `git commit`。

## 證據提交
回覆 C0 首封：
> C0 完成，2026-10-09。證據：smoke test 輸出（tokens/latency）见附件 smoke_test.png；選型理由 3 行＋成本估算貼文如下……
