#!/usr/bin/env python3
"""
Sintetizador da biblioteca de efeitos sonoros do vídeo.

Gera os 18 SFX pedidos no briefing direto em DSP (sem samples de banco),
em WAV estéreo 48 kHz / 16 bit, dentro de video/public/sfx/.

Rodar:  python3 tools/make_sfx.py
"""
import os
import struct
import wave

import numpy as np

SR = 48_000
OUT = os.path.join(os.path.dirname(__file__), "..", "public", "sfx")
rng = np.random.default_rng(20260816)


# ── utilidades ────────────────────────────────────────────────────────────
def t(dur):
    return np.linspace(0, dur, int(SR * dur), endpoint=False)


def noise(dur):
    return rng.uniform(-1, 1, int(SR * dur))


def fade(sig, ms_in=3, ms_out=12):
    n_in, n_out = int(SR * ms_in / 1000), int(SR * ms_out / 1000)
    sig = sig.copy()
    if n_in > 0:
        sig[:n_in] *= np.linspace(0, 1, n_in)
    if n_out > 0:
        sig[-n_out:] *= np.linspace(1, 0, n_out)
    return sig


def env_exp(dur, attack=0.004, decay=None, power=2.4):
    """Envelope percussivo: ataque rápido, queda exponencial."""
    n = int(SR * dur)
    a = max(1, int(SR * attack))
    e = np.ones(n)
    e[:a] = np.linspace(0, 1, a) ** 0.6
    d = n - a
    if d > 0:
        tail = np.linspace(0, 1, d)
        k = decay if decay is not None else 1.0
        e[a:] = np.exp(-power * tail / k)
    return e


def env_bell(dur, curve=5.0):
    return np.exp(-curve * np.linspace(0, 1, int(SR * dur)))


def sweep(dur, f0, f1, curve="exp"):
    """Oscilador senoidal com varredura de frequência."""
    x = np.linspace(0, 1, int(SR * dur))
    f = f0 * (f1 / f0) ** x if curve == "exp" else f0 + (f1 - f0) * x
    return np.sin(2 * np.pi * np.cumsum(f) / SR)


def svf(sig, fc, q=1.4, mode="band"):
    """
    Filtro state-variable (Chamberlin) — aceita cutoff variável no tempo,
    que é o que dá o movimento dos whooshes.
    """
    fc = np.clip(np.asarray(fc, dtype=float), 20, SR * 0.45)
    if fc.ndim == 0:
        fc = np.full(len(sig), float(fc))
    f = 2.0 * np.sin(np.pi * fc / SR)
    damp = 1.0 / q
    low = band = 0.0
    out = np.empty(len(sig))
    for i, x in enumerate(sig):
        high = x - low - damp * band
        band += f[i] * high
        low += f[i] * band
        out[i] = {"band": band, "low": low, "high": high}[mode]
    return out


def soft_clip(sig, drive=1.0):
    return np.tanh(sig * drive)


def normalize(sig, peak=0.92):
    m = np.max(np.abs(sig))
    return sig * (peak / m) if m > 1e-9 else sig


def stereo(left, right=None, width=0.0):
    """Empilha em estéreo; `width` desloca a imagem (-1 esq, +1 dir)."""
    right = left if right is None else right
    n = max(len(left), len(right))
    left = np.pad(left, (0, n - len(left)))
    right = np.pad(right, (0, n - len(right)))
    if width:
        gl = np.clip(1 - max(0.0, width), 0.15, 1.0)
        gr = np.clip(1 + min(0.0, width), 0.15, 1.0)
        left, right = left * gl, right * gr
    return np.stack([left, right], axis=1)


def pan_move(sig, start=-1.0, end=1.0):
    """Panorâmica em movimento — usado nos pass-by."""
    p = np.linspace(start, end, len(sig))
    return np.stack([sig * np.sqrt((1 - p) / 2), sig * np.sqrt((1 + p) / 2)], axis=1)


def reverb(sig, amount=0.25, decay=0.35):
    """Reverb curto por combs — só para dar ar, sem cauda longa."""
    out = sig.astype(float).copy()
    for delay_ms, g in ((23, 0.5), (37, 0.42), (53, 0.34), (71, 0.28)):
        d = int(SR * delay_ms / 1000)
        tail = np.zeros(len(sig) + d)
        tail[d:] = sig * g * decay
        out = out + tail[: len(out)] * amount
    return out


