import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { injectInvitationAnimations } from "./inject-invitation-animations.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Đường dẫn JSON preset Save The Date Cổ Điển */
export const PREMIUM_TEMPLATE_JSON_PATH = join(
  __dirname,
  "presets/premium-save-the-date.json"
);

/**
 * Đọc preset + gán hiệu ứng xuất hiện (animate.css) cho mọi block.
 * Dùng chung cho seed template DB và thiệp demo.
 */
export function loadPremiumTemplateContent(
  jsonPath = PREMIUM_TEMPLATE_JSON_PATH,
  { force = true } = {}
) {
  const raw = JSON.parse(readFileSync(jsonPath, "utf8"));
  return injectInvitationAnimations(raw, { force });
}
