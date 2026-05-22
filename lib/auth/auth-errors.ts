/** Map Supabase auth error codes to user-friendly Vietnamese messages. */
export function getAuthErrorMessage(error: { message?: string; code?: string }): string {
  switch (error.code) {
    case "email_not_confirmed":
      return "Email chưa được xác nhận. Vui lòng kiểm tra hộp thư (cả mục Spam) và bấm link xác nhận trước khi đăng nhập.";
    case "invalid_credentials":
      return "Email hoặc mật khẩu không đúng.";
    case "user_already_registered":
      return "Email này đã được đăng ký. Hãy đăng nhập hoặc dùng quên mật khẩu.";
    default:
      return error.message ?? "Đã xảy ra lỗi. Vui lòng thử lại.";
  }
}

export function isEmailNotConfirmed(error: { code?: string }): boolean {
  return error.code === "email_not_confirmed";
}
