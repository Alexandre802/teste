#!/usr/bin/env python3
"""
Generates the ad's music bed and sound-effect set as WAV files.

Everything here is synthesised from scratch with the standard library — no
samples, no third-party audio, so there is nothing to license and the output is
byte-identical on every run (all noise is drawn from a seeded PRNG).

The music is arranged against the ad's own act boundaries rather than a generic
loop: it stays sparse and tense under the "problem" act, drops on the frame the
ConsulTech mark assembles, and opens up again for the closing CTA.

Usage:  python3 tools/make-audio.py
Output: public/audio/music.wav and public/audio/sfx/*.wav
        (convert to mp3 afterwards — see tools/build-audio.sh)
"""

import math
import os
import random
import struct
import wave

SR = 44100
OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'audio')

# Act boundaries in seconds, mirroring src/ConsulTech/timing.ts
T_PROBLEM = 6.94      # the tab-chaos act starts
T_BIRTH = 22.16       # the mark assembles — the drop
T_SERVICES = 36.85
T_PRICE = 52.27
T_BENEFITS = 59.15
T_CTA = 65.06
T_END = 70.36

rng = random.Random(20240506)


# --------------------------------------------------------------------------
# helpers
# --------------------------------------------------------------------------

def buf(seconds):
    return [0.0] * int(SR * seconds)


def add(dst, src, at):
    """Mix src into dst starting at time `at` (seconds)."""
    i = int(at * SR)
    n = len(dst)
    for k, v in enumerate(src):
        j = i + k
        if 0 <= j < n:
            dst[j] += v
        elif j >= n:
            break


def lowpass(sig, fc):
    rc = 1.0 / (2 * math.pi * fc)
    a = (1.0 / SR) / (rc + 1.0 / SR)
    out = [0.0] * len(sig)
    y = 0.0
    for i, x in enumerate(sig):
        y += a * (x - y)
        out[i] = y
    return out


def highpass(sig, fc):
    rc = 1.0 / (2 * math.pi * fc)
    a = rc / (rc + 1.0 / SR)
    out = [0.0] * len(sig)
    prev_x = 0.0
    y = 0.0
    for i, x in enumerate(sig):
        y = a * (y + x - prev_x)
        prev_x = x
        out[i] = y
    return out


def noise(seconds):
    return [rng.uniform(-1, 1) for _ in range(int(SR * seconds))]


def env_exp(n, decay):
    """Exponential decay envelope."""
    return [math.exp(-decay * (i / SR)) for i in range(n)]


def env_ad(n, attack, release):
    """Attack/decay envelope, times in seconds."""
    a = max(1, int(attack * SR))
    out = []
    for i in range(n):
        if i < a:
            out.append(i / a)
        else:
            t = (i - a) / SR
            out.append(math.exp(-release * t))
    return out


def saw(freq, n, phase=0.0):
    out = []
    p = phase
    inc = freq / SR
    for _ in range(n):
        out.append(2.0 * (p - math.floor(p + 0.5)))
        p += inc
    return out


def sine(freq, n, phase=0.0):
    return [math.sin(2 * math.pi * (freq * (i / SR) + phase)) for i in range(n)]


def tri(freq, n):
    # Phase accumulator rather than asin(sin(x)) — same shape, far cheaper.
    out = []
    p = 0.0
    inc = freq / SR
    for _ in range(n):
        p -= math.floor(p)
        out.append(4.0 * abs(p - 0.5) - 1.0)
        p += inc
    return out


def note(semitones_from_a4):
    return 440.0 * (2 ** (semitones_from_a4 / 12.0))


def write_wav(path, left, right=None, peak=0.89):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    if right is None:
        right = left

    hi = max(max(abs(v) for v in left), max(abs(v) for v in right), 1e-9)
    g = peak / hi

    frames = bytearray()
    for l, r in zip(left, right):
        frames += struct.pack('<hh', int(max(-1, min(1, l * g)) * 32767),
                              int(max(-1, min(1, r * g)) * 32767))

    w = wave.open(path, 'wb')
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(bytes(frames))
    w.close()
    print(f'  {os.path.relpath(path)}  {len(left)/SR:.2f}s')


