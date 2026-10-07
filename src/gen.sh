# TTS pipeline: piper (offline) -> brighter/kid-friendly pitch -> 24k mono mp3 into /tmp/fts, then build.py copies to src/clips
set -e
mkdir -p /tmp/fts && cd /tmp/fts
[ -f silent.mp3 ] || ffmpeg -y -loglevel error -f lavfi -i anullsrc=r=24000:cl=mono -t 1 -b:a 32k silent.mp3
while IFS='|' read -r k t v; do
  [ -z "$k" ] && continue
  [ -f $k.mp3 ] && [ "$FORCE" != 1 ] && continue
  echo "$t" | /workspace/.tts/venv/bin/piper -m /workspace/.tts/en_US-$v-medium.onnx -f raw_$k.wav --length-scale 0.9 >/dev/null 2>&1
  ffmpeg -y -loglevel error -i raw_$k.wav -af "silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,asetrate=22050*1.18,aresample=24000,atempo=0.92,highpass=f=120,acompressor=threshold=-18dB:ratio=3,volume=1.8,alimiter=limit=0.95" -ac 1 -ar 24000 -b:a 32k $k.mp3
  echo $k $(stat -c%s $k.mp3)
done < /workspace/fry-thief-seagull/src/lines.txt
