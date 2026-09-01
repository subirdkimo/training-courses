const pptxgen = require("/tmp/opencode/deckbuild/node_modules/pptxgenjs");
const D = require("./.design.cjs");
const { C, FONT_HEAD, FONT_BODY, W, H, darkSlide, contentSlide, card, bullets, footer } = D;

const pptx = new pptxgen();
pptx.layout = "LAYOUT_16x9";
pptx.author = "AI_assist";
pptx.title = "Class 5 - 評測與監控";

let s = darkSlide(pptx, { kicker: "AI 工具鏈訓練", title: "Class 5", titleSize: 60 });
s.addShape("roundRect", { x: 0.6, y: 4.0, w: 6.5, h: 0.55, fill: { color: C.brand }, rectRadius: 0.1 });
s.addText("評測與監控（回歸集 + 三軸）", { x: 0.6, y: 4.0, w: 6.5, h: 0.55, fontFace: FONT_BODY, fontSize: 16, color: C.white, bold: true, align: "center", margin: 0 });
s.addText("1 hr ｜ 回歸集 / 分數 / 成本 / latency / 線上監控", { x: 0.6, y: 4.7, w: 8.8, h: 0.4, fontFace: FONT_BODY, fontSize: 13, color: C.ice, margin: 0 });
s.addNotes("C5: evaluation, regression set, 3-axis scoring, monitoring");

// S2 痛
s = contentSlide(pptx, "這堂要解決什麼", { page: "2" });
card(s, 0.5, 1.1, 4.4, 2.3, C.brand, "改動難量化", "改了 prompt / 換了模型 / 調了 chunk size\n「感覺比較好了？」→ 信仰，不是工程\n沒有回歸集，每次改動都是擲骰子");
card(s, 5.1, 1.1, 4.4, 2.3, C.accent, "上線後盲飛", "latency 變 3 倍成本翻倍？\n沒有埋點 → 事後才驚覺\n月底看帳單才知死循環");
s.addShape("roundRect", { x: 0.5, y: 3.7, w: 9, h: 1.0, fill: { color: C.soft }, rectRadius: 0.08 });
s.addText("心智模型：評測 = AI 應用版的 CI。傳統 code 有 unit test + CI 才知道改動有沒有 regression；AI 應用也要有自己的「測試集 + 打分 + 監視」。", { x: 0.7, y: 3.78, w: 8.6, h: 0.85, fontFace: FONT_BODY, fontSize: 12, color: C.navy, bold: true, margin: 0, valign: "middle", lineSpacingMultiple: 1.25 });
footer(s, "本卡目標：把「好不好用」變成可重跑、可比較、可上線監視的數字");

// S3 回歸集
s = contentSlide(pptx, "回歸集設計（≥20 案例）", { page: "3" });
const rf = [
  ["欄位", "說明", "例"],
  ["id", "案例編號", "c01"],
  ["input", "給 LLM 的輸入", "「我上週三訂了一箱 A4 紙」"],
  ["expected", "期望輸出結構/關鍵事實", "{product:\"A4紙\",qty:1}"],
  ["assert", "自動判定規則", "product == \"A4 紙\""],
  ["tag", "分類", "rag / tool / agent"],
];
let ry = 1.0;
rf.forEach((row, ri) => {
  const widths = [1.3, 3.2, 4.5];
  let rx = 0.5;
  row.forEach((cell, ci) => {
    const fillc = ri === 0 ? C.navy : (ri % 2 ? C.card : C.white);
    s.addShape("rect", { x: rx, y: ry, w: widths[ci], h: 0.5, fill: { color: fillc }, line: { color: C.line, width: 0.5 } });
    s.addText(cell, { x: rx + 0.08, y: ry, w: widths[ci] - 0.16, h: 0.5, fontFace: FONT_BODY, fontSize: 10.5, color: ri === 0 ? C.white : (ci === 0 ? C.brand : C.body), bold: ri === 0 || ci === 0, margin: 0, valign: "middle" });
    rx += widths[ci];
  });
  ry += 0.5;
});
bullets(s, 0.6, 4.3, 8.8, 0.9, [
  "≥20 案例、分佈覆蓋常見 + 邊界；可自動斷言優先",
], { size: 11.5 });
footer(s, "拿線上 log 回頭餵給回歸集，是最強的來源");