# --------------------------------------------------------------------------
# drum / instrument voices
# --------------------------------------------------------------------------

def kick(gain=1.0):
    n = int(0.34 * SR)
    out = []
    phase = 0.0
    for i in range(n):
        t = i / SR
        # pitch drops 130Hz -> 42Hz: the classic electronic kick
        f = 42 + 88 * math.exp(-26 * t)
        phase += f / SR
        body = math.sin(2 * math.pi * phase) * math.exp(-7.5 * t)
        click = math.exp(-260 * t) * rng.uniform(-1, 1) * 0.32
        out.append((body + click) * gain)
    return out


def hat(gain=1.0, open_=False):
    dur = 0.16 if open_ else 0.045
    n = int(dur * SR)
    src = highpass([rng.uniform(-1, 1) for _ in range(n)], 7200)
    e = env_exp(n, 55 if open_ else 150)
    return [src[i] * e[i] * 0.34 * gain for i in range(n)]


def clap(gain=1.0):
    n = int(0.26 * SR)
    src = highpass([rng.uniform(-1, 1) for _ in range(n)], 1400)
    src = lowpass(src, 7000)
    out = [0.0] * n
    # three quick bursts then a tail — what makes a clap sound like a clap
    for offset, amp in ((0.0, 1.0), (0.011, 0.85), (0.022, 0.7)):
        o = int(offset * SR)
        e = env_exp(n - o, 46)
        for i in range(n - o):
            out[o + i] += src[o + i] * e[i] * amp
    tail = env_exp(n, 13)
    for i in range(n):
        out[i] = (out[i] * 0.5 + src[i] * tail[i] * 0.22) * gain
    return out


def bass(freq, dur, gain=1.0):
    n = int(dur * SR)
    sig = saw(freq, n)
    sub = sine(freq / 2, n)
    mixed = [sig[i] * 0.5 + sub[i] * 0.6 for i in range(n)]
    mixed = lowpass(mixed, 260)
    e = env_ad(n, 0.006, 9)
    return [mixed[i] * e[i] * gain for i in range(n)]


def pluck(freq, dur, gain=1.0):
    n = int(dur * SR)
    # Generate each waveform once. Calling tri()/saw() inside the comprehension
    # would rebuild the whole buffer per sample — quadratic, and it never ends.
    a = tri(freq, n)
    b = saw(freq * 2, n)
    sig = [a[i] * 0.7 + b[i] * 0.18 for i in range(n)]
    sig = lowpass(sig, 2600)
    e = env_ad(n, 0.004, 15)
    return [sig[i] * e[i] * gain for i in range(n)]


def pad(freqs, dur, gain=1.0):
    n = int(dur * SR)
    acc = [0.0] * n
    for f in freqs:
        for det in (-0.16, 0.0, 0.19):
            s = saw(f * (1 + det / 100.0), n, phase=rng.random())
            for i in range(n):
                acc[i] += s[i]
    acc = lowpass(acc, 1500)
    k = 1.0 / (len(freqs) * 3)
    e = env_ad(n, 0.55, 1.1)
    return [acc[i] * k * e[i] * gain for i in range(n)]


# --------------------------------------------------------------------------
# the music bed
# --------------------------------------------------------------------------

