import type { Camera, QuicklinkExport } from "./types.js";

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

export function buildQuicklinkExport(
  cameras: Camera[],
  getLink: (cameraId: string) => string,
  includeSubstreams = false,
): QuicklinkExport[] {
  return camerasForRootSearch(cameras, includeSubstreams).map((camera) => ({
    name: rootSearchName(camera),
    link: getLink(camera.id),
    iconName: "video-16",
  }));
}

export function buildQuicklinkImportDeeplink(
  quicklinks: QuicklinkExport[],
): string {
  const context = quicklinks.map(({ name, link, iconName }) => ({
    name,
    link,
    icon: iconName?.replace(/-16$/, ""),
  }));
  return `raycast://extensions/raycast/quicklinks/import-quicklinks?context=${encodeURIComponent(JSON.stringify(context))}`;
}
