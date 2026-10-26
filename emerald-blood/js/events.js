'use strict';
/* ================= EVENTS: the Colosseum of Aurel, the Guild Tournament, the Warcry Festival =================
   Fame: how much the world cheers your name.  Notoriety: how much the underworld fears it. */
const EV = (o) => Object.assign({ hp: 100, atk: 14, def: 5, spd: 12, dodge: .15, parry: .2, brk: 70, xp: 30, gold: 0 }, o);
Object.assign(ENEMY, {
  glad_net: EV({ name: 'Retiarius', img: 'guard', hp: 110, atk: 15, spd: 15, dodge: .3, trait: 'Net & trident — fast and slippery', skills: [{ name: 'Net Cast', hits: [{ anim: 'thrust', m: .8, w: 520 }] }, { name: 'Trident Flurry', w: .4, hits: [{ anim: 'thrust', m: .6, w: 420 }, { anim: 'thrust', m: .6, w: 240 }, { anim: 'thrust', m: .8, w: 300 }] }] }),
  glad_shield: EV({ name: 'Murmillo', img: 'garrick_bt', hp: 150, atk: 15, def: 9, spd: 9, parry: .4, shield: 2, trait: 'Tower shield (2 wards) — break it', skills: [{ name: 'Gladius Jab', hits: [{ anim: 'slash', m: 1, w: 520 }] }, { name: 'Shield Rush', w: .35, hits: [{ anim: 'slash', m: 1.6, w: 800, unp: 1 }] }] }),
  glad_lion: EV({ name: 'Brannoc, the Lion of Aurel', img: 'voss', boss: 1, size: 1.25, hp: 340, atk: 21, def: 8, spd: 13, parry: .35, brk: 140, xp: 160, trait: 'Undefeated in 61 bouts — stance counters plain attacks', stance: 1,
    skills: [{ name: 'Lion\'s Lunge', hits: [{ anim: 'thrust', m: 1.3, w: 640 }] }, { name: 'Roar of the Sands', w: .3, hits: [{ anim: 'thrust', m: .8, w: 420 }, { anim: 'thrust', m: .8, w: 260 }, { anim: 'thrust', m: 1.2, w: 380 }] }] }),
  glad_emperor: EV({ name: 'The Emperor\'s Champion', img: 'caspian', boss: 1, size: 1.2, spectral: '#fff3b0', hp: 520, atk: 25, def: 9, spd: 15, parry: .4, brk: 180, xp: 300, trait: 'A Wind Lance of Caspian\'s corps — fights in his master\'s style',
    skills: [{ name: 'Gale Draw', hits: [{ anim: 'slash', m: 1.4, w: 520 }] }, { name: 'Snow Sever', w: .35, hits: [{ anim: 'slash', m: .8, w: 380 }, { anim: 'slash', m: .8, w: 220 }, { anim: 'slash', m: 1.2, w: 300 }] }, { name: 'Unbowed Draw', w: .2, hits: [{ anim: 'slash', m: 2.3, w: 1000, unp: 1 }] }] }),
  wc_brawler: EV({ name: 'Pit Brawler', img: 'bandit', hp: 80, atk: 14, def: 3, trait: 'Fights dirty for coin', skills: [{ name: 'Haymaker', hits: [{ anim: 'slash', m: 1.2, w: 600 }] }, { name: 'Dirt in the Eyes', w: .3, hits: [{ anim: 'slash', m: 1.4, w: 560, unp: 1 }] }] }),
  wc_champion: EV({ name: 'Red Hand Dorran', img: 'rook', boss: 1, size: 1.3, hp: 300, atk: 20, def: 6, spd: 15, dodge: .3, brk: 130, xp: 150, blind: 1, trait: 'Three-time Warcry champion — blinding sand, no rules',
    skills: [{ name: 'Red Hand', hits: [{ anim: 'thrust', m: .8, w: 460 }, { anim: 'thrust', m: .8, w: 260 }] }, { name: 'Feint', w: .3, hits: [{ anim: 'slash', m: 1.5, w: 980 }] }, { name: 'Dirt in the Eyes', w: .25, hits: [{ anim: 'slash', m: 1.7, w: 560, unp: 1 }] }] }),
  wc_kingsblade: EV({ name: 'Iska\'s Tide-Sister', img: 'iska', boss: 1, size: 1.15, hp: 420, atk: 23, def: 7, spd: 14, brk: 160, xp: 240, trait: 'Mother Brine sent her best to win the festival',
    skills: [{ name: 'Cutlass Arc', hits: [{ anim: 'slash', m: 1.2, w: 520 }] }, { name: 'Tidal Lunge', w: .35, hits: [{ anim: 'thrust', m: .9, w: 420 }, { anim: 'thrust', m: .9, w: 260 }] }, { name: 'High Tide', w: .2, hits: [{ anim: 'spellcast', m: 2, w: 1000, unp: 1 }] }] }),
  tn_cael: EV({ name: 'Cael Ardent (holding back)', img: 'cael', boss: 1, size: 1.1, fixed: 1, hp: 900, atk: 26, def: 10, spd: 17, dodge: .2, parry: .45, brk: 240, xp: 400, trait: 'Sixth of the Seven · SSS — Pale Mercy drinks Drag mana: Drag Arts HEAL him', hunger: 1,
    skills: [{ name: 'Pale Thrust', hits: [{ anim: 'thrust', m: 1.2, w: 480 }] }, { name: 'Drag-Breaker', w: .35, hits: [{ anim: 'thrust', m: .9, w: 380 }, { anim: 'thrust', m: .9, w: 220 }, { anim: 'thrust', m: 1.4, w: 340 }] }, { name: 'Purging Light', w: .2, hits: [{ anim: 'thrust', m: 2.2, w: 1000, unp: 1 }] }] })
});
Object.assign(TIER, { glad_net: 'C', glad_shield: 'C', glad_lion: 'A', glad_emperor: 'S', wc_brawler: 'D', wc_champion: 'B', wc_kingsblade: 'A', tn_cael: 'SSS' });

