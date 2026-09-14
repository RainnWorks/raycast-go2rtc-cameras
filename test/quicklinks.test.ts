import assert from "node:assert/strict";
import test from "node:test";
import { buildQuicklinkExport } from "../src/quicklink-data.js";

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
      name: "Mia Room",
      link: "raycast://extensions/rainnworks/go2rtc-cameras/open-camera?camera=mia_room",
    },
    {
      name: "Tali Room",
      link: "raycast://extensions/rainnworks/go2rtc-cameras/open-camera?camera=tali_room",
    },
  ]);
  assert.equal(JSON.stringify(quicklinks).includes("secret"), false);
});
