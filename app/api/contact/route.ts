import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, phone, email, subject, message } = body as Record<string, unknown>;

  if (typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Vui lòng nhập họ tên" }, { status: 400 });
  }
  if (typeof message !== "string" || !message.trim()) {
    return NextResponse.json({ error: "Vui lòng nhập nội dung" }, { status: 400 });
  }

  const admin = createServiceRoleClient();
  const { error } = await admin.from("contact_inquiries").insert({
    name: name.trim().slice(0, 200),
    phone: typeof phone === "string" ? phone.trim().slice(0, 40) : null,
    email: typeof email === "string" ? email.trim().slice(0, 200) : null,
    subject: typeof subject === "string" ? subject.trim().slice(0, 300) : null,
    message: message.trim().slice(0, 5000),
  });

  if (error) {
    console.error("contact_inquiries insert:", error.message);
    return NextResponse.json({ error: "Không gửi được tin nhắn. Thử lại sau." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
