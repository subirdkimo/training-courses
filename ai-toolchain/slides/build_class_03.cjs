const pptxgen = require("/tmp/opencode/deckbuild/node_modules/pptxgenjs");
const D = require("./.design.cjs");
const { C, FONT_HEAD, FONT_BODY, W, H, darkSlide, contentSlide, card, bullets, footer } = D;

const pptx = new pptxgen();
pptx.layout = "LAYOUT_16x9";
pptx.author = "AI_assist";
pptx.title = "Class 3 - Tool 呼叫";

let s = darkSlide(pptx, { kicker: "AI 工具鏈訓練", title: "Class 3", titleSize: 60 });
s.addShape("roundRect", { x: 0.6, y: 4.0, w: 6.0, h: 0.55, fill: { color: C.brand }, rectRadius: 0.1 });
s.addText("Tool 呼叫（Function Calling）", { x: 0.6, y: 4.0, w: 6.0, h: 0.55, fontFace: FONT_BODY, fontSize: 16, color: C.white, bold: true, align: "center", margin: 0 });
s.addText("1 hr ｜ Schema 設計 / 本地執行 / 錯誤處理", { x: 0.6, y: 4.7, w: 8.8, h: 0.4, fontFace: FONT_BODY, fontSize: 13, color: C.ice, margin: 0 });
s.addNotes("C3: tool calling, schema, execution loop");

// S2 原理
s = contentSlide(pptx, "Function Calling 原理", { page: "2" });
const steps = [
  "你 → LLM：問題 + 可用 tools 清單（name/desc/params schema）",
  "LLM → 你：{ tool_calls: [{ name, arguments }] }",
  "你：執行 tool_fn(args) → result",
  "你 → LLM：把 result 放進 role=tool",
  "LLM → 你：最終自然語言答案",
];
let sy = 1.05;
steps.forEach((st, i) => {
  s.addShape("ellipse", { x: 0.6, y: sy + 0.08, w: 0.35, h: 0.35, fill: { color: i === 4 ? C.brand : C.accent } });
  s.addText(String(i + 1), { x: 0.6, y: sy + 0.08, w: 0.35, h: 0.35, fontFace: FONT_BODY, fontSize: 13, color: C.white, bold: true, align: "center", valign: "middle", margin: 0 });
  s.addText(st, { x: 1.15, y: sy, w: 8.2, h: 0.5, fontFace: FONT_BODY, fontSize: 12.5, color: C.body, margin: 0, valign: "middle" });
  sy += 0.62;
});
s.addShape("roundRect", { x: 0.5, y: 4.3, w: 9, h: 0.6, fill: { color: C.soft }, rectRadius: 0.08 });
s.addText("關鍵：LLM 不執行、只「吐指令」。執行權一律在你手上——Tool 能上生產的安全前提。Tool = LLM 的手，腦子指派手去做。", { x: 0.7, y: 4.36, w: 8.6, h: 0.5, fontFace: FONT_BODY, fontSize: 11.5, color: C.navy, bold: true, margin: 0, valign: "middle" });
footer(s, "執行權在你 = 能上生產的線");

// S3 Schema 設計
s = contentSlide(pptx, "Schema 設計原則", { page: "3" });
const principles = [
  [C.brand, "description 寫給 LLM 看", "講清「何時用、參數語義」\n反例：name:\"g\" 太含糊"],
  [C.accent, "param 類型精確", "int 別用 string、enum 收斂\n反例：\"1,000\" vs 1000"],
  [C.brand, "一個 function 一個職責", "別做萬能 function\n反例：do_thing(action,x,y,z)"],
];
principles.forEach((p, i) => {
  card(s, 0.5 + i * 3.1, 1.1, 2.9, 2.8, p[0], p[1], p[2]);
});
s.addShape("roundRect", { x: 0.5, y: 4.1, w: 9, h: 0.8, fill: { color: C.soft }, rectRadius: 0.08 });
s.addText("心智模型：function 的 schema = 給 LLM 看的 API 合約。寫清楚，LLM 就填對；寫含糊，它就猜（而且常猜錯）。", { x: 0.7, y: 4.18, w: 8.6, h: 0.65, fontFace: FONT_BODY, fontSize: 12, color: C.navy, bold: true, margin: 0, valign: "middle", lineSpacingMultiple: 1.2 });
footer(s, "required 標清必填、enum 收斂選擇");

