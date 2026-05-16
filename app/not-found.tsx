import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-neutral-50 px-4">
      <h1 className="font-serif text-3xl text-neutral-900">Không tìm thấy trang</h1>
      <Link href="/" className="text-mewedding-rose underline">
        Về trang chủ
      </Link>
    </div>
  );
}
