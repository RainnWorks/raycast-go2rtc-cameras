# go2rtc Cameras for Raycast

Put every camera published by a [go2rtc](https://github.com/AlexxIT/go2rtc) server directly in Raycast Root Search without manually maintaining a list.

The extension discovers streams from go2rtc's read-only `/api/streams` endpoint. Run **Add Cameras to Root Search** once, approve Raycast's native import screen, and every camera becomes a top-level result. From then on the everyday flow is simply: open Raycast, type a camera name, and press Return.

## Root Search shortcuts

Raycast extension commands are declared statically, so discovered cameras cannot themselves become dynamic extension commands. The extension generates native Raycast Quicklinks instead; Quicklinks are searchable directly in Root Search.

- **Add Cameras to Root Search** discovers the cameras and opens Raycast's native bulk-import confirmation directly—there is no file to find or separate Import command to run.
- **Browse Cameras** remains available as a live view and always reflects the current go2rtc stream list.
- **Create Camera Quicklink** can add just one camera from the Browse view.

The generated Quicklinks point back to the **Open Camera** command rather than containing your server address or credentials. Changing your go2rtc address, preferred app, or stream format therefore updates the behavior of every imported Quicklink.

## Setup

1. Enter the address of the go2rtc WebUI, such as `http://192.168.1.10:1984`.
2. Add the optional WebUI username and password if HTTP Basic Auth is enabled.
3. Run **Add Cameras to Root Search** and approve the list Raycast shows.
4. Type a camera name directly into Root Search and press Return.

Matching `_sub` streams are omitted from Root Search by default so each physical camera appears once. Enable **Include Substreams** if you want both entries. Run **Add Cameras to Root Search** again after adding cameras to go2rtc; Raycast skips existing Quicklinks.

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

Raycast requires confirmation before an extension adds Quicklinks. That one-time import screen is the only extra step; normal camera searches open with one Return. Removed cameras are not deleted automatically, because extensions cannot silently edit a user's Quicklink library.

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
