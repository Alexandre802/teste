#!/usr/bin/env bash
# Regenerates the music bed and sound effects, then converts them to mp3.
#
# The WAVs are intermediates — only the mp3s are committed, since that is what
# `staticFile()` loads. Run this after editing tools/make-audio.py.
set -euo pipefail

cd "$(dirname "$0")/.."

FFMPEG="node_modules/@remotion/compositor-linux-x64-gnu/ffmpeg"
if [ ! -x "$FFMPEG" ]; then
  FFMPEG="$(command -v ffmpeg)"
fi

echo "synthesising…"
python3 tools/make-audio.py

echo "encoding to mp3…"
"$FFMPEG" -v error -i public/audio/music.wav -c:a libmp3lame -b:a 192k \
  public/audio/music.mp3 -y

for f in public/audio/sfx/*.wav; do
  "$FFMPEG" -v error -i "$f" -c:a libmp3lame -b:a 160k "${f%.wav}.mp3" -y
done

echo "cleaning intermediates…"
rm -f public/audio/music.wav public/audio/sfx/*.wav

ls -la public/audio public/audio/sfx
echo "done"