const EVENTS = {
  colosseum: { name: 'The Colosseum of Aurel', bd: 'colosseum', noArts: 1, rule: 'Gladiators fight masked. Use a Drag Art and the whole city sees green eyes — so Drag Arts are forbidden. Vane\'s sword techniques are fine.',
    tiers: [
      { name: 'Bronze Sands', need: 0, gold: 120, fame: 10, rounds: [['bandit', 'bandit'], ['m_goblin', 'm_goblin', 'm_goblin'], ['m_orc']] },
      { name: 'Iron Sands', need: 10, gold: 220, fame: 20, rounds: [['glad_net'], ['m_skeleton', 'm_skeleton', 'm_ghoul'], ['glad_shield', 'glad_net']] },
      { name: 'Gold Sands', need: 30, gold: 400, fame: 35, rounds: [['m_minotaur'], ['m_lizard', 'm_lizard', 'glad_net'], ['glad_lion']] },
      { name: 'The Emperor\'s Games', need: 65, gold: 800, fame: 60, rounds: [['m_drake', 'glad_shield'], ['m_wartotaur', 'm_minotaur'], ['glad_emperor']] }] },
  tourney: { name: 'The Guild Tournament', bd: 'tourney', rule: 'Guild rules: anything goes except killing. Win the cup and Seraphine herself stamps your new rank.',
    tiers: [
      { name: 'Copper Cup', from: 'E', to: 'D', gold: 80, fame: 8, rounds: [['tilda_t'], ['m_goblin', 'm_goblin_shaman'], ['garrick_t']] },
      { name: 'Bronze Cup', from: 'D', to: 'C', gold: 160, fame: 15, rounds: [['garrick_t', 'tilda_t'], ['m_ghoul', 'm_skeleton'], ['sylwen_t']] },
      { name: 'Silver Cup', from: 'C', to: 'B', gold: 300, fame: 25, rounds: [['sylwen_t', 'garrick_t'], ['m_orc', 'm_lizard'], ['glad_lion']] },
      { name: 'Gold Cup', from: 'B', to: 'A', gold: 500, fame: 40, rounds: [['m_minotaur'], ['glad_shield', 'glad_net', 'sylwen_t'], ['wc_kingsblade']] },
      { name: 'Mythril Cup', from: 'A', to: 'S', gold: 900, fame: 70, rounds: [['m_vampire', 'm_drake'], ['glad_emperor'], ['tn_cael']] }] },
  warcry: { name: 'The Warcry Festival', bd: 'festival', rule: 'Bandit rules: no rules. Nobody here cares what colour your eyes are — Drag Arts allowed. Win and every bandit king hears your name.',
    tiers: [
      { name: 'Mud Pit', need: 0, gold: 100, fame: 4, notoriety: 10, rounds: [['wc_brawler', 'wc_brawler'], ['tollman', 'bandit'], ['lupine_alpha']] },
      { name: 'Blood Ring', need: 15, gold: 240, fame: 8, notoriety: 20, rounds: [['wc_brawler', 'tollman', 'bandit'], ['m_tusker', 'm_orc'], ['wc_champion']] },
      { name: 'The King\'s Warcry', need: 40, gold: 520, fame: 15, notoriety: 40, rounds: [['wc_champion', 'wc_brawler'], ['m_wartotaur', 'm_troll'], ['wc_kingsblade']] }] }
};
const FAME_T = [[0, 'Unknown'], [10, 'Local Name'], [30, 'Rising Star'], [65, 'Champion'], [120, 'Living Legend']];
const NOTO_T = [[0, 'Clean'], [10, 'Rough'], [25, 'Wanted'], [50, 'Infamous'], [90, 'Bandit-King\'s Equal']];
const titleOf = (T, v) => T.filter(t => v >= t[0]).pop()[1];

