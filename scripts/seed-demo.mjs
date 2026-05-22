/**
 * Seed demo Royal Wedding — chạy lại an toàn (upsert + reset thiệp theo user).
 *
 * Chạy: npm run seed:demo
 * Cần .env.local: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *
 * Thiệp mẫu đầy đủ (Craft + khách/ảnh/kế hoạch) — tài khoản demo@:
 *   demo@royalwedding.vn / DemoRoyalWedding2026!
 *   • thiep-mau-basic  (gói Basic)
 *   • thiep-mau-pro    (gói Pro)
 *   • thiep-mau-vip    (gói VIP)
 *
 * User đã kích hoạt gói, chưa có thiệp Craft (shell draft, content_json trống):
 *   basic@royalwedding.vn / BasicRoyal2026!
 *   pro@royalwedding.vn   / ProRoyal2026!
 *   vip@royalwedding.vn   / VipRoyal2026!
 *
 * Admin:  admin@royalwedding.vn / AdminRoyalWedding2026!
 * Paywall (chưa trả): paywall@royalwedding.vn / PaywallRoyal2026!
 */

import { createClient } from "@supabase/supabase-js";
import { loadPremiumTemplateContent } from "../lib/editor/load-premium-template-content.mjs";
import { buildShowcaseTemplateJson } from "../lib/editor/presets/showcase-template-variants.mjs";
import {
  upsertShowcaseTemplateCatalog,
  templateIdForPlan,
} from "./seed-premium-template.mjs";

/** Mẫu React cũ từ migration 001/002 — không hiện trên /kho-giao-dien */
const LEGACY_MARKETING_TEMPLATE_IDS = [
  "premium-save-the-date",
  "classic-white",
  "golden-luxury",
  "minimal-modern",
  "pastel-garden",
  "noir-elegant",
  "han-vibes",
  "forest-boho",
  "art-deco-rose",
];

async function deactivateLegacyMarketingTemplates(admin) {
  const { error } = await admin
    .from("templates")
    .update({ is_active: false })
    .in("id", LEGACY_MARKETING_TEMPLATE_IDS);
  if (error) {
    console.warn("Không tắt mẫu legacy:", error.message);
    return;
  }
  console.log(
    `Đã ẩn ${LEGACY_MARKETING_TEMPLATE_IDS.length} mẫu legacy khỏi kho giao diện`
  );
}

/** Đồng bộ với lib/data/invitation-music-presets.ts */
const DEMO_BACKGROUND_MUSIC_URL =
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3";

const SITE_NAME = "Royal Wedding";

const DEMO_EMAIL = "demo@royalwedding.vn";
const DEMO_PASSWORD = "DemoRoyalWedding2026!";
const DEMO_NAME = "Ánh Minh";

/** 3 thiệp mẫu showcase — mỗi gói một thiệp Craft đầy đủ (user demo@). */
const SHOWCASE_CARDS = [
  {
    slug: "thiep-mau-basic",
    plan: "basic",
    brideName: "Thu Hà",
    groomName: "Đức Anh",
    weddingDate: "2026-06-20",
    personaKey: "card1",
  },
  {
    slug: "thiep-mau-pro",
    plan: "pro",
    brideName: "Cẩm Linh",
    groomName: "Minh Quang",
    weddingDate: "2026-08-18",
    personaKey: "card2",
  },
  {
    slug: "thiep-mau-vip",
    plan: "vip",
    brideName: "Mỹ Linh",
    groomName: "Quang Huy",
    weddingDate: "2026-03-03",
    personaKey: "card3",
  },
];

/** Đã thanh toán gói — chỉ shell draft (chưa content_json / chưa chọn mẫu). */
const SUBSCRIBED_EMPTY_USERS = [
  { email: "basic@royalwedding.vn", password: "BasicRoyal2026!", fullName: "Nguyễn Thị Basic", plan: "basic" },
  { email: "pro@royalwedding.vn", password: "ProRoyal2026!", fullName: "Trần Văn Pro", plan: "pro" },
  { email: "vip@royalwedding.vn", password: "VipRoyal2026!", fullName: "Lê Thị VIP", plan: "vip" },
];

const ADMIN_EMAIL = "admin@royalwedding.vn";
const ADMIN_PASSWORD = "AdminRoyalWedding2026!";

const PAYWALL_EMAIL = "paywall@royalwedding.vn";
const PAYWALL_PASSWORD = "PaywallRoyal2026!";
const PAYWALL_CARD_SLUG = "thiep-demo-chua-thanh-toan";

/** Khớp lib/plans/plan-config-shared.ts DEFAULT_PLAN_CONFIG */
const PLAN_CONFIG = {
  basic: {
    name: "Basic",
    price: 198000,
    discount_percent: 49,
    description: "Gói Basic — thiệp cưới cơ bản",
    max_cards: 1,
    max_photos_album: 10,
    max_photos: 10,
    public_months: 6,
    features: {
      stats: false,
      auto_approve_wishes: false,
      photobook: false,
      remove_branding: false,
      custom_confetti: false,
      export_wishes: false,
      guest_rsvp: true,
      personalized_invite: false,
    },
  },
  pro: {
    name: "Gói Pro",
    price: 199000,
    discount_percent: 49,
    description: "Gói Pro — nâng cấp",
    max_cards: 2,
    max_photos_album: 40,
    max_photos: 40,
    public_months: 24,
    features: {
      stats: true,
      auto_approve_wishes: true,
      photobook: true,
      remove_branding: true,
      custom_confetti: true,
      export_wishes: true,
      guest_rsvp: true,
      personalized_invite: false,
    },
  },
  vip: {
    name: "Gói VIP",
    price: 399000,
    discount_percent: 52,
    description: "Gói VIP — nâng cấp",
    max_cards: 3,
    max_photos_album: 100,
    max_photos: 100,
    public_months: null,
    features: {
      stats: true,
      auto_approve_wishes: true,
      photobook: true,
      remove_branding: true,
      custom_confetti: true,
      export_wishes: true,
      guest_rsvp: true,
      personalized_invite: true,
    },
  },
};

