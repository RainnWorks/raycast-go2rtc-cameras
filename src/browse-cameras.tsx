import {
  Action,
  ActionPanel,
  Icon,
  LaunchType,
  List,
  Toast,
  getPreferenceValues,
  launchCommand,
  openExtensionPreferences,
  showToast,
} from "@raycast/api";
import { useCachedPromise } from "@raycast/utils";
import { CameraActions } from "./camera-actions.js";
import { fetchCameras } from "./go2rtc.js";
import { getRootSearchVerification } from "./root-search.js";
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
  const {
    data: rootSearchVerification,
    isLoading: isLoadingRootSearchVerification,
  } = useCachedPromise(getRootSearchVerification);

  async function handleSyncShortcuts() {
    if (cameras.length === 0) {
      await showToast({
        style: Toast.Style.Failure,
        title: "There are no cameras to sync",
      });
      return;
    }
    await launchCommand({
      name: "sync-camera-shortcuts",
      type: LaunchType.UserInitiated,
    });
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

      {!isLoading &&
      !isLoadingRootSearchVerification &&
      cameras.length > 0 &&
      !rootSearchVerification ? (
        <List.Item
          icon={Icon.ExclamationMark}
          title="Finish Root Search Setup"
          subtitle="Add the camera command folder in Raycast Settings"
          actions={
            <ActionPanel>
              <Action
                title="Sync Commands and Show Setup"
                icon={Icon.ArrowClockwise}
                onAction={handleSyncShortcuts}
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
