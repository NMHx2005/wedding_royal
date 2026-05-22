/**
 * 3 biến thể Craft khác nhau cho kho giao diện Basic / Pro / VIP.
 */

import { injectInvitationAnimations } from "../inject-invitation-animations.mjs";
import { buildPremiumSaveTheDateJson, PREMIUM_IMAGES } from "./premium-save-the-date.mjs";

const CANVAS = 390;
const S = CANVAS / 400;
const s = (n) => Math.round(n * S);

const MH = "https://s3-hcm-r2.s3cloud.vn/thiepcuoi-mehappy/users/1928";

export const SHOWCASE_IMAGES = {
  basic: {
    cover: `${MH}/2e7efe47-834f-4e87-bc36-901ea3b86810-full.webp`,
    accent: `${MH}/d81a5976-c5a7-47bb-b43e-ea9e1e28f461-full.webp`,
  },
  pro: PREMIUM_IMAGES,
  vip: {
    cover: `${MH}/661a39aa-5f9f-467f-b506-442ca5331ff2-full.webp`,
    pattern: `${MH}/214c90a8-7c69-4660-9e9c-4930b5125d0a-full.webp`,
    groomPhoto: PREMIUM_IMAGES.groomPhoto,
    bridePhoto: PREMIUM_IMAGES.bridePhoto,
    eventBg: PREMIUM_IMAGES.eventBg,
    album: PREMIUM_IMAGES.album,
  },
};

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

/** Basic — 3 section, tông kem xanh nhạt, không album / gift / ảnh đôi dài */
function buildBasicMinimalJson(opts = {}) {
  const brideName = opts.brideName ?? "Cô dâu";
  const groomName = opts.groomName ?? "Chú rể";
  const weddingDate = opts.weddingDate ?? "2026-06-20T10:00:00.000Z";
  const img = SHOWCASE_IMAGES.basic;

  const nodes = {};
  const secCover = "b-cover";
  const secMain = "b-main";
  const secFoot = "b-foot";

  nodes.ROOT = block("RootCanvas", "Canvas", {}, null, [secCover, secMain, secFoot]);

  nodes[secCover] = block(
    "SectionBlock",
    "Section",
    {
      height: s(420),
      bgType: "image",
      bgUrl: img.cover,
      bgSize: "cover",
      bgPosition: "center",
      overlayType: "color",
      overlayColor: "#e8f4f0",
      overlayOpacity: 55,
      elementId: "b-section-cover",
    },
    "ROOT",
    ["b-title", "b-names", "b-amp"]
  );

  const t = (id, parent, p) => {
    nodes[id] = block("TextBlock", "Text", p, parent, []);
  };

  t("b-title", secCover, {
    content: "Wedding Invitation",
    fontSize: s(14),
    fontFamily: "'Cormorant Garamond', serif",
    color: "#5a7a6a",
    textAlign: "center",
    letterSpacing: 4,
    textTransform: "uppercase",
    ...box(20, 120, 350),
    elementId: "b-title",
  });
  t("b-names", secCover, {
    content: `${groomName}\n&\n${brideName}`,
    cardField: "bride_name",
    fontSize: s(42),
    fontFamily: "'Cormorant Garamond', serif",
    color: "#2d4a3e",
    textAlign: "center",
    lineHeight: 1.35,
    ...box(15, 160, 360),
    elementId: "b-names",
  });
  t("b-amp", secCover, {
    content: "Trân trọng kính mời",
    fontSize: s(16),
    fontFamily: "'Source Sans Pro', sans-serif",
    color: "#4a6b5c",
    textAlign: "center",
    ...box(40, 340, 310),
    elementId: "b-amp",
  });

  nodes[secMain] = block(
    "SectionBlock",
    "Section",
    {
      height: s(720),
      bgType: "color",
      bgColor: "#faf8f5",
      elementId: "b-section-main",
    },
    "ROOT",
    ["b-save", "b-sub", "b-countdown", "b-date", "b-venue"]
  );

  t("b-save", secMain, {
    content: "Save The Date",
    fontSize: s(36),
    fontFamily: "'Great Vibes', cursive",
    color: "#3d6b5c",
    textAlign: "center",
    ...box(10, 40, 370),
    elementId: "b-save",
  });
  t("b-sub", secMain, {
    content: "Ngày trọng đại của chúng mình",
    fontSize: s(15),
    fontFamily: "'Source Sans Pro', sans-serif",
    color: "#666",
    textAlign: "center",
    ...box(30, 100, 330),
    elementId: "b-sub",
  });
  nodes["b-countdown"] = block(
    "CountdownBlock",
    "Đếm ngược",
    {
      ...box(25, 150, 340),
      primaryColor: "#5a9a7a",
      textColor: "#ffffff",
      labelColor: "#888",
      digitFontSize: s(28),
      elementId: "b-countdown",
    },
    secMain,
    []
  );
  t("b-date", secMain, {
    content: weddingDate.slice(0, 10),
    cardField: "wedding_date",
    fontSize: s(20),
    fontFamily: "'Cormorant Garamond', serif",
    fontWeight: "600",
    color: "#2d4a3e",
    textAlign: "center",
    ...box(20, 280, 350),
    elementId: "b-date",
  });
  t("b-venue", secMain, {
    content:
      "<b>Địa điểm</b><br/>Trung tâm tiệc cưới Sen Việt<br/>123 Nguyễn Văn Linh, Q.7, TP.HCM",
    fontSize: s(15),
    fontFamily: "'Source Sans Pro', sans-serif",
    color: "#444",
    textAlign: "center",
    ...box(25, 520, 340),
    elementId: "b-venue",
  });

  nodes[secFoot] = block(
    "SectionBlock",
    "Section",
    {
      height: s(72),
      bgType: "color",
      bgColor: "#3d6b5c",
      elementId: "b-section-foot",
    },
    "ROOT",
    ["b-foot"]
  );
  t("b-foot", secFoot, {
    content: "Royal Wedding",
    fontSize: s(13),
    fontFamily: "'Source Sans Pro', sans-serif",
    color: "#ffffff",
    textAlign: "center",
    ...box(10, 24, 370),
    elementId: "b-foot",
  });

  return nodes;
}