const WEBSITE_SETTINGS = [
  {
    key: "plan_config",
    value: PLAN_CONFIG,
  },
  {
    key: "contact",
    value: {
      email: "hello@royalwedding.vn",
      phone: "0282 2222 886",
      address: "Tầng 5, 77 Nguyễn Huệ, Q.1, TP.HCM",
      tax_url: "",
      working_hours: "8:00 - 22:00, Thứ 2 - Chủ Nhật",
    },
  },
  {
    key: "social",
    value: {
      facebook: "https://facebook.com/royalwedding",
      tiktok: "https://tiktok.com/@royalwedding",
      youtube: "https://youtube.com/@royalwedding",
      zalo: "https://zalo.me/royalwedding",
      instagram: "",
    },
  },
  {
    key: "seo",
    value: {
      title: `${SITE_NAME} — Thiệp cưới online đẹp nhất Việt Nam`,
      description:
        "Tạo thiệp cưới online, gửi link mời khách, quản lý RSVP và lời chúc. Thanh toán an toàn qua PayOS.",
      og_image: "https://mehappy.vn/images/logo-mehappy.png",
    },
  },
  {
    key: "faq",
    value: [
      {
        q: `${SITE_NAME} có gói miễn phí không?`,
        a: "Các gói Basic, Pro và VIP đều có giá bán trên trang Bảng giá (admin có thể đặt giá = 0 để khuyến mãi). Sau khi đăng ký, bạn chọn gói và thanh toán qua PayOS để kích hoạt dashboard.",
      },
      {
        q: "Thiệp cưới có hoạt động trên điện thoại không?",
        a: "Có, thiệp được tối ưu cho điện thoại, máy tính bảng và desktop.",
      },
      {
        q: "Tôi có thể tùy chỉnh thiệp theo ý muốn không?",
        a: "Hoàn toàn có thể: template, màu sắc, font, nhạc nền, album ảnh và nhiều tính năng khác tùy gói.",
      },
      {
        q: "Dữ liệu của tôi có an toàn không?",
        a: "Dữ liệu lưu trên cloud, truyền tải qua SSL. Bạn có thể xuất và quản lý khách mời, lời chúc trong dashboard.",
      },
      {
        q: "Thanh toán xong có cần admin duyệt không?",
        a: "Không. Hệ thống tự kích hoạt gói ngay khi PayOS xác nhận thanh toán thành công.",
      },
    ],
  },
  {
    key: "affiliate_settings",
    value: {
      commission_rate_percent: 10,
      min_withdrawal_vnd: 100000,
    },
  },
];

function requireEnv(name) {
  const v = process.env[name];
  if (!v) {
    console.error(`Thiếu biến môi trường: ${name}`);
    process.exit(1);
  }
  return v;
}

async function getOrCreateUser(supabase, { email, password, fullName, role = "user" }) {
  const { data: created, error: createErr } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  let userId = created?.user?.id;

  if (!userId) {
    const msg = createErr?.message?.toLowerCase() ?? "";
    const duplicate =
      createErr &&
      (msg.includes("already") ||
        msg.includes("registered") ||
        msg.includes("exists") ||
        createErr.status === 422);

    if (!duplicate) {
      console.error(`Không tạo user ${email}:`, createErr?.message ?? createErr);
      process.exit(1);
    }

    for (let page = 1; page <= 50; page++) {
      const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
      if (error) throw error;
      const found = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
      if (found) {
        userId = found.id;
        console.log("User đã tồn tại:", email);
        break;
      }
      if (data.users.length < 200) break;
    }
  } else {
    console.log("Đã tạo user:", email);
  }

  if (!userId) {
    console.error("Không tìm thấy user:", email);
    process.exit(1);
  }

  await supabase.from("profiles").upsert(
    {
      id: userId,
      full_name: fullName,
      role,
    },
    { onConflict: "id" }
  );

  return userId;
}

async function upsertWebsiteSettings(admin) {
  for (const row of WEBSITE_SETTINGS) {
    const { error } = await admin.from("website_settings").upsert(
      { key: row.key, value: row.value },
      { onConflict: "key" }
    );
    if (error) {
      console.error(`website_settings.${row.key}:`, error.message);
      process.exit(1);
    }
  }
  console.log("Đã upsert website_settings (plan_config, contact, seo, faq, …)");
}

async function clearCardChildData(admin, cardId) {
  const byCard = ["rsvp", "wishes", "gift_logs", "wedding_photos", "guests", "guest_groups", "bride_groom_profiles"];
  for (const table of byCard) {
    await admin.from(table).delete().eq("card_id", cardId);
  }

  const { data: wPlans } = await admin.from("wedding_plans").select("id").eq("card_id", cardId);
  for (const wp of wPlans ?? []) {
    const { data: groups } = await admin.from("plan_task_groups").select("id").eq("plan_id", wp.id);
    for (const g of groups ?? []) {
      await admin.from("plan_tasks").delete().eq("group_id", g.id);
    }
    await admin.from("plan_task_groups").delete().eq("plan_id", wp.id);
  }
  await admin.from("wedding_plans").delete().eq("card_id", cardId);

  const { data: bPlans } = await admin.from("budget_plans").select("id").eq("card_id", cardId);
  for (const bp of bPlans ?? []) {
    await admin.from("budget_categories").delete().eq("plan_id", bp.id);
  }
  await admin.from("budget_plans").delete().eq("card_id", cardId);

  await admin.from("orders").delete().eq("card_id", cardId);
  await admin.from("wedding_card_feature_entitlements").delete().eq("card_id", cardId);
}

