/* ================= THE SUNHIGH FESTIVAL — lore & tavern talk =================
   The great midsummer festival of the continent. Seven days, one city, everyone. */
const SUNHIGH = {
  title: 'The Sunhigh Festival',
  blurb: 'Once a year, at midsummer, the whole continent of Veyrath stops for seven days and goes to Highmark. The Bell Concord hosts it, the Crown pays for it, and the Bandit Kings swear not to ruin it. It is the only week of the year when a peasant, a prince and a pirate can sit in the same arena and cheer for the same fighter.',
  parts: [
    ['The Bell Truce', 'When Seraphine rings the great bell on the first morning, the Truce begins. For seven days no blade may be drawn in anger outside the arena: not by the Crown, not by the Inquisition, not by the Eight Kings. Breaking it is the one crime every power on the continent agrees to hang you for.'],
    ['Who comes', 'Everyone. Farmhands walk for a month to get there. Nobles rent whole streets. The Prince-Regent sits in the Crown Box under a white canopy, with his younger brother, the heir, three seats away, and they do not speak. The Eight Bandit Kings come in disguise, and everyone pretends not to recognise them.'],
    ['The seats', 'The Sun Stands are free and packed with peasants, who bring bread, onions and opinions. The Silk Boxes belong to the nobles and the guilds. The Crown Box is for royalty. The Shade, a row of covered seats nobody admits to owning, is where the Bandit Kings sit.'],
    ['The Grand Tourney', 'The heart of the festival. Every guild under the Concord sends its champions. Seven days of duels, team battles and Gate Runs, ending in the Sunhigh Final on the longest day of the year. The winner is given the Sunhigh Crown, a circlet of gold leaves, and one Boon: any request the Concord can grant.'],
    ['The Peasant\'s Melee', 'On the third day the arena is opened to anyone with a stick and nerve. No guild card needed. Whoever is left standing wins a year\'s bread for their village and a seat in the Silk Boxes for the final. Half the Guild\'s great names started here.'],
    ['The Night of Lanterns', 'On the last night, a hundred thousand paper lanterns go up over Highmark, one for every name lost to the Gates that year. The city goes quiet. Even the Inquisition takes its hoods off.'],
    ['The rule nobody says out loud', 'The Peasant\'s Melee is open to anyone. The Grand Tourney is open to any licensed guild. In the whole history of the Sunhigh Festival, no Drag has ever stood in the arena. Nobody wrote that rule down. Nobody needed to.']
  ]
};
GOSSIP.sunhigh = { label: 'The Sunhigh Festival', talks: [
  [['A', 'Sunhigh\'s coming. Midsummer. Seven days in Highmark and the whole continent goes.'], ['B', 'Even the Bandit Kings?'], ['A', 'ESPECIALLY the Bandit Kings. They sit in the Shade with hats on and everyone pretends not to know.']],
  [['B', 'Walked to Sunhigh once. Took me twenty-six days. Saw the Final from the Sun Stands with an onion in each hand.'], ['C', 'Was it worth it?'], ['B', 'Gideon Varga caught a man with his shield. Thrown off the arena wall. Caught him, set him down, said "careful." Yes. It was worth it.']],
  [['C', 'The Bell Truce is the only law I\'ve ever seen everyone obey. Inquisitors, pirates, Imperial knights. Seven days, no blades.'], ['A', 'And on the eighth day?'], ['C', 'On the eighth day everyone leaves Highmark VERY fast.']],
  [['A', 'Winner gets the Sunhigh Crown and a Boon. Anything the Concord can give.'], ['B', 'Anything?'], ['A', 'One year a dwarf asked for a mountain. They gave him a mountain.'], ['me', '(…Anything the Concord can give. Like a charter.)']],
  [['B', 'My cousin won the Peasant\'s Melee with a frying pan. A YEAR of bread for the whole village.'], ['C', 'And then?'], ['B', 'Guild signed her the same night. She\'s B-rank now. Still uses the pan.']],
  [['C', 'The Prince-Regent and his little brother sat three seats apart for the whole Final last year. Didn\'t say one word.'], ['A', 'Heard the heir cheered for the Undertow and the Regent cheered for Pale Mercy.'], ['C', 'Then whoever won, one of them lost.']],
  [['A', 'Cael Ardent took the Sunhigh Crown at eighteen. Youngest ever.'], ['B', 'What did he ask for as his Boon?'], ['A', 'Nobody knows. The Concord sealed it.'], ['B', '…That\'s never happened before.']],
  [['B', 'Night of Lanterns is the bit I go for. One lantern for every name lost in a Gate.'], ['C', 'Last year they say there were nine thousand more than the year before.'], ['B', 'The Gates are getting hungrier.']],
  [['C', 'No Drag has ever fought at Sunhigh. Not in the Melee, not in the Tourney.'], ['A', 'They\'re not banned.'], ['C', 'No. They\'re just… never there.'], ['me', '(Not yet.)']]
] };
(function () {
  if (typeof worldMenuHTML !== 'function') return;
  const _w = worldMenuHTML;
  worldMenuHTML = function () {
    const h = _w.apply(this, arguments);
    const S = `<div class="stat" style="margin-bottom:6px"><h3 style="color:#ffd36a">☀ ${SUNHIGH.title}</h3><p class="muted">${SUNHIGH.blurb}</p></div>` +
      SUNHIGH.parts.map(([t, d]) => `<div class="stat lore" style="margin-bottom:6px"><h3 style="color:#ffe7a0">${t}</h3><p>${d}</p></div>`).join('');
    const at = h.indexOf('<div class="stat" style="margin-bottom:6px"><h3>Legends</h3>');
    return at >= 0 ? h.slice(0, at) + S + h.slice(at) : h + S;
  };
})();
