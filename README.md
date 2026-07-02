## Features

This app sends a customizable message (via modmail or private chat) automatically whenever a user is unbanned. Mods can also:
- Enable or disable the app at will without needing to uninstall it.
- Choose whether to send as the subreddit via modmail or privately from the bot account (whose inbox is NOT monitored).
- Define a blocklist of mods whose unban actions will not trigger messages.
- Define an allowlist of mods if *only* unban actions from certain mods should trigger messages.
- Optionally ignore expired temporary bans.

---

## Changelog

### [1.0.5] (2026-07-02)

- Better workaround for the previous bug fix with fewer API calls.

### [1.0.4] (2026-06-29)

#### Bug Fix

- Fixed an issue caused by a recent change in how Reddit sends mod action triggers.

### [1.0.3] (2026-06-03)

- Removed the Settings menu item at subreddit level for a cleaner menu. Settings are still accessible from developers.reddit.com.
- Updated Devvit CLI to 0.13.2.

### [1.0.2] (2026-05-18)

#### Features

- App icon now appears as app account's avatar.
- Updated description on app profile page.
- Updated Devvit CLI to 0.12.24.

### [1.0.0] (2026-01-12)

#### Features

- Added a setting to ignore expired temporary bans.
- Bumped major version.

### [0.1.1] (2025-12-24)

- Added the word "Settings" to the subreddit-level menu item.
- Bumped minor version.

### [0.0.10] (2025-12-09)

#### Features

- Added the ability to define an allowlist or blocklist of mods that determines which mods' unban actions trigger messages.
- Rewrote entire app to use Devvit Web patterns.

### [0.0.9] (2025-11-28)

#### Bug Fixes

- App is now properly logging message send failures to the console.

### [0.0.7] (2025-11-22)

#### Features

- Added a proper link to the config settings from the subreddit-level menu item.
- Bumped Devvit version to 0.12.x.

### [0.0.6] Initial version (2025-10-10)

#### Features

- Send an editable message automatically whenever a user is unbanned.
- Enable or disable the app at will without needing to uninstall it.
- Choose whether to send as the subreddit via modmail or from the bot account (whose inbox is NOT monitored).

#### Bug Fixes

None yet (initial version). Please send a private message to the developer (u/Chosen1PR) to report bugs.