async function seedPaidOrder(admin, { userId, cardId, plan, amount }) {
  const payosOrderId = `seed-${plan}-${cardId.slice(0, 8)}`;
  const now = new Date().toISOString();

  await admin.from("orders").upsert(
    {
      user_id: userId,
      card_id: cardId,
      payos_order_id: payosOrderId,
      plan,
      amount,
      status: "paid",
      order_type: "plan",
      paid_at: now,
    },
    { onConflict: "payos_order_id" }
  );
}

/** Cùng content_json với mẫu Save The Date Cổ Điển trong kho giao diện */
function loadDemoCraftContent() {
  try {
    return loadPremiumTemplateContent();
  } catch (e) {
    console.warn("Không đọc được preset Save The Date Cổ Điển:", e.message);
    return null;
  }
}

async function upsertDemoCard(admin, userId, { slug, plan, paid, fullDemo }) {
  const weddingDate = new Date();
  weddingDate.setMonth(weddingDate.getMonth() + 2);
  const now = new Date().toISOString();

  const base = {
    user_id: userId,
    slug,
    plan,
    status: paid ? "active" : "draft",
    paid_at: paid ? now : null,
    payment_order_id: paid ? `seed-order-${slug}` : null,
    bride_name: fullDemo ? "Ánh Minh" : "Cô dâu",
    groom_name: fullDemo ? "Tuấn Thành" : "Chú rể",
    wedding_date: weddingDate.toISOString(),
  };

  const craftContent = fullDemo ? loadDemoCraftContent() : null;

  const fullFields = fullDemo
    ? {
        bride_parents: "Ông Nguyễn Văn An & Bà Trần Thị Bích",
        groom_parents: "Ông Lê Hoàng Nam & Bà Phạm Thu Hà",
        ceremony_time: "15:30 — Lễ vu quy tại tư gia",
        reception_time: "18:00 — Tiệc cưới",
        venue_name: "Trung tâm tiệc cưới Sen Việt",
        venue_address: "123 Nguyễn Văn Linh, Quận 7, TP.HCM",
        venue_maps_url: "https://www.google.com/maps?q=10.7329,106.7223",
        love_story:
          "Gặp nhau một chiều mưa ở quán cà phê nhỏ.\nTừ hai người xa lạ đến hai trái tim chung nhịp.\nHôm nay chúng mình muốn chia sẻ niềm vui ấy với bạn.",
        hashtag: "#MinhThanh2026",
        template_id: templateIdForPlan(plan),
        primary_color: "#c8a97e",
        confetti_effect: "petals",
        background_music_url: DEMO_BACKGROUND_MUSIC_URL,
        show_gift_box: true,
        gift_bank_name: "VietcomBank",
        gift_account_number: "0123456789",
        gift_account_name: "NGUYEN ANH MINH",
        view_count: 128,
        cover_image_url: "https://picsum.photos/seed/coverdemo/800/1000",
        remove_branding: plan === "vip",
        ...(craftContent ? { content_json: craftContent } : {}),
      }
    : {};

  const { data: card, error: cardErr } = await admin
    .from("wedding_cards")
    .upsert({ ...base, ...fullFields }, { onConflict: "slug" })
    .select("id")
    .single();

  if (cardErr || !card) {
    console.error(`Không upsert wedding_cards (${slug}):`, cardErr?.message);
    process.exit(1);
  }

  if (paid) {
    await seedPaidOrder(admin, {
      userId,
      cardId: card.id,
      plan,
      amount: PLAN_CONFIG[plan].price,
    });
  }

  return card.id;
}

/** Xóa toàn bộ thiệp của user (kèm dữ liệu con) */
async function clearAllUserCards(admin, userId, label = "user") {
  const { data: cards } = await admin.from("wedding_cards").select("id").eq("user_id", userId);
  for (const card of cards ?? []) {
    await clearCardChildData(admin, card.id);
  }
  if (cards?.length) {
    await admin.from("wedding_cards").delete().eq("user_id", userId);
    console.log(`Đã xóa ${cards.length} thiệp cũ (${label})`);
  }
}

function planShowcaseFlags(plan) {
  return {
    remove_branding: plan === "vip" || plan === "pro",
    confetti_effect: plan === "basic" ? "none" : "petals",
    show_gift_box: plan !== "basic",
    view_count: plan === "vip" ? 256 : plan === "pro" ? 128 : 42,
  };
}

/** Tạo thiệp Craft.js showcase — Premium Save The Date + đúng gói plan. */
async function createShowcaseCard(admin, userId, { slug, plan, brideName, groomName, weddingDate }) {
  const now = new Date().toISOString();
  const weddingIso = new Date(weddingDate).toISOString();
  const flags = planShowcaseFlags(plan);
  const contentJson = buildShowcaseTemplateJson(plan, {
    brideName,
    groomName,
    weddingDate: weddingIso,
  });

  const { data: card, error } = await admin
    .from("wedding_cards")
    .upsert(
      {
        user_id: userId,
        slug,
        plan,
        status: "active",
        paid_at: now,
        payment_order_id: `seed-order-${slug}`,
        bride_name: brideName,
        groom_name: groomName,
        wedding_date: weddingIso,
        venue_name: "Trung tâm tiệc cưới Sen Việt",
        venue_address: "123 Nguyễn Văn Linh, Quận 7, TP.HCM",
        template_id: templateIdForPlan(plan),
        background_music_url: DEMO_BACKGROUND_MUSIC_URL,
        content_json: contentJson,
        ...flags,
      },
      { onConflict: "slug" }
    )
    .select("id")
    .single();

  if (error || !card) {
    console.error(`Không tạo thiệp showcase ${slug}:`, error?.message);
    return null;
  }

  await seedPaidOrder(admin, {
    userId,
    cardId: card.id,
    plan,
    amount: PLAN_CONFIG[plan].price,
  });

  return { id: card.id, slug, plan, brideName, groomName };
}

