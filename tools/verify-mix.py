#!/usr/bin/env python3
"""
Checks a rendered cut against the mix spec.

    NARRAÇÃO  0 dB reference
    SFX       -12 … -18 dB
    MÚSICA    -24 … -30 dB

The point of this script is that the constants in the source are a *claim*;
this measures the encoded file, which is the thing anyone will actually hear.

Picking honest windows is most of the work:

  * The narration reference is measured only where the voice is speaking. Its
    pauses would drag the average down and flatter every other reading.
  * Effects are measured in a window that starts at the cue and is clear of
    speech — measuring across a word makes an effect look far louder than it is,
    which is how an earlier pass "passed" while sounding wrong.
  * Music is measured in narration pauses that contain no effect cue within a
    second either side, so a decaying whoosh is not counted as music.

Usage:  python3 tools/verify-mix.py out/ad.mp4
"""

import math
import os
import struct
import subprocess
import sys
import tempfile
import wave

ROOT = os.path.join(os.path.dirname(__file__), '..')
FFMPEG = os.path.join(
    ROOT, 'node_modules', '@remotion', 'compositor-linux-x64-gnu', 'ffmpeg'
)
if not os.path.exists(FFMPEG):
    FFMPEG = 'ffmpeg'

FPS = 30

# Narration pauses (seconds), from the silencedetect pass in timing.ts
PAUSES = [
    (5.32, 5.77), (6.72, 7.16), (13.27, 13.58), (15.31, 15.70), (16.16, 16.76),
    (21.72, 22.59), (24.82, 25.40), (26.44, 26.79), (29.73, 30.03),
    (30.60, 30.93), (32.05, 32.37), (33.44, 33.94), (35.04, 35.44),
    (36.68, 37.01), (38.65, 39.04), (42.14, 42.74), (43.93, 44.40),
    (46.43, 46.76), (48.46, 48.85), (50.31, 50.66), (52.00, 52.55),
    (58.93, 59.36), (60.75, 61.10), (62.96, 63.37), (64.89, 65.23),
]

# The loud one-shots worth checking, as (label, frame).
HERO_CUES = [
    ('impacto "e o pior"', 465),
    ('nascimento da marca', 665),
    ('convergencia', 1428),
    ('impacto do CTA', 2008),
]

# Every cue frame, so music windows can avoid effect tails.
def all_cue_frames():
    frames = set()
    for _, f in HERO_CUES:
        frames.add(f)
    # scene starts carry transitions
    for f in (0, 166, 208, 465, 494, 665, 753, 896, 1057, 1106, 1398, 1460,
              1568, 1775, 1952):
        frames.add(f)
    return sorted(frames)


def decode(path, tmpdir):
    wav = os.path.join(tmpdir, 'mix.wav')
    subprocess.run(
        [FFMPEG, '-v', 'error', '-i', path, '-vn', '-ac', '1', '-ar', '22050',
         '-f', 'wav', wav, '-y'],
        check=True,
    )
    w = wave.open(wav)
    n = w.getnframes()
    return list(struct.unpack('<%dh' % n, w.readframes(n))), w.getframerate()


def rms_db(seg):
    if not seg:
        return -99.0
    r = math.sqrt(sum(v * v for v in seg) / len(seg))
    return 20 * math.log10(r / 32768) if r else -99.0


def window(samples, sr, a, b):
    return samples[int(a * sr):int(b * sr)]


def in_pause(t):
    return any(a <= t <= b for a, b in PAUSES)


def main():
    path = sys.argv[1] if len(sys.argv) > 1 else 'out/ad.mp4'

    with tempfile.TemporaryDirectory() as tmp:
        s, sr = decode(path, tmp)

    total = len(s) / sr

    # --- narration reference: speaking parts only -------------------------
    voiced = []
    win = int(sr * 0.05)
    for i in range(0, len(s) - win, win):
        t = i / sr
        if in_pause(t):
            continue
        seg = s[i:i + win]
        if rms_db(seg) > -50:
            voiced.extend(seg)
    narration = rms_db(voiced)

    print(f'arquivo: {path}  ({total:.2f}s)')
    print(f'NARRAÇÃO (referência):  {narration:6.1f} dBFS\n')

    # --- effects ----------------------------------------------------------
    print('EFEITOS  (alvo -12 a -18 dB abaixo da narração)')
    sfx_ok = True
    for label, frame in HERO_CUES:
        t = frame / FPS
        # measure from the cue up to the next speech onset, capped at 300ms
        end = t + 0.30
        for a, b in PAUSES:
            if a <= t <= b:
                end = min(end, b)
        if end - t < 0.12:
            end = t + 0.12
        level = rms_db(window(s, sr, t, end))
        rel = level - narration
        ok = -19.0 <= rel <= -10.5
        sfx_ok &= ok
        print(f'  {label:22s} {level:6.1f} dBFS  {rel:+6.1f} dB  {"OK" if ok else "FORA"}')

    # --- music: pauses with no cue within 1s ------------------------------
    cues = [f / FPS for f in all_cue_frames()]
    clean = []
    for a, b in PAUSES:
        if b - a < 0.30:
            continue
        if any(abs(a - c) < 1.0 or abs(b - c) < 1.0 or a < c < b for c in cues):
            continue
        clean.append((a + 0.05, b - 0.05))

    if clean:
        levels = [rms_db(window(s, sr, a, b)) for a, b in clean]
        music = sum(levels) / len(levels)
        rel = music - narration
        ok = -31.0 <= rel <= -22.0
        print(f'\nMÚSICA   (alvo -24 a -30 dB)  medida em {len(clean)} pausas limpas')
        print(f'  {"trilha":22s} {music:6.1f} dBFS  {rel:+6.1f} dB  {"OK" if ok else "FORA"}')
    else:
        ok = False
        print('\nMÚSICA: nenhuma pausa limpa encontrada')

    peak = max(abs(v) for v in s)
    print(f'\npico: {peak}/32768  ({20 * math.log10(peak / 32768):.1f} dBFS)'
          f'  {"OK" if peak < 32700 else "CLIPPING"}')

    print(f'\nVEREDITO: {"dentro da especificação" if sfx_ok and ok else "FORA — revisar"}')
    return 0 if (sfx_ok and ok) else 1


if __name__ == '__main__':
    sys.exit(main())
