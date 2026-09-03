#!/usr/bin/env python3
"""
Sintetizador da biblioteca de efeitos sonoros do reel Monttra.

Gera 18 SFX em 48kHz estereo, WAV 16-bit, em public/sfx/.
Todos os sons sao sintetizados do zero (sem samples externos).
"""
import os
import struct
import numpy as np

SR = 48000
OUT = os.path.join(os.path.dirname(__file__), "..", "public", "sfx")
rng = np.random.default_rng(20260814)


# ---------------------------------------------------------------- utilidades
def t(dur):
    return np.linspace(0, dur, int(SR * dur), endpoint=False)


def env_ad(n, attack, decay, curve=2.2):
    """Envelope attack/decay com curva exponencial."""
    a = max(1, int(n * attack))
    d = max(1, n - a)
    up = np.linspace(0, 1, a) ** 0.5
    down = np.linspace(1, 0, d) ** curve
    return np.concatenate([up, down])[:n]


def env_exp(n, k=5.0):
    return np.exp(-k * np.linspace(0, 1, n))


def noise(n, color=0.0):
    """Ruido branco; color>0 escurece (low-pass), color<0 clareia (high-pass)."""
    x = rng.normal(0, 1, n)
    if color > 0:
        x = onepole_lp(x, np.full(n, 1.0 - color))
    elif color < 0:
        x = x - onepole_lp(x, np.full(n, 1.0 + color))
    return x


def onepole_lp(x, coef):
    """Low-pass 1 polo com coeficiente variante no tempo (0..1)."""
    y = np.empty_like(x)
    acc = 0.0
    c = np.clip(coef, 0.0005, 1.0)
    for i in range(len(x)):
        acc += c[i] * (x[i] - acc)
        y[i] = acc
    return y


