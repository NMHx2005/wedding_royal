export const SUBSCRIPTION_REQUIRED_MESSAGE =
  "Bạn chưa kích hoạt gói dịch vụ. Vui lòng chọn gói Basic, Pro hoặc VIP và hoàn tất thanh toán để sử dụng tính năng này.";

export const SUBSCRIPTION_REQUIRED_TITLE = "Chưa kích hoạt gói dịch vụ";

export const SUBSCRIPTION_ACTIVATE_PATH = "/dashboard/goi-dich-vu";

const PATH_LABELS: Record<string, string> = {
  "/dashboard": "Quản lý thiệp cưới",
  "/dashboard/goi-dich-vu": "Gói dịch vụ",
  "/dashboard/video-orders": "Đơn hàng video",
  "/dashboard/gioi-thieu": "Giới thiệu",
  "/dashboard/san-pham": "Sản phẩm liên kết",
  "/dashboard/thong-ke": "Thống kê thiệp",
  "/dashboard/ho-so": "Hồ sơ thiệp cưới",
  "/dashboard/thiet-lap": "Thiết lập thiệp",
  "/dashboard/cai-dat-thiep": "Cài đặt thiệp cưới",
  "/dashboard/giao-dien": "Giao diện thiệp",
  "/dashboard/khach-moi": "Quản lý khách mời",
  "/dashboard/loi-chuc": "Quản lý lời chúc",
  "/dashboard/photobook": "Quản lý Photobook",
  "/dashboard/ke-hoach": "Kế hoạch cưới",
  "/dashboard/chi-tieu": "Quản lý chi tiêu",
  "/dashboard/mung-cuoi": "Mừng cưới",
  "/dashboard/editor": "Trình chỉnh sửa",
};

const CARD_SEGMENT_LABELS: Record<string, string> = {
  "ho-so": "Hồ sơ thiệp cưới",
  "thiet-lap": "Thiết lập thiệp",
  "cai-dat-thiep": "Cài đặt thiệp cưới",
  "giao-dien": "Giao diện thiệp",
  "khach-moi": "Quản lý khách mời",
  "loi-chuc": "Quản lý lời chúc",
  photobook: "Quản lý Photobook",
  "thong-ke": "Thống kê thiệp",
  "ke-hoach": "Kế hoạch cưới",
  "chi-tieu": "Quản lý chi tiêu",
  "mung-cuoi": "Mừng cưới",
};

/** Human-readable label for a dashboard path (used in paywall toasts). */
export function labelForDashboardPath(pathname: string): string {
  if (PATH_LABELS[pathname]) return PATH_LABELS[pathname];

  const cardMatch = pathname.match(/^\/dashboard\/[^/]+\/([^/]+)/);
  if (cardMatch?.[1] && CARD_SEGMENT_LABELS[cardMatch[1]]) {
    return CARD_SEGMENT_LABELS[cardMatch[1]];
  }

  if (pathname.startsWith("/dashboard/editor/")) return PATH_LABELS["/dashboard/editor"];

  return "tính năng này";
}

export function isSubscriptionRequiredError(message: string | null | undefined): boolean {
  if (!message) return false;
  const lower = message.toLowerCase();
  return (
    lower.includes("mua gói dịch vụ") ||
    lower.includes("kích hoạt gói") ||
    lower.includes("chưa kích hoạt") ||
    lower.includes("thanh toán") && lower.includes("gói")
  );
}
