import type {
  Camera,
  CameraUrls,
  ExtensionPreferences,
  PlaybackFormat,
} from "./types.js";

const DEFAULT_RTSP_PORT = "8554";
const REQUEST_TIMEOUT_MS = 8_000;

type StreamInfo = {
  producers?: unknown[] | null;
  consumers?: unknown[] | null;
};

export class Go2rtcError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "Go2rtcError";
  }
}

export function normalizeServerUrl(input: string): URL {
  const value = input.trim();
  if (!value) {
    throw new Go2rtcError(
      "Enter your go2rtc address in the extension preferences.",
    );
  }

  const withScheme = /^[a-z][a-z\d+.-]*:\/\//i.test(value)
    ? value
    : `http://${value}`;
  let parsed: URL;

  try {
    parsed = new URL(withScheme);
  } catch {
    throw new Go2rtcError("The go2rtc address is not a valid URL.");
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Go2rtcError("The go2rtc address must use HTTP or HTTPS.");
  }

  if (parsed.username || parsed.password) {
    throw new Go2rtcError(
      "Remove credentials from the address and use the Username and Password preferences instead.",
    );
  }

  parsed.search = "";
  parsed.hash = "";

  const knownSuffix = /\/(?:api\/streams|api|stream\.html|links\.html)$/i;
  parsed.pathname = parsed.pathname
    .replace(/\/+$/, "")
    .replace(knownSuffix, "");
  parsed.pathname = `${parsed.pathname.replace(/\/+$/, "")}/`;

  return parsed;
}

export function humanizeCameraName(id: string): string {
  const isSubstream = /(?:[_\-\s]sub)$/i.test(id.trim());
  const baseId = isSubstream ? id.trim().replace(/(?:[_\-\s]sub)$/i, "") : id;
  const words = baseId.trim().replace(/[_-]+/g, " ").replace(/\s+/g, " ");
  if (!words) return id;
  const title = /[A-Z]/.test(words.slice(1))
    ? words
    : words.replace(/\b\p{L}/gu, (letter) => letter.toLocaleUpperCase());
  return isSubstream ? `${title} — Substream` : title;
}

export function parseStreams(payload: unknown): Camera[] {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Go2rtcError("go2rtc returned an unexpected streams response.");
  }

  return Object.entries(payload as Record<string, StreamInfo>)
    .map(([id, info]) => ({
      id,
      title: humanizeCameraName(id),
      producerCount: Array.isArray(info?.producers) ? info.producers.length : 0,
      consumerCount: Array.isArray(info?.consumers) ? info.consumers.length : 0,
    }))
    .sort((left, right) =>
      left.title.localeCompare(right.title, undefined, { numeric: true }),
    );
}

function basicAuthHeader(
  username?: string,
  password?: string,
): string | undefined {
  if (!username && !password) return undefined;
  return `Basic ${Buffer.from(`${username ?? ""}:${password ?? ""}`, "utf8").toString("base64")}`;
}

export async function fetchCameras(
  preferences: Pick<
    ExtensionPreferences,
    "serverUrl" | "username" | "password"
  >,
): Promise<Camera[]> {
  const baseUrl = normalizeServerUrl(preferences.serverUrl);
  const endpoint = new URL("api/streams", baseUrl);
  const auth = basicAuthHeader(preferences.username, preferences.password);

  let response: Response;
  try {
    response = await fetch(endpoint, {
      headers: auth
        ? { Authorization: auth, Accept: "application/json" }
        : { Accept: "application/json" },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    if (
      error instanceof Error &&
      (error.name === "TimeoutError" || error.name === "AbortError")
    ) {
      throw new Go2rtcError(
        "The go2rtc server did not respond within 8 seconds.",
      );
    }
    throw new Go2rtcError(
      "Could not reach the go2rtc server. Check its address and your network connection.",
    );
  }

  if (response.status === 401) {
    throw new Go2rtcError("go2rtc rejected the username or password.");
  }
  if (response.status === 404) {
    throw new Go2rtcError(
      "The streams API was not found. Include go2rtc's base path in the address if it uses one.",
    );
  }
  if (!response.ok) {
    throw new Go2rtcError(`go2rtc returned HTTP ${response.status}.`);
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new Go2rtcError("go2rtc did not return valid JSON.");
  }

  return parseStreams(payload);
}

function buildRtspUrl(
  baseUrl: URL,
  cameraId: string,
  override?: string,
): string {
  let rtspBase: URL;

  if (override?.trim()) {
    const value = override.trim();
    const withScheme = /^[a-z][a-z\d+.-]*:\/\//i.test(value)
      ? value
      : `rtsp://${value}`;
    try {
      rtspBase = new URL(withScheme);
    } catch {
      throw new Go2rtcError("The RTSP address is not a valid URL.");
    }
    if (rtspBase.protocol !== "rtsp:" && rtspBase.protocol !== "rtsps:") {
      throw new Go2rtcError("The RTSP address must use RTSP or RTSPS.");
    }
  } else {
    rtspBase = new URL(`rtsp://${baseUrl.hostname}:${DEFAULT_RTSP_PORT}/`);
  }

  rtspBase.search = "";
  rtspBase.hash = "";
  rtspBase.pathname = `${rtspBase.pathname.replace(/\/+$/, "")}/${encodeURIComponent(cameraId)}`;
  return rtspBase.toString();
}

export function buildCameraUrls(
  serverUrl: string,
  cameraId: string,
  rtspBaseUrl?: string,
): CameraUrls {
  const baseUrl = normalizeServerUrl(serverUrl);
  const encodedId = cameraId;

  const browser = new URL("stream.html", baseUrl);
  browser.searchParams.set("src", encodedId);

  const details = new URL("links.html", baseUrl);
  details.searchParams.set("src", encodedId);

  const mp4 = new URL("api/stream.mp4", baseUrl);
  mp4.searchParams.set("src", encodedId);
  mp4.searchParams.set("mp4", "flac");

  const hls = new URL("api/stream.m3u8", baseUrl);
  hls.searchParams.set("src", encodedId);
  hls.searchParams.set("mp4", "flac");

  return {
    browser: browser.toString(),
    details: details.toString(),
    mp4: mp4.toString(),
    hls: hls.toString(),
    rtsp: buildRtspUrl(baseUrl, cameraId, rtspBaseUrl),
  };
}

export function selectPlaybackUrl(
  urls: CameraUrls,
  format: PlaybackFormat,
): string {
  return urls[format];
}

export function addHttpCredentials(
  url: string,
  username?: string,
  password?: string,
): string {
  if (!username && !password) return url;
  const parsed = new URL(url);
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return url;
  parsed.username = username ?? "";
  parsed.password = password ?? "";
  return parsed.toString();
}
