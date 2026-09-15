import { createDeeplink } from "@raycast/utils";
import { MANAGED_SCRIPT_LAUNCH_SOURCE } from "./root-search.js";

export function cameraDeeplink(cameraId: string): string {
  return createDeeplink({
    command: "open-camera",
    arguments: { camera: cameraId },
    context: { source: MANAGED_SCRIPT_LAUNCH_SOURCE },
  });
}
