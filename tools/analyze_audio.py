#!/usr/bin/env python3
"""
Analisa a narração e GERA src/config/speechMap.ts.

Extrai três níveis de granularidade, do mais grosso ao mais fino:

  PHRASES   — grupos de fala separados por pausas (frases/respirações)
  BEATS     — onsets de palavra (início de cada palavra falada)
  SYLLABLES — núcleos silábicos (picos de energia na banda de voz)

É isso que permite travar cada entrada visual no que está sendo falado, em vez
de usar frames arbitrários.

Uso:  python3 tools/analyze_audio.py [public/audio/narration.mp3]
"""

import os
import subprocess
import sys
import wave

import numpy as np

SR = 16000
HOP = 0.010  # 10 ms


def find_ffmpeg() -> str:
    if os.environ.get("FFMPEG_PATH"):
        return os.environ["FFMPEG_PATH"]
    local = os.path.join("node_modules", "ffmpeg-static", "ffmpeg")
    if os.path.exists(local):
        return local
    return "ffmpeg"


def decode(path: str) -> np.ndarray:
    tmp = os.path.join(os.path.dirname(path) or ".", ".narr-16k.wav")
    subprocess.run(
        [find_ffmpeg(), "-hide_banner", "-loglevel", "error", "-y", "-i", path,
         "-ar", str(SR), "-ac", "1", "-c:a", "pcm_s16le", tmp],
        check=True,
    )
    with wave.open(tmp, "rb") as w:
        x = np.frombuffer(w.readframes(w.getnframes()), dtype="<i2")
    os.remove(tmp)
    return x.astype(np.float64) / 32768.0


def voice_envelope(x: np.ndarray) -> np.ndarray:
    """Energia por janela de 10 ms na banda de voz (300–3400 Hz)."""
    win = int(SR * 0.025)
    hop = int(SR * HOP)
    nfft = 512
    hann = np.hanning(win)
    freqs = np.fft.rfftfreq(nfft, 1 / SR)
    band = (freqs >= 300) & (freqs <= 3400)

    out = []
    for i in range(0, len(x) - win, hop):
        spec = np.abs(np.fft.rfft(x[i:i + win] * hann, nfft))
        out.append(spec[band].sum())
    e = np.asarray(out)
    e /= e.max() + 1e-12
    k = np.hanning(7)
    return np.convolve(e, k / k.sum(), mode="same")


