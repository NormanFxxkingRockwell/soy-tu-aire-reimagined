import { PARAMS } from "./choreography.js";

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const lerp = (a, b, t) => a + (b - a) * t;
const CLIMAX_PULSE_SECONDS = .4;

export function paramAt(seconds, params = PARAMS) {
  if (!params.length) return { presion: .5, velocidad: 1, climax: 0 };
  const t = clamp(Number.isFinite(seconds) ? seconds : params[0].t, params[0].t, params[params.length - 1].t);
  let lo = 0;
  let hi = params.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (params[mid].t <= t) lo = mid; else hi = mid;
  }
  const a = params[lo];
  const b = params[hi];
  const k = b.t > a.t ? (t - a.t) / (b.t - a.t) : 0;

  // In the recovered reference timeline, pressure and velocity interpolate,
  // while climax is an attack attached to each flagged event and decays in
  // 400ms.  Interpolating climax held the heavy brush and max scroll almost
  // continuously from 172-219s.
  let climax = 0;
  const pulseIndex = params[hi].t <= t ? hi : lo;
  for (let i = pulseIndex; i >= 0; i--) {
    if (params[i].climax > 0) {
      const age = t - params[i].t;
      climax = age < CLIMAX_PULSE_SECONDS
        ? params[i].climax * (1 - age / CLIMAX_PULSE_SECONDS)
        : 0;
      break;
    }
  }

  return {
    presion: lerp(a.presion, b.presion, k),
    velocidad: lerp(a.velocidad, b.velocidad, k),
    climax: clamp(climax, 0, 1)
  };
}

export { CLIMAX_PULSE_SECONDS };
