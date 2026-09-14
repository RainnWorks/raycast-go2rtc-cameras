import {
  Clipboard,
  LaunchType,
  Toast,
  environment,
  getPreferenceValues,
  showInFinder,
  showToast,
  updateCommandMetadata,
} from "@raycast/api";
import type { LaunchProps } from "@raycast/api";
import path from "node:path";
import { cameraDeeplink } from "./deeplinks.js";
import { fetchCameras } from "./go2rtc.js";
import { syncCameraScripts } from "./script-commands.js";
import type { ExtensionPreferences } from "./types.js";

export function cameraCommandDirectory(): string {
  return path.join(environment.supportPath, "root-search-commands");
}

export async function syncShortcuts() {
  const preferences = getPreferenceValues<ExtensionPreferences>();
  const cameras = await fetchCameras(preferences);
  const result = await syncCameraScripts(
    cameraCommandDirectory(),
    cameras,
    cameraDeeplink,
    process.platform === "win32" ? "Windows" : "macOS",
    preferences.includeSubstreamsInRootSearch,
  );
  return result;
}

export default async function SyncCameraShortcuts(props: LaunchProps) {
  try {
    const result = await syncShortcuts();
    await updateCommandMetadata({
      subtitle: `${result.filePaths.length} camera${result.filePaths.length === 1 ? "" : "s"}`,
    });
    if (props.launchType === LaunchType.Background) return;

    const directory = cameraCommandDirectory();
    await Clipboard.copy(directory);
    await showToast({
      style: Toast.Style.Success,
      title: `${result.filePaths.length} Camera Command${result.filePaths.length === 1 ? "" : "s"} Synced`,
      message:
        "Add the revealed folder once in Raycast Settings → Script Commands. Its path is copied.",
    });
    if (result.filePaths[0]) await showInFinder(result.filePaths[0]);
    else await showInFinder(directory);
  } catch (error) {
    if (props.launchType === LaunchType.Background) return;
    await showToast({
      style: Toast.Style.Failure,
      title: "Could Not Sync Camera Shortcuts",
      message:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred.",
    });
  }
}
