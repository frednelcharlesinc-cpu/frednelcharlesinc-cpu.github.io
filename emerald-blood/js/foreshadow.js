'use strict';
/* =====================================================================================
   FORESHADOWING  (Chat A) — seeds for the long story. Each plays ONCE, right after a line that already exists.
   Threads:  THE HOLLOW COURT (the Monarchs under the world) · THE FIRST EMBER (Ondrel, the first Drag)
             FRATENAPTOR'S TRUTH (Drags were made to hold the Gate) · KAIRO'S BLOOM (it's eating him)
             THE ECLIPSE AND THE DAWN (Kairo's movement will one day cover Ren's) · ILYA (kept, not sold)
             THE FALL (one day Ren's own face is on the wall)
   ===================================================================================== */
const FS = {
  // [id, trigger text (part of an existing line), lines to add: [who, expr, text]]
  AFTER: [
    ['ember', 'Nana ties a ribbon of green silk', [['nana', 'happy', 'Ember Festival, little ones. Do you know why we light the fire?'], [null, null, 'A village kid shouts it before anyone else can: "For the First Ember!"'],
      ['nana', 'neutral', 'For the First Ember. He fought the dark under the mountain, so we could have one night of fire a year.'], ['ilya', 'neutral', '…Is he real?'],
      ['nana', 'sad', 'Real enough that the Crown burned every book about him.']]],
    ['bloom', 'Dread is looking at Kairo', [[null, null, 'Under his breath — so quietly only you hear it — the General says one word. "…Bloom."']]],
    ['under', 'A fire. A smell of pine smoke', [['me', 'neutral', '(Under the snow… very far down… something is breathing. Slow. Like it\'s asleep.)']]],
    ['made', 'The old Drags had a name for it. Tomb Breath', [['vane', 'neutral', 'Made for it. Hm. Made for this air — and for what sleeps under it.'],
      ['vane', 'neutral', 'There\'s someone much older than me who could tell you that story. Pray you never have to meet him.']]],
    ['north', 'Ask me again in a few years', [['vane', 'neutral', 'One rule. Never walk north past the black stones. Not to chase a beast, not for a dare. Not until I\'m dead.']]],
    ['sword', 'He holds out his sword, hilt-first', [['vane', 'neutral', 'This was given to me to give to someone. I always thought it would be someone older.'],
      ['vane', 'neutral', 'The blade stays sheathed until something is worth drawing it for. You\'ll know it when you meet it. It will be very, very big.']]],
    ['song', 'I\'ve lived the other way round my whole life', [['corran', 'neutral', 'My grandmother used to sing an old Drag song. "Fratenaptor bled at the gate, so the sons of men could hold it."'],
      ['corran', 'sad', 'Hold what gate? Never found out. The Church says he was a demon. Funny… the song never did.']], 'An old Drag song, from Corran: "Fratenaptor bled at the gate, so the sons of men could hold it." Which gate?'],
    ['ribbon', 'So you can always find us', [['me', 'sad', '(Ilya tore her ribbon in two that morning. I still have my half.)']]],
    ['kept', 'your valley wasn\'t found. It was sold', [['hesk', 'neutral', 'And the girl with the ribbon? Not sold. KEPT. By order of the General himself. Make of that whatever helps you sleep.']],
      'Hesk: the girl with the ribbon was not sold — she was KEPT, by order of the Dread General.'],
    ['ash', 'You used it again. The Bloom', [[null, null, 'The ash on Kairo\'s arm doesn\'t stop at the elbow anymore. It\'s past his shoulder.']]],
    ['crack', 'The Gate just jumped from C to B', [[null, null, 'Through the floor, through the stone — a sound like a great door, very far below, opening one crack.']]],
    ['thrones', 'Alone, you are a spark', [[null, null, 'Under the city, under the stones, under everything: a throne room. Empty thrones, too many to count.'],
      [null, null, 'One by one, something sits down in them.']]],
    ['eclipse', 'Like you\'re answering him', [['me', 'neutral', '(An eclipse covers the dawn.)'], ['me', 'neutral', '(…It\'s just a name.)']]],
    ['hunt', 'leaning on a lamp post like she', [['liora', 'neutral', 'If they ever put your face on a wall, Drag — I\'m the one they\'ll send. Just so you know.'],
      ['me', 'neutral', '"And?"'], ['liora', 'happy', '"And nothing. Get in the coach."']]]
  ],
  // things monsters and enemies say
  BARK: { gt_warden: '…DRAG… THE COURT… SMELLS… YOUR BLOOD…', halvard: 'You think we cage you out of HATE, boy? We cage you because of what you were MADE for.',
    halvard_pro: 'You think we cage you out of HATE, boy? We cage you because of what you were MADE for.', dread: 'Vane\'s sword. In a child\'s hand. So the old man finally chose.' },
  LAST: { gt_warden: '…the Court… remembers… what you are…' },
  seen(id) { const f = G.S.f; f.fs = f.fs || {}; return f.fs[id]; },
  mark(id) { G.S.f.fs = G.S.f.fs || {}; G.S.f.fs[id] = 1; }
};
(function () {
  for (const [k, l] of Object.entries(FS.LAST)) if (ENEMY[k] && !ENEMY[k].lastWords) ENEMY[k].lastWords = l;
  let busy = false;
  const _line = Dlg.line.bind(Dlg);
  Dlg.line = function (who, expr, text, choices) {
    const p = _line(who, expr, text, choices);
    if (busy || choices || typeof text !== 'string' || !G.S || !G.S.f) return p;
    const hit = FS.AFTER.find(a => !FS.seen(a[0]) && text.includes(a[1]));
    if (!hit) return p;
    return Promise.resolve(p).then(async r => {
      FS.mark(hit[0]); busy = true;
      try { for (const [w, e, t] of hit[2]) await _line(w, e, t); if (hit[3]) try { Intel.add('you', hit[3]); } catch (x) { } }
      finally { busy = false; }
      return r;
    });
  };
  // battle barks
  const _run = Battle.run.bind(Battle);
  Battle.run = async function () {
    const B = this.B;
    try { if (B && !B.fsBark) { B.fsBark = 1; const e = B.actors.find(a => a.side === 'e' && FS.BARK[a.key]);
      if (e && !FS.seen('bark_' + e.key)) { FS.mark('bark_' + e.key); setTimeout(() => { if (this.B === B && !e.ko && typeof AI2 !== 'undefined') AI2.say(this, e, FS.BARK[e.key]); }, 1600); } } } catch (x) { }
    return _run();
  };
})();
