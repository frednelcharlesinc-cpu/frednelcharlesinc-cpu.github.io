# SPRITES.md — handbook for Chat C (Sprites & Animation)

Read `COORDINATION.md` first (lanes, claims, deploy). Everything below is how the art pipeline works today.

## The owner's rules for art
- Use the owner's art. Never copy copyrighted characters (don't name existing anime/game characters in prompts).
- Liora is a teenager — never sexualised. Kids stay kids.
- Image prompts: ONE prompt per character, in a code block, as few images as possible (their tool has limits).
- Small heads like Ren's sprite (head ≈ 1/7 of body height, not chibi). Pure white background, labelled rows.
- Keep everything in chat — no doc artifacts. Share ideas to improve the game proactively.

## How a sprite reaches the screen
- **HD sets** live in `assets/hd/hd.json` + `assets/hd/<img>.png|webp` (webp preferred, png fallback; `HD.lateLoad`).
  A set: `{img, faces:'right'|'left', frames:[[x,y,w,h,ax,ay,ref],…], anims:{name:[frameIdx…]}}`.
  `ax,ay` = feet anchor in the frame; `ref` = the pixel height that maps to the standard figure height (`HD.BT_H` in battle,
  world height in the overworld). Same `ref` across a set keeps its frames the same scale; changing `ref` resizes the character.
- **Which set is used** — `HD.setOf(name, key)` in `js/hdsprites.js`: `c_<enemyKey>` (a sheet made for that exact enemy) beats
  `c_<name>` (the shared sprite name, e.g. `m_drake`). NPCs/CHAR use `sprite`, enemies use `ENEMY[key].img`.
- **World anims**: `ow_down`, `ow_down_walk`, `ow_side`, `ow_side_walk`, `ow_up`, `ow_up_walk`, `ow_idle` (pool), `ow_hood`.
  Side views are mirrored for left. Pool extras (js/pool.js): `em_talk em_nod em_laugh em_angry em_sad em_shock`,
  `g_point g_wave g_bow g_cross g_kneel g_sit`, `work`. Scripted: `World.pose(id, 'g_kneel', ms)`; speakers auto-emote from the line's expression.
- **Battle anims** (what combat code asks for): `combat idle walk run draw fist guard victory slash halfslash backslash cmb1…cmb6
  thrust thr spellcast special parry pp1 pp2 pp3 ppfin dodge pdodge pd1…pd4 hurt ko jump land`.
  Special meaning: `desperate` (js/mobs.js — having it GIVES the monster a "Desperate Stand" buff under 30% HP — gameplay!),
  `enraged` (js/wild.js — shown while an alpha is BERSERK).
- **Ren**: battle sheet = `HD.battleSet()` / `B.renBts`; his Transcension Stage II swaps to set `ren_t2` (js/burst.js, end of file).
  Transcension cut-in art: `assets/burst/ren_p1.png`, `ren_p2.png`, `ren_eyes.jpg`.
- **Portraits**: `assets/art.json` → `portraits[id] = [expr…]`, files `assets/portraits/<id>_<expr>.png|webp` (444×480 busts).
  `ART_ID` maps a CHAR id to another portrait id (e.g. `hesk → reg`).
- Single-pose sets (`H.single`) get procedural motion in `HD.bt`.

