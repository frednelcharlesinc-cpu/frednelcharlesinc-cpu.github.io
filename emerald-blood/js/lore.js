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
  ['SSS', 'A walking catastrophe. Fewer than thirty live: the Four Pillars, the Eight Bandit Kings, the Seven of the Guild and its Headmaster. Most are green or yellow. Only the Headmaster is SSS red.'],
  ['SSSS', 'One name. Dread.']
];
const BALANCE = 'Three powers hold the continent in balance. <b>The Empire of Veyl</b> rules the roads, the cities and the law. <b>The Adventurers\' Guild</b> answers to no crown and keeps the monsters back. <b>The Eight Bandit Kings</b> hold everything in between. None of them can beat the other two — so for a hundred years, none of them has tried. But the old Emperor is dying, and his firstborn is ambitious.';
const WORLD = {
  empire: {
    title: 'The Empire of Veyl', blurb: 'The Crown rules from Aurel, the white capital. Its army answers to one Grand General, and beneath him stand the Four Pillars — each one SSS, each one a nation\'s worth of power in one body.',
    people: [
      { id: 'emperor', name: 'Prince-Regent Lucan Aurel', tag: 'Firstborn · Regent of Veyl · "the Sun That Waits"', tier: '?',
        text: 'Thirty, brilliant, patient, unmarried. He has ruled in all but name since his father fell ill — and he wears the Crown Sun on his father\'s behalf, because the old man\'s hands can no longer bear it. Raised from birth to be emperor, then passed over in one sentence from a sickbed. In public he has not said a single word against his brother. He never says "Drag" either. He says "the green-eyed", carefully, like a man handling something that burns.',
        agenda: 'To end the balance. Crush the Eight, swallow the Guild, and own every D-stone in the world. The Registry, the stone quarries and the hunt for the Dragonoid were all his idea — not his father\'s.' },
      { id: 'dread', name: 'Dread', tag: 'Grand General · "the Black Sun"', tier: 'SSSS', need: 'raid',
        text: 'Commander of every Imperial army. Never speaks above a few words. Carries Gravecleaver, a black greatsword longer than a man. Vane swears his eyes are green.' },
      { id: 'caspian', band: 1, name: 'Caspian Thorne', tag: 'First Pillar · "the Sword Unbowed"', tier: 'SSS', element: 'Wind', need: 'caspianKnown',
        text: 'Vane\'s FIRST apprentice. The most gifted student the Sword Saint ever had — and the one who walked out on him for a seat beside the throne. It was Caspian who told the Crown exactly how Vane fought, the night before Dread took his arm.',
        agenda: 'To prove he surpassed his master. He has never stopped looking for the old man\'s grave — or for the student who replaced him.', under: 'The Wind Lances (Imperial duelist corps)' },
      { id: 'ysolde', band: 1, name: 'Ysolde Marr', tag: 'Second Pillar · "the Lantern"', tier: 'SSS', element: 'Light', need: 'ysoldeKnown',
        text: 'High General of the Ember Inquisition. Halvard\'s commander. Gentle voice, perfect manners, and a sincere belief that every Drag alive is a spark waiting to become Fratenaptor.',
        agenda: 'To end the "Drag question" forever, before the Dragonoid returns. She believes she is saving the world. That is what makes her dangerous.', under: 'Inquisitor Halvard (B) · the White Choir' },
      { id: 'gorran', band: 1, name: 'Gorran Ironvein', tag: 'Third Pillar · "the Mountain"', tier: 'SSS', element: 'Earth', need: 'gorranKnown',
        text: 'A dwarf siege-lord who has never lost a fortress or held a grudge. He is strip-mining the tomb-mountains for D-stones, and he does not care whose valley is in the way.',
        agenda: 'Stones. Only stones. A Crown that owns every D-stone owns the world — and Gorran means to be the one holding the ledger.', under: 'The Deep Battalions · Registry quarry-camps' },
      { id: 'sereth', band: 1, name: 'Sereth Vael', tag: 'Fourth Pillar · "the Quiet Tide"', tier: 'SSS', element: 'Water / Ice', need: 'serethKnown',
        text: 'An elf spymaster who runs the Crown Registry. Every seal on every legal D-stone passes through her hands. Soft-spoken. Never seen angry. Never seen surprised.',
        agenda: 'Secretly studying the Dragonoid. The Registry\'s "confiscated" Drag children do not all go to Inquisition camps.', under: 'The Registry Wardens · the Silent Office' }
    ]
  },
  royals: {
    title: 'The House of Aurel', blurb: 'The Emperor is dying. Three months ago, from his sickbed, he named his YOUNGER son heir — over the firstborn who has been running the Empire for a year. He gave no reason. The court has not stopped whispering since.',
    people: [
      { id: 'theodric', name: 'Emperor Theodric Aurel', tag: 'Second of his name · "the Quiet Emperor"', tier: '?', need: 'royalsHeard',
        text: 'Gentle, by Aurel standards. He started no wars and ended none. A year ago he began coughing blood with flecks of gold in it, and the court physicians stopped writing down what he says in his sleep. He has not been seen in public since he named his heir.' },
      { id: 'helene', name: 'Empress Helene Aurel', tag: 'Empress-consort · born House Merrow', tier: '?', need: 'royalsHeard',
        text: 'Married at seventeen, out of a minor house in the Ashen Vale that no longer exists. She nurses the Emperor herself and lets no one else pour his medicine. The servants say she hasn\'t left the east wing in a year — except, very late, to walk the palace walls alone, with a lantern and a red shawl.' },
      { id: 'corin', name: 'Prince Corin Aurel', tag: 'Second son · Heir of Veyl', tier: '?', need: 'royalsHeard',
        text: 'About your age. Bookish, stubborn, laughs at the wrong moments. At fourteen he ran away to the Guild under a false name and made D-rank before his brother dragged him home and burned his card in the throne room. He has worn tinted spectacles ever since — "his eyes trouble him in bright light."' },
      { id: 'celeste', name: 'Princess Celeste Aurel', tag: 'Youngest · "the Rose of Aurel"', tier: '?', need: 'royalsHeard',
        text: 'A year younger than Corin, and the most loved person in the capital — people throw flowers at her carriage. Lucan adores her; she is the only one who can make him laugh. She visits the Registry orphan-houses every week, and asks the wardens questions they do not like.' }
    ]
  },
  kings: {
    title: 'The Eight Bandit Kings', blurb: 'Outside the Crown\'s roads, the land belongs to whoever can hold it. Eight have held their territories for years — every one of them SSS. Three are Drags. One is human. The other four are exiles of races that were driven out of their homelands — by the Crown, or by their own people. They hate the Crown, each other, and anyone who forgets to pay. Together they are the reason the Emperor has never ruled the whole continent.',
    people: [
      { id: 'hound', band: 1, name: 'Varro Kade', tag: 'the Gilded Hound', race: 'Human', tier: 'SSS', territory: 'The Ashen River toll-roads (the eastern vale, Ashford\'s woods)', need: 'houndKnown',
        text: 'Charming, perfumed, never without a smile or a plain black-sheathed sword at his hip. Owns every bridge between Ashford and the coast and collects tolls in gold and favors. Raised by a river-port singer who never told him his father\'s name. He taught himself the sword — and somehow, the way he draws it looks exactly like a style he has never seen.',
        agenda: 'Officially: to buy a noble title from the Crown and become what he robs. Privately: to find the swordsman who walked out of his mother\'s life forty years ago — and ask him why.', under: 'Rook (his runner in the east woods) · Madame Tuck, the toll-keeper',
        secret: { need: 'varroSon', text: 'Varro Kade is Vane\'s son. Vane never knew he existed.' } },
      { id: 'brine', band: 1, name: 'Iska Brine', tag: 'Mother Brine', race: 'Drag', tier: 'SSS', territory: 'Saltreach — the pirate coast', need: 'kingsKnown',
        text: 'A Drag who hides her green eyes behind smoked-glass spectacles and dares anyone to ask. Calls every one of her pirates "child." Shelters runaways — Drags first — then works them like mules. Drowns traitors personally.',
        agenda: 'A free port no Crown can tax and no Inquisition can enter: a home for every Drag who can reach the sea.', under: 'Captain Gull · the Tide-Sisters' },
      { id: 'ash', band: 1, name: 'Corvin Ash', tag: 'King Ash', race: 'Drag', tier: 'SSS', territory: 'Cinderfall — the burned mining hills', need: 'kingsKnown',
        text: 'Hid his green eyes behind tinted lenses for twenty years and rose to captain in the Imperial army. The night he was ordered to burn a Drag village, he burned his own fortress instead and walked out through the fire. Furious, fire-scarred, and loved by the miners he freed.',
        agenda: 'To bring the Crown down by any means. Everything Kairo could become, twenty years older.', under: 'The Cinder Brigade · Old Mags' },
      { id: 'saint', band: 0, name: 'Abbot Merrow', tag: 'the Hollow Saint', race: 'Drag', tier: 'SSS', territory: 'The Dustveil Wastes', need: 'kingsKnown',
        text: 'A Drag who believes his people are Fratenaptor\'s children — and that the chains the Seven Elders forged are the real crime. He says the "Father" speaks to him in dreams, from beneath the sand. (Fratenaptor\'s tomb is in the eastern mountains. The Dustveil is in the far south-west. Nobody has ever pointed this out to him.) His followers are the only people alive who truly worship the dragon. Every Drag hanged in a market square was hanged because men like him exist.',
        agenda: 'To feed enough D-stones to the tomb-mountains that the dragon wakes and "frees its children." Your darkest mirror.', under: 'The Ashen Choir · Brother Hask' },
      { id: 'grimtusk', band: 1, name: 'Hrok Grimtusk', tag: 'the Tusk King', race: 'Beast-folk (exiled)', tier: 'SSS', territory: 'The Fanglands — the northern steppe', need: 'kingsKnown',
        text: 'A tusked beast-folk warlord whose people were burned off the green steppe by the Crown and pushed into the frozen north. Has a code of honor older than the Empire. Respects strength, despises cowards, keeps every promise.',
        agenda: 'To take back the steppe. The enemy of his enemy might be a Drag.', under: 'The Howling Hundred · his daughter Kesra' },
      { id: 'knife', band: 1, name: 'Lysandra Voe', tag: 'the Velvet Knife', race: 'Elf (exiled)', tier: 'SSS', territory: 'The Greyspire undercity', need: 'knifeKnown',
        text: 'Cast out of the elven courts of Sylvarin three hundred years ago for a murder she still won\'t discuss. Built a second kingdom in the city beneath the citadel where the Drag children were taken. Sells secrets, poisons and passage. Plays every side, loses to none.',
        agenda: 'Leverage over everyone. She already knows where Ilya is. The question is her price.', under: 'The Gloves · a broker called Wick' },
      { id: 'twins', band: 0, name: 'Sable & Sorrel', tag: 'the Thornwall Twins', race: 'Dwarves (exiled)', tier: 'SSS', territory: 'The Thornwall highways (the western forests)', need: 'kingsKnown',
        text: 'Two dwarves, one throne. Their clan\'s mountain hold was sold to the Crown for its D-stones — by Gorran Ironvein — and every dwarf who refused to leave was buried in it. They now rule a forest, under a sky they hate. Inseparable, and each has tried to kill the other at least twice.',
        agenda: 'Each wants the whole crown. Both want Gorran\'s head. Whoever helps one wins the other\'s undying hate.', under: 'The Briar Riders' },
      { id: 'gallows', band: 0, name: 'Bertrand Gall', tag: 'Old Gallows', race: 'Half-giant (exiled)', tier: 'SSS', territory: 'The Rotmarsh', need: 'kingsKnown',
        text: 'Half giant, half human — driven out of the Frostfell giant clans as a mongrel and never welcome among men. Spent thirty years as the Empire\'s hangman because it was the only job that would have him. Half-mad now. Collects the Crown\'s bounty on green eyes and has never once been paid in anything but gold.',
        agenda: 'Profit from the hunt. To him a Drag is a coin with legs — and the three Drag kings are the biggest coins of all.', under: 'The Noose-men · his "sons"' }
    ]
  },
  guild: {
    title: 'The Adventurers\' Guild', blurb: 'The only power the Crown has never managed to own. Every member, from E to SSS, answers to one woman. Beneath her stand the Seven — the Guild\'s highest-ranked adventurers, all SSS. In the Guild\'s whole history, not one of the Seven has ever been a Drag. Every one of the Seven carries a LARGE D-stone — a stone with its own will, which chose them and could abandon them. A large stone also carries an element of its own, and lends it to its bearer: it is the only way a Drag can ever wield fire, water or wind. Combat power alone makes you SSS; the colour shows how far into it you have grown. Green is new to the tier. Yellow is seasoned. Red is the peak. In the whole world, only one person has reached SSS red: the Headmaster herself.',
    people: [
      { id: 'seraphine', band: 2, name: 'Seraphine Hale', tag: 'Headmaster · "the Unbroken Bell"', tier: 'SSS', element: 'Lightning', need: 'seraphineMet',
        text: 'A half-elf two centuries old who wrote the Guild\'s neutrality pact with her own blood — and enforced it, once, against an entire Imperial legion. When she rings the great bell in the Guild Citadel, wars stop to listen.',
        agenda: 'Officially: to keep the Guild free of every Crown and king. Privately: she was in the Crown\'s vault the night the great stones began to hum. She has been waiting for someone with green eyes ever since.', under: 'Guildmaster Brom (Ashford) · the Bell Wardens' },
      { id: 'gideon', band: 1, name: 'Gideon Varga', tag: 'First of the Seven · "the Iron Vow"', race: 'Human', tier: 'SSS', need: 'seraphineMet',
        text: 'The Guild\'s champion and Seraphine\'s right hand. A former Imperial knight with a tower shield and a warhammer, who has never once broken a promise or lost a gate he was told to hold.',
        agenda: 'He served under Captain Corvin Ash. On the night Ash burned his own fortress, Gideon was on the wall — and let him walk out through the fire. He has never told the Guild. Once a year the two of them still share a bottle on the border of Cinderfall, and neither says a word.' },
      { id: 'ilvaine', band: 1, name: 'Ilvaine Voe', tag: 'Second of the Seven · "the Silent Bow"', race: 'Elf', tier: 'SSS', need: 'seraphineMet',
        text: 'An elven archer who has not missed a shot in two hundred years. Speaks rarely, and only in the old tongue when she is angry.',
        agenda: 'Lysandra Voe\'s younger sister. It was Ilvaine\'s testimony that got Lysandra exiled from the courts of Sylvarin for murder. Lysandra has sworn to kill her. Ilvaine has started to believe her sister was innocent — and that she herself was lied to.' },
      { id: 'ursa', band: 1, name: 'Ursa Halfmoon', tag: 'Third of the Seven · "the Moonbear"', race: 'Beast-folk (bear)', tier: 'SSS', need: 'seraphineMet',
        text: 'A towering bear-folk brawler and healer who can set a bone and break a wall with the same hands. The gentlest person in the Guild, until she isn\'t.',
        agenda: 'She was promised in marriage to Hrok Grimtusk, and she broke the promise to join the Guild. The Tusk King keeps every promise and forgives no broken one. His daughter Kesra has her eyes.' },
      { id: 'borrik', band: 0, name: 'Borrik Flintmantle', tag: 'Fourth of the Seven · "the Deep Hammer"', race: 'Dwarf', tier: 'SSS', need: 'seraphineMet',
        text: 'A dwarven rune-smith whose hammer can carve a spell into a mountain. Newest to SSS, and still a little embarrassed about it.',
        agenda: 'Cousin to the Thornwall Twins. He left their clan\'s hold a year before Gorran sold it — and before the dwarves who stayed were buried in it. Sable calls him a coward. Sorrel calls him a traitor. He is the only person both of them still answer letters from.' },
      { id: 'mara', band: 0, name: 'Mara Quickwater', tag: 'Fifth of the Seven · "the Undertow"', race: 'Tidefolk', tier: 'SSS', need: 'seraphineMet',
        text: 'Gilled tidefolk from the drowned islands, whose people were driven out when the Crown took the reefs. Fights with twin harpoons and water that moves like it is alive.',
        agenda: 'Raised on Saltreach as one of Mother Brine\'s "children." She left the pirates for the Guild at sixteen, and Iska Brine still writes her every month — letters that are half love and half threat.' },
      { id: 'cael', band: 1, name: 'Cael Ardent', tag: 'Sixth of the Seven · "the Drag-Breaker"', race: 'Human', tier: 'SSS', need: 'seraphineMet',
        text: 'Twenty years old, and the youngest adventurer ever to reach SSS, at seventeen. He is already deep into yellow, and the only one the Guild whispers might one day reach red. He fights with Pale Mercy, a white halberd set with a Verdict-stone that drinks Drag mana on contact. He has never lost a duel.',
        agenda: 'When he was nine, Abbot Merrow\'s Ashen Choir marched on his village and fed every soul in it to the tomb-mountains to "wake the father." Green eyes in the smoke are the last thing he remembers of his mother. He hates every Drag alive, the Choir most of all. Seraphine keeps him on the shortest leash in the Guild. No Drag has ever been one of the Seven, and Cael has sworn none ever will.' },
      { id: 'odo', band: 0, name: 'Odo Pennywhistle', tag: 'Seventh of the Seven · "the Lucky Thirteenth"', race: 'Halfling', tier: 'SSS', need: 'seraphineMet',
        text: 'A halfling gambler who fights with weighted playing cards and a laugh. Nobody knows how he reached SSS. He claims he won it in a card game.',
        agenda: 'Varro Kade\'s oldest card partner — they run the highest-stakes table in every river port. Odo is the only one Varro ever told his mother\'s last words to: "Your father carried his sword like it was sleeping."' },
      { id: 'vane', band: 1, name: 'Vane', tag: 'formerly the Sword Saint of the West', tier: 'SSS', need: 'vaneName',
        text: 'Forty years undefeated. One arm, one loss — to Dread. Exiled to the Realm of No Return. Your teacher.', agenda: 'Five years ago: to die quietly. Now: to make sure you don\'t become him.', under: 'His first apprentice: Caspian Thorne. His last: you.' }
    ]
  }
};
/* ---- every SSS fighter carries a LARGE D-stone. Large stones have a will of their own and choose their bearer;
        refuse its will and the stone stays dead in your hand — or burns the hand off. ---- */
