const pptxgen = require("/tmp/opencode/deckbuild/node_modules/pptxgenjs");
const D = require("./.design.cjs");
const { C, FONT_HEAD, FONT_BODY, W, H, darkSlide, contentSlide, card, bullets, footer } = D;

const pptx = new pptxgen();
pptx.layout = "LAYOUT_16x9";
pptx.author = "AI_assist";
pptx.title = "Class 0 - AI 工具選型與帳號準備";

// S1 封面
let s = darkSlide(pptx, { kicker: "AI 工具鏈訓練", title: "Class 0", titleSize: 60 });
s.addShape("roundRect", { x: 0.6, y: 4.0, w: 6.0, h: 0.55, fill: { color: C.brand }, rectRadius: 0.1 });
s.addText("AI 工具選型與帳號準備", { x: 0.6, y: 4.0, w: 6.0, h: 0.55, fontFace: FONT_BODY, fontSize: 16, color: C.white, bold: true, align: "center", margin: 0 });
s.addText("1 hr ｜ 選型三軸 / Key 管理 / Smoke test / 成本估算", { x: 0.6, y: 4.7, w: 8.8, h: 0.4, fontFace: FONT_BODY, fontSize: 13, color: C.ice, margin: 0 });
s.addNotes("C0: 選型、key管理、smoke test");

// S2 這堂要解決什麼
s = contentSlide(pptx, "這堂要解決什麼", { page: "2" });
const pain = [
  [C.brand, "選錯工具", "選了貴/慢/上下文太短的模型 → 後期全部重做"],
  [C.accent, "Key 失控", "沒管好 API key → 泄露、超標、無法上線"],
  [C.brand, "成本爆表", "沒估成本 → 第一月帳單 US$300，嚇到專案被砍"],
];
pain.forEach((p, i) => {
  card(s, 0.5 + i * 3.1, 1.2, 2.9, 2.0, p[0], p[1], p[2]);
});
s.addShape("roundRect", { x: 0.5, y: 3.6, w: 9, h: 0.7, fill: { color: C.soft }, rectRadius: 0.08 });
s.addText("本卡目標：在你寫任何「AI 邏輯」之前，先把「地基」選對、管好、算清。", { x: 0.7, y: 3.68, w: 8.6, h: 0.55, fontFace: FONT_BODY, fontSize: 13, color: C.navy, bold: true, margin: 0, valign: "middle" });
footer(s, "驗收口：smoke test 跑通 + 選型理由 3 行 + 月度成本估算");

// S3 選型三軸
s = contentSlide(pptx, "選型三軸", { page: "3" });
const axes = [
  [C.brand, "成本 $/1K tokens", "直接決定帳單\nin 通常遠貴於 out 或反之"],
  [C.accent, "延遲 p50/p95", "chat <2s?  or 背景批處理 10s?"],
  [C.brand, "上下文長度", "128K vs 8K 差 16 倍\nRAG 場景關鍵"],
];
axes.forEach((a, i) => {
  card(s, 0.5 + i * 3.1, 1.1, 2.9, 2.2, a[0], a[1], a[2]);
});
s.addShape("roundRect", { x: 0.5, y: 3.6, w: 9, h: 1.2, fill: { color: C.soft }, rectRadius: 0.08 });
s.addText("心智模型", { x: 0.7, y: 3.68, w: 8.6, h: 0.3, fontFace: FONT_BODY, fontSize: 13, color: C.brand, bold: true, margin: 0 });
s.addText("選型 = 「花對的錢、在對的延遲內、給得下對長的上下文」。三軸常衝突（便宜=慢、快=短、長=貴）——用 workload 真實數字去裁，不要憑感覺。", { x: 0.7, y: 4.0, w: 8.6, h: 0.7, fontFace: FONT_BODY, fontSize: 11.5, color: C.body, margin: 0, lineSpacingMultiple: 1.25 });
footer(s, "沒有「最強模型」，只有「最合 workload」的模型");