// S4 本地執行
s = contentSlide(pptx, "本地執行 + 結果回吐", { page: "4" });
s.addShape("roundRect", { x: 0.5, y: 1.0, w: 9, h: 3.2, fill: { color: "1E293B" }, rectRadius: 0.08 });
s.addText(
  "def run_loop(client, user_text, tools, tool_fn):\n" +
  "    messages = [{\"role\":\"user\",\"content\":user_text}]\n" +
  "    for _ in range(3):          # 最多 3 輪（防死循環）\n" +
  "        r = client.chat.completions.create(\n" +
  '            model="gpt-4.1-mini",\n' +
  "            messages=messages, tools=tools)\n" +
  "        msg = r.choices[0].message\n" +
  "        if msg.tool_calls:\n" +
  "            for tc in msg.tool_calls:\n" +
  "                fn  = tool_fn[tc.function.name]\n" +
  "                arg = json.loads(tc.function.arguments)\n" +
  "                res = fn(**arg)          # 你的 code 執行\n" +
  "                messages.append(msg.model_dump())\n" +
  "                messages.append({\"role\":\"tool\",\n" +
  '                    "tool_call_id":tc.id,\n' +
  "                    \"content\":json.dumps(res)})\n" +
  "        else:\n" +
  "            return msg.content     # 最終答案\n" +
  "    return \"（超步數，停止）\"",
  { x: 0.8, y: 1.1, w: 8.4, h: 3.0, fontFace: "Courier New", fontSize: 9.5, color: "E2E8F0", margin: 0, valign: "top", lineSpacingMultiple: 1.08 });
s.addShape("roundRect", { x: 0.5, y: 4.4, w: 9, h: 0.5, fill: { color: C.soft }, rectRadius: 0.08 });
s.addText("tool_calls = LLM 舉手說「我要用 X 工具」；role=tool = 你把結果放回去。一問一答才是閉環。", { x: 0.7, y: 4.44, w: 8.6, h: 0.42, fontFace: FONT_BODY, fontSize: 11.5, color: C.navy, bold: true, margin: 0, valign: "middle" });
footer(s, "執行權在你 = 能上生產");

// S5 錯誤處理
s = contentSlide(pptx, "錯誤處理（生產必備）", { page: "5" });
const eh = [
  [C.brand, "參數不合 schema", "json.loads 失敗 → 回 LLM「參數錯誤：…」讓它修正（別 crash）"],
  [C.accent, "工具執行丟異常", "catch → 回 {error:...} 讓 LLM 知道失敗、改走別路"],
  [C.brand, "重複呼叫（死循環）", "設最大步數 + 成本閘門（C4 正式處理）"],
  [C.accent, "參數值不合法", "回明確錯誤訊息，讓 LLM 換參數或告知使用者"],
];
eh.forEach((e, i) => {
  const col = i % 2, row = Math.floor(i / 2);
  card(s, 0.5 + col * 4.6, 1.1 + row * 1.6, 4.4, 1.4, e[0], e[1], e[2]);
});
s.addShape("roundRect", { x: 0.5, y: 4.4, w: 9, h: 0.6, fill: { color: C.soft }, rectRadius: 0.08 });
s.addText("像寫分散式系統一樣：假設對方會錯，把錯誤結構化回傳給 LLM 決策，而非讓程式直接掛。", { x: 0.7, y: 4.46, w: 8.6, h: 0.5, fontFace: FONT_BODY, fontSize: 11.5, color: C.navy, bold: true, margin: 0, valign: "middle" });
footer(s, "Tool 呼叫是跨系統協作，任何一端都可能失敗");

