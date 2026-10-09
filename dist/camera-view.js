const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const BASE_ZOOM = 1.68;

export function cinematicSourceScale(time, climax) {
  const zoom = clamp(BASE_ZOOM + .025 * Math.sin(.8 * time) - .32 * clamp(climax, 0, 1), 1.24, 1.92);
  return BASE_ZOOM / zoom;
}

export function cameraView({ width, height, worldWidth, worldHeight, cameraX, cameraY, time, climax }) {
  const scale = cinematicSourceScale(time, climax);
  const sw = Math.min(worldWidth, width * scale);
  const sh = Math.min(worldHeight, height * scale);
  const sx = clamp(cameraX + width / 2 - sw / 2, 0, Math.max(0, worldWidth - sw));
  const worldPadY = (worldHeight - height) / 2;
  const sy = clamp(worldPadY + height / 2 + cameraY - sh / 2, 0, Math.max(0, worldHeight - sh));
  return { sx, sy, sw, sh, scale, worldPadY };
}

export function screenToLocal(view, cameraX, screenX, screenY) {
  return {
    x: view.sx + screenX * view.scale - cameraX,
    y: view.sy + screenY * view.scale - view.worldPadY
  };
}

export function localToScreen(view, cameraX, localX, localY) {
  return {
    x: (cameraX + localX - view.sx) / view.scale,
    y: (view.worldPadY + localY - view.sy) / view.scale
  };
}
