/* Interlude — The Dream, the Rooftop Speech, Kess's Oath, and the first word of Emerald Dawn.
   Plays after the Guild Trial, before the Greyspire cutscene that closes Chapter I. */
const Dawn = {
  async dream() {
    const f = G.S.f;
    await fadeOut(700); await World.load('hm_room', 25, 9, 'up'); G.S.clock = 23 * 60; await fadeIn(900);
    await narr('That night at the Wayfarer\'s Hearth, you fall asleep with your licence still in your hand.');
    await fadeOut(900);
    await narr('You dream of a city in daylight.');
    await narr('Green eyes everywhere — a baker, a guard, an old man selling birds. Nobody hides them. Nobody looks twice.');
    await narr('In the market, a girl with a green ribbon laughs and runs ahead of you. Ilya. She doesn\'t look back to check if you\'re following. She doesn\'t need to.');
    await narr('Above the rooftops, a banner you\'ve never seen: a green sun, rising.');
    await narr('Then the light goes wrong. The faces turn away. One by one, the hoods go up.');
    await say(null, null, 'A voice like a furnace, from everywhere and nowhere: "One boy. One sword. You will carry the whole world on your back?"');
    await say(null, null, '"Alone, you are a spark, little Drag. And sparks… go out."');
    await narr('You reach for the banner. Your hand closes on nothing.');
    await fadeIn(700);
    await me('shock', '—!');
    await narr('You\'re sitting up in bed, sweating. Through the window, the Gate turns over the city like nothing happened.');
    await me('sad', '(It\'s right. I can\'t do this alone. Not Greyspire. Not any of it.)');
    await me('determined', '(Then I won\'t.)');
    f.dawnDream = 1;
    if (f.kessJoined && G.S.party.includes('kess')) await narr('Kess\'s bed is empty. Her pack is gone. The window to the roof is open.');
    else await narr('There\'s a scrap of paper pushed under your door. One line, in neat, careful letters: "Roof. Now. — K."');
  },

  async speech() {
    const f = G.S.f, had = f.kessJoined && G.S.party.includes('kess');
    await fadeOut(500); await fadeIn(600);
    await narr('The roof of the Hearth. Chimneys, wet tiles, and the whole of Highmark glowing green beneath the Gate.');
    if (had) {
      await narr('Kess is sitting on the edge with her pack beside her and her hood up.');
      await say('kessE', 'sad', "Don't look at me like that. Greyspire's a fortress, Ren. I've snuck kids past checkpoints. Not walls.");
      await say('kessE', 'neutral', "Someone has to keep the bell-tower route open. Someone has to keep hiding them. That's what I'm good at. Hiding.");
    } else {
      await narr('A girl in tinted glasses sits on the edge of the roof. Kess. The one who got you past Voss.');
      await say('kessE', 'neutral', f.kessRefused ? "I told you to stay away from me. Then I heard a Drag kid passed the Guild Trial. So. Here I am, being stupid." : "Heard a Drag kid passed the Guild Trial. Had to see it for myself.");
      await say('kessE', 'sad', "Now everyone in Highmark's going to look a little harder at every green eye. Mine too. I'm going back to Ashford. Back to hiding.");
    }
    const c = await ask('me', 'determined', '(Say something. Make it count.)', ['"I\'m tired of being scared of mirrors."', '"They built cages for us. Let\'s build something they can\'t break."', '"I don\'t need an army. I need people who won\'t leave."']);
    f.speech = ['hope', 'fire', 'loyalty'][c];
    if (c === 0) {
      await me('sad', "I've spent my whole life checking my reflection. Is my hood up? Can they see? Every puddle, every window.");
      await me('determined', "I had a dream tonight. A whole city where nobody checks. I want to live there. And if it doesn't exist — I want to build it.");
      await say('kessE', 'sad', "…Mirrors. Yeah. I broke the one in my room when I was ten. Told Maren it fell.");
    } else if (c === 1) {
      await me('anger', "They took my sister. They took your whole life. And they did it with paper — registries, licences, rules. They made it LEGAL.");
      await me('determined', "So we play their game. We get licences. We get rank. And then we build something with walls they can't burn down.");
      await say('kessE', 'shock', "…You've been thinking about this. For real.");
    } else {
      await me('neutral', "Everyone keeps telling me what's out there. Dread. Ysolde. Fratenaptor. Fine. I'm scared of all of it.");
      await me('determined', "But I'm more scared of facing it without you. You know the roads. You know how to hide. You know how to keep people alive. I need that. I need you.");
      await say('kessE', 'sad', "…Nobody's ever said 'I need you' to me without wanting something smuggled.");
    }
    await me('determined', "I'm going to start a guild. Ours. Where Drags don't hide their eyes. Where we fight in the open.");
    await say('kessE', 'neutral', "A guild needs a charter. The Concord doesn't hand charters to Drags. They don't even let us register.");
    await me('determined', "Then we earn one so big they can't say no.");
    await narr('For a long moment she just looks at you. Then — slowly — she pushes her hood back. Her green eyes catch the light of the Gate.');
    await say('kessE', 'happy', "You're fifteen. You just gave a speech on a roof. To one person.");
    await say('kessE', 'happy', "…Fine. I'm in. But get this straight: I'm the big sister in this. I'm older, I'm smarter, and I decide when we run.");
    await me('happy', "Deal. Dragon law: you don't leave your own.");
    await say('kessE', 'neutral', "Dragon law.");
    if (typeof Art !== 'undefined' && Art.cut.kess_roof && typeof Cine !== 'undefined' && typeof paintShot === 'function') {
      try { await Cine.play([paintShot('kess_roof', 3200, [['Kess', 'Sworn ally. Big sister. Spymaster of whatever this turns into.', '#9dffc8']], { y: 330 })]); } catch (e) { }
    }
    if (!G.S.party.includes('kess')) { f.kessJoined = true; f.kessHelp = true; await Story.join('kess'); }
    f.kessOath = 1;
    if (typeof Bonds !== 'undefined' && Bonds.gain) try { Bonds.gain('kess', 60); } catch (e) { }
    toast('<b style="color:#46ff95">Kess swore the Oath</b> — your first sworn ally.', 3600); sfx('level');
    await say('kessE', 'neutral', "So. Does our guild have a name, or do I just call it 'Ren's Bad Idea'?");
    await me('neutral', "…The dream had a banner. A green sun. Rising.");
    await me('determined', "Emerald Dawn.");
    await say('kessE', 'happy', "Kairo's going to laugh at you. 'Green Eclipse', then 'Emerald Dawn'. Like you're answering him.");
    await me('happy', "Maybe I am.");
    f.dawnNamed = 1;
  },

  async liora() {
    const f = G.S.f;
    await fadeOut(600); G.S.clock = 7 * 60; await World.load('hm_city', 31, 21, 'down'); await fadeIn(700);
    await narr('Morning. The Greyspire coach waits at the plaza, and so does Liora — spear across her back, leaning on a lamp post like she\'s been there a while.');
    await say('liora', 'neutral', "You look like you didn't sleep.");
    const c = await ask('liora', 'neutral', "…Well?", ['"Had a weird dream."', '"Were you waiting for me?"', '"I\'m fine."']);
    f.lioraCrush = (f.lioraCrush || 0);
    if (c === 0) { await say('liora', 'neutral', "Weird how? …Actually, don't tell me. I'll make fun of it, and then you'll be sad, and then I'll feel bad."); await say('liora', 'smirk', "Tell me on the road. It's a long road."); f.lioraCrush += 1; }
    else if (c === 1) { await say('liora', 'blush', "W-what? No. I was waiting for the coach. Which happens to be where you are. Which is a coincidence."); await narr('She looks at the coach very hard.'); f.lioraCrush += 2; }
    else { await say('liora', 'neutral', "Sure. That's why your eyes are all red. …Your normal eyes. The whites. You know what I mean."); await say('liora', 'blush', "Forget it."); f.lioraCrush += 1; }
    if (G.S.party.includes('kess')) {
      await say('kessE', 'happy', "(Quietly, just to you) Spear girl's looking at you again.");
      await me('neutral', "(She's looking at the coach.)");
      await say('kessE', 'happy', "(Sure she is.)");
    }
    Story.quest('Chapter II — Emerald Dawn: earn a Founder\'s Charter from the Concord. First, the Greyspire road.');
    save();
  },

  async run() {
    const f = G.S.f; if (f.dawnDone) return;
    try { await this.dream(); await this.speech(); await this.liora(); } catch (e) { console.error(e); }
    f.dawnDone = 1; save();
  }
};
(function () {
  const _end = Story.trialEnd;
  if (typeof _end !== 'function') return;
  Story.trialEnd = async function () { await Dawn.run(); return _end.apply(this, arguments); };
})();
