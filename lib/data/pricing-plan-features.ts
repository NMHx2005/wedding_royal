export type PlanKey = "basic" | "pro" | "vip";

export type FeatureCell = "yes" | "no" | string;

export type PlanFeatureRow = {
  label: string;
  basic: FeatureCell;
  pro: FeatureCell;
  vip: FeatureCell;
};

/** Danh sách tính năng đầy đủ cho modal "Chi tiết gói". */
export const PLAN_FEATURE_ROWS: PlanFeatureRow[] = [
  {
    label: "Royal Wedding sẽ thiết kế thiệp, cài đặt thiệp cho bạn từ A–Z",
    basic: "no",
    pro: "no",
    vip: "no",
  },
  { label: "Hỗ trợ mọi lúc mọi nơi", basic: "yes", pro: "yes", vip: "yes" },
  {
    label: "Chỉnh sửa không giới hạn số lần hay thời gian trên website Royal Wedding",
    basic: "yes",
    pro: "yes",
    vip: "yes",
  },
  { label: "Gửi mời và truy cập không giới hạn", basic: "yes", pro: "yes", vip: "yes" },
  {
    label: "Các tính năng cơ bản (nhạc nền, hiệu ứng tim / tuyết / chuyển động)",
    basic: "yes",
    pro: "yes",
    vip: "yes",
  },
  { label: "Quản lý kế hoạch cưới, ngân sách cưới", basic: "yes", pro: "yes", vip: "yes" },
  {
    label: 'Thông tin các "Sự kiện cưới", thời gian, địa điểm, timeline',
    basic: "yes",
    pro: "yes",
    vip: "yes",
  },
  { label: "Thông tin về cô dâu chú rể", basic: "yes", pro: "yes", vip: "yes" },
  { label: 'Thông tin "Song thân phụ mẫu", tư gia địa chỉ 2 nhà', basic: "yes", pro: "yes", vip: "yes" },
  { label: "Hộp mừng cưới (thông tin chuyển khoản, QR Code)", basic: "yes", pro: "yes", vip: "yes" },
  { label: "Số lượng ảnh cưới", basic: "10 ảnh cưới", pro: "40 ảnh cưới", vip: "100 ảnh cưới" },
  { label: "Thời gian công khai thiệp cưới", basic: "6 tháng", pro: "2 năm", vip: "Trọn đời" },
  { label: "Số lượng thiệp có thể tạo", basic: "1 thiệp", pro: "2 thiệp", vip: "3 thiệp" },
  { label: "Tạo mã QR cho thiệp cưới (in thiệp giấy, gửi bạn bè)", basic: "yes", pro: "yes", vip: "yes" },
  { label: 'Tính năng "Đếm ngược thời gian" đến sự kiện cưới', basic: "yes", pro: "yes", vip: "yes" },
  { label: "Google Maps chỉ dẫn đến nơi diễn ra sự kiện cưới", basic: "yes", pro: "yes", vip: "yes" },
  { label: "Tuỳ chỉnh hiệu ứng hiển thị tim, tuyết, hoa rơi", basic: "no", pro: "yes", vip: "yes" },
  { label: "Loại bỏ quảng cáo trên website Royal Wedding", basic: "no", pro: "yes", vip: "yes" },
  {
    label: "Thống kê thiệp (lượt truy cập, khách mời, lời chúc, …)",
    basic: "no",
    pro: "yes",
    vip: "yes",
  },
  { label: "Tuỳ chỉnh màu sắc, font chữ cho thiệp cưới", basic: "no", pro: "yes", vip: "yes" },
  {
    label: "Tuỳ chỉnh thay đổi, sắp xếp các mục, thiết kế giữa các mẫu",
    basic: "no",
    pro: "yes",
    vip: "yes",
  },
  { label: "Tuỳ chọn hiệu ứng mở thiệp", basic: "no", pro: "yes", vip: "yes" },
  { label: "Tính năng Photobook online", basic: "no", pro: "yes", vip: "yes" },
  { label: "Cài mật khẩu cho thiệp cưới", basic: "no", pro: "yes", vip: "yes" },
  {
    label: "Thiết lập thông báo cho người xem thiệp (popup trên thiệp)",
    basic: "no",
    pro: "yes",
    vip: "yes",
  },
  { label: "Thay đổi giao diện thiệp khác", basic: "no", pro: "yes", vip: "yes" },
  {
    label: "Gửi lời chúc mừng cưới và quản lý, phản hồi lời chúc",
    basic: "no",
    pro: "yes",
    vip: "yes",
  },
  {
    label: "Tải xuống danh sách lời chúc (danh sách khách mời cho VIP)",
    basic: "no",
    pro: "yes",
    vip: "yes",
  },
  { label: "Tải lên video, video cưới, video khác", basic: "no", pro: "yes", vip: "yes" },
  { label: "Xác nhận tham dự và quản lý khách mời dự tiệc", basic: "no", pro: "yes", vip: "yes" },
  { label: "Tải lên font chữ yêu thích", basic: "no", pro: "no", vip: "yes" },
  { label: "Tải lên bài hát yêu thích", basic: "no", pro: "no", vip: "yes" },
  { label: "Tải lên hiệu ứng yêu thích", basic: "no", pro: "no", vip: "yes" },
  {
    label: 'Sử dụng "Giao diện VIP" thiết kế tỉ mỉ, đặc biệt dành riêng gói VIP',
    basic: "no",
    pro: "no",
    vip: "yes",
  },
  {
    label:
      "Tạo và gửi thiệp mời online cho từng khách (ghi tên cá nhân hoá, không giới hạn)",
    basic: "Được dùng thử 3 khách mời",
    pro: "Được dùng thử 3 khách mời",
    vip: "yes",
  },
  {
    label: "Thiệp mời báo cưới (Save the Date) + ghi tên từng khách mời",
    basic: "Được dùng thử 3 khách mời",
    pro: "Được dùng thử 3 khách mời",
    vip: "yes",
  },
  {
    label: "Ghi tên khách mời VIP (kèm hình ảnh cá nhân hoá khách mời)",
    basic: "Được dùng thử 3 khách mời",
    pro: "Được dùng thử 3 khách mời",
    vip: "yes",
  },
  {
    label: "Thiệp mời hiển thị bên trong thiệp chính + hiện tên khách mời",
    basic: "no",
    pro: "no",
    vip: "yes",
  },
  {
    label: 'Tính năng "Đếm số thời gian đã cưới" sau khi kết thúc đám cưới',
    basic: "no",
    pro: "no",
    vip: "yes",
  },
  { label: "Tính năng nhắc lịch hẹn đến ngày cưới", basic: "no", pro: "no", vip: "yes" },
  { label: "Tính năng gửi mail nhắc ngày cưới", basic: "no", pro: "no", vip: "yes" },
  { label: "Tạo logo riêng cho đám cưới", basic: "no", pro: "no", vip: "yes" },
  { label: "Loại bỏ logo Royal Wedding", basic: "no", pro: "no", vip: "yes" },
  { label: "Tích hợp tên miền riêng (Custom Domain)", basic: "no", pro: "no", vip: "yes" },
  { label: "Yêu cầu toàn quyền (Admin)", basic: "no", pro: "no", vip: "yes" },
  { label: "Tuỳ chỉnh mã QR code", basic: "no", pro: "no", vip: "yes" },
  { label: "Tặng thiệp thôi nôi, thiệp sinh nhật gói PRO miễn phí", basic: "no", pro: "no", vip: "no" },
  {
    label: "Tặng video cưới Chibi, animation vui nhộn, trình chiếu tại sự kiện",
    basic: "no",
    pro: "no",
    vip: "no",
  },
];

export const PLAN_DISPLAY_NAMES: Record<PlanKey, string> = {
  basic: "BASIC",
  pro: "PRO",
  vip: "VIP",
};
