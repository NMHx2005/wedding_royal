/**
 * Generate premium-save-the-date.json from preset builder.
 * Run: node scripts/generate-premium-preset.mjs
 */

import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import {
  buildPremiumSaveTheDateJson,
  PREMIUM_IMAGES,
} from "../lib/editor/presets/premium-save-the-date.mjs";
import { injectInvitationAnimations } from "../lib/editor/inject-invitation-animations.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = join(__dirname, "../lib/editor/presets/premium-save-the-date.json");

const json = buildPremiumSaveTheDateJson({
  brideName: "Mỹ Hạnh",
  groomName: "Quang Thi",
  weddingDate: "2026-05-16T16:00:00.000Z",
  eventTimeLabel: "16:00 Thứ Tư Ngày 30/11/2025",
  mapsUrl: "https://www.google.com/maps",
  images: PREMIUM_IMAGES,
});

const withAnimations = injectInvitationAnimations(json, { force: true });
writeFileSync(outPath, JSON.stringify(withAnimations, null, 2), "utf8");
const animCount = Object.values(withAnimations).filter((n) => n?.props?.animationEntry).length;
console.log(`Wrote ${outPath} (${Object.keys(withAnimations).length} nodes, ${animCount} animated)`);