def full_envelope(x: np.ndarray) -> np.ndarray:
    """RMS por janela de 10 ms (banda cheia) — usada para as frases."""
    hop = int(SR * HOP)
    n = (len(x) // hop) * hop
    return np.sqrt((x[:n].reshape(-1, hop) ** 2).mean(axis=1))


def phrases(x: np.ndarray) -> list[tuple[float, float]]:
    env = full_envelope(x)
    s = np.sort(env)
    floor = s[int(len(s) * 0.12)]
    peak = s[int(len(s) * 0.97)]
    thr = floor + 0.10 * (peak - floor)
    voiced = env > thr

    # fecha silêncios < 140 ms para não picar palavras
    i = 0
    while i < len(voiced):
        if not voiced[i]:
            j = i
            while j < len(voiced) and not voiced[j]:
                j += 1
            if 0 < i and j < len(voiced) and j - i < 14:
                voiced[i:j] = True
            i = j
        else:
            i += 1

    segs = []
    i = 0
    while i < len(voiced):
        if voiced[i]:
            j = i
            while j < len(voiced) and voiced[j]:
                j += 1
            if j - i >= 8:  # >= 80 ms
                segs.append((i * HOP, j * HOP))
            i = j
        else:
            i += 1
    return segs


def syllables_and_beats(x: np.ndarray) -> tuple[list[float], list[float]]:
    es = voice_envelope(x)
    floor = np.percentile(es, 12)
    peak = np.percentile(es, 95)
    thr = floor + 0.18 * (peak - floor)

    # núcleos silábicos: máximos locais com no mínimo 110 ms de distância
    min_sep = 11
    nuclei: list[int] = []
    for i in range(1, len(es) - 1):
        if es[i] >= es[i - 1] and es[i] > es[i + 1] and es[i] > thr:
            if nuclei and i - nuclei[-1] < min_sep:
                if es[i] > es[nuclei[-1]]:
                    nuclei[-1] = i
            else:
                nuclei.append(i)

    # onset = borda de subida antes do núcleo (cruza 45% do pico)
    onsets: list[int] = []
    for p in nuclei:
        target = es[p] * 0.45
        j = p
        while j > 0 and es[j] > target:
            j -= 1
        if not onsets or j - onsets[-1] >= 6:
            onsets.append(j)

    # beats de palavra: onsets separados por >= 180 ms
    beats: list[float] = []
    for o in onsets:
        t = o * HOP
        if not beats or t - beats[-1] >= 0.18:
            beats.append(t)

    return [p * HOP for p in nuclei], beats


def fmt(values, per_line=12, ndigits=2) -> str:
    out = []
    for i in range(0, len(values), per_line):
        chunk = ", ".join(f"{round(v, ndigits)}" for v in values[i:i + per_line])
        out.append(f"  {chunk},")
    return "\n".join(out)


def main() -> None:
    path = sys.argv[1] if len(sys.argv) > 1 else "public/audio/narration.mp3"
    x = decode(path)
    dur = len(x) / SR

    ph = phrases(x)
    syl, beats = syllables_and_beats(x)

    gaps = [(ph[k][0] - ph[k - 1][1], (ph[k - 1][1] + ph[k][0]) / 2) for k in range(1, len(ph))]
    major = sorted(gaps, key=lambda g: -g[0])[:10]
    major = sorted(major, key=lambda g: g[1])

    ts = f'''/**
 * ARQUIVO GERADO — não edite à mão.
 * Regere com: npm run analyze   (python3 tools/analyze_audio.py)
 *
 * Mapa de fala de {os.path.basename(path)} ({dur:.4f}s), em três granularidades:
 *
 *   PHRASES   {len(ph):>3} grupos de fala (frases, separadas por pausas)
 *   BEATS     {len(beats):>3} onsets de palavra  ({len(beats) / dur:.2f}/s ≈ {len(beats) / dur * 60:.0f} palavras/min)
 *   SYLLABLES {len(syl):>3} núcleos silábicos   ({len(syl) / dur:.2f}/s)
 *
 * Todo timing do vídeo é ancorado nesses valores (ver src/lib/sync.ts), para
 * que nada entre em frame arbitrário: cada elemento aparece junto com a fala.
 */

export type Phrase = {{ start: number; end: number }};

/** duração exata do áudio analisado, em segundos */
export const NARRATION_DURATION = {dur:.4f};

/** grupos de fala — usados para posicionar os cortes de cena nas pausas */
export const PHRASES: Phrase[] = [
{chr(10).join(f"  {{ start: {round(a, 2)}, end: {round(b, 2)} }}," for a, b in ph)}
];

/** onsets de palavra — âncora principal das animações */
export const BEATS: number[] = [
{fmt(beats)}
];

/** núcleos silábicos — para acentos mais finos (letra a letra, brilhos, ticks) */
export const SYLLABLES: number[] = [
{fmt(syl)}
];

/** as 10 maiores pausas — melhores pontos de corte entre cenas */
export const MAJOR_PAUSES = [
{chr(10).join(f"  {{ at: {round(at, 2)}, len: {round(g, 2)} }}," for g, at in major)}
];
'''

    with open("src/config/speechMap.ts", "w") as f:
        f.write(ts)

    print(f"{path}: {dur:.4f}s")
    print(f"  {len(ph)} frases · {len(beats)} beats de palavra · {len(syl)} sílabas")
    print(f"  taxa: {len(beats) / dur * 60:.0f} palavras/min, {len(syl) / dur:.1f} sílabas/s")
    print("  maiores pausas:", ", ".join(f"{round(at, 2)}s({round(g, 2)})" for g, at in major))
    print("  -> src/config/speechMap.ts")


if __name__ == "__main__":
    main()