/**
 * User đã trả gói nhưng chưa thiết kế thiệp: một shell draft, không content_json, không dữ liệu con.
 * (Cần row wedding_cards có paid_at để middleware/dashboard cho phép truy cập.)
 */
async function seedSubscribedEmptyUser(admin, { email, password, fullName, plan }) {
  const userId = await getOrCreateUser(admin, { email, password, fullName, role: "user" });
  await clearAllUserCards(admin, userId, email);

  const slug = `tai-khoan-${plan}-${userId.replace(/-/g, "").slice(0, 8)}`;
  const now = new Date().toISOString();
  const weddingDate = new Date();
  weddingDate.setMonth(weddingDate.getMonth() + 3);

  const { data: card, error } = await admin
    .from("wedding_cards")
    .upsert(
      {
        user_id: userId,
        slug,
        plan,
        status: "draft",
        paid_at: now,
        payment_order_id: `seed-sub-${plan}-${userId.slice(0, 8)}`,
        bride_name: "Cô dâu",
        groom_name: "Chú rể",
        wedding_date: weddingDate.toISOString(),
        content_json: null,
      },
      { onConflict: "slug" }
    )
    .select("id")
    .single();

  if (error || !card) {
    console.error(`Không tạo shell ${email}:`, error?.message);
    return null;
  }

  await seedPaidOrder(admin, {
    userId,
    cardId: card.id,
    plan,
    amount: PLAN_CONFIG[plan].price,
  });

  console.log(`  ${email} — gói ${plan.toUpperCase()} đã trả, chưa có mẫu Craft (shell draft)`);
  return { userId, email, plan, cardId: card.id, slug };
}

