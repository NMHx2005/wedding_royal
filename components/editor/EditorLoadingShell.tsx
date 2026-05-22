export function EditorLoadingShell() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-100">
      <div className="flex flex-col items-center gap-3 text-gray-500">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
        <p className="text-sm">Đang tải trình chỉnh sửa…</p>
      </div>
    </div>
  );
}
