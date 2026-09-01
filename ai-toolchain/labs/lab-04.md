# Lab C4 — Agent 與多步推理（ReAct）

> 目標：寫一個 **3+ 步 ReAct 迴路**，含**錯誤重試**、**停止條件**、**成本記錄**，做一個不會失控的多步代理。
> 前置：C3 已會 function calling 閉環。
> 交付（C4 證據）：3+ 步完整 ReAct trace log（含 1 次錯誤重試＋1 次停止判定）。

## 1. Agent loop（ReAct + 約束）
```python
# agent.py
import os, json, time, dotenv
from openai import OpenAI
from tools import TOOLS, FN      # 複用 C3 的 tools
dotenv.load_dotenv()
client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])

MAX_STEPS = 8
MAX_BUDGET_USD = 0.50

def act(user_goal):
    msgs = [{"role":"system","content":
        "你是做事代理。用工具完成目標；每輪只下一步；讀完 Observation 再決定；能完成就出最終答案。"},
            {"role":"user","content":user_goal}]
    steps, cost, stopped = [], 0.0, None
    prev_obs = None

    for i in range(MAX_STEPS):
        t0 = time.perf_counter()
        r = client.chat.completions.create(model="gpt-4.1-mini", messages=msgs, tools=TOOLS)
        msg = r.choices[0].message
        usage = r.usage
        cost += estimate_cost(usage)          # 用你的 provider 價目估算

        # 無進展偵測
        if msg.tool_calls:
            msgs.append(msg.model_dump())
            obs_now = []
            for tc in msg.tool_calls:
                try:
                    args = json.loads(tc.function.arguments or "{}")
                    res = FN[tc.function.name](**args)
                    payload = json.dumps(res)
                except Exception as e:
                    payload = json.dumps({"error": str(e)})
                msgs.append({"role":"tool","tool_call_id":tc.id,"content":payload})
                obs_now.append((tc.function.name, payload))
            obs_now_str = str(obs_now)
            steps.append({"step":i+1,"action":obs_now,"latency":round(time.perf_counter()-t0,2)})
            if obs_now_str == prev_obs:                      # 連續同 Observation = 卡住
                stopped = "no_progress"; break
            prev_obs = obs_now_str
        else:
            steps.append({"step":i+1,"final":msg.content})
            stopped = "goal_done"; break

        if cost > MAX_BUDGET_USD:
            stopped = f"budget_exceeded({cost:.3f})"; break
    else:
        stopped = "max_steps"

    print(json.dumps({"steps":steps,"cost_usd":round(cost,4),"stopped":stopped}, ensure_ascii=False, indent=2))
    return cost, stopped

def estimate_cost(usage):
    in_t = usage.prompt_tokens; out_t = usage.completion_tokens
    return in_t/1e6*0.40 + out_t/1e6*0.80   # 示意價目；換你的 provider
```

## 2. 跑 3+ 步任務
```bash
python -c "from agent import act; act('查東京天氣，若大於20度就提醒帶傘，並算 5*4')"
```
預期：至少 3 步（get_weather → 判斷 → calculator → final），並觸發 `stopped=goal_done`。

## 3. 觸發「錯誤重試」
- 用一個會讓工具拋錯的目標（如「查月球表面溫度」），觀察 LLM 收到 `error` 後**改走別路/報告**（非直接 crash）。
- 記錄該步 trace。

## 4. 觸發「停止條件」
- 把 `MAX_STEPS` 調低（如 2），跑一個 3 步才能完成的目標 → 觀察 `stopped=max_steps`。
- **或**故意讓工具同參數重打 → 觀察 `stopped=no_progress`。

## 5. 提交
```bash
git add agent.py notes/c4.md
git commit -m "C4 自主代理：ReAct 3+步 + 錯誤重試 + 停止條件(步數/無進展/成本)"
```

## 驗證
- [ ] 3+ 步 ReAct trace（Thought→Action→Observation 可辨識）。
- [ ] 至少 1 次工具錯誤 → LLM 收到 error 後重試/換路（非崩）。
- [ ] 至少 1 次明確的停止判定（goal_done / max_steps / no_progress / budget）。
- [ ] cost 有被累計並在超閾時停止。
- [ ] 已 `git commit`。

## 證據提交
> C4 完成，2026-10-22。證據：完整 3+ 步 ReAct trace（含 1 次錯誤重試＋1 次停止判定）見 notes/c4.md；cost/stopped 輸出附件 c4_trace.png。
