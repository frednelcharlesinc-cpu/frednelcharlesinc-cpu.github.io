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
    let h = card(S.name, s.hp, s.maxHp, s.mp, s.maxMp, Power.badge());
    for (const id of S.party) { const A = ALLY[id], st = S.allies[id] || {}, lv = S.lvl - 1, mh = A.hp + lv * 7, mm = A.mp + lv * 2; h += card(A.name, st.hp ?? mh, mh, st.mp ?? mm, mm); }
    $('#hud').innerHTML = h;
    $('#sus').innerHTML = S.f.hoodGiven ? Array.from({ length: 5 }, (_, i) => `<i class="eye ${i < Math.floor(S.sus) ? 'on' : ''}"></i>`).join('') : '<span class="muted" style="font-size:11px">Thornvale</span>';
    $('#gold').textContent = S.gold + 'g';
    $('#obj').innerHTML = S.quest ? '<b>▸</b> ' + esc(S.quest) : ''; $('#obj').style.display = S.quest ? '' : 'none';
    const bb = $('#bBlood'); if (bb && typeof Bloodlust !== 'undefined') { bb.classList.toggle('hide', !Bloodlust.unlocked()); bb.classList.toggle('on', Bloodlust.on()); bb.textContent = Bloodlust.on() ? 'Bloodlust ●' : 'Bloodlust'; }
    const mb = $('#bMount'); if (mb && typeof Mounts !== 'undefined') { const own = Object.keys(Mounts.owned()); mb.classList.toggle('hide', !own.length || !Mounts.allowedHere()); mb.textContent = S.riding ? 'Dismount' : 'Mount'; mb.classList.toggle('on', !!S.riding); }
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
      const look = defaultLook(); let name = 'Ren', tab = 'me';
      G.S = newState(look, name); const cast = G.S.cast;
      const box = $('#crOpts');
      const swatch = (mat, key) => { const p = G.man.pal[mat][key]; return p ? p[Math.min(3, p.length - 1)] : '#888'; };
      const KCOL = { black: '#2a2a2e', blue: '#3a5fc0', brown: '#7a4e2c', gray: '#8a8f96', green: '#3f8f4a', lavender: '#b39ad8', lightblue: '#8ec8ee', pink: '#f29ac0', red: '#c43c3c', white: '#eeeeee', darkblue: '#24346e', maroon: '#7a2436' };
      let prev = null, prev2 = null, dirI = 0, raf = 0;
      const region = [0, 0, 576, 512];
      const listPreview = (list, cell0) => {
        const out = document.createElement('canvas'); out.width = 576; out.height = 512; const o = out.getContext('2d');
        for (const [pn, col] of list) { const img = G.img['part_' + pn], meta = G.man.parts[pn]; if (!img || !meta) continue;
          const c = document.createElement('canvas'); c.width = 576; c.height = 512; c.getContext('2d').drawImage(img, 0, 0, 576, 512, 0, 0, 576, 512); o.drawImage(recolor(c, meta.mat, meta.base, col), 0, 0); }
        return out;
      };
      const listPortrait = (cv, list, expr, kid) => {
        const x = cv.getContext('2d'); x.imageSmoothingEnabled = false; x.clearRect(0, 0, 32, 36); const ei = Math.max(0, EXPRS.indexOf(expr)), oy = kid ? 15 : 4;
        for (const [pn, col] of list) { const img = G.img['part_' + pn], meta = G.man.parts[pn]; if (!img || !meta) continue;
          const t = document.createElement('canvas'); t.width = 32; t.height = 36; t.getContext('2d').drawImage(img, (pn.startsWith('face_') ? ei * 64 : 0) + 16, img.height - 64 + oy, 32, 36, 0, 0, 32, 36);
          x.drawImage(recolor(t, meta.mat, meta.base, col), 0, 0); }
        glowEyes(x, 32, 36);
      };
      const rebuild = () => {
        if (tab === 'me') { prev = composeLook(look, false, region); prev2 = null; playerPortrait($('#crPort'), 'happy'); }
        else if (tab === 'ilya') { const L = castLists(cast).ilya; prev = listPreview(L); prev2 = null; listPortrait($('#crPort'), L, 'happy', true); }
        else { const L = castLists(cast); prev = listPreview(L.kairo_kid); prev2 = listPreview(L.kairo_b.filter(([p]) => !p.startsWith('katana'))); listPortrait($('#crPort'), L.kairo_b.filter(([p]) => !p.startsWith('katana')), 'neutral', false);
          const px = $('#crPort').getContext('2d'), d = px.getImageData(0, 0, 32, 36), q = d.data;
          for (const [bx, by] of burnPts(27, 29, 1)) { const X = bx - 16, Y = by - 4; if (X < 0 || Y < 0 || X >= 32 || Y >= 36) continue; const i = (Y * 32 + X) * 4, r = q[i], g = q[i + 1], b = q[i + 2];
            if (q[i + 3] && r > b + 18 && r >= g && !(g > 150 && g > r + 40)) { q[i] = r * .45 + 124; q[i + 1] = g * .45 + 44; q[i + 2] = b * .45 + 45; } }
          px.putImageData(d, 0, 0); }
        $('#crNote').innerHTML = tab === 'me' ? "Every Drag's eyes glow green.<br>That part you can't change.<br><span style='color:#ffd88a'>Your story begins when you are ten.</span>"
          : tab === 'ilya' ? "Ilya. Your little sister.<br>Turning six. Unstoppable.<br><span style='color:#ffd88a'>She'll never take off her ribbon.</span>"
          : "Kairo. Your best friend.<br>Your rival. Your brother.<br><span style='color:#ffd88a'>Shown as a kid, then five years later — scarred.</span>";
      };
      const draw = t => {
        if ($('#creator').classList.contains('hide')) return;
        const c = $('#crCv').getContext('2d'); c.imageSmoothingEnabled = false; c.clearRect(0, 0, 64, 64);
        const img = prev2 && Math.floor(t / 4800) % 2 ? prev2 : prev;
        if (img) { const d = ['down', 'left', 'up', 'right'][Math.floor(t / 2400) % 4]; drawOW(c, img, 'walk', d, 1 + Math.floor(t / 110) % 8, 32, 60); }
        raf = requestAnimationFrame(draw);
      };
      const render = () => {
        const obj = tab === 'me' ? look : tab === 'ilya' ? cast.ilya : cast.kairo;
        const row = (label, key, opts, names) => `<div class="opt"><label>${label}</label><button class="arr" data-k="${key}" data-o="${opts}" data-d="-1">◀</button><div class="val">${esc((names || {})[obj[key]] || String(obj[key]).replace(/_/g, ' '))}</div><button class="arr" data-k="${key}" data-o="${opts}" data-d="1">▶</button></div>`;
        const sw = (label, key, mat, opts) => `<div class="opt"><label>${label}</label><div class="sw">${opts.map(o => `<button data-k="${key}" data-v="${o}" class="${obj[key] === o ? 'on' : ''}" style="background:${mat ? swatch(mat, o) : KCOL[o]}" title="${o}"></button>`).join('')}</div></div>`;
        const tabs = `<div class="crTabs">${[['me', 'You'], ['ilya', 'Ilya'], ['kairo', 'Kairo']].map(([k, n]) => `<button data-tab="${k}" class="${tab === k ? 'on' : ''}">${n}</button>`).join('')}</div>`;
        const ILC = ['pink', 'rose', 'black', 'raven', 'dark_brown', 'chestnut', 'ginger', 'blonde', 'platinum', 'white', 'red', 'purple', 'navy', 'green'];
        let body = '';
        if (tab === 'me') body = `<h2>WHO ARE YOU?</h2>
          <div class="opt"><label>Name</label><input id="crName" maxlength="12" value="${esc(name)}" autocomplete="off"></div>
          ${row('Body', 'sex', 'sex', { male: 'Brother to Ilya', female: 'Sister to Ilya' })}
          ${sw('Skin', 'skin', 'body', LOOK_OPTS.skin)}
          ${row('Hair', 'hair', 'hair', HAIR_NAMES)}
          ${sw('Hair color', 'hairCol', 'hair', LOOK_OPTS.hairCol)}
          ${look.sex === 'male' ? row('Facial hair', 'beard', 'beard') : ''}
          ${sw('Gi', 'top', 'cloth', LOOK_OPTS.cloth)}
          ${sw('Pants', 'pants', 'cloth', LOOK_OPTS.cloth)}
          ${sw('Sash', 'obi', 'cloth', LOOK_OPTS.cloth)}
          ${sw('Hood', 'hood', 'cloth', LOOK_OPTS.cloth)}`;
        else if (tab === 'ilya') body = `<h2>YOUR SISTER — ILYA</h2>
          ${sw('Skin', 'skin', 'body', LOOK_OPTS.skin)}
          ${row('Hair', 'hair', 'ilyaHair', ILYA_HAIR_NAMES)}
          ${sw('Hair color', 'hairCol', 'hair', ILC)}
          ${sw('Shirt', 'top', null, G.man.kid.shirts)}
          ${row('Wears', 'skirt', 'skirt', { true: 'Skirt', false: 'Pants' })}
          ${sw(cast.ilya.skirt ? 'Skirt' : 'Pants', 'bottom', null, cast.ilya.skirt ? G.man.kid.skirts : G.man.kid.pants)}`;
        else body = `<h2>YOUR RIVAL — KAIRO</h2>
          ${sw('Skin', 'skin', 'body', LOOK_OPTS.skin)}
          ${row('Hair', 'hair', 'kairoHair', HAIR_NAMES)}
          ${sw('Hair color', 'hairCol', 'hair', LOOK_OPTS.hairCol)}
          ${sw('Gi', 'top', 'cloth', LOOK_OPTS.cloth)}
          ${sw('Pants', 'pants', 'cloth', LOOK_OPTS.cloth)}
          ${sw('Sash', 'obi', 'cloth', LOOK_OPTS.cloth)}
          ${sw('Cape (later)', 'cape', 'cloth', LOOK_OPTS.cloth)}`;
        box.innerHTML = tabs + body + `<div class="btnrow"><button class="btn" id="crRand">🎲 Random</button><button class="btn pri" id="crGo" style="flex:1">Begin ▶</button></div>`;
        const ni = $('#crName'); if (ni) ni.addEventListener('input', e => { name = e.target.value; G.S.name = name || 'Ren'; });
        box.querySelectorAll('.crTabs button').forEach(b => bindTap(b, () => { tab = b.dataset.tab; sfx('blip'); render(); rebuild(); }));
        const OPTS = { sex: LOOK_OPTS.sex, hair: LOOK_OPTS.hair, beard: LOOK_OPTS.beard, ilyaHair: ILYA_HAIR, kairoHair: KAIRO_HAIR, skirt: [true, false] };
        box.querySelectorAll('.arr').forEach(b => bindTap(b, () => { const k = b.dataset.k, L = OPTS[b.dataset.o], i = L.indexOf(obj[k]); obj[k] = L[(i + (+b.dataset.d) + L.length) % L.length];
          if (k === 'sex' && look.sex === 'female') look.beard = 'none';
          if (k === 'skirt') { const L2 = obj.skirt ? G.man.kid.skirts : G.man.kid.pants; if (!L2.includes(obj.bottom)) obj.bottom = L2[0]; }
          sfx('blip'); render(); rebuild(); }));
        box.querySelectorAll('.sw button').forEach(b => bindTap(b, () => { obj[b.dataset.k] = b.dataset.v; sfx('blip'); render(); rebuild(); }));
        bindTap($('#crRand'), () => {
          if (tab === 'me') { look.sex = pick(LOOK_OPTS.sex); look.skin = pick(LOOK_OPTS.skin); look.hair = pick(LOOK_OPTS.hair); look.hairCol = pick(LOOK_OPTS.hairCol.slice(0, 10)); look.beard = look.sex === 'male' ? pick(LOOK_OPTS.beard) : 'none'; ['top', 'pants', 'obi', 'hood'].forEach(k => look[k] = pick(LOOK_OPTS.cloth)); }
          else if (tab === 'ilya') { const I = cast.ilya; I.skin = pick(LOOK_OPTS.skin); I.hair = pick(ILYA_HAIR); I.hairCol = pick(ILC); I.top = pick(G.man.kid.shirts); I.skirt = Math.random() < .6; I.bottom = pick(I.skirt ? G.man.kid.skirts : G.man.kid.pants); }
          else { const K = cast.kairo; K.skin = pick(LOOK_OPTS.skin); K.hair = pick(KAIRO_HAIR); K.hairCol = pick(LOOK_OPTS.hairCol.slice(0, 10)); ['top', 'pants', 'obi', 'cape'].forEach(k => K[k] = pick(LOOK_OPTS.cloth)); }
          sfx('blip'); render(); rebuild(); });
        bindTap($('#crGo'), () => { cancelAnimationFrame(raf); G.S.name = (name || 'Ren').trim().slice(0, 12) || 'Ren'; $('#creator').classList.add('hide'); sfx('start'); resolve(); });
      };
      render(); rebuild(); raf = requestAnimationFrame(draw);
    });
  },
  async newGame() {
    if (loadSave() && !confirm('Start a new game? Your current save will be replaced.')) return;
    audioUnlock();
    // character creation is switched off for now: Ren, Ilya and Kairo use the looks from the portrait art
    $('#title').classList.add('hide'); const nm = await askName(); G.S = newState(defaultLook(), nm); G.S.named = 1; sfx('start');
    G.mode = 'boot'; $('#loading').classList.remove('hide'); $('#loadTxt').textContent = 'Forging your Drag…'; $('#loadBar').style.width = '60%';
    await wait(30); await buildPlayerSprites(); await applyCast(); $('#loading').classList.add('hide');
    $('#fade').classList.add('on');
    await Cine.play(CINE.legend(), { music: 'sad' }); Music.stop();
    G.mode = 'world'; await World.load('thornvale', 9, 14, 'down'); this.controls(true); this.hud();
    Story.run(SCENES.thornvale.onEnter);
    await fadeIn(700); banner('PROLOGUE', 'Thornvale'); save();
  },
  async cont() {
    const s = loadSave(); if (!s) return; audioUnlock();
    G.S = s; $('#title').classList.add('hide');
    if (!G.S.named) { G.S.name = await askName(); G.S.named = 1; }
    G.mode = 'boot'; $('#loading').classList.remove('hide'); $('#loadTxt').textContent = 'Waking up…';
    await wait(30); if (!G.S.cast) G.S.cast = defaultCast(); G.S.arts = G.S.arts.map(k => k === 'draw' ? 'azure' : k === 'cast' ? 'crimson' : k); if (G.S.f.eye && !G.S.arts.includes('sight')) G.S.arts.unshift('sight'); if ((G.S.f.vaneDone || G.S.f.newDawn || G.S.f.cultivation) && !G.S.arts.includes('horizon')) G.S.arts.push('horizon'); if ((G.S.f.adultVane || G.S.f.vaneDone) && !G.S.f.dragonHatched) { G.S.f.dragonHatched = 1; G.S.dragonName = G.S.dragonName || 'Onyx'; setTimeout(() => toast('<b style="color:#8fd0ff">Onyx</b> the baby dragon has joined you — the egg you found in the Realm hatched. (Menu → Companions)', 4500), 1500); } await buildPlayerSprites(); await applyCast(); $('#loading').classList.add('hide');
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
          <div class="stat"><h3>Your Drag</h3><p>Power ${Power.badge()} · Suspicion <b>${Math.floor(G.S.sus)}/5</b></p><p>Saw your eyes: <b>${who.length ? who.join(', ') : 'no one'}</b></p></div>
          <div class="stat"><h3>Choices</h3><p>Halvard: <b>${f.halvardKilled ? 'killed by you' : f.halvardKilledByKairo ? 'killed by Kairo' : 'spared'}</b></p><p>Kess: <b>${f.kessJoined ? 'travels with you' : f.kessRefused ? 'turned you away' : f.kessHelp ? 'helped, then vanished' : 'a stranger'}</b></p>
          <p>Kairo: <b>${f.duel === 'won' ? 'duel won · Ashford spared' : 'duel lost'}${f.halvardKilledByKairo ? ' · he executed Halvard' : ''}</b></p>
          <p>Liora: <b>${f.lioraMet ? 'fought beside you — hunting Dread alone' : 'a stranger on the mill roof'}</b></p>
          <p>Tobb: <b>${f.crateDone ? (f.tobbKnows ? 'prejudiced — but softening' : 'thinks you are a saint') : 'never helped'}</b></p><p>The binding stone: <b>${f.shrineRead ? 'you know the truth' : 'unread'}</b></p></div>
        </div>${typeof ch1Summary === 'function' ? `<div class="stat" style="margin-top:6px">${ch1Summary()}</div>` : ''}<p class="muted" style="margin-top:10px">These choices carry into Chapter II: Greyspire. Don't like how it went? Replay the chapter.</p>
        <div class="btnrow"><button class="btn pri" id="eKeep">Keep exploring</button><button class="btn" id="eReplay">Replay Chapter I</button><button class="btn" id="eTitle">Title screen</button></div>`;
      bindTap($('#eKeep'), () => { $('#menu').classList.add('hide'); this.controls(true); res(); });
      const rp = $('#eReplay'); if (rp) { if (typeof Chapter === 'undefined' || !Chapter.has()) rp.remove(); else bindTap(rp, () => { $('#menu').classList.add('hide'); res(); setTimeout(() => Story.run(() => Chapter.ask()), 300); }); }
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
    const tabs = ['party', 'skills', 'passives', 'arts', 'stones', 'items', 'quests', 'calendar', 'feats', 'map', 'companions', 'world', 'settings'].map(k => `<button data-t="${k}" class="${t === k ? 'on' : ''}">${{ feats: 'Trophies', party: 'Party', skills: 'Skills', passives: 'Passives', arts: 'Arts', stones: 'Stones', items: 'Items', quests: 'Quests', calendar: 'Calendar', map: 'Map', companions: 'Companions', world: 'World', settings: 'Settings' }[k]}</button>`).join('');
    let body = '';
    if (t === 'party') {
      body = `<div class="grid2"><div class="stat"><h3>${esc(S.name)} · ${Power.badge()}</h3><p>HP <b>${s.hp}/${s.maxHp}</b> · MP <b>${s.mp}/${s.maxMp}</b></p><p>ATK <b>${s.atk}</b> · DEF <b>${s.def}</b> · SPD <b>${Math.floor(s.spd)}</b></p><p>EXP <b>${Power.xp()}/${Power.now().hi}</b> · <span style="color:${BAND_COL[Power.now().band]}">${BAND_NAME[Power.now().band]}</span> · Gold <b>${S.gold}</b></p><p>Hood: <b>${S.f.hoodGiven ? (S.hood ? 'up' : 'down') : '—'}</b> · Suspicion <b>${Math.floor(S.sus)}/5</b></p><p>Guild rank: ${S.rank ? `<b style="color:${TIER_COL[S.rank]}">${S.rank}-RANK</b>` : '<b>unregistered</b>'} · Element: <b style="color:#46ff95">none — raw mana</b></p></div>` +
        S.party.map(id => { const A = ALLY[id], lv = S.lvl - 1; return `<div class="stat"><h3>${A.name}</h3><p>ATK <b>${A.atk + lv * 2}</b> · DEF <b>${A.def + lv}</b> · SPD <b>${A.spd}</b></p><p>Arts: <b>${A.arts.map(k => ARTS[k].name).join(', ')}</b></p><p>Link Art: <b>${LINKS[id].name}</b></p></div>`; }).join('') + '</div>';
    } else if (t === 'arts') {
      body = S.arts.map(k => `<div class="stat" style="margin-bottom:6px"><h3>${ARTS[k].name} <span class="muted">· ${ARTS[k].mp} MP</span></h3><p>${ARTS[k].desc}</p></div>`).join('') +
        `<div class="stat" style="margin-bottom:6px"><h3>Drag Reflex <span class="muted">· passive</span></h3><p>A Drag body wastes nothing. Your dodge, parry and timed-hit windows are wider than a human's. Drag enemies dodge and parry more often, and may RIPOSTE when they parry you.</p></div>` +
        `<div class="stat" style="margin-bottom:6px"><h3>Strain ⚡</h3><p>Every Drag Art heats your blood. Strain cools a little each turn — Guard and Cultivate cool it fast. Let it climb past 90% and you fall into <b style="color:#ff6a5a">BLOOD FEVER</b>: Arts locked, HP burning, for 2 turns.</p></div>` +
        (S.arts.includes('azure') && S.arts.includes('crimson') ? `<div class="stat" style="margin-bottom:6px"><h3>??? Eclipse Convergence <span class="muted">· locked</span></h3><p>Blue in the field, then red called through it. Two currents meeting at one point. You can feel its shape. You can't touch it yet.</p></div>` : '') +
        `<div class="stat"><h3>How to fight</h3><p>On your attacks, tap when the gold ring closes for a <b>PERFECT</b> hit (×1.5, can't be dodged or parried).</p><p>On enemy attacks: <b>DODGE</b> (wide window) or <b>PARRY</b> (tight window). Perfect timing earns MP. Parry <b>every</b> hit of an attack to COUNTER.</p><p>Red <b>!!</b> attacks can't be parried — dodge them. Fill an enemy's yellow bar to <b>BREAK</b> them.</p></div>`;
    } else if (t === 'feats') {
      body = typeof featsMenuHTML === 'function' ? featsMenuHTML() : '';
    } else if (t === 'passives') {
      body = typeof passivesMenuHTML === 'function' ? passivesMenuHTML() : '';
    } else if (t === 'skills') {
      body = skillsMenuHTML();
    } else if (t === 'calendar') {
      body = typeof Cal !== 'undefined' ? Cal.html() : '';
    } else if (t === 'world') {
      body = worldMenuHTML();
    } else if (t === 'map') {
      body = mapMenuHTML();
    } else if (t === 'companions') {
      body = companionsMenuHTML();
    } else if (t === 'stones') {
      body = stonesMenuHTML();
    } else if (t === 'items') {
      body = `<div class="grid2"><div class="stat"><h3>Tonic ×${S.items.tonic}</h3><p>Restores 45% HP.</p><button class="btn" id="useT" ${S.items.tonic && s.hp < s.maxHp ? '' : 'disabled'}>Use</button></div><div class="stat"><h3>Ether ×${S.items.ether}</h3><p>Restores 12 MP.</p><button class="btn" id="useE" ${S.items.ether && s.mp < s.maxMp ? '' : 'disabled'}>Use</button></div>
<div class="stat"><h3>Ilya's ribbon</h3><p>Half a green silk ribbon, tied in a terrible knot. "So you can always find me."</p></div>${S.f.bellToken ? '<div class="stat"><h3 style="color:#ffe36a">The Headmaster\'s Bell</h3><p>A small brass bell that hums instead of ringing. "Come to the Guild Citadel in Aurel and ring it."</p></div>' : ''}${S.f.lioraPin ? '<div class="stat"><h3 style="color:#ff9ccc">Liora\'s hairpin</h3><p>A silver spear the length of your finger, tipped with a chip of green stone. Her mother\'s. You promised to give it back.</p></div>' : ''}${S.f.hoodGiven ? '<div class="stat"><h3>Grandfather\'s hood</h3><p>Mended a hundred times. No one ever saw his eyes.</p></div>' : ''}</div>`;
    } else if (t === 'quests') {
      body = `<div class="stat"><h3>Main</h3><p>${esc(S.quest || '—')}</p></div>` + (S.side ? `<div class="stat" style="margin-top:6px"><h3>Side</h3><p>${esc(S.side)}</p></div>` : '') + (typeof questsMenuHTML === 'function' ? questsMenuHTML() : '') +
        `<div class="stat" style="margin-top:6px"><h3>Suspicion ${Math.floor(S.sus)}/5</h3><p>How sure the Hollow is that a Drag walks among them. Every new person who sees your eyes adds to it. High suspicion closes doors, raises prices — and brings hunters.</p></div>`;
    } else {
      const st = G.settings;
      body = `<div class="grid2"><div class="stat"><h3>Sound effects</h3><button class="btn" data-s="sfx">${st.sfx ? 'On' : 'Off'}</button></div><div class="stat"><h3>Music</h3><button class="btn" data-s="music">${st.music ? 'On' : 'Off'}</button></div>
        <div class="stat"><h3>Timing ring</h3><p>Shows when enemy hits land.</p><button class="btn" data-s="ring">${st.ring ? 'On' : 'Off'}</button></div><div class="stat"><h3>Text speed</h3><button class="btn" data-s="text">${['Slow', 'Normal', 'Fast'][st.text ?? 1]}</button></div><div class="stat"><h3>Weather & day/night</h3><p>Living world outdoors: clock, rain, fog, wildlife.</p><button class="btn" data-s="noAmbient">${st.noAmbient ? 'Off' : 'On'}</button></div><div class="stat"><h3>Portrait style</h3><p>Ren & Kairo's dialogue faces.</p><button class="btn" data-s="artStyle">${st.artStyle === 'classic' ? 'Classic' : 'New'}</button></div></div>
        <div class="btnrow"><button class="btn" id="mName">Rename hero</button><button class="btn" id="mSave">Save now</button><button class="btn" id="mCredits">Credits</button><button class="btn" id="mTitle">Title screen</button></div>`;
    }
    $('#menuCard').innerHTML = `<h2>MENU</h2><div class="tabs">${tabs}<button id="mClose" style="margin-left:auto;border-color:#2f8a55;color:var(--green)">Close ✕</button></div>${body}`;
    $$('#menuCard .tabs button[data-t]').forEach(b => bindTap(b, () => { this.menuTab = b.dataset.t; sfx('blip'); this.renderMenu(); }));
    bindTap($('#mClose'), () => this.closeMenu());
    if (t === 'stones') bindStonesMenu();
    if (t === 'skills') bindSkillsMenu();
    if (t === 'passives' && typeof bindPassivesMenu === 'function') bindPassivesMenu();
    if (t === 'map') bindMapMenu();
    if (t === 'companions') bindCompanionsMenu();
    const uT = $('#useT'), uE = $('#useE');
    if (uT) bindTap(uT, () => { if (!S.items.tonic) return; S.items.tonic--; s.hp = Math.min(s.maxHp, s.hp + Math.round(s.maxHp * .45)); sfx('heal'); this.renderMenu(); });
    if (uE) bindTap(uE, () => { if (!S.items.ether) return; S.items.ether--; s.mp = Math.min(s.maxMp, s.mp + 12); sfx('heal'); this.renderMenu(); });
    $$('#menuCard [data-s]').forEach(b => bindTap(b, () => { const k = b.dataset.s; if (k === 'text') G.settings.text = ((G.settings.text ?? 1) + 1) % 3; else if (k === 'artStyle') { G.settings.artStyle = G.settings.artStyle === 'classic' ? 'new' : 'classic'; for (const k2 in PCache) delete PCache[k2]; } else G.settings[k] = !G.settings[k]; saveSettings(); if (k === 'music') { const m = World.scene && World.scene.music; Music.stop(); if (G.settings.music && m) Music.play(typeof m === 'function' ? m() : m); } this.renderMenu(); }));
    const mn = $('#mName'); if (mn) bindTap(mn, async () => { const v = await askName(); G.S.name = v; save(); UI.hud(); toast(`You are now <b>${esc(v)}</b>.`); this.renderMenu(); });
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

