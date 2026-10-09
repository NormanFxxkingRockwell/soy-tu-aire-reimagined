# Pintando una Canción — Soy tu aire (replica study)

A one-to-one replica study of the 2009 Flash interactive experience _Soy tu aire_
(Labuat / Herraiz Soto & Co.), rebuilt with modern browser technology.

The pointer steers the brush; the song timeline drives nib width, ink darkness,
dryness, splatter, camera scroll and the semantic figures that surface along the
stroke. A 244-second visual score mirrors the original recording
(youtube.com/watch?v=hQvvxqI0DUM), and the recovered choreography storyboard
(see Asset provenance) drives per-second pressure / velocity / climax curves and
every figure cue.

## Run locally

```powershell
npx --yes http-server . -p 4173 -c-1
```

Open `http://127.0.0.1:4173/dist/`. Space pauses, M mutes, the top-left
scrubber seeks.

## Architecture

- `dist/main.js` — fixed-timestep engine (120 Hz sim, 60 Hz canvas stamps):
  nib-angle brush model, quad-strip ribbon rendering, camera scroll, drop and
  blackout interludes, seeded RNG, gesture recording + replay.
- `dist/timeline.js` — section score transcribed from the original recording:
  scroll, auto-wave, wetness, fade and mode per segment.
- `dist/choreography.js` — generated (tools/convert.py) from the recovered
  storyboard: 184 pressure/velocity/climax keyframes and 73 merged figure cues
  in video time (song time + 4 s lead-in).
- `dist/replay.js` — pure gesture recording/sampling helpers.
- `dist/assets/` — sprites and textures (see provenance below).
- `tests/` — timeline, choreography anchor and replay unit tests (`npm test`).

### Brush model

Pressure blends the storyboard keyframes with the live energy estimate; width
follows `base × (0.22 + 1.46·pressure + 1.34·headPool + 0.42·climax) ×
(1.24 − 0.88·speedNorm) × nibFactor`, with an EMA-smoothed width and a
velocity-direction nib angle so the ribbon stays continuous. The ribbon is
stamped as edge-sharing quad strips (wet underlay, body, offset dark core, dry
highlight streaks, bristle splits) plus in-ink grain speckles.

### Recording & replay

Every simulation step records the gesture target at 120 Hz along with the noise
seed and RNG seed; after the song ends, "repetir tu versión" replays the exact
run (seeking invalidates the recording, like a cut tape).

## Audio and rights notice

The study build includes the original song recording so that visual timing can
be evaluated against the source. The music, Labuat branding and recovered
artwork remain the property of their respective rights holders; their inclusion
here does not imply endorsement or a transfer of rights.

## Asset provenance

`dist/assets/` (creature sprites, ink-word textures, paper texture) and the
choreography storyboard were recovered from Pablo Zárate's public homage build
(lab.pablozarate.com/soy-tu-aire), which itself states it was rebuilt from
archived material. They are included for non-commercial study and comparison.
_Soy tu aire_, the original song and artwork remain the property of their
respective rights holders.

## Reference material and deployment

The repository keeps the local study bundle under `.refs/` (original
video/audio captures, extracted frames, comparison screenshots and the Pablo
reference snapshot). GitHub Pages publishes only `dist/` as the website
artifact, although `.refs/`, tests and documentation remain visible in the
public source repository.

Pushes to `main` deploy `dist/` through `.github/workflows/pages.yml`.

## References

- Original interaction recording: https://www.youtube.com/watch?v=hQvvxqI0DUM
- Original team interview (Eye): https://www.eyemagazine.com/blog/post/musical-paintbrush
- Reference homage by Pablo Zárate: https://pablozarate.com/painting-a-song
