'use strict';
/* ================= UI: title, creator, HUD, menus, routing ================= */
const UI = {
  shown: false,
  controls(on) {
    const inWorld = on && G.mode === 'world';
    ['#stickZone', '#pad', '#hud', '#hudR'].forEach(s => $(s).classList.toggle('hide', !inWorld));
    $('#stickHint').classList.toggle('hide', !inWorld || (G.S && G.S.steps > 30));
    if (!inWorld) { G.input.dir = null; $('#stick').classList.add('hide'); }
  },
  hud() {
    if (!G.S || G.mode !== 'world') return;
    const S = G.S, s = S.stats;
    const card = (nm, hp, mhp, mp, mmp, extra) => `<div class="pcard"><div class="nm"><span>${esc(nm)}</span><span class="muted" style="font-weight:400">${extra || ''}</span></div>
      <div class="row"><span class="ic h"></span><i><b style="width:${hp / mhp * 100}%"></b></i><span>${hp}/${mhp}</span></div>
      <div class="row mp"><span class="ic m"></span><i><b style="width:${mp / mmp * 100}%"></b></i><span>${mp}/${mmp}</span></div></div>`;
    let h = card(S.name, s.hp, s.maxHp, s.mp, s.maxMp, 'Lv ' + S.lvl);
    for (const id of S.party) { const A = ALLY[id], st = S.allies[id] || {}, lv = S.lvl - 1, mh = A.hp + lv * 7, mm = A.mp + lv * 2; h += card(A.name, st.hp ?? mh, mh, st.mp ?? mm, mm); }
    $('#hud').innerHTML = h;
    $('#sus').innerHTML = S.f.hoodGiven ? Array.from({ length: 5 }, (_, i) => `<i class="eye ${i < Math.floor(S.sus) ? 'on' : ''}"></i>`).join('') : '<span class="muted" style="font-size:11px">Thornvale</span>';
    $('#gold').textContent = S.gold + 'g';
    $('#obj').innerHTML = S.quest ? '<b>▸</b> ' + esc(S.quest) : ''; $('#obj').style.display = S.quest ? '' : 'none';
    const hb = $('#bHood'); hb.classList.toggle('on', !S.hood && S.f.hoodGiven); hb.textContent = S.f.hoodGiven ? (S.hood ? 'Hood ▲' : 'Hood ▼') : 'Hood —';
  },
  // ---------------- title ----------------
  async title() {
    G.mode = 'title'; this.controls(false); Music.stop();
    $('#title').classList.remove('hide');
    $('#tContinue').style.display = loadSave() ? '' : 'none';
    G.img.bd_dusk = G.img.bd_dusk || await loadImg('assets/bd_dusk.jpg');
    const c = $('#tcv').getContext('2d'); c.imageSmoothingEnabled = false;
    const L = defaultLook(); const fr = composeLook(L, true, [0, 128, 64, 64]);
    c.clearRect(0, 0, 64, 64); c.drawImage(fr, 0, 0); glowEyes(c, 64, 64);
  },
  renderTitle(c, t) {
    const bd = G.img.bd_dusk, W = G.view.w, H = G.view.h;
    if (bd) { const sc = Math.max(W / bd.width, H / bd.height) * 1.08; const ox = Math.sin(t / 6000) * 14; c.drawImage(bd, (W - bd.width * sc) / 2 + ox, (H - bd.height * sc) / 2, bd.width * sc, bd.height * sc); }
    c.fillStyle = 'rgba(5,10,7,.55)'; c.fillRect(0, 0, W, H);
    for (let i = 0; i < 40; i++) { const x = (i * 97 + t / 30 * (1 + i % 3)) % W, y = H - ((i * 53 + t / 18 * (1 + i % 4)) % H); c.fillStyle = `rgba(70,255,140,${.15 + (i % 5) * .08})`; c.fillRect(x, y, 2, 2); }
  },
  // ---------------- creator ----------------
  creator() {
    return new Promise(resolve => {
      $('#title').classList.add('hide'); $('#creator').classList.remove('hide'); G.mode = 'creator';
      const look = defaultLook(); let name = 'Ren';
      G.S = newState(look, name);
      const box = $('#crOpts');
      const swatch = (mat, key) => { const p = G.man.pal[mat][key]; return p ? p[Math.min(3, p.length - 1)] : '#888'; };
      let prev = null, dirI = 0, animT = 0, raf = 0;
      const rebuild = () => { prev = composeLook(look, false, [0, 0, 576, 512]); playerPortrait($('#crPort'), 'happy'); };
      const draw = t => {
        if ($('#creator').classList.contains('hide')) return;
        const c = $('#crCv').getContext('2d'); c.imageSmoothingEnabled = false; c.clearRect(0, 0, 64, 64);
        if (prev) { const d = ['down', 'left', 'up', 'right'][Math.floor(t / 2400) % 4]; drawOW(c, prev, 'walk', d, 1 + Math.floor(t / 110) % 8, 32, 60); }
        raf = requestAnimationFrame(draw);
      };
      const render = () => {
        const row = (label, key, opts, names) => `<div class="opt"><label>${label}</label><button class="arr" data-k="${key}" data-d="-1">◀</button><div class="val">${esc((names || {})[look[key]] || look[key].replace(/_/g, ' '))}</div><button class="arr" data-k="${key}" data-d="1">▶</button></div>`;
        const sw = (label, key, mat, opts) => `<div class="opt"><label>${label}</label><div class="sw">${opts.map(o => `<button data-k="${key}" data-v="${o}" class="${look[key] === o ? 'on' : ''}" style="background:${swatch(mat, o)}" title="${o}"></button>`).join('')}</div></div>`;
        box.innerHTML = `<h2>WHO ARE YOU?</h2>
          <div class="opt"><label>Name</label><input id="crName" maxlength="12" value="${esc(name)}" autocomplete="off"></div>
          ${row('Body', 'sex', LOOK_OPTS.sex, { male: 'Brother to Ilya', female: 'Sister to Ilya' })}
          ${sw('Skin', 'skin', 'body', LOOK_OPTS.skin)}
          ${row('Hair', 'hair', LOOK_OPTS.hair, HAIR_NAMES)}
          ${sw('Hair color', 'hairCol', 'hair', LOOK_OPTS.hairCol)}
          ${look.sex === 'male' ? row('Facial hair', 'beard', LOOK_OPTS.beard) : ''}
          ${sw('Gi', 'top', 'cloth', LOOK_OPTS.cloth)}
          ${sw('Pants', 'pants', 'cloth', LOOK_OPTS.cloth)}
          ${sw('Sash', 'obi', 'cloth', LOOK_OPTS.cloth)}
          ${sw('Hood', 'hood', 'cloth', LOOK_OPTS.cloth)}
          <div class="btnrow"><button class="btn" id="crRand">🎲 Random</button><button class="btn pri" id="crGo" style="flex:1">Begin ▶</button></div>`;
        $('#crName').addEventListener('input', e => { name = e.target.value; G.S.name = name || 'Ren'; });
        box.querySelectorAll('.arr').forEach(b => bindTap(b, () => { const k = b.dataset.k, L = LOOK_OPTS[k === 'sex' ? 'sex' : k === 'hair' ? 'hair' : 'beard'], i = L.indexOf(look[k]); look[k] = L[(i + (+b.dataset.d) + L.length) % L.length]; if (k === 'sex' && look.sex === 'female') look.beard = 'none'; sfx('blip'); render(); rebuild(); }));
        box.querySelectorAll('.sw button').forEach(b => bindTap(b, () => { look[b.dataset.k] = b.dataset.v; sfx('blip'); render(); rebuild(); }));
        bindTap($('#crRand'), () => { look.sex = pick(LOOK_OPTS.sex); look.skin = pick(LOOK_OPTS.skin); look.hair = pick(LOOK_OPTS.hair); look.hairCol = pick(LOOK_OPTS.hairCol.slice(0, 10)); look.beard = look.sex === 'male' ? pick(LOOK_OPTS.beard) : 'none'; ['top', 'pants', 'obi', 'hood'].forEach(k => look[k] = pick(LOOK_OPTS.cloth)); sfx('blip'); render(); rebuild(); });
        bindTap($('#crGo'), () => { cancelAnimationFrame(raf); G.S.name = (name || 'Ren').trim().slice(0, 12) || 'Ren'; $('#creator').classList.add('hide'); sfx('start'); resolve(); });
      };
      render(); rebuild(); raf = requestAnimationFrame(draw);
    });
  },
  async newGame() {
    if (loadSave() && !confirm('Start a new game? Your current save will be replaced.')) return;
    audioUnlock();
    await this.creator();
    G.mode = 'boot'; $('#loading').classList.remove('hide'); $('#loadTxt').textContent = 'Forging your Drag…'; $('#loadBar').style.width = '60%';
    await wait(30); await buildPlayerSprites(); $('#loading').classList.add('hide');
    await this.intro([
      'Four hundred years ago, the demon dragon Fratenaptor nearly ended the world. Even the dragons curse his name.',
      'The people say the Drags worshipped him. That his fire lives in their blood. That you can always know a Drag by their eyes — green, and glowing.',
      'They say a lot of things.',
      'High in the hills, in a valley no map remembers, the last free Drags still live in hiding.'
    ]);
    G.mode = 'world'; await World.load('thornvale', 9, 14, 'down'); this.controls(true); this.hud();
    Story.run(SCENES.thornvale.onEnter);
    await fadeIn(700); banner('PROLOGUE', 'Thornvale'); save();
  },
  async cont() {
    const s = loadSave(); if (!s) return; audioUnlock();
    G.S = s; $('#title').classList.add('hide');
    G.mode = 'boot'; $('#loading').classList.remove('hide'); $('#loadTxt').textContent = 'Waking up…';
    await wait(30); await buildPlayerSprites(); $('#loading').classList.add('hide');
    G.mode = 'world'; await World.load(s.map, s.x, s.y, s.dir); this.controls(true); this.hud();
    await fadeIn(500); banner(SCENES[s.map].title || '', SCENES[s.map].subtitle || '');
  },
  intro(lines) {
    return new Promise(async res => {
      const ov = document.createElement('div'); ov.className = 'ov'; ov.style.background = '#000'; ov.style.zIndex = 70;
      ov.innerHTML = '<div style="max-width:620px;font-size:clamp(17px,2.6vw,22px);line-height:1.45;text-align:center;padding:20px" id="introT"></div><div style="position:absolute;bottom:18px;color:#555;font-size:14px">tap to continue</div>';
      document.body.appendChild(ov); $('#fade').classList.add('on');
      Music.play('sad');
      for (const l of lines) {
        await new Promise(r => {
          const el = $('#introT'); let i = 0, done = false; el.textContent = '';
          const tm = setInterval(() => { i++; el.textContent = l.slice(0, i); if (i >= l.length) { clearInterval(tm); done = true; } }, 28);
          const h = e => { e.preventDefault(); if (!done) { clearInterval(tm); el.textContent = l; done = true; return; } ov.removeEventListener('pointerdown', h); Input.on('a', UI.routeA); r(); };
          ov.addEventListener('pointerdown', h); Input.on('a', () => h(new Event('x')));
        });
      }
      ov.remove(); Music.stop(); res();
    });
  },
  chapterCard(t, s) {
    return new Promise(res => {
      const ov = document.createElement('div'); ov.className = 'ov'; ov.style.background = '#000'; ov.style.zIndex = 70; ov.style.flexDirection = 'column';
      ov.innerHTML = `<div style="font-family:'Press Start 2P';color:#46ff95;font-size:clamp(16px,3vw,26px);text-shadow:0 0 18px #46ff9588">${t}</div><div style="font-size:22px;margin-top:14px">${s}</div>`;
      document.body.appendChild(ov); setTimeout(() => { ov.remove(); res(); }, 2800);
    });
  },
  endCard() {
    return new Promise(res => {
      const f = G.S.f; G.mode = 'world'; this.controls(false);
      const who = [f.marenKnows && 'Maren', f.tobbKnows && 'Tobb', f.vossKnows && 'Voss', f.pipGone && 'Pip', f.rookSaw && 'Rook', f.kessKnows && 'Kess', f.hoshiDone && !G.S.hood && 'Hoshi'].filter(Boolean);
      $('#menu').classList.remove('hide');
      $('#menuCard').innerHTML = `<h2>CHAPTER I COMPLETE</h2><p>Ilya was moved to <b style="color:var(--green)">Greyspire Citadel</b>.</p>
        <div class="grid2">
          <div class="stat"><h3>Your Drag</h3><p>Level <b>${G.S.lvl}</b> · Suspicion <b>${Math.floor(G.S.sus)}/5</b></p><p>Saw your eyes: <b>${who.length ? who.join(', ') : 'no one'}</b></p></div>
          <div class="stat"><h3>Choices</h3><p>Halvard: <b>${f.halvardKilled ? 'killed by you' : f.halvardKilledByKairo ? 'killed by Kairo' : 'spared'}</b></p><p>Kess: <b>${f.kessJoined ? 'travels with you' : f.kessRefused ? 'turned you away' : f.kessHelp ? 'helped, then vanished' : 'a stranger'}</b></p>
          <p>Kairo: <b>${f.duel === 'won' ? 'duel won · Ashford spared' : 'duel lost'}${f.halvardKilledByKairo ? ' · he executed Halvard' : ''}</b></p>
          <p>Liora: <b>${f.lioraMet ? 'fought beside you — hunting Dread alone' : 'a stranger on the mill roof'}</b></p>
          <p>Tobb: <b>${f.crateDone ? (f.tobbKnows ? 'prejudiced — but softening' : 'thinks you are a saint') : 'never helped'}</b></p><p>The binding stone: <b>${f.shrineRead ? 'you know the truth' : 'unread'}</b></p></div>
        </div><p class="muted" style="margin-top:10px">These choices carry into Chapter II: Greyspire.</p>
        <div class="btnrow"><button class="btn pri" id="eKeep">Keep exploring</button><button class="btn" id="eTitle">Title screen</button></div>`;
      bindTap($('#eKeep'), () => { $('#menu').classList.add('hide'); this.controls(true); res(); });
      bindTap($('#eTitle'), () => { $('#menu').classList.add('hide'); res(); this.title(); });
    });
  },
  // ---------------- pause menu ----------------
  menuTab: 'party',
  openMenu() {
    if (G.mode !== 'world' || World.busy || !G.S) return;
    World.busy = true; this.controls(false); $('#menu').classList.remove('hide'); this.renderMenu();
  },
  closeMenu() { $('#menu').classList.add('hide'); World.busy = false; this.controls(true); save(); },
  renderMenu() {
    const S = G.S, s = S.stats, t = this.menuTab;
    const tabs = ['party', 'arts', 'items', 'quests', 'settings'].map(k => `<button data-t="${k}" class="${t === k ? 'on' : ''}">${{ party: 'Party', arts: 'Arts', items: 'Items', quests: 'Quests', settings: 'Settings' }[k]}</button>`).join('');
    let body = '';
    if (t === 'party') {
      body = `<div class="grid2"><div class="stat"><h3>${esc(S.name)} · Lv ${S.lvl}</h3><p>HP <b>${s.hp}/${s.maxHp}</b> · MP <b>${s.mp}/${s.maxMp}</b></p><p>ATK <b>${s.atk}</b> · DEF <b>${s.def}</b> · SPD <b>${Math.floor(s.spd)}</b></p><p>XP <b>${S.xp}/${S.lvl * 30}</b> · Gold <b>${S.gold}</b></p><p>Hood: <b>${S.f.hoodGiven ? (S.hood ? 'up' : 'down') : '—'}</b> · Suspicion <b>${Math.floor(S.sus)}/5</b></p><p>Guild rank: ${S.rank ? `<b style="color:${TIER_COL[S.rank]}">${S.rank}-RANK</b>` : '<b>unregistered</b>'} · Element: <b style="color:#46ff95">none — raw mana</b></p></div>` +
        S.party.map(id => { const A = ALLY[id], lv = S.lvl - 1; return `<div class="stat"><h3>${A.name}</h3><p>ATK <b>${A.atk + lv * 2}</b> · DEF <b>${A.def + lv}</b> · SPD <b>${A.spd}</b></p><p>Arts: <b>${A.arts.map(k => ARTS[k].name).join(', ')}</b></p><p>Link Art: <b>${LINKS[id].name}</b></p></div>`; }).join('') + '</div>';
    } else if (t === 'arts') {
      body = S.arts.map(k => `<div class="stat" style="margin-bottom:6px"><h3>${ARTS[k].name} <span class="muted">· ${ARTS[k].mp} MP</span></h3><p>${ARTS[k].desc}</p></div>`).join('') +
        `<div class="stat" style="margin-bottom:6px"><h3>Drag Reflex <span class="muted">· passive</span></h3><p>A Drag body wastes nothing. Your dodge, parry and timed-hit windows are wider than a human's. Drag enemies dodge and parry more often, and may RIPOSTE when they parry you.</p></div>` +
        (S.f.eye ? `<div class="stat" style="margin-bottom:6px"><h3 style="color:#7fe8ff">Verdant Eye <span class="muted">· your Drag ability</span></h3><p>Your eyes see the current of mana in everything. In battle you see each enemy's NEXT move (◉ under their name), and every timing window widens further.</p></div>` : '') +
        (S.arts.includes('draw') && S.arts.includes('cast') ? `<div class="stat" style="margin-bottom:6px"><h3>??? <span class="muted">· locked</span></h3><p>Draw and Cast, meeting at one point. The two currents won't touch. Not yet.</p></div>` : '') +
        `<div class="stat"><h3>How to fight</h3><p>On your attacks, tap when the gold ring closes for a <b>PERFECT</b> hit (×1.5, can't be dodged or parried).</p><p>On enemy attacks: <b>DODGE</b> (wide window) or <b>PARRY</b> (tight window). Perfect timing earns MP. Parry <b>every</b> hit of an attack to COUNTER.</p><p>Red <b>!!</b> attacks can't be parried — dodge them. Fill an enemy's yellow bar to <b>BREAK</b> them.</p></div>`;
    } else if (t === 'items') {
      body = `<div class="grid2"><div class="stat"><h3>Tonic ×${S.items.tonic}</h3><p>Restores 45% HP.</p><button class="btn" id="useT" ${S.items.tonic && s.hp < s.maxHp ? '' : 'disabled'}>Use</button></div><div class="stat"><h3>Ether ×${S.items.ether}</h3><p>Restores 12 MP.</p><button class="btn" id="useE" ${S.items.ether && s.mp < s.maxMp ? '' : 'disabled'}>Use</button></div>
        ${S.f.shard ? '<div class="stat"><h3>Drag Shard</h3><p>Green stone from Fratenaptor\'s tomb. It drinks mana from the air. +1 MP every turn in battle.</p></div>' : ''}<div class="stat"><h3>Ilya's ribbon</h3><p>Half a green silk ribbon, tied in a terrible knot. "So you can always find me."</p></div>${S.f.hoodGiven ? '<div class="stat"><h3>Grandfather\'s hood</h3><p>Mended a hundred times. No one ever saw his eyes.</p></div>' : ''}</div>`;
    } else if (t === 'quests') {
      body = `<div class="stat"><h3>Main</h3><p>${esc(S.quest || '—')}</p></div>` + (S.side ? `<div class="stat" style="margin-top:6px"><h3>Side</h3><p>${esc(S.side)}</p></div>` : '') +
        `<div class="stat" style="margin-top:6px"><h3>Suspicion ${Math.floor(S.sus)}/5</h3><p>How sure the Hollow is that a Drag walks among them. Every new person who sees your eyes adds to it. High suspicion closes doors, raises prices — and brings hunters.</p></div>`;
    } else {
      const st = G.settings;
      body = `<div class="grid2"><div class="stat"><h3>Sound effects</h3><button class="btn" data-s="sfx">${st.sfx ? 'On' : 'Off'}</button></div><div class="stat"><h3>Music</h3><button class="btn" data-s="music">${st.music ? 'On' : 'Off'}</button></div>
        <div class="stat"><h3>Timing ring</h3><p>Shows when enemy hits land.</p><button class="btn" data-s="ring">${st.ring ? 'On' : 'Off'}</button></div><div class="stat"><h3>Text speed</h3><button class="btn" data-s="text">${['Slow', 'Normal', 'Fast'][st.text ?? 1]}</button></div></div>
        <div class="btnrow"><button class="btn" id="mSave">Save now</button><button class="btn" id="mCredits">Credits</button><button class="btn" id="mTitle">Title screen</button></div>`;
    }
    $('#menuCard').innerHTML = `<h2>MENU</h2><div class="tabs">${tabs}<button id="mClose" style="margin-left:auto;border-color:#2f8a55;color:var(--green)">Close ✕</button></div>${body}`;
    $$('#menuCard .tabs button[data-t]').forEach(b => bindTap(b, () => { this.menuTab = b.dataset.t; sfx('blip'); this.renderMenu(); }));
    bindTap($('#mClose'), () => this.closeMenu());
    const uT = $('#useT'), uE = $('#useE');
    if (uT) bindTap(uT, () => { if (!S.items.tonic) return; S.items.tonic--; s.hp = Math.min(s.maxHp, s.hp + Math.round(s.maxHp * .45)); sfx('heal'); this.renderMenu(); });
    if (uE) bindTap(uE, () => { if (!S.items.ether) return; S.items.ether--; s.mp = Math.min(s.maxMp, s.mp + 12); sfx('heal'); this.renderMenu(); });
    $$('#menuCard [data-s]').forEach(b => bindTap(b, () => { const k = b.dataset.s; if (k === 'text') G.settings.text = ((G.settings.text ?? 1) + 1) % 3; else G.settings[k] = !G.settings[k]; saveSettings(); if (k === 'music') { const m = World.scene && World.scene.music; Music.stop(); if (G.settings.music && m) Music.play(typeof m === 'function' ? m() : m); } this.renderMenu(); }));
    const ms = $('#mSave'); if (ms) bindTap(ms, () => { save(); toast('Game saved.'); });
    const mc = $('#mCredits'); if (mc) bindTap(mc, () => this.credits());
    const mt = $('#mTitle'); if (mt) bindTap(mt, () => { save(); $('#menu').classList.add('hide'); World.busy = false; this.title(); });
  },
  async credits() {
    let c = { authors: [] }; try { c = await loadJSON('assets/credits.json'); } catch (e) {}
    $('#menu').classList.remove('hide');
    $('#menuCard').innerHTML = `<h2>CREDITS</h2><p>Story, design &amp; code: made for you, with Claude.</p>
      <p class="muted">Character sprites: the Universal LPC Spritesheet Character Generator (Liberated Pixel Cup contributors). Map tiles &amp; props: LPC Revised by Eliza Wyatt (DeathsDarling) and contributors. Licensed CC-BY-SA 3.0 / OGA-BY 3.0 / GPL 3.0 / CC-BY — see OpenGameArt.org.</p>
      <p style="font-size:13px;line-height:1.5">${c.authors.map(esc).join(' · ')}</p>
      <p class="muted" style="font-size:13px">Battle system inspired by Clair Obscur: Expedition 33 and the Naruto RPG on Game Boy Advance.</p>
      <div class="btnrow"><button class="btn pri" id="crClose">Close</button></div>`;
    bindTap($('#crClose'), () => { if (G.mode === 'world' && World.busy) this.renderMenu(); else $('#menu').classList.add('hide'); });
  },
  routeA() {
    if (Dlg.open) { Dlg.advance(); return; }
    if (G.mode === 'battle') { if (Battle.confirmTarget()) return; Battle.menuA(); return; }
    if (G.mode === 'world') World.interact();
  }
};
Input.on('a', UI.routeA);
Input.on('hood', () => World.toggleHood());
Input.on('menu', () => { if (!$('#menu').classList.contains('hide')) { if (G.mode === 'world' && World.busy && !Dlg.open) UI.closeMenu(); } else UI.openMenu(); });
for (let i = 1; i <= 4; i++) Input.on('choice' + i, () => Dlg.choose(i - 1));
bindTap($('#tNew'), () => UI.newGame());
bindTap($('#tContinue'), () => UI.cont());
bindTap($('#tCredits'), () => UI.credits());
