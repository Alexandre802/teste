#!/usr/bin/env bash
#
# Render em blocos + faixa de áudio contínua.
#
# Por que não é um `remotion render` direto:
#
#  1. Um render único de 1350 frames acumula memória no processo do Chromium e
#     trava por volta do frame ~1040 (o erro aparece como timeout do
#     delayRender, mas o mesmo trecho renderiza sem problema isoladamente).
#     Cada bloco roda em um processo novo, então nada acumula.
#
#  2. Concatenar blocos que já trazem áudio embutido soma o padding do AAC em
#     cada emenda e o vídeo sai com 22,66 s / 59,72 fps em vez de 22,50 s / 60.
#     Por isso os blocos saem mudos, o áudio é renderizado uma vez só de ponta a
#     ponta, e os dois são casados no final.
#
# Uso:  bash tools/render-chunks.sh [saida.mp4]
set -euo pipefail

cd "$(dirname "$0")/.."

OUT=${1:-out/nubank-reels-1080x1920.mp4}
CHUNK=450
FRAMES=1350
CONCURRENCY=${CONCURRENCY:-4}
CRF=${CRF:-16}

mkdir -p out/chunks
rm -f out/chunks/*.mp4 out/chunks/list.txt

# ── 1. blocos de vídeo, sem áudio ─────────────────────────────────────
start=0
i=0
while [ "$start" -lt "$FRAMES" ]; do
  end=$((start + CHUNK - 1))
  if [ "$end" -ge "$FRAMES" ]; then end=$((FRAMES - 1)); fi
  part=$(printf "out/chunks/part-%02d.mp4" "$i")

  echo "▶ bloco $i: frames $start-$end"
  npx remotion render NubankReels "$part" \
    --frames="$start-$end" \
    --concurrency="$CONCURRENCY" \
    --crf="$CRF" \
    --muted

  echo "file '$(basename "$part")'" >> out/chunks/list.txt
  start=$((end + 1))
  i=$((i + 1))
done

# ── 2. áudio contínuo, de uma vez ─────────────────────────────────────
echo "▶ faixa de áudio"
npx remotion render NubankReels out/chunks/track.wav

# ── 3. junta os blocos e casa com o áudio ─────────────────────────────
echo "▶ concatenando $i blocos"
npx remotion ffmpeg -y -f concat -safe 0 -i out/chunks/list.txt \
  -c copy out/chunks/video-only.mp4

echo "▶ mixando áudio"
npx remotion ffmpeg -y -i out/chunks/video-only.mp4 -i out/chunks/track.wav \
  -c:v copy -c:a aac -b:a 320k -shortest "$OUT"

echo "✔ $OUT"
npx remotion ffprobe "$OUT" 2>&1 | grep -E "Duration|Stream"
