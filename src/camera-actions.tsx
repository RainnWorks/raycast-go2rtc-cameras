import {
  Action,
  ActionPanel,
  Clipboard,
  Icon,
  Toast,
  getPreferenceValues,
  openExtensionPreferences,
  showToast,
  Keyboard,
} from "@raycast/api";
import {
  addHttpCredentials,
  buildCameraUrls,
  selectPlaybackUrl,
} from "./go2rtc.js";
import { cameraDeeplink } from "./quicklinks.js";
import type { Camera, ExtensionPreferences } from "./types.js";

interface CameraActionsProps {
  camera: Camera;
  onExportAll: () => Promise<void>;
  onRefresh: () => void | Promise<void>;
}

async function copyLink(link: string, title: string) {
  await Clipboard.copy(link);
  await showToast({ style: Toast.Style.Success, title });
}

export function CameraActions({
  camera,
  onExportAll,
  onRefresh,
}: CameraActionsProps) {
  const preferences = getPreferenceValues<ExtensionPreferences>();
  const urls = buildCameraUrls(
    preferences.serverUrl,
    camera.id,
    preferences.rtspBaseUrl,
  );
  const cleanPlaybackUrl = selectPlaybackUrl(urls, preferences.playbackFormat);
  const playbackUrl = preferences.passCredentialsToPlayer
    ? addHttpCredentials(
        cleanPlaybackUrl,
        preferences.username,
        preferences.password,
      )
    : cleanPlaybackUrl;
  const preferredApp = preferences.preferredApplication;
  const useApplicationByDefault =
    preferences.defaultAction === "application" && preferredApp;

  const browserAction = (
    <Action.Open
      key="browser"
      title="Open in Browser"
      target={urls.browser}
      icon={Icon.Globe}
    />
  );

  const applicationAction = preferredApp ? (
    <Action.Open
      key="application"
      title={`Open in ${preferredApp.name}`}
      target={playbackUrl}
      application={preferredApp}
      icon={Icon.Play}
    />
  ) : null;

  return (
    <ActionPanel>
      <ActionPanel.Section>
        {useApplicationByDefault ? applicationAction : browserAction}
        {useApplicationByDefault ? browserAction : applicationAction}
        <Action.OpenWith
          title="Open Stream with…"
          path={playbackUrl}
          shortcut={Keyboard.Shortcut.Common.OpenWith}
        />
        <Action.Open
          title="Open Go2rtc Stream Details"
          target={urls.details}
          icon={Icon.Info}
        />
      </ActionPanel.Section>

      <ActionPanel.Section title="Shortcuts">
        <Action.CreateQuicklink
          title="Create Camera Quicklink"
          quicklink={{ name: camera.title, link: cameraDeeplink(camera.id) }}
          icon={Icon.Link}
          shortcut={Keyboard.Shortcut.Common.Copy}
        />
        <Action
          title="Export Quicklinks for All Cameras"
          icon={Icon.Download}
          onAction={onExportAll}
          shortcut={{
            macOS: { modifiers: ["cmd", "shift"], key: "e" },
            Windows: { modifiers: ["ctrl", "shift"], key: "e" },
          }}
        />
      </ActionPanel.Section>

      <ActionPanel.Section title="Copy Links">
        <Action
          title="Copy Browser Link"
          icon={Icon.Clipboard}
          onAction={() => copyLink(urls.browser, "Browser link copied")}
        />
        <Action
          title="Copy Player Link"
          icon={Icon.Clipboard}
          onAction={() => copyLink(cleanPlaybackUrl, "Player link copied")}
        />
        <Action
          title="Copy RTSP Link"
          icon={Icon.Clipboard}
          onAction={() => copyLink(urls.rtsp, "RTSP link copied")}
        />
        <Action
          title="Copy HLS Link"
          icon={Icon.Clipboard}
          onAction={() => copyLink(urls.hls, "HLS link copied")}
        />
        <Action
          title="Copy MP4 Link"
          icon={Icon.Clipboard}
          onAction={() => copyLink(urls.mp4, "MP4 link copied")}
        />
      </ActionPanel.Section>
      <ActionPanel.Section>
        <Action
          title="Refresh Cameras"
          icon={Icon.ArrowClockwise}
          onAction={onRefresh}
          shortcut={Keyboard.Shortcut.Common.Refresh}
        />
        <Action
          title="Open Extension Preferences"
          icon={Icon.Gear}
          onAction={openExtensionPreferences}
        />
      </ActionPanel.Section>
    </ActionPanel>
  );
}
