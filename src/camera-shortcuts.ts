import type { Camera } from "./types.js";

const SUBSTREAM_SUFFIX = /(?:[_\-\s]sub)$/i;

export function camerasForRootSearch(
  cameras: Camera[],
  includeSubstreams = false,
): Camera[] {
  if (includeSubstreams) return cameras;

  const cameraIds = new Set(cameras.map((camera) => camera.id));
  return cameras.filter((camera) => {
    if (!SUBSTREAM_SUFFIX.test(camera.id)) return true;
    const mainCameraId = camera.id.replace(SUBSTREAM_SUFFIX, "");
    return !cameraIds.has(mainCameraId);
  });
}

export function rootSearchName(camera: Camera): string {
  const [title, qualifier] = camera.title.split(" — ", 2);
  const name = /\bcamera\b/i.test(title) ? title : `${title} Camera`;
  return qualifier ? `${name} — ${qualifier}` : name;
}
