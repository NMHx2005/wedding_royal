/**
 * Seed dữ liệu demo đầy đủ.
 *
 * Chạy: npm run seed:demo
 * Cần .env.local: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *
 * Tài khoản demo:
 *   Email: demo@mewedding.vn
 *   Mật khẩu: DemoMewedding2026!
 */

import { createClient } from "@supabase/supabase-js";

const DEMO_EMAIL = "demo@mewedding.vn";
const DEMO_PASSWORD = "DemoMewedding2026!";
const DEMO_NAME = "Ánh Minh";
const CARD_SLUG = "thiep-demo-minh-thanh";

function requireEnv(name) {
  const v = process.env[name];
  if (!v) {
    console.error(`Thiếu biến môi trường: ${name}`);
    process.exit(1);
  }
  return v;
}

async function getOrCreateDemoUser(supabase) {
  const { data: created, error: createErr } = await supabase.auth.admin.createUser({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: DEMO_NAME },
  });

  if (created?.user?.id) {
    console.log("Đã tạo user demo:", DEMO_EMAIL);
    return created.user.id;
  }

  const msg = createErr?.message?.toLowerCase() ?? "";
  const duplicate =
    createErr &&
    (msg.includes("already") ||
      msg.includes("registered") ||
      msg.includes("exists") ||
      createErr.status === 422);

  if (duplicate) {
    for (let page = 1; page <= 50; page++) {
      const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
      if (error) throw error;
      const found = data.users.find((u) => u.email?.toLowerCase() === DEMO_EMAIL.toLowerCase());
      if (found) {
        console.log("User demo đã tồn tại:", DEMO_EMAIL);
        return found.id;
      }
      if (data.users.length < 200) break;
    }
  }

  console.error("Không tạo / không tìm thấy user demo:", createErr?.message ?? createErr);
  process.exit(1);
}