def build_music():
    total = T_END + 0.6
    left = buf(total)
    right = buf(total)

    bpm = 124.0
    beat = 60.0 / bpm
    bar = beat * 4

    # A minor: Am - F - C - G
    prog = [
        [note(0), note(3), note(7)],       # Am  (A4 C5 E5)
        [note(-4), note(0), note(5)],      # F
        [note(-9), note(-5), note(0)],     # C
        [note(-2), note(2), note(5)],      # G
    ]
    roots = [note(-24), note(-28), note(-33), note(-26)]  # bass notes, low

    def energy(t):
        """0 = sparse intro, 1 = full arrangement."""
        if t < T_PROBLEM:
            return 0.25
        if t < T_BIRTH:
            return 0.4
        if t < T_SERVICES:
            return 1.0
        if t < T_PRICE:
            return 0.92
        if t < T_BENEFITS:
            return 1.0
        if t < T_CTA:
            return 0.85
        return 1.0

    n_bars = int(total / bar) + 1

    for b in range(n_bars):
        t0 = b * bar
        if t0 > total:
            break
        print(f'    bar {b + 1}/{n_bars}  t={t0:5.1f}s', flush=True)
        chord = prog[b % 4]
        root = roots[b % 4]
        e = energy(t0)

        # pads on every bar, quieter early
        p = pad(chord, bar * 0.98, gain=0.30 * (0.45 + 0.55 * e))
        add(left, p, t0)
        add(right, p, t0 + 0.008)   # tiny delay = width

        # bass pulse on eighths
        for i in range(8):
            t = t0 + i * beat / 2
            if t > total:
                break
            amp = 0.62 if i % 2 == 0 else 0.34
            bl = bass(root, beat * 0.46, gain=amp * (0.5 + 0.5 * e))
            add(left, bl, t)
            add(right, bl, t)

        # drums only once the ad has "dropped"
        if t0 >= T_BIRTH - bar * 0.5:
            for i in (0, 2):
                add(left, kick(0.95), t0 + i * beat)
                add(right, kick(0.95), t0 + i * beat)
            for i in (1, 3):
                c = clap(0.4 * e)
                add(left, c, t0 + i * beat)
                add(right, c, t0 + i * beat + 0.006)
            for i in range(8):
                h = hat(0.5 * e, open_=(i == 7))
                add(left, h, t0 + i * beat / 2)
                add(right, h, t0 + i * beat / 2 + 0.004)

            # 16th arpeggio riding the chord
            for i in range(16):
                t = t0 + i * beat / 4
                if t > total:
                    break
                f = chord[i % 3] * (2 if (i // 3) % 2 else 1)
                pl = pluck(f, beat * 0.30, gain=0.20 * e)
                # ping-pong the arp across the stereo field
                if i % 2:
                    add(left, [v * 0.45 for v in pl], t)
                    add(right, pl, t)
                else:
                    add(left, pl, t)
                    add(right, [v * 0.45 for v in pl], t)
        else:
            # sparse ticking during the tense intro
            for i in (1, 3):
                h = hat(0.30)
                add(left, h, t0 + i * beat)
                add(right, h, t0 + i * beat + 0.004)

    # a riser sweeping into the drop and into the CTA
    for target in (T_BIRTH, T_CTA):
        dur = 2.2
        n = int(dur * SR)
        src = highpass([rng.uniform(-1, 1) for _ in range(n)], 900)
        out = []
        phase = 0.0
        for i in range(n):
            x = i / n
            f = 300 + 2600 * (x ** 2.2)
            phase += f / SR
            swept = math.sin(2 * math.pi * phase) * 0.35
            out.append((src[i] * 0.5 + swept) * (x ** 2.4) * 0.5)
        add(left, out, target - dur)
        add(right, out, target - dur)

    # let the bed breathe under the voice, then resolve on the last chord
    for i in range(len(left)):
        t = i / SR
        fade = 1.0
        if t < 1.2:
            fade = t / 1.2
        if t > T_END - 1.6:
            fade = max(0.0, (T_END - t) / 1.6)
        left[i] *= fade
        right[i] *= fade

    write_wav(os.path.join(OUT, 'music.wav'), left, right, peak=0.72)


# --------------------------------------------------------------------------
# sound effects
# --------------------------------------------------------------------------

def sfx_whoosh(dur=0.55, bright=2600, gain=1.0):
    n = int(dur * SR)
    src = [rng.uniform(-1, 1) for _ in range(n)]
    out = [0.0] * n
    # sweep a bandpass by mixing a moving low/high pair
    lp = lowpass(src, bright)
    hp = highpass(lp, 320)
    for i in range(n):
        x = i / n
        # rise then fall
        e = math.sin(math.pi * min(1.0, x)) ** 1.6
        out[i] = hp[i] * e * gain
    return out


def sfx_boom():
    n = int(1.5 * SR)
    out = []
    phase = 0.0
    for i in range(n):
        t = i / SR
        f = 30 + 78 * math.exp(-9 * t)
        phase += f / SR
        body = math.sin(2 * math.pi * phase) * math.exp(-2.6 * t)
        crack = rng.uniform(-1, 1) * math.exp(-40 * t) * 0.30
        out.append(body * 0.95 + crack)
    return out


def sfx_pop(freq=980, dur=0.13):
    n = int(dur * SR)
    out = []
    phase = 0.0
    for i in range(n):
        t = i / SR
        f = freq * (1 + 0.9 * math.exp(-60 * t))
        phase += f / SR
        out.append(math.sin(2 * math.pi * phase) * math.exp(-26 * t) * 0.7)
    return out


def sfx_tick():
    n = int(0.05 * SR)
    src = highpass([rng.uniform(-1, 1) for _ in range(n)], 4200)
    e = env_exp(n, 150)
    return [src[i] * e[i] * 0.75 for i in range(n)]


def sfx_chime():
    n = int(2.4 * SR)
    partials = [(1.0, 1.0), (2.0, 0.5), (3.01, 0.28), (4.16, 0.14), (5.43, 0.08)]
    base = note(12)  # A5
    out = [0.0] * n
    for mult, amp in partials:
        s = sine(base * mult, n)
        d = 2.0 + mult * 1.4
        for i in range(n):
            out[i] += s[i] * amp * math.exp(-d * (i / SR))
    return [v * 0.5 for v in out]


def sfx_swipe():
    n = int(0.32 * SR)
    out = []
    phase = 0.0
    for i in range(n):
        x = i / n
        t = i / SR
        f = 1800 - 1300 * x
        phase += f / SR
        out.append(math.sin(2 * math.pi * phase) * math.exp(-11 * t) * 0.5)
    src = highpass([rng.uniform(-1, 1) for _ in range(n)], 2200)
    e = env_ad(n, 0.01, 14)
    return [out[i] * 0.6 + src[i] * e[i] * 0.4 for i in range(n)]


def sfx_stamp():
    n = int(0.42 * SR)
    thud = []
    phase = 0.0
    for i in range(n):
        t = i / SR
        f = 70 + 150 * math.exp(-45 * t)
        phase += f / SR
        thud.append(math.sin(2 * math.pi * phase) * math.exp(-16 * t))
    crack = highpass([rng.uniform(-1, 1) for _ in range(n)], 2600)
    e = env_exp(n, 70)
    return [thud[i] * 0.8 + crack[i] * e[i] * 0.5 for i in range(n)]


def sfx_glitch():
    n = int(0.4 * SR)
    out = [0.0] * n
    step = int(0.02 * SR)
    for s in range(0, n, step):
        f = rng.choice([220, 440, 880, 1500, 3000])
        seg = sine(f, min(step, n - s))
        on = rng.random() > 0.35
        for i, v in enumerate(seg):
            out[s + i] = v * (0.5 if on else 0.0)
    src = highpass([rng.uniform(-1, 1) for _ in range(n)], 1800)
    e = env_exp(n, 9)
    return [out[i] * 0.5 + src[i] * e[i] * 0.35 for i in range(n)]


def sfx_riser(dur=1.6):
    n = int(dur * SR)
    src = highpass([rng.uniform(-1, 1) for _ in range(n)], 700)
    out = []
    phase = 0.0
    for i in range(n):
        x = i / n
        f = 260 + 2400 * (x ** 2.4)
        phase += f / SR
        out.append((src[i] * 0.45 + math.sin(2 * math.pi * phase) * 0.4) * (x ** 2.0))
    return out


def sfx_text_whoosh():
    """Entrada de texto — short and airy, must not compete with the voice."""
    n = int(0.24 * SR)
    src = highpass([rng.uniform(-1, 1) for _ in range(n)], 1900)
    src = lowpass(src, 8000)
    out = []
    for i in range(n):
        x = i / n
        out.append(src[i] * (math.sin(math.pi * x) ** 2.0) * 0.5)
    return out


def sfx_hit_soft():
    """Texto com impacto — a punch in the mids, not the full sub boom."""
    n = int(0.5 * SR)
    out = []
    phase = 0.0
    for i in range(n):
        t = i / SR
        f = 72 + 150 * math.exp(-22 * t)
        phase += f / SR
        body = math.sin(2 * math.pi * phase) * math.exp(-9 * t)
        knock = rng.uniform(-1, 1) * math.exp(-90 * t) * 0.22
        out.append(body * 0.8 + knock)
    return lowpass(out, 3200)


def sfx_beep(freq=2100, dur=0.07):
    """Número subindo — one digital blip; several get sequenced per counter."""
    n = int(dur * SR)
    sig = sine(freq, n)
    sq = [1.0 if v > 0 else -1.0 for v in sig]
    mixed = [sig[i] * 0.75 + sq[i] * 0.12 for i in range(n)]
    e = env_ad(n, 0.002, 55)
    return [mixed[i] * e[i] * 0.45 for i in range(n)]


def sfx_digital_sweep():
    """Linha/gráfico sendo desenhado — a sweep with quantised, 'digital' steps."""
    n = int(0.62 * SR)
    out = [0.0] * n
    phase = 0.0
    steps = 18
    for i in range(n):
        x = i / n
        # quantising the frequency is what makes it read as digital
        q = math.floor(x * steps) / steps
        f = 500 + 2400 * q
        phase += f / SR
        out[i] = math.sin(2 * math.pi * phase) * 0.34
    air = highpass([rng.uniform(-1, 1) for _ in range(n)], 3000)
    for i in range(n):
        x = i / n
        env = math.sin(math.pi * x) ** 1.3
        out[i] = (out[i] + air[i] * 0.3) * env
    return out


def sfx_low_whoosh():
    """Elemento 3D entrando — dark and heavy, moves a lot of air."""
    n = int(0.85 * SR)
    src = lowpass([rng.uniform(-1, 1) for _ in range(n)], 900)
    sub = []
    phase = 0.0
    for i in range(n):
        x = i / n
        f = 38 + 55 * math.sin(math.pi * x)
        phase += f / SR
        sub.append(math.sin(2 * math.pi * phase))
    out = []
    for i in range(n):
        x = i / n
        env = math.sin(math.pi * x) ** 1.5
        out.append((src[i] * 0.6 + sub[i] * 0.55) * env)
    return out


def sfx_whoosh_stereo():
    """Transição de cena — travels hard left to right across the field."""
    n = int(0.6 * SR)
    src = highpass([rng.uniform(-1, 1) for _ in range(n)], 500)
    src = lowpass(src, 6500)
    left, right = [], []
    for i in range(n):
        x = i / n
        env = math.sin(math.pi * x) ** 1.4
        # equal-power pan sweeping across the stereo field
        theta = x * (math.pi / 2)
        v = src[i] * env
        left.append(v * math.cos(theta))
        right.append(v * math.sin(theta))
    return left, right


def sfx_shimmer():
    """Light sweep — bright, slow-attack sparkle riding a light pass."""
    n = int(1.3 * SR)
    out = [0.0] * n
    base = note(24)  # A6
    for mult, amp in ((1.0, 1.0), (1.5, 0.5), (2.02, 0.36), (3.03, 0.2), (4.1, 0.12)):
        s = sine(base * mult, n)
        for i in range(n):
            x = i / n
            env = (math.sin(math.pi * x) ** 2.2) * math.exp(-1.1 * (i / SR))
            out[i] += s[i] * amp * env
    air = highpass([rng.uniform(-1, 1) for _ in range(n)], 6000)
    for i in range(n):
        x = i / n
        out[i] = out[i] * 0.32 + air[i] * (math.sin(math.pi * x) ** 3) * 0.18
    return out


def sfx_ui_click():
    """Pequenos elementos — dry, tight, almost no tail."""
    n = int(0.032 * SR)
    src = highpass([rng.uniform(-1, 1) for _ in range(n)], 2600)
    src = lowpass(src, 9000)
    e = env_exp(n, 240)
    return [src[i] * e[i] * 0.8 for i in range(n)]


def sfx_impact_sub():
    """Cena de destaque — impact with a very restrained sub underneath."""
    n = int(2.0 * SR)
    out = []
    phase = 0.0
    sub_phase = 0.0
    for i in range(n):
        t = i / SR
        f = 46 + 120 * math.exp(-14 * t)
        phase += f / SR
        body = math.sin(2 * math.pi * phase) * math.exp(-4.0 * t)
        # the sub sits an octave below and decays slowly — felt, not heard
        sub_phase += 33.0 / SR
        sub = math.sin(2 * math.pi * sub_phase) * math.exp(-1.9 * t) * 0.42
        crack = rng.uniform(-1, 1) * math.exp(-55 * t) * 0.24
        out.append(body * 0.75 + sub + crack)
    return out


def sfx_rise_clean():
    """CTA — a clean tonal rise, no noise wash."""
    n = int(1.9 * SR)
    out = [0.0] * n
    for mult, amp in ((1.0, 1.0), (2.0, 0.4), (3.0, 0.18)):
        phase = 0.0
        for i in range(n):
            x = i / n
            f = (180 + 720 * (x ** 2.0)) * mult
            phase += f / SR
            out[i] += math.sin(2 * math.pi * phase) * amp * (x ** 1.8)
    return [v * 0.34 for v in out]


def sfx_impact_clean():
    """CTA — the landing. Tuned low note, tight click, no grit."""
    n = int(1.4 * SR)
    root = note(-24)  # A2
    out = [0.0] * n
    for mult, amp in ((1.0, 1.0), (2.0, 0.34), (3.0, 0.14)):
        s = sine(root * mult, n)
        for i in range(n):
            out[i] += s[i] * amp * math.exp(-3.4 * (i / SR))
    click = lowpass([rng.uniform(-1, 1) for _ in range(n)], 4000)
    e = env_exp(n, 120)
    return [out[i] * 0.55 + click[i] * e[i] * 0.3 for i in range(n)]


def build_sfx():
    d = os.path.join(OUT, 'sfx')
    # Reset so the effect set is identical whether or not the music ran first.
    rng.seed(913377)

    # Base set
    write_wav(os.path.join(d, 'whoosh.wav'), sfx_whoosh(0.55, 2800))
    write_wav(os.path.join(d, 'whoosh-soft.wav'), sfx_whoosh(0.40, 1500, 0.7))
    write_wav(os.path.join(d, 'boom.wav'), sfx_boom())
    write_wav(os.path.join(d, 'pop.wav'), sfx_pop(980))
    write_wav(os.path.join(d, 'pop-high.wav'), sfx_pop(1450, 0.11))
    write_wav(os.path.join(d, 'tick.wav'), sfx_tick())
    write_wav(os.path.join(d, 'chime.wav'), sfx_chime())
    write_wav(os.path.join(d, 'swipe.wav'), sfx_swipe())
    write_wav(os.path.join(d, 'stamp.wav'), sfx_stamp())
    write_wav(os.path.join(d, 'glitch.wav'), sfx_glitch())
    write_wav(os.path.join(d, 'riser.wav'), sfx_riser())

    # Set matching the event/SFX brief
    write_wav(os.path.join(d, 'text-whoosh.wav'), sfx_text_whoosh())
    write_wav(os.path.join(d, 'hit-soft.wav'), sfx_hit_soft())
    write_wav(os.path.join(d, 'beep.wav'), sfx_beep())
    write_wav(os.path.join(d, 'beep-low.wav'), sfx_beep(1500, 0.08))
    write_wav(os.path.join(d, 'digital-sweep.wav'), sfx_digital_sweep())
    write_wav(os.path.join(d, 'low-whoosh.wav'), sfx_low_whoosh())
    l, r = sfx_whoosh_stereo()
    write_wav(os.path.join(d, 'whoosh-stereo.wav'), l, r)
    write_wav(os.path.join(d, 'shimmer.wav'), sfx_shimmer())
    write_wav(os.path.join(d, 'ui-click.wav'), sfx_ui_click())
    write_wav(os.path.join(d, 'impact-sub.wav'), sfx_impact_sub())
    write_wav(os.path.join(d, 'rise-clean.wav'), sfx_rise_clean())
    write_wav(os.path.join(d, 'impact-clean.wav'), sfx_impact_clean())


if __name__ == '__main__':
    import sys

    what = sys.argv[1] if len(sys.argv) > 1 else 'all'

    if what in ('all', 'sfx'):
        print('sound effects:', flush=True)
        build_sfx()
    if what in ('all', 'music'):
        print('music bed:', flush=True)
        build_music()
    print('done', flush=True)
