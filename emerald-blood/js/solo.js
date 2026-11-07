/* ================= BATTLES REN FIGHTS ALONE =================
   Kess (and anyone else in the party) stays out of fights that are Ren's alone:
   rival bouts and duels, sparring and lessons, tournaments and tests of strength, the Guild Trial,
   anything fought as the Red Veil (nobody may connect him to his friends), and fights inside his own head. */
const SOLO = {
  keys: /^(kairo|ge_.*_r$|vane|halvard_pro|mind_|dax|liora_rival|cael|duel_)/,
  intro: /RIVALS|Sparring|sparring|FINAL LESSON|Flashback|TEST OF STRENGTH|ROUND \d|FINAL —|Red Veil|DUEL|Duel|bout/,
  check(cfg) {
    if (!cfg || cfg.allies) return false;                          // a battle that names its allies decides for itself
    if (cfg.solo || cfg.bout || cfg.tutorial || cfg.leafTrain || cfg.mind) return true;
    if (G.S && G.S.f && G.S.f.trial === 'running') return true;     // the Guild Trial: applicants enter alone
    if (typeof Veil !== 'undefined' && Veil.on && Veil.on()) return true;
    if ((cfg.enemies || []).some(k => this.keys.test(k))) return true;
    return this.intro.test(cfg.intro || '');
  }
};
(function () {
  const _start = Battle.start.bind(Battle);
  Battle.start = function (cfg) {
    if (typeof cfg === 'string') cfg = { enemies: [cfg] };
    if (SOLO.check(cfg)) cfg = Object.assign({}, cfg, { allies: [] });
    return _start(cfg);
  };
})();
