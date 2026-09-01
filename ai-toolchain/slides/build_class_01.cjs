const pptxgen = require("/tmp/opencode/deckbuild/node_modules/pptxgenjs");
const D = require("./.design.cjs");
const { C, FONT_HEAD, FONT_BODY, W, H, darkSlide, contentSlide, card, bullets, footer } = D;

const pptx = new pptxgen();
pptx.layout = "LAYOUT_16x9";
pptx.author = "AI_assist";
pptx.title = "Class 1 - Prompt 工程與 API 呼叫";

let s = darkSlide(pptx, { kicker: "AI 工具鏈訓練", title: "Class 1", titleSize: 60 });
s.addShape("roundRect", { x: 0.6, y: 4.0, w: 6.8, h: 0.55, fill: { color: C.brand }, rectRadius: 0.1 });
s.addText("Prompt 工程與 API 呼叫", { x: 0.6, y: 4.0, w: 6.8, h: 0.55, fontFace: FONT_BODY, fontSize: 16, color: C.white, bold: true, align: "center", margin: 0 });
s.addText("1 hr ｜ 三角色 / 參數 / JSON mode / structured outputs", { x: 0.6, y: 4.7, w: 8.8, h: 0.4, fontFace: FONT_BODY, fontSize: 13, color: C.ice, margin: 0 });
s.addNotes("C1: prompt engineering, JSON mode, structured outputs");

// S2 角色
s = contentSlide(pptx, "Prompt 的三個角色", { page: "2" });
const roles = [
  [C.brand, "system", "開發者寫\n設定人設/規則/輸出格式\n最優先、跨多輪恒定"],
  [C.accent, "user", "使用者寫\n本次實際問題/輸入\n每次請求的內容主體"],
  [C.brand, "assistant", "LLM（可預填）\n之前的回答/few-shot\n影響接下來怎麼走"],
];
roles.forEach((r, i) => {
  card(s, 0.5 + i * 3.1, 1.1, 2.9, 2.4, r[0], r[1], r[2]);
});
s.addShape("roundRect", { x: 0.5, y: 3.7, w: 9, h: 1.0, fill: { color: C.soft }, rectRadius: 0.08 });
s.addText("心智模型：system = 員工手冊（長期）；user = 今天的工單；assistant = 前幾單紀錄。格式約束放 system，具體問題放 user——混在一起是新手最大 bug。", { x: 0.7, y: 3.78, w: 8.6, h: 0.85, fontFace: FONT_BODY, fontSize: 12, color: C.navy, bold: true, margin: 0, valign: "middle", lineSpacingMultiple: 1.2 });
footer(s, "API 本身無狀態——每次都要把歷史一起塞回去");

// S3 參數
s = contentSlide(pptx, "參數：temperature / max_tokens / top_p", { page: "3" });
const params = [
  ["參數", "作用", "結構化/抽取建議"],
  ["temperature", "隨機性（0=最確定）", "0 或 0.2"],
  ["max_tokens", "上限產出 token", "給足夠但別濫給"],
  ["top_p", "核採樣截斷", "一般不用動"],
];
let py = 1.05;
params.forEach((row, ri) => {
  const widths = [1.8, 3.4, 3.8];
  let px = 0.5;
  row.forEach((cell, ci) => {
    const fillc = ri === 0 ? C.navy : (ri % 2 ? C.card : C.white);
    s.addShape("rect", { x: px, y: py, w: widths[ci], h: 0.55, fill: { color: fillc }, line: { color: C.line, width: 0.5 } });
    s.addText(cell, { x: px + 0.08, y: py, w: widths[ci] - 0.16, h: 0.55, fontFace: FONT_BODY, fontSize: 11.5, color: ri === 0 ? C.white : (ci === 0 ? C.brand : C.body), bold: ri === 0 || ci === 0, margin: 0, valign: "middle" });
    px += widths[ci];
  });
  py += 0.55;
});
s.addShape("roundRect", { x: 0.5, y: 3.5, w: 9, h: 0.9, fill: { color: C.soft }, rectRadius: 0.08 });
s.addText("要「穩定可重現」的結構輸出 → temperature 壓到 0 級。確定性 > 創意。溫度調高只在要變化/多樣答案時才有意義（brainstorm）。", { x: 0.7, y: 3.58, w: 8.6, h: 0.75, fontFace: FONT_BODY, fontSize: 12, color: C.navy, bold: true, margin: 0, valign: "middle", lineSpacingMultiple: 1.2 });
footer(s, "結構化 task：確定性優於創意");

