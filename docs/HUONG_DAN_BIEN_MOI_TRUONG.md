# Hướng dẫn lấy biến môi trường (Environment Variables)

Tài liệu này hướng dẫn chi tiết cách lấy từng biến trong `.env.local` cho dự án **Royal Wedding**.

---

## Mục lục

1. [Tổng quan](#1-tổng-quan)
2. [Tạo file `.env.local`](#2-tạo-file-envlocal)
3. [Supabase — 3 biến](#3-supabase--3-biến)
4. [PayOS — 3 biến](#4-payos--3-biến)
5. [NEXT_PUBLIC_APP_URL](#5-next_public_app_url)
6. [Cấu hình trên Vercel (Production)](#6-cấu-hình-trên-vercel-production)
7. [Lưu ý bảo mật](#7-lưu-ý-bảo-mật)
8. [Kiểm tra biến đã đúng chưa](#8-kiểm-tra-biến-đã-đúng-chưa)

---

## 1. Tổng quan

| Biến | Bắt buộc dev? | Dùng để làm gì |
|------|---------------|----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | **Có** | Kết nối Supabase (DB, Auth, Storage) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Có** | Key public — chạy trên browser + server |
| `SUPABASE_SERVICE_ROLE_KEY` | Không* | Seed demo, webhook PayOS, admin API server |
| `PAYOS_CLIENT_ID` | Không** | Tạo link thanh toán PayOS |
| `PAYOS_API_KEY` | Không** | Gọi API PayOS |
| `PAYOS_CHECKSUM_KEY` | Không** | Xác minh chữ ký webhook PayOS |
| `NEXT_PUBLIC_APP_URL` | **Nên có** | URL app — return link PayOS, OAuth, email |

\* Thiếu vẫn chạy `npm run dev` (đăng nhập, xem UI). Thiếu thì `npm run seed:demo` và webhook sẽ lỗi.  
\** Thiếu vẫn vào website; **không tạo được link thanh toán** gói Basic/Pro/VIP.

---

## 2. Tạo file `.env.local`

Ở thư mục gốc project:

```bash
cp .env.example .env.local
```

Mở `.env.local` và điền giá trị theo các mục bên dưới.

**Ví dụ file hoàn chỉnh (dev):**

```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

PAYOS_CLIENT_ID=your-client-id
PAYOS_API_KEY=your-api-key
PAYOS_CHECKSUM_KEY=your-checksum-key

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **Quan trọng:** Không commit `.env.local` lên Git. File này chỉ nằm trên máy bạn / Vercel.

---

## 3. Supabase — 3 biến

### Bước 1 — Tạo project Supabase

1. Vào [https://supabase.com](https://supabase.com) → đăng ký / đăng nhập.
2. **New project** → đặt tên (ví dụ `royal-wedding`).
3. Chọn **Region** gần Việt Nam (ví dụ `Singapore`).
4. Đặt **Database password** — lưu lại (dùng cho kết nối trực tiếp DB, không phải biến env của app).
5. Chờ project khởi tạo xong (~1–2 phút).

### Bước 2 — Lấy URL và API keys

1. Trong project Supabase, vào **Project Settings** (biểu tượng bánh răng góc dưới trái).
2. Chọn **API** (menu bên trái).

Bạn sẽ thấy:

| Biến trong `.env.local` | Lấy ở đâu trên Supabase |
|-------------------------|-------------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Mục **Project URL** — dạng `https://xxxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Mục **Project API keys** → **`anon` `public`** |
| `SUPABASE_SERVICE_ROLE_KEY` | Mục **Project API keys** → **`service_role` `secret`** |

**Copy chính xác:**

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon public key — chuỗi JWT dài>
SUPABASE_SERVICE_ROLE_KEY=<service_role secret key — chuỗi JWT dài>
```

### Bước 3 — Cấu hình Auth (sau khi có URL)

Vào **Authentication → URL Configuration**:

| Mục | Dev | Production |
|-----|-----|------------|
| **Site URL** | `http://localhost:3000` | `https://your-domain.com` |
| **Redirect URLs** | `http://localhost:3000/auth/callback` | `https://your-domain.com/auth/callback` |

Thêm cả hai URL nếu vừa dev vừa deploy.

### Bước 4 — Google OAuth (tuỳ chọn)

Nếu dùng đăng nhập Google:

1. **Authentication → Providers → Google** → bật.
2. Tạo OAuth Client trên [Google Cloud Console](https://console.cloud.google.com/).
3. **Authorized redirect URI:** `https://<project-ref>.supabase.co/auth/v1/callback`
4. Dán Client ID + Client Secret vào Supabase.

App redirect thêm qua `/auth/callback` — đã cấu hình ở Bước 3.

### Bước 5 — Chạy migration database

Supabase **không** tự có bảng của app. Chạy SQL trong thư mục `supabase/migrations/` theo thứ tự `001` → `012` tại **SQL Editor**.

Chi tiết: [TAI_LIEU_DU_AN.md](./TAI_LIEU_DU_AN.md#8-database--migration-supabase)

---

## 4. PayOS — 3 biến

PayOS dùng cho thanh toán gói Basic / Pro / VIP và một số đơn hàng khác.

### Bước 1 — Đăng ký tài khoản PayOS

1. Vào [https://my.payos.vn](https://my.payos.vn) → đăng ký / đăng nhập.
2. Hoàn tất xác minh tài khoản / kênh thanh toán theo hướng dẫn PayOS.

### Bước 2 — Tạo hoặc chọn kênh thanh toán (Payment Channel)

1. Trong dashboard PayOS, vào mục **Kênh thanh toán** / **Payment Channel** (tên menu có thể thay đổi theo phiên bản UI).
2. Tạo kênh mới hoặc mở kênh đang dùng.
3. Trong chi tiết kênh, tìm 3 thông tin:

| Biến trong `.env.local` | Tên trên PayOS (thường gặp) |
|-------------------------|-----------------------------|
| `PAYOS_CLIENT_ID` | **Client ID** |
| `PAYOS_API_KEY` | **API Key** |
| `PAYOS_CHECKSUM_KEY` | **Checksum Key** |

**Copy vào `.env.local`:**

```env
PAYOS_CLIENT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
PAYOS_API_KEY=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
PAYOS_CHECKSUM_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

> Mỗi kênh thanh toán có bộ 3 key riêng. Dùng đúng bộ key của kênh bạn đang kích hoạt (sandbox hoặc production).

### Bước 3 — Cấu hình Webhook URL

PayOS cần gọi webhook khi khách thanh toán xong:

| Môi trường | Webhook URL |
|------------|-------------|
| **Local** (test) | Dùng ngrok / tunnel: `https://<tunnel>/api/webhooks/payos` |
| **Production** | `https://your-domain.com/api/webhooks/payos` |

Cấu hình trong PayOS dashboard → **Webhook** / **Cài đặt kênh**.

App verify chữ ký bằng `PAYOS_CHECKSUM_KEY` — nếu key sai, webhook trả **Invalid signature**.

### Bước 4 — Return URL (tự động)

App tự build URL quay về sau thanh toán từ `NEXT_PUBLIC_APP_URL`:

```
https://your-domain.com/dashboard/goi-dich-vu?success=true&orderId=...
```

Không cần khai báo riêng trên PayOS (trừ khi dashboard PayOS yêu cầu whitelist domain).

### Test sandbox

- PayOS thường có chế độ **sandbox / test** — bật khi dev.
- Dùng tài khoản test PayOS cung cấp để mô phỏng chuyển khoản.
- Sau khi thanh toán, kiểm tra:
  1. Redirect về `/dashboard/goi-dich-vu?success=true&orderId=...`
  2. Gói được kích hoạt (`paid_at` có giá trị)
  3. Log webhook trên PayOS dashboard = thành công

---

## 5. NEXT_PUBLIC_APP_URL

URL gốc của website — **không** có dấu `/` ở cuối.

| Môi trường | Giá trị |
|------------|---------|
| **Dev local** | `http://localhost:3000` |
| **Vercel preview** | `https://<tên-project>-xxx.vercel.app` |
| **Production** | `https://your-domain.com` |

**Dùng cho:**

- Link return sau thanh toán PayOS
- Redirect OAuth (`/auth/callback`)
- Một số link chia sẻ / email trong app

**Ví dụ:**

```env
# Dev
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Production
NEXT_PUBLIC_APP_URL=https://royalwedding.vn
```

> Khi deploy Vercel, **bắt buộc** đổi sang domain production. Nếu để `localhost`, PayOS redirect và email sẽ sai.

---

## 6. Cấu hình trên Vercel (Production)

1. Vào project trên [vercel.com](https://vercel.com).
2. **Settings → Environment Variables**.
3. Thêm **từng biến** (giống `.env.local`), chọn scope **Production** (và Preview nếu cần):

| Key | Ghi chú production |
|-----|---------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Giữ nguyên URL Supabase project |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Giữ nguyên anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Giữ nguyên service role |
| `PAYOS_CLIENT_ID` | Key production (hoặc sandbox nếu test) |
| `PAYOS_API_KEY` | Key production |
| `PAYOS_CHECKSUM_KEY` | Key production |
| `NEXT_PUBLIC_APP_URL` | **Domain HTTPS thật** — không dùng localhost |

4. **Redeploy** sau khi thêm/sửa biến (Deployments → Redeploy).

---

## 7. Lưu ý bảo mật

| Biến | Public? | Ghi chú |
|------|---------|---------|
| `NEXT_PUBLIC_*` | **Có** — lộ trên browser | Chỉ dùng prefix `NEXT_PUBLIC_` cho giá trị an toàn khi public |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Có | Supabase RLS bảo vệ dữ liệu; vẫn không share bừa bãi |
| `SUPABASE_SERVICE_ROLE_KEY` | **Không** — bypass RLS | **Không** commit Git, **không** đặt prefix `NEXT_PUBLIC_` |
| `PAYOS_*` | **Không** | Chỉ chạy server-side |

**Không bao giờ:**

- Push `.env.local` lên GitHub
- Dán `SUPABASE_SERVICE_ROLE_KEY` vào code client / component `"use client"`
- Chia sẻ screenshot key lên group chat

---

## 8. Kiểm tra biến đã đúng chưa

### Supabase

```bash
npm run dev
```

- Mở [http://localhost:3000/register](http://localhost:3000/register) → đăng ký thử.
- Nếu báo lỗi kết nối / Invalid API key → kiểm tra lại `URL` và `ANON_KEY`.

### Service role + seed

```bash
npm run seed:demo
```

- Thành công → `SUPABASE_SERVICE_ROLE_KEY` đúng.
- Lỗi `Invalid API key` → sai service role hoặc chưa chạy migration.

### PayOS

1. Đăng nhập user đã kích hoạt email.
2. Vào **Gói dịch vụ** → chọn gói → bấm thanh toán.
3. Nếu toast **「Không tạo được thanh toán」** → kiểm tra 3 biến `PAYOS_*`.
4. Nếu redirect PayOS OK nhưng gói không kích hoạt → kiểm tra webhook + `PAYOS_CHECKSUM_KEY`.

### APP URL

- Sau thanh toán, URL trình duyệt phải về `NEXT_PUBLIC_APP_URL/dashboard/goi-dich-vu?...`
- Nếu về `localhost` trên server production → sửa biến trên Vercel và redeploy.

---

## Checklist nhanh

- [ ] Đã tạo `.env.local` từ `.env.example`
- [ ] `NEXT_PUBLIC_SUPABASE_URL` — copy từ Supabase → Settings → API
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` — key **anon public**
- [ ] `SUPABASE_SERVICE_ROLE_KEY` — key **service_role secret**
- [ ] Đã chạy migration `001`–`012` trên Supabase
- [ ] Supabase Redirect URLs có `/auth/callback`
- [ ] `PAYOS_CLIENT_ID`, `PAYOS_API_KEY`, `PAYOS_CHECKSUM_KEY` — từ kênh PayOS
- [ ] Webhook PayOS trỏ `/api/webhooks/payos`
- [ ] `NEXT_PUBLIC_APP_URL` khớp môi trường (localhost / domain production)
- [ ] Vercel: đã thêm đủ biến + redeploy

---

*Xem thêm: [TAI_LIEU_DU_AN.md](./TAI_LIEU_DU_AN.md) — tài liệu tổng quan dự án.*
