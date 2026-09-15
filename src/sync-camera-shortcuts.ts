import {
  Clipboard,
  LaunchType,
  Toast,
  getPreferenceValues,
  launchCommand,
  showToast,
  updateCommandMetadata,
} from "@raycast/api";
import type { LaunchProps } from "@raycast/api";
import { cameraDeeplink } from "./deeplinks.js";
import { fetchCameras } from "./go2rtc.js";
import {
  cameraCommandDirectory,
  getRootSearchVerification,
} from "./root-search.js";
import { syncCameraScripts } from "./script-commands.js";
import type { ExtensionPreferences } from "./types.js";

export { cameraCommandDirectory } from "./root-search.js";

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
    const verification = await getRootSearchVerification();
    await updateCommandMetadata({
      subtitle: verification
        ? `${result.filePaths.length} camera${result.filePaths.length === 1 ? "" : "s"}`
        : `Setup Required · ${result.filePaths.length} camera${result.filePaths.length === 1 ? "" : "s"}`,
    });
    if (props.launchType === LaunchType.Background) return;

    if (!verification) {
      await Clipboard.copy(cameraCommandDirectory());
      await showToast({
        style: Toast.Style.Animated,
        title: "Camera Commands Are Ready",
        message: "Finish the one-time Script Commands folder approval.",
      });
      await launchCommand({
        name: "setup-root-search",
        type: LaunchType.UserInitiated,
        context: {
          cameraCount: result.filePaths.length,
        },
      });
      return;
    }

    const changes = [
      result.added > 0 ? `${result.added} added` : undefined,
      result.updated > 0 ? `${result.updated} updated` : undefined,
      result.removed > 0 ? `${result.removed} removed` : undefined,
    ].filter(Boolean);
    await showToast({
      style: Toast.Style.Success,
      title: `${result.filePaths.length} Camera Command${result.filePaths.length === 1 ? "" : "s"} Synced`,
      message:
        changes.length > 0
          ? changes.join(" · ")
          : "Everything already matches go2rtc.",
    });
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