async function main() {
  const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const userId = await getOrCreateDemoUser(admin);

  await admin.from("profiles").upsert(
    {
      id: userId,
      full_name: DEMO_NAME,
      role: "user",
      payout_bank_code: "VCB",
      payout_account_number: "0123456789",
      payout_account_name: "NGUYEN ANH MINH",
    },
    { onConflict: "id" }
  );

  const weddingDate = new Date();
  weddingDate.setMonth(weddingDate.getMonth() + 2);

  // Upsert by slug to avoid duplicate key errors on re-runs
  const { data: card, error: cardErr } = await admin
    .from("wedding_cards")
    .upsert({
      user_id: userId,
      slug: CARD_SLUG,
      plan: "pro",
      status: "active",
      bride_name: "Ánh Minh",
      bride_parents: "Ông Nguyễn Văn An & Bà Trần Thị Bích",
      groom_name: "Tuấn Thành",
      groom_parents: "Ông Lê Hoàng Nam & Bà Phạm Thu Hà",
      wedding_date: weddingDate.toISOString(),
      ceremony_time: "15:30 — Lễ vu quy tại tư gia",
      reception_time: "18:00 — Tiệc cưới",
      venue_name: "Trung tâm tiệc cưới Sen Việt",
      venue_address: "123 Nguyễn Văn Linh, Quận 7, TP.HCM",
      venue_maps_url: "https://www.google.com/maps?q=10.7329,106.7223",
      love_story:
        "Gặp nhau một chiều mưa ở quán cà phê nhỏ.\nTừ hai người xa lạ đến hai trái tim chung nhịp.\nHôm nay chúng mình muốn chia sẻ niềm vui ấy với bạn.",
      hashtag: "#MinhThanh2026",
      template_id: "golden-luxury",
      primary_color: "#c8a97e",
      confetti_effect: "petals",
      show_gift_box: true,
      gift_bank_name: "VietcomBank",
      gift_account_number: "0123456789",
      gift_account_name: "NGUYEN ANH MINH",
      view_count: 128,
      cover_image_url: "https://picsum.photos/seed/coverdemo/800/1000",
    }, { onConflict: "slug" })
    .select("id")
    .single();

  if (cardErr || !card) {
    console.error("Không tạo được wedding_cards:", cardErr?.message);
    process.exit(1);
  }

  const cardId = card.id;
  console.log("Card ID:", cardId);

  // ─── Bride/Groom profiles ─────────────────────────────────────────────────
  await admin.from("bride_groom_profiles").upsert([
    {
      card_id: cardId,
      role: "bride",
      full_name: "Nguyễn Ánh Minh",
      email: "anhminh@example.com",
      phone: "0901234567",
      birthday: "1998-05-15",
      hometown: "Quận 1, TP.HCM",
      description: "Người yêu bông hoa và những buổi chiều tà. Mơ ước có một đám cưới nhỏ ấm cúng.",
      avatar_url: "https://picsum.photos/seed/bride/200/200",
    },
    {
      card_id: cardId,
      role: "groom",
      full_name: "Lê Tuấn Thành",
      email: "tuanthanh@example.com",
      phone: "0907654321",
      birthday: "1996-11-20",
      hometown: "Bình Thạnh, TP.HCM",
      description: "Kỹ sư phần mềm, thích cà phê sáng và những chuyến đi dài.",
      avatar_url: "https://picsum.photos/seed/groom/200/200",
    },
  ], { onConflict: "card_id,role" });

  // ─── Guest groups ─────────────────────────────────────────────────────────
  const { data: groups } = await admin.from("guest_groups").insert([
    { card_id: cardId, name: "Họ hàng nhà gái", color: "#f43f5e" },
    { card_id: cardId, name: "Họ hàng nhà trai", color: "#8b5cf6" },
    { card_id: cardId, name: "Bạn bè", color: "#0ea5e9" },
    { card_id: cardId, name: "Đồng nghiệp", color: "#10b981" },
  ]).select("id, name");

  const getGroupId = (name) => groups?.find((g) => g.name === name)?.id ?? null;

  // ─── Guests ───────────────────────────────────────────────────────────────
  const guestData = [
    { name: "Chú Hùng", phone: "0901111111", group_name: "Họ hàng nhà gái", gift_type: "cash", gift_amount: 1000000, attending: true, invite_sent: true },
    { name: "Cô Mai", phone: "0901111112", group_name: "Họ hàng nhà gái", gift_type: "gold", gift_amount: 1, attending: true, invite_sent: true },
    { name: "Dì Lan", phone: "0901111113", group_name: "Họ hàng nhà gái", gift_type: null, gift_amount: null, attending: null, invite_sent: false },
    { name: "Bác Tuấn", phone: "0902222221", group_name: "Họ hàng nhà trai", gift_type: "cash", gift_amount: 800000, attending: true, invite_sent: true },
    { name: "Cô Hà", phone: "0902222222", group_name: "Họ hàng nhà trai", gift_type: "gift", gift_amount: null, attending: true, invite_sent: true },
    { name: "Hoàng Yến", phone: "0903333331", email: "hoangyen@example.com", group_name: "Bạn bè", attending: true, invite_sent: true },
    { name: "Đức Anh", phone: "0903333332", group_name: "Bạn bè", attending: false, invite_sent: true },
    { name: "Lan Chi", phone: "0903333333", group_name: "Bạn bè", attending: true, invite_sent: true, is_vip: true },
    { name: "Minh Khôi", phone: "0903333334", group_name: "Bạn bè", attending: null, invite_sent: false },
    { name: "Thùy Linh", phone: "0903333335", group_name: "Bạn bè", attending: true, invite_sent: true },
    { name: "Quản lý Phương", phone: "0904444441", email: "phuong@company.com", group_name: "Đồng nghiệp", attending: true, invite_sent: true },
    { name: "Team Dev", phone: "0904444442", group_name: "Đồng nghiệp", attending: null, invite_sent: false },
    { name: "HR Trâm", phone: "0904444443", group_name: "Đồng nghiệp", attending: true, invite_sent: true },
  ];

  const guestRows = guestData.map((g, i) => ({
    card_id: cardId,
    name: g.name,
    phone: g.phone || null,
    email: g.email || null,
    group_id: getGroupId(g.group_name),
    group_label: g.group_name,
    token: `feedface${String(i + 1).padStart(2, "0")}deadbeef0203`,
    avatar_url: null,
    is_vip: g.is_vip ?? false,
    gift_type: g.gift_type || null,
    gift_amount: g.gift_amount || null,
    attending: g.attending ?? null,
    invite_sent: g.invite_sent ?? false,
    num_guests: 1,
  }));

  const { data: insertedGuests } = await admin.from("guests").insert(guestRows).select("id, name, token");
  console.log(`Đã seed ${insertedGuests?.length ?? 0} khách mời`);

  // ─── RSVP ─────────────────────────────────────────────────────────────────
  const hoang = insertedGuests?.find((x) => x.name === "Hoàng Yến");
  const duc = insertedGuests?.find((x) => x.name === "Đức Anh");

  await admin.from("rsvp").insert([
    { card_id: cardId, guest_id: hoang?.id ?? null, guest_name: "Hoàng Yến", attending: true, guest_count: 2, note: "Mình đi cùng em gái" },
    { card_id: cardId, guest_id: duc?.id ?? null, guest_name: "Đức Anh", attending: false, guest_count: 1, note: "Bận công tác xa, gửi lời chúc nhé!" },
    { card_id: cardId, guest_id: null, guest_name: "Khách walk-in", attending: true, guest_count: 1, note: null },
  ]);

  // ─── Wishes ───────────────────────────────────────────────────────────────
  await admin.from("wishes").insert([
    { card_id: cardId, guest_name: "Cô Mai", message: "Chúc hai em trăm năm hạnh phúc, sớm có tin vui!", is_approved: true },
    { card_id: cardId, guest_name: "Team Marketing", message: "Happy wedding! Đội công ty luôn ủng hộ hai bạn.", is_approved: true },
    { card_id: cardId, guest_name: "Bác Tuấn", message: "Chúc mừng hôn lễ! Chúc hai con sống hạnh phúc bên nhau mãi mãi.", is_approved: true },
    { card_id: cardId, guest_name: "Nhóm bạn F8", message: "Cả nhóm chúc hai bạn hạnh phúc và có nhiều baby cute 🎉", is_approved: true },
    { card_id: cardId, guest_name: "HR Trâm", message: "Mừng cưới Minh & Thành! Chúc hai bạn mãi mãi yêu nhau nhé.", is_approved: true },
    { card_id: cardId, guest_name: "Lan Chi", message: "Tình yêu của hai bạn thật đẹp. Chúc mừng ngày trọng đại!", is_approved: true },
    { card_id: cardId, guest_name: "Đồng nghiệp cũ", message: "Chúc mừng nha! Nhớ mời ăn cưới đấy 😄", is_approved: true },
    { card_id: cardId, guest_name: "Khách ẩn danh", message: "Lời chúc chờ duyệt từ khách ẩn danh", is_approved: false },
  ]);

  // ─── Gift logs ────────────────────────────────────────────────────────────
  await admin.from("gift_logs").insert([
    { card_id: cardId, guest_name: "Chú Hùng", amount: 1000000, note: "Mừng cưới" },
    { card_id: cardId, guest_name: "Nhóm bạn F8", amount: 1200000, note: "Góp chung" },
    { card_id: cardId, guest_name: "Bác Tuấn", amount: 800000, note: "Mừng hôn lễ" },
    { card_id: cardId, guest_name: null, amount: 200000, note: "Khách lẻ" },
  ]);

  // ─── Wedding photos ───────────────────────────────────────────────────────
  await admin.from("wedding_photos").insert([
    { card_id: cardId, url: "https://picsum.photos/seed/wed1/800/1000", caption: "Pre-wedding at Đà Lạt", sort_order: 1 },
    { card_id: cardId, url: "https://picsum.photos/seed/wed2/800/1000", caption: "Buổi chiều tại hồ Tuyền Lâm", sort_order: 2 },
    { card_id: cardId, url: "https://picsum.photos/seed/wed3/800/1000", caption: null, sort_order: 3 },
    { card_id: cardId, url: "https://picsum.photos/seed/wed4/800/1000", caption: "Ảnh đôi tại vườn hoa", sort_order: 4 },
    { card_id: cardId, url: "https://picsum.photos/seed/wed5/800/1000", caption: null, sort_order: 5 },
  ]);

  // ─── Wedding plan & tasks ─────────────────────────────────────────────────
  const { data: wPlan } = await admin.from("wedding_plans").insert({
    card_id: cardId,
    name: "Kế hoạch cưới 2026",
    note: "Đám cưới tại Trung tâm Sen Việt",
    budget: 150000000,
  }).select("id").single();

  if (wPlan) {
    const { data: groups1 } = await admin.from("plan_task_groups").insert([
      { plan_id: wPlan.id, name: "Chuẩn bị lễ cưới", sort_order: 1 },
      { plan_id: wPlan.id, name: "Trang phục & ngoại hình", sort_order: 2 },
      { plan_id: wPlan.id, name: "Tiệc cưới", sort_order: 3 },
    ]).select("id, name");

    const g1 = groups1?.find((g) => g.name === "Chuẩn bị lễ cưới")?.id;
    const g2 = groups1?.find((g) => g.name === "Trang phục & ngoại hình")?.id;
    const g3 = groups1?.find((g) => g.name === "Tiệc cưới")?.id;

    const tasks = [];
    if (g1) tasks.push(
      { group_id: g1, title: "Đặt địa điểm tổ chức", status: "done", due_date: "2026-01-15", sort_order: 1 },
      { group_id: g1, title: "Chụp ảnh cưới pre-wedding", status: "done", due_date: "2026-02-20", sort_order: 2 },
      { group_id: g1, title: "In thiệp cưới", status: "in_progress", due_date: "2026-04-01", sort_order: 3 },
      { group_id: g1, title: "Gửi thiệp mời khách", status: "pending", due_date: "2026-04-15", sort_order: 4 },
    );
    if (g2) tasks.push(
      { group_id: g2, title: "Chọn váy cưới cô dâu", status: "done", due_date: "2026-02-01", sort_order: 1 },
      { group_id: g2, title: "Thuê vest chú rể", status: "done", due_date: "2026-02-01", sort_order: 2 },
      { group_id: g2, title: "Đặt lịch makeup thử", status: "in_progress", due_date: "2026-04-10", sort_order: 3 },
      { group_id: g2, title: "Đặt lịch makeup ngày cưới", status: "pending", due_date: "2026-05-01", sort_order: 4 },
    );
    if (g3) tasks.push(
      { group_id: g3, title: "Chốt menu thực đơn", status: "done", due_date: "2026-03-01", sort_order: 1 },
      { group_id: g3, title: "Đặt bánh cưới", status: "in_progress", due_date: "2026-04-20", sort_order: 2 },
      { group_id: g3, title: "Thuê xe hoa", status: "pending", due_date: "2026-05-01", sort_order: 3 },
      { group_id: g3, title: "Chuẩn bị quà lưu niệm cho khách", status: "pending", due_date: "2026-05-05", sort_order: 4 },
    );

    if (tasks.length > 0) {
      await admin.from("plan_tasks").insert(tasks);
      console.log(`Đã seed ${tasks.length} tasks`);
    }
  }

  // ─── Budget plan ──────────────────────────────────────────────────────────
  const { data: bPlan } = await admin.from("budget_plans").insert({
    card_id: cardId,
    name: "Ngân sách đám cưới 2026",
    total_budget: 150000000,
    note: "Dự trù cho khoảng 100 khách",
  }).select("id").single();

  if (bPlan) {
    await admin.from("budget_categories").insert([
      { plan_id: bPlan.id, name: "Địa điểm & Sảnh cưới", description: "Thuê sảnh, trang trí", estimated: 40000000, actual: 38000000 },
      { plan_id: bPlan.id, name: "Nhiếp ảnh & Quay phim", description: "Studio pre-wedding + ngày cưới", estimated: 20000000, actual: 18500000 },
      { plan_id: bPlan.id, name: "Trang phục", description: "Váy cưới, vest, áo dài đám hỏi", estimated: 15000000, actual: 12000000 },
      { plan_id: bPlan.id, name: "Thực đơn & Đồ uống", description: "100 khách, 10 bàn", estimated: 30000000, actual: 0 },
      { plan_id: bPlan.id, name: "Hoa & Trang trí", description: "Hoa cầm tay, backdrop, bàn tiệc", estimated: 12000000, actual: 0 },
      { plan_id: bPlan.id, name: "Thiệp & In ấn", description: "200 thiệp mời + phong bì", estimated: 3000000, actual: 2800000 },
      { plan_id: bPlan.id, name: "Xe hoa & Di chuyển", description: "Limousine + xe đón đưa", estimated: 8000000, actual: 0 },
      { plan_id: bPlan.id, name: "Quà lưu niệm", description: "100 hộp quà cho khách", estimated: 5000000, actual: 0 },
    ]);
    console.log("Đã seed budget categories");
  }

  // ─── Referral code ────────────────────────────────────────────────────────
  const refCode = "MINH" + Math.random().toString(36).substring(2, 6).toUpperCase();
  await admin.from("referral_codes").upsert(
    { user_id: userId, code: refCode },
    { onConflict: "user_id" }
  );
  console.log("Referral code:", refCode);

  // ─── Video catalog (ensure seeded) ───────────────────────────────────────
  const { data: existingCatalog } = await admin.from("video_catalog").select("id").limit(1);
  if (!existingCatalog?.length) {
    await admin.from("video_catalog").insert([
      { name: "Gói Basic", description: "Video highlight 3-5 phút, nhạc nền, 1 lần chỉnh sửa", price: 1500000, package: "basic", sort_order: 1 },
      { name: "Gói Pro", description: "Video cinematic 8-10 phút, drone shot, 2 lần chỉnh sửa", price: 3500000, package: "pro", sort_order: 2 },
      { name: "Gói VIP", description: "Full film 20+ phút, concept art, unlimited chỉnh sửa, 4K", price: 7000000, package: "vip", sort_order: 3 },
    ]);
    console.log("Đã seed video catalog");
  }

  // ─── Affiliate products (ensure seeded) ──────────────────────────────────
  const { data: existingProducts } = await admin.from("affiliate_products").select("id").limit(1);
  if (!existingProducts?.length) {
    await admin.from("affiliate_products").insert([
      { name: "Album ảnh cưới cao cấp", description: "Album da thật, in màu chất lượng cao", category: "photography", price: 850000, link_url: "https://shopee.vn", thumbnail_url: "https://picsum.photos/seed/album/400/300", sort_order: 1 },
      { name: "Váy cưới thiết kế", description: "Váy cưới đính đá Swarovski, đuôi dài 3m", category: "dress", price: 15000000, link_url: "https://shopee.vn", thumbnail_url: "https://picsum.photos/seed/dress/400/300", sort_order: 2 },
      { name: "Hoa cưới tươi cao cấp", description: "Bó hoa cầm tay, hoa hồng Ecuador", category: "flowers", price: 2500000, link_url: "https://shopee.vn", thumbnail_url: "https://picsum.photos/seed/flowers/400/300", sort_order: 3 },
      { name: "Nhẫn cưới vàng 18k", description: "Nhẫn cưới đôi vàng 18k có khắc tên", category: "jewelry", price: 6800000, link_url: "https://shopee.vn", thumbnail_url: "https://picsum.photos/seed/ring/400/300", sort_order: 4 },
      { name: "Xe hoa limousine", description: "Thuê xe hoa Limousine 8 chỗ trang trí hoa tươi", category: "transport", price: 3200000, link_url: "https://shopee.vn", thumbnail_url: "https://picsum.photos/seed/limo/400/300", sort_order: 5 },
    ]);
    console.log("Đã seed affiliate products");
  }

  // ─── Website settings (ensure seeded) ────────────────────────────────────
  const { data: existingSettings } = await admin.from("website_settings").select("key").limit(1);
  if (!existingSettings?.length) {
    await admin.from("website_settings").insert([
      { key: "contact", value: { email: "hello@mewedding.vn", phone: "0282 2222 886", address: "Tầng 5, 77 Nguyễn Huệ, Q.1, TP.HCM", tax_url: "", working_hours: "8:00 - 22:00, Thứ 2 - Chủ Nhật" } },
      { key: "social", value: { facebook: "https://facebook.com/mewedding", tiktok: "https://tiktok.com/@mewedding", youtube: "https://youtube.com/@mewedding", zalo: "https://zalo.me/mewedding", instagram: "" } },
      { key: "seo", value: { title: "meWedding — Thiệp cưới online đẹp nhất Việt Nam", description: "Tạo thiệp cưới online miễn phí.", og_image: "" } },
    ]);
    console.log("Đã seed website settings");
  }

  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  console.log("\n--- Seed xong ---");
  console.log("Đăng nhập:", DEMO_EMAIL, "/", DEMO_PASSWORD);
  console.log("Thiệp công khai:", `${base}/thiep/${CARD_SLUG}`);
  if (insertedGuests?.length) {
    for (const g of insertedGuests.slice(0, 3)) {
      console.log(`  Link khách «${g.name}»: ${base}/thiep/${CARD_SLUG}/${g.token}`);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
