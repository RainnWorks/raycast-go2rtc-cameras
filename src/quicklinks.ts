import {
  environment,
  open,
  showInFinder,
  showToast,
  Toast,
} from "@raycast/api";
import { createDeeplink } from "@raycast/utils";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { buildQuicklinkExport } from "./quicklink-data.js";
import type { Camera } from "./types.js";

export function cameraDeeplink(cameraId: string): string {
  return createDeeplink({
    command: "open-camera",
    arguments: { camera: cameraId },
  });
}

export async function exportQuicklinks(
  cameras: Camera[],
  getLink: (cameraId: string) => string,
): Promise<string> {
  await mkdir(environment.supportPath, { recursive: true });
  const filePath = path.join(
    environment.supportPath,
    "go2rtc-camera-quicklinks.json",
  );
  const quicklinks = buildQuicklinkExport(cameras, getLink);
  await writeFile(filePath, `${JSON.stringify(quicklinks, null, 2)}\n`, "utf8");
  if (process.platform === "darwin") {
    await showInFinder(filePath);
  } else {
    await open(environment.supportPath);
  }
  await showToast({
    style: Toast.Style.Success,
    title: `${quicklinks.length} camera Quicklink${quicklinks.length === 1 ? "" : "s"} ready`,
    message:
      "Run Raycast's Import Quicklinks command and choose the revealed file.",
  });
  return filePath;
}
