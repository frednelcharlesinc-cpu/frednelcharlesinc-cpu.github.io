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
- **For A (owner-approved, from C, 2026-11-16): Kairo's Transcension should ADAPT.** C renamed the T2 to match your story: it IS Scar Bloom (black scale, claws, crown of burning spines; prompt `kairo_t2`). The duel already adapts (`kairo_duel` morph); this asks for the same when Kairo fights on your side. Mechanic: while transformed, each time Kairo is hit by the same damage type (or the same named move), he takes 15% less from it, stacking up to 3 times (max 45%). Stacks reset when the form ends. Show a stack counter or a short "Adapted" pop on hit. C will flare the ember-plates on his back each time a stack is gained, if A fires an event or sets `actor.adapt = {type: stacks}`. Balance is yours.
- **For A (from C, 2026-11-16):** New T2 forms for everyone are in the prompt pack: Ren "Still Sky" (silver waist-length locs, calm instinct dodges), Kess "Nightfall", Liora "Ghost Unbound", Oren "Forgeheart", Dace "Iron Vow", Tamsin "Wildfire". Names are working names; rename freely. A 7-row transformation-sequence sheet is coming. C will play it before the T2 sprite swap in `js/transform.js`.
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

- **For A (from B, 2026-11-12):** B added 12 "Drag Chronicle" lore stones (`worldplus2.js`, array `LORE`, roman-numbered I–XII) with
  draft text about the Drags, Fratenaptor, Transcension and the Accord. Lore is your lane — rewrite any line freely (keep 12 entries; order = found order doesn't matter).

## Cross-lane log
- 2026-11-16 · **C:** new `js/spritepolish4.js` (after spritepolish3): finisher camera on the last enemy KO (sets `B.timeScale=.35` for 750 ms, `B.punch`, `B.hitstop`, cinema bars), status icons over heads (reads poison/bleed/burn/blind/shield/broken), rank-up light burst on Ren in the world (reads `Power.now().i`).
- 2026-11-16 · **C:** spritepolish3 adds: perfect parry sets `B.hitstop`/`B.punch` (your feats.js freeze+zoom) with a gold flash; enemy tell (crouch + glow) when `B.cur` is an enemy whose `a.next` is heavy/unparryable; knockback `a.kbx` scaled by size on screen only.
- 2026-11-16 · **C:** new `js/spritepolish3.js` (after spritepolish2): weapon trails in each fighter's FightStyle colour, breath fog in snow / drips in rain, and Ren's portrait flashes at the left edge on PERFECT!, perfect dodge/parry, heavy hits and dropping under 25% (wraps `Battle.text` and `Battle.damage`, read-only — damage numbers untouched).
- 2026-11-16 · **C:** new `js/spritepolish2.js` (tag right after ch1shonen.js). Wraps `CINE.legend` (marks your two cold-open shots `ff:1` → drained colour + film grain), `Cine.draw` (Vane's 'One cut.' shot gets a green screen-wide cut and cracks), `Dlg.line` (records speaker+expr so the talking sprite bobs/hops/shakes). Reads `f.ribbon`, `f.isoldeRibbon` to draw the ribbons on Ren. Also: `c_rx_tornear` (grey wolf, torn ear) and Torn-Ear grows across your 3 hunts. No story text changed.
- 2026-11-16 · **C:** `js/spritepolish.js` part 2: sprites take the colour of the map/backdrop; rim light follows sky/weather (reads `Ambient.night`, `WorldFeel.weather()`, `B.wx`/`B.night`); battle states shown on bodies (reads `a.affix` + `AI4.AFFIX` colours, `a.limp`, `a.poison`, `a.bleed`, `B.mor`); Kairo's Bloom ash reads `G.S.f.fs.bloom/ash` and `a.morph`. Read-only — no game state is changed.
- 2026-11-16 · **C:** new `js/spritepolish.js` (script tag at the end of index.html): battle rim light, white hit-flash + impact squash, attack wind-up/stretch, footstep dust for walking NPCs/monsters. Wraps `HD.bt`/`HD.blit` and `Ent.prototype.draw`. Off switch: `G.settings.polish = false`.
- 2026-11-16 · B (new `js/food2.js` + `js/worldplus11.js`, tags after fishing.js): food2 — recipe book (`G.S.food.book`), inn order of the day, raw-food spoilage,
  homestead trap line / smoke rack / aquarium (`G.S.homeUp`), share meals with companions (**calls `Bonds.gain`** — favourite food type per companion is hashed from its key;
  A may set real favourites), fishing bait, autumn Harvest Cook-off in Ashford. worldplus11 — homestead map room, monthly Wandering Colossus world boss, rabbits/bats,
  Ashford carter (25g to any found camp), Vale Drag village rebuild (`G.S.village`, villagers use dfolk*/dkid* sprites; **C: the rebuilt cottage is a placeholder
  procedural sprite — real art welcome**), cartographer + "Pathfinder" title (`G.S.title`), autumn leaf piles & spring hives. Town board now: Odd jobs / Bounties / Town services.
- 2026-11-16 · B: **PROVISIONS + FISHING** (new `js/food.js`, `js/fishing.js`, tags after worldplus10.js). Owner asked for these directly — **A, please review, they touch items/battle:**
  · Ingredient drops on every battle win (4th `Battle.start` wrapper; `G.S.food.ing`), herd animals can be hunted for meat.
  · Cooking (campfires, homestead): pick ≤3 ingredients → timing mini-game → Burnt/Good/Perfect meal (`G.S.food.meals`, key `dish:q`). Eat from the new 🎒 button.
  · **Satchel limits**: tonics 8, ethers 5, meals 8, ingredient stacks 20 (+per satchel level, bought in Ashford's satchel view); extra tonics/ethers are clamped with a toast.
    **Battle Items menu is replaced via the existing `CombatX.menu` hook** (same Tonic/Ether behaviour + meals) and capped at 3 grabs per fight (+1 per satchel level).
  · Fishing reel mini-game replaces the old one-tap fishing (worldplus3 `fish()` delegates): 11 species with pixel art, ★1–★5 difficulty, angler level from catches,
    tackle (rod/reel/line/lures) at the Ashford town board, fish log, Saltreed tournament one week per season. All lines are B drafts.
- 2026-11-16 · A → C (sprite request): new enemies in `enemyai4.js` want their own battle sheets — `ug_noble` (a corrupt tax-farmer/noble mark: fur-trimmed coat, cane, rings; uses Hesk's sprite until it exists) and `ug_fence` (a sly fence: patched coat, knife, coin pouch; uses `bandit` until then). `Gilt Duelist` (`ug_duelist`) now uses the demo set `c_duelist`. Wire to those keys; the game switches automatically once `c_ug_noble` / `c_ug_fence` exist.
- 2026-11-16 · A (new files, A's lane): `enemyai2/3/4.js`, `underworld.js` (three underworld orgs + heists). Fixers are added to `a_inn`, `mb_tavern`, `kb_tavern` from A's code with `freeNear` (no map edits). `atkpad.js` (battle UI): target() skips back-row/hidden enemies and bodyguards can redirect.
- 2026-11-16 · B: **THE FOUR FORESTS ENLARGED** — `fc_north/east/south/west` rebuilt at 96×72 (was 64×48; generator `tools/forestgen/layouts1b.py`, scaled 1.5×
  from the layouts.py plans + new content: a riding meadow, 3 chests and a landmark each). Every FCL-driven spot (story NPC spots, caves, camps, grottos, reefback)
  moved automatically. **Cross-lane surgical patches (A's files):** `kessarc.js` Corvin `freeNear('woods_w', 12, 40)` → `(18, 60)` (×2); `ch1b.js` convoy
  `freeNear('woods', 35, 16)` → `(53, 24)`; `reef.js` exit back to the North Woods now reads `FCL.fc_north.npc.reefback`. **Any hard-coded coordinate on woods_n/e/s/w
  in your code: multiply by 1.5** (round half up). Old saves: `forest4.js` migrates once (flag `G.S.f.fcBig`: player pos, `S.dret`, `S.chests` keys on those maps).
  Also: deep zones now link to each other (N2↔E2↔S2↔W2↔N2); new hidden zone `vale` (map `fc_vale`, `layouts4.py`) opened at the Crossroads after all four
  World's End vistas; `js/worldplus10.js` — Echo Warden boss, four-fragment treasure hunt, herds, meadow races (`G.S.raceBest`), night lords in the deep woods,
  Ashford upgrades (`G.S.townUp`; town board "Fund the town" + "Dungeon reports"). Lines are B drafts.
- 2026-11-16 · C: new `js/monwalk.js` (script tag after simplewalk.js). Monsters/bosses in the world now walk by body type (biped cycle, 4-leg gait, fliers hover + wingbeat) and read forward/back when moving up/down. **For B:** your roaming monsters (worldplus2.js) had no sprite name, so they drew their old low-res art; monwalk wraps `HD.npcName` to name them by `e.roam.enc.enemies[0]` — no edits to worldplus2.js. A set can force its body type with `meta.body = 'quad'|'fly'|'biped'`.
- 2026-11-16 · B: **Deep woods doubled** — `fc_north2/east2/south2/west2` rebuilt at 96×72 (was 64×48) via `tools/forestgen/layouts2b.py` (supersedes layouts2.py —
  don't re-run the old one), with new landmarks + 3 more chests each; parent exits now land at the new entries. New `js/worldplus9.js`: World's End vistas at each
  deep zone's far dead end (`G.S.f.vista_<zone>`), weekly dungeon moods GILDED / DARKNESS / SWARMING / QUIET (third `Battle.start` wrapper: +gold on GILDED wins only;
  scales `SCENES[dungeon].encRate`). Explorer's tally now covers the deep woods (glade, lookout, waystone, vista).
- 2026-11-13 · B (new `js/worldplus8.js` + `js/townlife2.js`, tags after townlife.js; new glade maps `fc_glade_n/e/s/w` via `tools/forestgen/layouts3.py`):
  worldplus8 — fake trees → secret glades (scenes `glade_<zone>`), lookout rocks (reveal mini map), night stepping stones / winter ice / summer dry riverbeds,
  wandering events (burning cart, wounded traveller, lost child), birds from bushes, eyes in the dark, goblin–bandit skirmishes, Drag waystones (`G.S.waystones`,
  second fast-travel net), weather shrines, zones that "remember" you (`G.S.zk` wins per zone → peddler, then settlers + lower encRate), monthly Gate Surge
  (days 8–14: rifts forced, refugees, Scorched Road barricaded via exit `check`), PHOTO MODE (📷 button, `body.photo` hides UI, CSS filters on #game).
  **Second `Battle.start` wrapper** (counts wins per zone only). townlife2 — gifts & hearts for Ashford regulars (wraps their `talk` on load: their own talk runs
  first, then an optional gift prompt), the bard, the Ironjaw Three (`crew_brannoc` clone), lost-and-found job, Inquisition checkpoint on the Ashford→woods exit
  (`check`, every 4th day after `vaneDone`). **For A:** Ashford NPC favourites/heart rewards and all lines are B drafts — please make them yours.
- 2026-11-13 · B: **THE DEEP WOODS** — four new 64×48 zones past each forest's old dead-end road (new maps `fc_north2/east2/south2/west2`, scenes
  `woods_n2` Frostpine Heights, `woods_e2` The Scorched Road, `woods_s2` Saltreed Marsh, `woods_w2` The Drowned Ford; generator `tools/forestgen/layouts2.py`).
  The old "you can't go further" messages now sit at the FAR edge of each new zone, so the story's limits (Mountain Pass, Highmark road, Coast Road, Millbrook) still hold.
  Each zone: 5–6 chests (one behind a waterfall in N/E/W), camp + fire, landmark & lore look-texts, a log shortcut, tougher encounter tables, roamers, caches.
  **For A:** encounter lists in `forest4.js` (`deep(...)`) are B's picks — rebalance freely; landmark texts are drafts.
- 2026-11-13 · B (new files `js/worldplus7.js` + `js/townlife.js`, script tags after worldplus6.js; 1-line patch in worldplus3 fishing for bait):
  worldplus7 — Vessa Crane arc (`G.S.vessa`, joins elder-mark fights), thunderstorms + lightning crystals, blood moon (1 night/week; **wraps `Battle.start`** to elite-clone
  non-boss foes in the woods, `blood_<enemy>`), field journal (`G.S.journal`, records base enemy keys on every win), hidden falls in the 4 forest dungeons (scenes `dfall_<id>`),
  escort jobs (`G.S.escort`), dungeon echo stones after a clear (`G.S.f.decho_<id>`), mount stamina in the woods (`G.S.mstam`; calls `Mounts.ride(null)` only).
  townlife — Ashford: renown (computed), town board with odd jobs (`G.S.jobs`), fountain gossip (wraps tile 30,23), weekly travelling stall, tag with the kids,
  folk greet you by renown (wraps folk `talkLines`/kid `talk` on load), crier shouts your deeds, most folk go home at night, window glows, seasonal bunting.
  **For A:** all Vessa / echo / townsfolk lines are B drafts — rewrite freely (arrays `DECHO`, `GREET`, `hints()`, Vessa in `vessaTalk`).
- 2026-11-13 · B (new file `js/worldplus6.js`, script tag after worldplus5.js): night constellations → star-shards (`G.S.f.star_<scene>`), rival hunter Vessa Crane
  (clones `rival_vessa_<n>` of `bandit`; bounty state `lost`; `G.S.rivalWins`), seasonal bosses (`season_<season>` clones, `G.S.f.sboss_<week>`), repairable bridges/ladders
  (`G.S.f.fix_<scene>_b|l`, opens col; drawn via `Ambient.ground`), forest echoes at the 4 history statues (`G.S.f.echo_<scene>`), night market at the Crossroads (`G.S.market`),
  dungeon run plaques by forest cave mouths (`G.S.dbest`). Vessa Crane is a new named character — A/C may want lines/portrait (currently uses the bandit sprite).
- 2026-11-13 · B (new file `js/worldplus5.js`, script tag after worldplus4.js; worldplus4 extended): hunting horn (`G.S.horn`, wraps forest camp-fire tiles; elite clones `horn_<enemy>`),
  bounty marks track you in snow/mud, shrine chain (`G.S.f.shrine_<scene>`) → stair under the Wayshrine → scene `sanctum` (map fc_grotto_w, boss clone `sanct_keeper`, `G.S.f.sanctum`),
  weekly dungeon treasure map (`G.S.dmap`), fog wisps (`G.S.f.wisp_<scene>_<week>`). Hunter ranks Copper→Mithril (`G.S.bountiesPaid`), weekly elder mark from Silver.
  **Cross-lane (gear, A):** added `RECIPES.huntermantle` + `PARTS.huntermark` (in worldplus4, guarded) — granted at Gold hunter rank. A may rename/rebalance.
  Homestead visitors on hold (owner: waits for the player guild).
- 2026-11-13 · B (new file `js/worldplus4.js`, script tag after worldplus3.js): Wanted board at the Crossroads (weekly bounties, `G.S.bounty`, elite clones `bty_<name>` in ENEMY),
  rare golden deer / spirit fox (flee, reward on catch), weather sight (fog/blizzard shrink `MiniMap.R`; rain fishing in worldplus3, fog chase range in worldplus2),
  restorable ruins (wraps the Crossroads shrine + Mistveil/Emberroot tower `tiles`; `G.S.f.ruin_<scene>`), explorer's tally on the board, night moonstones (`G.S.f.moon_<scene>`),
  homestead in the Old Grove (`G.S.home`, tiers 1–3; tier 3 adds camp `{id:'home'}` to `WorldPlus.CAMPS`). Boat crossing on hold by owner.
- 2026-11-13 · B (new file `js/worldplus3.js`, script tag after worldplus2.js): mini map markers + chest/cache counter (wraps `MiniMap.draw`),
  Gate rifts in the woods (scene `gate_rift`, map `fc_gate`, `G.S.gateEv`; elite clones `rift_<enemy>` added to ENEMY), seasons by week (`Cal.day()`),
  vine climbing (`G.S.f.climbHook`, given in the first grotto), fishing (wraps `World.interact` only for water tiles in the woods), treasure maps (`G.S.tmaps`).
- 2026-11-12 · **C, owner's call: the Four is retired.** New `js/nofour.js` (script tag after ghost.js) hides Four Cuts / Lines / Strikes / Shadows and every named technique built from them (Heron Drop, Crescent, Four Seasons…) from the battle menu, the move bar and the Stones page. `js/fourcuts.js` is untouched and still loads; delete the nofour.js tag to undo. **For A:** story/tutorial lines that teach or mention the Four Cuts may need rewording; Ren's sheathe-and-draw "four slashes" move now wants to be its own art (Fourfold Draw — MARTIAL_ARTS.md).
- 2026-11-12 · C: moves sheets reworked — Ren's rows = 5 Attack variants (cmb1–cmb5) + thrust + sheathe/fourdraw; allies' rows = Attack A/B + launcher/guard-breaker/sweep/thrust + finisher. VANE sheet: art_tiger, art_mirage, art_horizon, art_fourfold, art_needles, art_reply, art_firstsnow.
- 2026-11-12 · C: MOVES sheets (cutter kinds `movesren7` / `moves7` / `vane7`). Rows wire straight into existing attacks: Ren → cmb1/cmb5 (Attack variants), cmb3/cmb4/cmb2/thr (Rise/Fall/Wind/Needle, as fourcuts.js already asks), plus `sheathe` and `fourdraw`; allies → halfslash/jump/slash/thrust (their Four roles) + `finisher`. Ren's advanced Vane techniques land as `art_tiger`, `art_mirage`, `art_horizon`, `art_needles`, `art_reply`, `art_lastlight`, `art_firstsnow`.
- **For A (from C, owner's request):** the owner wants Ren to learn more of Vane's art as he ranks up — grade road + 2 NEW techniques (Tiger's Descent, First Snow) in `MARTIAL_ARTS.md`. Two hooks would make the art show: (1) the Four Cuts' sheathe phase could play `sheathe` while time slows and `fourdraw` when a 4-cut technique (Four Seasons) fires; (2) when Ren uses a named Vane technique, play `art_<id>` if his set has it. Sprites are ready to cut as soon as the art comes in.
- 2026-11-12 · C (`js/simplewalk.js`, walks): real walk/run cycles for any set cut from a MOVEMENT sheet (`meta.cycle`, cutter kind `move7`); everyone else keeps the simple step. Ren's overworld stride now grows with his grade (`Power.now().i`): C dust · B steadier walk · A afterimage when running · S green eye-wisps · SS+ emerald footfall ring. Kess's 7×7 battle sheet is in (`c_kess`).
- 2026-11-12 · C: owner switched sprite sheets to **7 × 7** (quality over quantity) and **design sheets first**. Cutter kinds `battle7` / `monster7` (tools/pool). Row 3 is DRAW for Ren only; everyone else has their own OPENER.
- **For A (from C, owner's request):** a martial art for every fighter + histories for the 12 majors → `MARTIAL_ARTS.md` (proposal — lore is yours, rename freely). Weapon calls made so sprites stay consistent: Oren = forge hammer, Tamsin = torch-bow (bladed bow she lights), Cael = halberd. `js/fightstyle.js` shows the same names in battle.
- 2026-11-11 · C: Kess's new 12×12 battle sheet is in (`c_kess`, world frames kept). New `js/transform.js` (script tag after burst.js): when a hero transcends, they wear `c_<hero>_t1/_t2` if that set exists (Ren: `ren_t1`, `ren_t3`; Stage II stays burst.js's own swap). It only wraps `Burst.fire`/`Burst.end` — no edits to burst.js.
- **For A (from C):** the owner wants Ren's Stage III (Dragonoid) playable. `Burst.stage()` only returns 1 or 2 today; when A adds stage 3, `js/transform.js` already swaps Ren to `ren_t3`.
- 2026-11-11 · C: SHARP SPRITES — `HD.dI` in hdsprites.js draws shrunk art from a pre-halved copy (no more jaggy/shimmering edges). Also applied to `simplewalk.js` (walk drawing; it isn't in any lane list, so C took it as "walks"). New `js/fightstyle.js` (+1 script tag before battlefx.js): each fighter's martial art sets the colour/shape of their hit marks, parry sparks and dodge effects; `battlefx.js` reads it. Cutter (`tools/pool`) now reads 12×12 sheets: kinds `battle12` / `monster12`.
- **For A (from C, owner's request 2026-11-11):** the owner wants a named martial art per character. C put WORKING names in `js/fightstyle.js` (e.g. Ren = "Vane's Sheathed Sword", Kess = "Shadowstep Knife-Dance", Liora = "Moonwater Spear"). Rename freely there — names are display-only. Weapon clashes to settle with the owner: Oren's sprite holds a SWORD but the story says hammer; Tamsin's sprite holds a BOW but her Transcension says "torch-blade"; Voss's sprite has sword + shield, the story says spear + shield; Halvard's sprite holds a tome, the story says staff.
- 2026-11-11 · C (new file `js/wardrobe.js`, shared `index.html`: 1 script tag after pool.js): WARDROBE — outfits + dyes for Ren, the Red Veil and party heroes, shown at the bottom of the Party tab. It WRAPS `HD.playerSet`/`HD.battleSet`/`HD.setOf` and `UI.renderMenu` (no edits to ui.js). Saves in `G.S.wear`. Note for A & B: claims in `tools/claim.py` are per-workspace, so chats in different workspaces can't see each other's claims; C pulls right before pushing and never force-pushes.
- 2026-11-12 · B (new file `js/worldplus2.js`, script tag after worldplus.js): forest weather moods (biases `Ambient.weather`), Emberroot ash, footprints
  (wraps `Ambient.ground`), synthesized sound (waterfall/wind/frogs/campfire via the shared `AC`, follows `G.settings.sfx`), grottos behind each waterfall
  (scenes `grotto_n/e/s/w`, maps `fc_grotto_*`, chests in chests.json), roaming visible monsters in the woods (start the scene's own encounter),
  12 lore stones (`G.S.lore12`). `worldplus.js` no longer draws its own butterflies/fireflies (Ambient already does).
- 2026-11-12 · B (new file `js/worldplus.js`, script tag after dungeonx.js in index.html): see-through tall props, hidden caches, night glows, wildlife,
  camp fast travel (`G.S.camps`), world-map pins for the woods' dungeons (`dg_fang`, `dg_cinder`, `dg_shrine`, `dg_dragvault`).
  Shared `world.js`, 2 lines in `drawProp`: `if (o.fade) c.globalAlpha = o.fade; … c.globalAlpha = 1;` — props with `o.fade` draw see-through.
- 2026-11-12 · B: truly hidden secrets in the woods' dungeons — secret rooms & the lever vault are painted as rock (overlays `assets/dsec_<dungeon>_<n>.webp`
  laid onto a canvas copy of `World.mapImg` when opened), solid on the collision grid and mini map (`World.mmLocal`), chests/torches/secret bosses only appear
  once opened. Mini map fog now floods over walkable ground only (no seeing through walls). `dungeons.js`: `D.exact` keeps chests on their exact tiles.
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

- 2026-11-16 (B) WORLD+12 — js/deep.js + worldplus3 rift patch. Gates now tear into a per-forest void pocket (fc_rift_n/e/s/w) with a stair down to THE UNDERDEEP (scene 'underdeep', map ud_deep): portals to all 4 pockets, to the 4 dungeons once cleared, a well to the Crossroads, the Deep Sovereign boss (wakes at 6 murals). CHRONICLE IN STONE: 8 frescoes (assets/mural_1..8.jpg) in dungeons/pockets/deep, title Keeper of the Chronicle. THE SUNHIGH ARENA (scene 'arena', via Ashford town services, 40g): Bronze/Silver/Gold Cups, weekly champion Varro, animated crowd. The 4 forest dungeons were regenerated at 98x68 (great hall + mural gallery); old saves inside one restart at the entrance (flag f.dun3). Story Quarry Gate floors gate1-4 only got overlay motes — coords untouched.
  → A: mural captions, Underdeep lore, Sovereign/Varro lines and the arena roster are B drafts — rewrite freely.
  → C: bd_underdeep/bd_rift/bd_arena and the mural frescoes are generated placeholders; arena master uses folk19, Varro uses the minotaur sprite.

- 2026-11-16 (B) WORLD+13 — js/deep2.js: arena betting (Odds-Marta's book, 3 seeded monster bouts/day), arena sponsors (Millers/Anglers/Smiths), spreading cracks (each closed Gate → G.S.gatesClosed; fractures appear in the Underdeep at 1/2/4/6/9/12), mural rubbings → Archivist Pell (town services), 5 void fish in the Underdeep pool (the "anywhere" fish no longer bite there), echo duels (Mirror Pool, weekly; enemies use tinted copies of the player/ally sheets). deep.js got two hooks: Deep.onMural, Deep.onCup.
  → A: Odds-Marta, Archivist Pell and the echo lines are B drafts.

- 2026-11-16 (B) WORLD+14 — js/deep3.js: arena seasons (28-day ladder vs 9 named rivals, G.S.arenaSeason; the arena board is now the ladder), crowd favourite (Battle.start wrapper reads Battle.B.st.hurt/perf in arena bouts), Underdeep void storms (seeded by day: up to 2 bridge groups go dark, the well always stays reachable), Drag ghost → 4 hidden mural sketches, Void Salt (void_/deep_ enemy drop) + 3 rift dishes, the Archive (after all 8 rubbings: lore books + gate map from G.S.gateLog), Madame Oyelle the seer (G.S.gateFc — worldplus3 maybeRift now honours it and logs gates).
  → A: rival names, Oyelle, Pell's books and ghost sketch lines are B drafts.

- 2026-11-16 (B) WORLD+15 — js/deep4.js: Varro's training arc (after 5 champ wins; teaches new ART 'sandbreaker' added to ARTS — A please rebalance/rename freely), twin gates (30% of tears; looting spawns a 260-step twin elsewhere, +350g), the Sovereign's Heir (weekly scaling boss on the empty throne), Deep camp (300g; rest/cook + a stair at the Crossroads), mural restoration (masons service, 4×250g, pilgrims appear), tag-team cup (cfg.allies = one partner), Oyelle's smaller fortunes (storm tomorrow / arena tip — deep2 betting is now seeded per day / +3 bait), void infusion at the smith (3 Void Salt → +2 atk/def, max 5, purple motes around Ren).
  → A: Varro/Oyelle/pilgrim lines and Sandbreaker are B drafts. → C: Varro reuses the minotaur sprite; Heir is a tinted vampire.
