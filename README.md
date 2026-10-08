# Pintando una canción

A modern, browser-native reimagining of the 2009 interactive music experience created for Labuat's _Soy tu aire_.

This repository currently contains an original interaction engine and procedural prototype soundtrack. It does **not** redistribute the original recording or original artwork.

## Run locally

Serve the repository root with any static server, for example:

```powershell
npx --yes http-server . -p 4173 -c-1
```

Then open `http://127.0.0.1:4173/dist/`.

## Architecture

- `dist/main.js` — canvas renderer, pointer smoothing, audio-reactive brush, particles and controls.
- `dist/timeline.js` — the 4:04 visual score and interpolation helpers.
- `tests/timeline.test.js` — boundary and interpolation checks.

## Audio policy

The public prototype uses a procedural Web Audio soundscape. A properly licensed recording can later be integrated behind the same 244-second visual timeline without changing the drawing engine.

## References

- Original interaction recording: https://www.youtube.com/watch?v=hQvvxqI0DUM
- Original project team interview: https://www.eyemagazine.com/blog/post/musical-paintbrush
- Modern homage by Pablo Zarate: https://pablozarate.com/painting-a-song

This is an independent study and homage. Labuat, _Soy tu aire_, and the original 2009 work remain the property of their respective rights holders.
