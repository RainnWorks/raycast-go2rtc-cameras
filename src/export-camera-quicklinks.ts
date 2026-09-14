import { Toast, getPreferenceValues, showHUD, showToast } from "@raycast/api";
import { fetchCameras } from "./go2rtc.js";
import { cameraDeeplink, exportQuicklinks } from "./quicklinks.js";
import type { ExtensionPreferences } from "./types.js";

export default async function ExportCameraQuicklinks() {
  const preferences = getPreferenceValues<ExtensionPreferences>();

  try {
    const cameras = await fetchCameras(preferences);
    if (cameras.length === 0) {
      await showHUD("No go2rtc cameras found");
      return;
    }
    await exportQuicklinks(cameras, cameraDeeplink);
  } catch (error) {
    await showToast({
      style: Toast.Style.Failure,
      title: "Could Not Export Camera Quicklinks",
      message:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred.",
    });
  }
}
