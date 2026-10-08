export function mediaTimelineSeconds(media, offset, contextSeconds, endedAt) {
  if (!media) return contextSeconds;
  if (media.ended && Number.isFinite(endedAt) && Number.isFinite(media.duration)) {
    return media.duration + offset + Math.max(0, contextSeconds - endedAt);
  }
  return media.currentTime + offset;
}
