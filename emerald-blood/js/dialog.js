// every speaker gets their own name colour, so you always know who is talking
const SPEAKER_COL = { me: '#5dff9a', kairo: '#a9c4ff', kairoKB: '#a9c4ff', kairoB: '#a9c4ff', ilya: '#ff9ad5', liora: '#ff6b8b', vane: '#d9e2ec', nana: '#9be37a', oren: '#ffb070', kess: '#c99bff', kessE: '#c99bff',
  tamsin: '#ff9a52', tamsinK: '#ff9a52', bo: '#c8a27a', boK: '#c8a27a', lark: '#ffe066', larkK: '#ffe066', nix: '#e8e8ff', nixK: '#e8e8ff', dace: '#ff7a3a', sefa: '#7fe8c0',
  halvard: '#ffd700', voss: '#c0c8d0', dread: '#7dffb0', seraphine: '#d6a8ff', brom: '#ffbf80', sylwen: '#b8f0ff', caspian: '#cfe0ff', varro: '#ffcf4a', cael: '#e8f4ff' };
function speakerCol(who) { if (!who) return '#ffd88a'; if (SPEAKER_COL[who]) return SPEAKER_COL[who]; let h = 0; for (const ch of String(who)) h = (h * 31 + ch.charCodeAt(0)) % 360; return `hsl(${h},75%,72%)`; }
'use strict';
/* ================= DIALOG: side portraits with expressions + cut-ins ================= */
const CHAR = {}; // filled by story.js: id -> {name, sprite, color}
const Dlg = {
  open: false, typing: false, full: '', res: null, choices: null, timer: 0, partner: null, lastMe: 'neutral',
  show() {
    if (!this.open) { this.open = true; $('#dlg').classList.remove('hide'); UI.controls(false); }
  },
  close() {
    this.open = false; clearInterval(this.timer); $('#dlg').classList.add('hide'); this.res = null; this.choices = null; this.partner = null; this.lastMe = 'neutral';
    if (G.mode === 'world') UI.controls(true);
  },
  fmt(t) {
    const S = G.S; const sib = S ? (S.look.sex === 'female' ? 'big sister' : 'big brother') : 'big brother';
    const Sib = sib[0].toUpperCase() + sib.slice(1);
    return t.replace(/\{name\}/g, S ? S.name : 'Ren').replace(/\{sib\}/g, sib).replace(/\{Sib\}/g, Sib)
      .replace(/\{they\}/g, S && S.look.sex === 'female' ? 'she' : 'he').replace(/\{them\}/g, S && S.look.sex === 'female' ? 'her' : 'him');
  },
  setPortraits(who, expr) {
    const L = $('#portL'), R = $('#portR');
    if (who === 'me') {
      this.lastMe = expr || 'neutral';
      drawPortrait(L.querySelector('canvas'), 'me', this.lastMe, 1); L.querySelector('.tag').textContent = G.S.name;
      L.classList.remove('dim', 'off'); R.classList.toggle('off', !this.partner); R.classList.add('dim');
    } else if (who) {
      const C = CHAR[who] || { name: who, sprite: who };
      this.partner = who;
      drawPortrait(R.querySelector('canvas'), who, expr, -1); R.querySelector('.tag').textContent = C.name;
      R.classList.remove('dim', 'off'); R.classList.toggle('shine', /^liora/.test(C.sprite || ''));
      drawPortrait(L.querySelector('canvas'), 'me', this.lastMe, 1); L.querySelector('.tag').textContent = G.S.name;
      L.classList.remove('off'); L.classList.add('dim');
      if (C.noMe) L.classList.add('off');
    } else {
      L.classList.add('dim'); R.classList.add('dim');
      if (!this.partner) { L.classList.add('off'); R.classList.add('off'); }
    }
  },
  line(who, expr, text, choices) {
    return new Promise(res => {
      this.show();
      this.setPortraits(who, expr);
      const C = who && who !== 'me' ? (CHAR[who] || { name: who }) : null;
      const nm = $('#dlgName'); nm.textContent = who === 'me' ? (Veil.on() ? 'Red Veil' : G.S.name) : C ? C.name : ''; nm.className = who && who !== 'me' ? 'npc' : ''; nm.style.color = speakerCol(who);
      const tx = $('#dlgText'); tx.className = who ? '' : 'narr';
      text = this.fmt(text); tx.textContent = ''; $('#dlgChoices').innerHTML = ''; $('#dlgChoiceWrap').classList.remove('scrolls', 'more'); $('#dlgMore').style.visibility = 'hidden';
      this.full = text; this.res = res; this.choices = choices; this.typing = true;
      let i = 0; clearInterval(this.timer);
      const sp = [28, 16, 6][G.settings.text ?? 1];
      this.timer = setInterval(() => { i += 1; tx.textContent = text.slice(0, i); if (i % 3 === 0) sfx('blip'); if (i >= text.length) this.finish(); }, sp);
    });
  },
  finish() {
    clearInterval(this.timer); this.typing = false; $('#dlgText').textContent = this.full;
    if (this.choices) {
      const box = $('#dlgChoices'); box.innerHTML = ''; box.scrollTop = 0;
      const labels = this.choices.map(c => this.fmt(c));
      box.classList.toggle('dense', labels.length > 4);
      box.classList.toggle('two', labels.length > 4 && labels.every(l => l.length <= 34) && innerWidth > 560);
      labels.forEach((txt, i) => {
        const b = document.createElement('button'); b.className = 'choice'; b.textContent = txt;
        // a tap chooses; a drag scrolls the list instead
        let sx = 0, sy = 0, st = 0, moved = false;
        b.addEventListener('pointerdown', e => { e.stopPropagation(); audioUnlock(); sx = e.clientX; sy = e.clientY; st = box.scrollTop; moved = false; b.classList.add('press'); });
        b.addEventListener('pointermove', e => { if (Math.abs(e.clientY - sy) > 8 || Math.abs(e.clientX - sx) > 12 || Math.abs(box.scrollTop - st) > 4) { moved = true; b.classList.remove('press'); } });
        b.addEventListener('pointercancel', () => { moved = true; b.classList.remove('press'); });
        b.addEventListener('pointerleave', () => b.classList.remove('press'));
        b.addEventListener('pointerup', e => { e.stopPropagation(); b.classList.remove('press'); if (!moved && Math.abs(box.scrollTop - st) <= 4) this.choose(i); });
        box.appendChild(b);
      });
      requestAnimationFrame(() => Dlg.scrollUI());
    } else $('#dlgMore').style.visibility = 'visible';
  },
  scrollUI() {
    const box = $('#dlgChoices'), wrap = $('#dlgChoiceWrap'); if (!box || !wrap) return;
    const over = box.scrollHeight > box.clientHeight + 4;
    wrap.classList.toggle('scrolls', over);
    wrap.classList.toggle('more', over && box.scrollTop + box.clientHeight < box.scrollHeight - 4);
    $('#chUp').classList.toggle('off', box.scrollTop <= 2); $('#chDn').classList.toggle('off', box.scrollTop + box.clientHeight >= box.scrollHeight - 2);
  },
  choose(i) { if (!this.res || !this.choices || i >= this.choices.length) return; sfx('blip'); const r = this.res; this.res = null; this.choices = null; r(i); },
  advance() {
    if (!this.open) return false;
    if (this.typing) { this.finish(); return true; }
    if (!this.choices && this.res) { const r = this.res; this.res = null; r(); }
    return true;
  }
};
bindTap($('#dlg'), e => { if (e.target.closest('.choice') || e.target.closest('#dlgChoiceWrap')) return; Dlg.advance(); });
(function () {
  const box = $('#dlgChoices'), step = () => Math.max(60, box.clientHeight * .7);
  box.addEventListener('scroll', () => Dlg.scrollUI(), { passive: true });
  box.addEventListener('pointerdown', e => e.stopPropagation());
  bindTap($('#chUp'), () => { box.scrollBy({ top: -step(), behavior: 'smooth' }); });
  bindTap($('#chDn'), () => { box.scrollBy({ top: step(), behavior: 'smooth' }); });
  addEventListener('resize', () => Dlg.scrollUI());
})();
const say = (who, expr, text) => Dlg.line(who, expr, text);
const me = (expr, text) => Dlg.line('me', expr, text);
const narr = text => Dlg.line(null, null, text);
const ask = (who, expr, text, choices) => Dlg.line(who, expr, text, choices);

/* ---- link-art cut-in (from the Naruto RPG combo scenes) ---- */
async function cutIn(title, a, b, lines) {
  const el = $('#cutin'); el.classList.remove('hide'); sfx('cutin');
  el.querySelector('.ttl').textContent = title;
  const ca = $('#ciA'), cb = $('#ciB');
  drawPortrait(ca, a, artHas(a, 'shout') ? 'shout' : 'anger', 1); drawPortrait(cb, b, artHas(b, 'shout') ? 'shout' : 'anger', 1);
  ca.style.left = '-2%'; cb.style.right = '-2%'; cb.style.left = 'auto';
  ca.style.transform = 'translateX(-100%)'; cb.style.transform = 'translateX(100%) scaleX(-1)';
  await wait(30);
  ca.style.transform = 'translateX(0)'; cb.style.transform = 'translateX(0) scaleX(-1)';
  const ln = el.querySelector('.line');
  for (const [who, text] of lines) {
    ln.querySelector('b').textContent = who === 'me' ? G.S.name : CHAR[who].name;
    ln.querySelector('span').textContent = Dlg.fmt(text);
    await wait(1350);
  }
  el.classList.add('hide');
}
