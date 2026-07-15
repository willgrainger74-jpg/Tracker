THE ACTION GROUP TRACKER  (v8)
===============================
New in v8: Action Group branding on the location hub + the whole thing
installs to a phone home screen as "Action Group" with the AG badge icon.

THE HUB (locations.html)
-------------------------
  AG badge logo, then "THE ACTION GROUP TRACKER", then "Select your
  location" over the four tiles. Neutral black & white - the branding
  only changes once you pick a location.

ADD TO HOME SCREEN
------------------
  iPhone/Safari : open the tracker -> Share -> Add to Home Screen
  Android/Chrome: open the tracker -> menu -> Install app / Add to Home screen
  It installs as "Action Group" with the AG badge, opens full screen
  (no browser bars), and long-pressing the icon gives a "Switch Location"
  shortcut on Android.

  If you already had the old Action Tracker installed, DELETE it from the
  home screen and re-add it - phones cache the old icon and name hard.
  (The service worker cache was bumped to action-group-v3 to help.)

ICONS
-----
  Every icon-*.png + favicon.ico regenerated from the AG badge:
  white badge on #080808, sized to 80% of the frame so the outer ring
  stays inside the maskable safe zone (Android crops icons to a circle
  or squircle - a full-bleed circular badge would lose its edge).
  ag-logo.png is the transparent version used in the hub hero.
  actionsite-logo.png is untouched - Utah/Arizona pages still use it.

  Replacing the logo later: drop in a new ag-logo.png and new icon-*.png
  files. Nothing else references them by anything but filename.

MANIFEST
--------
  name       : The Action Group Tracker
  short_name : Action Group
  start_url  : index.html  (returning users land in their location;
               first-timers get bounced to the hub automatically)
  scope      : ./          (relative now, so it works under any repo name,
               unlike the old hardcoded /action-sales/ paths)

INSTALL
-------
1. Upload EVERYTHING here to the repo root, replacing the old icon-*.png,
   favicon.ico, manifest.json and sw.js.
2. Hard-refresh once.
3. Delete + re-add the home screen app to pick up the new icon and name.

EVERYTHING ELSE (unchanged from v7)
------------------------------------
  Four locations: Action Utah, Action Arizona, Anywhere Rooter (Colorado),
  American Rooter & Drain (Idaho). Separate reps, logins and team goals;
  Utah/Arizona share the Action look. Location Battle on the hub.
  Manage panel: rep + login assignment, team yearly goals, the
  Anywhere Rooter -> Colorado import, and the Manus -> Arizona import
  (422 calls / $1,083,848 / 9 reps, from arizona-import.json).
  Brand engine: BRANDS config at the top of location-filter.js.
  Still shared by all four: announcements, monthlyCompetition,
  competitionMeta, competitionFeed, commissionRate, commissionTiers,
  huddleSummaries.
