Forest builder for the Crossroads + four woods + their dungeons.
1) python3 cut.py <sheet>   (find sprite boxes)  2) MUL=1.6 OUT=big/ python3 crop.py ; python3 crop.py   3) python3 layouts.py
Edit layouts.py to move paths, chests, statues, caves. Writes assets/map_fc_*.webp, props5, maps.json, chests.json, js/fc_data.js.
Then bump the ?v= hashes in index.html.
