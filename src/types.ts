import type { Application } from "@raycast/api";

export type PlaybackFormat = "mp4" | "hls" | "rtsp";
export type DefaultAction = "browser" | "application";

export interface ExtensionPreferences {
  serverUrl: string;
  username?: string;
  password?: string;
  defaultAction: DefaultAction;
  preferredApplication?: Application;
  playbackFormat: PlaybackFormat;
  rtspBaseUrl?: string;
  passCredentialsToPlayer?: boolean;
  includeSubstreamsInRootSearch?: boolean;
}

export interface Camera {
  id: string;
  title: string;
  producerCount: number;
  consumerCount: number;
}

export interface CameraUrls {
  browser: string;
  details: string;
  mp4: string;
  hls: string;
  rtsp: string;
}

export interface QuicklinkExport {
  name: string;
  link: string;
  iconName?: string;
}
