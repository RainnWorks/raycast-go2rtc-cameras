import { open } from "@raycast/api";
import { createDeeplink } from "@raycast/utils";
import {
  buildQuicklinkExport,
  buildQuicklinkImportDeeplink,
} from "./quicklink-data.js";
import type { Camera } from "./types.js";

export function cameraDeeplink(cameraId: string): string {
  return createDeeplink({
    command: "open-camera",
    arguments: { camera: cameraId },
  });
}

export async function addQuicklinksToRootSearch(
  cameras: Camera[],
  getLink: (cameraId: string) => string,
  includeSubstreams = false,
): Promise<void> {
  const quicklinks = buildQuicklinkExport(cameras, getLink, includeSubstreams);
  await open(buildQuicklinkImportDeeplink(quicklinks));
}
