/* ═══════════════════════════════════════════════════════════════
   ACTION ARMY — LOCATION FILTER + BRAND THEME SHIM (v3)
   Include on every tracker page, AFTER the two Firebase SDK
   <script> tags and BEFORE firebase.initializeApp / page scripts:

       <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-database-compat.js"></script>
       <script src="location-filter.js"></script>

   1. First visit → redirects index.html to locations.html.
   2. Filters `salespeople` AND `techLogins` reads to the selected
      location — so logins are location-specific: pick a branch,
      then only that branch's logins work. Reps/logins with no
      locationId are shared → valid everywhere.
   3. Brand themes:
        utah / arizona → original Action black & red (untouched)
        colorado       → Anywhere Rooter navy/blue + Barlow Condensed
        idaho          → American Rooter & Drain navy/flag-red
   4. Injects a brand-colored location switcher chip.
   ═══════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    var path = (location.pathname || '').toLowerCase();
    if (path.indexOf('locations.html') !== -1) return;
    if (path.indexOf('migrate.html') !== -1) return;
    if (path.indexOf('inspection.html') !== -1) return; // fleet project

    // ── 1. current location ──────────────────────────────────────
    var loc = null;
    try { loc = JSON.parse(localStorage.getItem('apLocation')); } catch (e) { loc = null; }

    if (!loc || !loc.id) {
        if (path.indexOf('index.html') !== -1 || /\/$/.test(path)) {
            location.replace('locations.html');
            return;
        }
        loc = { id: 'all', name: 'All Locations', brand: 'action' };
    }

    var LOC_ID = loc.id;
    var BRAND = loc.brand ||
        (LOC_ID === 'idaho' ? 'american' : LOC_ID === 'colorado' ? 'anywhere' : 'action');
    var FILTER_ON = LOC_ID !== 'all';

    // ── 2. brand themes ──────────────────────────────────────────
    var THEMES = {
        // American Rooter & Drain (idahosplumber.com): navy #0a3161, red #b71e29
        american: {
            css: ':root{--red:#b71e29;--red2:#8f1720;--red3:#12233f;' +
                 '--gold:#5b8fd6;--gold2:#3d6bb0;' +
                 '--bg:#060d1a;--s1:#0c1830;--s2:#112040;--s3:#182b52;--s4:#1f3765;' +
                 '--wire:rgba(210,225,255,0.10);--wire2:rgba(210,225,255,0.17);' +
                 '--muted:#8ea3c4;--faint:#42557a;--text:#f2f6ff;}' +
                 'html.light{--red:#b71e29;--red2:#8f1720;--red3:#e8eef8;' +
                 '--gold:#3d6bb0;--gold2:#2c5290;' +
                 '--bg:#f2f5fa;--s1:#ffffff;--s2:#e8edf5;--s3:#dde5f0;--s4:#d0dbec;' +
                 '--wire:rgba(10,49,97,0.10);--wire2:rgba(10,49,97,0.18);' +
                 '--muted:#4a5f80;--faint:#93a5c0;--text:#0a1a33;}',
            swaps: [
                ['ACTION ARMY', 'AMERICAN ROOTER'],
                ['Action Army', 'American Rooter'],
                ['ACTION PLUMBING, HEATING, AIR & ELECTRIC', 'AMERICAN ROOTER & DRAIN'],
                ['Action Plumbing, Heating, Air & Electric', 'American Rooter & Drain'],
                ['ACTION PLUMBING', 'AMERICAN ROOTER & DRAIN'],
                ['Action Plumbing', 'American Rooter & Drain']
            ],
            font: null
        },
        // Anywhere Rooter (anywhererooter.com build): navy + #2575fc, Barlow Condensed
        anywhere: {
            css: ':root{--red:#2575fc;--red2:#173997;--red3:#0b1c4d;' +
                 '--gold:#0AA2FF;--gold2:#067ec7;' +
                 '--bg:#0a102a;--s1:#101a3d;--s2:#14224c;--s3:#1b2b5e;--s4:#24356e;' +
                 '--wire:rgba(190,210,255,0.10);--wire2:rgba(190,210,255,0.17);' +
                 '--muted:#a9b6dd;--faint:#5b6a99;--text:#f0f4ff;}' +
                 'html.light{--red:#2575fc;--red2:#173997;--red3:#dbe6ff;' +
                 '--gold:#067ec7;--gold2:#056aa8;' +
                 '--bg:#eff3ff;--s1:#ffffff;--s2:#e4ebfa;--s3:#d8e2f5;--s4:#c9d7f0;' +
                 '--wire:rgba(23,57,151,0.10);--wire2:rgba(23,57,151,0.18);' +
                 '--muted:#44598f;--faint:#93a5c9;--text:#0b1c4d;}',
            swaps: [
                ['ACTION ARMY', 'ANYWHERE ARMY'],
                ['Action Army', 'Anywhere Army'],
                ['ACTION PLUMBING, HEATING, AIR & ELECTRIC', 'ANYWHERE ROOTER'],
                ['Action Plumbing, Heating, Air & Electric', 'Anywhere Rooter'],
                ['ACTION PLUMBING', 'ANYWHERE ROOTER'],
                ['Action Plumbing', 'Anywhere Rooter']
            ],
            font: { from: 'Bebas Neue', to: 'Barlow Condensed',
                    link: 'https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&display=swap' }
        }
    };

    var theme = THEMES[BRAND];
    if (theme) {
        // palette — inject immediately so there's no flash of red
        var css = document.createElement('style');
        css.id = 'ap-brand-theme';
        css.textContent = theme.css;
        (document.head || document.documentElement).appendChild(css);

        // font swap (Anywhere): load the brand font, then rewrite
        // same-origin stylesheet rules + inline styles that use the old one
        if (theme.font) {
            var lnk = document.createElement('link');
            lnk.rel = 'stylesheet';
            lnk.href = theme.font.link;
            (document.head || document.documentElement).appendChild(lnk);
        }
        function swapFonts() {
            if (!theme.font) return;
            try {
                for (var s = 0; s < document.styleSheets.length; s++) {
                    var sheet = document.styleSheets[s], rules;
                    try { rules = sheet.cssRules; } catch (e) { continue; } // cross-origin
                    if (!rules) continue;
                    for (var i = 0; i < rules.length; i++) {
                        var st = rules[i].style;
                        if (st && st.fontFamily && st.fontFamily.indexOf(theme.font.from) !== -1) {
                            st.fontFamily = st.fontFamily.split(theme.font.from).join(theme.font.to);
                        }
                    }
                }
            } catch (e) { /* cosmetic only */ }
        }
        function swapInlineFonts(root) {
            if (!theme.font || !root || !root.querySelectorAll) return;
            try {
                var els = root.querySelectorAll('[style*="' + theme.font.from + '"]');
                for (var i = 0; i < els.length; i++) {
                    els[i].style.fontFamily = els[i].style.fontFamily.split(theme.font.from).join(theme.font.to);
                }
            } catch (e) { }
        }

        // brand text swaps (exact strings only — metric names like
        // "Action Stats" / "Action Thermostat" are left alone)
        function swapText(root) {
            try {
                if (!root || (root.nodeType !== 1 && root.nodeType !== 9)) return;
                var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
                var n;
                while ((n = walker.nextNode())) {
                    var v = n.nodeValue;
                    if (!v || (v.indexOf('Action') === -1 && v.indexOf('ACTION') === -1)) continue;
                    for (var i = 0; i < theme.swaps.length; i++) {
                        if (v.indexOf(theme.swaps[i][0]) !== -1) v = v.split(theme.swaps[i][0]).join(theme.swaps[i][1]);
                    }
                    if (v !== n.nodeValue) n.nodeValue = v;
                }
            } catch (e) { /* never break the page over branding */ }
        }
        document.addEventListener('DOMContentLoaded', function () {
            if (document.title) {
                for (var i = 0; i < theme.swaps.length; i++) {
                    document.title = document.title.split(theme.swaps[i][0]).join(theme.swaps[i][1]);
                }
            }
            swapFonts();
            if (document.body) { swapText(document.body); swapInlineFonts(document.body); }
            // catch late-rendered content (login overlay, Firebase renders)
            if (window.MutationObserver && document.body) {
                var mo = new MutationObserver(function (muts) {
                    for (var i = 0; i < muts.length; i++) {
                        var added = muts[i].addedNodes;
                        for (var j = 0; j < added.length; j++) {
                            if (added[j].nodeType === 1) { swapText(added[j]); swapInlineFonts(added[j]); }
                            else if (added[j].nodeType === 3 && added[j].parentNode) swapText(added[j].parentNode);
                        }
                    }
                });
                mo.observe(document.body, { childList: true, subtree: true });
                setTimeout(function () { mo.disconnect(); }, 15000);
            }
        });
    }

    // ── 3. Firebase read filter (salespeople + techLogins) ───────
    var FILTERED_NODES = { salespeople: 1, techLogins: 1 };

    function whenFirebase(cb) {
        if (window.firebase && firebase.database) { cb(); return; }
        var n = 0, t = setInterval(function () {
            if (window.firebase && firebase.database) { clearInterval(t); cb(); }
            else if (++n > 200) clearInterval(t);
        }, 25);
    }

    whenFirebase(function () {
        var origDatabase = firebase.database.bind(firebase);

        firebase.database = function () {
            var db = origDatabase.apply(null, arguments);
            if (db.__apLocWrapped) return db;
            db.__apLocWrapped = true;

            var origRef = db.ref.bind(db);
            db.ref = function (p) {
                var r = origRef.apply(null, arguments);
                var refPath = String(p == null ? '' : p).replace(/^\/+|\/+$/g, '');
                if (!FILTERED_NODES[refPath] || !FILTER_ON) return r;
                return wrapFilteredRef(r);
            };
            return db;
        };

        function allowed(child) {
            var v = child && typeof child.val === 'function' ? child.val() : child;
            if (!v || typeof v !== 'object') return true;
            return !v.locationId || v.locationId === LOC_ID;
        }

        function filterSnap(snap) {
            var kids = [];
            snap.forEach(function (c) { if (allowed(c)) kids.push(c); });
            return {
                key: snap.key,
                ref: snap.ref,
                exists: function () { return kids.length > 0; },
                numChildren: function () { return kids.length; },
                hasChildren: function () { return kids.length > 0; },
                hasChild: function (k) { return kids.some(function (c) { return c.key === k; }); },
                child: function (k) { return snap.child(k); },
                forEach: function (fn) {
                    for (var i = 0; i < kids.length; i++) { if (fn(kids[i]) === true) return true; }
                    return false;
                },
                val: function () {
                    var out = {};
                    kids.forEach(function (c) { out[c.key] = c.val(); });
                    return kids.length ? out : null;
                },
                toJSON: function () { return this.val(); }
            };
        }

        function wrapFilteredRef(r) {
            var proxy = Object.create(r);
            proxy.on = function (evt, cb, cancel, ctx) {
                if (evt !== 'value' || typeof cb !== 'function') return r.on.apply(r, arguments);
                var wrapped = function (snap, prev) { return cb.call(this, filterSnap(snap), prev); };
                return r.on('value', wrapped, cancel, ctx);
            };
            proxy.off = function () { return r.off.apply(r, arguments); };
            proxy.once = function (evt) {
                if (evt !== 'value') return r.once.apply(r, arguments);
                var args = arguments;
                if (typeof args[1] === 'function') {
                    var cb = args[1];
                    return r.once('value').then(function (snap) {
                        var fs = filterSnap(snap); cb(fs); return fs;
                    });
                }
                return r.once('value').then(filterSnap);
            };
            return proxy;
        }
    });

    // ── 4. location chip ─────────────────────────────────────────
    var CHIP = {
        action:   { fg: '#dc2626', bgDark: 'rgba(8,8,8,.85)' },
        american: { fg: '#e04654', bgDark: 'rgba(6,13,26,.88)' },
        anywhere: { fg: '#0AA2FF', bgDark: 'rgba(10,16,42,.88)' }
    };
    function injectChip() {
        if (document.getElementById('ap-loc-chip')) return;
        var brand = CHIP[BRAND] || CHIP.action;
        var isLight = document.documentElement.classList.contains('light');
        var a = document.createElement('a');
        a.id = 'ap-loc-chip';
        a.href = 'locations.html';
        a.title = 'Switch location';
        a.textContent = '◆ ' + (loc.name || 'All Locations');
        a.style.cssText =
            'position:fixed;top:10px;right:12px;z-index:99995;' +
            'font-family:Oswald,sans-serif;font-size:10px;font-weight:600;' +
            'letter-spacing:.16em;text-transform:uppercase;text-decoration:none;' +
            'padding:6px 12px;border:1px solid ' + brand.fg + ';color:' + brand.fg + ';' +
            'background:' + (isLight ? 'rgba(255,255,255,.9)' : brand.bgDark) + ';' +
            'backdrop-filter:blur(4px);';
        document.body.appendChild(a);
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', injectChip);
    else injectChip();

    window.AP_LOCATION = { id: LOC_ID, name: loc.name, brand: BRAND, filtered: FILTER_ON };
})();
