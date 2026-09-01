// training-course-pm — 訓練課程投影片共用設計（訓練通版）。
// 版式規則 = pptx skill gotchas（layout 先設 / hex 無 # / option 不共用 / charSpacing / bullet:true）。
// 色票可依課程品牌改 C；版式 helper 不改。

const C = {
  navy: "0E1B33",     // 深藍底（封面/章節）
  navyDark: "0A1428",
  ice: "CADCFC",      // 深色底上的淺字
  brand: "FF7300",    // 課程主色（默认橙，可換）
  brandLight: "FFA94D",
  accent: "326CE5",   // 資訊藍
  sky: "7FB0FF",
  white: "FFFFFF",
  body: "1F2A3D",     // 淺底正文
  sub: "5A6B85",      // 淺底次級
  card: "F3F6FC",
  line: "D8E0EE",
  soft: "EAF1FF",
};

const FONT_HEAD = "Cambria";   // 標題 serif（安全）
const FONT_BODY = "Calibri";   // 內文 sans（安全）

// 16:9（LAYOUT_16x9 = 10" x 5.625"）
const W = 10;
const H = 5.625;

function darkSlide(pptx, opts = {}) {
  const s = pptx.addSlide();
  s.background = { color: C.navy };
  if (!opts.noKicker && opts.kicker) {
    s.addText(opts.kicker, { x: 0.6, y: 2.5, w: 8.8, h: 0.35, fontFace: FONT_BODY, fontSize: 13, color: C.ice, charSpacing: 2, margin: 0 });
  }
  s.addText(opts.title || "", { x: 0.6, y: 2.85, w: 8.8, h: 1.0, fontFace: FONT_HEAD, fontSize: opts.titleSize || 44, color: C.white, bold: true, margin: 0 });
  return s;
}

function contentSlide(pptx, title, opts = {}) {
  const s = pptx.addSlide();
  s.background = { color: C.white };
  s.addShape("rect", { x: 0, y: 0, w: W, h: 0.85, fill: { color: C.navy } });
  s.addShape("rect", { x: 0, y: 0, w: 0.12, h: 0.85, fill: { color: C.brand } });
  s.addText(title, { x: 0.5, y: 0, w: W - 2, h: 0.85, fontFace: FONT_HEAD, fontSize: 22, color: C.white, bold: true, valign: "middle", margin: 0 });
  if (opts.page) {
    s.addText(String(opts.page), { x: W - 1.2, y: 0, w: 1.0, h: 0.85, fontFace: FONT_BODY, fontSize: 13, color: C.ice, align: "right", valign: "middle", margin: 0 });
  }
  return s;
}

function card(slide, x, y, w, h, circleColor, title, bodyText, opts = {}) {
  const c = circleColor === "brand" ? C.brand : (circleColor === "accent" ? C.accent : (circleColor || C.brand));
  slide.addShape("roundRect", { x, y, w, h, fill: { color: C.card }, line: { color: C.line, width: 0.75 }, rectRadius: 0.06 });
  slide.addShape("ellipse", { x: x + 0.24, y: y + 0.2, w: 0.34, h: 0.34, fill: { color: c } });
  slide.addText(title, { x: x + 0.72, y: y + 0.14, w: w - 0.95, h: 0.45, fontFace: FONT_HEAD, fontSize: opts.titleSize || 14, color: C.body, bold: true, valign: "middle", margin: 0 });
  slide.addText(bodyText, { x: x + 0.28, y: y + 0.68, w: w - 0.56, h: h - 0.85, fontFace: FONT_BODY, fontSize: opts.size || 11.5, color: C.body, valign: "top", margin: 0, lineSpacingMultiple: 1.25 });
}

function bullets(slide, x, y, w, h, items, opts = {}) {
  const arr = (Array.isArray(items) ? items : [items]).map((t) => ({
    text: t, options: { bullet: { code: "2022", indent: 14 }, breakLine: true, paraSpaceAfter: opts.gap != null ? opts.gap : 4 },
  }));
  slide.addText(arr, { x, y, w, h, fontFace: FONT_BODY, fontSize: opts.size || 12.5, color: opts.color || C.body, valign: (opts.valign || "top"), margin: 0, lineSpacingMultiple: opts.lsm || 1.05 });
}

function footer(slide, text) {
  slide.addShape("rect", { x: 0, y: H - 0.4, w: W, h: 0.4, fill: { color: C.soft } });
  slide.addText(text, { x: 0.5, y: H - 0.4, w: W - 1, h: 0.4, fontFace: FONT_BODY, fontSize: 10.5, color: C.sub, valign: "middle", margin: 0 });
}

module.exports = { C, FONT_HEAD, FONT_BODY, W, H, darkSlide, contentSlide, card, bullets, footer };
