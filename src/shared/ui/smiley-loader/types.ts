export interface SmileyLoaderProps {
  /**
   * Size in pixels
   * @default 128
   */
  size?: number;

  /**
   * Primary color (top half)
   * @default 'hsl(193,90%,50%)'
   */
  color1?: string;

  /**
   * Secondary color (bottom half)
   * @default 'hsl(223,90%,50%)'
   */
  color2?: string;

  /**
   * Additional CSS classes
   */
  className?: string;
}
