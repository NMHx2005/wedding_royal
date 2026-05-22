/** Nhãn tiếng Việt cho hiệu ứng animate.css (editor + đồng bộ MeHappy). */

export type AnimationOption = { value: string; label: string };

export const ANIMATION_GROUPS: { label: string; options: AnimationOption[] }[] = [
  {
    label: "Chú ý / lặp",
    options: [
      { value: "bounce", label: "Nảy lên" },
      { value: "flash", label: "Nhấp nháy" },
      { value: "pulse", label: "Nhịp đập" },
      { value: "rubberBand", label: "Co giãn" },
      { value: "shakeX", label: "Rung ngang" },
      { value: "shakeY", label: "Rung dọc" },
      { value: "headShake", label: "Lắc đầu" },
      { value: "swing", label: "Đung đưa" },
      { value: "tada", label: "Tada" },
      { value: "wobble", label: "Lắc lư" },
      { value: "jello", label: "Rung jelly" },
      { value: "heartBeat", label: "Nhịp tim" },
    ],
  },
  {
    label: "Xuất hiện",
    options: [
      { value: "backInDown", label: "Lùi vào từ trên" },
      { value: "backInLeft", label: "Lùi vào từ trái" },
      { value: "backInRight", label: "Lùi vào từ phải" },
      { value: "backInUp", label: "Lùi vào từ dưới" },
      { value: "bounceIn", label: "Nảy vào" },
      { value: "bounceInDown", label: "Nảy từ trên xuống" },
      { value: "bounceInLeft", label: "Nảy từ trái sang" },
      { value: "bounceInRight", label: "Nảy từ phải sang" },
      { value: "bounceInUp", label: "Nảy từ dưới lên" },
      { value: "fadeIn", label: "Hiện dần" },
      { value: "fadeInDown", label: "Hiện dần từ trên xuống" },
      { value: "fadeInDownBig", label: "Hiện dần từ trên (lớn)" },
      { value: "fadeInLeft", label: "Hiện dần từ trái" },
      { value: "fadeInLeftBig", label: "Hiện dần từ trái (lớn)" },
      { value: "fadeInRight", label: "Hiện dần từ phải" },
      { value: "fadeInRightBig", label: "Hiện dần từ phải (lớn)" },
      { value: "fadeInUp", label: "Hiện dần từ dưới lên" },
      { value: "fadeInUpBig", label: "Hiện dần từ dưới (lớn)" },
      { value: "flipInX", label: "Lật theo trục ngang" },
      { value: "flipInY", label: "Lật theo trục dọc" },
      { value: "lightSpeedInRight", label: "Lướt nhanh từ phải" },
      { value: "lightSpeedInLeft", label: "Lướt nhanh từ trái" },
      { value: "rotateIn", label: "Xoay vào" },
      { value: "rotateInDownLeft", label: "Xoay vào góc dưới trái" },
      { value: "rotateInDownRight", label: "Xoay vào góc dưới phải" },
      { value: "rotateInUpLeft", label: "Xoay vào góc trên trái" },
      { value: "rotateInUpRight", label: "Xoay vào góc trên phải" },
      { value: "jackInTheBox", label: "Jack in the box" },
      { value: "rollIn", label: "Lăn vào" },
      { value: "zoomIn", label: "Phóng to vào" },
      { value: "zoomInDown", label: "Phóng to từ trên" },
      { value: "zoomInLeft", label: "Phóng to từ trái" },
      { value: "zoomInRight", label: "Phóng to từ phải" },
      { value: "zoomInUp", label: "Phóng to từ dưới" },
      { value: "slideInDown", label: "Trượt từ trên xuống" },
      { value: "slideInLeft", label: "Trượt từ trái" },
      { value: "slideInRight", label: "Trượt từ phải" },
      { value: "slideInUp", label: "Trượt từ dưới lên" },
    ],
  },
  {
    label: "Biến mất",
    options: [
      { value: "fadeOut", label: "Mờ dần" },
      { value: "fadeOutDown", label: "Mờ xuống dưới" },
      { value: "fadeOutUp", label: "Mờ lên trên" },
      { value: "fadeOutLeft", label: "Mờ sang trái" },
      { value: "fadeOutRight", label: "Mờ sang phải" },
      { value: "zoomOut", label: "Thu nhỏ ra" },
      { value: "bounceOut", label: "Nảy ra" },
      { value: "slideOutDown", label: "Trượt xuống" },
      { value: "slideOutUp", label: "Trượt lên" },
    ],
  },
];

export function getAnimationLabel(value: string): string {
  for (const g of ANIMATION_GROUPS) {
    const found = g.options.find((o) => o.value === value);
    if (found) return found.label;
  }
  return value;
}