const Events = {
  async open(kind, from) {
    const E = EVENTS[kind], S = G.S; S.fame = S.fame || 0; S.notoriety = S.notoriety || 0; S.evWins = S.evWins || {};
    if (!S.rank) { await narr('The heralds want a Guild card or a sponsor. You have neither — yet.'); return; }
    if (kind === 'colosseum' && from !== 'map' && S.gold < 30) { await narr('The carriage to Aurel costs 30 gold. You don\'t have it.'); return; }
    await narr(`${E.name}. ${E.rule}`);
    const st = t => kind === 'tourney' ? (S.evWins[kind + t.name] ? '✔ ' : GRADES.indexOf(S.rank) < GRADES.indexOf(t.from) ? '🔒 ' : '') : (S.evWins[kind + t.name] ? '✔ ' : (kind === 'warcry' ? S.notoriety : S.fame) < t.need ? '🔒 ' : '');
    const c = await ask(null, null, `Fame: ${S.fame} (${titleOf(FAME_T, S.fame)}) · Notoriety: ${S.notoriety} (${titleOf(NOTO_T, S.notoriety)}). Which bracket?`, [...E.tiers.map(t => `${st(t)}${t.name}${t.to ? ` (rank ${t.from} → ${t.to})` : ''} — ${t.gold}g`), 'Leave']);
    if (c < 0 || c >= E.tiers.length) return;
    const T = E.tiers[c];
    if (kind === 'tourney' && GRADES.indexOf(S.rank) < GRADES.indexOf(T.from)) { await narr(`The ${T.name} is for ${T.from}-rank adventurers and above.`); return; }
    if (kind !== 'tourney' && (kind === 'warcry' ? S.notoriety : S.fame) < T.need) { await narr(`Nobody will put you in the ${T.name} yet. Earn more ${kind === 'warcry' ? 'notoriety' : 'fame'} first (${T.need}).`); return; }
    if (kind === 'colosseum' && from !== 'map') S.gold -= 30;
    await this.run(kind, E, T);
  },
  async run(kind, E, T) {
    const S = G.S;
    banner(T.name.toUpperCase(), E.name, 2200); await wait(1600);
    if (kind === 'tourney' && T.to === 'S') { CHAR.cael = { name: 'Cael Ardent', sprite: 'cael' }; }
    for (let i = 0; i < T.rounds.length; i++) {
      const last = i === T.rounds.length - 1;
      if (last && kind === 'tourney' && T.to === 'S') await say('cael', 'sneer', 'The final? Against a rookie in a hood. …Something about you smells wrong. Take the hood off and fight me properly.');
      const r = await Battle.start({ enemies: T.rounds[i], noFlee: true, bd: E.bd, noArts: E.noArts, bout: kind !== 'warcry', intro: `${last ? 'FINAL' : 'ROUND ' + (i + 1)} — ${T.name}` });
      if (r === 'lose') {
        await fadeOut(400); Story.heal(true); await fadeIn(400);
        await narr(kind === 'colosseum' ? 'The crowd turns its thumbs down — but the Colosseum doctors drag you off the sand alive. Try again when you\'re ready.' : kind === 'warcry' ? 'You wake up in a ditch behind the festival, missing a boot. The bandits are still singing.' : 'The Guild healers patch you up. Brom pats your shoulder. "Next year, rookie."');
        return;
      }
      if (r !== 'win') return;
      if (!last) { const st = S.stats; st.hp = Math.min(st.maxHp, st.hp + Math.round(st.maxHp * .35)); st.mp = Math.min(st.maxMp, st.mp + Math.round(st.maxMp * .35)); for (const k in S.allies) S.allies[k] = {}; toast('Between rounds: the healers restore some HP & MP.', 2000); }
    }
    const first = !S.evWins[kind + T.name]; S.evWins[kind + T.name] = (S.evWins[kind + T.name] || 0) + 1;
    const fame = first ? T.fame : Math.ceil(T.fame / 3), noto = first ? (T.notoriety || 0) : Math.ceil((T.notoriety || 0) / 3), gold = first ? T.gold : Math.ceil(T.gold / 2);
    S.gold += gold; S.fame += fame; S.notoriety += noto; sfx('win');
    banner(`${T.name.toUpperCase()} — CHAMPION`, `+${gold}g · +${fame} fame${noto ? ` · +${noto} notoriety` : ''}`, 3000); await wait(2200);
    if (kind === 'colosseum') await narr(first ? 'Fifty thousand people chant for the masked fighter. Somewhere in the Imperial box, someone leans forward to get a better look.' : 'The crowd roars. They are starting to know your stance.');
    if (kind === 'warcry') await narr(first ? 'The bandits lift you onto their shoulders and pour ale on your head. Somewhere, a bandit king is asking your name.' : 'They still remember you. The ale is still terrible.');
    if (kind === 'tourney') {
      if (first && GRADES.indexOf(T.to) > GRADES.indexOf(S.rankFloor || 'E')) {
        S.rankFloor = T.to; S.rank = GRADES.indexOf(T.to) > GRADES.indexOf(S.rank) ? T.to : S.rank;
        sfx('level'); await narr(`The judges confer. Then Brom stamps your Guild card himself, grinning: ${T.to}-RANK. "Tournament promotion," he says. "Earned on the sand."`);
        if (T.to === 'S') await say('cael', 'anger', '…Remember my face, rookie. Next time I won\'t be holding back.');
        UI.hud();
      } else await narr('Another cup for the Guild hall shelf. Brom has started running out of shelf.');
    }
    if (typeof Quests !== 'undefined') Quests.event('event', kind);
    save(); UI.hud();
  }
};
// the Guild card never drops below a tournament promotion
(function () { const _rc = Story.rankCheck; Story.rankCheck = function () { _rc && _rc(); const S = G.S; if (S && S.rank && S.rankFloor && GRADES.indexOf(S.rankFloor) > GRADES.indexOf(S.rank)) S.rank = S.rankFloor; }; })();