def write(name, data):
    data = np.asarray(data, dtype=float)
    if data.ndim == 1:
        data = stereo(data)
    data = np.clip(data, -1.0, 1.0)
    pcm = (data * 32767).astype("<i2")
    path = os.path.join(OUT, f"{name}.wav")
    with wave.open(path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    dur = len(data) / SR
    print(f"  {name:<20} {dur:5.2f}s")


# ── os efeitos ────────────────────────────────────────────────────────────
def whoosh_short():
    d = 0.34
    n = noise(d)
    fc = 500 * (5200 / 500) ** (np.linspace(0, 1, len(n)) ** 0.75)
    body = svf(n, fc, q=2.2, mode="band")
    body *= np.sin(np.pi * np.linspace(0, 1, len(body))) ** 1.4
    air = svf(noise(d), 7000, q=0.8, mode="high") * env_exp(d, 0.02, power=3.2) * 0.25
    mix = normalize(fade(body + air), 0.72)
    return pan_move(mix, -0.5, 0.5)


def whoosh_transition():
    d = 0.72
    n = noise(d)
    x = np.linspace(0, 1, len(n))
    fc = 260 * (4200 / 260) ** (x**0.6)
    body = svf(n, fc, q=1.9, mode="band")
    body *= np.sin(np.pi * x) ** 1.1
    low = svf(noise(d), 180 + 140 * x, q=1.2, mode="low")
    low *= np.sin(np.pi * x) ** 1.6 * 0.55
    mix = soft_clip(body + low, 1.3)
    mix = normalize(fade(reverb(mix, 0.2)), 0.85)
    return pan_move(mix, -0.75, 0.75)


def swipe_pass():
    d = 0.17
    n = noise(d)
    x = np.linspace(0, 1, len(n))
    fc = 1400 * (9000 / 1400) ** x
    body = svf(n, fc, q=3.4, mode="band")
    body *= np.exp(-3.0 * x) * (1 - np.exp(-40 * x))
    mix = normalize(fade(body, 1, 8), 0.8)
    return pan_move(mix, -1.0, 1.0)


def pop_ui():
    d = 0.13
    body = sweep(d, 1150, 380) * env_exp(d, 0.002, power=8.0)
    click = svf(noise(0.012), 3800, q=1.0, mode="band") * env_exp(0.012, 0.0005, power=9)
    out = np.zeros(int(SR * d))
    out[: len(click)] += click * 0.55
    out += body
    return normalize(fade(out, 1, 10), 0.78)


def pop_soft():
    d = 0.12
    body = sweep(d, 420, 900) * env_exp(d, 0.008, power=7.0)
    body += sweep(d, 840, 1800) * env_exp(d, 0.01, power=9.0) * 0.25
    return normalize(fade(body, 3, 14), 0.55)


def click_digital():
    d = 0.055
    n = svf(noise(d), 2600, q=2.6, mode="band")
    n *= env_exp(d, 0.0006, power=14)
    tone = np.sin(2 * np.pi * 2100 * t(d)) * env_exp(d, 0.0004, power=18) * 0.4
    return normalize(fade(n + tone, 0.5, 6), 0.62)


def tap_button():
    d = 0.09
    thud = sweep(d, 260, 120) * env_exp(d, 0.002, power=11)
    tick = svf(noise(0.02), 1800, q=1.6, mode="band") * env_exp(0.02, 0.0005, power=12)
    out = thud * 0.8
    out[: len(tick)] += tick * 0.5
    return normalize(fade(out, 1, 10), 0.6)


def notification():
    d = 0.42
    o = np.zeros(int(SR * d))
    for start, freq, amp in ((0.0, 880.0, 1.0), (0.075, 1318.5, 0.85)):
        s = int(SR * start)
        seg_d = d - start
        tone = np.sin(2 * np.pi * freq * t(seg_d)) * env_bell(seg_d, 7.0)
        tone += np.sin(2 * np.pi * freq * 2 * t(seg_d)) * env_bell(seg_d, 11.0) * 0.3
        o[s : s + len(tone)] += tone * amp
    return normalize(fade(reverb(o, 0.3), 1, 30), 0.62)


def impact():
    d = 0.55
    low = sweep(d, 150, 46) * env_exp(d, 0.001, power=4.5)
    crack = svf(noise(0.09), 1600, q=1.1, mode="band") * env_exp(0.09, 0.0008, power=8)
    out = low * 1.0
    out[: len(crack)] += crack * 0.45
    out = soft_clip(out, 1.6)
    return normalize(fade(reverb(out, 0.15), 0.5, 40), 0.95)


def bass_hit():
    d = 0.75
    low = sweep(d, 105, 34) * env_exp(d, 0.002, power=3.2)
    sub = np.sin(2 * np.pi * 42 * t(d)) * env_exp(d, 0.01, power=2.6) * 0.5
    click = svf(noise(0.03), 900, q=1.0, mode="band") * env_exp(0.03, 0.0005, power=10)
    out = low + sub
    out[: len(click)] += click * 0.3
    return normalize(fade(soft_clip(out, 1.4), 1, 60), 0.96)


def sub_boom():
    d = 0.95
    sub = sweep(d, 68, 27) * env_exp(d, 0.006, power=2.4)
    sub += np.sin(2 * np.pi * 31 * t(d)) * env_exp(d, 0.02, power=2.0) * 0.45
    return normalize(fade(soft_clip(sub, 1.25), 2, 90), 0.97)


def riser():
    d = 0.85
    x = np.linspace(0, 1, int(SR * d))
    n = noise(d)
    fc = 300 * (7500 / 300) ** (x**1.5)
    body = svf(n, fc, q=2.8, mode="band") * (x**2.2)
    tone = sweep(d, 180, 1400) * (x**3) * 0.4
    out = fade(body + tone, 8, 6)
    return normalize(out, 0.7)


def reverse_whoosh():
    d = 0.42
    n = noise(d)
    x = np.linspace(0, 1, len(n))
    fc = 6000 * (600 / 6000) ** x
    body = svf(n, fc, q=2.4, mode="band")
    body *= x**2.6  # cresce e corta seco — sucção antes do elemento entrar
    return normalize(fade(body, 10, 2), 0.68)


def glitch():
    d = 0.22
    n = int(SR * d)
    out = np.zeros(n)
    pos = 0
    while pos < n:
        seg = int(SR * rng.uniform(0.008, 0.035))
        seg = min(seg, n - pos)
        if rng.random() < 0.68:
            freq = rng.choice([220, 440, 880, 1760, 3520])
            block = np.sign(np.sin(2 * np.pi * freq * t(seg / SR)))  # onda quadrada
            block *= rng.uniform(0.25, 0.9)
            crush = 2 ** rng.integers(2, 5)
            block = np.round(block * crush) / crush
            out[pos : pos + seg] = block[:seg]
        pos += seg
    out = svf(out, 3000, q=0.9, mode="band") + out * 0.4
    return normalize(fade(out, 1, 8), 0.5)


def tick():
    d = 0.028
    n = svf(noise(d), 6200, q=2.0, mode="band") * env_exp(d, 0.0003, power=16)
    return normalize(fade(n, 0.3, 4), 0.45)


def success():
    d = 0.75
    o = np.zeros(int(SR * d))
    for i, freq in enumerate((659.25, 830.61, 987.77, 1318.51)):  # E maior
        start = i * 0.055
        s = int(SR * start)
        seg_d = d - start
        tone = np.sin(2 * np.pi * freq * t(seg_d)) * env_bell(seg_d, 5.0)
        tone += np.sin(2 * np.pi * freq * 2.01 * t(seg_d)) * env_bell(seg_d, 8.0) * 0.22
        o[s : s + len(tone)] += tone * (0.9 - i * 0.12)
    return normalize(fade(reverb(o, 0.35), 1, 60), 0.66)


def sparkle():
    d = 0.6
    o = np.zeros(int(SR * d))
    for _ in range(14):
        start = rng.uniform(0, 0.34)
        freq = rng.uniform(2600, 8200)
        s = int(SR * start)
        seg_d = min(0.28, d - start)
        tone = np.sin(2 * np.pi * freq * t(seg_d)) * env_bell(seg_d, 13.0)
        o[s : s + len(tone)] += tone * rng.uniform(0.18, 0.5)
    return normalize(fade(reverb(o, 0.4), 1, 50), 0.5)


def logo_sting():
    d = 1.3
    o = np.zeros(int(SR * d))
    # impacto grave de abertura
    hit = sweep(0.5, 120, 40) * env_exp(0.5, 0.002, power=4.0)
    o[: len(hit)] += hit * 0.85
    # acorde suave sustentado (Mi maior)
    for freq, amp in ((329.63, 0.5), (415.30, 0.4), (493.88, 0.36), (659.25, 0.3)):
        seg_d = d - 0.06
        s = int(SR * 0.06)
        tone = np.sin(2 * np.pi * freq * t(seg_d)) * env_bell(seg_d, 3.0)
        o[s : s + len(tone)] += tone * amp
    # brilho no topo
    sh = np.zeros(int(SR * d))
    for _ in range(9):
        start = rng.uniform(0.1, 0.5)
        freq = rng.uniform(3000, 7600)
        s = int(SR * start)
        seg_d = min(0.4, d - start)
        sh[s : s + int(SR * seg_d)] += (
            np.sin(2 * np.pi * freq * t(seg_d)) * env_bell(seg_d, 9.0) * 0.22
        )
    o += sh
    return normalize(fade(reverb(soft_clip(o, 1.2), 0.4), 2, 120), 0.88)


EFFECTS = {
    "whoosh-short": whoosh_short,
    "whoosh-transition": whoosh_transition,
    "swipe-pass": swipe_pass,
    "pop-ui": pop_ui,
    "pop-soft": pop_soft,
    "click-digital": click_digital,
    "tap-button": tap_button,
    "notification": notification,
    "impact": impact,
    "bass-hit": bass_hit,
    "sub-boom": sub_boom,
    "riser": riser,
    "reverse-whoosh": reverse_whoosh,
    "glitch": glitch,
    "tick": tick,
    "success": success,
    "sparkle": sparkle,
    "logo-sting": logo_sting,
}

if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    print(f"Gerando {len(EFFECTS)} efeitos em {os.path.normpath(OUT)}")
    for name, fn in EFFECTS.items():
        write(name, fn())
    print("Pronto.")