// S4 主流 API 對照
s = contentSlide(pptx, "主流商用 LLM API 對照（2026）", { page: "4" });
const apis = [
  ["API", "主力模型", "上下文", "適用"],
  ["OpenAI", "gpt-4.1-mini / gpt-4.1", "128K", "通用、生態最全、課程主用"],
  ["Anthropic Claude", "sonnet / haiku", "200K", "長文、工具鏈穩定"],
  ["Azure OpenAI", "同 OpenAI", "128K", "需合規/內網"],
];
let ay = 1.05;
apis.forEach((row, ri) => {
  const fillc = ri === 0 ? C.navy : (ri % 2 ? C.card : C.white);
  const acc = ri === 0 ? C.white : C.navy;
  const widths = [1.8, 2.6, 1.2, 3.4];
  let ax = 0.5;
  row.forEach((cell, ci) => {
    s.addShape("rect", { x: ax, y: ay, w: widths[ci], h: 0.55, fill: { color: fillc }, line: { color: C.line, width: 0.5 } });
    s.addText(cell, { x: ax + 0.08, y: ay, w: widths[ci] - 0.16, h: 0.55, fontFace: FONT_BODY, fontSize: 11, color: ri === 0 ? C.white : (ci === 0 ? C.accent : C.body), bold: ri === 0 || ci === 0, margin: 0, valign: "middle" });
    ax += widths[ci];
  });
  ay += 0.55;
});
s.addShape("roundRect", { x: 0.5, y: 3.7, w: 9, h: 0.8, fill: { color: C.soft }, rectRadius: 0.08 });
s.addText("原則：本課程挑 1 個（以下範例用 OpenAI），不要一次接三家比較——留到 C5（評測）用回歸集系統比。", { x: 0.7, y: 3.78, w: 8.6, h: 0.65, fontFace: FONT_BODY, fontSize: 12, color: C.navy, bold: true, margin: 0, valign: "middle" });
footer(s, "前提：有 structured output + tool calling");

// S5 Key 管理
s = contentSlide(pptx, "API Key 管理的正確姿勢", { page: "5" });
card(s, 0.5, 1.2, 4.4, 2.8, C.brand, "三層保險（必做）",
  "1. key 永不進 code/git/log → 放環境變量 .env\n2. .env 加入 .gitignore + 建 .env.example\n3. 每專案/環境獨立 key，可單獨 revoke\n4. 設預算上限 (budget cap / alert)");
card(s, 5.1, 1.2, 4.4, 2.8, C.accent, "讀取範例",
  'import os\nfrom openai import OpenAI\n\nclient = OpenAI(\n  api_key=os.environ["OPENAI_API_KEY"]\n)\n\n# 缺環境變量直接報錯\n# 不讓空 key 混進去');
s.addShape("roundRect", { x: 0.5, y: 4.3, w: 9, h: 0.6, fill: { color: C.soft }, rectRadius: 0.08 });
s.addText("心智模型：key = 信用卡 + CVV 一起丟桌上 = 事故。環境變量 + .gitignore + 預算上限 = 三層保險，缺一層都可能漏錢。", { x: 0.7, y: 4.36, w: 8.6, h: 0.5, fontFace: FONT_BODY, fontSize: 11.5, color: C.navy, bold: true, margin: 0, valign: "middle" });
footer(s, "key 管理是上線第一道安全門");

// S6 Smoke test
s = contentSlide(pptx, "Smoke test（本卡核心交付）", { page: "6" });
s.addShape("roundRect", { x: 0.5, y: 1.1, w: 9, h: 2.8, fill: { color: "1E293B" }, rectRadius: 0.08 });
const code = [
  "import os, time",
  'import dotenv from "python-dotenv"',
  "dotenv.load_dotenv()",
  "",
  'client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])',
  "t0 = time.perf_counter()",
  "r = client.chat.completions.create(",
  '    model="gpt-4.1-mini",',
  '    messages=[{"role":"user","content":"用一句話說明什麼是 RAG。"}],',
  ")",
  "dt = time.perf_counter() - t0",
  "print(r.choices[0].message.content)",
  'print(f"tokens={r.usage.total_tokens} latency={dt:.2f}s")',
].join("\n");
s.addText(code, { x: 0.8, y: 1.2, w: 8.4, h: 2.6, fontFace: "Courier New", fontSize: 10.5, color: "E2E8F0", margin: 0, valign: "top", lineSpacingMultiple: 1.15 });
bullets(s, 0.6, 4.1, 8.8, 0.9, [
  "跑通 = C0 證據：截圖/貼輸出（含 model/tokens/latency）",
], { size: 12 });
footer(s, "一個 call，回一個字，抓 tokens/延遲");

// S7 失敗對照表
s = contentSlide(pptx, "Smoke test 失敗對照表", { page: "7" });
const errs = [
  ["症狀", "最可能原因", "解法"],
  ["AuthenticationError 401", "key 錯/沒讀到環境變量", "檢查 .env、load_dotenv()"],
  ["RateLimitError 429", "超速率/未啟用", "等 60s 重試；查額度"],
  ["超時", "網路/region", "換 region；開 proxy"],
  ["model not found 404", "模型名寫錯", "查 provider 模型清單"],
];
let ey = 1.05;
errs.forEach((row, ri) => {
  const widths = [2.2, 3.2, 3.6];
  let ex = 0.5;
  row.forEach((cell, ci) => {
    const fillc = ri === 0 ? C.navy : (ri % 2 ? C.card : C.white);
    s.addShape("rect", { x: ex, y: ey, w: widths[ci], h: 0.55, fill: { color: fillc }, line: { color: C.line, width: 0.5 } });
    s.addText(cell, { x: ex + 0.08, y: ey, w: widths[ci] - 0.16, h: 0.55, fontFace: FONT_BODY, fontSize: 11, color: ri === 0 ? C.white : (ci === 0 ? C.brand : C.body), bold: ri === 0 || ci === 0, margin: 0, valign: "middle" });
    ex += widths[ci];
  });
  ey += 0.55;
});
footer(s, "排錯用：先看 error code 對應哪一列");