## The animation pool (standard sheets → automatic cutting)
- Templates: `/home/claude/eb-build/pool/life_template.png` (world & dialogue) and `battle_template.png` (6 rows, facing right).
- Cut + wire a sheet: `cd /home/claude/eb-build/pool && python3 pool_cut.py <sheet.jpg> <key> life|battle [--left] [--monster] [--rescale] [--portraits]`
  - `<key>` = sprite name (`m_goblin`) OR an enemy key (`sw_spider`) for a one-off look. Builds `c_<key>` from every sheet that key has.
  - Keeps every frame the artist drew; erases ground lines, labels and lone sparks; splits touching frames.
  - Keeps the size the game already drew an existing set at (pass `--rescale` to use the sheet's own size).
  - Keys starting `m_`/`b_` (or `--monster`): row 6's last frames become `enraged` (and `desperate` if the old set had it).
  - Waist-up emotes become dialogue portraits (only if the character has no painted ones, or `--portraits`).
  - Check the cut: `python3 peek.py <key> battle|life` → scratchpad `peek_<key>.png`.
- Mirror copy of the tool for the repo: `out/tools/pool/` — copy `pool_cut.py` there after changing it.
- Custom (non-template) sheets: see `art11/build_rt2.py` (Ren Stage II), `art13/build.py` (Hesk, Nix), `art14/build.py` (Corvin, Bertrand) —
  manual boxes per row, same output format.

## 12 × 12 sheets (owner's standard from 2026-11-11)
- Prompts: MASTER A (people) / MASTER B (monsters) / boss line — rows in `tools/pool/spec.py` BATTLE12 / MONSTER12.
- Cut: `python3 tools/pool/pool_cut.py <sheet> <key> battle12|monster12` (works from the repo copy; writes straight into assets/).
  Every game anim gets its own frames: cmb1–6 from COMBO A/B, pp1–3/ppfin from the perfect-parry counter, pd1–4 from the perfect dodge, rise, victory2 (taunt).
  Monsters: RAGE row → `enraged`; `desperate` only if the old set had it (it's a gameplay buff in mobs.js).
- Weapons must match the character every time (see the weapon list in COORDINATION "For A").
- Red Veil stays as it is for now (owner, 2026-11-11).

## Transcension sheets (js/transform.js)
- One 12×12 sheet per hero per stage: cut with `pool_cut.py <sheet> <hero>_t2 battle12` → `c_<hero>_t2` (Ren: key `ren_t3` etc. — rename the built `c_ren_t3` set to `ren_t3`).
- Kess's 12×12 sheet (2026-11-11) came in as a 1375-px JPG — ask for full-size PNGs; battle refs were scaled by 1/0.82 to match Ren's height.

## Fighting styles (js/fightstyle.js)
- `FightStyle.T[key]` = {n, col, mark, dodge, parry}; key = hero id / enemy key base / sprite family. Unknown fighters use `DEF`.
- Add a line there for every new character so their hits, parries and dodges look like their own martial art.

## Sharp drawing
- Always draw HD frames with `HD.dI(...)` (not `c.drawImage`): it picks a pre-halved copy so shrunk art stays clean.

## Wardrobe (js/wardrobe.js)
- Outfits: any HD set named `<base>_o_<id>` or `c_<hero>_o_<id>` appears in the Wardrobe by itself. Cut an outfit sheet with
  `pool_cut.py <sheet> ren_o_ronin battle` (→ `c_ren_o_ronin`); optional set fields `label`, `unlock` (a `G.S.f` flag).
- Dyes are built in the browser: Main = dark cloth, Accent = red–violet trim and hair. Heroes: me/ren, veil, kess, liora, oren, dace, tamsin.
- Sprite style from 2026-11-11: realistic proportions, NOT chibi (head ≈ 1/8 of body height).

## Testing
- Local server: `cd /home/claude/eb-build/out && python3 -m http.server 8765` (run in background).
- Playwright harness: `/tmp/claude-0/-home-claude/7a5a8c55-a33b-57be-9427-8927ce3db7fc/scratchpad/pt/` (`au*.py`, start from `au30.py`:
  boots a game, `Battle.start({enemies:[…]})`, screenshots). Use `void` before long promises in `evaluate`.
- Always look at a screenshot of the sprite in battle AND in the world before deploying.

## Open sprite work (as of 2026-11-11)
- Two demo pool sets not attached to anyone yet: `c_duelist` (rapier fighter, blue coat) and `c_lad` (green-tunic boy, life sheet) — ask the owner who they are.
- Per-enemy roster: the owner has a list of one-line prompts (bandits, Crown/Church, beasts, drakes, goblins/orcs/ratfolk, undead,
  lizardfolk, demons). ★-marked ones currently borrow badly wrong sprites (sw_spider uses the drake, sw_ooze the ghoul, gt_imp the goblin hexer…).
- Ren Transcension Stage III (Dragonoid) sheet — owner is generating it; wire like `ren_t2` (Stage III code lives in A's `burst.js`: ask A).
- Other heroes' Transcension sheets (Kess NIGHTFALL, Liora, Oren, Dace, Tamsin) — not made yet.
- Nix: his sheet's idle row is waist-up, so `c_nix` idles on walk frame 0 — a full-body idle row would be better.
- Moss (Drag smith's apprentice) uses `folk5` — needs her own sprite + portrait. Dax costume sheet pending.
- NAME CLASH (A is handling the lore side): the portraits `corvin` and `bertrand` were painted for Bandit Kings Corvin Ash / Bertrand Gall,
  but A gave them to the Kess-arc villains. Don't build more on those two portraits until A and the owner decide.
