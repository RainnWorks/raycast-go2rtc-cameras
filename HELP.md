# go2rtc Cameras Help

## Put Cameras in Root Search

1. Run **Sync Camera Shortcuts**. It creates one managed command per camera, opens their folder in Finder, and copies the folder path.
2. Open Raycast Settings → Script Commands and choose **Add Script Directory**.
3. In the folder picker, press `⌘⇧G`, paste the copied path, press Return, and select that exact folder.

This is a one-time approval. Afterwards, the extension checks go2rtc every five minutes. New cameras appear in Root Search and commands for removed cameras disappear automatically after the next successful sync.

If cameras do not appear, check the Script Commands settings and make sure the listed folder is the copied `root-search-commands` folder rather than Downloads or its parent.

## Choose How Cameras Open

The default action opens go2rtc's browser player. In the extension settings, choose **Open Stream in Preferred App** and select IINA, VLC, mpv, or another media player if preferred.

HTTP MP4 is the most compatible app format. HLS can add latency. RTSP usually has the lowest latency but requires the go2rtc RTSP port (normally 8554) to be reachable.

## Safety

Generated commands contain only the camera name and an extension deeplink. The go2rtc address and credentials are not written into the Script Command files.
