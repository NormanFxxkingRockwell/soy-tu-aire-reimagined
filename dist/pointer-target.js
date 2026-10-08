export function clampToViewport(x, y, width, height) {
  return {
    x: Math.max(0, Math.min(width, x)),
    y: Math.max(0, Math.min(height, y))
  };
}