// ── Persona definitions ──────────────────────────────────────────────────────
const PERSONAS = {
  card1: {
    bride: {
      full_name: "Trần Cẩm Linh",
      email: "camlinh@example.com",
      phone: "0901234567",
      birthday: "1998-05-15",
      hometown: "Quận 1, TP.HCM",
      description: "Người yêu bông hoa và những buổi chiều tà bên ly trà sữa.",
      avatar_url: "https://picsum.photos/seed/bride1/200/200",
    },
    groom: {
      full_name: "Nguyễn Minh Quang",
      email: "minhquang@example.com",
      phone: "0907654321",
      birthday: "1996-11-20",
      hometown: "Bình Thạnh, TP.HCM",
      description: "Kỹ sư phần mềm, mê cà phê và chụp ảnh phong cảnh.",
      avatar_url: "https://picsum.photos/seed/groom1/200/200",
    },
    groups: [
      { name: "Họ hàng nhà gái", color: "#f43f5e" },
      { name: "Họ hàng nhà trai", color: "#8b5cf6" },
      { name: "Bạn bè", color: "#0ea5e9" },
      { name: "Đồng nghiệp", color: "#10b981" },
    ],
    guests: [
      { name: "Chú Hùng", phone: "0901111111", group_name: "Họ hàng nhà gái", gift_type: "cash", gift_amount: 1000000, attending: true, invite_sent: true },
      { name: "Cô Mai", phone: "0901111112", group_name: "Họ hàng nhà gái", gift_type: "gold", gift_amount: 1, attending: true, invite_sent: true },
      { name: "Dì Lan", phone: "0901111113", group_name: "Họ hàng nhà gái", attending: null, invite_sent: false },
      { name: "Bác Tuấn", phone: "0902222221", group_name: "Họ hàng nhà trai", gift_type: "cash", gift_amount: 800000, attending: true, invite_sent: true },
      { name: "Cô Hà", phone: "0902222222", group_name: "Họ hàng nhà trai", gift_type: "gift", attending: true, invite_sent: true },
      { name: "Hoàng Yến", phone: "0903333331", email: "hoangyen@example.com", group_name: "Bạn bè", attending: true, invite_sent: true },
      { name: "Đức Anh", phone: "0903333332", group_name: "Bạn bè", attending: false, invite_sent: true },
      { name: "Lan Chi", phone: "0903333333", group_name: "Bạn bè", attending: true, invite_sent: true, is_vip: true },
      { name: "Minh Khôi", phone: "0903333334", group_name: "Bạn bè", attending: null, invite_sent: false },
      { name: "Thùy Linh", phone: "0903333335", group_name: "Bạn bè", attending: true, invite_sent: true },
      { name: "Quản lý Phương", phone: "0904444441", email: "phuong@company.com", group_name: "Đồng nghiệp", attending: true, invite_sent: true },
      { name: "Team Dev", phone: "0904444442", group_name: "Đồng nghiệp", attending: null, invite_sent: false },
      { name: "HR Trâm", phone: "0904444443", group_name: "Đồng nghiệp", attending: true, invite_sent: true },
    ],
    wishes: [
      { guest_name: "Cô Mai", message: "Chúc hai em trăm năm hạnh phúc! Mong các em luôn yêu thương nhau.", is_approved: true },
      { guest_name: "Team Marketing", message: `Happy wedding từ team ${SITE_NAME}! 🎊`, is_approved: true },
      { guest_name: "Bác Tuấn", message: "Chúc mừng hôn lễ! Chúc đôi uyên ương vạn sự như ý.", is_approved: true },
      { guest_name: "Lan Chi", message: "Chúc mừng ngày trọng đại! Wishing you forever happiness.", is_approved: true },
      { guest_name: "Khách ẩn danh", message: "Lời chúc đang chờ duyệt", is_approved: false },
    ],
    giftLogs: [
      { guest_name: "Chú Hùng", amount: 1000000, note: "Mừng đám cưới" },
      { guest_name: "Bác Tuấn", amount: 800000, note: "Mừng hôn lễ" },
    ],
    photos: [
      { url: "https://picsum.photos/seed/p1c1/800/1000", caption: "Pre-wedding Đà Lạt", sort_order: 1 },
      { url: "https://picsum.photos/seed/p2c1/800/1000", caption: "Thác Datanla", sort_order: 2 },
      { url: "https://picsum.photos/seed/p3c1/800/1000", caption: null, sort_order: 3 },
      { url: "https://picsum.photos/seed/p4c1/800/1000", caption: "Vườn hoa", sort_order: 4 },
    ],
    weddingPlan: {
      name: "Kế hoạch cưới Minh Quang & Cẩm Linh",
      budget: 180000000,
      groups: [
        { name: "Chuẩn bị lễ cưới", tasks: [
          { title: "Đặt địa điểm tổ chức", status: "done", due_date: "2026-01-15" },
          { title: "Gửi thiệp mời", status: "in_progress", due_date: "2026-05-01" },
          { title: "Chụp ảnh pre-wedding", status: "done", due_date: "2026-03-20" },
        ]},
        { name: "Tiệc cưới", tasks: [
          { title: "Chốt menu tiệc", status: "done", due_date: "2026-03-01" },
          { title: "Trang trí sảnh", status: "pending", due_date: "2026-08-15" },
          { title: "Chọn nhạc tiệc", status: "in_progress", due_date: "2026-07-01" },
        ]},
      ],
    },
    budgetPlan: {
      name: "Ngân sách đám cưới 2026",
      total_budget: 180000000,
      categories: [
        { name: "Địa điểm & Sảnh cưới", estimated: 50000000, actual: 48000000 },
        { name: "Nhiếp ảnh & Quay phim", estimated: 25000000, actual: 22000000 },
        { name: "Thực đơn & Ẩm thực", estimated: 40000000, actual: 0 },
        { name: "Trang phục cô dâu chú rể", estimated: 30000000, actual: 28500000 },
        { name: "Hoa tươi & Trang trí", estimated: 20000000, actual: 0 },
      ],
    },
  },

  card2: {
    bride: {
      full_name: "Trần Cẩm Linh",
      email: "camlinh@example.com",
      phone: "0901234567",
      birthday: "1998-05-15",
      hometown: "Quận 1, TP.HCM",
      description: "Yêu thích hoa tulip và những chuyến du lịch biển.",
      avatar_url: "https://picsum.photos/seed/bride2/200/200",
    },
    groom: {
      full_name: "Nguyễn Minh Quang",
      email: "minhquang@example.com",
      phone: "0907654321",
      birthday: "1996-11-20",
      hometown: "Bình Thạnh, TP.HCM",
      description: "Lập trình viên, thích leo núi và đọc sách.",
      avatar_url: "https://picsum.photos/seed/groom2/200/200",
    },
    groups: [
      { name: "Gia đình", color: "#f43f5e" },
      { name: "Bạn bè thân", color: "#0ea5e9" },
    ],
    guests: [
      { name: "Ba Minh Quang", phone: "0911000001", group_name: "Gia đình", gift_type: "cash", gift_amount: 2000000, attending: true, invite_sent: true },
      { name: "Mẹ Cẩm Linh", phone: "0911000002", group_name: "Gia đình", gift_type: "gold", attending: true, invite_sent: true },
      { name: "Anh Tú", phone: "0911000003", group_name: "Gia đình", attending: true, invite_sent: true },
      { name: "Em Ngọc", phone: "0911000004", group_name: "Gia đình", attending: null, invite_sent: false },
      { name: "Bảo Ngọc", phone: "0912000001", email: "baongoc@example.com", group_name: "Bạn bè thân", attending: true, invite_sent: true, is_vip: true },
      { name: "Hùng Dũng", phone: "0912000002", group_name: "Bạn bè thân", attending: true, invite_sent: true },
      { name: "Thu Trang", phone: "0912000003", group_name: "Bạn bè thân", attending: false, invite_sent: true },
      { name: "Văn Khoa", phone: "0912000004", group_name: "Bạn bè thân", attending: null, invite_sent: false },
    ],
    wishes: [
      { guest_name: "Ba Minh Quang", message: "Ba chúc con trai hạnh phúc bên người bạn đời!", is_approved: true },
      { guest_name: "Bảo Ngọc", message: "Chúc mừng bestie! Cuối cùng cũng chịu cưới rồi hehe", is_approved: true },
      { guest_name: "Thu Trang", message: "Rất tiếc không tham dự được, chúc hai bạn vạn sự tốt lành!", is_approved: true },
    ],
    giftLogs: [
      { guest_name: "Ba Minh Quang", amount: 2000000, note: "Quà của ba" },
    ],
    photos: [
      { url: "https://picsum.photos/seed/p1c2/800/1000", caption: "Phong cách hiện đại", sort_order: 1 },
      { url: "https://picsum.photos/seed/p2c2/800/1000", caption: null, sort_order: 2 },
    ],
    weddingPlan: {
      name: "Kế hoạch cưới — Mẫu 2",
      budget: 120000000,
      groups: [
        { name: "Công việc cần làm", tasks: [
          { title: "Chọn váy cưới", status: "done", due_date: "2026-04-01" },
          { title: "Đặt nhẫn cưới", status: "in_progress", due_date: "2026-06-01" },
        ]},
      ],
    },
    budgetPlan: {
      name: "Ngân sách đám cưới — Mẫu 2",
      total_budget: 120000000,
      categories: [
        { name: "Địa điểm", estimated: 35000000, actual: 35000000 },
        { name: "Nhiếp ảnh", estimated: 18000000, actual: 0 },
        { name: "Thực đơn", estimated: 28000000, actual: 0 },
      ],
    },
  },

  card3: {
    bride: {
      full_name: "Lê Mỹ Linh",
      email: "mylinh@example.com",
      phone: "0931234567",
      birthday: "1999-03-08",
      hometown: "Hội An, Quảng Nam",
      description: "Giáo viên tiểu học, yêu trẻ em và thiên nhiên.",
      avatar_url: "https://picsum.photos/seed/bride3/200/200",
    },
    groom: {
      full_name: "Trần Quang Huy",
      email: "quanghuy@example.com",
      phone: "0937654321",
      birthday: "1997-07-15",
      hometown: "Đà Nẵng",
      description: "Kiến trúc sư, đam mê thiết kế nội thất và nấu ăn.",
      avatar_url: "https://picsum.photos/seed/groom3/200/200",
    },
    groups: [
      { name: "Họ hàng", color: "#f59e0b" },
      { name: "Bạn bè Hội An", color: "#8b5cf6" },
      { name: "Đồng nghiệp", color: "#06b6d4" },
    ],
    guests: [
      { name: "Cô Ba Linh", phone: "0931000001", group_name: "Họ hàng", gift_type: "cash", gift_amount: 1500000, attending: true, invite_sent: true },
      { name: "Chú Năm Huy", phone: "0931000002", group_name: "Họ hàng", attending: true, invite_sent: true },
      { name: "Dì Sáu Hương", phone: "0931000003", group_name: "Họ hàng", attending: null, invite_sent: true },
      { name: "Anh Hai Phong", phone: "0931000004", group_name: "Họ hàng", gift_type: "cash", gift_amount: 500000, attending: true, invite_sent: true },
      { name: "Kim Anh", phone: "0932000001", email: "kimanh@example.com", group_name: "Bạn bè Hội An", attending: true, invite_sent: true, is_vip: true },
      { name: "Hải Nam", phone: "0932000002", group_name: "Bạn bè Hội An", attending: true, invite_sent: true },
      { name: "Thanh Vân", phone: "0932000003", group_name: "Bạn bè Hội An", attending: false, invite_sent: true },
      { name: "Minh Thư", phone: "0932000004", group_name: "Bạn bè Hội An", attending: null, invite_sent: false },
      { name: "Hiệu trưởng Ngọc", phone: "0933000001", group_name: "Đồng nghiệp", attending: true, invite_sent: true },
      { name: "Cô Phương Liên", phone: "0933000002", group_name: "Đồng nghiệp", attending: true, invite_sent: true },
    ],
    wishes: [
      { guest_name: "Cô Ba Linh", message: "Chúc cháu Mỹ Linh và Quang Huy trăm năm hạnh phúc, sớm có tin vui!", is_approved: true },
      { guest_name: "Kim Anh", message: "Bestie cưới rồi! Chúc hai bạn mãi mãi hạnh phúc như hôm nay nhé!", is_approved: true },
      { guest_name: "Thanh Vân", message: "Rất tiếc không đến được. Gửi ngàn lời chúc tốt đẹp nhất đến đôi uyên ương!", is_approved: true },
      { guest_name: "Hiệu trưởng Ngọc", message: "Chúc cô giáo Mỹ Linh và gia đình mới luôn hạnh phúc, viên mãn!", is_approved: true },
    ],
    giftLogs: [
      { guest_name: "Cô Ba Linh", amount: 1500000, note: "Tiền mừng cưới" },
      { guest_name: "Anh Hai Phong", amount: 500000, note: "Mừng em gái" },
    ],
    photos: [
      { url: "https://picsum.photos/seed/p1c3/800/1000", caption: "Pre-wedding Hội An", sort_order: 1 },
      { url: "https://picsum.photos/seed/p2c3/800/1000", caption: "Bờ biển Đà Nẵng", sort_order: 2 },
      { url: "https://picsum.photos/seed/p3c3/800/1000", caption: null, sort_order: 3 },
    ],
    weddingPlan: {
      name: "Kế hoạch cưới Quang Huy & Mỹ Linh",
      budget: 200000000,
      groups: [
        { name: "Lễ cưới truyền thống", tasks: [
          { title: "Họp mặt hai gia đình", status: "done", due_date: "2025-12-25" },
          { title: "Lễ đính hôn", status: "done", due_date: "2026-01-20" },
          { title: "In thiệp mời", status: "in_progress", due_date: "2026-01-15" },
        ]},
        { name: "Tiệc cưới", tasks: [
          { title: "Đặt sảnh tiệc", status: "done", due_date: "2025-11-01" },
          { title: "Chọn catering", status: "done", due_date: "2025-12-01" },
          { title: "Thuê ban nhạc", status: "pending", due_date: "2026-02-01" },
        ]},
        { name: "Tuần trăng mật", tasks: [
          { title: "Đặt vé máy bay Bali", status: "done", due_date: "2026-01-10" },
          { title: "Đặt resort", status: "in_progress", due_date: "2026-01-15" },
        ]},
      ],
    },
    budgetPlan: {
      name: "Ngân sách đám cưới Quang Huy & Mỹ Linh",
      total_budget: 200000000,
      categories: [
        { name: "Địa điểm & Sảnh tiệc", estimated: 60000000, actual: 58000000 },
        { name: "Nhiếp ảnh & Quay phim", estimated: 30000000, actual: 28000000 },
        { name: "Thực đơn & Buffet", estimated: 50000000, actual: 0 },
        { name: "Váy cưới & Vest chú rể", estimated: 25000000, actual: 24000000 },
        { name: "Hoa tươi & Decor", estimated: 15000000, actual: 0 },
        { name: "Tuần trăng mật Bali", estimated: 30000000, actual: 28500000 },
      ],
    },
  },
};

