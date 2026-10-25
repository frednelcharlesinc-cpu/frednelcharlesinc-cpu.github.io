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
      playerPortrait(L.querySelector('canvas'), this.lastMe); L.querySelector('.tag').textContent = G.S.name;
      L.classList.remove('dim', 'off'); R.classList.toggle('off', !this.partner); R.classList.add('dim');
    } else if (who) {
      const C = CHAR[who] || { name: who, sprite: who };
      this.partner = who;
      const img = G.img[C.sprite || who];
      if (img) portraitTo(R.querySelector('canvas'), img, expr, C.kid || (C.sprite || '').startsWith('kid') || C.sprite === 'pip' || C.sprite === 'ilya'); R.querySelector('.tag').textContent = C.name;
      R.classList.remove('dim', 'off'); R.classList.toggle('shine', /^liora/.test(C.sprite || ''));
      playerPortrait(L.querySelector('canvas'), this.lastMe); L.querySelector('.tag').textContent = G.S.name;
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
      const nm = $('#dlgName'); nm.textContent = who === 'me' ? G.S.name : C ? C.name : ''; nm.className = who && who !== 'me' ? 'npc' : '';
      const tx = $('#dlgText'); tx.className = who ? '' : 'narr';
      text = this.fmt(text); tx.textContent = ''; $('#dlgChoices').innerHTML = ''; $('#dlgMore').style.visibility = 'hidden';
      this.full = text; this.res = res; this.choices = choices; this.typing = true;
      let i = 0; clearInterval(this.timer);
      const sp = [28, 16, 6][G.settings.text ?? 1];
      this.timer = setInterval(() => { i += 1; tx.textContent = text.slice(0, i); if (i % 3 === 0) sfx('blip'); if (i >= text.length) this.finish(); }, sp);
    });
  },
  finish() {
    clearInterval(this.timer); this.typing = false; $('#dlgText').textContent = this.full;
    if (this.choices) {
      const box = $('#dlgChoices'); box.innerHTML = '';
      this.choices.forEach((c, i) => {
        const b = document.createElement('button'); b.className = 'choice'; b.textContent = this.fmt(c);
        bindTap(b, () => this.choose(i)); box.appendChild(b);
      });
    } else $('#dlgMore').style.visibility = 'visible';
  },
  choose(i) { if (!this.res || !this.choices || i >= this.choices.length) return; sfx('blip'); const r = this.res; this.res = null; this.choices = null; r(i); },
  advance() {
    if (!this.open) return false;
    if (this.typing) { this.finish(); return true; }
    if (!this.choices && this.res) { const r = this.res; this.res = null; r(); }
    return true;
  }
};
bindTap($('#dlg'), e => { if (e.target.closest('.choice')) return; Dlg.advance(); });
const say = (who, expr, text) => Dlg.line(who, expr, text);
const me = (expr, text) => Dlg.line('me', expr, text);
const narr = text => Dlg.line(null, null, text);
const ask = (who, expr, text, choices) => Dlg.line(who, expr, text, choices);

/* ---- link-art cut-in (from the Naruto RPG combo scenes) ---- */
async function cutIn(title, a, b, lines) {
  const el = $('#cutin'); el.classList.remove('hide'); sfx('cutin');
  el.querySelector('.ttl').textContent = title;
  const ca = $('#ciA'), cb = $('#ciB');
  if (a === 'me') playerPortrait(ca, 'anger'); else portraitTo(ca, G.img[CHAR[a].sprite], 'anger');
  if (b === 'me') playerPortrait(cb, 'anger'); else portraitTo(cb, G.img[CHAR[b].sprite], 'anger');
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
