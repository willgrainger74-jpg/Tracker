/* ══════════════════════════════════════════════════════════════════════
   ACTION GROUP — GAMIFICATION ENGINE  (gamify.js)

   Include AFTER the Firebase SDK on any page that wants XP or badges:
       <script src="gamify.js"></script>
   Exposes window.AP_GAMIFY. Pure computation — no rendering, no writes
   except the badge earn-dates (so we know when something was unlocked).

   ── TWO DELIBERATE DEPARTURES FROM THE ACTION HUB ──
   1. XP is COMPUTED, never accumulated. The Hub keeps a running total in
      localStorage (action_gam_<loc>_<tech>), which means it lives on one
      device, dies with the browser cache, is invisible to a manager, and
      drifts the moment anything is edited or backfilled. Here XP is a
      pure function of the call log — recompute any time, on any device,
      and it's always right. Correct a call from last week and the XP
      corrects itself.
   2. Sales earns XP. The Hub only awards XP for training check-ins, QA
      scores and badge bonuses — nothing for selling, in a sales tracker.
      Every number below is already logged on the call card, so techs earn
      XP simply by doing the job they already log.

   Badge earn-dates ARE stored (Firebase `gamification/<personId>/badges`)
   because "when did I unlock this" isn't derivable, and it's what drives
   the unlock toast and the activity feed.
   ══════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    /* ── LEVELS — the Hub's exact ladder and thresholds ── */
    var LEVELS = [
        { level: 1, title: 'Apprentice',  xp: 0,     icon: '🔩', color: '#6b7280' },
        { level: 2, title: 'Technician',  xp: 500,   icon: '🔧', color: '#3b82f6' },
        { level: 3, title: 'Senior Tech', xp: 1500,  icon: '⚙️', color: '#22c55e' },
        { level: 4, title: 'Lead Tech',   xp: 3500,  icon: '🏅', color: '#f0b849' },
        { level: 5, title: 'Master Tech', xp: 7500,  icon: '🔥', color: '#f97316' },
        { level: 6, title: 'Elite',       xp: 15000, icon: '⚡', color: '#dc2626' },
        { level: 7, title: 'Legend',      xp: 30000, icon: '👑', color: '#a855f7' }
    ];

    /* ── XP RULES — every line maps to a box already on the call card ──
       Tuned so a solid month (~$90K, ~25 calls) lands around 1,600 XP:
       Apprentice→Technician in the first few weeks, Legend ≈ two strong
       years. Edit any number here; everything downstream follows. */
    var XP = {
        callLogged:    2,    // showing up and logging it — deliberately small
        jobSold:       20,
        revenuePer100: 1.5,  // $10K day = 150 XP. Revenue is the heaviest line
        review:        25,
        reviewWithPic: 15,   // on top of the review — photo reviews score 2x
        membership:    35,
        turnover:      25,   // a turnover actually handed off
        doorKnocks:    8,
        stDocumented:  5,    // notes + stickers both ticked
        gymSession:    15,
        trainingModule: 25,  // the Hub's TRAINING_CHECKIN value
        badge: { common: 50, uncommon: 100, rare: 250, legendary: 500 }  // the Hub's exact bonuses
    };
    /* Calibrated against the real roster, not guessed. An early pass paid
       5 XP a call and 1 XP per $100, which let volume beat performance —
       a rep on $102K sat level with one on $1.45M. Dropping the per-call
       rate and lifting revenue put the order right. Current spread across
       the 27 active reps: 3 Apprentice, 2 Technician, 5 Senior, 6 Lead,
       3 Master, 6 Elite, 2 Legend — the two Legends being the two guys
       with 330+ calls and $1.3M each. Retune here and nothing else moves. */

    /* ── BADGES ──
       The Hub's sales + training catalogue, minus anything this tracker
       can't honestly measure, plus a few that fit the data we do have.
         · dropped: all 6 QA badges (no QA scorecards here)
         · dropped: the 4/7/12-week training streaks — trainingProgress
           stores lastSeen + modulesVisited only, with no week-by-week
           history to count a streak from. Claiming one would be a lie.
         · added: Perfect Week (ties to the KPI Compliance card), Pic
           Perfect, and the gym badges — gym is a real competition
           category here and the Hub has no equivalent.
       Each check gets ctx = { week, month, allTime, rankMonth, people } */
    var BADGES = [
        // ── sales ──
        { id:'first_blood',      name:'First Blood',      icon:'🔥', pillar:'sales', rarity:'common',
          desc:'Logged your first sold call',
          check:function(c){ return c.allTime.sold >= 1; } },
        { id:'day_5k',           name:'$5K Day',          icon:'💵', pillar:'sales', rarity:'common',
          desc:'Hit $5,000 in a single day',
          check:function(c){ return c.allTime.bestDay >= 5000; } },
        { id:'day_10k',          name:'Five-Figure Day',  icon:'💰', pillar:'sales', rarity:'uncommon',
          desc:'Hit $10,000+ in a single day',
          check:function(c){ return c.allTime.bestDay >= 10000; } },
        { id:'day_20k',          name:'$20K Day',         icon:'💎', pillar:'sales', rarity:'uncommon',
          desc:'Hit $20,000 in a single day',
          check:function(c){ return c.allTime.bestDay >= 20000; } },
        { id:'day_50k',          name:'Gold Standard',    icon:'🏆', pillar:'sales', rarity:'legendary',
          desc:'Hit $50,000+ in a single day',
          check:function(c){ return c.allTime.bestDay >= 50000; } },
        { id:'closer',           name:'The Closer',       icon:'🎯', pillar:'sales', rarity:'rare',
          desc:'80%+ close rate in a week (min. 10 calls)',
          check:function(c){ return c.week.calls >= 10 && c.week.sold / c.week.calls >= 0.8; } },
        { id:'review_machine',   name:'Review Machine',   icon:'⭐', pillar:'sales', rarity:'uncommon',
          desc:'10 reviews in a single month',
          check:function(c){ return c.month.reviews >= 10; } },
        { id:'review_star',      name:'Review Star',      icon:'🌟', pillar:'sales', rarity:'uncommon',
          desc:'70%+ review rate for a full week (company KPI target)',
          check:function(c){ return c.week.calls >= 5 && c.week.reviews / c.week.calls >= 0.7; } },
        { id:'pic_perfect',      name:'Pic Perfect',      icon:'📸', pillar:'sales', rarity:'uncommon',
          desc:'10 photo reviews in a single month — they score 2x',
          check:function(c){ return c.month.reviewsPic >= 10; } },
        { id:'membership_king',  name:'Membership King',  icon:'👑', pillar:'sales', rarity:'rare',
          desc:'10 memberships sold in a single month',
          check:function(c){ return c.month.plans >= 10; } },
        { id:'turnover_king',    name:'Turnover King',    icon:'🔄', pillar:'sales', rarity:'uncommon',
          desc:'50%+ turnover rate for a full week (company KPI target)',
          check:function(c){ return c.week.toPool >= 2 && c.week.turnovers / c.week.toPool >= 0.5; } },
        { id:'door_knocker',     name:'Door Knocker',     icon:'🚪', pillar:'sales', rarity:'common',
          desc:'Knocked neighbors on 10 or more jobs',
          check:function(c){ return c.allTime.doors >= 10; } },
        { id:'st_champion',      name:'ST Champion',      icon:'📋', pillar:'sales', rarity:'uncommon',
          desc:'100% Service Titan compliance for a full week',
          check:function(c){ return c.week.calls >= 5 && c.week.st === c.week.calls; } },
        { id:'perfect_week',     name:'Perfect Week',     icon:'✅', pillar:'sales', rarity:'rare',
          desc:'Hit every KPI in a single week — bonus qualified',
          check:function(c){ return c.week.kpiQualified === true; } },
        { id:'iron_week',        name:'Iron Week',        icon:'🗓️', pillar:'sales', rarity:'uncommon',
          desc:'Logged calls every day for 5 consecutive weekdays',
          check:function(c){ return c.week.weekdaysLogged >= 5; } },
        { id:'top_tech',         name:'Top Tech',         icon:'🥇', pillar:'sales', rarity:'rare',
          desc:'#1 at your location for a full month',
          check:function(c){ return c.rankMonth === 1 && c.month.sold > 0; } },
        { id:'podium',           name:'Podium',           icon:'🏅', pillar:'sales', rarity:'common',
          desc:'Top 3 at your location for a month',
          check:function(c){ return c.rankMonth > 0 && c.rankMonth <= 3 && c.month.sold > 0; } },
        { id:'hundred_k',        name:'Six Figures',      icon:'🚀', pillar:'sales', rarity:'legendary',
          desc:'$100,000+ sold in a single month',
          check:function(c){ return c.month.rev >= 100000; } },

        // ── gym ──
        { id:'first_rep',        name:'First Rep',        icon:'🏋️', pillar:'gym', rarity:'common',
          desc:'Logged your first gym session',
          check:function(c){ return c.allTime.gym >= 1; } },
        { id:'iron_month',       name:'Iron Month',       icon:'💪', pillar:'gym', rarity:'uncommon',
          desc:'12 gym sessions in a single month',
          check:function(c){ return c.month.gym >= 12; } },
        { id:'gym_rat',          name:'Gym Rat',          icon:'🦍', pillar:'gym', rarity:'rare',
          desc:'50 gym sessions logged',
          check:function(c){ return c.allTime.gym >= 50; } },

        // ── training ──
        { id:'first_lesson',     name:'First Lesson',     icon:'📚', pillar:'training', rarity:'common',
          desc:'Opened your first training module',
          check:function(c){ return c.allTime.modules >= 1; } },
        { id:'well_rounded',     name:'Well-Rounded',     icon:'🧠', pillar:'training', rarity:'uncommon',
          desc:'Active in 5 or more training modules',
          check:function(c){ return c.allTime.modules >= 5; } },
        { id:'student',          name:'Student of the Game', icon:'🎓', pillar:'training', rarity:'rare',
          desc:'5+ hours in the Sales Academy',
          check:function(c){ return c.allTime.trainingMins >= 300; } }
    ];

    var RARITY_ORDER = { legendary: 0, rare: 1, uncommon: 2, common: 3 };

    /* ── helpers ── */
    function dkey(d){
        return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
    }
    function blank(){
        return { calls:0, sold:0, rev:0, reviews:0, reviewsPic:0, plans:0, turnovers:0,
                 toPool:0, doors:0, st:0, gym:0, bestDay:0, weekdaysLogged:0,
                 modules:0, trainingMins:0 };
    }
    function addCall(s, c){
        s.calls++;
        if (c.jobSold){ s.sold++; s.rev += parseFloat(c.amountSold) || 0; }
        else if (c.jobCancelled || c.leftEstimate) s.toPool++;
        if (c.reviewWithPic){ s.reviews++; s.reviewsPic++; }
        else if (c.reviewCompleted) s.reviews++;
        if (c.membershipPlanSold) s.plans++;
        if (c.turnoverAccepted) s.turnovers++;
        if (c.threeDoorKnocks) s.doors++;
        if (c.stNotes && c.stickers) s.st++;
    }

    /* ── XP from a stats bucket ── */
    function xpOf(s){
        return Math.round(
            s.calls        * XP.callLogged +
            s.sold         * XP.jobSold +
            (s.rev / 100)  * XP.revenuePer100 +
            s.reviews      * XP.review +
            s.reviewsPic   * XP.reviewWithPic +
            s.plans        * XP.membership +
            s.turnovers    * XP.turnover +
            s.doors        * XP.doorKnocks +
            s.st           * XP.stDocumented +
            s.gym          * XP.gymSession +
            s.modules      * XP.trainingModule
        );
    }
    function badgeXp(ids){
        var t = 0;
        ids.forEach(function(id){
            var b = BADGES.find(function(x){ return x.id === id; });
            if (b) t += XP.badge[b.rarity] || 0;
        });
        return t;
    }

    function levelFor(xp){
        var cur = LEVELS[0];
        for (var i = 0; i < LEVELS.length; i++) if (xp >= LEVELS[i].xp) cur = LEVELS[i];
        var next = LEVELS[cur.level] || null;   // LEVELS is 0-indexed, level N is at [N-1]
        return {
            level: cur.level, title: cur.title, icon: cur.icon, color: cur.color,
            xp: xp, floor: cur.xp,
            next: next, toNext: next ? next.xp - xp : 0,
            pct: next ? Math.min(100, ((xp - cur.xp) / (next.xp - cur.xp)) * 100) : 100
        };
    }

    /* ── the public surface ──
       buildContext(opts) -> { stats, ctx } from data the page already has.
       opts: { pid, logs, gymLogs, training, people, getCalls, monthDates,
               weekDates, kpiQualified } */
    function buildContext(o){
        var allTime = blank(), month = blank(), week = blank();
        var byDay = {};

        // all-time + best day, straight from the call log
        Object.keys(o.logs || {}).forEach(function(key){
            var cut = key.lastIndexOf('_');
            if (key.slice(0, cut) !== o.pid) return;
            var date = key.slice(cut + 1), dayRev = 0;
            Object.keys(o.logs[key] || {}).forEach(function(id){
                var c = o.logs[key][id];
                if (!c || typeof c !== 'object') return;
                addCall(allTime, c);
                if (c.jobSold) dayRev += parseFloat(c.amountSold) || 0;
            });
            byDay[date] = dayRev;
            if (dayRev > allTime.bestDay) allTime.bestDay = dayRev;
        });

        (o.monthDates || []).forEach(function(d){ (o.getCalls(o.pid, d) || []).forEach(function(c){ addCall(month, c); }); });

        var weekdays = 0;
        (o.weekDates || []).forEach(function(d){
            var cs = o.getCalls(o.pid, d) || [];
            cs.forEach(function(c){ addCall(week, c); });
            var dow = d.getDay();
            if (cs.length && dow >= 1 && dow <= 5) weekdays++;
        });
        week.weekdaysLogged = weekdays;
        week.kpiQualified = !!o.kpiQualified;

        // gym
        var mk = o.monthDates && o.monthDates.length ? dkey(o.monthDates[0]).slice(0,7) : '';
        Object.keys(o.gymLogs || {}).forEach(function(key){
            var cut = key.lastIndexOf('_');
            if (key.slice(0, cut) !== o.pid) return;
            allTime.gym++;
            if (key.slice(cut + 1).indexOf(mk) === 0) month.gym++;
        });

        // training
        var tp = (o.training || {})[o.pid] || {};
        allTime.modules      = (tp.modulesVisited || []).length;
        allTime.trainingMins = tp.totalTimeMinutes || 0;

        var ctx = { allTime: allTime, month: month, week: week, rankMonth: o.rankMonth || 0 };

        var earned = BADGES.filter(function(b){
            try { return !!b.check(ctx); } catch (e) { return false; }
        });
        var base  = xpOf(allTime);
        var total = base + badgeXp(earned.map(function(b){ return b.id; }));

        /* Two numbers on purpose:
             xp / level  — career rank. All-time, never resets. A guy with
                           330 calls and $1.3M SHOULD outrank a new hire.
             monthXp     — the live race. Resets every month, so the rookie
                           who outworks everyone in July wins July. Without
                           this the leaderboard is frozen on the veterans
                           forever and there's no game left for anyone else. */
        return {
            stats: ctx,
            earned: earned,
            earnedIds: earned.map(function(b){ return b.id; }),
            baseXp: base,
            badgeXp: total - base,
            xp: total,
            monthXp: xpOf(month),
            level: levelFor(total)
        };
    }

    /* ── badge earn-dates (the one thing worth persisting) ── */
    function loadBadges(pid, cb){
        try {
            firebase.database().ref('gamification/' + pid + '/badges').once('value')
                .then(function(s){ cb(s.val() || {}); })
                .catch(function(){ cb({}); });
        } catch (e) { cb({}); }
    }
    function stampBadges(pid, ids, known){
        var updates = {}, now = Date.now(), fresh = [];
        ids.forEach(function(id){
            if (known[id]) return;
            updates['gamification/' + pid + '/badges/' + id] = now;
            fresh.push(id);
        });
        if (fresh.length){
            try { firebase.database().ref().update(updates); } catch (e) {}
        }
        return fresh;   // newly unlocked this load — what the toast celebrates
    }

    window.AP_GAMIFY = {
        LEVELS: LEVELS, BADGES: BADGES, XP: XP, RARITY_ORDER: RARITY_ORDER,
        buildContext: buildContext, levelFor: levelFor, xpOf: xpOf,
        loadBadges: loadBadges, stampBadges: stampBadges,
        byId: function(id){ return BADGES.find(function(b){ return b.id === id; }); }
    };
})();
