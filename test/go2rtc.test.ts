import assert from "node:assert/strict";
import test from "node:test";
import {
  addHttpCredentials,
  buildCameraUrls,
  humanizeCameraName,
  normalizeServerUrl,
  parseStreams,
  selectPlaybackUrl,
} from "../src/go2rtc.js";

test("normalizes roots, pasted pages, and go2rtc base paths", () => {
  assert.equal(
    normalizeServerUrl("192.168.1.20:1984").toString(),
    "http://192.168.1.20:1984/",
  );
  assert.equal(
    normalizeServerUrl(
      "https://cameras.example.test/rtc/stream.html?src=Mias%20camera",
    ).toString(),
    "https://cameras.example.test/rtc/",
  );
  assert.equal(
    normalizeServerUrl(
      "https://cameras.example.test/rtc/api/streams",
    ).toString(),
    "https://cameras.example.test/rtc/",
  );
});

test("rejects credentials in the address", () => {
  assert.throws(
    () => normalizeServerUrl("http://admin:secret@cameras.test:1984"),
    /use the Username and Password preferences/,
  );
});

test("humanizes common go2rtc stream identifiers without mangling existing case", () => {
  assert.equal(humanizeCameraName("mia_room"), "Mia Room");
  assert.equal(humanizeCameraName("mia_room_sub"), "Mia Room — Substream");
  assert.equal(humanizeCameraName("Tali camera"), "Tali Camera");
  assert.equal(humanizeCameraName("front-door-2"), "Front Door 2");
});

test("adds HTTP credentials only to runtime player URLs", () => {
  assert.equal(
    addHttpCredentials(
      "https://cameras.example.test/api/stream.mp4?src=tali_room",
      "viewer",
      "p@ss word",
    ),
    "https://viewer:p%40ss%20word@cameras.example.test/api/stream.mp4?src=tali_room",
  );
  assert.equal(
    addHttpCredentials(
      "rtsp://cameras.example.test:8554/tali_room",
      "viewer",
      "secret",
    ),
    "rtsp://cameras.example.test:8554/tali_room",
  );
});

test("parses and naturally sorts Mia and Tali camera data", () => {
  const cameras = parseStreams({
    tali_room: { producers: [], consumers: [{ url: "viewer" }] },
    mia_room_sub: { producers: [{ url: "source" }], consumers: null },
    mia_room: { producers: [{ url: "source" }], consumers: [] },
  });

  assert.deepEqual(
    cameras.map(({ id, producerCount, consumerCount }) => ({
      id,
      producerCount,
      consumerCount,
    })),
    [
      { id: "mia_room", producerCount: 1, consumerCount: 0 },
      { id: "mia_room_sub", producerCount: 1, consumerCount: 0 },
      { id: "tali_room", producerCount: 0, consumerCount: 1 },
    ],
  );
});

test("builds encoded browser, HTTP player, HLS, and RTSP URLs", () => {
  const urls = buildCameraUrls(
    "https://cameras.example.test/rtc",
    "Mias camera",
  );

  assert.equal(
    urls.browser,
    "https://cameras.example.test/rtc/stream.html?src=Mias+camera",
  );
  assert.equal(
    urls.mp4,
    "https://cameras.example.test/rtc/api/stream.mp4?src=Mias+camera&mp4=flac",
  );
  assert.equal(
    urls.hls,
    "https://cameras.example.test/rtc/api/stream.m3u8?src=Mias+camera&mp4=flac",
  );
  assert.equal(urls.rtsp, "rtsp://cameras.example.test:8554/Mias%20camera");
  assert.equal(selectPlaybackUrl(urls, "hls"), urls.hls);
});

test("uses an explicit RTSP address when supplied", () => {
  const urls = buildCameraUrls(
    "https://public.example.test/go2rtc",
    "Tali/camera",
    "rtsps://lan.example.test:322/feeds",
  );
  assert.equal(urls.rtsp, "rtsps://lan.example.test:322/feeds/Tali%2Fcamera");
});
