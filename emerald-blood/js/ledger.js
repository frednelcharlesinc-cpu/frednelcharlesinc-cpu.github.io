'use strict';
/* ============================================================================
   THE SILENT LEDGER — an intelligence house behind a stationer's counter in Ashford
   (the teal-roofed house on the east lane). It knows things. It sells them for
   ridiculous money. Every dossier is a key to something the story needs —
   and every one of them can ALSO be dug up the hard way, for free, by investigating.
   The more of it you've already found, the less they charge for the rest.
   ========================================================================== */
CHAR.quill = { name: 'Quill, Clerk of the Silent Ledger', sprite: 'elf_m1' };
// monster lords have weaknesses too — the Ledger has them on file
Object.assign(RESIST, {
  rb_grukk: { earth: .5, fire: .7, ice: 1.5, lightning: 1.3 }, lt_snaga: { wind: 1.5 }, lt_hexgrin: { fire: .5, water: 1.5 }, lt_brakk: { physical: .6, lightning: 1.6 }, lt_oldtusk: { earth: .5, ice: 1.5 },
  rb_vesh: { shadow: .2, physical: .8, light: 2, fire: 1.4 }, lt_hollowmark: { physical: .6, light: 1.8 }, lt_bride: { ice: .3, fire: 1.6, light: 1.5 }, lt_ossk: { physical: .7, earth: 1.4, light: 1.6 }, lt_malvric: { shadow: .3, light: 2 },
  rb_vharyx: { fire: .2, earth: .7, water: 1.7, ice: 1.4 }, lt_hrazz: { water: .5, lightning: 1.6 }, lt_emberwing: { fire: .2, water: 1.7, ice: 1.4 }, lt_horror: { water: .4, fire: 1.8 }, lt_kadrak: { physical: .7, wind: 1.5 }
});
const H_ = () => G.S.f;
const DOSSIERS = [
  { id: 'cages', title: 'Where the Cage-Wagons Went', price: 1500,
    show: f => G.S.chapter >= 1 && !f.learnedMill, done: f => !!f.learnedMill,
    clues: [['Maren — the wagons came in on the river road', f => (f.lead || 0) >= 1], ['Oswin the ferryman counted the wheels', f => (f.lead || 0) >= 2], ['The Kettlebrook granary manifest', f => !!f.learnedMill]],
    free: 'Ask Maren in Ashford, then the ferryman Oswin in Millbrook, then find the granary manifest in Kettlebrook.',
    async give() {
      const f = H_();
      await say('quill', null, '"Forty measures of grain, signed by Inquisitor Halvard, to the OLD MILL above Ashford. \'For the keeping of the vessels.\' Vessels, friend. Children."');
      await say('quill', null, '"Green Eclipse bought a cheaper copy of the same ledger last week. It\'s a race. You\'re welcome."');
      f.learnedMill = true; f.lead = 3;
      Intel.add('you', 'The Silent Ledger: grain shipments to the OLD MILL north of Ashford, "for the keeping of the vessels." The children are there.');
      Intel.add('ge', 'Green Eclipse bought the same information. Kairo knows about the Old Mill too.');
      Story.quest(f.kessWait ? 'The cages are at the Old Mill, north of Ashford. Go back to Kess — she promised to get you past Captain Voss.' : 'The cages are at the Old Mill, north of Ashford. Get past Captain Voss on the north road.');
    } },
  { id: 'seal', title: 'The Seal and the Supply Road', price: 2400,
    show: f => f.learnedMill && !f.millDone && !f.sealGot && f.h2 !== 'done', done: f => f.h2 === 'done' || !!f.sealGot,
    clues: [['Old Edda — the choir under the mill', f => f.h1 === 'done'], ['Brother Tam — who carries the Seal', f => f.h2 === 'done']],
    free: 'Save Old Edda from the pyre in Ashford square, then find Brother Tam (Maren knows him).',
    async give() {
      const f = H_();
      await say('quill', null, '"The mill\'s inner door opens for one thing: the Inquisitor\'s Seal. Sister Verity wears it on a chain. She rides the supply road through the East Woods — by the dead oak — every third day."');
      await say('quill', null, '"She\'ll be there tomorrow. So will her Wardens. The Ledger doesn\'t sell courage. Only directions."');
      f.h2 = 'done';
      Intel.add('you', 'The Silent Ledger: the inner door needs the Inquisitor\'s Seal — Sister Verity carries it on the supply road through the East Woods, by the dead oak.');
      Story.quest('Ambush Sister Verity\'s supply convoy on the road through the East Woods and take the Inquisitor\'s Seal.');
    } },
  { id: 'halvard', title: 'How Halvard Fights', price: 3000,
    show: f => f.learnedMill && !f.millDone && !f.ledgerHalvard, done: f => !!f.ledgerHalvard,
    clues: [['Burn his lamp-oil on the supply road', f => !!f.oilBurned]],
    free: 'Burn the convoy\'s lamp-oil when you take the Seal — his Purging Light starves without it. (Then watch him fight, and learn.)',
    async give() {
      const f = H_();
      await say('quill', null, '"Halvard\'s light is oil and faith in equal measure. Starve the oil and the faith flickers. He prays before the big strike — that\'s your window. And his lamp-stone hates WATER."');
      f.ledgerHalvard = 1; f.oilBurned = 1;
      for (const t of ['physical', 'light', 'water', 'fire']) try { Res.learn({ key: 'halvard' }, t); } catch (e) { }
      Intel.add('you', 'The Silent Ledger: Halvard\'s light runs on lamp-oil (now ruined) and faith. He prays before Purging Light. Water douses his lamp-stone.');
    } },
  { id: 'kairo', title: 'What Kairo Is Planning', price: 5000,
    show: f => G.S.chapter >= 1 && (f.coupHint || 0) < 3, done: f => (f.coupHint || 0) >= 3,
    clues: [['Lark lets something slip', f => (f.coupHint || 0) >= 1], ['A second hint from Green Eclipse', f => (f.coupHint || 0) >= 2]],
    free: 'Earn Green Eclipse\'s trust — work alongside them, and listen to Lark.',
    async give() {
      const f = H_();
      await say('quill', null, '"Greyspire Citadel is only the door. Kairo means to strike the Empire itself — on \'a day when the whole Empire looks the wrong way.\'"');
      await say('quill', null, '"A coronation, a funeral, a royal wedding. Something that pulls every eye in the land to one place. He\'s counting the days to it. So should you."');
      f.coupHint = 3;
      Intel.add('ge', 'The Silent Ledger: Kairo plans to strike the Empire on a day when "the whole Empire looks the wrong way" — a coronation, a funeral, a wedding.');
    } },
  { id: 'lords', title: 'The Monster Lords\' Weaknesses', price: 1800,
    show: f => !!G.S.rank && !f.ledgerLords, done: f => !!f.ledgerLords,
    clues: [['Hit a lord or lieutenant with something it hates', f => Object.keys(f.resKnown || {}).some(k => /^(rb_|lt_)/.test(k))]],
    free: 'Learn them in battle: every weakness you strike is remembered.',
    async give() {
      const f = H_(); f.ledgerLords = 1;
      for (const k of Object.keys(RESIST)) if (/^(rb_|lt_)/.test(k)) for (const t of Object.keys(RESIST[k])) Res.learn({ key: k }, t);
      await say('quill', null, '"Gravemaw\'s warlord hates frost. The Pale King burns in light. The Brood Mother drowns. Lieutenants too — it\'s all in here. Every lair, every weakness."');
      toast('Every monster lord\'s and lieutenant\'s weaknesses are now marked in battle.', 3600);
    } },
  { id: 'chests', title: 'Smugglers\' Strongboxes', price: 900,
    show: f => !f.ledgerChests, done: f => !!f.ledgerChests,
    clues: [['Tavern gossip about a hidden strongbox', f => Object.keys(f.chestTip || {}).length > 0]],
    free: 'Pay barkeeps for rumours — smugglers drink, and smugglers brag.',
    async give() {
      const f = H_(); f.ledgerChests = 1; f.chestTip = f.chestTip || {}; let n = 0;
      if (typeof chestRumor === 'function' && typeof CHEST_AREAS !== 'undefined') for (const tk of Object.keys(CHEST_AREAS)) for (let i = 0; i < 8; i++) { const cr = await chestRumor(tk); if (!cr) break; f.chestTip[cr.key] = 1; try { Tav.learn(tk, cr.log); } catch (e) { } n++; }
      await say('quill', null, `"${n || 'Several'} strongboxes nobody came back for. The locations are in your notes now. Don't tell the Registry where you heard it."`);
    } },
  { id: 'prince', title: 'The Queen\'s Secret', price: 50000,
    show: f => G.S.chapter >= 1 && !f.ledgerPrince, done: f => !!f.ledgerPrince,
    clues: [['Royal gossip in the taverns', f => Object.keys(f.tavHeard || {}).some(k => /royal|prince|queen|king/i.test(k))], ['The Prince-Regent\'s name in Halvard\'s mouth', f => !!f.millDone]],
    free: 'Nobody can investigate this one all the way. Not yet. Listen to every rumour about the royal house — and remember who the Inquisition sings for.',
    async give() {
      const f = H_(); f.ledgerPrince = 1;
      await say('quill', null, '"…Fifty thousand. You actually brought it. Sit down."');
      await say('quill', null, '"The year of the fever, the Queen paid one of our couriers in pearls. A boy left Aurel that night in a grain cart, under a new name. The record of the young prince\'s death was written three days BEFORE he \'died\'."');
      await say('quill', null, '"The boy grew up in the south of the vale, among ordinary people. He would be your age now. That is everything the Ledger knows. That is everything anyone knows — except the Queen."');
      Intel.add('you', 'The Silent Ledger: the youngest prince did not die. The Queen smuggled him out of Aurel under a new name. He grew up in the south of the vale — and would be your age now.');
      sfx('level'); toast('<b>The Queen\'s Secret</b> is yours. Some doors in later chapters will open differently now.', 5000);
    } }
];
const Ledger = {
  price(D) { const f = G.S.f, got = D.clues.filter(c => c[1](f)).length; return Math.round(D.price * (1 - .3 * got / Math.max(1, D.clues.length)) / 50) * 50; },
  async talk() {
    const f = G.S.f;
    if (!f.metQuill) {
      f.metQuill = 1;
      await narr('Paper, ink and dust. A thin clerk with ink-stained fingers looks up from a ledger without closing it.');
      await say('quill', null, '"Stationery is at the front. If you came for the OTHER thing, you\'re in the right room. The Silent Ledger sells what people know. It is never cheap, and it is always true."');
      if (!G.S.hood) await say('quill', null, '"Green eyes. Don\'t worry, friend. The Ledger has sold secrets to Drags, to priests and to kings. Your coin is the same colour as theirs."');
    }
    while (true) {
      const L = DOSSIERS.filter(D => D.show(f) || D.done(f) && f['ledgerBought_' + D.id]);
      const open = L.filter(D => !D.done(f));
      if (!open.length) { await say('quill', null, '"Nothing on the shelf for you today. Come back when the world gets more interesting. It always does."'); return; }
      const c = await ask('quill', null, `What do you want to know? (You have ${G.S.gold}g.)`, [...open.map(D => { const got = D.clues.filter(x => x[1](f)).length; return `📜 ${D.title} — ${this.price(D).toLocaleString()}g${got ? ` (you know ${got}/${D.clues.length})` : ''}`; }), 'Leave']);
      if (c < 0 || c >= open.length) return;
      const D = open[c], p = this.price(D);
      const clueTxt = D.clues.map(x => `${x[1](f) ? '✔' : '○'} ${x[0]}`).join('\n');
      await narr(`${D.title}\n${clueTxt}\nThe free way: ${D.free}`);
      const k = await ask('quill', null, `"${p.toLocaleString()} gold. Not a copper less."`, [`Buy it (${p.toLocaleString()}g)`, 'I\'ll dig it up myself']);
      if (k !== 0) { await say('quill', null, '"Suit yourself. The truth is free for anyone patient enough. The Ledger is for everyone else."'); continue; }
      if (G.S.gold < p) { await say('quill', null, `"${p.toLocaleString()}. You have ${G.S.gold}. The Ledger does not do credit, payment plans, or pity."`); continue; }
      G.S.gold -= p; sfx('coin'); UI.hud(); f['ledgerBought_' + D.id] = 1; f.ledgerSpent = (f.ledgerSpent || 0) + p;
      await D.give(); save();
    }
  }
};
// the stationer's on the east lane (the teal-roofed house) IS the Ledger
(function () {
  const sc = SCENES.a_h5; if (!sc) return;
  sc.title = 'Inkwell & Quill — Stationer'; sc.subtitle = 'Paper, ink… and other things';
  sc.npcs = () => { const [x, y] = freeNear(sc.map || 'in_cottage', 5, 3); return [{ id: 'quill', sprite: 'elf_m1', x, y, dir: 'down', name: 'Quill', talk: () => Ledger.talk(), qm: () => DOSSIERS.some(D => D.show(G.S.f) && !D.done(G.S.f)) ? '!' : null }]; };
  // word gets around
  const _ld = World.load.bind(World);
  World.load = async function (name, x, y, dir) {
    const r = await _ld(name, x, y, dir);
    try { if (name === 'ashford' && G.S && !G.S.kid && G.S.chapter >= 1 && !G.S.f.ledgerTip) { G.S.f.ledgerTip = 1; setTimeout(() => toast('Tavern talk: <b>the stationer with the teal roof</b> on Ashford\'s east lane sells more than paper. Information — for a price nobody sane would pay.', 6000), 2500); } } catch (e) { }
    return r;
  };
})();
