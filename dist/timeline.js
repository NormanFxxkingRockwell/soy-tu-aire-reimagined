// Visual score transcribed from the original 2009 recording
// (youtube.com/watch?v=hQvvxqI0DUM). Widths and pressure live in the brush
// model (see main.js, ported from the recovered choreography); segments here
// drive camera scroll, auto-wave, texture and section modes.
// Event cues fire from choreography.js (recovered storyboard, song time +4s).

export const DURATION = 244;

// One-shot colour accents transcribed from the original recording. Blue is a
// short two-part narrative beat, not a tint applied to the entire 56-68s span.
export const COLOR_CUES = [
  { at: 59.2, type: "blueDroplets" },
  { at: 65.2, type: "bluePetals" }
];

export const SCORE = [
  { start: 0, end: 5, scroll: 0, wave: 0, splat: 0, wet: .6, bpm: 0, fade: 0, mode: "off" },
  { start: 5, end: 8, scroll: 0, wave: .35, splat: 0, wet: .6, bpm: 0, fade: .0012, mode: "stroke" },
  { start: 8, end: 24, scroll: 1.4, wave: 1, splat: .05, wet: .55, bpm: 96, fade: .0014, mode: "stroke" },
  { start: 24, end: 40, scroll: 3.4, wave: .75, splat: .12, wet: .5, bpm: 104, fade: .0011, mode: "stroke" },
  { start: 40, end: 41.8, scroll: 0, wave: 0, splat: 0, wet: 0, bpm: 0, fade: 0, mode: "blackout" },
  { start: 41.8, end: 43, scroll: 1.5, wave: .3, splat: .02, wet: .5, bpm: 96, fade: .001, mode: "stroke" },
  { start: 43, end: 48, scroll: 2.6, wave: .6, splat: .04, wet: .45, bpm: 96, fade: .0018, mode: "stroke" },
  { start: 48, end: 56, scroll: 3.2, wave: .7, splat: .05, wet: .5, bpm: 96, fade: .0015, mode: "stroke" },
  { start: 56, end: 59, scroll: 3.8, wave: .8, splat: .05, wet: .62, bpm: 104, fade: .0012, mode: "stroke" },
  { start: 59, end: 62, scroll: 3.8, wave: .8, splat: .08, wet: .68, bpm: 104, fade: .0012, mode: "stroke", blueAccent: "droplets" },
  { start: 62, end: 65, scroll: 3.8, wave: .8, splat: .04, wet: .6, bpm: 104, fade: .0012, mode: "stroke" },
  { start: 65, end: 68, scroll: 3.8, wave: .8, splat: .08, wet: .7, bpm: 104, fade: .0012, mode: "stroke", blueAccent: "petals" },
  { start: 68, end: 76, scroll: 4.4, wave: .85, splat: .22, wet: .5, bpm: 112, fade: .0009, mode: "stroke" },
  { start: 76, end: 83, scroll: 4.8, wave: .8, splat: .06, wet: .5, bpm: 104, fade: .0012, mode: "stroke" },
  { start: 83, end: 91, scroll: 4.8, wave: .8, splat: .07, wet: .5, bpm: 104, fade: .0011, mode: "stroke" },
  { start: 91, end: 96, scroll: 4.8, wave: .7, splat: .09, wet: .5, bpm: 104, fade: .0011, mode: "stroke" },
  { start: 96, end: 111, scroll: 4.6, wave: .85, splat: .04, wet: .5, bpm: 100, fade: .001, mode: "stroke" },
  { start: 111, end: 116, scroll: 4.8, wave: .5, splat: .02, wet: .3, bpm: 100, fade: .002, mode: "stroke" },
  { start: 116, end: 126, scroll: 4.8, wave: .9, splat: .05, wet: .5, bpm: 108, fade: .001, mode: "stroke" },
  { start: 126, end: 131, scroll: 5.6, wave: .45, splat: .02, wet: .25, bpm: 108, fade: .0018, mode: "stroke" },
  { start: 131, end: 146, scroll: 4.4, wave: .8, splat: .05, wet: .5, bpm: 104, fade: .001, mode: "stroke" },
  { start: 146, end: 148, scroll: 4.8, wave: .6, splat: .08, wet: .5, bpm: 104, fade: .001, mode: "stroke" },
  { start: 148, end: 151, scroll: 4.8, wave: .5, splat: 0, wet: .4, bpm: 104, fade: .0008, mode: "drops" },
  { start: 151, end: 165, scroll: 2.9, wave: .8, splat: .08, wet: .55, bpm: 104, fade: .001, mode: "stroke" },
  { start: 165, end: 170, scroll: 4.8, wave: .4, splat: .01, wet: .15, bpm: 100, fade: .008, mode: "stroke" },
  { start: 170, end: 177, scroll: 2.5, wave: .8, splat: .05, wet: .5, bpm: 100, fade: .001, mode: "stroke" },
  { start: 177, end: 208, scroll: 2.3, wave: .75, splat: .04, wet: .5, bpm: 100, fade: .0009, mode: "stroke" },
  { start: 208, end: 226, scroll: 2.3, wave: .75, splat: .05, wet: .5, bpm: 104, fade: .001, mode: "stroke" },
  { start: 226, end: 231, scroll: 1.2, wave: .6, splat: .02, wet: .5, bpm: 96, fade: .0012, mode: "stroke" },
  { start: 231, end: 244, scroll: 0, wave: .3, splat: 0, wet: .6, bpm: 0, fade: .004, mode: "fadeout" }
];

const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (t) => t * t * (3 - 2 * t);
const NUMERIC_KEYS = ["scroll", "wave", "splat", "wet", "bpm", "fade"];

export function scoreAt(seconds) {
  const time = Math.max(0, Math.min(DURATION, Number.isFinite(seconds) ? seconds : 0));
  const foundIndex = SCORE.findIndex(segment => time >= segment.start && time < segment.end);
  const index = foundIndex === -1 ? SCORE.length - 1 : foundIndex;
  const current = SCORE[index];
  const next = SCORE[Math.min(SCORE.length - 1, index + 1)];
  const blendWindow = Math.min(4, current.end - current.start);
  const t = smooth(Math.max(0, Math.min(1, (time - (current.end - blendWindow)) / blendWindow)));
  const blended = { ...current };
  for (const key of NUMERIC_KEYS) blended[key] = lerp(current[key], next[key], t);
  return blended;
}
