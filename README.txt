ACTION ARMY — MULTI-LOCATION  (v7)
===================================
New in v7: the Arizona data from the Manus "Action Hub" app is scraped,
remapped to this tracker's schema, and importable from locations.html.

IMPORTING ARIZONA (from Manus)
-------------------------------
locations.html -> Manage -> "Import Manus Hub -> Arizona"
  Dry Run (read-only) -> Import For Real (manager PIN).

  Snapshot contents (verified against live Manus data):
    422 calls, 2026-03-12 -> 2026-07-08
    $1,083,848 in sales
    9 reps: Theron Leany, Danny Condon, Joe Jordan, Steve Lauaki,
            Ben Jordan, Austin Avellar, House Account (AZ),
            + 2 deleted techs (imported archived, revenue still counts)
    personal weekly/monthly/yearly goals for the 6 active techs
    team yearly goal 2026: $8,000,000
  449 paths, 3 batches.

  WHY A SNAPSHOT FILE? The Manus API sends no CORS headers, so a browser
  on github.io can't read it directly. The data was pulled server-side
  and pre-mapped into arizona-import.json. It is a point-in-time copy
  (pulled 2026-07-15). If Arizona keeps logging in Manus after that,
  the newer calls won't be in this file - ask for a fresh pull.

  The Manus app is never modified. Re-running skips anything already
  imported. Call IDs are the Manus IDs, so no duplicates.

FIELD MAPPING NOTES (Manus -> Action)
--------------------------------------
  saleAmount/paymentAmount/estimateAmount were in CENTS -> divided by 100
  tech goals were already in DOLLARS -> copied as-is
  outcome sold/estimate/open/cancelled -> jobSold / leftEstimate / jobCancelled
  trades[] -> tradeHVAC / tradePlumbing / tradeElectrical / tradeCameras
  createdAt (UTC) -> timeOfDay converted to Arizona time (MST, UTC-7)
  each call carries importedFrom:"manus" so imports are traceable
  NOT imported: door knocks (Manus stores aggregate counts, this tracker
    stores per-address canvassing records - the shapes don't map),
    notes, optionsPresented, estimatesWritten, ServiceTitan checkboxes
    (no equivalent fields here)
  moneyOwed set to 0 rather than inferred from payments

IMPORTING ANYWHERE ROOTER -> COLORADO
--------------------------------------
locations.html -> Manage -> "Import Anywhere Rooter -> Colorado"
  (Already done - 13 Colorado reps are in the roster.)

INSTALL
-------
1. Upload EVERYTHING in here to the repo root (arizona-import.json
   included - the importer fetches it from there).
2. Hard-refresh once.
3. locations.html -> Manage -> run the Arizona import.
4. Create logins for the Arizona reps (Manager Portal -> Tech Logins),
   assign them to Arizona, and set Arizona's team yearly goal if you
   want something other than the imported $8,000,000.

WHAT EACH LOCATION OWNS
------------------------
  Reps, logins, team yearly goal - per-location.
  Team monthly goal computes itself from that branch's reps' goals.
  Utah and Arizona are as separate as Colorado and Idaho - same look,
  different data.
  Still shared by all four: announcements, monthlyCompetition,
  competitionMeta, competitionFeed, commissionRate, commissionTiers,
  huddleSummaries. (Add to SCOPED_PATHS in location-filter.js - one line.)

BRANDS
------
  BRANDS config at the top of location-filter.js = logo, colors, font,
  wordmarks, hero word, chip. LOCATION_BRAND maps utah/arizona -> action,
  colorado -> anywhere, idaho -> american.
