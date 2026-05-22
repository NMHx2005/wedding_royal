# Tài liệu dự án Royal Wedding

> Nền tảng tạo và quản lý **thiệp cưới online** — khách xem thiệp, RSVP, gửi lời chúc; cô dâu chú rể chỉnh nội dung trên dashboard, mua gói Basic / Pro / VIP qua PayOS.

---

## Mục lục

1. [Tổng quan](#1-tổng-quan)
2. [Công nghệ sử dụng](#2-công-nghệ-sử-dụng)
3. [Cấu trúc hệ thống](#3-cấu-trúc-hệ-thống)
4. [Danh sách tính năng đầy đủ](#4-danh-sách-tính-năng-đầy-đủ)
5. [Gói dịch vụ Basic / Pro / VIP](#5-gói-dịch-vụ-basic--pro--vip)
6. [Luồng nghiệp vụ chính](#6-luồng-nghiệp-vụ-chính)
7. [Cài đặt môi trường phát triển (Local)](#7-cài-đặt-môi-trường-phát-triển-local)
8. [Database & Migration Supabase](#8-database--migration-supabase)
9. [Biến môi trường](#9-biến-môi-trường)
10. [Hướng dẫn Deploy Production](#10-hướng-dẫn-deploy-production)
11. [Tài khoản demo & Seed dữ liệu](#11-tài-khoản-demo--seed-dữ-liệu)
12. [Hướng dẫn quản trị Admin](#12-hướng-dẫn-quản-trị-admin)
13. [API Routes](#13-api-routes)
14. [Scripts npm](#14-scripts-npm)
15. [QA & Xử lý sự cố thường gặp](#15-qa--xử-lý-sự-cố-thường-gặp)

---

## 1. Tổng quan

| Thành phần | Đường dẫn | Mô tả |
|------------|-----------|--------|
| Trang marketing | `/`, `/bang-gia`, `/kho-giao-dien`, `/cac-cap-doi`, `/lien-he` | Giới thiệu sản phẩm, bảng giá, kho mẫu, cặp đôi tiêu biểu, form liên hệ |
| Đăng ký / Đăng nhập | `/register`, `/login`, `/forgot-password` | Supabase Auth (Email + Google OAuth) |
| Dashboard user | `/dashboard`, `/dashboard/[cardId]/…` | Quản lý thiệp, khách mời, ảnh, kế hoạch, chi tiêu… |
| Trình editor | `/dashboard/editor/[cardId]` | Editor kéo-thả Craft.js |
| Thiệp công khai | `/thiep/[slug]`, `/thiep/[slug]/[guestToken]` | Link gửi khách mời |
| Admin | `/admin` | Quản trị hệ thống (role `admin`) |

**Lưu ý quan trọng:** User mới sau đăng ký cần **kích hoạt gói dịch vụ** (Basic / Pro / VIP) tại **Gói dịch vụ** (`/dashboard/goi-dich-vu`) thì mới truy cập đầy đủ dashboard. Dữ liệu lưu trên **Supabase**; thanh toán qua **PayOS**.

---

## 2. Công nghệ sử dụng

| Lớp | Công nghệ |
|-----|-----------|
| Frontend | Next.js 14 (App Router), React 18, TypeScript |
| UI | Tailwind CSS, Radix UI, Lucide Icons, Framer Motion |
| Editor | Craft.js, react-moveable, @dnd-kit |
| Backend / DB | Supabase (PostgreSQL, Auth, Storage, RLS) |
| Thanh toán | PayOS (`@payos/node`) |
| Form | React Hook Form + Zod |
| Toast / Modal | Sonner, ConfirmDialog tùy chỉnh |
| Export | xlsx (Excel), QRCode |

---

## 3. Cấu trúc hệ thống

```
app/
├── (marketing)/          # Trang công khai
├── (auth)/               # Login, Register, Forgot password
├── dashboard/
│   ├── (home)/           # Trang chủ dashboard, gói dịch vụ, video-orders…
│   ├── [cardId]/         # Quản lý theo từng thiệp
│   └── editor/[cardId]/  # Editor Craft.js
├── admin/                # Panel quản trị
├── thiep/[slug]/         # Thiệp công khai
├── api/                  # REST API (PayOS, RSVP, wishes…)
└── auth/callback/        # OAuth callback

components/
├── dashboard/            # DashboardChrome, modals…
├── editor/               # Blocks, panels, canvas
├── invitation/           # Viewer thiệp công khai
├── landing/              # Marketing UI
└── admin/                # Sidebar, pagination, filters

lib/
├── plans/                # Cấu hình gói, paywall logic
├── editor/               # Migrate content, save, viewer layout
├── subscription/         # Paywall messages, require subscription
└── supabase/             # Client/server/middleware

supabase/migrations/      # SQL migrations 001 → 012
scripts/                  # seed-demo, validate, generate preset
```

---

## 4. Danh sách tính năng đầy đủ

### 4.1. Trang Marketing (công khai)

| Trang | URL | Tính năng |
|-------|-----|-----------|
| Trang chủ | `/` | Hero, showcase mẫu thiệp, cặp đôi tiêu biểu, FAQ, CTA đăng ký |
| Bảng giá | `/bang-gia` | So sánh gói Basic / Pro / VIP, modal chi tiết tính năng, FAQ |
| Kho giao diện | `/kho-giao-dien` | Lưới mẫu thiệp từ DB + API marketing, lọc theo gói |
| Các cặp đôi | `/cac-cap-doi` | Thiệp showcase thật (public cards) |
| Liên hệ | `/lien-he` | Form gửi yêu cầu → bảng `contact_inquiries` |
| Navbar / Footer | Toàn site marketing | Menu, link đăng nhập / đăng ký |

### 4.2. Xác thực & Tài khoản

| Tính năng | Mô tả |
|-----------|--------|
| Đăng ký email | Supabase signUp, tạo `profiles` qua trigger DB |
| Xác nhận email | Nếu Supabase bật Confirm email → user phải bấm link trước khi đăng nhập; app hiển thị màn hình hướng dẫn + gửi lại email |
| Đăng nhập email | signInWithPassword |
| Google OAuth | Đăng ký / đăng nhập Google → callback `/auth/callback` |
| Quên mật khẩu | `/forgot-password` |
| Phân quyền | `profiles.role`: `user` \| `admin` |
| Middleware | Bảo vệ `/dashboard`, `/admin`; paywall redirect nếu chưa kích hoạt gói |

### 4.3. Dashboard người dùng

#### Cấp tài khoản (không gắn thiệp cụ thể)

| Mục | URL | Tính năng |
|-----|-----|-----------|
| Quản lý thiệp cưới | `/dashboard` | Danh sách thiệp, thống kê tổng, tạo thiệp mới (theo giới hạn gói) |
| Gói dịch vụ | `/dashboard/goi-dich-vu` | Chọn Basic/Pro/VIP, thanh toán PayOS, lịch sử đơn |
| Đơn hàng video | `/dashboard/video-orders` | Đặt / theo dõi đơn video cưới |
| Giới thiệu (Referral) | `/dashboard/gioi-thieu` | Mã giới thiệu, hoa hồng, rút tiền |
| Sản phẩm liên kết | `/dashboard/san-pham` | Xem sản phẩm affiliate gợi ý |

#### Cấp từng thiệp (`/dashboard/[cardId]/…`)

| Mục | Key | Tính năng chính |
|-----|-----|-----------------|
| Hồ sơ thiệp cưới | `ho-so` | Thông tin cô dâu / chú rể, ảnh đại diện |
| Thiết lập thiệp | `thiet-lap` | Slug, ngày cưới, địa điểm, nhạc nền, chọn mẫu Craft |
| Cài đặt thiệp cưới | `cai-dat-thiep` | Màu, font, confetti, hộp quà, branding |
| Giao diện thiệp | `giao-dien` | Chọn / đổi template catalog |
| Quản lý khách mời | `khach-moi` | CRUD khách, nhóm, gửi invite mailto, import, link cá nhân hoá (VIP) |
| Quản lý lời chúc | `loi-chuc` | Duyệt / ẩn / xóa lời chúc, bulk, export CSV (Pro+) |
| Quản lý Photobook | `photobook` | Upload / sắp xếp ảnh album (Pro+) |
| Thống kê thiệp | `thong-ke` | Lượt xem, khách, lời chúc (Pro+) |
| Kế hoạch cưới | `ke-hoach` | Nhiều kế hoạch, nhóm nhiệm vụ, checklist |
| Quản lý chi tiêu | `chi-tieu` | Ngân sách cưới, danh mục chi, export CSV |
| Mừng cưới | `mung-cuoi` | Ghi nhận tiền mừng, export Excel |

#### Paywall & UX

- User **chưa kích hoạt gói**: middleware chuyển về `/dashboard/goi-dich-vu?paywall=1`
- Bấm menu bị khóa → toast tiếng Việt + nút **「Kích hoạt ngay」**
- Banner vàng nhắc kích hoạt trên trang gói dịch vụ
- Modal xác nhận xóa tùy chỉnh (không dùng `confirm()` browser)

### 4.4. Trình Editor Craft.js (`/dashboard/editor/[cardId]`)

| Tính năng | Mô tả |
|-----------|--------|
| Kéo-thả block | Section, Text, Image, Countdown, Divider, Button, Icon, GiftBox |
| Resize / di chuyển | react-moveable, lưu tọa độ chính xác (kể cả âm) |
| Property panel | Màu, font, shadow, filter, animation, events |
| Layer panel | Sắp xếp lớp, reorder |
| History | Undo/redo, snapshot sessionStorage |
| Lưu thủ công | Nút Lưu, Ctrl+S |
| Tự lưu | Toggle bật/tắt, cấu hình interval (mặc định **tắt**) |
| Lưu mẫu cá nhân | Tab Mẫu — chèn section hoặc thay toàn bộ |
| Preview | Mở `/thiep/[slug]` song song |
| Quick Build (admin template) | Wizard tạo nhanh section (admin template editor) |
| Binding trường thiệp | TextBlock liên kết `bride_name`, `wedding_date`… |
| Admin template editor | `/admin/templates/[id]/editor` — thiết kế mẫu catalog |

**Blocks hỗ trợ:** `SectionBlock`, `TextBlock`, `ImageBlock`, `CountdownBlock`, `DividerBlock`, `ButtonBlock`, `IconBlock`, `GiftBoxBlock`, `RootCanvas`

### 4.5. Thiệp công khai (khách xem)

| Tính năng | Mô tả |
|-----------|--------|
| URL công khai | `/thiep/[slug]` — khi `status = active` |
| Link cá nhân hoá | `/thiep/[slug]/[guestToken]` — VIP, hiển thị tên khách |
| Craft.js viewer | Scale responsive, animation scroll |
| HTML legacy | Thiệp `raw-html` cũ vẫn render |
| Nhạc nền | Autoplay có điều kiện |
| Confetti | Hearts / snow / petals theo cài đặt |
| RSVP | API `/api/rsvp` |
| Lời chúc | Form gửi → `/api/wishes`, chờ duyệt |
| Hộp quà | Thông tin chuyển khoản / QR |
| Đếm lượt xem | `/api/card-view` |

### 4.6. Gói dịch vụ & Thanh toán

| Tính năng | Mô tả |
|-----------|--------|
| 3 gói | Basic, Pro, VIP — giá cấu hình trong Admin Settings |
| Thanh toán PayOS | Tạo link checkout, webhook xác nhận, sync sau return |
| Nâng cấp gói | Chỉ cho phép nâng cấp lên gói cao hơn |
| Mua tính năng lẻ | Feature catalog + entitlements theo thiệp |
| Đơn video | Catalog video + đặt hàng + thanh toán riêng |
| Referral | Mã giới thiệu, hoa hồng, yêu cầu rút tiền |

### 4.7. Admin Panel (`/admin`)

| Module | URL | Tính năng |
|--------|-----|-----------|
| Dashboard | `/admin` | Thống kê user, thiệp, doanh thu tháng, đơn chờ |
| Users | `/admin/users` | Danh sách user, role, thiệp; tìm kiếm + phân trang |
| Cards | `/admin/cards` | Quản lý thiệp, đổi plan/status, xóa |
| Templates | `/admin/templates` | CRUD mẫu, bật/tắt, editor Craft |
| Features | `/admin/features` | Catalog tính năng mua lẻ |
| Orders | `/admin/orders` | Đơn PayOS (gói + feature) |
| Video | `/admin/video-catalog` | Catalog gói video + quản lý đơn video |
| Referrals | `/admin/referrals` | Mã GT, referrals, hoa hồng, rút tiền |
| Products | `/admin/products` | Sản phẩm affiliate |
| Settings | `/admin/settings` | Cấu hình giá gói (`plan_config`), SEO, website settings |

**Admin UI:** Sidebar active theo route, bộ lọc + phân trang (10/20/50/100), modal xác nhận xóa.

---

## 5. Gói dịch vụ Basic / Pro / VIP

Giá mặc định (có thể thay trong Admin → Settings):

| | Basic | Pro | VIP |
|---|-------|-----|-----|
| **Giá** | 198.000đ | Theo config | Theo config |
| **Số thiệp** | 1 | 2 | 3 |
| **Ảnh album** | 10 | 40 | 100 |
| **Công khai** | 6 tháng | 24 tháng | Trọn đời |
| **Thống kê** | ✗ | ✓ | ✓ |
| **Photobook** | ✗ | ✓ | ✓ |
| **Bỏ branding** | ✗ | ✓ | ✓ |
| **Export lời chúc** | ✗ | ✓ | ✓ |
| **Confetti tùy chỉnh** | ✓ | ✓ | ✓ |
| **RSVP / khách mời** | ✓ | ✓ | ✓ |
| **Thiệp cá nhân hoá (guestToken)** | ✗ | ✗ | ✓ |

Danh sách marketing đầy đủ hơn: `lib/data/pricing-plan-features.ts`

---

## 6. Luồng nghiệp vụ chính

### 6.1. User mới

```
Đăng ký → (xác nhận email nếu bật) → /dashboard
  → Middleware: chưa có gói → /dashboard/goi-dich-vu?paywall=1
  → ensureWeddingCard(): tạo 1 thiệp draft (Basic, chưa paid_at)
  → Chọn gói + PayOS → paid_at được set → vào dashboard đầy đủ
  → Chọn mẫu Craft → Editor → Publish (status=active) → /thiep/[slug]
```

### 6.2. Thanh toán PayOS

```
User chọn gói → POST /api/create-payment
  → Tạo order DB + link PayOS
  → User thanh toán → redirect /dashboard/goi-dich-vu?success=true&orderId=…
  → POST /api/payos/sync-after-return (fallback nếu webhook chậm)
  → Webhook POST /api/webhooks/payos → fulfill-order → cập nhật paid_at, plan
```

### 6.3. Khách xem thiệp

```
Nhận link /thiep/[slug] hoặc /thiep/[slug]/[guestToken]
  → InvitationExperience render Craft/HTML
  → RSVP / Lời chúc / Xem hộp quà
  → Dashboard: duyệt lời chúc, xem thống kê
```

---

## 7. Cài đặt môi trường phát triển (Local)

### Yêu cầu

- **Node.js** ≥ 18
- Tài khoản **Supabase** (miễn phí)
- File **`.env.local`** ở thư mục gốc

### Các bước

```bash
# 1. Clone / mở project
cd Huynh_Royal_16_05_2026

# 2. Tạo env
cp .env.example .env.local
# → Điền các biến (xem mục 9)

# 3. Cài package
npm i

# 4. Chạy migration Supabase (xem mục 8)

# 5. (Tuỳ chọn) Seed demo
npm run seed:demo

# 6. Chạy dev
npm run dev
```

Mở: [http://localhost:3000](http://localhost:3000)

---

## 8. Database & Migration Supabase

Chạy SQL trong **Supabase Dashboard → SQL Editor** theo thứ tự:

| File | Nội dung chính |
|------|----------------|
| `001_init.sql` | profiles, wedding_cards, guests, wishes, orders, RLS, trigger user mới |
| `002_seed_templates.sql` | Mẫu template ban đầu |
| `003_feature_catalog_and_entitlements.sql` | Tính năng mua lẻ |
| `004_full_features.sql` | Kế hoạch, chi tiêu, referral, video… |
| `005_admin_and_payout.sql` | Payout bank, website_settings |
| `006_plan_config.sql` | Lưu cấu hình gói |
| `007_plan_pricing_display.sql` | Hiển thị giá marketing |
| `008_subscription_rls.sql` | RLS theo subscription |
| `009_editor_content.sql` | Cột `content_json` Craft.js |
| `010_saved_templates.sql` | Mẫu user lưu trong editor |
| `011_contact_inquiries.sql` | Form liên hệ marketing |
| `012_deactivate_legacy_templates.sql` | Ẩn template legacy |

### Storage buckets (tạo thủ công trên Supabase)

| Bucket | Mục đích |
|--------|----------|
| `wedding-photos` | Ảnh album / photobook |
| `wedding-music` | File nhạc nền (nếu upload) |

---

## 9. Biến môi trường

Tạo `.env.local` từ `.env.example`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

PAYOS_CLIENT_ID=your-payos-client-id
PAYOS_API_KEY=your-payos-api-key
PAYOS_CHECKSUM_KEY=your-payos-checksum-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

| Biến | Bắt buộc dev? | Mô tả |
|------|---------------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | **Có** | Project URL (Supabase → Settings → API) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Có** | Anon public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Không* | Service role — webhook, seed, admin API. **Không public** |
| `NEXT_PUBLIC_APP_URL` | **Nên có** | URL app: dev `http://localhost:3000`; production domain HTTPS |
| `PAYOS_CLIENT_ID` | Không** | PayOS dashboard |
| `PAYOS_API_KEY` | Không** | PayOS |
| `PAYOS_CHECKSUM_KEY` | Không** | Verify webhook PayOS |

\* Thiếu vẫn chạy UI; `npm run seed:demo` sẽ lỗi.  
\** Thiếu vẫn vào site; **không tạo được link thanh toán**.

**Lấy Supabase keys:** [supabase.com](https://supabase.com) → Project → Settings → API  
**Lấy PayOS keys:** [my.payos.vn](https://my.payos.vn)

---

## 10. Hướng dẫn Deploy Production

### Bước 1 — Đẩy mã nguồn lên GitHub (VS Code)

1. Mở project trong **VS Code**.
2. Vào tab **Source Control** (biểu tượng 3 chấm liên kết, hoặc `Ctrl + Shift + G`).
3. Bấm **「Publish to GitHub」**.
4. Đăng nhập / cấp quyền VS Code truy cập GitHub.
5. Chọn **「Publish to GitHub private repository」** để giữ mã nguồn riêng tư.
6. Đặt tên repo (ví dụ: `Huynh_Royal_16_05_2026`) và chờ upload xong.

> **Lưu ý:** Không commit file `.env.local` — chỉ commit `.env.example`.

### Bước 2 — Deploy lên Vercel

1. Truy cập [https://vercel.com](https://vercel.com).
2. Đăng nhập bằng **cùng tài khoản GitHub** đã dùng ở Bước 1.
3. Trong Dashboard Vercel → **「Add New…」** → **「Project」**.
4. Tìm repository vừa push (ví dụ `Huynh_Royal_16_05_2026`) → bấm **「Import」**.

### Bước 3 — Cấu hình Environment Variables (quan trọng)

**Trước khi bấm Deploy**, kéo xuống mục **Environment Variables** và thêm từng cặp Key / Value (copy từ `.env.local`, **điều chỉnh URL production**):

| Key | Value (production) |
|-----|---------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL Supabase project |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key |
| `PAYOS_CLIENT_ID` | Client ID PayOS |
| `PAYOS_API_KEY` | API Key PayOS |
| `PAYOS_CHECKSUM_KEY` | Checksum Key PayOS |
| `NEXT_PUBLIC_APP_URL` | `https://your-domain.vercel.app` hoặc domain custom |

4. Chọn environment: **Production** (và Preview nếu cần).
5. Bấm **Deploy** và chờ build xong.

### Bước 4 — Cấu hình Supabase (Production)

1. Chạy toàn bộ migration `001` → `012` trên project Supabase production.
2. **Authentication → URL Configuration:**
   - Site URL: `https://your-domain.com`
   - Redirect URLs:
     - `https://your-domain.com/auth/callback`
     - `http://localhost:3000/auth/callback` (dev)
3. **Authentication → Providers:** Bật Email; bật Google nếu dùng OAuth.
4. **Authentication → Email:** Cấu hình Confirm email (bật/tắt tùy nhu cầu).
5. Tạo storage buckets: `wedding-photos`, `wedding-music`.

### Bước 5 — Cấu hình PayOS

1. Đăng nhập [my.payos.vn](https://my.payos.vn).
2. **Webhook URL:** `https://your-domain.com/api/webhooks/payos`
3. Return URL do app tự build:
   - Gói dịch vụ: `https://your-domain.com/dashboard/goi-dich-vu?success=true&orderId=…`
4. Test sandbox trước khi bật production.

### Bước 6 — Google OAuth (tuỳ chọn)

1. Google Cloud Console → OAuth Client.
2. Authorized redirect URI: `https://your-domain.com/auth/callback`
3. Cấu hình Client ID/Secret trong Supabase Auth → Google.

### Bước 7 — Sau khi deploy

1. Đăng nhập admin → **Admin → Settings** → lưu `plan_config` (giá Basic/Pro/VIP).
2. Test luồng: đăng ký → kích hoạt gói → editor → publish → xem `/thiep/[slug]`.
3. Test webhook PayOS với 1 giao dịch thử.
4. Chạy checklist: [docs/EDITOR_QA_CHECKLIST.md](./EDITOR_QA_CHECKLIST.md)

---

## 11. Tài khoản demo & Seed dữ liệu

Yêu cầu: `SUPABASE_SERVICE_ROLE_KEY` trong `.env.local`, đã chạy migration.

```bash
npm run seed:demo
```

| Tài khoản | Email | Mật khẩu | Ghi chú |
|-----------|--------|----------|---------|
| Demo 3 thiệp Craft | `demo@royalwedding.vn` | `DemoRoyalWedding2026!` | Basic + Pro + VIP |
| Basic (đã trả, chưa Craft) | `basic@royalwedding.vn` | `BasicRoyal2026!` | Shell draft |
| Pro (đã trả, chưa Craft) | `pro@royalwedding.vn` | `ProRoyal2026!` | Shell draft |
| VIP (đã trả, chưa Craft) | `vip@royalwedding.vn` | `VipRoyal2026!` | Shell draft |
| Admin | `admin@royalwedding.vn` | `AdminRoyalWedding2026!` | Full quyền admin |
| Paywall (chưa trả) | `paywall@royalwedding.vn` | `PaywallRoyal2026!` | Test paywall |

---

## 12. Hướng dẫn quản trị Admin

### Truy cập

- User có `profiles.role = 'admin'`.
- URL: `/admin` (user thường bị redirect về `/dashboard`).

### Việc cần làm sau deploy

1. **Settings → Plan Config:** Cập nhật giá, % giảm, giới hạn ảnh/thiệp, bật/tắt feature flags từng gói.
2. **Templates:** Tạo mẫu mới → mở Editor → thiết kế → bật `is_active`.
3. **Features:** Quản lý catalog tính năng mua lẻ.
4. **Orders / Referrals:** Theo dõi thanh toán, duyệt rút tiền.

### Phân trang & lọc Admin

Các trang Users, Cards, Orders, Templates, Products, Referrals, Video đều có:
- Ô tìm kiếm
- Bộ lọc (trạng thái, gói, danh mục…)
- Phân trang 10 / 20 / 50 / 100 dòng

---

## 13. API Routes

| Method | Route | Mô tả |
|--------|-------|--------|
| POST | `/api/create-payment` | Tạo link PayOS mua gói |
| POST | `/api/create-feature-payment` | Thanh toán tính năng lẻ |
| POST | `/api/create-video-payment` | Thanh toán đơn video |
| POST | `/api/payos/sync-after-return` | Đồng bộ sau redirect PayOS |
| POST | `/api/webhooks/payos` | Webhook PayOS |
| POST | `/api/rsvp` | Khách RSVP |
| POST | `/api/wishes` | Gửi lời chúc |
| POST | `/api/gift` | Thông tin quà |
| POST | `/api/card-view` | Tăng lượt xem |
| POST | `/api/contact` | Form liên hệ marketing |
| GET | `/api/marketing/templates` | Mẫu cho trang marketing |
| GET | `/api/marketing/showcase-cards` | Thiệp showcase |
| GET | `/api/feature-catalog` | Catalog tính năng |
| * | `/api/admin/*` | CRUD admin (users, cards, features, settings, orders) |

---

## 14. Scripts npm

| Lệnh | Mô tả |
|------|--------|
| `npm run dev` | Chạy dev server (port 3000) |
| `npm run build` | Build production |
| `npm run start` | Chạy bản build |
| `npm run lint` | ESLint |
| `npm run seed:demo` | Seed tài khoản + dữ liệu demo |
| `npm run generate:premium-preset` | Generate JSON preset mẫu premium |
| `npm run seed:premium-template` | Seed template premium vào DB |
| `npm run validate:premium-preset` | Validate file preset |
| `npm run clean` | Xóa `.next` cache |
| `npm run dev:clean` | Clean + dev |

---

## 15. QA & Xử lý sự cố thường gặp

### Email not confirmed

- Supabase bật **Confirm email** → user phải bấm link trong email trước khi đăng nhập.
- App hiển thị màn hình xác nhận + nút gửi lại email.
- Dev: tắt Confirm email hoặc confirm thủ công trong Supabase → Authentication → Users.

### Chưa kích hoạt gói — không vào được dashboard

- Đây là hành vi đúng: redirect `/dashboard/goi-dich-vu`.
- Chọn gói và thanh toán PayOS (hoặc dùng tài khoản demo đã trả).

### Thanh toán xong nhưng gói chưa kích hoạt

- Kiểm tra webhook PayOS trỏ đúng URL production.
- Kiểm tra `PAYOS_CHECKSUM_KEY`.
- Gọi thủ công sync: trang gói dịch vụ tự gọi `/api/payos/sync-after-return` khi có `?success=true&orderId=`.

### Editor lưu nhưng preview khác layout

- Đảm bảo đã bấm **Lưu** (hoặc bật tự lưu).
- Preview dùng cùng hệ tọa độ với editor (`lib/editor/viewerLayout.ts`).

### Link OAuth / email không hoạt động

- Thêm redirect URL vào Supabase và Google Console.
- `NEXT_PUBLIC_APP_URL` phải khớp domain thật.

### Checklist QA đầy đủ

- Editor: [docs/EDITOR_QA_CHECKLIST.md](./EDITOR_QA_CHECKLIST.md)
- Kết quả QA mẫu: [docs/QA_RESULTS.md](./QA_RESULTS.md)

---

## Phụ lục — Sơ đồ route Dashboard

```
/dashboard                          → Danh sách thiệp
/dashboard/goi-dich-vu              → Gói & thanh toán
/dashboard/video-orders               → Đơn video
/dashboard/gioi-thieu               → Referral
/dashboard/san-pham                 → Affiliate products

/dashboard/[cardId]/ho-so           → Hồ sơ
/dashboard/[cardId]/thiet-lap       → Thiết lập + chọn mẫu
/dashboard/[cardId]/cai-dat-thiep   → Cài đặt
/dashboard/[cardId]/giao-dien       → Giao diện
/dashboard/[cardId]/khach-moi       → Khách mời
/dashboard/[cardId]/loi-chuc        → Lời chúc
/dashboard/[cardId]/photobook       → Album ảnh
/dashboard/[cardId]/thong-ke        → Thống kê
/dashboard/[cardId]/ke-hoach        → Kế hoạch
/dashboard/[cardId]/chi-tieu        → Chi tiêu
/dashboard/[cardId]/mung-cuoi       → Mừng cưới

/dashboard/editor/[cardId]          → Editor Craft.js
```

---

*Tài liệu cập nhật theo codebase Royal Wedding — Next.js 14 + Supabase + PayOS.*
