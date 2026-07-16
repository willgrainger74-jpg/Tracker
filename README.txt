THE ACTION GROUP TRACKER  (v9)
===============================
Fixes the two home-screen problems.

1. TOP BUTTONS UNDER THE iPHONE STATUS BAR — FIXED
---------------------------------------------------
  Cause: the pages use viewport-fit=cover with a black-translucent
  status bar, so once installed the web view runs edge to edge, right up
  under the notch. The BOTTOM was already handled (the tab bar pads with
  safe-area-inset-bottom) but the TOP never was. The theme toggle sits at
  a fixed top:12px, which lands under the status bar and can't be tapped.
  Worse: the location chip was also fixed top-right, so the two were
  stacked on each other.

  Fix (all from location-filter.js, no page edits):
    body            padding-top: env(safe-area-inset-top)
                    -> pushes normal content below the status bar
    #themeToggleWrap top: calc(12px + env(safe-area-inset-top))
                    -> it's position:fixed, so body padding can't move it
    the location chip is now injected INSIDE #themeToggleWrap, which is a
    row-reverse flex row -> chip and theme button sit side by side instead
    of on top of each other, and the chip inherits the inset for free.
  All of these are 0px in a normal browser and on non-notch devices, so
  nothing changes on desktop or Android.
  locations.html got the same treatment in its own CSS.

2. ALWAYS OPEN TO THE LOCATION PICKER — FIXED
----------------------------------------------
  The chosen location now lives in sessionStorage instead of localStorage.
  sessionStorage is wiped when the app or tab closes, so:
    - every launch / every fresh open of the link -> the hub
    - moving between pages inside the app -> keeps your location, never
      re-asks
  Any page opened without a location (deep link, bookmark, old shortcut)
  bounces to the hub too, not just index.html.
  manifest start_url is now locations.html, so the installed app opens
  straight at the hub with no redirect flash.

  Bonus fix: switching to a DIFFERENT branch now clears the login session
  (ap_session + selectedPerson). Logins are location-specific, so a Utah
  session had no business carrying into Colorado. Picking the SAME branch
  you used last keeps you signed in.

INSTALL
-------
1. Upload everything to the repo root.
2. Hard-refresh (SW cache bumped to action-group-v4).
3. On the phone: delete the home-screen app and re-add it. The old install
   has the old start_url and icon baked in.

EVERYTHING ELSE (unchanged from v8)
------------------------------------
  Action Group branding + AG badge icon, four locations with separate
  reps/logins/team goals, brand skins per location, Location Battle,
  Manage panel (assignments, team goals, Anywhere->Colorado import,
  Manus->Arizona import).
