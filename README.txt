THE ACTION GROUP TRAINING ACADEMY  (v14)
=========================================
New file: academy.html — a separate video-training module, nothing to do
with training.html (the Sales Academy). The hub's fifth tile now opens it.

WHAT IT DOES
------------
  Category grid   picture tiles you create, each showing its video count
  Drill in        click a category -> its videos, with a breadcrumb back
  Player          videos open in a modal player, full screen supported
  ⚙ Manage        top right. PIN-gated. Add/edit/delete categories and
                  videos, upload a picture for each tile.

  Two levels only: Category -> Videos. Add "Objection Handling",
  "New Hire Onboarding", "HVAC Technical" etc., then drop videos in.

THE MANAGE LOGIN
----------------
  The ⚙ Manage button asks for a PIN before anything becomes editable.
  It checks Firebase `academy/pin` first, and falls back to your existing
  `managerPin` if that key doesn't exist — so it works out of the box
  with the PIN you already use. Set academy/pin in Firebase if you want
  the Academy to have its own separate PIN.
  Once unlocked it stays unlocked for the session (so drilling into a
  category doesn't re-ask) and "Done" locks it again.
  Everyone else just sees the categories and videos — no edit buttons.

VIDEOS ARE LINKED, NOT UPLOADED — AND HERE'S WHY
-------------------------------------------------
  I checked before building: Firebase Storage is NOT enabled on
  action-sales-tracker (both bucket URLs return 404), and enabling it now
  requires the paid Blaze plan. Even with it, real video doesn't fit the
  pattern gym photos use — a phone clip is 50-100MB, the Realtime DB caps
  a write around 10MB, and base64 inflates it another third. So "upload
  the file into the app" isn't honestly available on this stack.

  What you do instead: upload the clip wherever you already can and paste
  the link. Handled automatically, all verified:
      YouTube   watch / youtu.be / shorts / embed / with &list= &t=
                -> thumbnail pulled in for free, no work
      Vimeo     vimeo.com/ID and player.vimeo.com links
      Loom      loom.com/share/ID
      Google Drive  file/d/ID/view  -> embedded preview
      Direct    any .mp4 / .webm / .mov URL -> native player
  YouTube unlisted is the sweet spot: free, unlimited, no bandwidth bill,
  plays on every phone, and nobody finds it without the link.

  IF YOU WANT TRUE IN-APP UPLOAD: enable Firebase Storage (Blaze plan,
  pay-as-you-go — a few dollars a month at your volume) and say the word.
  The Add Video form gets a file picker; nothing else about the page
  changes.

PICTURES
--------
  Category tile pictures ARE uploaded — images are small enough. Resized
  to 900px and JPEG-compressed in the browser before saving, exactly how
  gym.html handles photos, and stored as a data URL in the database. No
  storage bill.

DATA
----
  academy/categories/<id>  { name, desc, thumb, order, createdAt }
  academy/videos/<id>      { catId, title, desc, url, thumb, order, createdAt }
  academy/pin              optional — falls back to managerPin

ROUTING
-------
  Hub tile -> academy.html. Both academy.html and training.html are
  allowed to open WITHOUT picking a location (they're Action Group, not a
  branch), under a pseudo-location "academy" with filtering off. Neither
  reads the roster, so nothing leaks between branches.

INSTALL
-------
1. Upload everything to the repo root (academy.html included).
2. Hard-refresh (SW cache bumped to action-group-v9).
3. Open the Academy -> ⚙ Manage -> add your first category.

NOTE
----
  training.html (the Sales Academy — roleplays, AI Coach, Objection
  Builder, workbooks) is untouched and still reachable from the tab bar.
  These are two separate trainings, as you asked.
