const pptxgen = require("/tmp/opencode/deckbuild/node_modules/pptxgenjs");
const D = require("./.design.cjs");
const { C, FONT_HEAD, FONT_BODY, W, H, darkSlide, contentSlide, card, bullets, footer } = D;

const pptx = new pptxgen();
pptx.layout = "LAYOUT_16x9";
pptx.author = "AI_assist";
pptx.title = "Class 4 - Agent 與多步推理";

let s = darkSlide(pptx, { kicker: "AI 工具鏈訓練", title: "Class 4", titleSize: 60 });
s.addShape("roundRect", { x: 0.6, y: 4.0, w: 7.0, h: 0.55, fill: { color: C.brand }, rectRadius: 0.1 });
s.addText("Agent 與多步推理（ReAct）", { x: 0.6, y: 4.0, w: 7.0, h: 0.55, fontFace: FONT_BODY, fontSize: 16, color: C.white, bold: true, align: "center", margin: 0 });
s.addText("1 hr ｜ ReAct 迴路 / 停止條件 / 錯誤重試 / 成本閘門", { x: 0.6, y: 4.7, w: 8.8, h: 0.4, fontFace: FONT_BODY, fontSize: 13, color: C.ice, margin: 0 });
s.addNotes("C4: Agent, ReAct, bounded loop");

// S2 ReAct
s = contentSlide(pptx, "ReAct 迴路", { page: "2" });
const react = [
  ["Thought", "我現在該幹嘛 / 為何選這個工具"],
  ["Action", "呼叫哪個工具、參數是啥（= C3 function call）"],
  ["Observation", "工具回傳的結果"],
  ["Final Answer", "達成目標 → 給使用者最終回應"],
];
let ry = 1.0;
react.forEach((r, i) => {
  s.addShape("roundRect", { x: 0.5, y: ry, w: 2.2, h: 0.55, fill: { color: i === 3 ? C.brand : C.accent }, rectRadius: 0.08 });
  s.addText(r[0], { x: 0.7, y: ry, w: 1.8, h: 0.55, fontFace: FONT_BODY, fontSize: 12, color: C.white, bold: true, valign: "middle", margin: 0 });
  s.addText(r[1], { x: 3.0, y: ry, w: 6.3, h: 0.55, fontFace: FONT_BODY, fontSize: 12, color: C.body, valign: "middle", margin: 0 });
  if (i < react.length - 1) s.addText("▼", { x: 1.4, y: ry + 0.5, w: 0.4, h: 0.3, fontFace: FONT_BODY, fontSize: 12, color: C.brand, align: "center", margin: 0 });
  ry += 0.82;
});
s.addShape("roundRect", { x: 0.5, y: 4.4, w: 9, h: 0.6, fill: { color: C.soft }, rectRadius: 0.08 });
s.addText("ReAct = 「想一步、做一步、看結果、再想下一步」，像工程師除錯：假設 → 實驗 → 觀察 → 修正。", { x: 0.7, y: 4.46, w: 8.6, h: 0.5, fontFace: FONT_BODY, fontSize: 11.5, color: C.navy, bold: true, margin: 0, valign: "middle" });
footer(s, "「把步驟寫死」= workflow；「動態决定下一步」= Agent");

// S3 例
s = contentSlide(pptx, "例：訂機票 Agent", { page: "3" });
const ex = [
  ["步", "Thought", "Action", "Observation"],
  ["1", "要先查有哪些航班", "search_flights(tpe→tokyo, 10-20)", "3 個航班"],
  ["2", "挑最便宜的", "get_price(flight_2)", "NT$12,000"],
  ["3", "確認有沒有座位", "check_seat(flight_2)", "有 4 席"],
  ["4", "達成目標 → 停止", "（無）", "最終答案"],
];
let ey = 1.05;
ex.forEach((row, ri) => {
  const widths = [0.5, 2.5, 3.5, 2.5];
  let ex2 = 0.5;
  row.forEach((cell, ci) => {
    const fillc = ri === 0 ? C.navy : (ri % 2 ? C.card : C.white);
    s.addShape("rect", { x: ex2, y: ey, w: widths[ci], h: 0.55, fill: { color: fillc }, line: { color: C.line, width: 0.5 } });
    s.addText(cell, { x: ex2 + 0.06, y: ey, w: widths[ci] - 0.12, h: 0.55, fontFace: FONT_BODY, fontSize: 10.5, color: ri === 0 ? C.white : (ci === 0 ? C.brand : (ci === 2 ? C.accent : C.body)), bold: ri === 0 || ci === 0, margin: 0, valign: "middle" });
    ex2 += widths[ci];
  });
  ey += 0.55;
});
footer(s, "每一步都是「看結果 → 決定下一步」，不是一次寫死");

