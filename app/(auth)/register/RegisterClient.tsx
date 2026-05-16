"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import clsx from "clsx";
import { AuthMehappyShell, GoogleIcon } from "@/components/auth/AuthMehappyShell";
import { createClient } from "@/lib/supabase/client";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { FadeIn } from "@/components/motion/gentle";

export function RegisterClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: RegisterInput) => {
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: { full_name: values.fullName },
        emailRedirectTo: typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : undefined,
      },
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Đăng ký thành công");
    router.push("/dashboard");
    router.refresh();
  };

  const google = async () => {
    const supabase = createClient();
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    if (error) toast.error(error.message);
  };

  const inputClass =
    "mt-1.5 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none ring-rose-500/30 transition placeholder:text-neutral-400 focus:border-rose-300 focus:ring-2";

  return (
    <AuthMehappyShell authMode="register">
      <FadeIn className="w-full max-w-md" delay={0.06}>
        <form
          className="rounded-2xl border border-white/70 bg-white/95 p-6 shadow-xl shadow-rose-200/20 backdrop-blur-sm sm:p-8"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <h1 className="text-center text-xl font-bold text-neutral-900 sm:text-2xl">Đăng ký</h1>
          <p className="mt-2 text-center text-sm text-neutral-600">
            Tạo tài khoản miễn phí để bắt đầu thiệp cưới điện tử của bạn.
          </p>

          <div className="mt-6">
            <button
              type="button"
              onClick={google}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-rose-600"
            >
              <GoogleIcon className="h-6 w-6 shrink-0" />
              Đăng ký bằng Google
            </button>
          </div>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-neutral-200" />
            <p className="text-xs font-medium text-neutral-500">Hoặc</p>
            <div className="h-px flex-1 bg-neutral-200" />
          </div>

          <div>
            <label className="text-sm font-medium text-neutral-800" htmlFor="fullName">
              Họ và tên <span className="text-red-500">*</span>
            </label>
            <input
              id="fullName"
              autoComplete="name"
              placeholder="Nhập họ và tên"
              className={inputClass}
              {...register("fullName")}
            />
            {errors.fullName && (
              <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
            )}
          </div>

          <div className="mt-4">
            <label className="text-sm font-medium text-neutral-800" htmlFor="reg-email">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              id="reg-email"
              type="email"
              autoComplete="email"
              placeholder="Nhập email của bạn"
              className={inputClass}
              {...register("email")}
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
          </div>

          <div className="mt-4">
            <label className="text-sm font-medium text-neutral-800" htmlFor="reg-password">
              Mật khẩu <span className="text-red-500">*</span>
            </label>
            <div className="relative mt-1.5">
              <input
                id="reg-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Nhập mật khẩu"
                className={clsx(inputClass, "mt-0 pr-11")}
                {...register("password")}
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          <div className="mt-4">
            <label className="text-sm font-medium text-neutral-800" htmlFor="confirmPassword">
              Xác nhận mật khẩu <span className="text-red-500">*</span>
            </label>
            <div className="relative mt-1.5">
              <input
                id="confirmPassword"
                type={showConfirm ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Nhập lại mật khẩu"
                className={clsx(inputClass, "mt-0 pr-11")}
                {...register("confirmPassword")}
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800"
                onClick={() => setShowConfirm((v) => !v)}
                aria-label={showConfirm ? "Ẩn xác nhận mật khẩu" : "Hiện xác nhận mật khẩu"}
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
            )}
          </div>

          <div className="mt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex h-11 w-full items-center justify-center rounded-xl bg-red-500 text-sm font-bold text-white transition hover:bg-red-600 disabled:opacity-60"
            >
              {isSubmitting ? "Đang tạo tài khoản…" : "Đăng ký"}
            </button>
          </div>

          <p className="mt-6 text-center text-sm text-neutral-600">
            Đã có tài khoản?{" "}
            <Link href="/login" className="font-semibold text-rose-600 hover:text-rose-700 hover:underline">
              Đăng nhập
            </Link>
          </p>
          <p className="mt-3 text-center">
            <Link href="/" className="text-sm font-medium text-neutral-600 hover:text-rose-600 hover:underline">
              Quay lại trang chủ
            </Link>
          </p>
        </form>
      </FadeIn>
    </AuthMehappyShell>
  );
}
