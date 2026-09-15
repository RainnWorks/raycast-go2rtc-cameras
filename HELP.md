# go2rtc Cameras Help

## Put Cameras in Root Search

1. Run **Sync Camera Shortcuts**. It creates one managed command per camera, copies the folder path, and opens the setup guide while direct search is unverified.
2. Open Raycast Settings with `⌘,`. In the **Extensions** section choose **Script Commands**.
3. Press **+** beside **Script Folders**.
4. In the folder picker, press `⌘⇧G`, paste the copied path, press Return, and select the exact `root-search-commands` folder—not Downloads or its parent.
5. Search for one of your cameras in Raycast and open it. The extension records that successful generated-command launch as verification.

This is a one-time approval. Afterwards, the extension checks go2rtc every five minutes. New cameras appear in Root Search and commands for removed cameras disappear automatically after the next successful sync.

If cameras do not appear, run **Set Up Cameras in Root Search**. It repeats the exact Settings route, lets you copy or reveal the folder, and shows the last time direct camera search was verified.

Raycast does not let extensions read the Script Folders list directly. This means the extension can verify a successful generated command, but it cannot detect immediately if you later remove that folder in Settings.

## Choose How Cameras Open

The default action opens go2rtc's browser player. In the extension settings, choose **Open Stream in Preferred App** and select IINA, VLC, mpv, or another media player if preferred.

HTTP MP4 is the most compatible app format. HLS can add latency. RTSP usually has the lowest latency but requires the go2rtc RTSP port (normally 8554) to be reachable.

## Safety

Generated commands contain only the camera name and an extension deeplink. The go2rtc address and credentials are not written into the Script Command files.
