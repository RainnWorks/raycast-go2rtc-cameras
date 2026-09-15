import { LocalStorage, environment } from "@raycast/api";
import path from "node:path";

const VERIFICATION_KEY = "root-search-verification-v1";

export const MANAGED_SCRIPT_LAUNCH_SOURCE = "managed-camera-script";

export interface RootSearchLaunchContext {
  source?: typeof MANAGED_SCRIPT_LAUNCH_SOURCE;
}

export interface RootSearchVerification {
  directory: string;
  verifiedAt: string;
  version: 1;
}

export function cameraCommandDirectory(): string {
  return path.join(environment.supportPath, "root-search-commands");
}

export async function markRootSearchVerified(): Promise<void> {
  const verification: RootSearchVerification = {
    directory: cameraCommandDirectory(),
    verifiedAt: new Date().toISOString(),
    version: 1,
  };
  await LocalStorage.setItem(VERIFICATION_KEY, JSON.stringify(verification));
}

export async function getRootSearchVerification(): Promise<
  RootSearchVerification | undefined
> {
  const stored = await LocalStorage.getItem<string>(VERIFICATION_KEY);
  if (!stored) return undefined;

  try {
    const verification = JSON.parse(stored) as Partial<RootSearchVerification>;
    if (
      verification.version !== 1 ||
      verification.directory !== cameraCommandDirectory() ||
      typeof verification.verifiedAt !== "string" ||
      Number.isNaN(Date.parse(verification.verifiedAt))
    ) {
      return undefined;
    }
    return verification as RootSearchVerification;
  } catch {
    return undefined;
  }
}
