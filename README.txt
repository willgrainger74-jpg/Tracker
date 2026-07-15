ACTION ARMY — MULTI-LOCATION UPDATE PACKAGE
============================================

WHAT'S IN HERE
--------------
NEW FILES:
  locations.html       - the new main landing page (4 location tiles + Location Battle + Manage panel)
  location-filter.js   - the shim: location filtering, location-specific logins, brand themes
  migrate.html         - ONE-TIME migration tool (Anywhere Rooter DB -> Colorado). DO NOT UPLOAD TO GITHUB.

UPDATED PAGES (your live pages with one script line added, nothing else changed):
  index.html, calls.html, goals.html, reports.html, manager.html, turnin.html,
  training.html, gym.html, doors.html, money.html, competition.html,
  action_workbook.html, team_workbook.html
  (inspection.html untouched - it runs on the fleet Firebase)

INSTALL
-------
1. Upload every file EXCEPT migrate.html to the action-sales repo root,
   replacing the existing pages. (Your pages were pulled live today, so
   nothing of yours is lost - each one only gained the shim line.)
2. Open migrate.html LOCALLY on your computer (double-click it).
   - Click "Dry Run" and read the report.
   - If it looks right, click "Migrate For Real" (asks for manager PIN).
   - The Anywhere Rooter database is never touched - it stays as backup.
   - Delete migrate.html when done.
3. Open locations.html in the browser -> Manage:
   - Assign your reps to Utah / Arizona (Colorado reps arrive pre-assigned).
   - Assign your existing logins to their locations under "Assign Logins".
     (Unassigned logins keep working everywhere until you assign them.)
4. Create tech logins for the Colorado reps in Manager Portal -> Tech Logins,
   then assign them to Colorado in locations.html -> Manage.
5. Tell Colorado reps to use the main tracker URL from now on.

HOW IT BEHAVES
--------------
- First visit to index.html redirects to locations.html.
- Utah / Arizona tiles -> original black & red Action tracker.
- Colorado tile -> same tracker re-skinned in Anywhere Rooter navy/blue
  (Barlow Condensed, "Anywhere Army" branding).
- Idaho tile -> American Rooter & Drain navy/flag-red skin.
- Logins are location-specific: only the selected location's logins
  (plus unassigned "shared" logins) can sign in.
- The Location Battle on the landing page ranks all four branches by
  current-month revenue, with sold / calls / close% / reviews.