// S4 三軸
s = contentSlide(pptx, "三軸評分：分數 / 成本 / latency", { page: "4" });
card(s, 0.5, 1.1, 2.9, 2.6, C.brand, "分數（Quality）", "答案準不準\n回歸集 assert 命中率；RAG 用 recall / faithfulness\n陷阱：分數升但成本 5 倍");
card(s, 3.55, 1.1, 2.9, 2.6, C.accent, "成本（Cost）", "花多少錢\nΣ(in+out tokens) × 單價 + 向量查詢次數\n陷阱：分數持平但成本翻倍");
card(s, 6.6, 1.1, 2.9, 2.6, C.brand, "latency", "多快\np50 / p95（不是只看平均）\n陷阱：平均快但 p95 長尾卡死");
s.addShape("roundRect", { x: 0.5, y: 3.9, w: 9, h: 1.0, fill: { color: C.soft }, rectRadius: 0.08 });
s.addText("A/B 對比（換 prompt 前後）　", { x: 0.7, y: 3.98, w: 8.6, h: 0.26, fontFace: FONT_BODY, fontSize: 12, color: C.brand, bold: true, margin: 0 });
s.addText("A（舊）：17/20 hit · US$24 · p50 1.2s · p95 3.1s\nB（新）：18/20 hit · US$19 · p50 1.1s · p95 2.8s → 三軸全勝", { x: 0.7, y: 4.26, w: 8.6, h: 0.6, fontFace: FONT_BODY, fontSize: 11, color: C.body, margin: 0, lineSpacingMultiple: 1.2 });
footer(s, "決策看「每塊錢買到幾分 + 多快」，不是單看分數；latency 必看 p95");

// S5 打分
s = contentSlide(pptx, "怎麼打分（分層）", { page: "5" });
const scoring = [
  [C.brand, "規則 assert", "== / in / regex\n快、可重跑、零成本\n只測形式不測語意"],
  [C.accent, "相似度", "embedding 距離\n半自動、閾值難調"],
  [C.brand, "LLM-as-judge", "開放式 answer 品質\n能評語意、貴\n要固定 judge 模型"],
  [C.accent, "人核", "高風險/邊界案例\n最準、慢貴"],
];
scoring.forEach((sc, i) => {
  card(s, 0.5 + (i % 2) * 4.6, 1.1 + Math.floor(i / 2) * 1.7, 4.4, 1.5, sc[0], sc[1], sc[2]);
});
s.addShape("roundRect", { x: 0.5, y: 4.5, w: 9, h: 0.5, fill: { color: C.soft }, rectRadius: 0.08 });
s.addText("能用自動規則就用規則（可重跑）；語意的才上 LLM-judge（固定同一個）；關鍵邊界留人核。三者分層。", { x: 0.7, y: 4.56, w: 8.6, h: 0.4, fontFace: FONT_BODY, fontSize: 11, color: C.navy, bold: true, margin: 0, valign: "middle" });
footer(s, "不要全推給最貴的（人/LLM），成本會被評測本身吃掉");

// S6 線上監控
s = contentSlide(pptx, "線上監控（上線後埋點）", { page: "6" });
const mon = [
  ["要埋的指標", "用途", "告警閾值（例）"],
  ["in/out tokens + 總成本", "成本異常/刷爆", "單請求成本 > 中位數×N"],
  ["latency p50/p95/p99", "慢查詢/卡死", "p95 > 3s 持續 5min"],
  ["錯誤率 4xx/5xx/JSON 解析", "穩定性", "> 2%"],
  ["工具呼叫失敗率", "Agent 健康", "> 5%"],
  ["token/請求 trend", "死循環/回歸", "突增 3 倍"],
];
let ny = 1.0;
mon.forEach((row, ri) => {
  const widths = [3.0, 2.6, 3.4];
  let nx = 0.5;
  row.forEach((cell, ci) => {
    const fillc = ri === 0 ? C.navy : (ri % 2 ? C.card : C.white);
    s.addShape("rect", { x: nx, y: ny, w: widths[ci], h: 0.5, fill: { color: fillc }, line: { color: C.line, width: 0.5 } });
    s.addText(cell, { x: nx + 0.08, y: ny, w: widths[ci] - 0.16, h: 0.5, fontFace: FONT_BODY, fontSize: 10.5, color: ri === 0 ? C.white : (ci === 0 ? C.accent : C.body), bold: ri === 0 || ci === 0, margin: 0, valign: "middle" });
    nx += widths[ci];
  });
  ny += 0.5;
});
s.addShape("roundRect", { x: 0.5, y: 4.4, w: 9, h: 0.6, fill: { color: C.soft }, rectRadius: 0.08 });
s.addText("監控 = 把「三軸評分」從 lab 一次變成線上一直。lab 保證「設計上好」，線上保證「真實流量下沒退化」。", { x: 0.7, y: 4.46, w: 8.6, h: 0.5, fontFace: FONT_BODY, fontSize: 11, color: C.navy, bold: true, margin: 0, valign: "middle" });
footer(s, "告警要比人察覺快：閾值 + 自動通知");

