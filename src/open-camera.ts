import {
  type LaunchProps,
  Toast,
  closeMainWindow,
  getPreferenceValues,
  open,
  showHUD,
  showToast,
} from "@raycast/api";
import {
  addHttpCredentials,
  buildCameraUrls,
  selectPlaybackUrl,
} from "./go2rtc.js";
import {
  MANAGED_SCRIPT_LAUNCH_SOURCE,
  markRootSearchVerified,
  type RootSearchLaunchContext,
} from "./root-search.js";
import type { ExtensionPreferences } from "./types.js";

type OpenCameraProps = LaunchProps<{
  arguments: {
    camera: string;
  };
  launchContext?: RootSearchLaunchContext;
}>;

export default async function OpenCamera(props: OpenCameraProps) {
  const preferences = getPreferenceValues<ExtensionPreferences>();
  const cameraId = props.arguments.camera.trim();

  if (!cameraId) {
    await showHUD("Enter a camera name");
    return;
  }

  try {
    if (props.launchContext?.source === MANAGED_SCRIPT_LAUNCH_SOURCE) {
      // This launch proves that Raycast indexed the managed Script Commands folder.
      // Verification should never prevent the camera itself from opening.
      await markRootSearchVerified().catch(() => undefined);
    }

    const urls = buildCameraUrls(
      preferences.serverUrl,
      cameraId,
      preferences.rtspBaseUrl,
    );
    const shouldUseApplication =
      preferences.defaultAction === "application" &&
      preferences.preferredApplication;

    if (shouldUseApplication) {
      const cleanPlaybackUrl = selectPlaybackUrl(
        urls,
        preferences.playbackFormat,
      );
      const playbackUrl = preferences.passCredentialsToPlayer
        ? addHttpCredentials(
            cleanPlaybackUrl,
            preferences.username,
            preferences.password,
          )
        : cleanPlaybackUrl;
      await open(playbackUrl, preferences.preferredApplication);
    } else {
      await open(urls.browser);
    }
    await closeMainWindow();
  } catch (error) {
    await showToast({
      style: Toast.Style.Failure,
      title: "Could Not Open Camera",
      message:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred.",
    });
  }
}
