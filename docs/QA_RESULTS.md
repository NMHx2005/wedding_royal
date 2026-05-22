# Kết quả QA — Royal Wedding

Cập nhật sau đợt khắc phục theo plan QA. **Test thủ công trên staging** cần chạy lại sau khi apply migration `008_subscription_rls.sql`.

## Kiểm tra tự động

| Kiểm tra | Kết quả |
|----------|---------|
| `node scripts/validate-plan-logic.mjs` | PASS (10/10) |
| `npm run lint` | PASS (chỉ warnings hooks/img) |
| `npm run build` | PASS |

## Ma trận test thủ công

| ID | Mô tả | Kỳ vọng | Trạng thái code |
|----|--------|---------|-----------------|
| A1 | Đăng ký mới → dashboard | Paywall | PASS (middleware) |
| A2 | `paywall@royalwedding.vn` | Chỉ `/dashboard/goi-dich-vu` | PASS |
| A3 | `demo@royalwedding.vn` | Full dashboard Pro | PASS (seed) |
| A4 | `admin@royalwedding.vn` | Admin + không paywall | PASS |
| A5 | Google OAuth | Callback an toàn | PASS (safeRedirectPath) |
| A6 | Open redirect `?next=https://evil.com` | Chặn | PASS (đã sửa) |
| B1 | Chưa trả → `/dashboard/thiet-lap` | Redirect paywall | PASS |
| B2–B8 | PayOS mua/nâng cấp/webhook/sync | Fulfill + amount check | PASS (cần test PayOS thật) |
| C1 | Thống kê Basic vs Pro | Gate `stats` | PASS |
| C2 | Photobook | Gate UI + server `addWeddingPhoto` | PASS |
| C3 | Xuất CSV lời chúc | Gate `export_wishes` | PASS (đã sửa) |
| C4 | Confetti | `updateWeddingCard` + feature | PASS |
| C5 | Mẫu VIP | PlanGate + server template | PASS |
| C6 | Lời chúc public | `auto_approve_wishes` theo gói | PASS (đã sửa) |
| D1–D3 | Thiệp public draft/active | status check | PASS |
| E1 | Admin `plan_config` | DB-driven giá | PASS |
| F1–F2 | Marketing copy / bảng giá | Đã đồng bộ copy trả phí | PASS (đã sửa) |

## Migration bắt buộc trên Supabase

Chạy theo thứ tự `001` → `010`, đặc biệt:

- **`008_subscription_rls.sql`** — chặn ghi DB khi chưa `paid_at`
- **`009_editor_content.sql`** — cột `content_json` trên `wedding_cards` và `templates` (Craft.js editor)
- **`010_saved_templates.sql`** — mẫu section/block lưu riêng từng user

## Editor thiệp (Craft.js, mobile 390px)

| Kiểm tra | Kỳ vọng | Ghi chú |
|----------|---------|---------|
| E1 | Kéo/resize phần tử không giật | `react-moveable` + `setProp` top/left/width/height |
| E2 | F5 sau kéo — vị trí giữ nguyên | Lưu `content_json` |
| E3 | Sửa chữ → Lưu → reload | `TextBlock` onBlur + panel Nội dung |
| E4 | Sự kiện navigate-section / toggle-element | `elementId` trên DOM + dropdown Events |
| E5 | Tab Lớp / autosave 10s | `EDITOR_AUTOSAVE_MS` trên `EditorHeader` (user + admin) |
| E6 | Admin template editor | `TemplateEditorClient` + `prepareContentForSave` khi lưu |
| E7 | Paywall đa thiệp | Middleware: `userHasActiveSubscription` — bất kỳ thiệp đã trả |

**Test thủ công:** xem [EDITOR_QA_CHECKLIST.md](./EDITOR_QA_CHECKLIST.md).

## Tài khoản demo

Xem [README](../README.md) — `npm run seed:demo`.
