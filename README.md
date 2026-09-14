# go2rtc Cameras for Raycast

Open every camera published by a [go2rtc](https://github.com/AlexxIT/go2rtc) server without manually maintaining a list.

The extension discovers streams from go2rtc's read-only `/api/streams` endpoint. Pressing Return opens go2rtc's own player in the default browser. If you prefer a desktop player, choose IINA, VLC, mpv, or another app in the extension preferences and optionally make it the default action.

## Why the extension uses a camera list

Raycast extension commands are declared statically. A Store extension cannot silently add or remove root-search commands as cameras change. This extension uses the public Raycast APIs instead:

- **Browse Cameras** is always live and automatically reflects the current go2rtc stream list.
- **Create Camera Quicklink** opens Raycast's pre-filled Quicklink editor for one camera.
- **Export Camera Quicklinks** generates one importable Quicklink per camera in a single batch.

The generated Quicklinks point back to the **Open Camera** command rather than containing your server address or credentials. Changing your go2rtc address, preferred app, or stream format therefore updates the behavior of every imported Quicklink.

## Setup

1. Enter the address of the go2rtc WebUI, such as `http://192.168.1.10:1984`.
2. Add the optional WebUI username and password if HTTP Basic Auth is enabled.
3. Run **Browse Cameras**.

You can paste a root address, a go2rtc base path such as `https://example.test/rtc`, or a full `stream.html`/`api/streams` link. Credentials embedded in URLs are intentionally rejected; use the dedicated password preference instead.

## Opening cameras

The default is **Open go2rtc Player in Browser** because it is compatible with every go2rtc codec and needs no media-player setup.

For IINA or another player:

1. Pick the app under **Preferred App**.
2. Choose a player stream format:
   - **HTTP MP4** is the most convenient through reverse proxies and is the default.
   - **HLS** is broadly supported but can add latency.
   - **RTSP** usually has the lowest latency, but go2rtc's RTSP port (normally `8554`) must be reachable.
3. Optionally change **Default Action** to **Open Stream in Preferred App**.

If the go2rtc WebUI uses HTTP Basic Auth, leave **Pass Login to Player** off unless the selected app cannot prompt for the login. Enabling it embeds the login only in the runtime HTTP media URL; media apps may retain opened URLs in their history or logs. Exported Quicklinks and copied links remain credential-free.

The action panel always keeps **Open in Browser**, **Open in Preferred App**, **Open Stream With…**, and copyable MP4/HLS/RTSP links available. IINA is launched through Raycast's normal application-opening API; the extension does not use IINA's custom URL scheme.

## Importing all camera Quicklinks

Run **Export Camera Quicklinks**. The extension reveals `go2rtc-camera-quicklinks.json` in Finder (or opens its folder on Windows). Then run Raycast's built-in **Import Quicklinks** command and select that file.

Raycast skips matching duplicates during later imports. Removed cameras are not deleted automatically, because the public extension API does not permit extensions to edit a user's Quicklink library without confirmation.

## Security notes

- Camera credentials are never written into exported Quicklinks.
- The password preference is handled by Raycast's secure preference storage.
- Only `/api/streams` is requested for discovery; the extension never requests go2rtc's configuration endpoint. Some go2rtc setups include upstream URLs in the streams response, so the raw response is parsed in memory, reduced immediately to names and connection counts, and never logged or cached.
- Avoid exposing a default go2rtc installation directly to the internet. Put remote access behind authentication and TLS or a trusted private network.

## Development

```sh
npm install
npm test
npm run typecheck
npm run lint
npm run build
```

Use `npm run dev` to load the local extension into Raycast.