// S8 成本估算
s = contentSlide(pptx, "成本估算法（必會）", { page: "8" });
card(s, 0.5, 1.1, 4.4, 2.0, C.brand, "公式", "月成本 = 月請求數 × (avg in × in 單價 + avg out × out 單價)\n\n例：5 萬次/月 × (800×$0.4/M + 200×$0.8/M) ≈ US$24");
card(s, 5.1, 1.1, 4.4, 2.0, C.accent, "控量 > 控價", "最大變數是「量」——用快/小模型跑熱路徑（90%），貴模型只跑難題。降 in token（RAG 切塊調小）比降模型級別更划算。");
s.addShape("roundRect", { x: 0.5, y: 3.4, w: 9, h: 1.0, fill: { color: C.soft }, rectRadius: 0.08 });
s.addText("心智模型", { x: 0.7, y: 3.48, w: 8.6, h: 0.3, fontFace: FONT_BODY, fontSize: 13, color: C.brand, bold: true, margin: 0 });
s.addText("成本是乘出來的（token × 量 × 價），不是「選個便宜模型」就完事。先估、再選；預算超限時，控量比控價有效。", { x: 0.7, y: 3.8, w: 8.6, h: 0.55, fontFace: FONT_BODY, fontSize: 11.5, color: C.body, margin: 0, lineSpacingMultiple: 1.2 });
footer(s, "C5 評測會再用到這個公式");

// S9 避坑
s = contentSlide(pptx, "常見選型錯誤（避坑）", { page: "9" });
const mistakes = [
  "只看單價，忽略延遲/上下文/結構化輸出 → 後期重做",
  "熱路徑都用最貴模型 → 成本爆炸（該用 mini 跑 90%）",
  "RAG 塞整份長文件進 prompt → token 爆（該切塊+檢索）",
  "key 沒 budget cap → 死循環刷到破產",
  "一次接多家 API → 維護成本遠大於收益",
];
let my = 1.15;
mistakes.forEach((m, i) => {
  s.addShape("ellipse", { x: 0.6, y: my + 0.12, w: 0.28, h: 0.28, fill: { color: i < 3 ? C.brand : C.accent } });
  s.addText(String(i + 1), { x: 0.6, y: my + 0.12, w: 0.28, h: 0.28, fontFace: FONT_BODY, fontSize: 11, color: C.white, bold: true, align: "center", valign: "middle", margin: 0 });
  s.addText(m, { x: 1.05, y: my, w: 8.3, h: 0.55, fontFace: FONT_BODY, fontSize: 12.5, color: C.body, margin: 0, valign: "middle" });
  my += 0.62;
});
footer(s, "避坑清單：每一條都省錢");

// S10 Lab
s = contentSlide(pptx, "C0 Lab 實作", { page: "10" });
bullets(s, 0.6, 1.2, 8.8, 3.0, [
  "建 ai-toolchain-lab/ + .env / .env.example / .gitignore",
  "安裝 SDK（openai + chromadb + python-dotenv）",
  "跑 smoke test（§6 範例）",
  "寫 3 行選型理由（成本/延遲/上下文各一）",
  "算月度成本估算（§8 公式）",
], { size: 14, gap: 8 });
s.addShape("roundRect", { x: 0.5, y: 4.3, w: 9, h: 0.6, fill: { color: C.soft }, rectRadius: 0.08 });
s.addText("證據：smoke test 輸出截圖 + 選型理由 3 行 → 回 mail 即可勾卡", { x: 0.7, y: 4.36, w: 8.6, h: 0.5, fontFace: FONT_BODY, fontSize: 12.5, color: C.navy, bold: true, margin: 0, valign: "middle" });
footer(s, "回信即勾卡，無需等批");

// S11 收尾
s = darkSlide(pptx, { kicker: "Class 0 · 完成", title: "下一步：Prompt 工程", titleSize: 36 });
s.addText("地基打好了——選型對了、key 管好了、成本算清了。", { x: 0.6, y: 3.0, w: 8.6, h: 0.5, fontFace: FONT_BODY, fontSize: 14, color: C.ice, margin: 0 });
s.addText("C1 把 LLM 從「能跑」鎖成「可控輸出」——JSON mode / structured outputs / temperature。", { x: 0.6, y: 3.6, w: 8.6, h: 0.5, fontFace: FONT_BODY, fontSize: 13, color: C.ice, margin: 0 });
s.addNotes("Wrap up C0, hand-off to C1.");

pptx.writeFile({ fileName: "/tmp/opencode/aitoolchain-slides/class-00-ai-tool-selection.pptx" }).then(() => console.log("class-00 done"));
