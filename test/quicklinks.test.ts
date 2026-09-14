import assert from "node:assert/strict";
import test from "node:test";
import {
  buildQuicklinkExport,
  buildQuicklinkImportDeeplink,
  camerasForRootSearch,
} from "../src/quicklink-data.js";

test("exports one stable, credential-free deeplink per camera", () => {
  const quicklinks = buildQuicklinkExport(
    [
      { id: "mia_room", title: "Mia Room", producerCount: 0, consumerCount: 0 },
      {
        id: "tali_room",
        title: "Tali Room",
        producerCount: 0,
        consumerCount: 0,
      },
    ],
    (id) =>
      `raycast://extensions/rainnworks/go2rtc-cameras/open-camera?camera=${encodeURIComponent(id)}`,
  );

  assert.deepEqual(quicklinks, [
    {
      name: "Mia Room Camera",
      link: "raycast://extensions/rainnworks/go2rtc-cameras/open-camera?camera=mia_room",
      iconName: "video-16",
    },
    {
      name: "Tali Room Camera",
      link: "raycast://extensions/rainnworks/go2rtc-cameras/open-camera?camera=tali_room",
      iconName: "video-16",
    },
  ]);
  assert.equal(JSON.stringify(quicklinks).includes("secret"), false);
});

test("hides a redundant substream from Root Search by default", () => {
  const cameras = [
    { id: "mia_room", title: "Mia Room", producerCount: 0, consumerCount: 0 },
    {
      id: "mia_room_sub",
      title: "Mia Room — Substream",
      producerCount: 0,
      consumerCount: 0,
    },
    {
      id: "garage_sub",
      title: "Garage — Substream",
      producerCount: 0,
      consumerCount: 0,
    },
  ];

  assert.deepEqual(
    camerasForRootSearch(cameras).map((camera) => camera.id),
    ["mia_room", "garage_sub"],
  );
  assert.equal(camerasForRootSearch(cameras, true).length, 3);
});

test("builds Raycast's native bulk Quicklink import deeplink", () => {
  const deeplink = buildQuicklinkImportDeeplink([
    {
      name: "Mia Room Camera",
      link: "raycast://extensions/rainnworks/go2rtc-cameras/open-camera?camera=mia_room",
      iconName: "video-16",
    },
  ]);

  assert.ok(
    deeplink.startsWith(
      "raycast://extensions/raycast/quicklinks/import-quicklinks?context=",
    ),
  );
  const context = JSON.parse(decodeURIComponent(deeplink.split("context=")[1]));
  assert.deepEqual(context, [
    {
      name: "Mia Room Camera",
      link: "raycast://extensions/rainnworks/go2rtc-cameras/open-camera?camera=mia_room",
      icon: "video",
    },
  ]);
});
