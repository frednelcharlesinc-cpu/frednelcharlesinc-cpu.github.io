'use strict';
/* MOVE PICTURES — a small painted medallion for every move on the battle move bar and in Meditation.
   Drawn as vector art so they stay sharp on any phone and cost nothing to load. */
const MoveIcon = (function () {
  let n = 0;
  const wrap = (bg1, bg2, rim, body) => { const id = 'mi' + (n++);
    return `<svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true"><defs>
      <radialGradient id="${id}" cx="40%" cy="32%" r="75%"><stop offset="0" stop-color="${bg1}"/><stop offset="1" stop-color="${bg2}"/></radialGradient>
      <filter id="${id}g" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
      <circle cx="32" cy="32" r="30" fill="url(#${id})" stroke="${rim}" stroke-width="2.5"/>
      <g filter="url(#${id}g)">${body}</g></svg>`; };
  const P = {
    // ---- Vane's sword style (physical) ----
    horizon: () => wrap('#3a4a52', '#0d1418', '#cfe8ff', `<path d="M8 40 H56" stroke="#7a8a94" stroke-width="2"/><circle cx="32" cy="40" r="9" fill="#ffd89a" opacity=".55"/>
      <path d="M6 33 Q32 27 58 31" stroke="#fff" stroke-width="3.5" fill="none" stroke-linecap="round"/><path d="M14 31 Q32 28 50 30" stroke="#bfe8ff" stroke-width="1.2" fill="none"/>`),
    mirage: () => wrap('#2c3440', '#0b0f14', '#cfe8ff', `<g fill="#9fb8c8"><path d="M14 46 l4-20 4 2-2 18z" opacity=".3"/><path d="M24 46 l4-20 4 2-2 18z" opacity=".55"/></g>
      <path d="M34 46 l4-20 4 2-2 18z" fill="#e8f6ff"/><path d="M12 22 L52 44" stroke="#fff" stroke-width="3" stroke-linecap="round"/><path d="M18 18 L50 36" stroke="#bfe8ff" stroke-width="1.2" opacity=".7"/>`),
    sever: () => wrap('#3c5868', '#0c1820', '#e8f6ff', `<g stroke="#dff4ff" stroke-width="2.2" stroke-linecap="round"><path d="M32 14 V50 M17 23 L47 41 M17 41 L47 23"/><path d="M28 16 l4 4 4-4 M28 48 l4-4 4 4" fill="none"/></g>
      <path d="M10 50 L54 12" stroke="#fff" stroke-width="4" stroke-linecap="round"/>`),
    cleave: () => wrap('#6a3a1a', '#1c0c04', '#ffb070', `<path d="M30 54 L34 54 L34 22 L30 22z" fill="#5a3a22"/><path d="M18 26 Q32 6 46 26 L40 30 Q32 18 24 30z" fill="#d8d8d8" stroke="#fff" stroke-width="1"/>
      <g fill="#ffb040"><circle cx="16" cy="44" r="2"/><circle cx="48" cy="46" r="1.6"/><circle cx="22" cy="50" r="1.2"/><circle cx="44" cy="38" r="1.3"/></g>`),
    needle: () => wrap('#4a2a5a', '#120818', '#d8a0ff', `<g stroke="#f0d8ff" stroke-width="2.4" stroke-linecap="round"><path d="M12 22 L46 30"/><path d="M12 32 L50 34"/><path d="M12 42 L46 38"/></g>
      <path d="M46 30 l8 1 -8 2z M50 34 l8 0 -8 1.6z M46 38 l8 -1 -8 -2z" fill="#fff"/>`),
    wyrm: () => wrap('#5a1a2a', '#16050a', '#ff8aa8', `<path d="M10 54 L40 24" stroke="#c8a070" stroke-width="3.2" stroke-linecap="round"/><path d="M38 26 L52 12 L46 30z" fill="#eef" stroke="#fff" stroke-width="1"/>
      <g fill="none" stroke="#ff6a8a" stroke-width="1.6"><path d="M40 40 q6 -6 12 0"/><path d="M36 48 q6 -6 12 0"/></g>`),
    attack: () => wrap('#6a2a1a', '#160604', '#ffb08a', `<g stroke-linecap="round"><path d="M16 48 L44 16" stroke="#e8e8f0" stroke-width="4"/><path d="M48 48 L20 16" stroke="#e8e8f0" stroke-width="4"/>
      <path d="M13 43 l8 8 M43 43 l8 8" stroke="#c89a5a" stroke-width="4"/></g><circle cx="32" cy="32" r="3" fill="#ffd36a"/>`),
    // ---- Drag Arts and other specials ----
    fang: () => wrap('#1f6a42', '#031a0c', '#7dffb0', `<path d="M20 12 Q44 26 40 54 Q34 34 20 12z" fill="#7dffb0"/><path d="M24 16 Q40 28 38 46" stroke="#e8fff0" stroke-width="1.4" fill="none"/>`),
    ward: () => wrap('#1a5a3a', '#031a0c', '#7dffb0', `<path d="M32 10 L51 21 V43 L32 54 L13 43 V21z" fill="#46ff95" fill-opacity=".22" stroke="#9dffc4" stroke-width="2.4"/>
      <path d="M32 18 L44 25 V39 L32 46 L20 39 V25z" fill="none" stroke="#7dffb0" stroke-width="1.2" opacity=".8"/>`),
    ruin: () => wrap('#235a2a', '#041204', '#9dff7d', `<g fill="#9dff7d">${[[14, 14], [26, 10], [40, 12], [50, 20], [20, 26], [34, 24], [46, 32]].map(([x, y]) => `<path d="M${x} ${y} l3 0 l4 14 l-3 0z" transform="rotate(-20 ${x} ${y})"/>`).join('')}</g>
      <path d="M10 52 Q32 44 54 52" stroke="#3a8a2a" stroke-width="3" fill="none"/>`),
    crimson: () => wrap('#8a1a10', '#1c0402', '#ff8a5a', `<circle cx="32" cy="34" r="13" fill="#ff4a1a"/><circle cx="32" cy="34" r="7" fill="#ffd060"/>
      <path d="M22 26 Q24 12 32 8 Q30 18 38 14 Q44 22 40 26" fill="#ff7a2a" opacity=".85"/>`),
    azure: () => wrap('#1a4a8a', '#020c1c', '#7ad0ff', `<circle cx="32" cy="30" r="13" fill="#3aa8ff" fill-opacity=".85"/><circle cx="28" cy="26" r="4" fill="#dff4ff" opacity=".8"/>
      <path d="M10 48 Q18 42 26 48 T42 48 T58 48" stroke="#7ad0ff" stroke-width="3" fill="none" stroke-linecap="round"/>`),
    sight: () => wrap('#1f6a42', '#031a0c', '#e8fff0', `<g stroke="#7dffb0" stroke-width="2" stroke-linecap="round">${[0, 45, 90, 135, 180, 225, 270, 315].map(r => `<path d="M32 10 V16" transform="rotate(${r} 32 32)"/>`).join('')}</g>
      <path d="M14 32 Q32 18 50 32 Q32 46 14 32z" fill="#0a2014" stroke="#9dffc4" stroke-width="2"/><circle cx="32" cy="32" r="6" fill="#46ff95"/><circle cx="32" cy="32" r="2.4" fill="#021"/>`),
    eclipse: () => wrap('#3a1a4a', '#06020c', '#e0b0ff', `<path d="M32 16 A16 16 0 0 0 32 48z" fill="#ff4a1a"/><path d="M32 16 A16 16 0 0 1 32 48z" fill="#3aa8ff"/><circle cx="32" cy="32" r="16" fill="none" stroke="#fff" stroke-width="1.5"/>`),
    moonstep: () => wrap('#3a2a5a', '#0a0614', '#e0d0ff', `<path d="M38 12 A16 16 0 1 0 50 36 A12 12 0 1 1 38 12z" fill="#f0e8ff"/>
      <g fill="#b8a8e8"><ellipse cx="18" cy="48" rx="3" ry="5" transform="rotate(-20 18 48)"/><ellipse cx="28" cy="52" rx="3" ry="5" transform="rotate(-20 28 52)"/></g>`),
    veil: () => wrap('#3a3a4a', '#08080c', '#c8c8e0', `<g fill="none" stroke="#c8c8e0" stroke-width="3" stroke-linecap="round"><path d="M14 40 q6 -10 14 -4 q8 6 14 -4"/><path d="M18 28 q6 -8 12 -2 q6 6 12 -2" opacity=".7"/><path d="M20 50 q6 -6 12 0 q6 6 12 0" opacity=".5"/></g>`),
    link: () => wrap('#2a5a4a', '#04140e', '#ffd36a', `<circle cx="25" cy="32" r="11" fill="none" stroke="#7dffb0" stroke-width="4"/><circle cx="39" cy="32" r="11" fill="none" stroke="#ffd36a" stroke-width="4"/>`),
    eleven: () => wrap('#6a1a3a', '#16040c', '#ffb0d0', `<circle cx="32" cy="32" r="18" fill="none" stroke="#ffb0d0" stroke-width="1.5" stroke-dasharray="2 3.1"/>
      <text x="32" y="40" text-anchor="middle" font-family="Georgia,serif" font-weight="700" font-size="22" fill="#fff">XI</text>`),
    stone: () => wrap('#1a4a3a', '#031008', '#9dffc4', `<path d="M32 10 L48 24 L40 52 L24 52 L16 24z" fill="#46ff95" fill-opacity=".5" stroke="#dfffee" stroke-width="1.6"/><path d="M16 24 H48 M32 10 L28 24 L32 52 L36 24z" stroke="#dfffee" stroke-width="1" fill="none" opacity=".8"/>`),
    star: () => wrap('#2a4a3a', '#04100a', '#9dffc4', `<path d="M32 12 L37 27 L52 27 L40 36 L45 51 L32 42 L19 51 L24 36 L12 27 L27 27z" fill="#9dffc4"/>`)
  };
  // move name → picture
  const RULES = [[/^attack$/i, 'attack'], [/horizon/i, 'horizon'], [/mirage/i, 'mirage'], [/sever|snow/i, 'sever'], [/cleave|forge/i, 'cleave'], [/viper|needle/i, 'needle'], [/wyrm|pierc/i, 'wyrm'],
    [/fang/i, 'fang'], [/field|ward/i, 'ward'], [/ruin|verdant/i, 'ruin'], [/crimson/i, 'crimson'], [/azure/i, 'azure'], [/eclipse|convergence/i, 'eclipse'],
    [/ascen|transform|wyrmshade|sight/i, 'sight'], [/moon/i, 'moonstep'], [/smoke|veil|shadow/i, 'veil'], [/link|twin|eclipse/i, 'link'], [/eleven/i, 'eleven'],
    [/stone|shard|scale|verdict|heart/i, 'stone']];
  return function (name) { const k = (RULES.find(r => r[0].test(name)) || [0, 'star'])[1]; return P[k](); };
})();
