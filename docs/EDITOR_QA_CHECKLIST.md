# Checklist QA — Editor thiệp (Craft.js)

Checklist test thủ công cho **user** và **admin**. Chạy sau migration `001`–`010` và `npm run seed:demo`.

## Điều kiện

| # | Việc cần làm | ☐ |
|---|--------------|---|
| P1 | Migration Supabase `001` → `010` | |
| P2 | `npm run seed:demo` | |
| P3 | `node scripts/validate-plan-logic.mjs` | |
| P4 | `npm run build` | |

**Tài khoản:** `demo@` (Pro), `paywall@` (chưa trả), `admin@` (admin).

---

## A. User — Tạo thiệp & chọn mẫu

| ID | Bước | Kỳ vọng | ☐ |
|----|------|---------|---|
| U-A1 | User mới → dashboard | Paywall `/dashboard/goi-dich-vu` | |
| U-A2 | `paywall@` — dashboard | Chỉ gói dịch vụ, không lưu editor | |
| U-A3 | `demo@` — chưa Craft | Redirect thiết lập `needTemplate=1` | |
| U-A4 | Thiệp raw-html cũ | Không mở editor; `source=html` | |
| U-A5 | Áp mẫu Craft (Thiết lập / Cài đặt thiệp) | Vào `/dashboard/editor/[id]` | |
| U-A6 | Mẫu VIP khi card Basic | Lỗi gói | |
| U-A7 | Mẫu `is_active=false` | Không hiện cho user | |
| U-A8 | PayOS → `paid_at` | Vào dashboard + editor | |

---

## B. User — Editor

| ID | Bước | Kỳ vọng | ☐ |
|----|------|---------|---|
| U-B1 | Editor card người khác | 404 | |
| U-B2 | Card chưa `paid_at` | Redirect gói dịch vụ | |
| U-B3 | Kéo / resize → **Lưu** → F5 | Giữ layout | |
| U-B4 | Sửa text → Lưu → F5 | Giữ nội dung | |
| U-B5 | **Autosave ~10s** (sửa, đợi, không bấm Lưu) | F5 vẫn thấy thay đổi | |
| U-B6 | Ctrl+S | Lưu OK | |
| U-B7 | Undo / Redo | Hoạt động | |
| U-B8 | Tab TV / Lớp / Mẫu / LS | Thêm block, reorder, history | |
| U-B9 | Lưu mẫu cá nhân → tab Mẫu | Chèn section / thay toàn bộ | |
| U-B10 | Preview (có slug) | `/thiep/[slug]` khớp editor | |
| U-B11 | TextBlock `cardField` → Lưu | Cột DB + Thiết lập đồng bộ | |
| U-B12 | Nút **Làm nhanh** (user) | Disabled | |

---

## C. User — Đa thiệp & public

| ID | Bước | Kỳ vọng | ☐ |
|----|------|---------|---|
| U-C1 | 2 thiệp: thiệp 1 hết hạn, thiệp 2 đã trả | Vẫn vào dashboard (middleware) | |
| U-C2 | Editor thiệp 2 chưa trả riêng | Redirect paywall theo **card** | |
| U-C3 | `status=active` | Public Craft viewer | |
| U-C4 | `status=draft` | Khách không xem | |

---

## D. Admin — Template catalog & editor

| ID | Bước | Kỳ vọng | ☐ |
|----|------|---------|---|
| H-A1 | User vào `/admin` | Redirect dashboard | |
| H-A2 | Tạo template mới | `is_active=false`, editor trống | |
| H-A3 | Sửa + **Lưu** + F5 | `content_json` giữ | |
| H-A4 | Autosave 10s (admin editor) | Tương tự user | |
| H-A5 | **Làm nhanh** wizard | Tạo section nhanh | |
| H-A6 | Bật `is_active` | User thấy + áp mẫu | |
| H-A7 | `demo@` áp mẫu admin | Public khớp thiết kế | |

---

## E. Bảo mật (smoke)

| ID | Bước | Kỳ vọng | ☐ |
|----|------|---------|---|
| K-1 | `saveCardContentJson` card người khác | Lỗi | |
| K-2 | `paywall@` lưu editor | RLS / subscription chặn | |
| K-3 | Xóa `saved_templates` người khác | Không xóa được | |

---

## Smoke 5 phút

1. `demo@` → mẫu → editor → kéo → đợi autosave hoặc Lưu → F5 → preview public.  
2. `admin@` → sửa template → Lưu → `demo@` áp lại.  
3. `paywall@` → không lưu được.

---

## Tham chiếu code

| Tính năng | File |
|-----------|------|
| User editor | `app/dashboard/editor/[cardId]/` |
| Admin editor | `app/admin/templates/[id]/editor/` |
| Lưu thiệp | `saveCardContentJson` |
| Lưu template | `saveTemplateContentJson` |
| Autosave | `EDITOR_AUTOSAVE_MS` → `EditorHeader` |
| Paywall | `middleware.ts` + `userHasActiveSubscription` |