const SIGS = {
  emperor: { el: 'light', stone: 'The Crown Sun', will: 'Wants to rule. It has chosen every emperor of Veyl — and abandoned the ones who were weak. Court physicians record that every emperor who carried it began to talk in their sleep. Always about gold.', art: 'Edict', artText: 'Speaks a single command. Every D-stone on the battlefield — friend or foe — obeys it for one breath.' },
  dread: { el: 'shadow', stone: 'The Black Heart (set in Gravecleaver)', will: 'Silent. Nobody has ever heard it speak. Some say it was once green.', art: 'Black Sun Arc', artText: 'A greatsword swing that carves a crescent of black light across the whole field. What it touches stops healing.' },
  caspian: { el: 'wind', stone: 'Gale Sovereign (katana guard)', will: 'Pride. It serves only someone who believes they are the best alive.', art: 'Unbowed Draw', artText: 'Vane\'s sheathed draw, stolen and made his own: the cut lands before the wind it makes. Cannot be parried by anyone who has not seen it before.' },
  ysolde: { el: 'fire', stone: 'The Last Lantern', will: 'Mercy, twisted. It believes burning is a kindness.', art: 'Absolution', artText: 'The lantern opens. Every Drag who looks at the light feels their mana go quiet — Drag Arts cost double while it shines.' },
  gorran: { el: 'earth', stone: 'Deepvein Heart (in his gauntlet)', will: 'Greed. It hums louder near other stones — and leads him to them.', art: 'Mountain\'s Due', artText: 'Punches the ground; the earth rises in a ring of stone pillars that trap everyone inside with him.' },
  sereth: { el: 'ice', stone: 'The Quiet Tide', will: 'Patience. It speaks only when she is alone, and never above a whisper.', art: 'Stillwater', artText: 'Freezes a single moment: one enemy loses their next turn, and every effect on them is frozen in place with them.' },
  hound: { el: 'wind', stone: 'The Sleeping Edge (katana guard)', will: 'Loyal to one hand only. It refused every buyer on the black market for forty years — then woke the moment a young river-port bandit touched it.', art: 'Moonless Draw', artText: 'A sheathed draw so fast the hound pendant still swings after the sword is back home. Reads every opponent\'s first strike and answers it.',
    secret: { need: 'varroSon', text: 'The Sleeping Edge was Vane\'s stone. It was torn from his sword the day Dread took his arm. It recognised his son\'s hand.' } },
  brine: { el: 'water', stone: 'Leviathan\'s Eye (cutlass pommel)', will: 'Hunger for the deep. It wants to drown things.', art: 'High Tide', artText: 'Raw Drag mana poured through the stone becomes a green tidal wave that drags every enemy off their feet.' },
  ash: { el: 'fire', stone: 'Cinderheart', will: 'Defiance. It was a Crown stone. It chose him the night he turned on the Crown.', art: 'Burn the Fort', artText: 'Sets himself alight in green-black flame. The more he is hurt, the hotter it burns — and it spreads to anyone who strikes him.' },
  saint: { el: 'mana', stone: 'Fratenaptor\'s Tooth', will: 'The dragon\'s own will — or what Merrow believes is. It whispers of waking.', art: 'Psalm of the Father', artText: 'The shadow of the dragon rises behind him. Every Drag in the fight feels their blood pull toward fever.' },
  grimtusk: { el: 'earth', stone: 'The Steppe King (in his axe)', will: 'Honour. It goes dark the moment its bearer breaks a promise.', art: 'Spirit of the Burned Steppe', artText: 'A great amber boar-spirit charges through the enemy line, knocking every enemy back in the turn order.' },
  knife: { el: 'shadow', stone: 'Nightglass (two shards, one in each dagger)', will: 'Secrets. It feeds on what its bearer knows that others do not.', art: 'Velvet Dark', artText: 'Dissolves into violet shadow; for two turns she cannot be targeted, and every strike from the dark is poisoned.' },
  twins: { el: 'earth', stone: 'The Hollow Hold (split in half — the broken clan medallion)', will: 'Grief. The stone broke when their mountain fell. Each half holds half a will, and neither half will wake alone.', art: 'Mountain Remembered', artText: 'Only when the twins fight side by side: stone rises, axes fly, and the two halves of the medallion blaze together. Apart, they are only strong. Together, they are catastrophic.' },
  gallows: { el: 'ice', stone: 'The Hangman\'s Knot', will: 'Spite. It hates everything alive, a little more each year.', art: 'Thirteen Nooses', artText: 'Ropes lash out like snakes and bind the target; Drags caught in them cannot use Drag Arts until freed.' },
  seraphine: { el: 'lightning', stone: 'The Unbroken Bell', will: 'It has a voice like thunder and has chosen exactly one bearer in two hundred years.', art: 'The Bell Tolls', artText: 'She rings the bell. Lightning falls on every enemy at once — and for one turn, nobody else on the field may act. The reason she is the only SSS red.' },
  gideon: { el: 'light', stone: 'The Oathwall (in his tower shield)', will: 'Duty. It grows heavier every time he considers retreating.', art: 'Hold the Gate', artText: 'Raises a wall of white light. All attacks on the party hit him instead, and he cannot fall while it stands.' },
  ilvaine: { el: 'wind', stone: 'Moonthread (in her bowstring)', will: 'Truth. It will not fire at anyone who is innocent — which is how she began to doubt her sister\'s guilt.', art: 'Arrow of the Silver Moon', artText: 'A single arrow of moonlight that never misses and ignores all shields and guards.' },
  ursa: { el: 'fire', stone: 'The Halfmoon (worn at her chest)', will: 'Gentleness. It refuses to work in anger — Ursa must fight calm.', art: 'Moonmother', artText: 'Heals her whole party and stores the healing as rage: her next punch hits as hard as the HP she restored.' },
  borrik: { el: 'lightning', stone: 'The Rune-Root (in his hammer)', will: 'Curiosity. It wants to learn every rune ever carved. He is still a little afraid of it.', art: 'Deep Writ', artText: 'Hammers a glowing rune-circle into the ground: allies inside gain DEF, enemies inside lose it. Newest to SSS; it takes him two turns to finish.' },
  mara: { el: 'water', stone: 'The Reef-Heart', will: 'Homesick. It sings for the drowned islands, and it obeys whoever promises to take it home.', art: 'Undertow', artText: 'A living water serpent coils around a target and drags them to the back of the turn order.' },
  cael: { el: 'light', stone: 'Pale Mercy — the mother-stone of every Verdict-stone', will: 'Hatred of Drags as deep as his own. That is why it chose him.', art: 'Drag-Breaker', artText: 'The halberd drinks green mana out of the air. Against Drags: cancels Emerald Ascension and Azure Tide on hit, and every Drag Art used near him costs HP. The rival built to beat you.' },
  odo: { el: 'wind', stone: 'The Thirteenth Card', will: 'Luck. Or mischief. Odo isn\'t sure there\'s a difference.', art: 'Dealer\'s Choice', artText: 'Throws a storm of glowing cards; the effect is random every time — from a harmless sting to the strongest single hit in the Guild.' },
  vane: { el: 'wind', stone: '(none — his was taken)', will: 'His stone was torn from his sword the day Dread took his arm. He has fought forty years of stories without it — and his sword is still faster than most stones.', art: 'The Sheathed Draw', artText: 'The style you carry now. A sword is loudest in its sheath.' }
};
/* ---------- legends & the Unwritten History (fragments found in the world) ---------- */
const LEGENDS = [
  { name: 'Auremund, the City That Swallowed the Sun', need: 'auremundHeard',
    text: 'The dream of every adventurer alive: a city of gold streets and gem walls, the treasury of a kingdom older than the Empire, sunk somewhere beneath the Dustveil sand. Tavern songs say its king was so rich he paved his throne room with crowns. Forty Guild expeditions have looked for it. The Crown made the search a hanging offence two hundred years ago, and nobody remembers why.' },
  { name: 'The Seven Elders', need: null,
    text: 'Seven Drags who stood against Fratenaptor four hundred years ago and chained it beneath the tomb-mountains. The Empire\'s histories call them "the dragon\'s penitent servants." The Drags\' own songs call them heroes. Strangely, no two histories agree on what the chains were made of.' }
];
const PAGES = [ // fragments of an old Drag chronicle, scattered and half-burned — Ren and Ilya's mother spent her life hunting them
  '"…and the dragon was our guardian before it was anyone\'s terror. It kept the old roads safe and asked only for songs. Then the gold king came to court it, with a gift in his hands…"',
  '"…he was the first of men to learn that a stone can be cut from a living dragon, and that whoever wears the stone wears the dragon\'s will. He set it in a crown and named the crown CHAINS, and laughed at his own joke…"',
  '"…for a hundred days the sky was gold. Then the dragon wept fire on every city that would not kneel. The world called it the Cataclysm. The world blamed the dragon. The dragon could not speak to tell them…"',
  '"…seven of the dragon\'s own blood, whose eyes were green as its heart, went into the burning city. Not to slay the dragon. To free it. They broke the crown into seven…"',
  '"…the dragon, freed, could not bear what it had done, and asked to sleep. The Seven laid it beneath the mountains and set the broken crown in the stone around it, so no hand could gather it again. And the king they sealed alive in his own treasury, and poured the sand over it, and every one of his coins…"',
  '"…but he had a son, and the son had a pen. In a generation the story was written backwards: a demon dragon, its wicked green-eyed servants, and a hero-king who died saving the world. The son built a white city and named it after his father…"',
  '"…the dead do not stay dead in a city that is never forgotten. Every stone pried from the mountains loosens the seal. Every coin dreamed of is a prayer. He waits. He counts. When the last piece of the crown comes home, he will wear it again…"'
];
const PAGE_AT = { 'in_nana': 0, 'd_warren': 1, 'd_crypt': 2, 'realm': 3, 'd_mire': 4, 'in_shop': 5, 'd_crystal': 6 };
function legendsHTML() {
  const f = G.S.f, pages = G.S.pages || [];
  let h = `<div class="stat" style="margin-bottom:6px"><h3>Legends</h3></div>`;
  for (const L of LEGENDS) if (!L.need || f[L.need]) h += `<div class="stat lore" style="margin-bottom:6px"><h3 style="color:#ffd88a">${L.name}</h3><p>${L.text}</p></div>`;
  h += `<div class="stat lore" style="margin-bottom:6px"><h3 style="color:#c8a0ff">The Unwritten History <span class="muted">· ${pages.length}/${PAGES.length} fragments</span></h3><p class="muted">Burned pages of an old Drag chronicle, hidden in chests across the land. Someone wanted them gone. Someone else wanted them found. One was copied out by your mother, Amara — a historian who went to Aurel to read the records the Empire keeps locked, and never came home. Ilya wants to finish her work.</p>${pages.length ? pages.slice().sort((a, b) => a - b).map(i => `<p><b style="color:#c8a0ff">${['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'][i]}.</b> ${PAGES[i]}</p>`).join('') : '<p class="muted">No fragments found yet.</p>'}</div>`;
  return h;
}
function worldMenuHTML() {
  const f = G.S.f;
  const known = p => !p.need || f[p.need];
  let h = `<div class="stat" style="margin-bottom:6px"><h3>Tiers of power</h3>${TIERS.map(([t, d]) => `<p><b style="color:${TIER_COL[t] || '#fff'};display:inline-block;min-width:48px">${t}</b> ${d}</p>`).join('')}
    <p class="muted">Your power: ${Power.badge()} · Guild card: ${G.S.rank ? `<b style="color:${TIER_COL[G.S.rank]}">${G.S.rank}-RANK</b>` : 'unregistered'}</p></div>`;
  h += `<div class="stat" style="margin-bottom:6px"><h3>The Balance of Power</h3><p>${BALANCE}</p></div>`;
  for (const k of ['empire', 'royals', 'kings', 'guild']) {
    const W = WORLD[k];
    h += `<div class="stat" style="margin-bottom:6px"><h3>${W.title}</h3><p class="muted">${W.blurb}</p></div>`;
    for (const p of W.people) {
      if (!known(p)) { h += `<div class="stat lore locked" style="margin-bottom:6px"><h3>??? <span class="muted">· ${p.tier}</span></h3><p class="muted">${p.territory ? 'Territory: ' + p.territory : 'You haven\'t heard this name yet.'}</p></div>`; continue; }
      h += `<div class="stat lore" style="margin-bottom:6px"><h3>${p.name} <span style="color:${TIER_COL[p.tier] || '#ffd88a'}">· ${p.tier}</span>${p.band != null ? ` <span class="grade" style="--gc:${BAND_COL[BAND3[p.band]]}">${BAND_NAME[BAND3[p.band]]}</span>` : ''}</h3><p class="muted">${p.tag}${p.race ? ' · ' + p.race : ''}${p.element ? ' · ' + p.element : ''}${p.territory ? '<br>Territory: ' + p.territory : ''}</p><p>${p.text}</p>${p.agenda ? `<p><b>Agenda:</b> ${p.agenda}</p>` : ''}${p.under ? `<p class="muted"><b>Underlings:</b> ${p.under}</p>` : ''}${p.secret && f[p.secret.need] ? `<p style="color:#ffd88a"><b>Secret:</b> ${p.secret.text}</p>` : ''}${(() => { const g = SIGS[p.id]; if (!g) return ''; const E = ELEM[g.el]; return `${E ? `<p><b style="color:${E[1]}">◆ ${E[0]}</b>${['brine', 'ash', 'saint', 'dread'].includes(p.id) ? ' <span class="muted">— raw Drag mana, given an element by the stone</span>' : ''}</p>` : ''}<p><b style="color:#ff8a9a">Large D-stone:</b> ${g.stone}<br><span class="muted"><b>Its will:</b> ${g.will}</span></p><p><b style="color:#7dffb0">${g.art}:</b> ${g.artText}</p>${g.secret && f[g.secret.need] ? `<p style="color:#ffd88a"><b>Secret:</b> ${g.secret.text}</p>` : ''}`; })()}</div>`;
    }
  }
  if (G.S.f.kairoMet || G.S.f.millDone || G.S.f.kairoB || true) {
    const GE = [['tamsin', 'Tamsin'], ['dace', 'Dace'], ['corran', 'Corran'], ['sefa', 'Sefa'], ['bo', 'Bo'], ['lark', 'Lark'], ['wren', 'Wren']];
    h += `<div class="stat lore" style="margin-bottom:6px"><h3 style="color:#a9c4ff">The Green Eclipse</h3><p class="muted">Kairo's revolution. Kairo has always matched you step for step — and in Scar Bloom he goes a full rank beyond. His founders trail him by a colour or two.</p>
      <p><b>Kairo</b> ${stepBadge(Rivals.kairo())} · <span class="muted">Scar Bloom:</span> ${stepBadge(Rivals.kairo(true))}</p>${GE.map(([k, n]) => `<p><b>${n}</b> ${stepBadge(Rivals.ge(k))}${typeof GE_WEAPON !== 'undefined' && GE_WEAPON && GE_WEAPON[k] ? ` <span class="muted">· ${GE_WEAPON[k]}</span>` : ''}</p>`).join('')}<p class="muted" style="margin-top:6px">Uniform: black coat, forest-green tabard and sash — the cape is worn once the Crown knows your face.${typeof Notoriety !== 'undefined' ? ` Notoriety: <b style="color:#a9c4ff">${Notoriety.name()}</b>.` : ''}</p>${G.S.f.coupHint ? `<p><b style="color:#ff9a6a">Kairo's plan: ???</b> <span class="muted">Greyspire is only the door. Green Eclipse is preparing to move against the Empire itself. Nobody outside Kairo knows the target or the reason. His three rules: cages first; never a child; never someone who is already kneeling.</span></p>` : ''}</div>`;
  }
  h += legendsHTML();
  return h;
}
