export type MusicPreset = {
  id: string;
  label: string;
  url: string;
  durationLabel?: string;
};

/** MP3 demo công khai — thay bằng URL Supabase khi có file trên bucket `wedding-music`. */
export const DEFAULT_BACKGROUND_MUSIC_URL =
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3";

/**
 * Nhạc mẫu cho thiệp — khi chọn, URL được lưu vào wedding_cards.background_music_url.
 */
export const INVITATION_MUSIC_PRESETS: MusicPreset[] = [
  {
    id: "default-romantic",
    label: "Nhạc cưới lãng mạn (mặc định)",
    url: DEFAULT_BACKGROUND_MUSIC_URL,
    durationLabel: "~6 phút",
  },
  {
    id: "soft-1",
    label: "Giai điệu nhẹ nhàng",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    durationLabel: "~6 phút",
  },
  {
    id: "soft-2",
    label: "Giai điệu vui tươi",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    durationLabel: "~6 phút",
  },
];

export function findMusicPresetByUrl(url: string | null | undefined): MusicPreset | undefined {
  if (!url) return undefined;
  return INVITATION_MUSIC_PRESETS.find((p) => p.url === url);
}
