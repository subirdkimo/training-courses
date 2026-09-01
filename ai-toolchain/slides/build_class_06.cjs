const pptxgen = require("/tmp/opencode/deckbuild/node_modules/pptxgenjs");
const D = require("./.design.cjs");
const { C, FONT_HEAD, FONT_BODY, W, H, darkSlide, contentSlide, card, bullets, footer } = D;

const pptx = new pptxgen();
pptx.layout = "LAYOUT_16x9";
pptx.author = "AI_assist";
pptx.title = "Class 6 - 整合上線與結案";

let s = darkSlide(pptx, { kicker: "AI 工具鏈訓練", title: "Class 6", titleSize: 60 });
s.addShape("roundRect", { x: 0.6, y: 4.0, w: 6.5, h: 0.55, fill: { color: C.brand }, rectRadius: 0.1 });
s.addText("整合上線與結案", { x: 0.6, y: 4.0, w: 6.5, h: 0.55, fontFace: FONT_BODY, fontSize: 16, color: C.white, bold: true, align: "center", margin: 0 });
s.addText("1 hr ｜ 架構組裝 / API 層 / 降級 / 監控 / 交付報告", { x: 0.6, y: 4.7, w: 8.8, h: 0.4, fontFace: FONT_BODY, fontSize: 13, color: C.ice, margin: 0 });
s.addNotes("C6: integration, deployment, delivery report, closure");

// S2 全景
s = contentSlide(pptx, "端到端架構（C2–C5 組件拼在一起）", { page: "2" });
const blocks = [
  [C.navy, "使用者請求"],
  [C.accent, "API 層：解析/驗證 + auth（key）＋決定走哪條路"],
  [C.brand, "分流 → RAG（C2） / Tool（C3） / Agent（C4）"],
  [C.accent, "LLM 生成（C1 結構化/自然語言）"],
  [C.brand, "回應 + 埋點（成本/latency/錯誤）（C5）"],
];
let by = 0.95;
blocks.forEach((b, i) => {
  s.addShape("roundRect", { x: 0.8, y: by, w: 8.4, h: 0.6, fill: { color: b[0] }, rectRadius: 0.08, line: { color: C.line, width: 0.5 } });
  s.addText(b[1], { x: 1.0, y: by, w: 8.0, h: 0.6, fontFace: FONT_BODY, fontSize: 12.5, color: C.white, bold: i !== 0, valign: "middle", margin: 0 });
  by += 0.72;
});
s.addShape("roundRect", { x: 0.5, y: 4.6, w: 9, h: 0.5, fill: { color: C.soft }, rectRadius: 0.08 });
s.addText("整合的第一課 = 「分流」：90% 簡單請求導去最快最便宜的路徑，只有 10% 複雜的交給 Agent。", { x: 0.7, y: 4.64, w: 8.6, h: 0.42, fontFace: FONT_BODY, fontSize: 11, color: C.navy, bold: true, margin: 0, valign: "middle" });
footer(s, "成本與延遲靠分流降下來，不是靠換更強模型");

// S3 API 層
s = contentSlide(pptx, "API 層：讓別人能呼叫", { page: "3" });
card(s, 0.5, 1.1, 4.4, 2.4, C.brand, "輸入驗證", "Pydantic / schema 校驗\n非法輸入不進管道（別讓爛 input 打到 LLM）");
card(s, 5.1, 1.1, 4.4, 2.4, C.accent, "auth + 限流", "每個使用者/key 獨立計費\nrate limit 防刷");
card(s, 0.5, 3.7, 4.4, 1.4, C.accent, "錯誤映射", "內部異常 → 乾淨 4xx/5xx\n不洩密（key、stack trace）");
card(s, 5.1, 3.7, 4.4, 1.4, C.brand, "降級 fallback", "主路徑失敗 → 備路徑\n（見下一頁）");
footer(s, "API 層 4 件事：驗證 / auth / 錯誤 / 降級");

// S4 降級
s = contentSlide(pptx, "錯誤處理 + 降級（產品級硬化）", { page: "4" });
const dl = [
  [C.brand, "LLM 超時/5xx", "備用模型/provider failover；仍不行 → 回「系統繁忙」"],
  [C.accent, "成本超預算", "切更便宜模型跑簡單請求；擋高成本 Agent"],
  [C.brand, "RAG 向量庫掛", "退回「只靠 LLM + 告知無資料」，不硬答"],
  [C.accent, "Agent 超步數", "回已完成的 + 標註未完成（部分交付）"],
];
dl.forEach((d, i) => {
  const col = i % 2, row = Math.floor(i / 2);
  card(s, 0.5 + col * 4.6, 1.0 + row * 1.5, 4.4, 1.35, d[0], d[1], d[2]);
});
s.addShape("roundRect", { x: 0.5, y: 4.1, w: 9, h: 0.8, fill: { color: C.soft }, rectRadius: 0.08 });
s.addText("產品級 = 任何零件壞了，整體還能給「可接受」的結果。使用者寧要「慢一點的舊答案」，不要「白屏/報錯」。降級是設計出來的，不是出事了才想。", { x: 0.7, y: 4.18, w: 8.6, h: 0.65, fontFace: FONT_BODY, fontSize: 11.5, color: C.navy, bold: true, margin: 0, valign: "middle", lineSpacingMultiple: 1.2 });
footer(s, "Demo 可以 crash，產品要優雅降級");

