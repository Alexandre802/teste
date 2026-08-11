#!/usr/bin/env bash
# Measures the mix by rendering isolated stems of a short slice.
#
# Measuring the full mix does not work: the ad fires ~90 effects, so any window
# chosen to measure "just the music" still catches a neighbouring effect's
# decay and reads several dB high. Rendering voice, effects and music
# separately over the same frames removes the guesswork.
#
# Usage: bash tools/measure-stems.sh [firstFrame] [lastFrame]
set -euo pipefail

cd "$(dirname "$0")/.."

FIRST="${1:-440}"
LAST="${2:-720}"

CHROME="${CHROME:-/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell}"
BROWSER_FLAG=""
[ -x "$CHROME" ] && BROWSER_FLAG="--browser-executable=$CHROME"

FFMPEG="node_modules/@remotion/compositor-linux-x64-gnu/ffmpeg"
[ -x "$FFMPEG" ] || FFMPEG="$(command -v ffmpeg)"

mkdir -p out/stems

for stem in voice sfx music; do
  echo "rendering $stem stem (frames $FIRST-$LAST)…"
  npx remotion render ConsulTechAd "out/stems/$stem.mp4" \
    $BROWSER_FLAG --concurrency=3 \
    --frames="$FIRST-$LAST" --props="{\"stem\":\"$stem\"}" >/dev/null 2>&1
  "$FFMPEG" -v error -i "out/stems/$stem.mp4" -vn -ac 1 -ar 22050 \
    -f wav "out/stems/$stem.wav" -y
done

python3 - <<'PY'
import wave, struct, math

def load(p):
    w = wave.open(p)
    n = w.getnframes()
    return list(struct.unpack('<%dh' % n, w.readframes(n))), w.getframerate()

def rdb(x):
    if not x:
        return -99.0
    r = math.sqrt(sum(v * v for v in x) / len(x))
    return 20 * math.log10(r / 32768) if r else -99.0

voice, sr = load('out/stems/voice.wav')
win = int(sr * 0.05)
voiced = []
for i in range(0, len(voice) - win, win):
    seg = voice[i:i + win]
    if rdb(seg) > -50:
        voiced.extend(seg)
narration = rdb(voiced)

sfx, _ = load('out/stems/sfx.wav')
w3 = int(sr * 0.30)
sfx_level = max(rdb(sfx[i:i + w3]) for i in range(0, len(sfx) - w3, int(sr * 0.05)))

music, _ = load('out/stems/music.wav')
music_level = rdb(music)

print()
print(f'  narração   {narration:7.1f} dBFS   = 0 dB reference')
for label, level, lo, hi in (
    ('SFX', sfx_level, -18, -12),
    ('música', music_level, -30, -24),
):
    rel = level - narration
    ok = lo - 0.5 <= rel <= hi + 0.5
    print(f'  {label:10s} {level:7.1f} dBFS   {rel:+6.1f} dB   '
          f'alvo {lo} a {hi}   {"OK" if ok else "FORA"}')
print()
PY
