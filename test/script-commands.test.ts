import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {
  camerasForRootSearch,
  rootSearchName,
} from "../src/camera-shortcuts.js";
import {
  renderCameraScript,
  syncCameraScripts,
} from "../src/script-commands.js";
import type { Camera } from "../src/types.js";

const camera = (id: string, title: string): Camera => ({
  id,
  title,
  producerCount: 0,
  consumerCount: 0,
});

test("hides a redundant substream from Root Search by default", () => {
  const cameras = [
    camera("mia_room", "Mia Room"),
    camera("mia_room_sub", "Mia Room — Substream"),
    camera("garage_sub", "Garage — Substream"),
  ];

  assert.deepEqual(
    camerasForRootSearch(cameras).map(({ id }) => id),
    ["mia_room", "garage_sub"],
  );
  assert.equal(camerasForRootSearch(cameras, true).length, 3);
  assert.equal(rootSearchName(cameras[0]), "Mia Room Camera");
});

test("renders macOS and Windows camera commands", () => {
  const deeplink = "raycast://extensions/example/cameras/open?camera=mia_room";
  const macOS = renderCameraScript(
    camera("mia_room", "Mia Room"),
    deeplink,
    "macOS",
  );
  const windows = renderCameraScript(
    camera("mia_room", "Mia Room"),
    deeplink,
    "Windows",
  );

  assert.match(macOS, /^#!\/bin\/bash/);
  assert.match(
    macOS,
    /# Required parameters:\n# @raycast\.schemaVersion 1\n# @raycast\.title Mia Room Camera\n# @raycast\.mode silent/,
  );
  assert.match(macOS, /# Optional parameters:\n# @raycast\.icon 🎥/);
  assert.match(macOS, /@raycast.title Mia Room Camera/);
  assert.match(macOS, /open 'raycast:\/\//);
  assert.match(windows, /Start-Process 'raycast:\/\//);
  assert.doesNotMatch(macOS, /cameras\.example\.test/);
});

test("adds current cameras, removes stale managed commands, and preserves other files", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "go2rtc-commands-"));
  try {
    await writeFile(
      path.join(directory, "go2rtc-camera-stale.sh"),
      "# go2rtc-camera-command: managed\n",
    );
    await writeFile(
      path.join(directory, "go2rtc-camera-personal.sh"),
      "#!/bin/bash\necho personal\n",
    );
    await writeFile(path.join(directory, "unrelated.sh"), "#!/bin/bash\n");

    const result = await syncCameraScripts(
      directory,
      [camera("mia_room", "Mia Room"), camera("tali_room", "Tali Room")],
      (id) => `raycast://camera/${encodeURIComponent(id)}`,
      "macOS",
    );

    assert.equal(result.added, 2);
    assert.equal(result.removed, 1);
    assert.equal(result.filePaths.length, 2);
    assert.match(
      await readFile(result.filePaths[0], "utf8"),
      /@raycast\.schemaVersion 1/,
    );
    assert.equal(
      await readFile(path.join(directory, "go2rtc-camera-personal.sh"), "utf8"),
      "#!/bin/bash\necho personal\n",
    );

    const unchanged = await syncCameraScripts(
      directory,
      [camera("mia_room", "Mia Room"), camera("tali_room", "Tali Room")],
      (id) => `raycast://camera/${encodeURIComponent(id)}`,
      "macOS",
    );
    assert.equal(unchanged.unchanged, 2);
    assert.equal(unchanged.added, 0);
    assert.equal(unchanged.removed, 0);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
