import type { Camera, QuicklinkExport } from "./types.js";

export function buildQuicklinkExport(
  cameras: Camera[],
  getLink: (cameraId: string) => string,
): QuicklinkExport[] {
  return cameras.map((camera) => ({
    name: camera.title,
    link: getLink(camera.id),
  }));
}
