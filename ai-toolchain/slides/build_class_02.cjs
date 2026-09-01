const pptxgen = require("/tmp/opencode/deckbuild/node_modules/pptxgenjs");
const D = require("./.design.cjs");
const { C, FONT_HEAD, FONT_BODY, W, H, darkSlide, contentSlide, card, bullets, footer } = D;

const pptx = new pptxgen();
pptx.layout = "LAYOUT_16x9";
pptx.author = "AI_assist";
pptx.title = "Class 2 - RAG 基礎";

let s = darkSlide(pptx, { kicker: "AI 工具鏈訓練", title: "Class 2", titleSize: 60 });
s.addShape("roundRect", { x: 0.6, y: 4.0, w: 5.5, h: 0.55, fill: { color: C.brand }, rectRadius: 0.1 });
s.addText("RAG 基礎", { x: 0.6, y: 4.0, w: 5.5, h: 0.55, fontFace: FONT_BODY, fontSize: 16, color: C.white, bold: true, align: "center", margin: 0 });
s.addText("1 hr ｜ 切塊 / Embedding / 向量庫 / 檢索 / 評估", { x: 0.6, y: 4.7, w: 8.8, h: 0.4, fontFace: FONT_BODY, fontSize: 13, color: C.ice, margin: 0 });
s.addNotes("C2: RAG pipeline");

// S2 全流程
s = contentSlide(pptx, "RAG 全流程圖", { page: "2" });
const flow = [
  ["文件 → 切塊", "依結構/語義切 chunk"],
  ["Embedding", "文字 → 向量（數字陣列）"],
  ["存向量庫", "Chroma / PgVector / Qdrant"],
  ["問題 → 檢索 top-k", "相似度排序取 top-k"],
  ["組 prompt → LLM", "片段 + 問題 → answer"],
];
let fy = 1.0;
flow.forEach((f, i) => {
  s.addShape("roundRect", { x: 1.0, y: fy, w: 8.0, h: 0.55, fill: { color: i % 2 ? C.card : C.soft }, rectRadius: 0.08, line: { color: C.accent, width: 0.5 } });
  s.addText(f[0] + "　——　" + f[1], { x: 1.2, y: fy, w: 7.6, h: 0.55, fontFace: FONT_BODY, fontSize: 12.5, color: C.navy, bold: i === 4, valign: "middle", margin: 0 });
  if (i < flow.length - 1) s.addText("▼", { x: 4.8, y: fy + 0.5, w: 0.4, h: 0.28, fontFace: FONT_BODY, fontSize: 13, color: C.brand, align: "center", margin: 0 });
  fy += 0.78;
});
footer(s, "五個關鍵決策：chunk 多大 / 哪個 embedding / 向量庫 / top-k / prompt 怎麼組");

// S3 切塊
s = contentSlide(pptx, "切塊策略（Chunking）", { page: "3" });
card(s, 0.5, 1.1, 4.4, 2.2, C.brand, "Chunk Size & Overlap", "建議 200–800 token（依文件類型）\noverLap 10–20% 避免斷裂\n語義切塊 > 固定長度");
card(s, 5.1, 1.1, 4.4, 2.2, C.accent, "三種切法", "固定長度：簡單但切碎\n依結構（markdown/段落）：最划算\n語義斷點：最優但貴");
s.addShape("roundRect", { x: 0.5, y: 3.6, w: 9, h: 1.0, fill: { color: C.soft }, rectRadius: 0.08 });
s.addText("心智模型", { x: 0.7, y: 3.68, w: 8.6, h: 0.28, fontFace: FONT_BODY, fontSize: 13, color: C.brand, bold: true, margin: 0 });
s.addText("chunk = 圖書館的書頁。切太碎 = 查得到字組不成句；切太大 = 翻到那頁要讀半小時。目標 = 一頁講一件事。生產建議先依結構切，效果不夠再上語義。", { x: 0.7, y: 3.98, w: 8.6, h: 0.6, fontFace: FONT_BODY, fontSize: 11.5, color: C.body, margin: 0, lineSpacingMultiple: 1.2 });
footer(s, "檢索精度 × 成本 × 品質 = 三角取捨");

// S4 Embedding
s = contentSlide(pptx, "Embedding 模型選擇", { page: "4" });
card(s, 0.5, 1.1, 4.4, 2.0, C.brand, "text-embedding-3-small", "1536 維、成本低\n課程主用、跨語言尚可");
card(s, 5.1, 1.1, 4.4, 2.0, C.accent, "text-embedding-3-large", "3072 維、成本約 2 倍\n召回要求高時用");
card(s, 0.5, 3.3, 4.4, 1.4, C.accent, "BGE-m3（本地）", "1024 維、自架免費\n內網/多語/長文");
card(s, 5.1, 3.3, 4.4, 1.4, C.brand, "原則", "檢索與儲存要同一套 embedding\n不能存 A 套、查 B 套");
footer(s, "embedding = 把意思翻成坐標，選對坐標系比較才有意義");