/** VIP — full layout Pro nhưng palette vàng đen + ảnh cover khác */
function applyVipLuxuryTheme(nodes) {
  const gold = "#c8a97e";
  const dark = "#1c1410";
  const cream = "#f5f0e8";

  for (const node of Object.values(nodes)) {
    const p = node?.props;
    if (!p) continue;
    const name = node.type?.resolvedName;

    if (name === "TextBlock" && typeof p.color === "string") {
      if (p.color === "#ffffff" || p.color === "#fff") continue;
      if (p.fontSize >= s(50)) p.color = gold;
      else if (p.color === "#880000" || p.color === "#ea6c88" || p.color === "#E37D7D") {
        p.color = gold;
      }
    }

    if (name === "SectionBlock") {
      if (p.elementId === "section-cover") {
        p.overlayColor = dark;
        p.overlayOpacity = 45;
      }
      if (p.elementId === "section-save-date") {
        p.overlayColor = cream;
        p.overlayOpacity = 25;
        p.bgColor = dark;
      }
      if (p.elementId === "section-thanks") {
        p.overlayColor = dark;
        p.overlayOpacity = 70;
      }
      if (p.elementId === "section-footer") {
        p.bgColor = dark;
      }
    }

    if (name === "CountdownBlock") {
      p.primaryColor = gold;
      p.textColor = dark;
      p.labelColor = cream;
    }

    if (name === "ImageBlock" && p.borderColor) {
      p.borderColor = gold;
    }

    if (name === "IconBlock" && p.color) {
      p.color = gold;
    }
  }

  return nodes;
}

function buildVipLuxuryJson(opts = {}) {
  const nodes = buildPremiumSaveTheDateJson({
    ...opts,
    images: { ...PREMIUM_IMAGES, ...SHOWCASE_IMAGES.vip, cover: SHOWCASE_IMAGES.vip.cover },
  });
  return applyVipLuxuryTheme(nodes);
}

/**
 * @param {"basic"|"pro"|"vip"} variant
 * @param {object} [opts] brideName, groomName, weddingDate
 */
export function buildShowcaseTemplateJson(variant, opts = {}) {
  let nodes;
  if (variant === "basic") {
    nodes = buildBasicMinimalJson(opts);
  } else if (variant === "vip") {
    nodes = buildVipLuxuryJson(opts);
  } else {
    nodes = buildPremiumSaveTheDateJson({ ...opts, images: SHOWCASE_IMAGES.pro });
  }
  return injectInvitationAnimations(nodes, { force: true });
}

export function thumbnailForVariant(variant) {
  if (variant === "basic") return SHOWCASE_IMAGES.basic.cover;
  if (variant === "vip") return SHOWCASE_IMAGES.vip.cover;
  return PREMIUM_IMAGES.cover;
}

export const VARIANT_DESCRIPTIONS = {
  basic:
    "Thiệp tối giản 3 phần: lời mời, đếm ngược, địa điểm — tông kem xanh lá, phù hợp gói Basic.",
  pro: "Mẫu đầy đủ cổ điển hồng: cover, Save the Date, sự kiện, mừng cưới, album ảnh — hiệu ứng xuất hiện.",
  vip: "Phiên bản sang trọng vàng đen: đủ section như Pro, cover & accent luxury, bỏ branding.",
};
