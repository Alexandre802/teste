#!/usr/bin/env python3
"""
Gerador procedural da biblioteca de efeitos sonoros do vídeo ConsulTech.

Nenhum asset externo é necessário: todos os SFX pedidos no briefing
(whoosh, pop, click, impact, riser, glitch, chime, sparkle, sting...)
são sintetizados aqui e escritos como WAV 44.1 kHz estéreo em
public/audio/sfx/.

Uso:  python3 tools/gen_sfx.py
"""

import os
import wave
import struct
import numpy as np

SR = 44100
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public", "audio", "sfx")

rng = np.random.default_rng(20260806)


# ----------------------------------------------------------------------------
# helpers
# ----------------------------------------------------------------------------
def t(dur):
    return np.arange(int(SR * dur)) / SR


def noise(dur, kind="white"):
    n = rng.normal(0, 1, int(SR * dur))
    if kind == "pink":
        # integração leve -> inclinação -3 dB/oct
        b = np.zeros_like(n)
        acc = 0.0
        for i, v in enumerate(n):
            acc = 0.985 * acc + 0.015 * v
            b[i] = acc * 12 + v * 0.35
        n = b
    return n


def svf(x, cutoff, q=0.7, mode="lp"):
    """State variable filter com cutoff variável no tempo (array ou escalar)."""
    n = len(x)
    if np.isscalar(cutoff):
        cutoff = np.full(n, float(cutoff))
    cutoff = np.clip(cutoff, 20.0, SR * 0.45)
    g = np.tan(np.pi * cutoff / SR)
    k = 1.0 / max(q, 0.05)
    out = np.zeros(n)
    ic1 = 0.0
    ic2 = 0.0
    for i in range(n):
        gi = g[i]
        a1 = 1.0 / (1.0 + gi * (gi + k))
        a2 = gi * a1
        a3 = gi * a2
        v3 = x[i] - ic2
        v1 = a1 * ic1 + a2 * v3
        v2 = ic2 + a2 * ic1 + a3 * v3
        ic1 = 2.0 * v1 - ic1
        ic2 = 2.0 * v2 - ic2
        if mode == "lp":
            out[i] = v2
        elif mode == "hp":
            out[i] = x[i] - k * v1 - v2
        else:  # bp
            out[i] = v1
    return out


def env(dur, attack=0.005, decay=None, curve=3.0, sustain=0.0, release=None):
    """Envelope percussivo AD/ADR."""
    n = int(SR * dur)
    e = np.zeros(n)
    a = max(int(SR * attack), 1)
    a = min(a, n)
    e[:a] = np.linspace(0, 1, a) ** 0.6
    rest = n - a
    if rest > 0:
        if decay is None:
            decay = dur - attack
        d = min(int(SR * decay), rest)
        e[a:a + d] = (1 - np.linspace(0, 1, d)) ** curve * (1 - sustain) + sustain
        if rest - d > 0:
            e[a + d:] = sustain * (1 - np.linspace(0, 1, rest - d)) ** 2
    return e


def expsweep(dur, f0, f1):
    """Fase de um sweep exponencial de f0 a f1."""
    x = t(dur)
    k = (f1 / f0) ** (1.0 / max(dur, 1e-6))
    return 2 * np.pi * f0 * (k ** x - 1) / np.log(k)


def sat(x, amount=1.6):
    return np.tanh(x * amount) / np.tanh(amount)


def stereo(left, right=None, width=0.35):
    if right is None:
        right = left.copy()
    # micro delay para largura
    d = int(SR * 0.0009 * width * 10)
    if d > 0:
        right = np.concatenate([np.zeros(d), right[:-d]])
    return np.stack([left, right], axis=1)


def pan(x, p):
    """p: array de -1 (esq) a 1 (dir)."""
    p = np.clip(p, -1, 1)
    l = x * np.sqrt((1 - p) / 2)
    r = x * np.sqrt((1 + p) / 2)
    return np.stack([l, r], axis=1)


