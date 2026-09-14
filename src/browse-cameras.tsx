import {
  Action,
  ActionPanel,
  Icon,
  List,
  Toast,
  getPreferenceValues,
  openExtensionPreferences,
  showToast,
} from "@raycast/api";
import { useCachedPromise } from "@raycast/utils";
import { CameraActions } from "./camera-actions.js";
import { fetchCameras } from "./go2rtc.js";
import { syncShortcuts } from "./sync-camera-shortcuts.js";
import type { ExtensionPreferences } from "./types.js";

async function loadCameras() {
  const preferences = getPreferenceValues<ExtensionPreferences>();
  return fetchCameras(preferences);
}

export default function BrowseCameras() {
  const {
    data: cameras = [],
    error,
    isLoading,
    revalidate,
  } = useCachedPromise(loadCameras);

  async function handleSyncShortcuts() {
    if (cameras.length === 0) {
      await showToast({
        style: Toast.Style.Failure,
        title: "There are no cameras to sync",
      });
      return;
    }
    await syncShortcuts();
  }

  const errorMessage = error instanceof Error ? error.message : undefined;

  return (
    <List isLoading={isLoading} searchBarPlaceholder="Search cameras…">
      {!isLoading && cameras.length === 0 ? (
        <List.EmptyView
          icon={error ? Icon.ExclamationMark : Icon.Video}
          title={error ? "Could Not Load Cameras" : "No Cameras Found"}
          description={errorMessage ?? "go2rtc returned an empty stream list."}
          actions={
            <ActionPanel>
              <Action
                title="Try Again"
                icon={Icon.ArrowClockwise}
                onAction={revalidate}
              />
              <Action
                title="Open Extension Preferences"
                icon={Icon.Gear}
                onAction={openExtensionPreferences}
              />
            </ActionPanel>
          }
        />
      ) : null}

      {cameras.map((camera) => (
        <List.Item
          key={camera.id}
          icon={Icon.Video}
          title={camera.title}
          subtitle={camera.title === camera.id ? undefined : camera.id}
          keywords={[camera.id]}
          accessories={
            camera.consumerCount > 0
              ? [
                  {
                    text: `${camera.consumerCount} connection${camera.consumerCount === 1 ? "" : "s"}`,
                    icon: Icon.Link,
                  },
                ]
              : undefined
          }
          actions={
            <CameraActions
              camera={camera}
              onSyncShortcuts={handleSyncShortcuts}
              onRefresh={revalidate}
            />
          }
        />
      ))}
    </List>
  );
}
