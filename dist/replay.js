// Pure gesture-recording helpers, decoupled from the canvas engine.
// A recording is a flat [t, x, y, t, x, y, ...] array captured at a fixed
// sample rate plus the noise seed of the run, so a replay re-performs the
// same gesture through the same brush physics.

export function createRecording(seed, rate, t0 = 0) {
  return { seed, rate, t0, count: 0, flat: [] };
}

export function recordSample(recording, t, x, y) {
  recording.flat.push(t, x, y);
  recording.count++;
}

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const lerp = (a, b, t) => a + (b - a) * t;

// Returns the interpolated {x, y} gesture target at time t, clamped to the
// first and last captured samples. null when nothing was recorded.
export function sampleAt(recording, t) {
  const { count, flat, rate, t0 } = recording;
  if (count === 0) return null;
  if (count === 1) return { x: flat[1], y: flat[2] };
  if (t <= t0) return { x: flat[1], y: flat[2] };
  const index = Math.min(count - 2, Math.floor((t - t0) * rate));
  const base = index * 3;
  const ta = flat[base];
  const tb = flat[base + 3];
  const k = tb > ta ? clamp((t - ta) / (tb - ta), 0, 1) : 0;
  return {
    x: lerp(flat[base + 1], flat[base + 4], k),
    y: lerp(flat[base + 2], flat[base + 5], k)
  };
}
