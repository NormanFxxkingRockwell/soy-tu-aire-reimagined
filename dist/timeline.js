export const DURATION = 244;

export const SCORE = [
  { start: 0, end: 18, width: 4, alpha: .55, drift: .18, splatter: .02, speed: 10, fade: .003, mood: "breath" },
  { start: 18, end: 48, width: 16, alpha: .78, drift: .42, splatter: .12, speed: 15, fade: .001, mood: "rising" },
  { start: 48, end: 75, width: 29, alpha: .86, drift: .62, splatter: .32, speed: 18, fade: .0005, mood: "bloom" },
  { start: 75, end: 101, width: 18, alpha: .72, drift: .38, splatter: .09, speed: 13, fade: .0016, mood: "loop" },
  { start: 101, end: 132, width: 38, alpha: .9, drift: .76, splatter: .26, speed: 21, fade: .0004, mood: "weight" },
  { start: 132, end: 164, width: 9, alpha: .55, drift: .3, splatter: .05, speed: 10, fade: .0038, mood: "release" },
  { start: 164, end: 181, width: 2.5, alpha: .38, drift: .16, splatter: .015, speed: 8, fade: .022, mood: "clearing" },
  { start: 181, end: 211, width: 24, alpha: .76, drift: .58, splatter: .18, speed: 17, fade: .0012, mood: "return" },
  { start: 211, end: 235, width: 45, alpha: .9, drift: .9, splatter: .42, speed: 23, fade: .0012, mood: "finale" },
  { start: 235, end: 244, width: 8, alpha: .3, drift: .24, splatter: .02, speed: 7, fade: .035, mood: "vanish" }
];

export const CUES = [
  { at: 35, type: "butterflies" },
  { at: 58, type: "bubbles" },
  { at: 72, type: "birds" },
  { at: 112, type: "lips" },
  { at: 146, type: "letters" },
  { at: 188, type: "birds" },
  { at: 218, type: "butterflies" }
];

const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (t) => t * t * (3 - 2 * t);

export function scoreAt(seconds) {
  const time = Math.max(0, Math.min(DURATION, Number.isFinite(seconds) ? seconds : 0));
  const foundIndex = SCORE.findIndex(segment => time >= segment.start && time < segment.end);
  const index = foundIndex === -1 ? SCORE.length - 1 : foundIndex;
  const current = SCORE[index];
  const next = SCORE[Math.min(SCORE.length - 1, index + 1)];
  const blendWindow = Math.min(4, current.end - current.start);
  const t = smooth(Math.max(0, Math.min(1, (time - (current.end - blendWindow)) / blendWindow)));
  return {
    ...current,
    width: lerp(current.width, next.width, t),
    alpha: lerp(current.alpha, next.alpha, t),
    drift: lerp(current.drift, next.drift, t),
    splatter: lerp(current.splatter, next.splatter, t),
    speed: lerp(current.speed, next.speed, t),
    fade: lerp(current.fade, next.fade, t)
  };
}

export function cuesBetween(from, to) {
  if (to < from) return [];
  return CUES.filter(cue => cue.at > from && cue.at <= to);
}