async function seedCardContent(admin, cardId, personaKey) {
  const persona = PERSONAS[personaKey] ?? PERSONAS.card1;

  await clearCardChildData(admin, cardId);

  await admin.from("bride_groom_profiles").upsert(
    [
      { card_id: cardId, role: "bride", ...persona.bride },
      { card_id: cardId, role: "groom", ...persona.groom },
    ],
    { onConflict: "card_id,role" }
  );

  const { data: groups } = await admin
    .from("guest_groups")
    .insert(persona.groups.map((g) => ({ card_id: cardId, ...g })))
    .select("id, name");

  const getGroupId = (name) => groups?.find((g) => g.name === name)?.id ?? null;

  const tokenPrefix = personaKey === "card1" ? "c1" : personaKey === "card2" ? "c2" : "c3";
  const guestRows = persona.guests.map((g, i) => ({
    card_id: cardId,
    name: g.name,
    phone: g.phone || null,
    email: g.email || null,
    group_id: getGroupId(g.group_name),
    group_label: g.group_name,
    token: `${tokenPrefix}${String(i + 1).padStart(3, "0")}demo${Math.random().toString(36).slice(2, 8)}`,
    is_vip: g.is_vip ?? false,
    gift_type: g.gift_type || null,
    gift_amount: g.gift_amount ?? null,
    attending: g.attending ?? null,
    invite_sent: g.invite_sent ?? false,
    num_guests: 1,
  }));

  const { data: insertedGuests } = await admin.from("guests").insert(guestRows).select("id, name, token");
  console.log(`  → ${insertedGuests?.length ?? 0} khách mời`);

  // RSVP cho khách đầu tiên attending=true và false
  const rsvpFirst = insertedGuests?.find((x) => persona.guests.find((g) => g.name === x.name)?.attending === true);
  const rsvpNo = insertedGuests?.find((x) => persona.guests.find((g) => g.name === x.name)?.attending === false);
  const rsvpRows = [];
  if (rsvpFirst) rsvpRows.push({ card_id: cardId, guest_id: rsvpFirst.id, guest_name: rsvpFirst.name, attending: true, guest_count: 2, note: "Xác nhận tham dự" });
  if (rsvpNo) rsvpRows.push({ card_id: cardId, guest_id: rsvpNo.id, guest_name: rsvpNo.name, attending: false, guest_count: 1, note: "Không thể tham dự" });
  rsvpRows.push({ card_id: cardId, guest_id: null, guest_name: "Khách walk-in", attending: true, guest_count: 1 });
  await admin.from("rsvp").insert(rsvpRows);

  await admin.from("wishes").insert(persona.wishes.map((w) => ({ card_id: cardId, ...w })));
  console.log(`  → ${persona.wishes.length} lời chúc`);

  await admin.from("gift_logs").insert(persona.giftLogs.map((g) => ({ card_id: cardId, ...g })));

  await admin.from("wedding_photos").insert(persona.photos.map((p) => ({ card_id: cardId, ...p })));
  console.log(`  → ${persona.photos.length} ảnh photobook`);

  // Kế hoạch cưới
  const { data: wPlan } = await admin
    .from("wedding_plans")
    .insert({ card_id: cardId, name: persona.weddingPlan.name, budget: persona.weddingPlan.budget, note: "Được tạo bởi seed-demo" })
    .select("id")
    .single();

  if (wPlan) {
    for (let gi = 0; gi < persona.weddingPlan.groups.length; gi++) {
      const grp = persona.weddingPlan.groups[gi];
      const { data: tg } = await admin
        .from("plan_task_groups")
        .insert({ plan_id: wPlan.id, name: grp.name, sort_order: gi + 1 })
        .select("id")
        .single();
      if (tg) {
        await admin.from("plan_tasks").insert(
          grp.tasks.map((t, ti) => ({ group_id: tg.id, title: t.title, status: t.status, due_date: t.due_date, sort_order: ti + 1 }))
        );
      }
    }
    console.log(`  → Kế hoạch cưới: ${persona.weddingPlan.groups.length} nhóm công việc`);
  }

  // Ngân sách
  const { data: bPlan } = await admin
    .from("budget_plans")
    .insert({ card_id: cardId, name: persona.budgetPlan.name, total_budget: persona.budgetPlan.total_budget })
    .select("id")
    .single();

  if (bPlan) {
    await admin.from("budget_categories").insert(
      persona.budgetPlan.categories.map((c) => ({ plan_id: bPlan.id, ...c }))
    );
    console.log(`  → Ngân sách: ${persona.budgetPlan.categories.length} hạng mục`);
  }

  return insertedGuests;
}

