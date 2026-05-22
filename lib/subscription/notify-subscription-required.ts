"use client";

import { toast } from "sonner";
import {
  SUBSCRIPTION_ACTIVATE_PATH,
  SUBSCRIPTION_REQUIRED_MESSAGE,
  SUBSCRIPTION_REQUIRED_TITLE,
  isSubscriptionRequiredError,
} from "@/lib/subscription/messages";

type Options = {
  feature?: string;
  description?: string;
};

export function notifySubscriptionRequired(options: Options = {}) {
  const { feature, description } = options;
  const message =
    description ??
    (feature
      ? `Để sử dụng "${feature}", bạn cần kích hoạt gói dịch vụ trước. Chọn gói Basic, Pro hoặc VIP và hoàn tất thanh toán.`
      : SUBSCRIPTION_REQUIRED_MESSAGE);

  toast.error(SUBSCRIPTION_REQUIRED_TITLE, {
    description: message,
    duration: 6000,
    action: {
      label: "Kích hoạt ngay",
      onClick: () => {
        window.location.href = SUBSCRIPTION_ACTIVATE_PATH;
      },
    },
  });
}

/** Use in client handlers after server actions / fetch — shows friendly paywall toast when applicable. */
export function toastActionError(error: string | null | undefined, feature?: string) {
  if (!error) return;
  if (isSubscriptionRequiredError(error)) {
    notifySubscriptionRequired({ feature });
    return;
  }
  toast.error(error);
}
