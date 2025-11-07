'use client';

import { DEFAULT_SPRITE } from '../model/constants';
import type { SpriteIconProps } from '../model/types';

export function SpriteIcon({
  id,
  name,
  sprite = DEFAULT_SPRITE,
  className = '',
  width,
  height,
  ...rest
}: SpriteIconProps) {
  const symbolId = id || name;

  if (!symbolId) {
    return null;
  }

  return (
    <svg className={className} aria-hidden="true" width={width} height={height} {...rest}>
      <use xlinkHref={`${sprite}#${symbolId}`} />
    </svg>
  );
}

