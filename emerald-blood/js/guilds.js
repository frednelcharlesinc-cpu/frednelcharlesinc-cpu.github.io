/* ================= THE BELL CONCORD & ITS GUILDS =================
   Every town is a guild's territory, and its members guard it like home. Small towns keep one guild; big ones two or three.
   Each guild has one uniform and one hall. Members patrol their town and talk about it. */
const GUILDS = {
  bell:     { name: 'The Bell Wardens', town: 'Highmark', boss: 'Headmaster Seraphine Hale', uni: 'Long white coats with a gold bell pin', hall: 'A white tower with the great bell in its open belfry', role: 'The Concord\'s own. They guard the Gate, the Great Hall and the Sunhigh Festival.' },
  iron:     { name: 'The Iron Vow', town: 'Highmark', boss: 'Gideon Varga, First of the Seven', uni: 'Steel half-plate over a blue tabard', hall: 'A grey stone fortress with a shield-shaped gate', role: 'They hold Highmark\'s walls. They have never broken a promise or given up a gate.' },
  lucky:    { name: 'The Lucky Thirteen', town: 'Highmark', boss: 'Odo Pennywhistle, Seventh of the Seven', uni: 'Red waistcoats and flat caps, with a playing-card brooch', hall: 'A red-and-gold gambling house under a giant gold coin', role: 'They run the canal and market districts, and take bets on everything, including Gate Wars.' },
  pale:     { name: 'Pale Mercy', town: 'Greyspire', boss: 'Cael Ardent, the Drag-Breaker', uni: 'White plate armour, a pale cloak, a white halberd', hall: 'A cold white chapel-fortress of pale spires', role: 'Drag hunters. They have sworn that no Drag will ever lead a guild.' },
  quiver:   { name: 'The Silent Quiver', town: 'Greyspire', boss: 'Ilvaine Voe, the Silent Bow', uni: 'Dark green hooded cloaks with a silver arrow pin', hall: 'An elven hall built around a living tree, ringed with archery decks', role: 'Scouts and snipers. In a Gate War they are always first to the Core.' },
  hounds:   { name: 'The Hollow Hounds', town: 'Ashford Hollow', boss: 'Guildmaster Brom', uni: 'Brown leather with a green scarf', hall: 'A log hunting lodge with two stone hounds at the door', role: 'They keep the woods and the river road safe.' },
  moon:     { name: 'Moonhowl Lodge', town: 'Ashford Hollow', boss: 'Ursa Halfmoon, the Moonbear', uni: 'Fur-lined grey coats with a crescent moon pin', hall: 'A round stone lodge with a fur doorway and a healer\'s garden', role: 'Healers and brawlers. They tend the clinic and the farms around it.' },
  ferry:    { name: 'The Ferry Watch', town: 'Millbrook', boss: 'Watch-Captain Rhosyn', uni: 'Blue oilskin coats with an anchor badge, and a boathook', hall: 'A boathouse on stilts with its own little dock', role: 'They guard the ferry and the river, and count every boat that crosses.' },
  sheaf:    { name: 'The Sheaf Guard', town: 'Kettlebrook', boss: 'Old Harl', uni: 'Straw-gold tunics with a sickle pin, and short spears', hall: 'A converted granary barn under a golden straw roof', role: 'Farmers who fight. They guard the fields and the grain road.' },
  deep:     { name: 'Deepforge Hall', town: 'Hammerdeep', boss: 'Borrik Flintmantle, the Deep Hammer', uni: 'Leather smith\'s aprons and rune-etched gauntlets', hall: 'A hall carved into a cliff, with glowing rune doors', role: 'Rune-smiths. In a Gate they build traps and walls as fast as others swing swords.' },
  undertow: { name: 'The Undertow', town: 'Saltreach', boss: 'Mara Quickwater, the Undertow', uni: 'Sea-blue wrap tunics and harpoons', hall: 'An upturned ship\'s hull turned into a hall', role: 'Raiders of the drowned coast. They fight dirty, but they fight fair.' },
  dawn:     { name: 'Emerald Dawn', town: '— none yet —', boss: 'Ren', uni: 'A dark green coat with a gold rising-sun pin', hall: 'A ruined stone hall waiting to be rebuilt', role: 'A guild that doesn\'t exist yet. A charter that hasn\'t been signed. A banner with a green sun, rising.', need: 'dawnNamed' }
};
/* the guild members you meet in each town: [guild, id, name, x, y, ai, lines] */
const GUILD_PATROLS = {
  ashford: [
    ['hounds', 'gh_hound1', 'Hollow Hound', 25, 22, 'wander', ["The Hounds keep these woods. Four of them now: North, South, East, West. Don't get lost.", "Brom says a guild that won't bleed for its town doesn't deserve one. So we bleed. A little. Mostly the lupines bleed."]],
    ['hounds', 'gh_hound2', 'Hollow Hound', 36, 30, 'turn', ["Bandits on the wagon road again. If you see a red bandana, run first and report after.", "The green scarf? Means we've walked every path in the East Woods at night. Mine's still a bit itchy."]],
    ['moon', 'gh_moon1', 'Moonhowl Healer', 20, 30, 'turn', ["The Lodge mends anyone who walks through our door. Anyone. Ursa's rule.", "Hurt? Sit. Breathe. If it's broken, I'll set it. If it's your heart, I'll make tea."]]
  ],
  hm_city: [
    ['bell', 'gh_bell1', 'Bell Warden', 31, 18, 'turn', ["The Bell Wardens answer to the Headmaster and nobody else. Not the Crown. Not the Seven.", "When the great bell rings for Sunhigh, every blade in Highmark stays sheathed for seven days. We make sure of it."]],
    ['bell', 'gh_bell2', 'Bell Warden', 35, 25, 'wander', ["Keep to the plaza after dark. The Gate gets restless when the moon's full.", "Every guild in Veyrath is chartered under the Bell Concord. Every one. Yes, even the Lucky Thirteen. Somehow."]],
    ['iron', 'gh_iron1', 'Iron Vow Guard', 22, 16, 'turn', ["Gideon held the Saltgate nine days with forty men. We hold Highmark's walls the same way.", "A vow is a vow. We've never given up a gate. Not one."]],
    ['iron', 'gh_iron2', 'Iron Vow Guard', 42, 10, 'turn', ["Move along, citizen. Walls don't guard themselves.", "The Iron Vow and the Lucky Thirteen share a city. We do not share a tavern."]],
    ['lucky', 'gh_lucky', 'Lucky Thirteen Runner', 20, 30, 'wander', ["Odds on the next Gate War? Iron Vow two to one. Pale Mercy evens. Some little no-name guild? A hundred to one. I love a hundred to one.", "We're not gamblers. We're optimists with a ledger."]],
    ['pale', 'gh_pale', 'Pale Mercy Knight', 43, 26, 'turn', ["Pale Mercy is visiting from Greyspire. Commander Ardent wanted to see the new licence-holders for himself.", "Keep your hood up, child. Some of us check eyes."]]
  ],
  millbrook: [
    ['ferry', 'gh_ferry1', 'Ferry Watch', 38, 26, 'turn', ["The Ferry Watch counts every boat. Every barrel. Every wagon. Oswin counts faster, mind.", "River's high this season. If the Watch says don't cross, don't cross."]],
    ['ferry', 'gh_ferry2', 'Ferry Watch', 40, 21, 'wander', ["Millbrook's small, so it's one guild. Us. We like it that way. Fewer arguments about the good dock."]]
  ],
  kettlebrook: [
    ['sheaf', 'gh_sheaf1', 'Sheaf Guard', 18, 12, 'turn', ["We're farmers first. But when something comes for the fields, every sickle in Kettlebrook is a spear.", "The Inquisition seized our granary. The Sheaf Guard is the only thing they didn't seize. Remember that."]],
    ['sheaf', 'gh_sheaf2', 'Sheaf Guard', 28, 18, 'wander', ["One guild for one village. Old Harl says that's all the guild a village needs."]]
  ]
};
(function () {
  for (const [town, L] of Object.entries(GUILD_PATROLS)) {
    const sc = SCENES[town]; if (!sc) continue;
    const o = sc.npcs ? sc.npcs.bind(sc) : () => [];
    sc.npcs = function () {
      const out = o();
      for (const [g, id, name, x, y, ai, lines] of L) {
        if (typeof CHAR !== 'undefined' && !CHAR[id]) CHAR[id] = { name, sprite: 'g_' + g };
        let i = 0;
        out.push({ id, sprite: 'g_' + g, x, y, dir: 'down', name, ai, turns: ['down', 'left', 'right'], talk: async () => {
          await say(id, null, lines[i++ % lines.length]);
          const f = G.S.f; f.guildsMet = f.guildsMet || {}; if (!f.guildsMet[g]) { f.guildsMet[g] = 1; toast(`<b>${GUILDS[g].name}</b> added to the Concord codex.`, 2600); }
        } });
      }
      return out;
    };
  }
  /* the codex: the Bell Concord and its guilds */
  if (typeof worldMenuHTML === 'function') {
    const _w = worldMenuHTML;
    worldMenuHTML = function () {
      const h = _w.apply(this, arguments), f = G.S.f, met = f.guildsMet || {};
      let S = `<div class="stat" style="margin-bottom:6px"><h3 style="color:#ffd36a">🔔 The Bell Concord</h3><p class="muted">Every guild in Veyrath is chartered by the Bell Concord, which rules from Highmark under Headmaster Seraphine Hale. Each town is a guild's territory, and its members guard it like home. Small towns keep one guild, and big cities keep two or three. When the great bell rings, a Gate War begins.</p></div>`;
      for (const [k, Gd] of Object.entries(GUILDS)) {
        if (Gd.need && !f[Gd.need]) continue;
        const known = met[k] || k === 'bell' || k === 'dawn' || (k === 'pale' && f.trialDone) ;
        S += known ? `<div class="stat lore" style="margin-bottom:6px"><h3 style="color:#ffe7a0">${Gd.name} <span class="muted">· ${Gd.town}</span></h3><p>${Gd.role}</p><p class="muted"><b>Leader:</b> ${Gd.boss}<br><b>Uniform:</b> ${Gd.uni}<br><b>Hall:</b> ${Gd.hall}</p></div>`
          : `<div class="stat lore locked" style="margin-bottom:6px"><h3>??? <span class="muted">· ${Gd.town}</span></h3><p class="muted">Meet one of their members to learn more.</p></div>`;
      }
      const at = h.indexOf('☀ The Sunhigh Festival'); const cut = at >= 0 ? h.lastIndexOf('<div', at) : -1;
      return cut >= 0 ? h.slice(0, cut) + S + h.slice(cut) : h + S;
    };
  }
  if (typeof GOSSIP !== 'undefined') GOSSIP.guilds = { label: 'The guilds of the Concord', talks: [
    [['A', 'Ashford\'s got two guilds now. The Hounds keep the woods, the Moonhowl folk keep the sick.'], ['B', 'And they argue about who keeps the tavern.']],
    [['B', 'Small town, one guild. Big town, two or three. That\'s the Concord\'s rule.'], ['C', 'Highmark has three, and they hate each other.'], ['B', 'That\'s also a rule.']],
    [['C', 'The Iron Vow and the Lucky Thirteen nearly came to blows over a dock in Highmark.'], ['A', 'Who won?'], ['C', 'Odo bet on both sides. He won.']],
    [['A', 'Pale Mercy patrols are coming up from Greyspire now.'], ['B', 'White armour, white halberds. They check eyes at the gates.'], ['me', '(…Of course they do.)']],
    [['B', 'Every guild gets a uniform and a hall. You can tell a Ferry Watchman from a mile off — that blue coat.'], ['C', 'And a Sheaf Guard from two miles. That straw-gold. Like walking toast.']],
    [['C', 'No Drag has ever led a guild. The charter says "any licensed adventurer." Nobody ever checks the eyes until they do.'], ['me', '(Emerald Dawn. One day.)']]
  ] };
})();
