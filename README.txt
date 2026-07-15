ACTION ARMY — MULTI-LOCATION  (v6)
===================================
Your complete repo + the location system. No migrate.html anymore —
the Anywhere Rooter import is built into locations.html now, so you
run it from the tracker URL on any device (phone included).

INSTALL
-------
1. Upload EVERYTHING in here to the repo root.
2. Hard-refresh once (sw.js is network-first, but the first load after
   a deploy can serve stale cache).
3. Open locations.html -> the four tiles.

PORTING ANYWHERE ROOTER OVER
-----------------------------
locations.html -> "Manage Locations & Rep Assignments" ->
  "Import Anywhere Rooter -> Colorado"
    1. Click "Dry Run (read-only)" - shows exactly what will copy.
    2. Click "Import For Real" - asks for your manager PIN.

  What it copies (verified live, zero collisions):
    13 reps (stamped locationId "colorado")
    570 call-log day-nodes
    21 monthly + 14 weekly + 8 yearly personal goals
    their team yearly goal -> locationData/colorado/teamYearlyGoals ($1,080,000 for 2026)
    seeds locationData/utah/teamYearlyGoals from the old company-wide $18,000,000
  628 paths total, written in 5 batches.

  The Anywhere Rooter database is NEVER modified - it stays as your
  backup and their old tracker keeps working. Nothing already in your
  database is overwritten. Safe to re-run: it skips anything already there.

AFTER THE IMPORT
----------------
  - Manager Portal -> Tech Logins: create logins for the Colorado reps,
    then assign them to Colorado in locations.html -> Manage.
  - locations.html -> Manage -> Team Yearly Goals: split Utah's seeded
    $18,000,000 between Utah and Arizona, and set Idaho's.
  - Assign your existing reps and logins to Utah / Arizona.
    (Unassigned = shared = works everywhere, so nobody gets locked out
    mid-rollout.)

WHAT EACH LOCATION OWNS
------------------------
  Reps, logins, team yearly goal - all per-location.
  Team monthly goal computes itself (sum of that branch's reps' goals).
  Leaderboards, Team Report, turn-in, workbooks, gym, doors, training
  all build off the roster, so they scope automatically.
  Utah and Arizona are as separate as Colorado and Idaho - same look,
  different data.

  Still shared by all four: announcements, monthlyCompetition,
  competitionMeta, competitionFeed, commissionRate, commissionTiers,
  huddleSummaries. (Add a node to SCOPED_PATHS in location-filter.js
  to make it per-location - one line.)

BRANDS
------
  BRANDS config at the top of location-filter.js = logo, colors, font,
  wordmarks, hero word, chip. LOCATION_BRAND maps utah/arizona -> action,
  colorado -> anywhere, idaho -> american. The 'action' brand is empty on
  purpose, so Utah and Arizona render exactly as authored.

FILES
-----
NEW: locations.html, location-filter.js, logo-anywhere.png, logo-american.png
UPDATED (one script line each): index, calls, goals, reports, manager,
  turnin, training, gym, doors, money, competition, action_workbook,
  team_workbook
UNTOUCHED: inspection.html (fleet Firebase), icons, manifest.json, sw.js,
  auth.js, checklists.js, alerts-config.js, firebase-config.js, favicon,
  actionsite-logo.png
