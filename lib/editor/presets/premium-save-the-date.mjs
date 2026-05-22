/**
 * Craft.js preset — Premium Save The Date (MeHappy reference, 400→390px scale).
 * Regenerate: npm run generate:premium-preset
 * Seed DB: npm run seed:premium-template
 */

const CANVAS = 390;
const S = CANVAS / 400;
const s = (n) => Math.round(n * S);

/** MeHappy demo assets (reference template user 1928) */
const MH = "https://s3-hcm-r2.s3cloud.vn/thiepcuoi-mehappy/users/1928";

export const PREMIUM_IMAGES = {
  cover: `${MH}/67d91017-be4f-46d2-95e3-95283716d77d-full.webp`,
  pattern: `${MH}/d81a5976-c5a7-47bb-b43e-ea9e1e28f461-full.webp`,
  groomPhoto: `${MH}/6d4ff4c0-88c3-4e6a-90bd-d41eb7f0358f-full.webp`,
  bridePhoto: `${MH}/9db06fec-f2eb-4908-bdc0-cb7f60c0fa92-full.webp`,
  eventBg: `${MH}/2e7efe47-834f-4e87-bc36-901ea3b86810-full.webp`,
  eventThumbGroom: `${MH}/8b89a200-b361-451e-90bb-769fc120ae56-full.webp`,
  eventThumbBride: `${MH}/5fd5bbcb-b089-45e3-b79c-37c1b2f36727-full.webp`,
  album: [
    `${MH}/661a39aa-5f9f-467f-b506-442ca5331ff2-full.webp`,
    `${MH}/3c01ee1c-dfe6-4b3d-a1c8-a8a1e142af51-full.webp`,
    `${MH}/67d91017-be4f-46d2-95e3-95283716d77d-full.webp`,
    `${MH}/9db06fec-f2eb-4908-bdc0-cb7f60c0fa92-full.webp`,
    `${MH}/67c6493a-622c-47a9-b5c4-5a9bec6b4df7-full.webp`,
    `${MH}/214c90a8-7c69-4660-9e9c-4930b5125d0a-full.webp`,
    `${MH}/5fd5bbcb-b089-45e3-b79c-37c1b2f36727-full.webp`,
    `${MH}/ec75d3cc-145e-41d3-b02c-4055a8c62599-full.webp`,
  ],
};

const FONT_SCRIPT = "'Great Vibes', cursive";
const FONT_BODY = "'Source Sans Pro', sans-serif";
const FONT_LABEL = "Oswald, sans-serif";
const ROSE = "#ea6c88";
const WINE = "#880000";
const ICON_CALENDAR = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="#C24E4E"><path d="M0 464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V192H0v272zm320-196c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12h-40c-6.6 0-12-5.4-12-12v-40zm0 128c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12h-40c-6.6 0-12-5.4-12-12v-40zM192 268c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12h-40c-6.6 0-12-5.4-12-12v-40zm0 128c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12h-40c-6.6 0-12-5.4-12-12v-40zM64 268c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12H76c-6.6 0-12-5.4-12-12v-40zm0 128c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12H76c-6.6 0-12-5.4-12-12v-40zM400 64h-48V16c0-8.8-7.2-16-16-16h-32c-8.8 0-16 7.2-16 16v48H160V16c0-8.8-7.2-16-16-16h-32c-8.8 0-16 7.2-16 16v48H48C21.5 64 0 85.5 0 112v48h448v-48c0-26.5-21.5-48-48-48z"/></svg>`;
const ICON_MAP = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" fill="#C24E4E"><path d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0zM192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z"/></svg>`;

function block(typeName, displayName, props, parent, childIds = []) {
  return {
    type: { resolvedName: typeName },
    isCanvas: typeName === "SectionBlock" || typeName === "RootCanvas",
    props,
    displayName,
    custom: {},
    hidden: false,
    nodes: childIds,
    linkedNodes: {},
    parent,
  };
}

/** Clamp box so left + width never exceeds canvas (fixes horizontal overflow). */
function box(left, top, width, height) {
  let l = s(left);
  l = Math.max(0, Math.min(l, CANVAS - 1));
  const t = s(top);
  const maxW = CANVAS - l;
  const w = Math.min(s(width), maxW);
  const out = { top: t, left: l, width: w };
  if (height != null) out.height = s(height);
  return out;
}

