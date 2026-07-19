THE ACTION GROUP TRACKER  (v19)  — JOB NUMBER SAVE FIX
=======================================================
Fixes "I typed the job number and it didn't save."

WHAT WAS HAPPENING
------------------
  Every Firebase write re-renders the whole call list (innerHTML).
  On truck LTE a write's confirmation can land seconds late — while
  the tech is already typing the job number. The rebuild destroys the
  input mid-entry; iOS fires no change event for a removed element, so
  the half-typed number silently vanishes and the field snaps back to
  its old value. v17 made it worse at exactly that field: setting the
  job number fired TWO writes (jobNumber, then company), doubling the
  re-renders at entry time. Reproduced in a browser test: the old
  behavior wipes a focused input to "" and drops focus.

THE FIX (calls.html)
--------------------
  1. TYPING GUARD — while a text field in the call list has focus,
     incoming re-renders are held (the latest snapshot is stashed
     instead of drawn). Checkbox taps and the ACTION/ALL PRO toggle
     never block rendering.
  2. BLUR REPLAY — when the field loses focus, the held snapshot is
     replayed (after a short beat so the field's own save goes out
     first), so the list never goes stale.
  3. ATOMIC WRITE — job number + auto-detected company now save in ONE
     update instead of two, halving re-render events at the moment of
     entry.
  Verified: a late event landing mid-typing no longer touches the
  input; the final save carries {jobNumber, company} together.

INSTALL
-------
1. Upload everything to the repo root.
2. Hard-refresh (SW cache bumped to action-group-v14). Tell the guys
   to force-close and reopen the app once so the new calls.html loads.
