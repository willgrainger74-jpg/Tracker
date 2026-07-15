ACTION ARMY — MULTI-LOCATION UPDATE (v3, complete repo)
========================================================

This is your COMPLETE repo (from the zip you sent) with the location
system added. Nothing is missing this time — icons, manifest.json,
sw.js, auth.js, checklists.js, alerts-config.js, firebase-config.js,
favicon and logo are all here, untouched.

FIXED IN THIS VERSION
---------------------
The brand themes now actually apply. The bug: the shim injected its
palette BEFORE each page's own <style> block, so the page's :root
(Action red) overrode it via the cascade. Now the theme uses
html:root selectors AND gets pinned last in the <head>. Verified:
Colorado loads Anywhere Rooter blue, Idaho loads American Rooter navy.

FILES
-----
NEW:
  locations.html       main landing page (4 tiles + Location Battle + Manage)
  location-filter.js   the shim: filtering, location-specific logins, themes
  migrate.html         ONE-TIME Anywhere Rooter -> Colorado migration.
                       DO NOT UPLOAD THIS ONE. Run it locally, then delete.

UPDATED (one script line added, nothing else changed):
  index, calls, goals, reports, manager, turnin, training, gym,
  doors, money, competition, action_workbook, team_workbook

UNTOUCHED:
  inspection.html (runs on the action-fleet Firebase)
  everything else (icons, manifest, sw.js, js files, images)

INSTALL
-------
1. Upload everything EXCEPT migrate.html to the repo root.
2. Hard-refresh once (Ctrl+Shift+R / pull down on mobile). sw.js is
   network-first so it updates on its own, but the first load after a
   deploy can serve the old cache.
3. Test the tiles: Utah/Arizona = black & red, Colorado = blue,
   Idaho = navy/red. Read-only, safe to click around.
4. When ready: run migrate.html LOCALLY (Dry Run first), then assign
   reps and logins in locations.html -> Manage.

NOTE ON manifest.json
---------------------
start_url and scope are "/action-sales/...". If you test on a repo with
a different name, the PWA install will misbehave there. That's expected
and does not affect the real repo.
