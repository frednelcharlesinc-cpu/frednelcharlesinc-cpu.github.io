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
const WORLD = {
  empire: {
    title: 'The Empire of Veyl', blurb: 'The Crown rules from Aurel, the white capital. Its army answers to one Grand General, and beneath him stand the Four Pillars — each one SSS, each one a nation\'s worth of power in one body.',
    people: [
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
    title: 'The Eight Bandit Kings', blurb: 'Outside the Crown\'s roads, the land belongs to whoever can hold it. Eight have held their territories for years — every one of them SSS. They hate the Crown, each other, and anyone who forgets to pay.',
    people: [
      { id: 'hound', name: 'Varro Kade', tag: 'the Gilded Hound', tier: 'SSS', territory: 'The Ashen River toll-roads (the eastern vale, Ashford\'s woods)', need: 'houndKnown',
        text: 'Charming, perfumed, and owns every bridge between Ashford and the coast. Laughs often. Collects tolls in gold, favors, and fingers.', agenda: 'To buy a noble title from the Crown and become what he robs.', under: 'Rook (his runner in the east woods) · Madame Tuck, the toll-keeper' },
      { id: 'brine', name: 'Iska Brine', tag: 'Mother Brine', tier: 'SSS', territory: 'Saltreach — the pirate coast', need: 'kingsKnown',
        text: 'Calls every one of her pirates "child." Shelters runaways, Drags included, then works them like mules. Drowns traitors personally.', agenda: 'A free port no Crown can tax, no Inquisition can enter.', under: 'Captain Gull · the Tide-Sisters' },
      { id: 'saint', name: 'Abbot Merrow', tag: 'the Hollow Saint', tier: 'SSS', territory: 'The Dustveil Wastes', need: 'kingsKnown',
        text: 'Leads the only people in the world who truly worship Fratenaptor. Every Drag hanged in a market square was hanged because of men like him.', agenda: 'To feed enough D-stones to the tomb-mountains that the dragon wakes.', under: 'The Ashen Choir · Brother Hask' },
      { id: 'grimtusk', name: 'Hrok Grimtusk', tag: 'the Tusk King', tier: 'SSS', territory: 'The Fanglands — the northern steppe', need: 'kingsKnown',
        text: 'A beast-folk warlord with a code of honor older than the Empire. Respects strength, despises cowards, keeps every promise.', agenda: 'To take back the steppe the Crown burned his people off of. The enemy of his enemy might be a Drag.', under: 'The Howling Hundred · his daughter Kesra' },
      { id: 'knife', name: 'Lysandra Voe', tag: 'the Velvet Knife', tier: 'SSS', territory: 'The Greyspire undercity', need: 'knifeKnown',
        text: 'Sells secrets, poisons and passage. Runs the city beneath the citadel where the Drag children were taken. Plays every side, loses to none.', agenda: 'Leverage over everyone. She already knows where Ilya is. The question is her price.', under: 'The Gloves · a broker called Wick' },
      { id: 'ash', name: 'Corvin Ash', tag: 'King Ash', tier: 'SSS', territory: 'Cinderfall — the burned mining hills', need: 'kingsKnown',
        text: 'A deserter from the Imperial army who set his own fort on fire on the way out. Fire-born, furious, and loved by the miners he freed.', agenda: 'To bring the Crown down by any means. Everything Kairo could become, twenty years older.', under: 'The Cinder Brigade · Old Mags' },
      { id: 'twins', name: 'Sable & Sorrel', tag: 'the Thornwall Twins', tier: 'SSS', territory: 'The Thornwall highways (the western forests)', need: 'kingsKnown',
        text: 'Two kings, one throne, one forest. Brother and sister. Inseparable, and each one has tried to kill the other at least twice.', agenda: 'Each wants the whole crown. Whoever helps one wins the other\'s undying hate.', under: 'The Briar Riders' },
      { id: 'gallows', name: 'Bertrand Gall', tag: 'Old Gallows', tier: 'SSS', territory: 'The Rotmarsh', need: 'kingsKnown',
        text: 'The oldest of the eight. Half-mad, once an Imperial hangman. Collects the Crown\'s bounty on green eyes and has never once been paid in anything but gold.', agenda: 'Profit from the hunt. To him a Drag is a coin with legs.', under: 'The Noose-men · his "sons"' }
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
    <p class="muted">Your Guild rank: ${G.S.rank ? `<b style="color:${TIER_COL[G.S.rank]}">${G.S.rank}</b> · ${G.S.rp || 0} RP` : 'unregistered'}</p></div>`;
  for (const k of ['empire', 'kings', 'guild']) {
    const W = WORLD[k];
    h += `<div class="stat" style="margin-bottom:6px"><h3>${W.title}</h3><p class="muted">${W.blurb}</p></div>`;
    for (const p of W.people) {
      if (!known(p)) { h += `<div class="stat lore locked" style="margin-bottom:6px"><h3>??? <span class="muted">· ${p.tier}</span></h3><p class="muted">${p.territory ? 'Territory: ' + p.territory : 'You haven\'t heard this name yet.'}</p></div>`; continue; }
      h += `<div class="stat lore" style="margin-bottom:6px"><h3>${p.name} <span style="color:${TIER_COL[p.tier]}">· ${p.tier}</span></h3><p class="muted">${p.tag}${p.element ? ' · ' + p.element : ''}${p.territory ? '<br>Territory: ' + p.territory : ''}</p><p>${p.text}</p>${p.agenda ? `<p><b>Agenda:</b> ${p.agenda}</p>` : ''}${p.under ? `<p class="muted"><b>Underlings:</b> ${p.under}</p>` : ''}</div>`;
    }
  }
  return h;
}
