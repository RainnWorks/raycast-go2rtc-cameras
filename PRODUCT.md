# Product brief

## What this is

go2rtc Cameras is a small Raycast utility that keeps every camera exposed by a go2rtc server available from Root Search. It removes the need to maintain one shortcut per camera by hand while preserving Raycast's fastest everyday interaction: type a camera name and press Return.

## Who it is for

- People who run go2rtc and use Raycast on their own computer.
- Home users with a few named cameras and enthusiasts with larger installations.
- Users who want the universally compatible browser player by default, as well as users who prefer IINA, VLC, mpv, or another media player.
- People who should not need to understand shell scripts, extension internals, or go2rtc's API to finish setup.

## Core jobs

1. Discover the current camera list from go2rtc.
2. Keep Root Search camera commands aligned with that list, including removing commands after cameras disappear.
3. Open a camera with one Return press using the user's chosen playback behavior.
4. Explain Raycast's one unavoidable Script Commands folder approval clearly and verify it through successful use.

## Product principles

- **Root Search is the product.** Browsing cameras inside the extension is a useful fallback, not the main path.
- **Browser first.** Opening the go2rtc browser player is the safe, compatible default. Preferred apps are optional and never assumed.
- **One approval, then invisible.** The Script Commands directory step is shown as guided onboarding. Once a generated camera command has successfully launched, setup recedes.
- **Say exactly where to go.** Instructions name the Extensions section of Raycast Settings, Script Commands, the `+` beside Script Folders, and the folder-picker shortcut.
- **Never pretend to know.** Raycast does not expose its registered Script Commands directories to extensions. The product describes setup as unverified until one generated camera command launches; it does not claim to inspect private settings.
- **Background work stays quiet.** Five-minute reconciliation adds, updates, and removes managed commands without notifications. Existing shortcuts remain intact if go2rtc cannot be reached.
- **Native and familiar.** Use Raycast's standard views, actions, icons, keyboard shortcuts, success states, and accessible defaults. Avoid decorative UI or invented controls.
- **Protect secrets.** Generated commands contain camera identifiers and extension deeplinks only. Server addresses and credentials are never written into them.

## Voice and personality

Calm, direct, and helpful. Prefer a short instruction such as “Open Raycast Settings → Extensions → Script Commands” over implementation terminology. Explain limitations only when they affect what the user sees. Errors should say what happened and provide the next useful action.

## Success states

- Before verification, a manual sync opens a compact setup guide and copies the exact generated-command folder path.
- Launching any generated camera command records that direct search has worked.
- After verification, manual sync reports the reconciliation result without reopening onboarding.
- Users can reopen the setup guide at any time to inspect the path or repair the binding.

## Constraints

- Raycast extension commands are static; dynamic per-camera Root Search entries require generated Script Commands.
- Raycast's public extension API cannot enumerate registered Script Command directories or delete user Quicklinks.
- A successful generated-command launch proves the directory is indexed at that moment. It cannot guarantee the user will not later remove the directory, so the guide remains manually available.
- The extension should remain useful when the go2rtc server is local, remote, behind a base path, or protected by HTTP Basic Auth.

## Anti-references

- No multi-screen wizard for a single folder approval.
- No repeated background notifications.
- No Finder window presented without a plain-language explanation of why it opened.
- No vague “add the scripts” language or instructions that assume the user knows which folder picker location is correct.
- No claim that setup is verified merely because files were generated.
