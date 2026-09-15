import {
  Action,
  ActionPanel,
  Clipboard,
  Detail,
  Icon,
  Keyboard,
  Toast,
  showInFinder,
  showToast,
} from "@raycast/api";
import type { LaunchProps } from "@raycast/api";
import { useCachedPromise } from "@raycast/utils";
import { mkdir } from "node:fs/promises";
import { useState } from "react";
import {
  cameraCommandDirectory,
  getRootSearchVerification,
} from "./root-search.js";
import { syncShortcuts } from "./sync-camera-shortcuts.js";

interface SetupLaunchContext {
  cameraCount?: number;
}

type SetupProps = LaunchProps<{
  launchContext?: SetupLaunchContext;
}>;

function formatVerifiedAt(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function setupMarkdown(cameraCount: number | undefined): string {
  const readyMessage =
    cameraCount === undefined
      ? "Sync once to generate the camera commands, then approve their folder in Raycast."
      : `**${cameraCount} camera command${cameraCount === 1 ? " is" : "s are"} ready.** Their folder path has already been copied.`;

  return `# Put Your Cameras in Root Search

${readyMessage}

Raycast requires one approval before it will show generated commands in Root Search.

## One-time setup

1. Open **Raycast Settings** with **⌘ ,**.
2. In the **Extensions** section, choose **Script Commands**.
3. Press **+** beside **Script Folders**.
4. In the folder picker, press **⌘ ⇧ G**, paste the copied path, and press Return.
5. Select the exact **root-search-commands** folder.

\`\`\`
${cameraCommandDirectory()}
\`\`\`

> Choose that exact folder—not Downloads or its parent.

Then open Raycast, type a camera name, and press Return. That successful launch confirms setup automatically. New cameras will be added and removed cameras will disappear on future syncs.`;
}

function verifiedMarkdown(verifiedAt: string): string {
  return `# Camera Root Search Is Working

Raycast has successfully launched a generated camera command from the managed Script Commands folder.

**Last verified:** ${formatVerifiedAt(verifiedAt)}

The extension will keep the files in that folder aligned with go2rtc every five minutes. If a camera disappears from go2rtc, its managed command is removed after the next successful sync.

Raycast does not let extensions read the Script Folders list directly. If you later remove the folder in Settings, reopen this guide and add it again.`;
}

export default function SetupRootSearch(props: SetupProps) {
  const directory = cameraCommandDirectory();
  const [cameraCount, setCameraCount] = useState(
    props.launchContext?.cameraCount,
  );
  const [isSyncing, setIsSyncing] = useState(false);
  const { data: verification, isLoading } = useCachedPromise(
    getRootSearchVerification,
  );

  async function syncAndCopy() {
    setIsSyncing(true);
    try {
      const result = await syncShortcuts();
      setCameraCount(result.filePaths.length);
      await Clipboard.copy(directory);
      await showToast({
        style: Toast.Style.Success,
        title: `${result.filePaths.length} Camera Command${result.filePaths.length === 1 ? "" : "s"} Ready`,
        message:
          "Folder path copied. Add it under Script Folders in Raycast Settings.",
      });
    } catch (error) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Could Not Sync Camera Commands",
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred.",
      });
    } finally {
      setIsSyncing(false);
    }
  }

  async function revealDirectory() {
    await mkdir(directory, { recursive: true });
    await showInFinder(directory);
  }

  return (
    <Detail
      isLoading={isLoading || isSyncing}
      markdown={
        verification
          ? verifiedMarkdown(verification.verifiedAt)
          : setupMarkdown(cameraCount)
      }
      actions={
        <ActionPanel>
          <Action
            title={
              cameraCount === undefined
                ? "Sync Commands and Copy Folder Path"
                : "Copy Script Folder Path Again"
            }
            icon={Icon.Clipboard}
            onAction={
              cameraCount === undefined
                ? syncAndCopy
                : async () => {
                    await Clipboard.copy(directory);
                    await showToast({
                      style: Toast.Style.Success,
                      title: "Script Folder Path Copied",
                    });
                  }
            }
            shortcut={Keyboard.Shortcut.Common.Copy}
          />
          <Action
            title="Sync Camera Commands"
            icon={Icon.ArrowClockwise}
            onAction={syncAndCopy}
            shortcut={Keyboard.Shortcut.Common.Refresh}
          />
          <Action
            title="Show Script Folder in Finder"
            icon={Icon.Finder}
            onAction={revealDirectory}
          />
          <Action.OpenInBrowser
            title="Open Raycast Script Commands Help"
            url="https://manual.raycast.com/script-commands"
            icon={Icon.QuestionMark}
          />
        </ActionPanel>
      }
    />
  );
}
