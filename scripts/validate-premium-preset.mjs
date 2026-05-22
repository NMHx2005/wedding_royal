/**
 * QA: validate premium preset structure (7 sections, ROOT present).
 * Run: node scripts/validate-premium-preset.mjs
 */

import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const json = JSON.parse(
  readFileSync(join(__dirname, "../lib/editor/presets/premium-save-the-date.json"), "utf8"),
);

const root = json.ROOT;
if (!root?.nodes?.length) {
  console.error("FAIL: missing ROOT");
  process.exit(1);
}

const sections = root.nodes
  .map((id) => json[id])
  .filter((n) => n?.type?.resolvedName === "SectionBlock");

if (sections.length !== 7) {
  console.error(`FAIL: expected 7 sections, got ${sections.length}`);
  process.exit(1);
}

const heights = sections.map((s) => s.props?.height);
console.log("✓ Premium preset OK:", {
  nodes: Object.keys(json).length,
  sections: sections.length,
  heights,
});
