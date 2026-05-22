import Link from "next/link";

export function InvitationPreviewBanner() {
  return (
    <div className="sticky top-0 z-[100] border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-center text-sm text-amber-950">
      <span className="font-medium">Bản xem trước</span>
      <span className="mx-1.5 text-amber-700">—</span>
      Khách chưa xem được cho đến khi bạn đặt thiệp ở trạng thái{" "}
      <strong>Công khai</strong> trong{" "}
      <Link href="/dashboard/cai-dat-thiep" className="underline font-medium hover:text-amber-900">
        Cài đặt thiệp
      </Link>
      .
    </div>
  );
}
