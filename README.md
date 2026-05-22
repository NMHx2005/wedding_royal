# Royal Wedding

Website tạo và quản lý **thiệp cưới online** — khách xem thiệp, RSVP, lời chúc; cô dâu chú rể chỉnh nội dung và mua gói dịch vụ trên dashboard.

---

## Website làm gì?

| Phần | Đường dẫn | Mô tả ngắn |
|------|-----------|------------|
| Trang chủ & marketing | `/`, `/bang-gia`, `/kho-giao-dien`… | Giới thiệu, bảng giá, mẫu thiệp |
| Đăng ký / đăng nhập | `/register`, `/login` | Tài khoản Supabase |
| Dashboard | `/dashboard` | Quản lý thiệp, khách mời, ảnh, gói dịch vụ… |
| Thiệp công khai | `/thiep/[slug]` | Link gửi cho khách |
| Admin | `/admin` | Cấu hình giá gói, user (role admin) |

**Lưu ý:** User mới sau đăng ký cần **mua gói** (Basic / Pro / VIP) tại **Gói dịch vụ** thì mới dùng đầy đủ dashboard. Dữ liệu lưu trên **Supabase**; thanh toán qua **PayOS**.

---

## Chạy trên máy

### Yêu cầu

- **Node.js** 18 trở lên  
- File **`.env.local`** ở thư mục gốc project (xem mục dưới)

### Biến môi trường (`.env.local`)

Tạo file từ mẫu:

```bash
cp .env.example .env.local
```

Sau đó điền giá trị thật:

| Biến | Bắt buộc để `npm run dev`? | Mô tả |
|------|---------------------------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | **Có** | URL project Supabase (Settings → API → Project URL) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Có** | Anon public key (Settings → API) |
| `SUPABASE_SERVICE_ROLE_KEY` | Không* | Service role key — dùng cho `npm run seed:demo` và một số API server; **không** đưa lên client |
| `NEXT_PUBLIC_APP_URL` | **Nên có** | URL app khi dev: `http://localhost:3000` (PayOS return link, email…) |
| `PAYOS_CLIENT_ID` | Không** | PayOS — mua gói / thanh toán |
| `PAYOS_API_KEY` | Không** | PayOS |
| `PAYOS_CHECKSUM_KEY` | Không** | PayOS — verify webhook |

\* Không có vẫn chạy dev được nếu chỉ xem UI / đăng nhập; thiếu thì `npm run seed:demo` sẽ lỗi.  
\** Không có vẫn vào site được; **không tạo được link thanh toán** gói Basic/Pro/VIP.

**Tối thiểu để chạy dev (đăng nhập, dashboard, thiệp):** 3 biến Supabase đầu + `NEXT_PUBLIC_APP_URL`.

Ví dụ `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

NEXT_PUBLIC_APP_URL=http://localhost:3000

PAYOS_CLIENT_ID=
PAYOS_API_KEY=
PAYOS_CHECKSUM_KEY=
```

**Supabase:** tạo project miễn phí tại [supabase.com](https://supabase.com) → chạy SQL trong `supabase/migrations/` (theo thứ tự `001` → `011`) trước khi dùng app. Editor Craft.js cần `009`–`010`; form liên hệ marketing cần `011_contact_inquiries.sql`.

**PayOS:** lấy tại [my.payos.vn](https://my.payos.vn) khi cần test thanh toán thật.

### Cài package & chạy dev

```bash
npm i
```

```bash
npm run dev
```

Mở trình duyệt: [http://localhost:3000](http://localhost:3000)

---

## (Tuỳ chọn) Dữ liệu demo

Cần `SUPABASE_SERVICE_ROLE_KEY` trong `.env.local`. Đã chạy migration Supabase rồi chạy:

```bash
npm run seed:demo
```

| Tài khoản | Email | Mật khẩu | Ghi chú |
|-----------|--------|----------|---------|
| Demo — 3 thiệp mẫu Craft | `demo@royalwedding.vn` | `DemoRoyalWedding2026!` | Basic + Pro + VIP (`thiep-mau-*`) |
| Basic (đã trả, chưa Craft) | `basic@royalwedding.vn` | `BasicRoyal2026!` | Shell draft, chọn mẫu trong dashboard |
| Pro (đã trả, chưa Craft) | `pro@royalwedding.vn` | `ProRoyal2026!` | Shell draft |
| VIP (đã trả, chưa Craft) | `vip@royalwedding.vn` | `VipRoyal2026!` | Shell draft |
| Admin | `admin@royalwedding.vn` | `AdminRoyalWedding2026!` | |
| Paywall (chưa trả) | `paywall@royalwedding.vn` | `PaywallRoyal2026!` | |

---

## Deploy production (Vercel / VPS)

### 1. Supabase

- Chạy SQL trong `supabase/migrations/` theo thứ tự **001 → 010**.
- Tạo bucket storage: `wedding-photos`, `wedding-music` (public read nếu cần URL thiệp).
- Bật Auth providers (Email, Google nếu dùng).

### 2. Biến môi trường

| Biến | Ghi chú |
|------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Bắt buộc |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Bắt buộc |
| `SUPABASE_SERVICE_ROLE_KEY` | Webhook PayOS, fulfill order, seed |
| `NEXT_PUBLIC_APP_URL` | Domain production (https://…) |
| `PAYOS_CLIENT_ID` / `PAYOS_API_KEY` / `PAYOS_CHECKSUM_KEY` | Thanh toán |

### 3. PayOS

- Webhook URL: `https://<domain>/api/webhooks/payos`
- Return URL do app tự build từ `NEXT_PUBLIC_APP_URL` + `/dashboard/goi-dich-vu?success=true&orderId=…`

### 4. Google OAuth (tuỳ chọn)

- Redirect URI: `https://<domain>/auth/callback`
- Site URL / allowed redirects khớp domain production.

### 5. Sau deploy

- Đăng nhập admin → **Cài đặt** → lưu `plan_config` (giá Basic/Pro/VIP).
- Test 1 lượt thanh toán sandbox PayOS.
- Xem [docs/QA_RESULTS.md](docs/QA_RESULTS.md) cho checklist QA.
