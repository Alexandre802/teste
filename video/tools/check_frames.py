#!/usr/bin/env python3
"""
Varre TODOS os frames do MP4 renderizado procurando telas mortas.

Foi escrito depois de um bug em que duas cenas inteiras (14 s) saíram em
branco no vídeo final: a conferência tinha sido feita por amostragem de
frames, e as amostras caíram justamente fora do trecho quebrado.

O script decodifica o vídeo inteiro em baixa resolução e mede, por frame, o
desvio padrão dos pixels. Frame quase uniforme = tela morta.

Uso:  python3 tools/check_frames.py [caminho.mp4]
Sai com código 1 se encontrar algum trecho suspeito.
"""

import os
import subprocess
import sys

W, H = 24, 42          # resolução de análise (mantém o 9:16)
FRAME = W * H * 3
FPS = 30

# Um frame com desvio padrão abaixo disso não tem praticamente nenhum
# conteúdo — é fundo chapado.
STD_LIMIT = 6.0
# Trechos mortos mais curtos que isso (0,2 s) são batidas legítimas — o flash
# preto do glitch, o instante inicial de um snap-in. Acima disso é defeito.
MIN_RUN = 6

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def decode(path):
    # o ffmpeg do Remotion traz o codec rawvideo mas nao o muxer homonimo;
    # image2pipe entrega os frames crus em sequencia do mesmo jeito.
    cmd = [
        "npx", "remotion", "ffmpeg", "-v", "error", "-i", path,
        "-vf", f"scale={W}:{H}", "-f", "image2pipe",
        "-vcodec", "rawvideo", "-pix_fmt", "rgb24", "-",
    ]
    p = subprocess.run(cmd, cwd=ROOT, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    if p.returncode != 0 or not p.stdout:
        sys.exit(f"falha ao decodificar:\n{p.stderr.decode()[-800:]}")
    return p.stdout


def stats(buf):
    """(media, desvio padrao) por frame."""
    out = []
    for i in range(0, len(buf) - FRAME + 1, FRAME):
        px = buf[i:i + FRAME]
        n = len(px)
        total = sum(px)
        mean = total / n
        var = sum((v - mean) ** 2 for v in px) / n
        out.append((mean, var ** 0.5))
    return out


def tc(f):
    return f"{f // FPS // 60:02d}:{f // FPS % 60:02d}.{int(f % FPS / FPS * 100):02d}"


def main():
    path = sys.argv[1] if len(sys.argv) > 1 else "out/monttra-reel.mp4"
    print(f"analisando {path} …")
    frames = stats(decode(path))
    print(f"{len(frames)} frames  ({len(frames)/FPS:.2f}s)\n")

    flat = [i for i, (_, sd) in enumerate(frames) if sd < STD_LIMIT]

    runs = []
    for f in flat:
        if runs and f == runs[-1][1] + 1:
            runs[-1][1] = f
        else:
            runs.append([f, f])
    runs = [r for r in runs if r[1] - r[0] + 1 >= MIN_RUN]

    if not runs:
        worst = min(frames, key=lambda s: s[1])
        print(f"OK — nenhum trecho morto. Menor desvio observado: {worst[1]:.1f}")
        return 0

    print(f"{len(runs)} trecho(s) suspeito(s):\n")
    for a, b in runs:
        dur = (b - a + 1) / FPS
        print(f"  {tc(a)} → {tc(b)}   frames {a}-{b}   {dur:.2f}s   desvio {frames[a][1]:.1f}")
    return 1


if __name__ == "__main__":
    sys.exit(main())
