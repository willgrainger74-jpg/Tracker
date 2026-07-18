THE ACTION GROUP TRACKER  (v17)
================================
Two things: the Action/All Pro history is now backfilled, and job
numbers set the company automatically from here on.

1. THE BACKFILL — ALREADY DONE, LIVE IN THE DATABASE
-----------------------------------------------------
  Nothing to run. Every Utah call in history was scanned by job number.
  The stated rule was "60 = All Pro, 24 = Action", but the data showed
  those are just the NEWEST series of each: older Action jobs start
  20/21/22/23 (9 digits), older All Pro jobs start 58/59 (8 digits),
  and 55 calls literally had "All pro" typed as the job number. So the
  real rule applied was:
      8 digits starting 58/59/60, or "all pro" text  ->  All Pro
      everything else                                 ->  Action
  Result, verified live: 193 All Pro calls / 150 sold / $733,344.
  Manually-flipped toggles were respected; only untagged calls and
  v15's automatic defaults were changed. My Report and Team Report
  splits now include the full history.

2. JOB NUMBERS NOW DRIVE THE TOGGLE (calls.html)
-------------------------------------------------
  Typing a job number sets ACTION/ALL PRO automatically:
      58/59/60xxxxxx (8 digits) or "all pro"  -> ALL PRO
      2xxxxxxxx (9 digits)                    -> ACTION
      anything else (blank, partial, names)   -> no change
  A manual tap on the toggle still wins afterward — the auto-set only
  fires when the job number itself changes. If All Pro's numbers ever
  roll into a 61* series, add it to the regex in jobNumberChanged().

3. CNAME FILE (new, do not delete)
-----------------------------------
  The repo root now contains a file named CNAME with
  "actiongrouptracker.net" — GitHub Pages requires it for the custom
  domain. It's baked into this and every future package, so uploading
  a full zip can't knock the domain offline.

INSTALL
-------
1. Upload everything to the repo root.
2. Hard-refresh (SW cache bumped to action-group-v12).
