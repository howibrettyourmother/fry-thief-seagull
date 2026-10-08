# Poopy Seagull 💩🍟

A silly beach game for Alex: be a cartoon seagull at Michigan beaches, splat beachgoers and swoop down to steal their French fries.

**Play:** https://howibrettyourmother.github.io/fry-thief-seagull/ (on iPhone: Share → Add to Home Screen → "Poopy Gull")

- **Left thumb**: floating joystick (appears where you touch) to fly; works in portrait or landscape
- **Right side / POOP button**: drop (hold = rapid fire). **SWOOP** dives to yoink fries (or just fly close). **MEGA DUMP** after eating enough fries
- Keep eating fries or the fry meter empties and you get HANGRY (slow). Chili cheese fries = uncontrollable rapid fire
- Normal / Hard toggle on the title screen; bosses have 3 phases; no-hit waves pay a score multiplier; continues are counted

5 beaches (Grand Haven, Holland State Park, Sleeping Bear Dunes, Belle Isle, Pictured Rocks), 2 waves each + a boss:
Lifeguard Larry, Chef Frank's Fry Shack, the Sandcastle King, Beach Ball Bot and the Hot Dog Truck. Then "another summer" loops at higher difficulty.
No hard game over: continue from the wave start or boss checkpoint (bosses keep their damage). Best score per difficulty saved on the device.

Single self-contained `index.html` (all art is code, music is original chiptune, voices are offline TTS). Rebuild with `python3 src/build.py` (voices: `bash src/gen.sh`, icons: `python3 src/icon.py`).
