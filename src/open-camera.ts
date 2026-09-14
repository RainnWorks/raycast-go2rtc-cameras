import {
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
import type { ExtensionPreferences } from "./types.js";

type OpenCameraProps = {
  arguments: {
    camera: string;
  };
};

export default async function OpenCamera(props: OpenCameraProps) {
  const preferences = getPreferenceValues<ExtensionPreferences>();
  const cameraId = props.arguments.camera.trim();

  if (!cameraId) {
    await showHUD("Enter a camera name");
    return;
  }

  try {
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
