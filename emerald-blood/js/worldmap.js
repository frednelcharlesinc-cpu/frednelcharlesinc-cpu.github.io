'use strict';
/* ================= THE CONTINENT: world map, landmarks, fast travel ================= */
const MAPLOC = [
  // ---- the great powers
  { id: 'aurel', name: 'Aurel, the White Capital', kind: 'capital', x: .47, y: .45, text: 'Seat of the Empire of Veyl and Emperor Lucan Aurel. White walls, golden domes, and the greatest arena in the world — the Colosseum, where gladiators from every race fight for gold and the Emperor\'s favour.', event: 'colosseum' },
  { id: 'bellhaven', name: 'Bellhaven, City of the Bell', kind: 'city', x: .44, y: .79, text: 'The tourist jewel of the continent and home of the Adventurers\' Guild Citadel. Pilgrims come to hear Seraphine\'s great bell; adventurers come for the Guild\'s grand tournaments. Neutral ground — no Crown soldier may draw steel inside its walls.', event: 'tourney' },
  { id: 'veylfields', name: 'The Veyl Heartland', kind: 'home', x: .60, y: .40, text: 'Homeland of humankind: wheat fields, mill towns and Imperial roads. Every road leads to Aurel, and every road has a toll.' },
  // ---- the Eight Bandit Kings
  { id: 't_hound', name: 'The Ashen River Toll-Roads', kind: 'territory', x: .64, y: .58, text: 'Varro Kade\'s territory — every bridge from Aurel to the sea. His Warcry Festival is held at the East Woods camp.', event: 'warcry', king: 'hound' },
  { id: 't_brine', name: 'Saltreach, the Pirate Coast', kind: 'territory', x: .92, y: .52, text: 'Mother Brine\'s free port. Drags who reach the sea come here — and work off their passage.', king: 'brine' },
  { id: 't_ash', name: 'Cinderfall', kind: 'territory', x: .72, y: .21, text: 'Burned mining hills ruled by King Ash. The lake at its heart is still warm from the fort he set on fire.', king: 'ash' },
  { id: 't_saint', name: 'The Dustveil Wastes', kind: 'territory', x: .31, y: .86, text: 'Desert of the Hollow Saint and his Ashen Choir, who worship Fratenaptor and pray for the dragon to wake.', king: 'saint' },
  { id: 't_grimtusk', name: 'The Fanglands', kind: 'territory', x: .47, y: .16, text: 'The northern steppe of the Tusk King and the exiled beast-folk. Homeland of beast-folk in exile.', king: 'grimtusk' },
  { id: 't_knife', name: 'Greyspire & the Undercity', kind: 'territory', x: .90, y: .27, text: 'The black citadel where the Drag children were taken, and the city of secrets beneath it — the Velvet Knife\'s kingdom.', king: 'knife' },
  { id: 't_twins', name: 'The Thornwall', kind: 'territory', x: .30, y: .29, text: 'Endless western forest held by the exiled dwarf twins Sable and Sorrel and their Briar Riders.', king: 'twins' },
  { id: 't_gallows', name: 'The Rotmarsh', kind: 'territory', x: .21, y: .45, text: 'Fog, gallows and bog — Old Gallows\' marsh, where Drag bounties are paid in gold.', king: 'gallows' },
  // ---- homelands of the races
  { id: 'ironroot', name: 'The Ironroot Holds', kind: 'home', x: .12, y: .30, text: 'Mountain kingdoms of the dwarves. Some holds were sold to the Crown for their D-stones — and buried with everyone inside.' },
  { id: 'frostfell', name: 'Frostfell', kind: 'home', x: .21, y: .13, text: 'Glacier halls of the giant clans, who drive out anyone not pure giant — including their own children.' },
  { id: 'sylvarin', name: 'Sylvarin, the Floating Forest', kind: 'home', x: .21, y: .59, text: 'Homeland of the elves: a whole forest that floats on raw D-stone above the Cataclysm. The elves say they hold the sky up. They are not sure it\'s a joke.' },
  { id: 'hearth', name: 'The Hearthdowns', kind: 'home', x: .58, y: .88, text: 'Rolling green hills of the halflings. Small doors, big dinners, and a surprising number of retired adventurers.' },
  { id: 'drowned', name: 'The Drowned Isles', kind: 'home', x: .95, y: .82, text: 'Reef homeland of the tidefolk — what is left of it after the Crown took the reefs.' },
  // ---- wonders and dangers
  { id: 'cataclysm', name: 'The Cataclysm', kind: 'landmark', x: .20, y: .67, text: 'A burning wound in the world where Fratenaptor once fell. The most dangerous land alive: monsters no Guild rank can list — and dragons. Real ones.' },
  { id: 'tomb', name: 'The Tomb of Fratenaptor', kind: 'landmark', x: .85, y: .58, text: 'The tomb-mountains where the Seven Elders chained the demon dragon. Every D-stone ever found was broken from these peaks. Thornvale hid in their shadow.' },
  { id: 'realm', name: 'The Realm of No Return', kind: 'landmark', x: .80, y: .41, text: 'The forbidden frozen forest where the mana is poison and maps stop working. Vane taught you here for five years. Nobody else has ever come back.', scene: ['realm', 22, 14, 'down'] },
  { id: 'auremund', name: 'Auremund (legend)', kind: 'landmark', x: .27, y: .92, text: 'Somewhere under the Dustveil sand, if the songs are true: the City That Swallowed the Sun. Every adventurer\'s dream. Searching for it is a hanging offence.' },
  // ---- villages & places you have been
  { id: 'thornvale', name: 'Thornvale (ruins)', kind: 'village', x: .82, y: .66, text: 'Your village. A hidden Drag valley in the Tomb Mountains. Burned by Dread and the Inquisition.' },
  { id: 'ashford', name: 'Ashford Hollow', kind: 'village', x: .70, y: .70, text: 'A market village on the Ashen River with a Guild branch hall, an inn, and a lot of people who hate green eyes.', scene: ['ashford', 53, 12, 'down'] },
  { id: 'woods', name: 'The East Woods', kind: 'village', x: .755, y: .735, text: 'Lupines, goblins, a shrine, a spring — and Varro Kade\'s toll camp, where his Warcry Festival is held.', scene: ['woods', 3, 17, 'right'], event: 'warcry' },
  { id: 'mill', name: 'The Old Mill', kind: 'village', x: .69, y: .64, text: 'North of Ashford. The Inquisition used it as a cage-house for Drag children.', scene: ['mill', 17, 24, 'up'] },
  { id: 'millbrook', name: 'Millbrook', kind: 'village', x: .55, y: .52, text: 'A sleepy river village on the road to Aurel. (Not yet reachable.)' },
  { id: 'kettle', name: 'Kettlebrook', kind: 'village', x: .40, y: .66, text: 'Farming village in the southern woods. (Not yet reachable.)' },
  // ---- dungeons
  { id: 'dg_warren', name: 'The Goblin Warren', kind: 'dungeon', x: .775, y: .715, text: 'Rank E dungeon in the East Woods.', scene: ['woods', 43, 8, 'down'], dungeon: 'd_warren' },
  { id: 'dg_crypt', name: 'The Sunken Crypt', kind: 'dungeon', x: .675, y: .685, text: 'Rank D dungeon beneath the ruined chapel by Ashford.', scene: ['ashford', 7, 3, 'down'], dungeon: 'd_crypt' },
  { id: 'dg_mire', name: 'The Drowned Mine', kind: 'dungeon', x: .665, y: .62, text: 'Rank C dungeon beside the Old Mill.', scene: ['mill', 5, 5, 'down'], dungeon: 'd_mire' },
  { id: 'dg_crystal', name: 'The Crystal Hollow', kind: 'dungeon', x: .72, y: .665, text: 'Rank B dungeon in the old quarry north-east of Ashford.', scene: ['ashford', 51, 3, 'down'], dungeon: 'd_crystal' },
  { id: 'dg_spine', name: 'The Dragonspine Caverns', kind: 'dungeon', x: .16, y: .72, text: 'Lava caves under the Cataclysm where dragons nest. (Far beyond you. For now.)' },
  { id: 'dg_vault', name: 'The Drowned Vault', kind: 'dungeon', x: .97, y: .88, text: 'A sunken tidefolk temple. (Not yet reachable.)' }
];
const KIND = { capital: ['♛', '#ffd34a'], city: ['🔔', '#d6a8ff'], village: ['⌂', '#e8dcc0'], territory: ['⚔', '#ff7a6a'], home: ['✦', '#9fe4ff'], landmark: ['◈', '#ff9a52'], dungeon: ['☗', '#c8a0ff'] };

