export const formats = {
  vertical: {width: 1080, height: 1920},
  landscape: {width: 1920, height: 1080},
  square: {width: 1080, height: 1080},
};
export const platforms = {
  youtube: 'landscape', shorts: 'vertical', tiktok: 'vertical', reels: 'vertical', square: 'square',
};
export const presets = {
  preview: {scale: 0.5, crf: 25, jpegQuality: 80, concurrency: 1, particles: 30, segments: 16},
  final: {scale: 1, crf: 17, jpegQuality: 95, concurrency: 2, particles: 72, segments: 32},
};
export const categories = ['education', 'technology', 'science', 'data', 'satisfying', 'product'];
