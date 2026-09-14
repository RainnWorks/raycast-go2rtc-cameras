import { Toast, getPreferenceValues, showHUD, showToast } from "@raycast/api";
import { fetchCameras } from "./go2rtc.js";
import { addQuicklinksToRootSearch, cameraDeeplink } from "./quicklinks.js";
import type { ExtensionPreferences } from "./types.js";

export default async function ExportCameraQuicklinks() {
  const preferences = getPreferenceValues<ExtensionPreferences>();

  try {
    const cameras = await fetchCameras(preferences);
    if (cameras.length === 0) {
      await showHUD("No go2rtc cameras found");
      return;
    }
    await addQuicklinksToRootSearch(
      cameras,
      cameraDeeplink,
      preferences.includeSubstreamsInRootSearch,
    );
  } catch (error) {
    await showToast({
      style: Toast.Style.Failure,
      title: "Could Not Add Camera Shortcuts",
      message:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred.",
    });
  }
}
