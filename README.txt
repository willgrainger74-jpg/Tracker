ACTION ARMY — FOUR SEPARATE BRANCHES, ONE CODEBASE  (v5)
=========================================================
Your complete repo + the location system.

WHAT EACH LOCATION OWNS (fully separate)
-----------------------------------------
  Reps            salespeople filtered by locationId
  Logins          techLogins filtered by locationId (pick branch, then sign in)
  Team yearly goal   locationData/<location>/teamYearlyGoals/<year>
  Team monthly goal  computed = sum of that branch's reps' monthly goals
                     (so it scopes itself — nothing to configure)
  Everything downstream: leaderboards, Team Report, turn-in,
  workbooks, gym, doors, training — all built off the roster,
  so they scope automatically.

Utah and Arizona are as separate from each other as Colorado and Idaho
are. Same look (both use the 'action' brand), completely different data.

STILL COMPANY-WIDE (shared by all four) — say the word to split these:
  announcements, monthlyCompetition, competitionMeta, competitionFeed,
  commissionRate, commissionTiers, huddleSummaries

HOW SCOPING WORKS
-----------------
location-filter.js does two different things depending on the node:

  FILTERED  (salespeople, techLogins) - children are objects, so the
            shim hides any child whose locationId isn't yours. No
            locationId at all = shared, visible everywhere.

  REDIRECTED (teamYearlyGoals) - children are plain numbers, nothing to
            filter, so the whole path is rewritten instead:
            a page asking for  teamYearlyGoals/2026
            actually reads     locationData/utah/teamYearlyGoals/2026
            Reads AND writes follow, so reports.html's goal input saves
            to the right branch with zero page edits.

  To make another node per-location, add its name to SCOPED_PATHS at
  the top of location-filter.js. One line.

BRANDS
------
BRANDS config at the top of location-filter.js = logo, colors (dark +
light), font, wordmark swaps, hero word, chip color.
LOCATION_BRAND maps: utah/arizona -> action, colorado -> anywhere,
idaho -> american. The 'action' brand is empty on purpose = pages render
exactly as authored, so Utah and Arizona are untouched.

FILES
-----
NEW: locations.html, location-filter.js, logo-anywhere.png, logo-american.png
     migrate.html  <- ONE-TIME. DO NOT UPLOAD. Run locally, then delete.
UPDATED (one script line each): index, calls, goals, reports, manager,
     turnin, training, gym, doors, money, competition,
     action_workbook, team_workbook
UNTOUCHED: inspection.html (fleet Firebase), icons, manifest.json, sw.js,
     auth.js, checklists.js, alerts-config.js, firebase-config.js,
     favicon, actionsite-logo.png

INSTALL
-------
1. Upload everything EXCEPT migrate.html to the repo root.
2. Hard-refresh once (sw.js is network-first, but the first load after a
   deploy can serve stale cache).
3. Click each tile - all read-only, safe.
4. When ready: run migrate.html LOCALLY (Dry Run first). It imports
   Colorado's real team goal ($1,080,000 for 2026) and seeds Utah's from
   the current company-wide $18,000,000.
5. locations.html -> Manage:
   - assign reps and logins to branches
   - set the team yearly goal for Arizona and Idaho, and split Utah's
     seeded goal between Utah and Arizona
