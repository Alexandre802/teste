"""Gera a biblioteca de efeitos sonoros do vídeo (síntese procedural, 44.1 kHz).

Uso:  python3 tools/make_sfx.py
Saída: public/sfx/*.wav
"""
import os
import wave
import numpy as np

SR = 44100
OUT = os.path.join(os.path.dirname(__file__), "..", "public", "sfx")
rng = np.random.default_rng(7)


# ---------------------------------------------------------------- helpers ---
def n_samples(dur):
    return int(SR * dur)


def t(dur):
    return np.arange(n_samples(dur)) / SR


def noise(dur):
    return rng.uniform(-1, 1, n_samples(dur))


def lerp(a, b, n, curve=1.0):
    x = np.linspace(0, 1, n) ** curve
    return a + (b - a) * x


def onepole_lp(x, cutoff):
    """Lowpass de 1 polo com cutoff variante no tempo (array ou escalar)."""
    cutoff = np.broadcast_to(np.asarray(cutoff, dtype=float), x.shape)
    a = np.clip(1.0 - np.exp(-2.0 * np.pi * cutoff / SR), 0.0, 1.0)
    y = np.empty_like(x)
    acc = 0.0
    for i in range(x.size):
        acc += a[i] * (x[i] - acc)
        y[i] = acc
    return y


def onepole_hp(x, cutoff):
    return x - onepole_lp(x, cutoff)


def bandpass(x, lo, hi):
    return onepole_hp(onepole_lp(x, hi), lo)


def env_ad(dur, attack, decay_curve=3.0):
    """Envelope attack/decay exponencial."""
    n = n_samples(dur)
    a = max(1, int(SR * attack))
    e = np.ones(n)
    e[:a] = np.linspace(0, 1, a) ** 0.6
    e[a:] = np.linspace(1, 0, n - a) ** decay_curve
    return e


def swell(dur, peak=0.55, curve=2.2):
    """Envelope que cresce e cai (whoosh)."""
    n = n_samples(dur)
    p = int(n * peak)
    e = np.empty(n)
    e[:p] = np.linspace(0, 1, p) ** curve
    e[p:] = np.linspace(1, 0, n - p) ** (curve * 0.8)
    return e


def sine_sweep(dur, f0, f1, curve=1.0):
    n = n_samples(dur)
    f = lerp(f0, f1, n, curve)
    return np.sin(2 * np.pi * np.cumsum(f) / SR)


def declick(x, ms=4):
    n = max(2, int(SR * ms / 1000))
    if x.size < 2 * n:
        return x
    x = x.copy()
    x[:n] *= np.linspace(0, 1, n)
    x[-n:] *= np.linspace(1, 0, n)
    return x


def soft_clip(x, amount=1.4):
    return np.tanh(x * amount) / np.tanh(amount)


def stereo(left, right=None, width=0.0):
    if right is None:
        right = left
    if width:
        d = max(1, int(SR * width / 1000))
        right = np.concatenate([np.zeros(d), right])[: left.size]
    return np.stack([left, right], axis=1)