const Travel = {
  unlocked() { return !!(G.S && G.S.rank && !G.S.kid); },
  visited(id) { const L = MAPLOC.find(l => l.id === id); if (!L || !L.scene) return false; return !!(G.S.visited && G.S.visited[L.scene[0]]) && (!L.dungeon || (G.S.visited[L.dungeon])); },
  canFrom() { const m = G.S.map; return ['ashford', 'woods', 'mill'].includes(m) || (SCENES[m] && SCENES[m].map && G.S.ret && ['ashford', 'woods', 'mill'].includes(G.S.ret.map)); },
  async go(id) {
    const L = MAPLOC.find(l => l.id === id); if (!L || !L.scene) return;
    if (!this.canFrom()) { toast('You can only fast travel from the Ashford region.'); return; }
    UI.closeMenu(); const [m, x, y, dir] = L.scene;
    if (Mounts.cur()) toast(Mounts.cur().fly ? `You fly to <b>${L.name}</b> on your ${Mounts.cur().name}.` : `You ride to <b>${L.name}</b>.`, 2200);
    await World.go(m, x, y, dir); banner(L.name, '', 1600);
  }
};
// remember every map you have stood on
(function () { const _l = World.load.bind(World); World.load = async function (name, x, y, dir) { G.S.visited = G.S.visited || {}; G.S.visited[name] = 1; return _l(name, x, y, dir); }; })();