// heralds: an Imperial crier in Ashford, a tournament steward in the Guild hall, a Warcry herald at Varro's camp
(function () {
  const add = (scene, mk) => { const sc = SCENES[scene]; if (!sc) return; const o = sc.npcs ? sc.npcs.bind(sc) : () => []; sc.npcs = function () { const L = o(); const n = mk(); if (n) L.push(n); return L; }; };
  CHAR.crier = { name: 'Imperial Crier', sprite: 'guard' }; CHAR.steward = { name: 'Tournament Steward', sprite: 'sylwen' }; CHAR.wherald = { name: 'Warcry Herald', sprite: 'bandit' };
  add('ashford', () => G.S.rank ? { id: 'crier', sprite: 'guard', x: 33, y: 22, dir: 'down', talk: async () => {
    await say('crier', null, 'HEAR YE! The Colosseum of Aurel seeks gladiators of every race! Glory! Gold! The Emperor\'s own eye upon you! Carriage leaves daily — thirty gold!');
    const c = await ask(null, null, 'Take the carriage to Aurel? (30g)', ['Go to the Colosseum', 'Not today']); if (c === 0) await Events.open('colosseum');
  } } : null);
  add('a_guild', () => ({ id: 'steward', sprite: 'sylwen', x: 12, y: 5, dir: 'left', talk: async () => {
    await say('steward', null, 'The Guild Tournament! Every rank has its cup. Win yours and the Headmaster stamps your promotion on the spot.');
    await Events.open('tourney');
  } }));
  add('woods', () => G.S.rank && G.S.f.rookBeaten ? { id: 'wherald', sprite: 'bandit', x: 38, y: 17, dir: 'right', talk: async () => {
    await say('wherald', null, 'WARCRY! WAAARCRY! Varro Kade\'s festival is on, friend! Fight for coin, fight for blood, fight so the Eight know your name!');
    await Events.open('warcry');
  } } : null);
})();