def save(name, data, gain=0.9):
    data = np.atleast_2d(data.T).T if data.ndim == 1 else data
    if data.ndim == 1:
        data = stereo(data)
    peak = np.max(np.abs(data)) or 1.0
    data = declick_stereo(data / peak * gain)
    pcm = (np.clip(data, -1, 1) * 32767).astype(np.int16)
    path = os.path.join(OUT, name + ".wav")
    with wave.open(path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    print(f"  {name}.wav  {data.shape[0]/SR:.2f}s")


def declick_stereo(d):
    return np.stack([declick(d[:, 0]), declick(d[:, 1])], axis=1)


# ------------------------------------------------------------------ sounds ---
def whoosh_short():
    d = 0.34
    x = noise(d)
    n = x.size
    x = bandpass(x, lerp(200, 900, n), lerp(1800, 7000, n, 0.7))
    x *= swell(d, 0.6, 2.0)
    return stereo(x, x * 0.85, width=6)


def whoosh_transition():
    d = 0.85
    x = noise(d)
    n = x.size
    x = bandpass(x, lerp(90, 420, n, 1.6), lerp(900, 9000, n, 0.55))
    x *= swell(d, 0.62, 2.4)
    sub = sine_sweep(d, 130, 55, 1.4) * swell(d, 0.5, 2.0) * 0.55
    mix = soft_clip(x * 0.9 + sub)
    return stereo(mix, np.concatenate([np.zeros(300), mix])[: mix.size] * 0.9)


def swipe_fast():
    d = 0.16
    x = noise(d)
    n = x.size
    x = bandpass(x, lerp(700, 2600, n), lerp(6000, 12000, n))
    x *= swell(d, 0.4, 1.4)
    pan = np.linspace(0, 1, n)
    return stereo(x * (1 - pan), x * pan)


def pop_ui():
    d = 0.10
    body = sine_sweep(d, 1500, 520, 2.2) * env_ad(d, 0.001, 5.0)
    click = bandpass(noise(d), 1800, 9000) * env_ad(d, 0.0005, 22.0) * 0.35
    return stereo(soft_clip(body * 0.9 + click, 1.1))


def soft_pop():
    d = 0.09
    body = sine_sweep(d, 820, 380, 2.4) * env_ad(d, 0.003, 5.5)
    return stereo(body * 0.75)


def bubble_pop():
    d = 0.12
    body = sine_sweep(d, 420, 1500, 0.6) * env_ad(d, 0.004, 4.0)
    return stereo(body * 0.8)


def digital_click():
    d = 0.05
    x = bandpass(noise(d), 1500, 7000) * env_ad(d, 0.0004, 26.0)
    tone = np.sin(2 * np.pi * 2400 * t(d)) * env_ad(d, 0.0004, 30.0) * 0.5
    return stereo(soft_clip(x + tone, 1.2))


def tap():
    d = 0.09
    thump = sine_sweep(d, 260, 120, 2.0) * env_ad(d, 0.001, 8.0)
    click = bandpass(noise(d), 900, 5000) * env_ad(d, 0.0004, 24.0) * 0.4
    return stereo(soft_clip(thump * 0.9 + click, 1.1))


def notification_pop():
    d = 0.45
    a = np.sin(2 * np.pi * 880 * t(d)) * env_ad(d, 0.004, 4.5)
    b = np.roll(np.sin(2 * np.pi * 1318.5 * t(d)) * env_ad(d, 0.004, 4.0), int(SR * 0.075))
    b[: int(SR * 0.075)] = 0
    c = np.roll(np.sin(2 * np.pi * 1760 * t(d)) * env_ad(d, 0.004, 5.0) * 0.35, int(SR * 0.15))
    c[: int(SR * 0.15)] = 0
    return stereo(a * 0.7 + b * 0.6 + c, width=5)


def impact():
    d = 0.6
    body = sine_sweep(d, 190, 62, 2.6) * env_ad(d, 0.001, 3.2)
    crack = bandpass(noise(d), 300, 6000) * env_ad(d, 0.001, 14.0) * 0.55
    tail = onepole_lp(noise(d), 700) * env_ad(d, 0.01, 5.0) * 0.25
    return stereo(soft_clip(body + crack + tail, 1.5), width=8)


def bass_hit():
    d = 0.8
    body = sine_sweep(d, 95, 42, 2.8) * env_ad(d, 0.002, 3.0)
    harm = sine_sweep(d, 190, 84, 2.8) * env_ad(d, 0.002, 5.0) * 0.25
    return stereo(soft_clip(body + harm, 1.6))


def sub_boom():
    d = 1.15
    body = sine_sweep(d, 70, 28, 3.2) * env_ad(d, 0.004, 2.4)
    return stereo(soft_clip(body, 1.3))


def riser():
    d = 1.3
    x = noise(d)
    n = x.size
    x = bandpass(x, lerp(400, 5200, n, 1.8), lerp(3000, 14000, n, 1.2))
    x *= np.linspace(0, 1, n) ** 2.2
    tone = sine_sweep(d, 320, 2400, 2.4) * (np.linspace(0, 1, n) ** 2.6) * 0.35
    trem = 1 + 0.25 * np.sin(2 * np.pi * lerp(6, 26, n) * t(d))
    return stereo(soft_clip((x * 0.8 + tone) * trem, 1.2), width=7)


def reverse_whoosh():
    d = 0.55
    x = noise(d)
    n = x.size
    x = bandpass(x, lerp(300, 1500, n), lerp(2500, 11000, n, 1.4))
    x *= np.linspace(0, 1, n) ** 2.8
    x[-int(SR * 0.02):] *= np.linspace(1, 0, int(SR * 0.02))
    return stereo(x, width=5)


def glitch():
    d = 0.28
    x = bandpass(noise(d), 600, 9000)
    n = x.size
    # gate estocástico + downsample (bitcrush)
    gate = np.zeros(n)
    i = 0
    while i < n:
        seg = rng.integers(int(SR * 0.004), int(SR * 0.03))
        gate[i:i + seg] = rng.choice([0.0, 1.0], p=[0.45, 0.55])
        i += seg
    step = 28
    x = np.repeat(x[::step], step)[:n]
    blip = np.sign(np.sin(2 * np.pi * rng.choice([740, 1200, 1900]) * t(d))) * 0.25
    out = (x * 0.8 + blip) * gate * env_ad(d, 0.001, 1.6)
    return stereo(soft_clip(out, 1.4), np.roll(out, 120) * 0.8)


def tick():
    d = 0.03
    x = bandpass(noise(d), 2500, 11000) * env_ad(d, 0.0003, 30.0)
    return stereo(x * 0.6)


def success_chime():
    d = 0.75
    notes = [1046.5, 1318.5, 1568.0]           # C6 E6 G6
    out = np.zeros(n_samples(d))
    for k, f in enumerate(notes):
        e = env_ad(d, 0.003, 3.4)
        v = (np.sin(2 * np.pi * f * t(d)) + 0.3 * np.sin(2 * np.pi * f * 2 * t(d))) * e
        off = int(SR * 0.055 * k)
        v = np.roll(v, off)
        v[:off] = 0
        out += v * (0.9 - 0.15 * k)
    return stereo(soft_clip(out * 0.5, 1.1), width=9)


def sparkle():
    d = 0.6
    out = np.zeros(n_samples(d))
    for _ in range(14):
        f = rng.uniform(2600, 7200)
        off = int(rng.uniform(0, 0.35) * SR)
        g = np.sin(2 * np.pi * f * t(d)) * env_ad(d, 0.002, 9.0) * rng.uniform(0.25, 0.7)
        g = np.roll(g, off)
        g[:off] = 0
        out += g
    return stereo(out * 0.45, np.roll(out, 200) * 0.4)


def logo_sting():
    d = 1.6
    n = n_samples(d)
    rev = np.zeros(n)
    r = reverse_whoosh()[:, 0]
    rev[: r.size] = r * 0.8
    boom = np.zeros(n)
    b = sub_boom()[:, 0]
    off = int(SR * 0.5)
    boom[off:off + b.size] = b[: n - off] * 0.95
    chord = np.zeros(n)
    for f, g in [(523.25, 0.5), (783.99, 0.38), (1046.5, 0.3)]:
        e = env_ad(d - 0.5, 0.006, 2.6)
        v = np.sin(2 * np.pi * f * t(d - 0.5)) * e * g
        chord[off:off + v.size] += v
    shimmer = np.zeros(n)
    s = sparkle()[:, 0]
    shimmer[off:off + s.size] = s[: n - off] * 0.5
    return stereo(soft_clip(rev + boom + chord * 0.6 + shimmer, 1.3), width=10)


SOUNDS = {
    "whoosh_short": whoosh_short,
    "whoosh_transition": whoosh_transition,
    "swipe_fast": swipe_fast,
    "pop_ui": pop_ui,
    "soft_pop": soft_pop,
    "bubble_pop": bubble_pop,
    "digital_click": digital_click,
    "tap": tap,
    "notification_pop": notification_pop,
    "impact": impact,
    "bass_hit": bass_hit,
    "sub_boom": sub_boom,
    "riser": riser,
    "reverse_whoosh": reverse_whoosh,
    "glitch": glitch,
    "tick": tick,
    "success_chime": success_chime,
    "sparkle": sparkle,
    "logo_sting": logo_sting,
}

if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    print("gerando efeitos sonoros:")
    for name, fn in SOUNDS.items():
        save(name, fn())
    print(f"{len(SOUNDS)} efeitos em public/sfx/")