let mapSel = null;
function mapMenuHTML() {
  const S = G.S;
  const known = L => L.kind !== 'territory' || !L.king || true;
  const pins = MAPLOC.map(L => { const [ic, col] = KIND[L.kind]; const here = L.scene && L.scene[0] === S.map;
    const big = ['capital', 'city', 'territory', 'landmark'].includes(L.kind) || L.id === 'sylvarin';
    return `<button class="pin ${mapSel === L.id ? 'on' : ''} ${big ? 'big' : ''}" data-pin="${L.id}" style="left:${L.x * 100}%;top:${L.y * 100}%;--pc:${col}"><span>${ic}</span>${big ? `<em>${L.name.split(',')[0]}</em>` : ''}${here ? '<i>YOU</i>' : ''}</button>`; }).join('');
  let info = '<p class="muted">Tap a place on the map.</p>';
  if (mapSel) {
    const L = MAPLOC.find(l => l.id === mapSel); const king = L.king && WORLD.kings.people.find(p => p.id === L.king);
    let btns = '';
    if (L.scene) btns += Travel.unlocked() ? (Travel.visited(L.id) ? `<button class="btn" data-ft="${L.id}">Fast travel</button>` : '<span class="muted">Visit it on foot first to unlock fast travel.</span>') : '<span class="muted">Fast travel opens once you join the Guild.</span>';
    if (L.event) btns += ` <button class="btn" data-ev="${L.event}">${{ colosseum: 'Enter the Colosseum', tourney: 'Guild Tournament', warcry: 'Warcry Festival' }[L.event]}</button>`;
    info = `<h3 style="color:${KIND[L.kind][1]}">${KIND[L.kind][0]} ${L.name}</h3><p>${L.text}</p>${king ? `<p class="muted">Bandit King: <b>${G.S.f[king.need] || !king.need ? king.name + ' — ' + king.tag : '???'}</b></p>` : ''}<div class="btnrow">${btns}</div>`;
  }
  const mt = Mounts.cur();
  return `<div class="wmap"><img src="assets/worldmap.jpg" alt="map">${pins}</div><div class="stat" style="margin-top:6px">${info}</div>
    <div class="stat" style="margin-top:6px"><p class="muted">${Travel.unlocked() ? 'Fast travel: <b style="color:#7dffb0">open</b>' : 'Fast travel: locked until you register at the Adventurers\' Guild.'} · Mount: <b>${mt ? mt.name : 'none'}</b> · Fame <b>${G.S.fame || 0}</b> · Notoriety <b>${G.S.notoriety || 0}</b></p></div>`;
}
function bindMapMenu() {
  $$('#menuCard [data-pin]').forEach(b => bindTap(b, () => { mapSel = b.dataset.pin; sfx('blip'); UI.renderMenu(); }));
  $$('#menuCard [data-ft]').forEach(b => bindTap(b, () => Story.run(() => Travel.go(b.dataset.ft))));
  $$('#menuCard [data-ev]').forEach(b => bindTap(b, () => { UI.closeMenu(); Story.run(() => Events.open(b.dataset.ev, 'map')); }));
}
