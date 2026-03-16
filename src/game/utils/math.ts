export const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

export const oscillate = (time: number, speed: number, amplitude: number, base = 0): number =>
  base + Math.sin(time * speed) * amplitude;

export const lerp = (start: number, end: number, t: number): number => start + (end - start) * t;
