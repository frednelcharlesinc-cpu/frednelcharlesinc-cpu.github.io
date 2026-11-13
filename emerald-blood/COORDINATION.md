# Emerald Blood — three chats, one game

The owner runs **THREE** Claude chats on this game at the same time, on purpose — it's faster.
Each chat has ONE job. Do your job, stay out of the others', and when in doubt use the table below.

## Which chat am I?
The owner names your role in your first message ("You are Chat A / B / C"). If nobody told you, ask the owner
before touching any file. Sign every claim and log line with your letter.

| Chat | Name | Its job in one sentence |
|---|---|---|
| **A** | Story & Combat | What happens and how it plays: story, quests, dialogue, lore, battle rules & numbers, enemy/character stats, battle UI. |
| **B** | World & Maps | Where it happens: maps, towns, forests, dungeons, props, chests, world camera, battle backdrops, dungeon lieutenants. |
| **C** | Sprites & Animation | How everyone looks and moves: sprite sheets, walks, battle animations, emotes, portraits, visual effects. |

## Lanes (files each chat owns)

**Chat A — Story & Combat**
- story & quests: `story.js`, `ch1.js`, `ch1b.js`, `arcs.js`, `kessarc.js`, `trial.js`, `dawn.js`, `quests.js`, `hmquests.js`, `ledger.js`, `lore.js`, `festival.js`, `events.js`
- combat rules & numbers: `battle.js` (logic & battle UI), `combat*.js`, `burst.js`, `wild.js`, `gear*.js`, `passives.js`, `cores.js`, `clash.js`, `elements.js`, `fourcuts.js`, `mastery.js`, `mobs.js`
- the `ENEMY` / `CHAR` definitions: names, stats, traits, and which sprite key each one uses

**Chat B — World & Maps**
- `forest4.js`, `fc_data.js`, `towns2.js`, `newmaps.js`, `dungeons.js`, `dungeonx.js`, `lieutenants.js`, `sewers.js`, `districts.js`, `worldmap.js`, `mapedit.js`, `worldfeel.js`, `reef.js`
- `assets/map_*`, `assets/props*`, `assets/bd_*` (battle backdrops), `assets/chests.json`, `tools/forestgen/`

**Chat C — Sprites & Animation** — read `SPRITES.md` first
- `hdsprites.js`, `pool.js`, `btsprites.js`, `portraits.js`, `fxsheets.js`, `battlefx.js`
- `assets/hd/` (the sets inside `hd.json`), `assets/portraits/`, `assets/fx/`, `assets/npc/`, `assets/burst/`,
  `/home/claude/eb-build/pool/` + `tools/pool/`, and the `art*/` build scripts

**Shared — claim first, patch surgically, re-read right before writing**
`index.html`, `assets/maps.json` (B owns the map entries), `assets/hd/hd.json` (C owns the sets), `assets/art.json` (C owns portraits),
`sw.js`, `core.js`, `world.js`, `ui.js`, `dialog.js`, `deploy.py`, this file.

## Grey areas — who does it?
| The owner asks for… | Who | How the others help |
|---|---|---|
| a new enemy or boss | **A** writes its stats, trait and fight; **C** makes it look right | A gives it a sprite key; C wires the sheet to that key |
| a new NPC in a town | **A** writes who they are and what they say; **B** decides where they stand (if it's a map change) | C draws them |
| a new map, room or dungeon | **B** | A adds the story/fights inside it in A's own files |
| a new attack or skill | **A** (what it does) | **C** (how it looks: animation + VFX); A calls the anim name C provides |
| a Transcension / transformation | **A** (mechanics, unlocks, cut-in timing) | **C** (sprite sheets, the swap, cut-in art) |
| battle backdrops | **B** | — |
| battle UI / HUD / captions | **A** | C only for icons/art |
| walk cycles, emotes, poses in scenes | **C** | A may call `World.pose(...)` from story code |
| image prompts for the owner | whoever needs the art: **C** for sprites/portraits/VFX, **B** for maps/props/backdrops | — |
| lore, names, factions | **A** | — |
Still unclear? Pick the chat whose one-sentence job above fits best — and say so in the log.

## Rules
1. **Claim** shared files before editing: `python3 tools/claim.py take index.html --who A|B|C` (claims expire after 45 min).
   `python3 tools/claim.py list` shows who holds what. Release when done: `claim.py release index.html --who <you>`.
2. **Never rewrite a whole shared file** from memory. Patch it (exact string replace / JSON key update), re-reading it first.
3. **Don't edit another chat's files.** If you must (a coordinate moved, a hook needed), make the smallest possible patch and log it here.
4. **Cross-lane needs**: story content that needs a map spot reads coordinates from the map data where possible.
   If B moves something the story depends on, B updates the story's coordinates and logs it below.
5. **New files are free** — prefer adding a new file in your lane over editing someone else's.
6. **Deploy only with `python3 /home/claude/eb-build/deploy.py "msg"`** — it locks, pulls the other chats' pushes into
   `out/`, merges index.html / maps.json / hd.json / art.json automatically, and BLOCKS if two chats changed the same file.
   If it blocks: merge that file by hand (keep both chats' changes), then deploy again. Never force-push.
7. **Log** every cross-lane touch and every request for another chat below (newest first). Requests start with "For A/B/C:".

## Requests (owner → a chat)
- **For A (battle UI, from the owner, 2026-11-11):** "There's a lot of information in the battles — keep it, but simplify it so it doesn't get in the way of gameplay."
  B already shortened B's own enemies (boss/lieutenant/right-hand/secret-boss names are short; captions are `Tag · one trick`). Suggestions for `battle.js`:
  1) enemy captions/passive pills: show only for the targeted/acting enemy (not all at once after the opening), one line max, smaller;
  2) name tags: drop the A/B suffix and rank letter unless two of the same enemy are on the field; 3) hint bar ("tap an enemy or ⚔ Attack…"):
  show for the first 2–3 battles only, then hide; 4) turn-order column: thinner, portraits only, max 6; 5) big damage/"*snarl*" popups shorter-lived.
  Info stays reachable by tapping an enemy (full trait/passives card).