def reverb(x, dur=0.35, mix=0.25, pre=0.01):
    """Reverb barato por convolução com ruído decaindo."""
    n = int(SR * dur)
    ir = rng.normal(0, 1, n) * (1 - np.linspace(0, 1, n)) ** 3.2
    ir = svf(ir, 6500, 0.7, "lp")
    ir[: int(SR * pre)] = 0
    ir /= np.max(np.abs(ir)) + 1e-9
    if x.ndim == 1:
        wet = np.convolve(x, ir)[: len(x)]
        return x * (1 - mix) + wet * mix
    out = np.zeros_like(x)
    for c in range(x.shape[1]):
        wet = np.convolve(x[:, c], ir)[: len(x)]
        out[:, c] = x[:, c] * (1 - mix) + wet * mix
    return out


def fadeio(x, fi=0.004, fo=0.02):
    n = len(x)
    a = min(int(SR * fi), n // 2)
    b = min(int(SR * fo), n // 2)
    g = np.ones(n)
    if a:
        g[:a] = np.linspace(0, 1, a)
    if b:
        g[-b:] = np.linspace(1, 0, b)
    return x * (g[:, None] if x.ndim == 2 else g)


def write(name, x, peak=0.9):
    x = np.asarray(x, dtype=np.float64)
    if x.ndim == 1:
        x = stereo(x)
    x = fadeio(x)
    m = np.max(np.abs(x))
    if m > 0:
        x = x / m * peak
    data = np.clip(x, -1, 1)
    ints = (data * 32767).astype("<i2")
    path = os.path.join(OUT, name)
    with wave.open(path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(ints.tobytes())
    print(f"  {name:<26} {len(x)/SR:5.2f}s")


# ----------------------------------------------------------------------------
# 1. Whoosh / Swoosh curto — entradas rápidas de textos e elementos
# ----------------------------------------------------------------------------
def whoosh_short():
    d = 0.30
    n = noise(d, "pink")
    cut = 400 + 5200 * (np.linspace(0, 1, len(n)) ** 0.7)
    body = svf(n, cut, 1.1, "bp")
    e = env(d, 0.012, d - 0.012, curve=2.6)
    x = body * e * 0.9
    x += svf(n, 220, 0.8, "lp") * e * 0.25
    return reverb(stereo(sat(x, 1.3), width=0.5), 0.18, 0.18)


# ----------------------------------------------------------------------------
# 2. Whoosh de transição — mais encorpado, trocas entre telas
# ----------------------------------------------------------------------------
def whoosh_transition():
    d = 0.85
    n = noise(d, "pink")
    x = np.linspace(0, 1, len(n))
    # sobe e desce (passagem)
    cut = 250 + 6000 * np.sin(np.pi * x ** 0.85) ** 1.4 + 150
    body = svf(n, cut, 1.3, "bp") * 1.0
    low = svf(n, 130 + 90 * x, 0.9, "lp") * 0.55
    e = env(d, 0.10, d - 0.10, curve=1.9)
    mono = sat((body + low) * e, 1.25)
    st = pan(mono, np.linspace(-0.85, 0.85, len(mono)))
    return reverb(st, 0.45, 0.3)


# ----------------------------------------------------------------------------
# 3. Swipe / Fast pass-by — passagem extremamente rápida
# ----------------------------------------------------------------------------
def swipe_fast():
    d = 0.16
    n = noise(d, "white")
    x = np.linspace(0, 1, len(n))
    cut = 900 + 9000 * np.sin(np.pi * x) ** 2
    body = svf(n, cut, 2.0, "bp")
    e = env(d, 0.004, d - 0.004, curve=2.2)
    mono = sat(body * e, 1.5)
    return pan(mono, np.linspace(-1, 1, len(mono)))


# ----------------------------------------------------------------------------
# 4. Pop UI — palavras, ícones e cards aparecendo
# ----------------------------------------------------------------------------
def pop_ui():
    d = 0.13
    ph = expsweep(d, 1250, 320)
    tone = np.sin(ph)
    e = env(d, 0.002, 0.075, curve=4.2)
    click = noise(0.012, "white") * env(0.012, 0.0005, 0.011, curve=3.0) * 0.5
    x = tone * e
    x[: len(click)] += click
    x = sat(x, 1.2) * 0.9
    return reverb(stereo(x, width=0.25), 0.1, 0.12)


# ----------------------------------------------------------------------------
# 5. Soft pop / Bubble pop — elementos menores
# ----------------------------------------------------------------------------
def pop_soft():
    d = 0.18
    ph = expsweep(d, 620, 210)
    tone = np.sin(ph) + 0.22 * np.sin(2 * ph)
    e = env(d, 0.006, 0.12, curve=3.4)
    x = svf(tone * e, 2600, 0.7, "lp") * 0.85
    return reverb(stereo(x, width=0.2), 0.12, 0.14)


# ----------------------------------------------------------------------------
# 6. Digital click / UI click — botões e interfaces
# ----------------------------------------------------------------------------
def click_digital():
    d = 0.055
    n = noise(d, "white")
    body = svf(n, 3800, 2.4, "bp")
    e = env(d, 0.0006, 0.03, curve=5.0)
    tick = np.sin(2 * np.pi * 2100 * t(d)) * env(d, 0.0004, 0.012, curve=6.0) * 0.5
    return stereo(sat(body * e + tick, 1.4) * 0.8, width=0.15)


# ----------------------------------------------------------------------------
# 7. Tap / Button press — toque em botão de app
# ----------------------------------------------------------------------------
def tap_button():
    d = 0.10
    ph = expsweep(d, 900, 420)
    tone = np.sin(ph) * env(d, 0.0015, 0.05, curve=4.0)
    thump = np.sin(2 * np.pi * 150 * t(d)) * env(d, 0.001, 0.06, curve=3.2) * 0.55
    n = noise(0.02, "white") * env(0.02, 0.0005, 0.019, curve=3.5) * 0.28
    x = tone + thump
    x[: len(n)] += svf(n, 5200, 1.2, "bp")
    return stereo(sat(x, 1.2) * 0.85, width=0.2)


# ----------------------------------------------------------------------------
# 8. Notification pop — notificação de app
# ----------------------------------------------------------------------------
def notification():
    d = 0.42
    x = np.zeros(int(SR * d))
    for i, (f, at) in enumerate([(1174.7, 0.0), (1567.98, 0.085)]):
        seg = env(d - at, 0.004, 0.26, curve=3.4)
        tone = (np.sin(2 * np.pi * f * t(d - at)) + 0.3 * np.sin(2 * np.pi * f * 2 * t(d - at))) * seg
        s = int(SR * at)
        x[s:s + len(tone)] += tone * (0.9 if i == 0 else 0.75)
    return reverb(stereo(svf(x, 8000, 0.7, "lp") * 0.8, width=0.3), 0.3, 0.24)


# ----------------------------------------------------------------------------
# 9. Impact / Hit — destaque de frases importantes
# ----------------------------------------------------------------------------
def impact():
    d = 0.75
    ph = expsweep(d, 190, 46)
    low = np.sin(ph) * env(d, 0.002, 0.5, curve=2.6)
    n = noise(d, "white")
    crack = svf(n, np.linspace(5200, 700, len(n)), 1.0, "bp") * env(d, 0.001, 0.16, curve=4.4) * 0.55
    mid = np.sin(2 * np.pi * 320 * t(d)) * env(d, 0.001, 0.12, curve=5.0) * 0.35
    x = sat(low * 1.1 + crack + mid, 1.5)
    return reverb(stereo(x, width=0.4), 0.5, 0.26)


# ----------------------------------------------------------------------------
# 10. Bass hit / Low impact — peso nas mudanças de cena
# ----------------------------------------------------------------------------
def bass_hit():
    d = 0.9
    ph = expsweep(d, 130, 38)
    low = np.sin(ph) * env(d, 0.004, 0.62, curve=2.2)
    sub = np.sin(expsweep(d, 62, 30)) * env(d, 0.01, 0.7, curve=1.8) * 0.7
    click = noise(0.03, "white") * env(0.03, 0.0008, 0.028, curve=4.0) * 0.3
    x = low + sub
    x[: len(click)] += svf(click, 2400, 1.0, "bp")
    return stereo(sat(x, 1.35) * 0.95, width=0.2)


# ----------------------------------------------------------------------------
# 11. Sub boom — grave curto de destaque
# ----------------------------------------------------------------------------
def sub_boom():
    d = 1.2
    ph = expsweep(d, 88, 27)
    x = np.sin(ph) * env(d, 0.008, 0.95, curve=1.7)
    x += np.sin(expsweep(d, 44, 22)) * env(d, 0.02, 1.0, curve=1.5) * 0.55
    return stereo(sat(svf(x, 220, 0.7, "lp"), 1.2), width=0.12)


# ----------------------------------------------------------------------------
# 12. Riser curto — prepara transições
# ----------------------------------------------------------------------------
def riser():
    d = 1.15
    n = noise(d, "pink")
    x = np.linspace(0, 1, len(n))
    body = svf(n, 300 * (30 ** x), 1.6, "bp")
    tone = np.sin(expsweep(d, 220, 1760)) * 0.35
    e = (x ** 2.2) * 0.95 + 0.05
    e[-int(SR * 0.05):] *= np.linspace(1, 0.2, int(SR * 0.05))
    mono = sat((body + tone) * e, 1.3)
    st = pan(mono, np.sin(np.linspace(0, 6 * np.pi, len(mono))) * 0.55)
    return reverb(st, 0.4, 0.22)


# ----------------------------------------------------------------------------
# 13. Reverse whoosh — sucção antes da entrada de um elemento
# ----------------------------------------------------------------------------
def reverse_whoosh():
    d = 0.55
    n = noise(d, "pink")
    x = np.linspace(0, 1, len(n))
    body = svf(n, 500 + 5200 * x ** 1.5, 1.4, "bp")
    e = (x ** 2.6)
    mono = sat(body * e, 1.35)
    mono[-int(SR * 0.03):] *= np.linspace(1, 0, int(SR * 0.03))
    return reverb(stereo(mono, width=0.55), 0.2, 0.16)


# ----------------------------------------------------------------------------
# 14. Digital glitch / Tech glitch — mudanças rápidas
# ----------------------------------------------------------------------------
def glitch():
    d = 0.26
    n = int(SR * d)
    x = np.zeros(n)
    pos = 0
    while pos < n:
        seg = rng.integers(int(SR * 0.008), int(SR * 0.035))
        seg = int(min(seg, n - pos))
        if seg <= 0:
            break
        kind = rng.integers(0, 3)
        tt = np.arange(seg) / SR
        if kind == 0:
            f = float(rng.choice([420, 880, 1320, 2200, 3300]))
            s = np.sign(np.sin(2 * np.pi * f * tt))  # square
        elif kind == 1:
            s = noise((seg + 2) / SR, "white")[:seg]
            s = svf(s, float(rng.choice([1200, 2600, 5200])), 3.0, "bp")
        else:
            s = np.zeros(seg)
        # bitcrush
        if len(s):
            s = np.round(s * 5) / 5
        s = np.resize(s, seg)
        x[pos:pos + seg] = s * float(rng.uniform(0.35, 1.0))
        pos += seg
    e = env(d, 0.001, d - 0.001, curve=1.6)
    mono = sat(x * e, 1.1) * 0.8
    return pan(mono, np.sign(np.sin(np.linspace(0, 14 * np.pi, len(mono)))) * 0.6)


# ----------------------------------------------------------------------------
# 15. Tick / Micro click — detalhes gráficos
# ----------------------------------------------------------------------------
def tick():
    d = 0.028
    n = noise(d, "white")
    x = svf(n, 6800, 3.0, "bp") * env(d, 0.0003, 0.02, curve=5.5)
    return stereo(x * 0.7, width=0.1)


# ----------------------------------------------------------------------------
# 16. Success / Confirmation chime — check / concluído
# ----------------------------------------------------------------------------
def success():
    d = 0.85
    x = np.zeros(int(SR * d))
    notes = [(1046.5, 0.0), (1318.5, 0.075), (1568.0, 0.15), (2093.0, 0.225)]
    for f, at in notes:
        dur = d - at
        tt = t(dur)
        e = env(dur, 0.004, min(0.5, dur), curve=3.0)
        tone = (np.sin(2 * np.pi * f * tt) + 0.25 * np.sin(2 * np.pi * f * 2 * tt)
                + 0.1 * np.sin(2 * np.pi * f * 3 * tt)) * e
        s = int(SR * at)
        x[s:s + len(tone)] += tone * 0.55
    return reverb(stereo(svf(x, 9500, 0.7, "lp"), width=0.4), 0.55, 0.3)


# ----------------------------------------------------------------------------
# 17. Sparkle / Shine — brilho agudo para destaques
# ----------------------------------------------------------------------------
def sparkle():
    d = 0.9
    x = np.zeros(int(SR * d))
    for _ in range(16):
        at = float(rng.uniform(0, 0.42))
        f = float(rng.uniform(2200, 7200))
        dur = min(0.28, d - at)
        tt = t(dur)
        e = env(dur, 0.002, dur, curve=4.0)
        # FM bell
        tone = np.sin(2 * np.pi * f * tt + 2.2 * np.sin(2 * np.pi * f * 1.41 * tt) * np.exp(-tt * 18)) * e
        s = int(SR * at)
        x[s:s + len(tone)] += tone * float(rng.uniform(0.18, 0.4))
    st = pan(x, np.sin(np.linspace(0, 3 * np.pi, len(x))) * 0.7)
    return reverb(st, 0.7, 0.36)


# ----------------------------------------------------------------------------
# 18. Logo sting — finalização / branding
# ----------------------------------------------------------------------------
def logo_sting():
    d = 1.9
    n = int(SR * d)
    x = np.zeros(n)
    # impacto grave
    ph = expsweep(d, 120, 40)
    x += np.sin(ph) * env(d, 0.004, 0.8, curve=2.0) * 0.9
    # acorde (Bb maior-ish, brilhante)
    for f, g in [(233.08, 0.35), (349.23, 0.3), (466.16, 0.28), (698.46, 0.22), (932.33, 0.16)]:
        tt = t(d)
        e = env(d, 0.02, 1.5, curve=1.9)
        x += (np.sin(2 * np.pi * f * tt) + 0.2 * np.sin(2 * np.pi * f * 2 * tt)) * e * g
    # shimmer
    sp = sparkle()[:, 0]
    L = min(len(sp), n)
    x[:L] += sp[:L] * 0.5
    # riser curto na cabeça
    rs = riser()[:, 0]
    L2 = min(len(rs), int(SR * 0.5))
    x[:L2] += rs[-L2:] * 0.35
    mono = sat(svf(x, 12000, 0.7, "lp"), 1.15)
    return reverb(stereo(mono, width=0.45), 0.9, 0.32)


LIB = [
    ("whoosh-short.wav", whoosh_short),
    ("whoosh-transition.wav", whoosh_transition),
    ("swipe-fast.wav", swipe_fast),
    ("pop-ui.wav", pop_ui),
    ("pop-soft.wav", pop_soft),
    ("click-digital.wav", click_digital),
    ("tap-button.wav", tap_button),
    ("notification.wav", notification),
    ("impact.wav", impact),
    ("bass-hit.wav", bass_hit),
    ("sub-boom.wav", sub_boom),
    ("riser.wav", riser),
    ("reverse-whoosh.wav", reverse_whoosh),
    ("glitch.wav", glitch),
    ("tick.wav", tick),
    ("success.wav", success),
    ("sparkle.wav", sparkle),
    ("logo-sting.wav", logo_sting),
]

if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    print(f"gerando {len(LIB)} efeitos em {OUT}")
    for name, fn in LIB:
        write(name, fn())
    print("ok")