/* ---------- choose the hero's name at the start ---------- */
function askName() {
  return new Promise(res => {
    const ov = document.createElement('div'); ov.className = 'ov'; ov.style.cssText = 'z-index:60;background:radial-gradient(ellipse at center,#10301c,#050806);flex-direction:column;gap:14px';
    ov.innerHTML = `<div style="font-family:'Press Start 2P';color:var(--green);font-size:clamp(12px,2.2vw,16px);text-shadow:0 0 12px #46ff95">WHAT IS YOUR NAME?</div>
      <input id="nmIn" maxlength="12" value="${esc((G.S && G.S.name) || 'Ren')}" autocomplete="off" spellcheck="false" style="font:600 22px 'Nunito',sans-serif;text-align:center;width:min(70vw,320px);padding:10px;border-radius:10px;border:2px solid #2f8a55;background:#0c1a12;color:#e8fff0;outline:none">
      <div class="muted" style="font-size:13px">You can change it later in Settings.</div>
      <div class="btnrow"><button class="btn" id="nmDef">Keep "Ren"</button><button class="btn" id="nmGo" style="border-color:#46ff95;color:#46ff95">Begin ▶</button></div>`;
    document.body.appendChild(ov);
    const inp = ov.querySelector('#nmIn'); setTimeout(() => { inp.focus(); inp.select(); }, 60);
    const go = v => { v = (v || '').replace(/[<>{}]/g, '').trim().slice(0, 12) || 'Ren'; ov.remove(); res(v); };
    bindTap(ov.querySelector('#nmGo'), () => go(inp.value)); bindTap(ov.querySelector('#nmDef'), () => go('Ren'));
    inp.addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Enter') go(inp.value); });
  });
}