async function seedCatalogsIfEmpty(admin) {
  const { data: videos } = await admin.from("video_catalog").select("id").limit(1);
  if (!videos?.length) {
    await admin.from("video_catalog").insert([
      { name: "Gói Basic", description: "Video highlight 3–5 phút", price: 1500000, package: "basic", sort_order: 1 },
      { name: "Gói Pro", description: "Video cinematic 8–10 phút", price: 3500000, package: "pro", sort_order: 2 },
      { name: "Gói VIP", description: "Full film 20+ phút, 4K", price: 7000000, package: "vip", sort_order: 3 },
    ]);
    console.log("Đã seed video_catalog");
  }

  const { data: products } = await admin.from("affiliate_products").select("id").limit(1);
  if (!products?.length) {
    await admin.from("affiliate_products").insert([
      { name: "Album ảnh cưới cao cấp", description: "Album da thật", category: "photography", price: 850000, link_url: "https://shopee.vn", thumbnail_url: "https://picsum.photos/seed/album/400/300", sort_order: 1 },
      { name: "Váy cưới thiết kế", description: "Váy đính đá", category: "dress", price: 15000000, link_url: "https://shopee.vn", thumbnail_url: "https://picsum.photos/seed/dress/400/300", sort_order: 2 },
    ]);
    console.log("Đã seed affiliate_products");
  }
}

