"""Encontra as pausas da narração de referência e sugere os frames de corte.

É daqui que saíram os valores de `at` em `SCENES` (src/timeline.ts): cada
virada de tela do vídeo cai no centro de uma pausa real da locução.

Uso: python3 tools/find_cuts.py
"""
import os
import subprocess
import sys

import numpy as np

ROOT = os.path.join(os.path.dirname(__file__), "..")
AUDIO = os.path.join(
    ROOT, "..", "referencias", "audio", "WhatsApp Audio 2026-08-11 at 20.46.20.mpeg"
)
SR = 16000
FPS = 30

# Janela de análise e critérios de pausa
WIN = 0.02          # 20 ms
MIN_PAUSE = 0.16    # pausas mais curtas que isso não servem de corte
REL_THRESHOLD = 0.10  # fração do nível de fala que ainda conta como silêncio


def ffmpeg_bin() -> str:
    """Usa o ffmpeg trazido pelo pacote npm ffmpeg-static."""
    out = subprocess.run(
        ["node", "-e", "console.log(require('ffmpeg-static'))"],
        cwd=ROOT,
        capture_output=True,
        text=True,
        check=True,
    )
    return out.stdout.strip()


def decode(path: str) -> np.ndarray:
    raw = subprocess.run(
        [ffmpeg_bin(), "-v", "error", "-i", path, "-ac", "1", "-ar", str(SR), "-f", "s16le", "-"],
        capture_output=True,
        check=True,
    ).stdout
    return np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768


def envelope(x: np.ndarray) -> np.ndarray:
    w = int(SR * WIN)
    n = len(x) // w
    e = np.sqrt((x[: n * w].reshape(n, w) ** 2).mean(axis=1))
    return np.convolve(e, np.ones(5) / 5, mode="same")


def pauses(env: np.ndarray, dur: float):
    speech = np.percentile(env[env > np.percentile(env, 40)], 60)
    active = env > speech * REL_THRESHOLD
    out = []
    i = 0
    while i < len(active):
        if active[i]:
            i += 1
            continue
        j = i
        while j < len(active) and not active[j]:
            j += 1
        a, b = i * WIN, j * WIN
        if b - a >= MIN_PAUSE and a > 0.5 and b < dur - 0.3:
            out.append((a, b))
        i = j
    return out


if __name__ == "__main__":
    if not os.path.exists(AUDIO):
        sys.exit(f"áudio não encontrado: {AUDIO}")

    x = decode(AUDIO)
    dur = len(x) / SR
    found = pauses(envelope(x), dur)

    print(f"narração: {dur:.3f} s  ({round(dur * FPS)} frames a {FPS} fps)")
    print(f"{len(found)} pausas >= {int(MIN_PAUSE * 1000)} ms\n")
    print(f"{'início':>8}{'fim':>8}{'ms':>6}{'centro':>9}{'frame':>8}")
    for a, b in found:
        c = (a + b) / 2
        print(f"{a:8.2f}{b:8.2f}{(b - a) * 1000:6.0f}{c:9.2f}{round(c * FPS):8d}")
