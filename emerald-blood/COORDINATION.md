# Emerald Blood — two chats, one game

The owner runs TWO Claude chats on this game at the same time, on purpose. Stay in your lane,
claim before you touch anything shared, and always deploy with `deploy.py` (it merges the other
chat's pushes instead of overwriting them).

## Lanes

**Chat A — Story & Combat** (the chat that built the arcs, Transcension, the animation pool)
- story & quests: `story.js`, `ch1.js`, `ch1b.js`, `arcs.js`, `kessarc.js`, `trial.js`, `dawn.js`, `quests.js`, `hmquests.js`, `ledger.js`
- combat: `battle*.js`, `combat*.js`, `burst.js`, `wild.js`, `gear*.js`, `passives.js`, `cores.js`, `clash.js`, `elements.js`, `fourcuts.js`, `mastery.js`
- characters & art: `hdsprites.js`, `pool.js`, `portraits.js`, `fxsheets.js`, `assets/hd/`, `assets/portraits/`, `assets/fx/`, `pool/`

**Chat B — World & Maps** (the chat that built the tile forests)
- maps, towns, forests, dungeons: `forest4.js`, `fc_data.js`, `towns2.js`, `newmaps.js`, `dungeons.js`, `sewers.js`, `districts.js`, `worldmap.js`, `mapedit.js`, `worldfeel.js`, `reef.js`
- `assets/map_*`, `assets/props*`, `tools/forestgen/`

**Shared — claim first, edit surgically, re-read right before writing**
`index.html`, `assets/maps.json`, `assets/hd/hd.json`, `assets/chests.json`, `sw.js`, `core.js`, `world.js`, `ui.js`, `dialog.js`, `deploy.py`

## Rules
1. **Claim** shared files before editing: `python3 tools/claim.py take index.html --who A` (claims expire after 45 min).
   `python3 tools/claim.py list` shows who holds what. Release when done: `claim.py release index.html --who A`.
2. **Never rewrite a whole shared file** from memory. Patch it (exact string replace / JSON key update), re-reading it first.
3. **Cross-lane needs**: story content that needs a map spot reads coordinates from the map data where possible.
   If Chat B moves something the story depends on, Chat B updates the story's coordinates and logs it below.
   If Chat A needs a new map or room, it asks (owner relays), or adds its own new file and logs it.
4. **New files are free** — prefer adding a new file in your lane over editing someone else's.
5. **Deploy only with `python3 /home/claude/eb-build/deploy.py "msg"`** — it locks, pulls the other chat's pushes into
   `out/`, merges index.html / maps.json / hd.json automatically, and blocks if both chats changed the same file.
6. **Log** every cross-lane touch in the list below (newest first).

## Cross-lane log
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