- **For C (from B, 2026-11-11):** lieutenant / right-hand art is now yours. B gave the owner sheet prompts for the 16 woods-dungeon lieutenants + 4 right-hands
  (Life + Battle on the pool templates, a 3×2 portrait grid). Please re-issue them in your format (SPRITES.md rules) if they differ. Enemy keys to wire:
  `lt_<dungeon>_<0-3>` and `rh_<dungeon>` (dungeon = d_fang, d_cinder, d_shrine, d_vault, d_warren, d_crypt, d_mire, d_crystal; names in `lieutenants.js` PROFILE).
  Their `img` is copied from the base monster, so a `c_lt_d_cinder_0` set overrides it with no code change. World ents use `npcImg(E.img)`.

## Cross-lane log
- 2026-11-12 · C: owner switched sprite sheets to **7 × 7** (quality over quantity) and **design sheets first**. Cutter kinds `battle7` / `monster7` (tools/pool). Row 3 is DRAW for Ren only; everyone else has their own OPENER.
- **For A (from C, owner's request):** a martial art for every fighter + histories for the 12 majors → `MARTIAL_ARTS.md` (proposal — lore is yours, rename freely). Weapon calls made so sprites stay consistent: Oren = forge hammer, Tamsin = torch-bow (bladed bow she lights), Cael = halberd. `js/fightstyle.js` shows the same names in battle.
- 2026-11-11 · C: Kess's new 12×12 battle sheet is in (`c_kess`, world frames kept). New `js/transform.js` (script tag after burst.js): when a hero transcends, they wear `c_<hero>_t1/_t2` if that set exists (Ren: `ren_t1`, `ren_t3`; Stage II stays burst.js's own swap). It only wraps `Burst.fire`/`Burst.end` — no edits to burst.js.
- **For A (from C):** the owner wants Ren's Stage III (Dragonoid) playable. `Burst.stage()` only returns 1 or 2 today; when A adds stage 3, `js/transform.js` already swaps Ren to `ren_t3`.
- 2026-11-11 · C: SHARP SPRITES — `HD.dI` in hdsprites.js draws shrunk art from a pre-halved copy (no more jaggy/shimmering edges). Also applied to `simplewalk.js` (walk drawing; it isn't in any lane list, so C took it as "walks"). New `js/fightstyle.js` (+1 script tag before battlefx.js): each fighter's martial art sets the colour/shape of their hit marks, parry sparks and dodge effects; `battlefx.js` reads it. Cutter (`tools/pool`) now reads 12×12 sheets: kinds `battle12` / `monster12`.
- **For A (from C, owner's request 2026-11-11):** the owner wants a named martial art per character. C put WORKING names in `js/fightstyle.js` (e.g. Ren = "Vane's Sheathed Sword", Kess = "Shadowstep Knife-Dance", Liora = "Moonwater Spear"). Rename freely there — names are display-only. Weapon clashes to settle with the owner: Oren's sprite holds a SWORD but the story says hammer; Tamsin's sprite holds a BOW but her Transcension says "torch-blade"; Voss's sprite has sword + shield, the story says spear + shield; Halvard's sprite holds a tome, the story says staff.
- 2026-11-11 · C (new file `js/wardrobe.js`, shared `index.html`: 1 script tag after pool.js): WARDROBE — outfits + dyes for Ren, the Red Veil and party heroes, shown at the bottom of the Party tab. It WRAPS `HD.playerSet`/`HD.battleSet`/`HD.setOf` and `UI.renderMenu` (no edits to ui.js). Saves in `G.S.wear`. Note for A & B: claims in `tools/claim.py` are per-workspace, so chats in different workspaces can't see each other's claims; C pulls right before pushing and never force-pushes.
- 2026-11-11 · B: read the three-chat roles. B's workspace is a separate container — `/home/claude/eb-build/` (deploy.py, `.claims.json`) does not exist here,
  so B can't take claims with `claim.py`. B instead: pulls right before every edit, patches shared files surgically, deploys with plain `git pull --rebase` + push
  (never force), and logs every shared-file touch here signed **B**. If you need B to hold off a shared file, write "B: hands off <file>" in Requests.
- 2026-11-11 · A: added Chat C (Sprites & Animation); art files moved from A's lane to C's; added the "Which chat am I?" and grey-area tables. Handbook for C: `SPRITES.md`.
- 2026-11-11 · B (shared `core.js`, owner's request): camera REVERTED to the original — `CAM_TILES` close 10 / normal 12 / wide 15, `DUNGEON_ZOOM` 1, min 15 across. World props now 1.6× (dungeon props +20%) so characters read smaller.
- 2026-11-11 · B (shared `core.js`, owner's request): tighter default — `CAM_TILES` close 5.5 / normal 6.5 / wide 9; min tiles across 9 (8 in dungeons).
- 2026-11-11 · B (shared `core.js`, owner's request): camera tighter on Ren — `CAM_TILES` close 6.5 / normal 8 / wide 11, dungeons ×0.85, min tiles across 11 (9 in dungeons).
- 2026-11-11 · B (battlefields): custom backdrops `assets/bd_fc_{cross,north,east,south,west}.jpg`, `bd_d_{fang,cinder,shrine,vault}.jpg`, boss arenas
  `bd_d_fang_boss` / `bd_d_cinder_boss` (GND .52, registered in `BTBD.GND` from `lieutenants.js`). Fights in those maps that ask for a generic bd
  (forest/field/snow/mire/warren/crypt/crystal) get the local one — done in B's `Battle.start` wrapper, story.js untouched. Built by `tools/forestgen/bf.py`.
- 2026-11-11 · B → A (sizes): `lieutenants.js` scales every dragon in `ENEMY` at load — drakes/wyrms ≥1.7, boss dragons ≥2.1 (`window.isDragon`).
  `dungeons.js` boss ents: size cap 1.6→1.8 (2.4 for dragons). World props ~30% bigger, cliffs/dungeon walls & floors drawn at 64px stones.
- 2026-11-11 · B (shared `core.js`, surgical): camera closer — `CAM_TILES` normal 12→10.5 (close 9, wide 14), dungeons ×0.8 via `DUNGEON_ZOOM`;
  the render loop re-frames when entering/leaving a dungeon (`G.view.mode` key gets `:dungeon`). `props5` atlas version is now a content hash
  (`tools/forestgen` bump) and fc_/d_ maps carry `v` = image hash — fixes phones mixing a cached old atlas/ground with new layouts (the "chopped trees" bug).
  If you regenerate any atlas or map image, change its `?v=` too.
- 2026-11-11 · B (new files): `js/lieutenants.js` + `js/dungeonx.js` — every dungeon with a boss room gets 4 lieutenants (boss keys) and a Right-Hand that
  joins the boss fight. They ADD enemies to `ENEMY` (`lt_<dungeon>_<n>`, `rh_<dungeon>`, `sb_<dungeon>_<n>`) and wrap `Battle.start` only to append the
  Right-Hand when `window.__rhFor` is set by a dungeon boss talk. Relics/secret bosses grant gear via `Gear.give` and `Gear.st().gear.own`. No edits to A's files.
  Shared touches: index.html (2 script tags after pool.js), maps.json (d_fang/d_cinder/d_shrine/d_vault rebuilt 76x52), chests.json (fc_* keys), sw.js bump.
- 2026-11-11 · B → A: moved the Kess arc trail marks and camp in `kessarc.js` to fit the new Old Grove map (fc_west).
- 2026-11-11 · A: merged B's forest push by hand (before this system existed); nothing lost.
