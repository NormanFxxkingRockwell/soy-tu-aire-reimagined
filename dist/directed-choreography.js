import { RAW_EVENTS, SCENE_RULES } from "./choreography.js";

const VIDEO_OFFSET = 4;

export function sceneRuleFor(name, songTime, rules = SCENE_RULES) {
  return rules.find(rule => rule.match === name && rule.timeRange && songTime >= rule.timeRange[0] && songTime <= rule.timeRange[1])
    ?? rules.find(rule => rule.match === name && !rule.timeRange)
    ?? rules.find(rule => rule.key === name);
}

export function buildDirectedCues(names, events = RAW_EVENTS, rules = SCENE_RULES) {
  const supported = new Set(names);
  const cues = [];
  for (const event of events) {
    const namesAtEvent = new Set([...(event.creatures ?? []), ...(event.reveals ?? [])]);
    for (const name of namesAtEvent) {
      if (!supported.has(name)) continue;
      const rule = sceneRuleFor(name, event.t, rules);
      if (!rule) continue;
      if (rule.brushHold) {
        cues.push({
          at: event.t + VIDEO_OFFSET + rule.brushHold.startOffset,
          kind: "brushHold",
          name,
          ruleKey: rule.key,
          duration: rule.brushHold.duration,
          paint: rule.brushHold.paint !== false
        });
      }
      const spawns = rule.creatures?.[name] ?? rule.reveals?.[name] ?? [];
      for (const spawn of spawns) {
        for (let index = 0; index < spawn.count; index++) {
          cues.push({
            at: event.t + VIDEO_OFFSET + spawn.at + index * (spawn.stagger ?? 0),
            kind: "spawn",
            name: spawn.spawnName ?? name,
            ruleKey: rule.key,
            spawn
          });
        }
      }
    }
  }
  return cues.sort((a, b) => a.at - b.at);
}

// Scenes are enabled only after their visual contract has an implementation
// and an original-recording comparison. Chica is the first migrated scene.
export const DIRECTED_CUES = buildDirectedCues(["chica"]);
