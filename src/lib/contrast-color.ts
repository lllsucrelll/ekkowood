/**
 * Picks a readable text color (brand dark brown or white) for a given hex
 * background, using the standard YIQ perceived-brightness formula.
 */
export function getContrastTextColor(hex: string): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "#4a3323" : "#ffffff";
}
