import type { LucideIcon, LucideProps } from "lucide-react";

export type IconProps = Omit<LucideProps, "ref"> & {
  icon: LucideIcon;
  /** Rendered box in px (Figma icon instance size). */
  size?: number;
};

/**
 * Lucide icon rendered the way the Figma icon instances are drawn:
 * an absolute stroke width (Figma does not scale strokes with the instance).
 * 16px icons use a 1px stroke in the file, every other size uses 1.5px.
 */
export function Icon({ icon: Glyph, size = 16, strokeWidth, className, ...rest }: IconProps) {
  const sw = strokeWidth ?? (size === 16 ? 1 : 1.5);
  return (
    <Glyph
      aria-hidden
      focusable={false}
      width={size}
      height={size}
      strokeWidth={sw}
      absoluteStrokeWidth
      className={className}
      style={{ flexShrink: 0 }}
      {...rest}
    />
  );
}