// S5 向量庫
s = contentSlide(pptx, "向量庫", { page: "5" });
card(s, 0.5, 1.1, 4.4, 1.8, C.brand, "Chroma", "純 Python、本地目錄、無 server\n課程主用、原型、小量");
card(s, 5.1, 1.1, 4.4, 1.8, C.accent, "PgVector", "Postgres 擴充\n生產、已用 PG 的場景");
card(s, 0.5, 3.1, 4.4, 1.8, C.accent, "Qdrant / Milvus / Pinecone", "獨立 service / SaaS\n大量、多租、要 HA");
s.addShape("roundRect", { x: 0.5, y: 5.1, w: 9, h: 0.4, fill: { color: C.soft }, rectRadius: 0.06 });
s.addText("選法：先簡單（Chroma），量大了再遷。", { x: 0.7, y: 5.12, w: 8.6, h: 0.36, fontFace: FONT_BODY, fontSize: 12, color: C.navy, bold: true, margin: 0, valign: "middle" });
footer(s, "向量庫 = 以意搜書的圖書館");

// S6 組 prompt
s = contentSlide(pptx, "組 Prompt：檢索結果怎麼回灌", { page: "6" });
s.addShape("roundRect", { x: 0.5, y: 1.0, w: 9, h: 2.8, fill: { color: "1E293B" }, rectRadius: 0.08 });
s.addText(
  "system: 你是知識庫問答器。只能依據【資料】回答；\n" +
  "       資料沒有就說「我不確定」。\n\n" +
  "user:\n" +
  "【資料】\n" +
  "<片段1>…產品規格…</片段1>\n" +
  "<片段2>…保修條款…</片段2>\n" +
  "【問題】\n" +
  "{question}",
  { x: 0.8, y: 1.1, w: 8.4, h: 2.6, fontFace: "Courier New", fontSize: 11.5, color: "E2E8F0", margin: 0, valign: "top", lineSpacingMultiple: 1.2 });
s.addShape("roundRect", { x: 0.5, y: 4.0, w: 9, h: 0.9, fill: { color: C.soft }, rectRadius: 0.08 });
s.addText("心智模型：檢索片段 = 參考書，prompt = 「告訴 LLM 只准翻這幾頁」。沒有限制 → LLM 拿自己（可能過期的）知識補 = 幻覺。", { x: 0.7, y: 4.08, w: 8.6, h: 0.75, fontFace: FONT_BODY, fontSize: 12, color: C.navy, bold: true, margin: 0, valign: "middle", lineSpacingMultiple: 1.2 });
footer(s, "「只依據這些資料回答」= 減少幻覺的關鍵句");

// S7 評估
s = contentSlide(pptx, "評估：Recall & Faithfulness", { page: "7" });
card(s, 0.5, 1.1, 4.4, 2.2, C.brand, "Recall（召回）", "相關片段有沒有被檢索到？\n標準答案所在塊有沒有進 top-k\n切塊/embedding 選錯 → Recall 低");
card(s, 5.1, 1.1, 4.4, 2.2, C.accent, "Faithfulness（忠實）", "answer 有沒有胡說（超出片段）？\n人核/LLM 評：每句能否被片段支撐\n檢索到了但 prompt 沒用好 → 低");
s.addShape("roundRect", { x: 0.5, y: 3.6, w: 9, h: 0.9, fill: { color: C.soft }, rectRadius: 0.08 });
s.addText("心智模型：RAG 品質 = 檢索分 × 生成分（乘法，不是加法）。檢索 0 分 → 再好的 LLM 也是 0；生成 0 分 → 再準的檢索也白費。分開測才知道哪半要修。", { x: 0.7, y: 3.68, w: 8.6, h: 0.75, fontFace: FONT_BODY, fontSize: 11.5, color: C.navy, bold: true, margin: 0, valign: "middle", lineSpacingMultiple: 1.2 });
footer(s, "常見失敗：top-k 太小漏、太大稀釋 → 兩者皆中");

// S8 Lab
s = contentSlide(pptx, "C2 Lab 實作", { page: "8" });
bullets(s, 0.6, 1.2, 8.8, 3.2, [
  "準備 ≥10 段私域文件（markdown 皆可）",
  "依結構切塊（含 overlap）→ text-embedding-3-small → 存 Chroma",
  "用 3–5 個測試問題跑檢索，看 top-3 有沒有命中",
  "組 prompt 出 answer，核「只依據資料」",
  "Recall / Faithfulness 簡評",
], { size: 13.5, gap: 7 });
s.addShape("roundRect", { x: 0.5, y: 4.3, w: 9, h: 0.6, fill: { color: C.soft }, rectRadius: 0.08 });
s.addText("證據：檢索 top-3 截圖 + answer 截圖 + 資料集片段清單 → 回 mail 勾卡", { x: 0.7, y: 4.36, w: 8.6, h: 0.5, fontFace: FONT_BODY, fontSize: 12.5, color: C.navy, bold: true, margin: 0, valign: "middle" });
footer(s, "回信即勾卡");

// S9 收尾
s = darkSlide(pptx, { kicker: "Class 2 · 完成", title: "下一步：Tool 呼叫", titleSize: 36 });
s.addText("RAG 讓 LLM 能「查資料」了。C3 讓它「做事」——function calling / tool calling。", { x: 0.6, y: 3.2, w: 8.6, h: 0.6, fontFace: FONT_BODY, fontSize: 14, color: C.ice, margin: 0, lineSpacingMultiple: 1.3 });
s.addNotes("Wrap up C2, hand-off to C3.");

pptx.writeFile({ fileName: "/tmp/opencode/aitoolchain-slides/class-02-rag-basics.pptx" }).then(() => console.log("class-02 done"));