def biquad_bp(x, freqs, q=3.0):
    """Band-pass com frequencia variante no tempo (implementacao direta)."""
    y = np.zeros_like(x)
    x1 = x2 = y1 = y2 = 0.0
    for i in range(len(x)):
        w0 = 2 * np.pi * np.clip(freqs[i], 20, SR * 0.45) / SR
        alpha = np.sin(w0) / (2 * q)
        cw = np.cos(w0)
        b0, b1, b2 = alpha, 0.0, -alpha
        a0, a1, a2 = 1 + alpha, -2 * cw, 1 - alpha
        out = (b0 * x[i] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0
        x2, x1 = x1, x[i]
        y2, y1 = y1, out
        y[i] = out
    return y


def sweep(n, f0, f1, curve=1.0):
    """Rampa de frequencia com curva (1=linear, >1 acelera no fim)."""
    p = np.linspace(0, 1, n) ** curve
    return f0 + (f1 - f0) * p


def osc(freqs, phase0=0.0):
    return np.sin(2 * np.pi * np.cumsum(freqs) / SR + phase0)


def saturate(x, drive=2.0):
    return np.tanh(x * drive) / np.tanh(drive)


def widen(mono, amount=0.35, delay_ms=7.0):
    """Cria estereo a partir de mono com micro-atraso + inversao parcial."""
    d = int(SR * delay_ms / 1000)
    left = mono.copy()
    right = np.concatenate([np.zeros(d), mono[:-d] if d else mono])
    r = (1 - amount) * mono + amount * right
    l = (1 - amount) * mono + amount * np.concatenate([np.zeros(d // 2), left[: len(left) - d // 2]])
    return np.stack([l, r], axis=1)


def norm(x, peak=0.92):
    m = np.max(np.abs(x))
    return x * (peak / m) if m > 1e-9 else x


def fade_edges(x, ms=3.0):
    n = int(SR * ms / 1000)
    if len(x) > 2 * n and n > 0:
        ramp = np.linspace(0, 1, n)
        if x.ndim == 2:
            x[:n] *= ramp[:, None]
            x[-n:] *= ramp[::-1][:, None]
        else:
            x[:n] *= ramp
            x[-n:] *= ramp[::-1]
    return x


def save(name, data, peak=0.9):
    if data.ndim == 1:
        data = np.stack([data, data], axis=1)
    data = fade_edges(norm(data, peak))
    pcm = np.clip(data, -1, 1)
    ints = (pcm * 32767).astype("<i2")
    raw = ints.tobytes()
    path = os.path.join(OUT, name)
    with open(path, "wb") as f:
        f.write(b"RIFF" + struct.pack("<I", 36 + len(raw)) + b"WAVEfmt ")
        f.write(struct.pack("<IHHIIHH", 16, 1, 2, SR, SR * 2 * 2, 4, 16))
        f.write(b"data" + struct.pack("<I", len(raw)) + raw)
    print(f"  {name:24s} {len(raw)/1024:7.1f} KB  {len(data)/SR:.3f}s")


# ---------------------------------------------------------------- os 18 sons
def whoosh_short():
    d = 0.30
    n = len(t(d))
    f = sweep(n, 700, 5200, curve=1.6)
    body = biquad_bp(noise(n), f, q=1.4)
    body *= env_ad(n, 0.35, 0.65, curve=2.4)
    air = noise(n, -0.4) * env_ad(n, 0.5, 0.5, 3.5) * 0.25
    return widen(saturate(body + air, 1.6), 0.45, 6)


def whoosh_transition():
    d = 0.75
    n = len(t(d))
    f = np.concatenate([sweep(n // 2, 400, 2600, 1.3), sweep(n - n // 2, 2600, 320, 0.7)])
    body = biquad_bp(noise(n), f, q=1.1)
    body *= env_ad(n, 0.42, 0.58, curve=1.7)
    sub = osc(sweep(n, 90, 42, 1.4)) * env_exp(n, 3.2) * 0.5
    return widen(saturate(body * 1.1 + sub, 1.4), 0.5, 11)


def swipe_fast():
    d = 0.15
    n = len(t(d))
    f = sweep(n, 1800, 9000, 2.2)
    x = biquad_bp(noise(n, -0.2), f, q=2.2) * env_ad(n, 0.18, 0.82, 3.0)
    return widen(saturate(x, 2.0), 0.6, 4)


def pop_ui():
    d = 0.10
    n = len(t(d))
    f = sweep(n, 1750, 620, 0.45)
    body = osc(f) * env_exp(n, 26)
    click = noise(n, -0.5) * env_exp(n, 190) * 0.35
    return widen(saturate(body + click, 1.8), 0.25, 3)


def pop_soft():
    d = 0.14
    n = len(t(d))
    f = sweep(n, 900, 340, 0.5)
    body = osc(f) * env_exp(n, 17)
    body += osc(f * 2.01) * env_exp(n, 30) * 0.22
    return widen(saturate(body, 1.2) * 0.85, 0.3, 5)


def click_digital():
    d = 0.05
    n = len(t(d))
    x = noise(n, -0.35) * env_exp(n, 230)
    x += osc(sweep(n, 3200, 1500, 0.4)) * env_exp(n, 150) * 0.5
    return widen(saturate(x, 2.4), 0.2, 2)


def tap_button():
    d = 0.09
    n = len(t(d))
    thud = osc(sweep(n, 320, 150, 0.6)) * env_exp(n, 42)
    tick = noise(n, -0.2) * env_exp(n, 260) * 0.3
    return widen(saturate(thud + tick, 1.5) * 0.9, 0.25, 3)


def notification_pop():
    d = 0.30
    n = len(t(d))
    half = n // 2
    a = osc(np.full(half, 880.0)) * env_ad(half, 0.06, 0.94, 3.0)
    b = osc(np.full(n - half, 1318.5)) * env_ad(n - half, 0.05, 0.95, 2.6)
    seq = np.concatenate([a, b])
    shine = osc(np.full(n, 2637.0)) * env_exp(n, 9) * 0.16
    return widen(saturate(seq * 0.9 + shine, 1.3), 0.35, 6)


def impact_hit():
    d = 0.55
    n = len(t(d))
    sub = osc(sweep(n, 150, 45, 1.6)) * env_exp(n, 7.5)
    crack = noise(n, -0.1) * env_exp(n, 55) * 0.55
    body = biquad_bp(noise(n), sweep(n, 900, 220, 1.2), q=1.0) * env_exp(n, 14) * 0.5
    return widen(saturate(sub * 1.15 + crack + body, 1.9), 0.3, 8)


def bass_hit():
    d = 0.60
    n = len(t(d))
    sub = osc(sweep(n, 110, 38, 1.8)) * env_exp(n, 5.5)
    knock = osc(sweep(n, 400, 90, 2.4)) * env_exp(n, 30) * 0.35
    air = noise(n, 0.5) * env_exp(n, 40) * 0.12
    return widen(saturate(sub * 1.25 + knock + air, 2.1), 0.25, 9)


def sub_boom():
    d = 1.00
    n = len(t(d))
    sub = osc(sweep(n, 78, 27, 2.0)) * env_exp(n, 3.4)
    harm = osc(sweep(n, 156, 54, 2.0)) * env_exp(n, 6.0) * 0.18
    return widen(saturate(sub * 1.3 + harm, 1.7), 0.15, 12)


def riser_short():
    d = 0.95
    n = len(t(d))
    ramp = np.linspace(0, 1, n)
    nz = biquad_bp(noise(n), sweep(n, 500, 8000, 2.1), q=1.5) * (ramp ** 2.4)
    tone = osc(sweep(n, 220, 1400, 2.6)) * (ramp ** 3.0) * 0.45
    trem = 1 + 0.25 * np.sin(2 * np.pi * np.cumsum(sweep(n, 7, 26, 1.5)) / SR)
    x = (nz + tone) * trem
    x[-int(SR * 0.02):] *= np.linspace(1, 0, int(SR * 0.02))
    return widen(saturate(x, 1.5), 0.55, 10)


def reverse_whoosh():
    d = 0.55
    n = len(t(d))
    f = sweep(n, 600, 6500, 1.8)
    x = biquad_bp(noise(n), f, q=1.3)
    ramp = np.linspace(0, 1, n) ** 2.8
    x *= ramp
    x[-int(SR * 0.015):] *= np.linspace(1, 0, int(SR * 0.015))
    return widen(saturate(x, 1.6), 0.55, 9)


def glitch_digital():
    d = 0.24
    n = len(t(d))
    base = noise(n, -0.15) * 0.8
    tone = osc(np.repeat(rng.choice([420, 900, 1700, 3100, 5200], size=12), n // 12 + 1)[:n]) * 0.6
    x = base + tone
    # gate ritmico irregular (bit-crush + stutter)
    gate = np.zeros(n)
    pos = 0
    while pos < n:
        seg = int(rng.integers(int(SR * 0.004), int(SR * 0.022)))
        gate[pos:pos + seg] = rng.choice([0.0, 0.35, 1.0], p=[0.34, 0.26, 0.40])
        pos += seg
    x *= gate
    step = 7
    x = np.round(x * step) / step  # bit-crush
    x *= env_ad(n, 0.05, 0.95, 1.4)
    return widen(saturate(x, 1.8) * 0.8, 0.7, 5)


def tick_micro():
    d = 0.035
    n = len(t(d))
    x = noise(n, -0.45) * env_exp(n, 320)
    x += osc(np.full(n, 4200.0)) * env_exp(n, 260) * 0.4
    return widen(saturate(x, 2.0) * 0.7, 0.15, 2)


def success_chime():
    d = 0.75
    n = len(t(d))
    out = np.zeros(n)
    # arpejo maior: E5, G#5, B5, E6
    for i, fr in enumerate([659.3, 830.6, 987.8, 1318.5]):
        off = int(SR * 0.055 * i)
        seg = n - off
        if seg <= 0:
            continue
        v = osc(np.full(seg, fr)) * env_exp(seg, 5.0)
        v += osc(np.full(seg, fr * 2)) * env_exp(seg, 8.0) * 0.28
        v += osc(np.full(seg, fr * 3.01)) * env_exp(seg, 12.0) * 0.10
        out[off:] += v * (0.9 - 0.12 * i)
    return widen(saturate(out * 0.55, 1.2), 0.4, 13)


def sparkle_shine():
    d = 0.65
    n = len(t(d))
    out = np.zeros(n)
    scale = [1568, 1760, 2093, 2637, 3136, 3520, 4186]
    for i in range(16):
        fr = float(rng.choice(scale)) * rng.choice([1.0, 1.0, 2.0])
        off = int(rng.integers(0, int(n * 0.62)))
        seg = n - off
        v = osc(np.full(seg, fr)) * env_exp(seg, rng.uniform(11, 22))
        out[off:] += v * rng.uniform(0.16, 0.42)
    out *= env_ad(n, 0.03, 0.97, 1.3)
    return widen(out * 0.7, 0.62, 15)


def logo_sting():
    d = 1.60
    n = len(t(d))
    out = np.zeros(n)
    # acorde Emaj (E3 G#3 B3 E4) com swell
    for i, fr in enumerate([164.8, 207.7, 246.9, 329.6]):
        v = osc(np.full(n, fr)) * 0.30
        v += osc(np.full(n, fr * 2)) * 0.12
        v += osc(np.full(n, fr * 3.005)) * 0.05
        swell = np.clip(np.linspace(0, 1, n) * 3.2, 0, 1) ** 1.4
        out += v * swell * np.exp(-1.7 * np.linspace(0, 1, n)) * (1 - 0.1 * i)
    sub = osc(sweep(n, 95, 41, 1.5)) * env_exp(n, 2.6) * 0.75
    shimmer = np.zeros(n)
    for _ in range(10):
        fr = float(rng.choice([1318, 1661, 1975, 2637, 3322]))
        off = int(rng.integers(0, int(n * 0.45)))
        seg = n - off
        shimmer[off:] += osc(np.full(seg, fr)) * env_exp(seg, 6.5) * rng.uniform(0.05, 0.13)
    tail = biquad_bp(noise(n), sweep(n, 3000, 700, 1.2), q=1.0) * env_exp(n, 4.0) * 0.10
    return widen(saturate(out + sub + shimmer + tail, 1.25), 0.45, 17)


BANK = {
    "whoosh-short.wav": whoosh_short,
    "whoosh-transition.wav": whoosh_transition,
    "swipe-fast.wav": swipe_fast,
    "pop-ui.wav": pop_ui,
    "pop-soft.wav": pop_soft,
    "click-digital.wav": click_digital,
    "tap-button.wav": tap_button,
    "notification-pop.wav": notification_pop,
    "impact-hit.wav": impact_hit,
    "bass-hit.wav": bass_hit,
    "sub-boom.wav": sub_boom,
    "riser-short.wav": riser_short,
    "reverse-whoosh.wav": reverse_whoosh,
    "glitch-digital.wav": glitch_digital,
    "tick-micro.wav": tick_micro,
    "success-chime.wav": success_chime,
    "sparkle-shine.wav": sparkle_shine,
    "logo-sting.wav": logo_sting,
}

PEAKS = {
    "tick-micro.wav": 0.55,
    "click-digital.wav": 0.62,
    "pop-soft.wav": 0.66,
    "tap-button.wav": 0.66,
    "sparkle-shine.wav": 0.70,
    "glitch-digital.wav": 0.74,
    "sub-boom.wav": 0.95,
    "logo-sting.wav": 0.95,
}

if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    print(f"Gerando {len(BANK)} efeitos sonoros em {OUT}")
    for name, fn in BANK.items():
        save(name, fn(), PEAKS.get(name, 0.88))
    print("Concluido.")
