import { createHash } from "node:crypto";
import {
  chmod,
  mkdir,
  readFile,
  readdir,
  rename,
  unlink,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { camerasForRootSearch, rootSearchName } from "./camera-shortcuts.js";
import type { Camera } from "./types.js";

const FILE_PREFIX = "go2rtc-camera-";
const MANAGED_MARKER = "go2rtc-camera-command: managed";

export type ScriptPlatform = "macOS" | "Windows";

export interface SyncResult {
  added: number;
  updated: number;
  removed: number;
  unchanged: number;
  filePaths: string[];
}

function oneLine(value: string): string {
  return value
    .replace(/[\r\n]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function commandFileName(cameraId: string, platform: ScriptPlatform): string {
  const digest = createHash("sha256")
    .update(cameraId)
    .digest("hex")
    .slice(0, 16);
  return `${FILE_PREFIX}${digest}${platform === "Windows" ? ".ps1" : ".sh"}`;
}

function quoteForBash(value: string): string {
  return `'${value.replaceAll("'", `'"'"'`)}'`;
}

function quoteForPowerShell(value: string): string {
  return `'${value.replaceAll("'", "''")}'`;
}

export function renderCameraScript(
  camera: Camera,
  deeplink: string,
  platform: ScriptPlatform,
): string {
  const title = oneLine(rootSearchName(camera));
  const description = oneLine(`Open the ${camera.title} go2rtc stream`);
  const metadata = [
    "# Required parameters:",
    "# @raycast.schemaVersion 1",
    `# @raycast.title ${title}`,
    "# @raycast.mode silent",
    "",
    "# Optional parameters:",
    "# @raycast.icon 🎥",
    "# @raycast.packageName go2rtc Cameras",
    `# @raycast.description ${description}`,
    "",
    `# ${MANAGED_MARKER}`,
  ].join("\n");

  if (platform === "Windows") {
    return `${metadata}\n\nStart-Process ${quoteForPowerShell(deeplink)}\n`;
  }

  return `#!/bin/bash\n\n${metadata}\n\nopen ${quoteForBash(deeplink)}\n`;
}

async function isManagedScript(filePath: string): Promise<boolean> {
  try {
    const contents = await readFile(filePath, "utf8");
    return contents.includes(MANAGED_MARKER);
  } catch {
    return false;
  }
}

export async function syncCameraScripts(
  directory: string,
  cameras: Camera[],
  getDeeplink: (cameraId: string) => string,
  platform: ScriptPlatform,
  includeSubstreams = false,
): Promise<SyncResult> {
  await mkdir(directory, { recursive: true });

  const desiredCameras = camerasForRootSearch(cameras, includeSubstreams);
  const desiredFiles = new Map(
    desiredCameras.map((camera) => [
      commandFileName(camera.id, platform),
      renderCameraScript(camera, getDeeplink(camera.id), platform),
    ]),
  );
  const result: SyncResult = {
    added: 0,
    updated: 0,
    removed: 0,
    unchanged: 0,
    filePaths: [],
  };

  for (const [fileName, contents] of desiredFiles) {
    const filePath = path.join(directory, fileName);
    result.filePaths.push(filePath);
    let previous: string | undefined;
    try {
      previous = await readFile(filePath, "utf8");
    } catch {
      // A missing file is added below.
    }

    if (previous === contents) {
      result.unchanged += 1;
      continue;
    }

    const temporaryPath = `${filePath}.tmp`;
    await writeFile(temporaryPath, contents, {
      encoding: "utf8",
      mode: 0o755,
    });
    await rename(temporaryPath, filePath);
    if (platform === "macOS") await chmod(filePath, 0o755);
    if (previous === undefined) result.added += 1;
    else result.updated += 1;
  }

  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    if (
      !entry.isFile() ||
      !entry.name.startsWith(FILE_PREFIX) ||
      desiredFiles.has(entry.name)
    ) {
      continue;
    }

    const filePath = path.join(directory, entry.name);
    if (await isManagedScript(filePath)) {
      await unlink(filePath);
      result.removed += 1;
    }
  }

  return result;
}