// S6 vs JSON mode
s = contentSlide(pptx, "Tool vs JSON mode（C1）分界", { page: "6" });
const compare = [
  ["維度", "JSON mode（C1）", "Function calling（C3）"],
  ["LLM 做什麼", "吐資料（結構化結果）", "吐指令（要執行什麼）"],
  ["是否執行", "不執行（你解析結果）", "你的 code 執行後回吐"],
  ["典型用途", "抽取/分類/格式化", "查 DB/發 API/算數/跑流程"],
  ["schema 定義", "輸出長什麼樣", "能做什麼、參數是啥"],
];
let cy = 1.05;
compare.forEach((row, ri) => {
  const widths = [1.5, 3.7, 3.8];
  let cx = 0.5;
  row.forEach((cell, ci) => {
    const fillc = ri === 0 ? C.navy : (ri % 2 ? C.card : C.white);
    s.addShape("rect", { x: cx, y: cy, w: widths[ci], h: 0.55, fill: { color: fillc }, line: { color: C.line, width: 0.5 } });
    s.addText(cell, { x: cx + 0.08, y: cy, w: widths[ci] - 0.16, h: 0.55, fontFace: FONT_BODY, fontSize: 11, color: ri === 0 ? C.white : (ci === 0 ? C.accent : C.body), bold: ri === 0 || ci === 0, margin: 0, valign: "middle" });
    cx += widths[ci];
  });
  cy += 0.55;
});
s.addShape("roundRect", { x: 0.5, y: 3.9, w: 9, h: 0.7, fill: { color: C.soft }, rectRadius: 0.08 });
s.addText("JSON mode 是「產出」；Tool 是「動作」。Tool 是「會動手」的升級版。", { x: 0.7, y: 3.98, w: 8.6, h: 0.55, fontFace: FONT_BODY, fontSize: 12, color: C.navy, bold: true, margin: 0, valign: "middle" });
footer(s, "C1 鎖輸出格式，C3 鎖「做什麼、怎么做」");

// S7 Lab
s = contentSlide(pptx, "C3 Lab 實作", { page: "7" });
bullets(s, 0.6, 1.2, 8.8, 3.0, [
  "定義 1–2 個 function（get_weather / calculator），寫好 schema",
  "LLM 吐 tool_calls → 本地執行 → role=tool 回吐 → 最終答案",
  "故意讓一個工具拋錯，驗證 LLM 收到 error 後不崩、能改走別路",
  "描述每個 function 的 description 給 LLM 看",
], { size: 13.5, gap: 8 });
s.addShape("roundRect", { x: 0.5, y: 4.3, w: 9, h: 0.6, fill: { color: C.soft }, rectRadius: 0.08 });
s.addText("證據：function-call JSON 截圖 + 本地執行 log（含一次錯誤處理）→ 回 mail 勾卡", { x: 0.7, y: 4.36, w: 8.6, h: 0.5, fontFace: FONT_BODY, fontSize: 12.5, color: C.navy, bold: true, margin: 0, valign: "middle" });
footer(s, "回信即勾卡");

// S8 收尾
s = darkSlide(pptx, { kicker: "Class 3 · 完成", title: "下一步：Agent 多步推理", titleSize: 36 });
s.addText("Tool 讓 LLM 能「做一次」了。C4 讓它「做一串」——ReAct + 停止條件 + 錯誤重試。", { x: 0.6, y: 3.2, w: 8.6, h: 0.6, fontFace: FONT_BODY, fontSize: 14, color: C.ice, margin: 0, lineSpacingMultiple: 1.3 });
s.addNotes("Wrap up C3, hand-off to C4.");

pptx.writeFile({ fileName: "/tmp/opencode/aitoolchain-slides/class-03-tool-calling.pptx" }).then(() => console.log("class-03 done"));