// S4 三大約束
s = contentSlide(pptx, "三大約束（Agent 不失控的關鍵）", { page: "4" });
card(s, 0.5, 1.1, 4.4, 2.3, C.brand, "停止條件",
  "目標達成 → final answer\n最大步數（如 8）= 硬閾值\n成本閘門（budget cap）\n無進展偵測（N 步無變化）");
card(s, 5.1, 1.1, 4.4, 2.3, C.accent, "錯誤重試",
  "工具回 error → LLM 自行決定\n換參數 / 換工具 / 換路 / 回報\n重試上限（3 次）+ 指數退避\n改變策略而非重打同一發");
card(s, 0.5, 3.6, 4.4, 1.5, C.accent, "狀態管理",
  "記住前幾步 Observation\n長任務摘要歷史（省 token）\n保留必要事實 + 目標");
card(s, 5.1, 3.6, 4.4, 1.5, C.brand, "缺一個就翻車",
  "缺停止 → 刷爆成本\n缺重試 → 一錯全掛\n缺記憶 → 重複做同一件事");
footer(s, "會做事 + 知道何时收手 + 出錯會調整 = 能上生產的 Agent");

// S5 決策品質
s = contentSlide(pptx, "工具選擇與決策品質", { page: "5" });
card(s, 0.5, 1.1, 4.4, 2.5, C.accent, "決策品質差",
  "每步都亂抓一個工具\n忽略 Observation、重複同工具\n一次只推一步（人肉 driver）\n目標模糊就開跑");
card(s, 5.1, 1.1, 4.4, 2.5, C.brand, "決策品質好",
  "先想「這步目標」再選工具\n讀 Observation 調整下一步\n合理拆步驟（不貪多、不少步）\n先拆解目標成可驗證子步");
s.addShape("roundRect", { x: 0.5, y: 3.8, w: 9, h: 1.2, fill: { color: C.soft }, rectRadius: 0.08 });
s.addText("技巧", { x: 0.7, y: 3.88, w: 8.6, h: 0.28, fontFace: FONT_BODY, fontSize: 13, color: C.brand, bold: true, margin: 0 });
s.addText("1. 讓 LLM 先規劃（列 3–5 步計畫）→ 再逐步執行（planning-then-acting）\n2. 每個工具的 description 寫好 = 給 LLM 選路的說明書\n3. 限制每步只允許相關的子工具集（縮小選擇空間）", { x: 0.7, y: 4.18, w: 8.6, h: 0.75, fontFace: FONT_BODY, fontSize: 11, color: C.body, margin: 0, lineSpacingMultiple: 1.2 });
footer(s, "Agent 的聰明在「目標拆解 + 工具選擇 + 讀 Observation」三件事的品質");

// S6 失控案例
s = contentSlide(pptx, "Agent 失控案例（避坑）", { page: "6" });
const failures = [
  ["死循環", "反覆呼叫同一工具、Observation 無變化\n→ 沒設 max steps / 無進展偵測"],
  ["成本爆炸", "沒 budget cap\n→ 一次死循環刷到 US$500+"],
  ["誤操作", "讓 LLM 直接「執行」高風險 action\n→ 要人審高風險動作（C6）"],
  ["無限思考", "thought 越寫越長、不產出 action\n→ 限制每步長度 / 強制要 action"],
  ["忽略 Observation", "工具回錯但它沒讀\n→ prompt 要求「先讀再決策」"],
];
let my = 1.05;
failures.forEach((m) => {
  s.addShape("roundRect", { x: 0.5, y: my, w: 2.2, h: 0.55, fill: { color: C.brand }, rectRadius: 0.06 });
  s.addText(m[0], { x: 0.65, y: my, w: 1.9, h: 0.55, fontFace: FONT_BODY, fontSize: 11.5, color: C.white, bold: true, valign: "middle", margin: 0 });
  s.addText(m[1], { x: 2.9, y: my, w: 6.5, h: 0.55, fontFace: FONT_BODY, fontSize: 11, color: C.body, valign: "middle", margin: 0 });
  my += 0.63;
});
footer(s, "失控三宗罪：不知手 + 不怕錯 + 不記事 → 修法是「加約束」不是「換更大模型」");