// S7 反模式
s = contentSlide(pptx, "評測反模式（避坑）", { page: "7" });
const anti = [
  "只看分數不看成本/latency → 賠本賺吆喝",
  "回歸集太小（<10）→ 被單例帶偏、過擬合",
  "每次改動連測集一起改 → 失去可比性（要版本化）",
  "只看平均 latency → p95 長尾被藏起來",
  "judge 模型跟著換 → A/B 不可比（要固定）",
  "沒埋線上指標 → 上線後盲飛",
];
let ay = 1.1;
anti.forEach((a, i) => {
  s.addShape("ellipse", { x: 0.6, y: ay + 0.08, w: 0.28, h: 0.28, fill: { color: i % 2 ? C.accent : C.brand } });
  s.addText(String(i + 1), { x: 0.6, y: ay + 0.08, w: 0.28, h: 0.28, fontFace: FONT_BODY, fontSize: 11, color: C.white, bold: true, align: "center", valign: "middle", margin: 0 });
  s.addText(a, { x: 1.05, y: ay, w: 8.3, h: 0.55, fontFace: FONT_BODY, fontSize: 12.5, color: C.body, margin: 0, valign: "middle" });
  ay += 0.62;
});
footer(s, "根源多是「只量一軸」或「量一次就放棄」→ 多軸並列 + 持續跑 + 上線後持續監控");

// S8 Lab
s = contentSlide(pptx, "C5 Lab 實作", { page: "8" });
bullets(s, 0.6, 1.2, 8.8, 3.2, [
  "建 ≥20 案例回歸集（含 ≥5 邊界/負例），每題有 input/expected/assert/tag",
  "對 C1–C4 任一組件跑兩個變體（換 prompt 或換模型）",
  "打出分數 / 成本 / latency（p50+p95）三軸分數表 + 選哪個版本的理由",
  "列「上線要埋哪些指標 + 告警閾值」清單（≥5 項）",
], { size: 13, gap: 8 });
s.addShape("roundRect", { x: 0.5, y: 4.3, w: 9, h: 0.6, fill: { color: C.soft }, rectRadius: 0.08 });
s.addText("證據：≥20 案例回歸集 + 兩變體三軸分數表（截圖/貼文）→ 回 mail 勾卡", { x: 0.7, y: 4.36, w: 8.6, h: 0.5, fontFace: FONT_BODY, fontSize: 12.5, color: C.navy, bold: true, margin: 0, valign: "middle" });
footer(s, "回信即勾卡");

// S9 收尾
s = darkSlide(pptx, { kicker: "Class 5 · 完成", title: "下一步：整合上線與結案", titleSize: 36 });
s.addText("能跑、可控、能評了。C6 把 C2–C5 的所有件拼成端到端應用，上線 + 交付 + 結案。", { x: 0.6, y: 3.2, w: 8.6, h: 0.6, fontFace: FONT_BODY, fontSize: 14, color: C.ice, margin: 0, lineSpacingMultiple: 1.3 });
s.addNotes("Wrap up C5, hand-off to C6.");

pptx.writeFile({ fileName: "/tmp/opencode/aitoolchain-slides/class-05-evaluation.pptx" }).then(() => console.log("class-05 done"));