// S5 日誌
s = contentSlide(pptx, "日誌與可觀測性（壞了誰知道）", { page: "5" });
card(s, 0.5, 1.1, 4.4, 2.6, C.brand, "結構化日誌（JSON）", "每筆請求帶 request_id\n走了哪條路 / tokens / latency / 成本");
card(s, 5.1, 1.1, 4.4, 2.6, C.accent, "trace", "Agent 多步每步\nThought/Action/Observation 都記\n出事能重放");
card(s, 0.5, 3.9, 4.4, 1.2, C.accent, "儀表板", "分數/成本/latency/錯誤率\n即時曲線（C5 指標視覺化）");
s.addShape("roundRect", { x: 5.1, y: 3.9, w: 4.4, h: 1.2, fill: { color: C.soft }, rectRadius: 0.08, line: { color: C.line } });
s.addText("日誌 = AI 應用的「行车記錄儀」。沒有它，線上問題只能「重現 + 猜」；有了它，能「重放 + 定位」。", { x: 5.3, y: 3.98, w: 4.0, h: 1.05, fontFace: FONT_BODY, fontSize: 10.5, color: C.navy, bold: true, margin: 0, valign: "middle", lineSpacingMultiple: 1.2 });
footer(s, "這是 demo 和產品最隱形但最關鍵的差距");

// S6 交付報告
s = contentSlide(pptx, "交付報告（1 頁，結案標準）", { page: "6" });
const rep = [
  [C.brand, "能做什麼", "一句話 + 3 個範例請求/回應"],
  [C.accent, "架構", "1 張圖（哪個請求走 RAG/Tool/Agent）"],
  [C.brand, "品質 + 成本", "C5 三軸分數 + 月預估成本 + 預算上限"],
  [C.accent, "可靠性", "降級策略 + 監控指標清單"],
  [C.brand, "怎麼用", "API endpoint + curl 範例 + key 從哪來"],
  [C.accent, "限制 + 下一步", "不支援什麼 + 擴量/加功能/改模型"],
];
rep.forEach((r, i) => {
  const col = i % 2, row = Math.floor(i / 2);
  card(s, 0.5 + col * 4.6, 1.0 + row * 1.35, 4.4, 1.2, r[0], r[1], r[2]);
});
s.addShape("roundRect", { x: 0.5, y: 4.3, w: 9, h: 0.6, fill: { color: C.soft }, rectRadius: 0.08 });
s.addText("交付報告 = 把工程決策變成別人能接手的文件。寫得出這 1 頁 = 你真的懂了（能答出「為什麼走這條路」）。", { x: 0.7, y: 4.36, w: 8.6, h: 0.5, fontFace: FONT_BODY, fontSize: 11, color: C.navy, bold: true, margin: 0, valign: "middle" });
footer(s, "不看課程的人也能理解並使用");

// S7 30 天驗收
s = contentSlide(pptx, "30 天獨立驗收基準（結案口）", { page: "7" });
bullets(s, 0.6, 1.2, 8.8, 3.0, [
  "課程結束後 30 天內，學員獨立完成一個新主題（非課程案例）",
  "選型 + prompt + RAG + Tool + Agent + 評測 + 上線全鏈",
  "交一份同結構的交付報告",
  "能答出：「為什麼這條路走 RAG、那條走 Agent？」（分流理由）",
], { size: 13.5, gap: 10 });
s.addShape("roundRect", { x: 0.5, y: 4.2, w: 9, h: 0.7, fill: { color: C.soft }, rectRadius: 0.08 });
s.addText("結案不是「把課程案例做起來」，而是「換個主題還能照做」。能遷移 = 內化方法；只照案例 = 背下來。驗收抓前者。", { x: 0.7, y: 4.26, w: 8.6, h: 0.58, fontFace: FONT_BODY, fontSize: 11.5, color: C.navy, bold: true, margin: 0, valign: "middle", lineSpacingMultiple: 1.2 });
footer(s, "內化了方法，才叫學會");

// S8 Lab
s = contentSlide(pptx, "C6 Lab 實作（＝結案交付）", { page: "8" });
bullets(s, 0.6, 1.2, 8.8, 3.2, [
  "把 C1–C5 組件組裝成 /ask API（含路由/分流）",
  "加 auth + 限流 + 錯誤映射 + ≥1 條降級路徑",
  "接 C5 埋點（成本/latency/錯誤率），跑出報表",
  "端到端跑真實請求，截 log（request_id + 走了哪條路）",
  "寫 1 頁交付報告（§6 結構）",
], { size: 13, gap: 7 });
s.addShape("roundRect", { x: 0.5, y: 4.3, w: 9, h: 0.6, fill: { color: C.soft }, rectRadius: 0.08 });
s.addText("證據：API 呼叫截圖 + 交付報告 + 一段完整 trace log → 回 mail 勾卡", { x: 0.7, y: 4.36, w: 8.6, h: 0.5, fontFace: FONT_BODY, fontSize: 12.5, color: C.navy, bold: true, margin: 0, valign: "middle" });
footer(s, "回信即勾卡");

// S9 結案
s = darkSlide(pptx, { kicker: "全 7 卡 done · 結案", title: "恭喜畢業", titleSize: 44 });
s.addText("你已具備「獨立搭建並交付生產級 AI 應用」的完整能力。", { x: 0.6, y: 3.0, w: 8.6, h: 0.5, fontFace: FONT_BODY, fontSize: 15, color: C.white, bold: true, margin: 0 });
s.addText("選型 → 提示 → RAG → Tool → Agent → 評測 → 上線\nai_assist 會寄結案彙總信（里程碑表 + 每卡證據清單）", { x: 0.6, y: 3.7, w: 8.6, h: 0.9, fontFace: FONT_BODY, fontSize: 13, color: C.ice, margin: 0, lineSpacingMultiple: 1.3 });
s.addNotes("Closure. All 7 cards done -> closure summary email.");

pptx.writeFile({ fileName: "/tmp/opencode/aitoolchain-slides/class-06-integration-deploy.pptx" }).then(() => console.log("class-06 done"));