// S7 vs Workflow
s = contentSlide(pptx, "Agent vs Workflow", { page: "7" });
const aw = [
  ["", "Workflow（固定流程）", "Agent（動態決策）"],
  ["步驟", "預先寫死 A→B→C", "LLM 動態決定下一步"],
  ["適用", "流程穩定、已知", "任務多變、需判斷"],
  ["成本/控制", "便宜、可預測", "貴、需約束"],
  ["建議", "能寫死就寫死", "只在「必須」讓 LLM 決策處用"],
];
let wy = 1.05;
aw.forEach((row, ri) => {
  const widths = [1.2, 3.9, 3.9];
  let wx = 0.5;
  row.forEach((cell, ci) => {
    const fillc = ri === 0 ? C.navy : (ri % 2 ? C.card : C.white);
    s.addShape("rect", { x: wx, y: wy, w: widths[ci], h: 0.55, fill: { color: fillc }, line: { color: C.line, width: 0.5 } });
    s.addText(cell, { x: wx + 0.08, y: wy, w: widths[ci] - 0.16, h: 0.55, fontFace: FONT_BODY, fontSize: 11, color: ri === 0 ? C.white : (ci === 0 ? C.accent : C.body), bold: ri === 0 || ci === 0, margin: 0, valign: "middle" });
    wx += widths[ci];
  });
  wy += 0.55;
});
s.addShape("roundRect", { x: 0.5, y: 4.0, w: 9, h: 0.7, fill: { color: C.soft }, rectRadius: 0.08 });
s.addText("Workflow 是「鐵軌」，Agent 是「自駕」。多數生產應用 = 鐵軌為主、自駕為輔——把不确定的環節才交給 Agent。", { x: 0.7, y: 4.08, w: 8.6, h: 0.55, fontFace: FONT_BODY, fontSize: 11.5, color: C.navy, bold: true, margin: 0, valign: "middle", lineSpacingMultiple: 1.2 });
footer(s, "不要把整個系統都做成自駕");

// S8 Lab
s = contentSlide(pptx, "C4 Lab 實作", { page: "8" });
bullets(s, 0.6, 1.2, 8.8, 3.2, [
  "寫 ReAct 迴路（Thought→Action→Observation），3+ 步完成多步任務",
  "加入最大步數（如 8）+ 成本/步數記錄",
  "故意讓某工具失敗，驗證 Agent 重試或換路（非直接 crash）",
  "驗證「會在正確時機停」（目標達成 / 觸上限）",
], { size: 13.5, gap: 8 });
s.addShape("roundRect", { x: 0.5, y: 4.3, w: 9, h: 0.6, fill: { color: C.soft }, rectRadius: 0.08 });
s.addText("證據：完整 3+ 步 ReAct trace log（含 1 次錯誤重試 + 1 次停止判定）→ 回 mail 勾卡", { x: 0.7, y: 4.36, w: 8.6, h: 0.5, fontFace: FONT_BODY, fontSize: 12.5, color: C.navy, bold: true, margin: 0, valign: "middle" });
footer(s, "回信即勾卡");

// S9 收尾
s = darkSlide(pptx, { kicker: "Class 4 · 完成", title: "下一步：評測與監控", titleSize: 36 });
s.addText("Agent 能跑了——但「能跑」≠「好用」，更≠「改一改就知道好還是壞」。", { x: 0.6, y: 3.0, w: 8.6, h: 0.5, fontFace: FONT_BODY, fontSize: 14, color: C.ice, margin: 0 });
s.addText("C5 引入評測（回歸集 + 三軸分數）+ 線上監控。", { x: 0.6, y: 3.6, w: 8.6, h: 0.5, fontFace: FONT_BODY, fontSize: 13, color: C.ice, margin: 0 });
s.addNotes("Wrap up C4, hand-off to C5.");

pptx.writeFile({ fileName: "/tmp/opencode/aitoolchain-slides/class-04-agent-react.pptx" }).then(() => console.log("class-04 done"));
