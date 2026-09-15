# go2rtc Cameras for Raycast

Put every camera published by a [go2rtc](https://github.com/AlexxIT/go2rtc) server directly in Raycast Root Search without manually maintaining a list.

The extension discovers streams from go2rtc's read-only `/api/streams` endpoint and maintains one Raycast Script Command per camera. From then on the everyday flow is simply: open Raycast, type a camera name, and press Return.

## Root Search shortcuts

Raycast extension commands are declared statically, and the public extension API cannot delete a user's Quicklinks. To keep Root Search exactly aligned with go2rtc, this extension maintains a dedicated folder of Raycast Script Commands instead.

- **Sync Camera Shortcuts** reconciles the folder immediately and also runs in the background every five minutes.
- Cameras added to go2rtc get new Root Search commands.
- Cameras removed from go2rtc have their managed commands deleted automatically after the next successful sync.
- **Browse Cameras** remains available as a live view.

The generated commands point back to the extension's **Open Camera** command. They contain only a camera identifier and an extension deeplink—never the server address or credentials. Changing the preferred app or stream format updates every camera command together.

## Setup

1. Enter the address of the go2rtc WebUI, such as `http://192.168.1.10:1984`.
2. Add the optional WebUI username and password if HTTP Basic Auth is enabled.
3. Run **Sync Camera Shortcuts**. The extension generates the commands, copies their dedicated folder path, and opens a setup guide until direct search has been verified.
4. Once only, open Raycast Settings with `⌘,`. In the **Extensions** section choose **Script Commands**, then press **+** beside **Script Folders**. In the folder picker, press `⌘⇧G`, paste the copied path, press Return, then select that exact `root-search-commands` folder. Do not select Downloads or its parent.
5. Type a camera name directly into Root Search and press Return. That successful launch verifies setup automatically, so subsequent manual syncs stay out of your way.

Raycast watches the folder for changes, so there is no import step after the one-time folder approval. Matching `_sub` streams are omitted by default so each physical camera appears once. Enable **Include Substreams** if you want both entries.

Raycast does not expose the Script Folders list through its extension API. The extension therefore distinguishes **generated** from **verified**: syncing proves the camera command files are correct, while successfully launching any generated camera command proves Raycast has indexed their folder. If the folder is later removed from Raycast Settings, use **Set Up Cameras in Root Search** to add it again.

Sync is conservative: if go2rtc is unreachable or returns an error, existing commands are left untouched. A successful empty stream list removes every managed camera command. Files not marked as managed by this extension are never deleted.

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

If the go2rtc WebUI uses HTTP Basic Auth, leave **Pass Login to Player** off unless the selected app cannot prompt for the login. Enabling it embeds the login only in the runtime HTTP media URL; media apps may retain opened URLs in their history or logs. Generated camera commands and copied links remain credential-free.

The action panel always keeps **Open in Browser**, **Open in Preferred App**, **Open Stream With…**, and copyable MP4/HLS/RTSP links available. IINA is launched through Raycast's normal application-opening API; the extension does not use IINA's custom URL scheme.

## Security notes

- Camera credentials and the go2rtc address are never written into generated Script Commands.
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
