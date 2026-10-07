# Fry Thief Seagull 🍟

A silly beach game for Alex: be a cartoon seagull at Michigan beaches, splat beachgoers and swoop down to steal their French fries.

**Play:** https://howibrettyourmother.github.io/fry-thief-seagull/ (on iPhone: Share → Add to Home Screen → "Seagull")

- **Drag** anywhere to fly (relative drag, your finger never covers the gull)
- **Tap** or hit the big **POOP!** button to drop
- **Swoop low** past someone holding fries to grab them

5 beaches (Grand Haven, Holland State Park, Sleeping Bear Dunes, Belle Isle, Pictured Rocks), 2 waves each + a boss:
Lifeguard Larry, Chef Frank's Fry Shack, the Sandcastle King, Beach Ball Bot and the Hot Dog Truck. Then "another summer" loops at higher difficulty.
Generous hearts, no game over (Oopsie → keep flying from the start of the wave; bosses keep their damage), best score saved on the device.

Single self-contained `index.html` (all art is code, music is original chiptune, voices are offline TTS). Rebuild with `python3 src/build.py` (voices: `bash src/gen.sh`, icons: `python3 src/icon.py`).