async function main() {
  const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log(`\n=== Seed ${SITE_NAME} ===\n`);

  await upsertWebsiteSettings(admin);
  await seedCatalogsIfEmpty(admin);

  await deactivateLegacyMarketingTemplates(admin);
  const tpl = await upsertShowcaseTemplateCatalog(admin);
  console.log(
    `Kho giao diện: ${tpl.templateIds.length} mẫu Craft (${tpl.templateIds.join(", ")}), ${tpl.animCount} phần tử có hiệu ứng`
  );

  const adminUserId = await getOrCreateUser(admin, {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    fullName: "Admin Royal",
    role: "admin",
  });
  console.log("Admin ID:", adminUserId);

  const demoUserId = await getOrCreateUser(admin, {
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
    fullName: DEMO_NAME,
    role: "user",
  });

  await admin.from("profiles").upsert(
    {
      id: demoUserId,
      full_name: DEMO_NAME,
      role: "user",
      payout_bank_code: "VCB",
      payout_account_number: "0123456789",
      payout_account_name: "NGUYEN ANH MINH",
    },
    { onConflict: "id" }
  );

  // 3 thiệp mẫu showcase (Basic / Pro / VIP) — Craft đầy đủ
  await clearAllUserCards(admin, demoUserId, "demo@");

  const showcaseCards = [];
  for (const card of SHOWCASE_CARDS) {
    const created = await createShowcaseCard(admin, demoUserId, card);
    if (created) {
      showcaseCards.push({ ...created, personaKey: card.personaKey });
      console.log(
        `Thiệp mẫu [${card.plan.toUpperCase()}] «${card.groomName} & ${card.brideName}» (${card.slug})`
      );
    }
  }

  let firstGuests = [];
  for (let i = 0; i < showcaseCards.length; i++) {
    const c = showcaseCards[i];
    console.log(`\nSeeding dữ liệu thiệp mẫu ${c.plan.toUpperCase()} (${c.personaKey})...`);
    const gs = (await seedCardContent(admin, c.id, c.personaKey)) ?? [];
    if (i === 0) firstGuests = gs;
  }
  const guests = firstGuests;

  // User đã trả gói — chưa thiết kế thiệp (shell)
  console.log("\nTài khoản đã kích hoạt gói (chưa có Craft):");
  const emptySubscribers = [];
  for (const u of SUBSCRIBED_EMPTY_USERS) {
    const row = await seedSubscribedEmptyUser(admin, u);
    if (row) emptySubscribers.push(row);
  }

  const refCode = "ROYAL" + Math.random().toString(36).substring(2, 6).toUpperCase();
  await admin.from("referral_codes").upsert({ user_id: demoUserId, code: refCode }, { onConflict: "user_id" });

  const paywallUserId = await getOrCreateUser(admin, {
    email: PAYWALL_EMAIL,
    password: PAYWALL_PASSWORD,
    fullName: "Test Paywall",
    role: "user",
  });
  await clearAllUserCards(admin, paywallUserId, "paywall@");
  const paywallCardId = await upsertDemoCard(admin, paywallUserId, {
    slug: PAYWALL_CARD_SLUG,
    plan: "basic",
    paid: false,
    fullDemo: false,
  });
  console.log("Paywall (chưa trả, shell draft):", paywallCardId);

  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  console.log("\n─────────────────────────────────────────────");
  console.log("              SEED HOÀN TẤT");
  console.log("─────────────────────────────────────────────\n");
  console.log("TÀI KHOẢN");
  console.log(`  Demo (3 thiệp mẫu):  ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
  for (const u of SUBSCRIBED_EMPTY_USERS) {
    console.log(`  Gói ${u.plan.toUpperCase()} (chưa Craft): ${u.email} / ${u.password}`);
  }
  console.log(`  Admin:               ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  console.log(`  Paywall:             ${PAYWALL_EMAIL} / ${PAYWALL_PASSWORD}`);
  console.log(`  Mã giới thiệu demo:  ${refCode}`);
  console.log();
  console.log("Dashboard:", `${base}/dashboard`);
  console.log();
  console.log("THIỆP MẪU (demo@ — Craft + dữ liệu đầy đủ):");
  for (const c of showcaseCards) {
    console.log(`  [${c.plan.toUpperCase()}] ${c.groomName} & ${c.brideName}`);
    console.log(`    Editor:    ${base}/dashboard/editor/${c.id}`);
    console.log(`    Công khai: ${base}/thiep/${c.slug}`);
  }
  if (emptySubscribers.length) {
    console.log();
    console.log("USER ĐÃ TRẢ GÓI — CHƯA CHỌN MẪU (vào Thiết lập / Cài đặt thiệp để tạo):");
    for (const u of emptySubscribers) {
      console.log(`  ${u.email} (${u.plan}) → ${base}/dashboard`);
    }
  }
  if (guests?.length && showcaseCards[0]) {
    console.log();
    console.log("Link khách cá nhân hóa (thiệp mẫu Basic):");
    for (const g of guests.slice(0, 3)) {
      console.log(`  ${g.name}: ${base}/thiep/${showcaseCards[0].slug}/${g.token}`);
    }
  }
  console.log();
  console.log("Chạy lại npm run seed:demo an toàn — cài đặt & plan_config luôn được ghi đè.\n");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
