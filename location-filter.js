/* ═══════════════════════════════════════════════════════════════════════
   ACTION ARMY — LOCATION FILTER + BRAND ENGINE  (v4)

   ONE file, ONE config block, FOUR brands. Everything a location needs
   to look like its own company lives in the BRANDS object below — logo,
   colors, fonts, wordmark, hero text. Nothing else in the repo changes.

   Include on every page AFTER the two Firebase SDK <script> tags and
   BEFORE firebase.initializeApp / page scripts:

       <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-database-compat.js"></script>
       <script src="location-filter.js"></script>

   TO ADD A FIFTH LOCATION: add a tile in locations.html, drop its logo
   in the repo, and add one entry to BRANDS. That's it.
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    /* ─────────────────────────────────────────────────────────────────
       THE BRAND BOOK — edit here, everything downstream follows
       ───────────────────────────────────────────────────────────────── */
    var BRANDS = {

        /* Action Plumbing (Utah + Arizona) — the original. No overrides:
           an empty brand means "leave every page exactly as authored." */
        action: {
            chip: '#dc2626'
        },

        /* Anywhere Rooter — Colorado */
        anywhere: {
            logo:   'logo-anywhere.png',
            alt:    'Anywhere Rooter',
            heroBg: 'ANYWHERE',
            chip:   '#0AA2FF',
            font:   { from: 'Bebas Neue', to: 'Barlow Condensed',
                      link: 'https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&display=swap' },
            text: [
                ['ACTION ARMY', 'ANYWHERE ARMY'],
                ['Action Army', 'Anywhere Army'],
                ['ACTION PLUMBING, HEATING, AIR & ELECTRIC', 'ANYWHERE ROOTER'],
                ['Action Plumbing, Heating, Air & Electric', 'Anywhere Rooter'],
                ['ACTION PLUMBING', 'ANYWHERE ROOTER'],
                ['Action Plumbing', 'Anywhere Rooter']
            ],
            dark: {
                red:'#2575fc', red2:'#173997', red3:'#0b1c4d',
                gold:'#0AA2FF', gold2:'#067ec7',
                bg:'#0a102a', s1:'#101a3d', s2:'#14224c', s3:'#1b2b5e', s4:'#24356e',
                wire:'rgba(190,210,255,0.10)', wire2:'rgba(190,210,255,0.17)',
                muted:'#a9b6dd', faint:'#5b6a99', text:'#f0f4ff'
            },
            light: {
                red:'#2575fc', red2:'#173997', red3:'#dbe6ff',
                gold:'#067ec7', gold2:'#056aa8',
                bg:'#eff3ff', s1:'#ffffff', s2:'#e4ebfa', s3:'#d8e2f5', s4:'#c9d7f0',
                wire:'rgba(23,57,151,0.10)', wire2:'rgba(23,57,151,0.18)',
                muted:'#44598f', faint:'#93a5c9', text:'#0b1c4d'
            }
        },

        /* American Rooter & Drain — Idaho  (idahosplumber.com) */
        american: {
            logo:   'logo-american.png',
            alt:    'American Rooter & Drain',
            heroBg: 'AMERICAN',
            chip:   '#e04654',
            text: [
                ['ACTION ARMY', 'AMERICAN ROOTER'],
                ['Action Army', 'American Rooter'],
                ['ACTION PLUMBING, HEATING, AIR & ELECTRIC', 'AMERICAN ROOTER & DRAIN'],
                ['Action Plumbing, Heating, Air & Electric', 'American Rooter & Drain'],
                ['ACTION PLUMBING', 'AMERICAN ROOTER & DRAIN'],
                ['Action Plumbing', 'American Rooter & Drain']
            ],
            dark: {
                red:'#b71e29', red2:'#8f1720', red3:'#12233f',
                gold:'#5b8fd6', gold2:'#3d6bb0',
                bg:'#060d1a', s1:'#0c1830', s2:'#112040', s3:'#182b52', s4:'#1f3765',
                wire:'rgba(210,225,255,0.10)', wire2:'rgba(210,225,255,0.17)',
                muted:'#8ea3c4', faint:'#42557a', text:'#f2f6ff'
            },
            light: {
                red:'#b71e29', red2:'#8f1720', red3:'#e8eef8',
                gold:'#3d6bb0', gold2:'#2c5290',
                bg:'#f2f5fa', s1:'#ffffff', s2:'#e8edf5', s3:'#dde5f0', s4:'#d0dbec',
                wire:'rgba(10,49,97,0.10)', wire2:'rgba(10,49,97,0.18)',
                muted:'#4a5f80', faint:'#93a5c0', text:'#0a1a33'
            }
        }
    };

    /* ─────────────────────────────────────────────────────────────────
       PER-LOCATION DATA — nodes each branch owns outright.

       These aren't filtered (their children are plain numbers, not
       objects with a locationId) — they're REDIRECTED. A page asking for
       `teamYearlyGoals/2026` silently reads and writes
       `locationData/utah/teamYearlyGoals/2026` instead. Reads, writes and
       sub-paths all follow, so goals.html and reports.html need no edits.

       Add a node name here and it becomes per-location instantly.
       NOT scoped (deliberately company-wide for now): announcements,
       monthlyCompetition, competitionMeta, competitionFeed, commissionRate,
       commissionTiers, huddleSummaries.
       ───────────────────────────────────────────────────────────────── */
    var SCOPED_PATHS = {
        teamYearlyGoals: 1
    };

    /* which location uses which brand */
    var LOCATION_BRAND = {
        utah:     'action',
        arizona:  'action',
        colorado: 'anywhere',
        idaho:    'american',
        all:      'action'
    };

    /* ─────────────────────────────────────────────────────────────────
       1. WHERE ARE WE?
       ───────────────────────────────────────────────────────────────── */
    var path = (location.pathname || '').toLowerCase();
    if (path.indexOf('locations.html') !== -1) return;
    if (path.indexOf('migrate.html') !== -1) return;
    if (path.indexOf('inspection.html') !== -1) return; // fleet Firebase

    /* The Training Academy belongs to the Action Group, not to a branch —
       the hub links straight to it, so it must open without picking one.
       Safe to leave unscoped: neither page reads the roster. academy.html
       only touches academy/*, and training.html only reads callLogs for
       whoever is signed in. */
    var ACADEMY = path.indexOf('academy.html') !== -1 || path.indexOf('training.html') !== -1;

    /* The chosen location lives in sessionStorage, not localStorage — on
       purpose. sessionStorage dies when the app or tab is closed, so every
       fresh launch starts at the hub and nobody is silently dropped into
       whichever branch they used last. In-app navigation keeps the session,
       so moving between pages never re-asks. */
    var loc = null;
    try { loc = JSON.parse(sessionStorage.getItem('apLocation')); } catch (e) { loc = null; }

    if (!loc || !loc.id) {
        if (ACADEMY) loc = { id:'academy', name:'Training Academy', brand:'action' };
        else {
            /* no location this session -> the hub, from whatever page they landed on */
            location.replace('locations.html');
            return;
        }
    }

    var LOC_ID     = loc.id;
    var BRAND_KEY  = loc.brand || LOCATION_BRAND[LOC_ID] || 'action';
    var B          = BRANDS[BRAND_KEY] || BRANDS.action;
    var FILTER_ON  = LOC_ID !== 'all' && LOC_ID !== 'academy';

    /* ─────────────────────────────────────────────────────────────────
       2. PAINT THE BRAND
       ───────────────────────────────────────────────────────────────── */
    function paletteCss(sel, vars) {
        var out = sel + '{';
        for (var k in vars) out += '--' + k + ':' + vars[k] + ';';
        return out + '}';
    }

    if (B.dark || B.logo) {
        var css = '';

        /* Colors. `html:root` outranks the pages' own `:root` — without this
           the page's stylesheet (parsed AFTER this script) wins the cascade
           and the brand never appears. Same reason for `html.light:root`. */
        if (B.dark)  css += paletteCss('html:root', B.dark);
        if (B.light) css += paletteCss('html.light:root', B.light);

        /* Logo. `content:url()` swaps the image at paint time — no flash of
           the Action logo, no waiting on JS. Every page uses the same
           filename, so one selector covers the header logo AND index's
           big hero logo, and each keeps its own inline height. */
        if (B.logo) {
            css += 'img[src*="actionsite-logo"]{content:url("' + B.logo + '");}';
        }

        var styleEl = document.createElement('style');
        styleEl.id = 'ap-brand-theme';
        styleEl.textContent = css;
        (document.head || document.documentElement).appendChild(styleEl);

        /* ...and make sure we're last in the head once the page is parsed. */
        var pinLast = function () {
            try { if (document.head) document.head.appendChild(styleEl); } catch (e) {}
        };
        document.addEventListener('DOMContentLoaded', pinLast);
        setTimeout(pinLast, 0);
    }

    /* fonts: load the brand face, then retarget rules that used the old one */
    if (B.font) {
        var lnk = document.createElement('link');
        lnk.rel = 'stylesheet';
        lnk.href = B.font.link;
        (document.head || document.documentElement).appendChild(lnk);
    }
    function swapFonts() {
        if (!B.font) return;
        try {
            for (var s = 0; s < document.styleSheets.length; s++) {
                var rules;
                try { rules = document.styleSheets[s].cssRules; } catch (e) { continue; }
                if (!rules) continue;
                for (var i = 0; i < rules.length; i++) {
                    var st = rules[i].style;
                    if (st && st.fontFamily && st.fontFamily.indexOf(B.font.from) !== -1) {
                        st.fontFamily = st.fontFamily.split(B.font.from).join(B.font.to);
                    }
                }
            }
        } catch (e) { /* cosmetic only */ }
    }
    function swapInlineFonts(root) {
        if (!B.font || !root || !root.querySelectorAll) return;
        try {
            var els = root.querySelectorAll('[style*="' + B.font.from + '"]');
            for (var i = 0; i < els.length; i++) {
                els[i].style.fontFamily = els[i].style.fontFamily.split(B.font.from).join(B.font.to);
            }
        } catch (e) {}
    }

    /* wordmarks: exact strings only, so metric names like "Action Stats"
       and "Action Thermostat" keep their names */
    function swapText(root) {
        if (!B.text) return;
        try {
            if (!root || (root.nodeType !== 1 && root.nodeType !== 9)) return;
            var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
            var n;
            while ((n = walker.nextNode())) {
                var v = n.nodeValue;
                if (!v || (v.indexOf('Action') === -1 && v.indexOf('ACTION') === -1)) continue;
                for (var i = 0; i < B.text.length; i++) {
                    if (v.indexOf(B.text[i][0]) !== -1) v = v.split(B.text[i][0]).join(B.text[i][1]);
                }
                if (v !== n.nodeValue) n.nodeValue = v;
            }
        } catch (e) { /* never break the page over branding */ }
    }

    function brandDom(root) {
        root = root || document;
        /* logo: set src too, so right-click/save and any browser that's
           fussy about content:url still gets the right image */
        if (B.logo && root.querySelectorAll) {
            try {
                var imgs = root.querySelectorAll('img[src*="actionsite-logo"]');
                for (var i = 0; i < imgs.length; i++) {
                    imgs[i].src = B.logo;
                    if (B.alt) imgs[i].alt = B.alt;
                }
            } catch (e) {}
        }
        /* the giant ghost word behind index's hero */
        if (B.heroBg && root.querySelectorAll) {
            try {
                var bg = root.querySelectorAll('.hero-bg-text');
                for (var j = 0; j < bg.length; j++) {
                    if ((bg[j].textContent || '').trim().toUpperCase() === 'ACTION') bg[j].textContent = B.heroBg;
                }
            } catch (e) {}
        }
        swapText(root);
        swapInlineFonts(root);
    }

    document.addEventListener('DOMContentLoaded', function () {
        if (B.text && document.title) {
            for (var i = 0; i < B.text.length; i++) {
                document.title = document.title.split(B.text[i][0]).join(B.text[i][1]);
            }
        }
        swapFonts();
        brandDom(document.body || document);

        /* catch anything rendered later — login overlay, Firebase renders */
        if (window.MutationObserver && document.body && (B.text || B.logo || B.heroBg)) {
            var mo = new MutationObserver(function (muts) {
                for (var i = 0; i < muts.length; i++) {
                    var added = muts[i].addedNodes;
                    for (var j = 0; j < added.length; j++) {
                        if (added[j].nodeType === 1) brandDom(added[j]);
                        else if (added[j].nodeType === 3 && added[j].parentNode) swapText(added[j].parentNode);
                    }
                }
            });
            mo.observe(document.body, { childList: true, subtree: true });
            setTimeout(function () { mo.disconnect(); }, 15000);
        }
    });

    /* ─────────────────────────────────────────────────────────────────
       3. SCOPE THE DATA — reps and logins are location-specific
       ───────────────────────────────────────────────────────────────── */
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
                var refPath = String(p == null ? '' : p).replace(/^\/+|\/+$/g, '');
                var head = refPath.split('/')[0];

                /* own-your-own-data nodes: redirect the whole path */
                if (FILTER_ON && SCOPED_PATHS[head]) {
                    return origRef('locationData/' + LOC_ID + '/' + refPath);
                }

                var r = origRef.apply(null, arguments);

                /* shared-roster nodes: filter what comes back */
                if (!FILTERED_NODES[refPath] || !FILTER_ON) return r;
                return wrapFilteredRef(r);
            };
            return db;
        };

        function allowed(child) {
            var v = child && typeof child.val === 'function' ? child.val() : child;
            if (!v || typeof v !== 'object') return true;
            return !v.locationId || v.locationId === LOC_ID;  // no locationId = shared
        }

        function filterSnap(snap) {
            var kids = [];
            snap.forEach(function (c) { if (allowed(c)) kids.push(c); });
            return {
                key: snap.key,
                ref: snap.ref,
                exists:      function () { return kids.length > 0; },
                numChildren: function () { return kids.length; },
                hasChildren: function () { return kids.length > 0; },
                hasChild:    function (k) { return kids.some(function (c) { return c.key === k; }); },
                child:       function (k) { return snap.child(k); },
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
                return r.on('value', function (snap, prev) { return cb.call(this, filterSnap(snap), prev); }, cancel, ctx);
            };
            proxy.off = function () { return r.off.apply(r, arguments); };
            proxy.once = function (evt) {
                if (evt !== 'value') return r.once.apply(r, arguments);
                if (typeof arguments[1] === 'function') {
                    var cb = arguments[1];
                    return r.once('value').then(function (snap) { var fs = filterSnap(snap); cb(fs); return fs; });
                }
                return r.once('value').then(filterSnap);
            };
            return proxy;
        }
    });

    /* ─────────────────────────────────────────────────────────────────
       4. iPHONE SAFE AREA + THE SWITCHER CHIP

       The pages use viewport-fit=cover with a black-translucent status
       bar, so once installed to the home screen the web view runs edge to
       edge — right up under the notch. The bottom was already handled
       (the tab bar pads with safe-area-inset-bottom); the top never was,
       which put the theme toggle under the iPhone status bar where it
       can't be tapped. These two rules fix it everywhere at once:
         body            -> pushes flowing content below the status bar
         #themeToggleWrap-> it's position:fixed, so body padding can't
                            move it; it needs the inset itself
       Both are 0px in a normal browser and on non-notch devices.
       ───────────────────────────────────────────────────────────────── */
    var safeCss = document.createElement('style');
    safeCss.id = 'ap-safe-area';
    safeCss.textContent =
        'body{padding-top:env(safe-area-inset-top);}' +
        '#themeToggleWrap{top:calc(12px + env(safe-area-inset-top))!important;}' +
        '#ap-loc-chip{font-family:Oswald,sans-serif;font-size:11px;font-weight:600;' +
        'letter-spacing:.12em;text-transform:uppercase;text-decoration:none;' +
        'padding:7px 12px;display:flex;align-items:center;gap:6px;white-space:nowrap;' +
        'border:1px solid ' + (B.chip || '#dc2626') + ';color:' + (B.chip || '#dc2626') + ';' +
        'background:var(--s2,rgba(0,0,0,.8));}' +
        '#ap-loc-chip.ap-floating{position:fixed;z-index:99995;' +
        'top:calc(12px + env(safe-area-inset-top));right:16px;backdrop-filter:blur(4px);}';
    (document.head || document.documentElement).appendChild(safeCss);
    var pinSafeLast = function () { try { if (document.head) document.head.appendChild(safeCss); } catch (e) {} };
    document.addEventListener('DOMContentLoaded', pinSafeLast);

    function injectChip() {
        if (document.getElementById('ap-loc-chip')) return;
        var a = document.createElement('a');
        a.id = 'ap-loc-chip';
        a.href = 'locations.html';
        a.title = 'Switch location';
        a.textContent = '◆ ' + (loc.name || 'All Locations');

        /* The theme toggle already owns the top-right corner and is a
           row-reverse flex row, so dropping the chip inside it puts the two
           side by side instead of stacked on top of each other — and the
           chip inherits the safe-area fix for free. */
        var wrap = document.getElementById('themeToggleWrap');
        if (wrap) wrap.appendChild(a);
        else { a.className = 'ap-floating'; document.body.appendChild(a); }
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', injectChip);
    else injectChip();

    window.AP_LOCATION = { id: LOC_ID, name: loc.name, brand: BRAND_KEY, filtered: FILTER_ON };
})();
