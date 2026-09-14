import { createDeeplink } from "@raycast/utils";

export function cameraDeeplink(cameraId: string): string {
  return createDeeplink({
    command: "open-camera",
    arguments: { camera: cameraId },
  });
}