// S4 結構化輸出三級
s = contentSlide(pptx, "結構化輸出：三級由弱到強", { page: "4" });
const levels = [
  [C.brand, "級 1：prompt + json.loads", "中", "prompt 說明「回 JSON」\n自己 parse，失敗重試\n舊 API / 跨平台"],
  [C.accent, "級 2：JSON mode", "高", 'response_format={"type":"json_object"}\n模型保證吐合法 JSON\nOpenAI 等支援'],
  [C.brand, "級 3：structured outputs", "最高", "帶 JSON Schema 強約束\n嚴肅生產（本課目標）"],
];
levels.forEach((l, i) => {
  card(s, 0.5 + i * 3.1, 1.1, 2.9, 2.8, l[0], l[1] + "（穩定：" + l[2] + "）", l[3]);
});
s.addShape("roundRect", { x: 0.5, y: 4.1, w: 9, h: 0.8, fill: { color: C.soft }, rectRadius: 0.08 });
s.addText("心智模型：結構化輸出 = 把「輸出格式」從 prompt 的『請求』變成 API 的『保證』。LLM 只負責填值，格式由 schema 兜底——AI 應用能上生產的基礎。", { x: 0.7, y: 4.18, w: 8.6, h: 0.65, fontFace: FONT_BODY, fontSize: 11.5, color: C.navy, bold: true, margin: 0, valign: "middle", lineSpacingMultiple: 1.2 });
footer(s, "純 prompt 說「回 JSON」→ 偶爾夾帶文字 → json.loads 炸");

// S5 範例
s = contentSlide(pptx, "JSON mode 範例", { page: "5" });
s.addShape("roundRect", { x: 0.5, y: 1.0, w: 9, h: 3.3, fill: { color: "1E293B" }, rectRadius: 0.08 });
s.addText(
  "r = client.chat.completions.create(\n" +
  '    model="gpt-4.1-mini",\n' +
  "    temperature=0,\n" +
  '    response_format={"type": "json_object"},\n' +
  "    messages=[\n" +
  '      {"role":"system",\n       "content":"抽取訂單資訊，只回 JSON。"},\n' +
  '      {"role":"user",\n       "content":"我上週三訂了一箱 A4 紙，\n                 想改送到 5 號"},\n' +
  "    ],\n" +
  ")\n" +
  'data = json.loads(r.choices[0].message.content)\n' +
  '# {"product":"A4 紙","quantity":1,"change":"改送到5號"}',
  { x: 0.8, y: 1.1, w: 8.4, h: 3.1, fontFace: "Courier New", fontSize: 11, color: "E2E8F0", margin: 0, valign: "top", lineSpacingMultiple: 1.15 });
s.addShape("roundRect", { x: 0.5, y: 4.5, w: 9, h: 0.5, fill: { color: C.soft }, rectRadius: 0.08 });
s.addText("生產必加：失敗重試（retries=2），json.JSONDecodeError 時 raise/回傳讓呼叫方處理", { x: 0.7, y: 4.56, w: 8.6, h: 0.38, fontFace: FONT_BODY, fontSize: 11.5, color: C.navy, bold: true, margin: 0, valign: "middle" });
footer(s, "temperature=0 + JSON mode = 穩定結構輸出");

