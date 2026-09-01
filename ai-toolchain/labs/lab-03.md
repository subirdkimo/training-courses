# Lab C3 — Tool 呼叫（function calling）

> 目標：讓 LLM **穩定吐 function-call JSON**，本地執行後把結果回吐，完成「LLM 做事」閉環＋一次錯誤處理。
> 前置：C1 已會結構化輸出；C2 已會多訊息回傳（messages array）。
> 交付（C3 證據）：LLM 吐的 function-call JSON＋本地執行 log（含一次錯誤處理）。

## 1. 定義 functions
```python
# tools.py
TOOLS = [
  {"type":"function","function":{
      "name":"get_weather",
      "description":"取得指定城市目前天氣。城市用英文。",
      "parameters":{"type":"object",
        "properties":{"city":{"type":"string","description":"城市名，e.g. Tokyo"}},
        "required":["city"]}}},
  {"type":"function","function":{
      "name":"calculator",
      "description":"算數學。expr 用算式字串。",
      "parameters":{"type":"object",
        "properties":{"expr":{"type":"string","description":"e.g. '3*7+2'"}},
        "required":["expr"]}}},
]

def get_weather(city):
    data = {"Tokyo":21,"Taipei":29,"New York":13}
    if city not in data:
        raise ValueError(f"unknown city: {city}")   # 故意可拋錯，測錯誤處理
    return {"city":city,"temp_c":data[city]}

def calculator(expr):
    import ast, operator as op
    # 安全 eval（僅四則運算）
    return eval(expr, {"__builtins__":{}}, {"+":op.add,"-":op.sub,"*":op.mul,"/":op.truediv})

FN = {"get_weather":get_weather,"calculator":calculator}
```

## 2. 閉環 loop
```python
# run_tool.py
import os, json, dotenv
from openai import OpenAI
from tools import TOOLS, FN
dotenv.load_dotenv()
client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])

def run(user_text, max_steps=3):
    msgs = [{"role":"user","content":user_text}]
    for i in range(max_steps):
        r = client.chat.completions.create(model="gpt-4.1-mini", messages=msgs, tools=TOOLS)
        msg = r.choices[0].message
        if msg.tool_calls:
            msgs.append(msg.model_dump())
            for tc in msg.tool_calls:
                try:
                    args = json.loads(tc.function.arguments or "{}")
                    result = FN[tc.function.name](**args)
                    payload = json.dumps(result)
                except Exception as e:
                    payload = json.dumps({"error": str(e)})   # 錯誤也回吐，讓 LLM 決策
                msgs.append({"role":"tool","tool_call_id":tc.id,"content":payload})
            print(f"step{i}: tool_calls={[(tc.function.name, tc.function.arguments) for tc in msg.tool_calls]}")
        else:
            print("FINAL:", msg.content)
            return msg.content
    print("FINAL: (超 max_steps 停止)")
```

## 3. 跑
```bash
python -c "from run_tool import run; run('東京現在幾度？')"
python -c "from run_tool import run; run('12 乘以 8 再加 5 等於幾？')"
# 故意錯誤：
python -c "from run_tool import run; run('月球表面現在幾度？')"   # get_weather 拋錯 → LLM 收到 error
```

## 4. 提交
```bash
git add tools.py run_tool.py notes/c3.md
git commit -m "C3 工具調用：function calling 閉環 + 錯誤回傳處理"
```

## 驗證
- [ ] LLM 吐 `tool_calls` JSON，本地執行後回吐，LLM 給最終答案（閉環跑通）。
- [ ] 至少 2 個不同 tool 被正確選取（get_weather / calculator）。
- [ ] 出錯案例：工具拋錯 → LLM 收到 `error` 後**不崩、能改走別路/報告**。
- [ ] schema 的 description 精確、param type 明確、標 required。
- [ ] 已 `git commit`。

## 證據提交
> C3 完成，2026-10-20。證據：LLM 吐的 function-call JSON 見 notes/c3.md；本地執行 log（含 1 次工具拋錯後 LLM 收到 error 的處理）附件 c3_trace.png。
