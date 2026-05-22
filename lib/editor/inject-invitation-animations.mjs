/**
 * Gán hiệu ứng animate.css (xuất hiện) cho các block Craft.js khi seed / export thiệp.
 */

const ANIMATABLE = new Set([
  "TextBlock",
  "ImageBlock",
  "ButtonBlock",
  "IconBlock",
  "CountdownBlock",
  "GiftBoxBlock",
  "DividerBlock",
]);

/** Khớp danh sách MeHappy / AnimationPanel — chỉ hiệu ứng “vào” */
export const ENTRY_ANIMATIONS = [
  "fadeInUp",
  "fadeInDown",
  "fadeInLeft",
  "fadeInRight",
  "fadeInUpBig",
  "fadeInDownBig",
  "bounceIn",
  "bounceInUp",
  "bounceInDown",
  "zoomIn",
  "zoomInUp",
  "slideInUp",
  "slideInLeft",
  "slideInRight",
  "rotateIn",
  "flipInY",
  "lightSpeedInRight",
  "rollIn",
  "jackInTheBox",
];

/**
 * @param {Record<string, unknown>} contentJson
 * @param {{ force?: boolean }} [opts]
 */
export function injectInvitationAnimations(contentJson, opts = {}) {
  const { force = false } = opts;
  let i = 0;

  for (const node of Object.values(contentJson)) {
    if (!node || typeof node !== "object") continue;
    const type = /** @type {{ resolvedName?: string }} */ (node.type);
    const name = type?.resolvedName;
    if (!name || !ANIMATABLE.has(name)) continue;
    if (node.hidden) continue;

    const props = /** @type {Record<string, unknown>} */ (node.props ?? {});
    if (!force && props.animationEntry) continue;

    props.animationEntry = ENTRY_ANIMATIONS[i % ENTRY_ANIMATIONS.length];
    props.animationDuration = props.animationDuration ?? 1;
    props.animationLoop = false;
    node.props = props;
    i++;
  }

  return contentJson;
}