// S6 prompt = 合約
s = contentSlide(pptx, "心智模型：Prompt = 合約", { page: "6" });
card(s, 0.5, 1.1, 4.4, 2.2, C.brand, "輸入端（system）", "要什麼：角色、任務、邊界\n格式約束也放這");
card(s, 5.1, 1.1, 4.4, 2.2, C.accent, "輸出端（system + schema）", "要長什麼樣：schema、欄位、語義");
card(s, 0.5, 3.5, 4.4, 1.3, C.accent, "每次變的（user）", "具體資料——訂單文本、問題");
card(s, 5.1, 3.5, 4.4, 1.3, C.brand, "可測試", "同一輸入，多次輸出結構一致\n（C5 用回歸集驗證）");
footer(s, "C1 鎖「一個輸出穩定」；C5 鎖「一群輸出可比較、可回歸」");

// S7 常見錯誤
s = contentSlide(pptx, "常見 Prompt 錯誤", { page: "7" });
const cm = [
  "格式約束放 user（該放 system）→ 多輪後行為漂移",
  "temperature 調太高做抽取 → 同一句 3 次 3 個答案",
  "「請只回 JSON」卻沒 schema → 偶爾夾帶文字",
  "max_tokens 太小 → JSON 被截斷、json.loads 炸",
  "一次讓 LLM 做 5 件事 → 每件都半吊子（C4 拆步）",
  "把「解釋」當輸出 → 混進 JSON 裡",
];
let my = 1.1;
cm.forEach((m, i) => {
  s.addShape("ellipse", { x: 0.6, y: my + 0.08, w: 0.28, h: 0.28, fill: { color: C.brand } });
  s.addText(String(i + 1), { x: 0.6, y: my + 0.08, w: 0.28, h: 0.28, fontFace: FONT_BODY, fontSize: 11, color: C.white, bold: true, align: "center", valign: "middle", margin: 0 });
  s.addText(m, { x: 1.05, y: my, w: 8.3, h: 0.55, fontFace: FONT_BODY, fontSize: 12.5, color: C.body, margin: 0, valign: "middle" });
  my += 0.62;
});
footer(s, "六坑：前四條是格式漂移，後兩條是範圍失控");

// S8 Lab
s = contentSlide(pptx, "C1 Lab 實作", { page: "8" });
bullets(s, 0.6, 1.2, 8.8, 3.0, [
  "建「自然語言訂單 → 結構化 JSON」抽取器（system + user）",
  "開 JSON mode / schema，temperature=0",
  "同一句連跑 10 次，確認 10/10 合法 JSON、結構一致",
  "失敗重試邏輯（retries=2）",
], { size: 14, gap: 8 });
s.addShape("roundRect", { x: 0.5, y: 4.3, w: 9, h: 0.6, fill: { color: C.soft }, rectRadius: 0.08 });
s.addText("證據：10 次輸出 JSON 截圖 + system prompt 檔 → 回 mail 勾卡", { x: 0.7, y: 4.36, w: 8.6, h: 0.5, fontFace: FONT_BODY, fontSize: 12.5, color: C.navy, bold: true, margin: 0, valign: "middle" });
footer(s, "回信即勾卡");

// S9 收尾
s = darkSlide(pptx, { kicker: "Class 1 · 完成", title: "下一步：RAG 基礎", titleSize: 36 });
s.addText("LLM 鎖成「可控生成器」了——但它只有你餵給它的知識。", { x: 0.6, y: 3.0, w: 8.6, h: 0.5, fontFace: FONT_BODY, fontSize: 14, color: C.ice, margin: 0 });
s.addText("C2 引入 RAG（Retrieval-Augmented Generation）：檢索 + 生成，讓 LLM 能回答私域/最新問題。", { x: 0.6, y: 3.6, w: 8.6, h: 0.5, fontFace: FONT_BODY, fontSize: 13, color: C.ice, margin: 0 });
s.addNotes("Wrap up C1, hand-off to C2.");

pptx.writeFile({ fileName: "/tmp/opencode/aitoolchain-slides/class-01-prompt-engineering.pptx" }).then(() => console.log("class-01 done"));