/**
 * @param {object} [opts]
 * @param {string} [opts.brideName]
 * @param {string} [opts.groomName]
 * @param {string} [opts.weddingDate] ISO
 * @param {string} [opts.eventTimeLabel] e.g. "16:00 Thứ Tư Ngày 30/11/2025"
 * @param {string} [opts.mapsUrl]
 * @param {typeof PREMIUM_IMAGES} [opts.images]
 */
export function buildPremiumSaveTheDateJson(opts = {}) {
  const brideName = opts.brideName ?? "Mỹ Hạnh";
  const groomName = opts.groomName ?? "Quang Thi";
  const weddingDate = opts.weddingDate ?? "2026-05-16T16:00:00.000Z";
  const eventTimeLabel =
    opts.eventTimeLabel ?? "16:00 Thứ Tư Ngày 30/11/2025";
  const mapsUrl = opts.mapsUrl ?? "https://www.google.com/maps";
  const img = { ...PREMIUM_IMAGES, ...opts.images };

  const nodes = {};
  const sec1 = "sec-cover";
  const sec2 = "sec-save";
  const sec3 = "sec-events";
  const sec4 = "sec-gift";
  const sec5 = "sec-album";
  const sec6 = "sec-thanks";
  const sec7 = "sec-footer";

  nodes.ROOT = block("RootCanvas", "Canvas", {}, null, [
    sec1,
    sec2,
    sec3,
    sec4,
    sec5,
    sec6,
    sec7,
  ]);

  const t = (id, parent, p) => {
    nodes[id] = block("TextBlock", "Text", p, parent, []);
  };
  const ic = (id, parent, p) => {
    nodes[id] = block("IconBlock", "Icon", p, parent, []);
  };
  const im = (id, parent, p) => {
    nodes[id] = block("ImageBlock", "Hình ảnh", p, parent, []);
  };

  // ── 1. Cover (532px) ───────────────────────────────────────────────────────
  nodes[sec1] = block(
    "SectionBlock",
    "Section",
    {
      height: s(532),
      bgType: "image",
      bgUrl: img.cover,
      bgSize: "cover",
      bgPosition: "center center",
      bgRepeat: "no-repeat",
      elementId: "section-cover",
    },
    "ROOT",
    []
  );

  // ── 2. Save The Date (1826px) ──────────────────────────────────────────────
  const s2children = [
    "s2-groom-name-l",
    "s2-bride-name-r",
    "s2-heart-1",
    "s2-heart-2",
    "s2-save-title",
    "s2-for-wedding",
    "s2-date-iso",
    "s2-countdown",
    "s2-nha-trai",
    "s2-img-groom",
    "s2-chu-re",
    "s2-groom-name-big",
    "s2-bo-groom",
    "s2-me-groom",
    "s2-dia-chi-groom",
    "s2-nha-gai",
    "s2-img-bride",
    "s2-co-dau",
    "s2-bride-name-big",
    "s2-bo-bride",
    "s2-me-bride",
    "s2-dia-chi-bride",
    "s2-event-time",
  ];

  nodes[sec2] = block(
    "SectionBlock",
    "Section",
    {
      height: s(1826),
      bgType: "image",
      bgUrl: img.pattern,
      bgSize: "contain",
      bgPosition: "center center",
      bgRepeat: "repeat",
      overlayType: "color",
      overlayColor: "#ffffff",
      overlayOpacity: 36,
      elementId: "section-save-date",
    },
    "ROOT",
    s2children
  );

  t("s2-groom-name-l", sec2, {
    content: groomName,
    cardField: "groom_name",
    fontSize: s(30),
    fontFamily: FONT_SCRIPT,
    color: WINE,
    textAlign: "right",
    ...box(-53, 14, 215),
    elementId: "s2-groom-name-l",
  });
  t("s2-bride-name-r", sec2, {
    content: brideName,
    cardField: "bride_name",
    fontSize: s(30),
    fontFamily: FONT_SCRIPT,
    color: WINE,
    ...box(221, 14, 241),
    elementId: "s2-bride-name-r",
  });
  ic("s2-heart-1", sec2, {
    icon: "heart",
    ...box(177, 19, 30, 30),
    color: WINE,
    elementId: "s2-heart-1",
  });
  ic("s2-heart-2", sec2, {
    icon: "heart",
    ...box(186, 29, 20, 20),
    color: "#E37D7D",
    rotate: 30,
    elementId: "s2-heart-2",
  });
  t("s2-save-title", sec2, {
    content: "Save The Date",
    fontSize: s(35),
    fontFamily: FONT_SCRIPT,
    textAlign: "center",
    ...box(4, 80, 391),
    elementId: "s2-save-title",
  });
  t("s2-for-wedding", sec2, {
    content: "For The Wedding Of",
    fontSize: s(18),
    fontFamily: FONT_BODY,
    textAlign: "center",
    ...box(40, 130, 320),
    elementId: "s2-for-wedding",
  });
  t("s2-date-iso", sec2, {
    content: weddingDate.slice(0, 10),
    cardField: "wedding_date",
    fontSize: s(18),
    fontFamily: FONT_BODY,
    textAlign: "center",
    ...box(41, 172, 319),
    elementId: "s2-date-iso",
  });
  nodes["s2-countdown"] = block(
    "CountdownBlock",
    "Đếm ngược",
    {
      ...box(20, 211, 360),
      primaryColor: ROSE,
      textColor: "#ffffff",
      labelColor: "#666666",
      digitFontSize: s(30),
      elementId: "s2-countdown",
    },
    sec2,
    []
  );
  t("s2-nha-trai", sec2, {
    content: "Nhà Trai",
    fontSize: s(35),
    fontFamily: FONT_SCRIPT,
    textAlign: "center",
    ...box(4, 356, 391),
    elementId: "s2-nha-trai",
  });
  im("s2-img-groom", sec2, {
    src: img.groomPhoto,
    ...box(15, 414, 370, 390),
    borderRadius: s(10),
    borderStyle: "solid",
    borderWidth: 2,
    borderColor: ROSE,
    objectFit: "cover",
    elementId: "s2-img-groom",
  });
  t("s2-chu-re", sec2, {
    content: "Chú Rể:",
    fontSize: s(20),
    fontFamily: FONT_LABEL,
    fontWeight: "bold",
    textAlign: "center",
    ...box(90, 812, 220),
    elementId: "s2-chu-re",
  });
  t("s2-groom-name-big", sec2, {
    content: groomName,
    cardField: "groom_name",
    fontSize: s(30),
    fontFamily: FONT_SCRIPT,
    fontWeight: "bold",
    textAlign: "center",
    ...box(4, 848, 391),
    elementId: "s2-groom-name-big",
  });
  t("s2-bo-groom", sec2, {
    content: "Bố: Nguyễn Xuân Dung",
    fontSize: s(18),
    fontFamily: FONT_BODY,
    textAlign: "center",
    ...box(6, 903, 388),
    elementId: "s2-bo-groom",
  });
  t("s2-me-groom", sec2, {
    content: "Mẹ: Nguyễn Thị Tuyết",
    fontSize: s(18),
    fontFamily: FONT_BODY,
    textAlign: "center",
    ...box(4, 930, 390),
    elementId: "s2-me-groom",
  });
  t("s2-dia-chi-groom", sec2, {
    content:
      "<b>Địa Chỉ:</b>&nbsp;Xã Đông Phú<br/>Huyện Lục Nam, Tỉnh Bắc Giang",
    fontSize: s(18),
    fontFamily: FONT_BODY,
    textAlign: "center",
    ...box(4, 976, 391),
    elementId: "s2-dia-chi-groom",
  });
  t("s2-nha-gai", sec2, {
    content: "Nhà Gái",
    fontSize: s(35),
    fontFamily: FONT_SCRIPT,
    textAlign: "center",
    ...box(4, 1076, 391),
    elementId: "s2-nha-gai",
  });
  im("s2-img-bride", sec2, {
    src: img.bridePhoto,
    ...box(15, 1137, 370, 390),
    borderRadius: s(10),
    borderStyle: "solid",
    borderWidth: 2,
    borderColor: ROSE,
    objectFit: "cover",
    elementId: "s2-img-bride",
  });
  t("s2-co-dau", sec2, {
    content: "Cô Dâu",
    fontSize: s(20),
    fontFamily: FONT_LABEL,
    fontWeight: "bold",
    textAlign: "center",
    ...box(7, 1535, 387),
    elementId: "s2-co-dau",
  });
  t("s2-bride-name-big", sec2, {
    content: brideName,
    cardField: "bride_name",
    fontSize: s(30),
    fontFamily: FONT_SCRIPT,
    fontWeight: "bold",
    textAlign: "center",
    ...box(3, 1573, 391),
    elementId: "s2-bride-name-big",
  });
  t("s2-bo-bride", sec2, {
    content: "Bố: Nghiêm Tuấn Hợp",
    fontSize: s(18),
    fontFamily: FONT_BODY,
    textAlign: "center",
    ...box(4, 1626, 391),
    elementId: "s2-bo-bride",
  });
  t("s2-me-bride", sec2, {
    content: "Mẹ: Nguyễn Thị Loan",
    fontSize: s(18),
    fontFamily: FONT_BODY,
    textAlign: "center",
    ...box(5, 1653, 391),
    elementId: "s2-me-bride",
  });
  t("s2-dia-chi-bride", sec2, {
    content:
      "<b>Địa Chỉ:</b> Thôn Trong, Xã Đông Phú<br/>Huyện Lục Nam, Tỉnh Bắc Giang",
    fontSize: s(18),
    fontFamily: FONT_BODY,
    textAlign: "center",
    ...box(7, 1699, 387),
    elementId: "s2-dia-chi-bride",
  });
  t("s2-event-time", sec2, {
    content: eventTimeLabel,
    fontSize: s(18),
    fontFamily: FONT_BODY,
    textAlign: "center",
    ...box(93, 1723, 281),
    elementId: "s2-event-time",
  });

  // ── 3. Events (848px) ──────────────────────────────────────────────────────
  const s3children = [
    "s3-title",
    "s3-groom-party",
    "s3-thumb-groom",
    "s3-bg-groom",
    "s3-icon-cal-g",
    "s3-icon-map-g",
    "s3-venue-g-label",
    "s3-venue-g",
    "s3-btn-map-g",
    "s3-bride-party",
    "s3-thumb-bride",
    "s3-bg-bride",
    "s3-icon-cal-b",
    "s3-icon-map-b",
    "s3-time-b",
    "s3-venue-b-label",
    "s3-venue-b",
    "s3-btn-map-b",
  ];

  nodes[sec3] = block(
    "SectionBlock",
    "Section",
    {
      height: s(848),
      bgType: "color",
      bgColor: "#ffffff",
      elementId: "section-events",
    },
    "ROOT",
    s3children
  );

  t("s3-title", sec3, {
    content: "Sự Kiện Cưới",
    fontSize: s(35),
    fontFamily: FONT_SCRIPT,
    textAlign: "center",
    ...box(0, 32, 400),
    elementId: "s3-title",
  });
  t("s3-groom-party", sec3, {
    content: "Tiệc Cưới Nhà Trai",
    fontSize: s(20),
    fontFamily: FONT_BODY,
    fontWeight: "bold",
    textDecoration: "underline",
    textAlign: "center",
    ...box(10, 194, 199),
    elementId: "s3-groom-party",
  });
  im("s3-thumb-groom", sec3, {
    src: img.eventThumbGroom,
    ...box(209, 126, 166, 118),
    borderRadius: s(5),
    objectFit: "cover",
    elementId: "s3-thumb-groom",
  });
  im("s3-bg-groom", sec3, {
    src: img.eventBg,
    ...box(10, 185, 380, 200),
    borderRadius: s(5),
    objectFit: "cover",
    imageFilter: { filterOpacity: 50 },
    elementId: "s3-bg-groom",
  });
  ic("s3-icon-cal-g", sec3, {
    customSvg: ICON_CALENDAR,
    icon: "star",
    ...box(26, 249, 30, 30),
    color: "#C24E4E",
    elementId: "s3-icon-cal-g",
  });
  ic("s3-icon-map-g", sec3, {
    customSvg: ICON_MAP,
    icon: "star",
    ...box(26, 303, 30, 30),
    color: "#C24E4E",
    elementId: "s3-icon-map-g",
  });
  t("s3-venue-g-label", sec3, {
    content: "Tại: Tư Gia Nhà Trai:",
    fontSize: s(16),
    fontFamily: FONT_BODY,
    ...box(66, 298, 212),
    elementId: "s3-venue-g-label",
  });
  t("s3-venue-g", sec3, {
    content: "Thôn Trong, Xã Đông Phú, Bắc Giang",
    fontSize: s(18),
    fontFamily: FONT_BODY,
    ...box(66, 322, 292),
    elementId: "s3-venue-g",
  });
  nodes["s3-btn-map-g"] = block(
    "ButtonBlock",
    "Nút bấm",
    {
      label: "Xem chỉ đường từ google maps",
      url: mapsUrl,
      bgColor: "#ffffff",
      textColor: "#333333",
      fontSize: s(20),
      borderRadius: 4,
      ...box(39, 391, 340),
      paddingY: 8,
      elementId: "s3-btn-map-g",
    },
    sec3,
    []
  );
  t("s3-bride-party", sec3, {
    content: "Tiệc Cưới Nhà Gái",
    fontSize: s(20),
    fontFamily: FONT_BODY,
    fontWeight: "bold",
    textDecoration: "underline",
    textAlign: "center",
    ...box(10, 552, 199),
    elementId: "s3-bride-party",
  });
  im("s3-thumb-bride", sec3, {
    src: img.eventThumbBride,
    ...box(209, 485, 166, 118),
    borderRadius: s(5),
    objectFit: "cover",
    elementId: "s3-thumb-bride",
  });
  im("s3-bg-bride", sec3, {
    src: img.eventBg,
    ...box(10, 544, 380, 200),
    borderRadius: s(5),
    objectFit: "cover",
    imageFilter: { filterOpacity: 50 },
    elementId: "s3-bg-bride",
  });
  ic("s3-icon-cal-b", sec3, {
    customSvg: ICON_CALENDAR,
    icon: "star",
    ...box(26, 609, 30, 30),
    color: "#C24E4E",
    elementId: "s3-icon-cal-b",
  });
  ic("s3-icon-map-b", sec3, {
    customSvg: ICON_MAP,
    icon: "star",
    ...box(26, 662, 30, 30),
    color: "#C24E4E",
    elementId: "s3-icon-map-b",
  });
  t("s3-time-b", sec3, {
    content: eventTimeLabel,
    fontSize: s(18),
    fontFamily: FONT_BODY,
    ...box(69, 612, 305),
    elementId: "s3-time-b",
  });
  t("s3-venue-b-label", sec3, {
    content: "Tại: Tư Gia Nhà Gái:",
    fontSize: s(16),
    fontFamily: FONT_BODY,
    ...box(69, 657, 199),
    elementId: "s3-venue-b-label",
  });
  t("s3-venue-b", sec3, {
    content: "Thôn Trong, Xã Đông Phú, Bắc Giang",
    fontSize: s(18),
    fontFamily: FONT_BODY,
    ...box(69, 681, 309),
    elementId: "s3-venue-b",
  });
  nodes["s3-btn-map-b"] = block(
    "ButtonBlock",
    "Nút bấm",
    {
      label: "Xem chỉ đường từ google maps",
      url: mapsUrl,
      bgColor: "#ffffff",
      textColor: "#333333",
      fontSize: s(20),
      borderRadius: 4,
      ...box(42, 750, 340),
      paddingY: 8,
      elementId: "s3-btn-map-b",
    },
    sec3,
    []
  );

  // ── 4. Gift (410px) ────────────────────────────────────────────────────────
  nodes[sec4] = block(
    "SectionBlock",
    "Section",
    {
      height: s(410),
      bgType: "image",
      bgUrl: img.cover,
      bgSize: "cover",
      bgPosition: "center center",
      overlayType: "color",
      overlayColor: "#000000",
      overlayOpacity: 70,
      elementId: "section-gift",
    },
    "ROOT",
    ["s4-title", "s4-subtitle", "s4-gift-box"]
  );
  t("s4-title", sec4, {
    content: "Hộp Mừng Cưới",
    fontSize: s(35),
    fontFamily: FONT_SCRIPT,
    color: "#ffffff",
    textAlign: "center",
    ...box(0, 79, 400),
    elementId: "s4-title",
  });
  t("s4-subtitle", sec4, {
    content:
      "Cám ơn tất cả các tình cảm mà mọi người đã dành cho 2 vợ chồng ạ ♥",
    fontSize: s(16),
    fontFamily: FONT_BODY,
    color: "#ffffff",
    textAlign: "center",
    ...box(35, 144, 314),
    elementId: "s4-subtitle",
  });
  nodes["s4-gift-box"] = block(
    "GiftBoxBlock",
    "Hộp mừng cưới",
    {
      ...box(130, 225, 120, 92),
      bgColor: "rgba(97,97,97,0.85)",
      titleColor: "#ffffff",
      textColor: "#eeeeee",
      titleText: "",
      subtitleText: "",
      showQr: true,
      elementId: "s4-gift-box",
    },
    sec4,
    []
  );

  // ── 5. Album (974px) ───────────────────────────────────────────────────────
  const albumIds = img.album.map((_, i) => `s5-img-${i}`);
  nodes[sec5] = block(
    "SectionBlock",
    "Section",
    {
      height: s(974),
      bgType: "color",
      bgColor: "#ffffff",
      elementId: "section-album",
    },
    "ROOT",
    ["s5-title", ...albumIds]
  );
  t("s5-title", sec5, {
    content: "Album Ảnh Cưới",
    fontSize: s(35),
    fontFamily: FONT_SCRIPT,
    textAlign: "center",
    ...box(1, 27, 399),
    elementId: "s5-title",
  });
  const albumPositions = [
    { top: 102, left: 12 },
    { top: 103, left: 205 },
    { top: 319, left: 12 },
    { top: 319, left: 205 },
    { top: 535, left: 12 },
    { top: 535, left: 205 },
    { top: 751, left: 12 },
    { top: 751, left: 205 },
  ];
  albumIds.forEach((id, i) => {
    const pos = albumPositions[i];
    im(id, sec5, {
      src: img.album[i],
      ...box(pos.left, pos.top, 180, 200),
      objectFit: "cover",
      elementId: id,
    });
  });

  // ── 6. Thank you (425px) ───────────────────────────────────────────────────
  nodes[sec6] = block(
    "SectionBlock",
    "Section",
    {
      height: s(425),
      bgType: "image",
      bgUrl: img.cover,
      bgSize: "cover",
      overlayType: "color",
      overlayColor: "#000000",
      overlayOpacity: 60,
      elementId: "section-thanks",
    },
    "ROOT",
    ["s6-thanks", "s6-quote"]
  );
  t("s6-thanks", sec6, {
    content: "Thank You",
    fontSize: s(60),
    fontFamily: FONT_SCRIPT,
    color: "#ffffff",
    textAlign: "center",
    ...box(0, 106, 400),
    elementId: "s6-thanks",
  });
  t("s6-quote", sec6, {
    content:
      "“Chân thành cảm ơn gia đình, bạn bè và tất cả những ai đã cùng tụi mình viết nên một ngày đáng nhớ. Sự hiện diện và yêu thương của mọi người là món quà quý giá nhất.”",
    fontSize: s(16),
    fontFamily: FONT_BODY,
    color: "#ffffff",
    textAlign: "center",
    ...box(35, 198, 331),
    elementId: "s6-quote",
  });

  // ── 7. Footer (90px) — Royal Wedding branding ─────────────────────────────
  nodes[sec7] = block(
    "SectionBlock",
    "Section",
    {
      height: s(90),
      bgType: "color",
      bgColor: "#ffffff",
      elementId: "section-footer",
    },
    "ROOT",
    ["s7-brand", "s7-powered"]
  );
  t("s7-brand", sec7, {
    content: "Royal Wedding | Nền tảng tạo Thiệp cưới Online",
    fontSize: s(18),
    fontFamily: "Quicksand, sans-serif",
    textAlign: "center",
    ...box(12, 8, 366),
    elementId: "s7-brand",
  });
  t("s7-powered", sec7, {
    content: "Powered by Royal Wedding",
    fontSize: s(14),
    fontFamily: "Quicksand, sans-serif",
    textAlign: "center",
    ...box(12, 64, 366),
    elementId: "s7-powered",
  });

  return nodes;
}
