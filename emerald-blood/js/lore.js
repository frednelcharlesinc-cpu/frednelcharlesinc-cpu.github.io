'use strict';
/* ================= THE WORLD: powers, tiers, and the people who hold them =================
   Entries unlock as Ren learns of them (flag in `need`). The codex lives in the pause menu → World. */
const TIERS = [
  ['E', 'Feels mana, barely shapes it. Every adventurer starts here.'],
  ['D', 'An element answers when called. A trained fighter.'],
  ['C', 'One element mastered. Worth a whole town militia.'],
  ['B', 'Elites. Inquisitors, captains, monster hunters.'],
  ['A', 'One in ten thousand. Armies notice when you arrive.'],
  ['S', 'A legend in one kingdom. Songs get written.'],
  ['SS', 'A legend in every kingdom. Wars are planned around you.'],
  ['SSS', 'A walking catastrophe. Fewer than twenty live. The Four Pillars, the Eight Bandit Kings, the Guild\'s Headmaster.'],
  ['SSSS', 'One name. Dread.']
];
const BALANCE = 'Three powers hold the continent in balance. <b>The Empire of Veyl</b> rules the roads, the cities and the law. <b>The Adventurers\' Guild</b> answers to no crown and keeps the monsters back. <b>The Eight Bandit Kings</b> hold everything in between. None of them can beat the other two — so for a hundred years, none of them has tried. But the new Emperor is ambitious.';
const WORLD = {
  empire: {
    title: 'The Empire of Veyl', blurb: 'The Crown rules from Aurel, the white capital. Its army answers to one Grand General, and beneath him stand the Four Pillars — each one SSS, each one a nation\'s worth of power in one body.',
    people: [
      { id: 'emperor', name: 'Emperor Lucan Aurel', tag: 'Third of his name · "the Sun That Does Not Set"', tier: '?',
        text: 'Young for an emperor, brilliant, and patient. He inherited a throne that shares the continent with the Guild and the Eight, and he has never accepted it. Nobody has seen him fight. Nobody knows his tier.',
        agenda: 'To end the balance. Crush the Eight, swallow the Guild, and own every D-stone in the world. The Registry, the stone quarries and the hunt for the Dragonoid are all one plan — his.' },
      { id: 'dread', name: 'Dread', tag: 'Grand General · "the Black Sun"', tier: 'SSSS', need: 'raid',
        text: 'Commander of every Imperial army. Never speaks above a few words. Carries Gravecleaver, a black greatsword longer than a man. Vane swears his eyes are green.' },
      { id: 'caspian', name: 'Caspian Thorne', tag: 'First Pillar · "the Sword Unbowed"', tier: 'SSS', element: 'Wind', need: 'caspianKnown',
        text: 'Vane\'s FIRST apprentice. The most gifted student the Sword Saint ever had — and the one who walked out on him for a seat beside the throne. It was Caspian who told the Crown exactly how Vane fought, the night before Dread took his arm.',
        agenda: 'To prove he surpassed his master. He has never stopped looking for the old man\'s grave — or for the student who replaced him.', under: 'The Wind Lances (Imperial duelist corps)' },
      { id: 'ysolde', name: 'Ysolde Marr', tag: 'Second Pillar · "the Lantern"', tier: 'SSS', element: 'Light', need: 'ysoldeKnown',
        text: 'High General of the Ember Inquisition. Halvard\'s commander. Gentle voice, perfect manners, and a sincere belief that every Drag alive is a spark waiting to become Fratenaptor.',
        agenda: 'To end the "Drag question" forever, before the Dragonoid returns. She believes she is saving the world. That is what makes her dangerous.', under: 'Inquisitor Halvard (B) · the White Choir' },
      { id: 'gorran', name: 'Gorran Ironvein', tag: 'Third Pillar · "the Mountain"', tier: 'SSS', element: 'Earth', need: 'gorranKnown',
        text: 'A dwarf siege-lord who has never lost a fortress or held a grudge. He is strip-mining the tomb-mountains for D-stones, and he does not care whose valley is in the way.',
        agenda: 'Stones. Only stones. A Crown that owns every D-stone owns the world — and Gorran means to be the one holding the ledger.', under: 'The Deep Battalions · Registry quarry-camps' },
      { id: 'sereth', name: 'Sereth Vael', tag: 'Fourth Pillar · "the Quiet Tide"', tier: 'SSS', element: 'Water / Ice', need: 'serethKnown',
        text: 'An elf spymaster who runs the Crown Registry. Every seal on every legal D-stone passes through her hands. Soft-spoken. Never seen angry. Never seen surprised.',
        agenda: 'Secretly studying the Dragonoid. The Registry\'s "confiscated" Drag children do not all go to Inquisition camps.', under: 'The Registry Wardens · the Silent Office' }
    ]
  },
  kings: {
    title: 'The Eight Bandit Kings', blurb: 'Outside the Crown\'s roads, the land belongs to whoever can hold it. Eight have held their territories for years — every one of them SSS. Three are Drags. One is human. The other four are exiles of races that were driven out of their homelands — by the Crown, or by their own people. They hate the Crown, each other, and anyone who forgets to pay. Together they are the reason the Emperor has never ruled the whole continent.',
    people: [
      { id: 'hound', name: 'Varro Kade', tag: 'the Gilded Hound', race: 'Human', tier: 'SSS', territory: 'The Ashen River toll-roads (the eastern vale, Ashford\'s woods)', need: 'houndKnown',
        text: 'Charming, perfumed, never without a smile or a plain black-sheathed sword at his hip. Owns every bridge between Ashford and the coast and collects tolls in gold and favors. Raised by a river-port singer who never told him his father\'s name. He taught himself the sword — and somehow, the way he draws it looks exactly like a style he has never seen.',
        agenda: 'Officially: to buy a noble title from the Crown and become what he robs. Privately: to find the swordsman who walked out of his mother\'s life forty years ago — and ask him why.', under: 'Rook (his runner in the east woods) · Madame Tuck, the toll-keeper',
        secret: { need: 'varroSon', text: 'Varro Kade is Vane\'s son. Vane never knew he existed.' } },
      { id: 'brine', name: 'Iska Brine', tag: 'Mother Brine', race: 'Drag', tier: 'SSS', territory: 'Saltreach — the pirate coast', need: 'kingsKnown',
        text: 'A Drag who hides her green eyes behind smoked-glass spectacles and dares anyone to ask. Calls every one of her pirates "child." Shelters runaways — Drags first — then works them like mules. Drowns traitors personally.',
        agenda: 'A free port no Crown can tax and no Inquisition can enter: a home for every Drag who can reach the sea.', under: 'Captain Gull · the Tide-Sisters' },
      { id: 'ash', name: 'Corvin Ash', tag: 'King Ash', race: 'Drag', tier: 'SSS', territory: 'Cinderfall — the burned mining hills', need: 'kingsKnown',
        text: 'Hid his green eyes behind tinted lenses for twenty years and rose to captain in the Imperial army. The night he was ordered to burn a Drag village, he burned his own fortress instead and walked out through the fire. Furious, fire-scarred, and loved by the miners he freed.',
        agenda: 'To bring the Crown down by any means. Everything Kairo could become, twenty years older.', under: 'The Cinder Brigade · Old Mags' },
      { id: 'saint', name: 'Abbot Merrow', tag: 'the Hollow Saint', race: 'Drag', tier: 'SSS', territory: 'The Dustveil Wastes', need: 'kingsKnown',
        text: 'A Drag who believes his people are Fratenaptor\'s children — and that the chains the Seven Elders forged are the real crime. His followers are the only people alive who truly worship the dragon. Every Drag hanged in a market square was hanged because men like him exist.',
        agenda: 'To feed enough D-stones to the tomb-mountains that the dragon wakes and "frees its children." Ren\'s darkest mirror.', under: 'The Ashen Choir · Brother Hask' },
      { id: 'grimtusk', name: 'Hrok Grimtusk', tag: 'the Tusk King', race: 'Beast-folk (exiled)', tier: 'SSS', territory: 'The Fanglands — the northern steppe', need: 'kingsKnown',
        text: 'A tusked beast-folk warlord whose people were burned off the green steppe by the Crown and pushed into the frozen north. Has a code of honor older than the Empire. Respects strength, despises cowards, keeps every promise.',
        agenda: 'To take back the steppe. The enemy of his enemy might be a Drag.', under: 'The Howling Hundred · his daughter Kesra' },
      { id: 'knife', name: 'Lysandra Voe', tag: 'the Velvet Knife', race: 'Elf (exiled)', tier: 'SSS', territory: 'The Greyspire undercity', need: 'knifeKnown',
        text: 'Cast out of the elven courts of Sylvarin three hundred years ago for a murder she still won\'t discuss. Built a second kingdom in the city beneath the citadel where the Drag children were taken. Sells secrets, poisons and passage. Plays every side, loses to none.',
        agenda: 'Leverage over everyone. She already knows where Ilya is. The question is her price.', under: 'The Gloves · a broker called Wick' },
      { id: 'twins', name: 'Sable & Sorrel', tag: 'the Thornwall Twins', race: 'Dwarves (exiled)', tier: 'SSS', territory: 'The Thornwall highways (the western forests)', need: 'kingsKnown',
        text: 'Two dwarves, one throne. Their clan\'s mountain hold was sold to the Crown for its D-stones — by Gorran Ironvein — and every dwarf who refused to leave was buried in it. They now rule a forest, under a sky they hate. Inseparable, and each has tried to kill the other at least twice.',
        agenda: 'Each wants the whole crown. Both want Gorran\'s head. Whoever helps one wins the other\'s undying hate.', under: 'The Briar Riders' },
      { id: 'gallows', name: 'Bertrand Gall', tag: 'Old Gallows', race: 'Half-giant (exiled)', tier: 'SSS', territory: 'The Rotmarsh', need: 'kingsKnown',
        text: 'Half giant, half human — driven out of the Frostfell giant clans as a mongrel and never welcome among men. Spent thirty years as the Empire\'s hangman because it was the only job that would have him. Half-mad now. Collects the Crown\'s bounty on green eyes and has never once been paid in anything but gold.',
        agenda: 'Profit from the hunt. To him a Drag is a coin with legs — and the three Drag kings are the biggest coins of all.', under: 'The Noose-men · his "sons"' }
    ]
  },
  guild: {
    title: 'The Adventurers\' Guild', blurb: 'The only power the Crown has never managed to own. Every member, from E to SSS, answers to one woman.',
    people: [
      { id: 'seraphine', name: 'Seraphine Hale', tag: 'Headmaster · "the Unbroken Bell"', tier: 'SSS', element: 'Lightning', need: 'seraphineMet',
        text: 'A half-elf two centuries old who wrote the Guild\'s neutrality pact with her own blood — and enforced it, once, against an entire Imperial legion. When she rings the great bell in the Guild Citadel, wars stop to listen.',
        agenda: 'Officially: to keep the Guild free of every Crown and king. Privately: she was in the Crown\'s vault the night the great stones began to hum. She has been waiting for someone with green eyes ever since.', under: 'Guildmaster Brom (Ashford) · the Bell Wardens' },
      { id: 'vane', name: 'Vane', tag: 'formerly the Sword Saint of the West', tier: 'SSS', need: 'vaneName',
        text: 'Forty years undefeated. One arm, one loss — to Dread. Exiled to the Realm of No Return. Your teacher.', agenda: 'Five years ago: to die quietly. Now: to make sure you don\'t become him.', under: 'His first apprentice: Caspian Thorne. His last: you.' }
    ]
  }
};
function worldMenuHTML() {
  const f = G.S.f;
  const known = p => !p.need || f[p.need];
  let h = `<div class="stat" style="margin-bottom:6px"><h3>Tiers of power</h3>${TIERS.map(([t, d]) => `<p><b style="color:${TIER_COL[t] || '#fff'};display:inline-block;min-width:48px">${t}</b> ${d}</p>`).join('')}
    <p class="muted">Your power: ${Power.badge()} · Guild card: ${G.S.rank ? `<b style="color:${TIER_COL[G.S.rank]}">${G.S.rank}-RANK</b>` : 'unregistered'}</p></div>`;
  h += `<div class="stat" style="margin-bottom:6px"><h3>The Balance of Power</h3><p>${BALANCE}</p></div>`;
  for (const k of ['empire', 'kings', 'guild']) {
    const W = WORLD[k];
    h += `<div class="stat" style="margin-bottom:6px"><h3>${W.title}</h3><p class="muted">${W.blurb}</p></div>`;
    for (const p of W.people) {
      if (!known(p)) { h += `<div class="stat lore locked" style="margin-bottom:6px"><h3>??? <span class="muted">· ${p.tier}</span></h3><p class="muted">${p.territory ? 'Territory: ' + p.territory : 'You haven\'t heard this name yet.'}</p></div>`; continue; }
      h += `<div class="stat lore" style="margin-bottom:6px"><h3>${p.name} <span style="color:${TIER_COL[p.tier] || '#ffd88a'}">· ${p.tier}</span></h3><p class="muted">${p.tag}${p.race ? ' · ' + p.race : ''}${p.element ? ' · ' + p.element : ''}${p.territory ? '<br>Territory: ' + p.territory : ''}</p><p>${p.text}</p>${p.agenda ? `<p><b>Agenda:</b> ${p.agenda}</p>` : ''}${p.under ? `<p class="muted"><b>Underlings:</b> ${p.under}</p>` : ''}${p.secret && f[p.secret.need] ? `<p style="color:#ffd88a"><b>Secret:</b> ${p.secret.text}</p>` : ''}</div>`;
    }
  }
  return h;
}
