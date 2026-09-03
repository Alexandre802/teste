#!/usr/bin/env python3
"""
Gera a biblioteca de efeitos sonoros do reel da Monttra.

Sintetiza tudo proceduralmente (sem dependencias externas) e escreve
WAVs mono 44.1 kHz / 16-bit em ../public/sfx.

Uso:  python3 tools/generate_sfx.py
"""

import math
import os
import random
import struct
import wave

SR = 44100
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "public", "sfx")

# ---------------------------------------------------------------- utilidades


def n_samples(seconds):
    return int(SR * seconds)


def silence(seconds):
    return [0.0] * n_samples(seconds)


def lerp(a, b, t):
    return a + (b - a) * t


def clamp(v, lo, hi):
    return lo if v < lo else hi if v > hi else v


def noise(seconds, rng):
    return [rng.uniform(-1.0, 1.0) for _ in range(n_samples(seconds))]


def svf_bandpass(buf, freq_at, q=1.4):
    """Filtro de variavel de estado (Chamberlin) com cutoff modulavel.

    freq_at(t) recebe a posicao normalizada 0..1 e devolve o centro em Hz.
    """
    low = band = 0.0
    n = len(buf)
    damp = clamp(1.0 / q, 0.05, 1.9)
    out = []
    for i, x in enumerate(buf):
        fc = clamp(freq_at(i / max(1, n - 1)), 20.0, SR * 0.24)
        f = clamp(2.0 * math.sin(math.pi * fc / SR), 0.0, 0.99)
        high = x - low - damp * band
        band += f * high
        low += f * band
        out.append(band)
    return out


def svf_lowpass(buf, freq_at, q=0.9):
    low = band = 0.0
    n = len(buf)
    damp = clamp(1.0 / q, 0.05, 1.9)
    out = []
    for i, x in enumerate(buf):
        fc = clamp(freq_at(i / max(1, n - 1)), 20.0, SR * 0.24)
        f = clamp(2.0 * math.sin(math.pi * fc / SR), 0.0, 0.99)
        high = x - low - damp * band
        band += f * high
        low += f * band
        out.append(low)
    return out


def osc(seconds, freq_at, shape="sine", phase=0.0):
    """Oscilador com envelope de frequencia (freq_at recebe 0..1)."""
    n = n_samples(seconds)
    out = []
    ph = phase
    for i in range(n):
        f = freq_at(i / max(1, n - 1))
        ph += 2.0 * math.pi * f / SR
        if shape == "sine":
            v = math.sin(ph)
        elif shape == "tri":
            v = 2.0 / math.pi * math.asin(math.sin(ph))
        elif shape == "saw":
            v = 2.0 * ((ph / (2 * math.pi)) % 1.0) - 1.0
        elif shape == "square":
            v = 1.0 if math.sin(ph) >= 0 else -1.0
        else:
            raise ValueError(shape)
        out.append(v)
    return out


def env_exp(buf, decay, attack=0.004):
    """Envelope percussivo: ataque curto linear + decaimento exponencial."""
    n = len(buf)
    a = max(1, n_samples(attack))
    out = []
    for i, x in enumerate(buf):
        t = i / SR
        e = (i / a) if i < a else math.exp(-t / max(1e-5, decay))
        out.append(x * e)
    return out


def env_shape(buf, points):
    """Envelope por pontos [(pos 0..1, ganho)], interpolado linearmente."""
    n = len(buf)
    out = []
    for i, x in enumerate(buf):
        t = i / max(1, n - 1)
        g = points[-1][1]
        for j in range(len(points) - 1):
            t0, g0 = points[j]
            t1, g1 = points[j + 1]
            if t0 <= t <= t1:
                k = 0.0 if t1 == t0 else (t - t0) / (t1 - t0)
                g = lerp(g0, g1, k)
                break
        out.append(x * g)
    return out


def mix(*buffers):
    n = max(len(b) for b in buffers)
    out = [0.0] * n
    for b in buffers:
        for i, v in enumerate(b):
            out[i] += v
    return out


def gain(buf, g):
    return [v * g for v in buf]


def pad_to(buf, seconds):
    n = n_samples(seconds)
    return (buf + [0.0] * n)[:n]


def delay(buf, seconds):
    return [0.0] * n_samples(seconds) + buf


def soft_clip(buf, drive=1.0):
    return [math.tanh(v * drive) for v in buf]


def reverse(buf):
    return buf[::-1]


def normalize(buf, peak=0.8):
    m = max(abs(v) for v in buf) or 1.0
    return [v * (peak / m) for v in buf]


def declick(buf, ms=3.0):
    """Fade in/out curtinho para nao estourar nas bordas."""
    k = max(1, n_samples(ms / 1000.0))
    n = len(buf)
    out = list(buf)
    for i in range(min(k, n)):
        out[i] *= i / k
        out[n - 1 - i] *= i / k
    return out


def write(name, buf, peak=0.8):
    buf = declick(normalize(buf, peak))
    path = os.path.join(OUT, name)
    with wave.open(path, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(
            b"".join(struct.pack("<h", int(clamp(v, -1.0, 1.0) * 32767)) for v in buf)
        )
    print(f"  {len(buf)/SR:5.2f}s  {os.path.getsize(path)/1024:6.1f} KB  {name}")


# ------------------------------------------------------------------- receitas


def whoosh_short(rng):
    """Passagem curta de ar — entradas rapidas de texto."""
    d = 0.34
    src = noise(d, rng)
    body = svf_bandpass(src, lambda t: 500 + 3200 * math.sin(math.pi * t) ** 1.3, q=2.2)
    body = env_shape(body, [(0, 0.0), (0.25, 1.0), (0.6, 0.75), (1, 0.0)])
    air = svf_bandpass(noise(d, rng), lambda t: 5000 + 3000 * t, q=1.1)
    air = env_shape(air, [(0, 0.0), (0.4, 0.35), (1, 0.0)])
    return mix(body, gain(air, 0.5))


def whoosh_transition(rng):
    """Whoosh encorpado das trocas de tela preto/branco/verde."""
    d = 0.72
    src = noise(d, rng)
    body = svf_bandpass(src, lambda t: 260 + 2600 * math.sin(math.pi * t) ** 1.6, q=1.6)
    body = env_shape(body, [(0, 0.0), (0.3, 1.0), (0.62, 0.9), (1, 0.0)])
    rumble = osc(d, lambda t: lerp(140, 55, t), "sine")
    rumble = env_shape(rumble, [(0, 0.0), (0.35, 0.9), (1, 0.0)])
    air = svf_bandpass(noise(d, rng), lambda t: 4200 + 4500 * t, q=1.0)
    air = env_shape(air, [(0, 0.0), (0.5, 0.4), (1, 0.0)])
    return mix(body, gain(rumble, 0.55), gain(air, 0.35))


def swipe_fast(rng):
    """Passagem extremamente rapida atravessando a tela."""
    d = 0.16
    src = noise(d, rng)
    body = svf_bandpass(src, lambda t: 900 + 7000 * t, q=3.0)
    body = env_shape(body, [(0, 0.0), (0.12, 1.0), (1, 0.0)])
    return body


def pop_ui(rng):
    """Pop seco de card/palavra entrando."""
    d = 0.13
    tone = osc(d, lambda t: lerp(920, 340, t ** 0.45), "sine")
    tone = env_exp(tone, decay=0.028, attack=0.001)
    tick = env_exp(noise(0.012, rng), decay=0.004, attack=0.0002)
    tick = svf_bandpass(tick, lambda t: 3600, q=1.2)
    return mix(tone, gain(pad_to(tick, d), 0.5))


def pop_soft(rng):
    """Versao suave para elementos menores."""
    d = 0.18
    tone = osc(d, lambda t: lerp(560, 250, t ** 0.5), "sine")
    tone = env_exp(tone, decay=0.05, attack=0.006)
    sub = osc(d, lambda t: 180, "sine")
    sub = env_exp(sub, decay=0.045, attack=0.008)
    return mix(tone, gain(sub, 0.3))


def click_digital(rng):
    """Clique seco de UI."""
    d = 0.045
    src = noise(d, rng)
    body = svf_bandpass(src, lambda t: 2600 + 1800 * (1 - t), q=1.8)
    body = env_exp(body, decay=0.008, attack=0.0003)
    tone = env_exp(osc(d, lambda t: 1800, "square"), decay=0.005, attack=0.0002)
    return mix(body, gain(tone, 0.25))


def tap_button(rng):
    """Toque em botao de aplicativo — com corpo."""
    d = 0.1
    body = svf_lowpass(noise(d, rng), lambda t: 1400, q=0.8)
    body = env_exp(body, decay=0.012, attack=0.0005)
    thump = env_exp(osc(d, lambda t: lerp(320, 150, t), "sine"), decay=0.03, attack=0.002)
    return mix(gain(body, 0.7), gain(thump, 0.8))


def notification_pop(rng):
    """Notificacao curta de app — dois blips."""
    d = 0.42
    a = env_exp(osc(0.2, lambda t: 880, "sine"), decay=0.06, attack=0.004)
    b = env_exp(osc(0.3, lambda t: 1318.5, "sine"), decay=0.09, attack=0.004)
    a2 = env_exp(osc(0.2, lambda t: 1760, "sine"), decay=0.04, attack=0.004)
    return pad_to(mix(pad_to(a, d), pad_to(delay(b, 0.1), d), pad_to(gain(a2, 0.25), d)), d)


def impact_hit(rng):
    """Batida para frases importantes."""
    d = 0.55
    crack = svf_bandpass(noise(d, rng), lambda t: lerp(2200, 400, t), q=1.1)
    crack = env_exp(crack, decay=0.05, attack=0.0005)
    thump = env_exp(osc(d, lambda t: lerp(180, 62, t ** 0.4), "sine"), decay=0.13, attack=0.001)
    return soft_clip(mix(gain(crack, 0.6), gain(thump, 1.0)), 1.4)


def bass_hit(rng):
    """Impacto grave nas mudancas de cena."""
    d = 0.8
    sub = env_exp(osc(d, lambda t: lerp(88, 38, t ** 0.35), "sine"), decay=0.2, attack=0.002)
    harm = env_exp(osc(d, lambda t: lerp(176, 76, t ** 0.35), "tri"), decay=0.09, attack=0.002)
    air = env_exp(svf_lowpass(noise(d, rng), lambda t: 900, q=0.7), decay=0.03, attack=0.001)
    return soft_clip(mix(sub, gain(harm, 0.35), gain(air, 0.25)), 1.6)


def sub_boom(rng):
    """Grave longo dos momentos de maior destaque."""
    d = 1.05
    sub = env_exp(osc(d, lambda t: lerp(62, 27, t ** 0.3), "sine"), decay=0.3, attack=0.004)
    body = env_exp(osc(d, lambda t: lerp(124, 54, t ** 0.3), "sine"), decay=0.12, attack=0.004)
    return soft_clip(mix(sub, gain(body, 0.28)), 1.3)


def riser_short(rng):
    """Som crescente preparando a transicao."""
    d = 0.85
    n = svf_bandpass(noise(d, rng), lambda t: 300 + 6500 * t ** 2.1, q=2.4)
    n = env_shape(n, [(0, 0.0), (0.85, 1.0), (0.97, 0.9), (1, 0.0)])
    swp = osc(d, lambda t: lerp(180, 1500, t ** 1.8), "saw")
    swp = svf_lowpass(swp, lambda t: 700 + 6000 * t ** 1.6, q=1.2)
    swp = env_shape(swp, [(0, 0.0), (0.9, 0.85), (1, 0.0)])
    return mix(n, gain(swp, 0.5))


def reverse_whoosh(rng):
    """Succao/reverso imediatamente antes de um elemento entrar."""
    d = 0.5
    src = noise(d, rng)
    body = svf_bandpass(src, lambda t: 400 + 4200 * t ** 1.7, q=2.0)
    body = env_shape(body, [(0, 0.0), (0.55, 0.35), (0.93, 1.0), (1, 0.0)])
    air = svf_bandpass(noise(d, rng), lambda t: 3000 + 6000 * t, q=1.2)
    air = env_shape(air, [(0, 0.0), (0.9, 0.5), (1, 0.0)])
    return mix(body, gain(air, 0.45))


def glitch_digital(rng):
    """Glitch digital das mudancas rapidas — sample & hold + bitcrush."""
    d = 0.26
    n = n_samples(d)
    src = [rng.uniform(-1, 1) for _ in range(n)]
    out = []
    hold = 0.0
    counter = 0
    step = 40
    for i in range(n):
        if counter <= 0:
            hold = src[i]
            step = rng.choice([12, 20, 34, 58, 90])
            counter = step
        counter -= 1
        # bitcrush em 5 bits
        out.append(round(hold * 16) / 16)
    out = svf_bandpass(out, lambda t: 800 + 2600 * (0.5 + 0.5 * math.sin(t * 22)), q=2.0)
    out = env_shape(out, [(0, 0.0), (0.05, 1.0), (0.55, 0.7), (0.75, 0.95), (1, 0.0)])
    return out


def tick_micro(rng):
    """Microefeito sincronizado com detalhes graficos."""
    d = 0.028
    body = svf_bandpass(noise(d, rng), lambda t: 5200, q=2.6)
    return env_exp(body, decay=0.004, attack=0.0002)


def bell(freq, dur, decay, detune=1.0):
    """Parcial de sino: fundamental + parciais inarmonicos."""
    partials = [(1.0, 1.0), (2.02, 0.42), (3.01, 0.22), (4.13, 0.12), (5.4, 0.07)]
    layers = []
    for ratio, amp in partials:
        t = osc(dur, lambda _t, r=ratio: freq * r * detune, "sine")
        layers.append(gain(env_exp(t, decay=decay / (1 + ratio * 0.45), attack=0.003), amp))
    return mix(*layers)


def chime_success(rng):
    """Confirmacao positiva — associado ao check."""
    d = 0.95
    c = bell(1046.5, d, 0.45)
    e = delay(bell(1318.5, d, 0.5), 0.07)
    g = delay(bell(1568.0, d, 0.62), 0.14)
    return pad_to(mix(pad_to(c, d), pad_to(e, d), pad_to(g, d)), d)


def sparkle_shine(rng):
    """Brilho agudo em cascata para elementos de destaque."""
    d = 0.7
    grains = []
    for i in range(16):
        start = (i / 16) ** 1.25 * 0.42
        f = rng.uniform(2600, 9200) * (1 + i * 0.05)
        g = env_exp(osc(0.26, lambda t, f=f: f, "sine"), decay=rng.uniform(0.03, 0.08), attack=0.002)
        grains.append(pad_to(delay(gain(g, rng.uniform(0.35, 1.0)), start), d))
    return mix(*grains)


def logo_sting(rng):
    """Fechamento de marca: sub + riser + acorde resolvendo."""
    d = 1.6
    boom = pad_to(sub_boom(rng), d)
    swell = svf_bandpass(noise(0.55, rng), lambda t: 400 + 3800 * t ** 1.6, q=1.8)
    swell = env_shape(swell, [(0, 0.0), (0.9, 1.0), (1, 0.0)])
    swell = pad_to(swell, d)
    chord = mix(
        bell(783.99, 1.0, 0.6),          # G5
        gain(bell(1174.66, 1.0, 0.7), 0.7),  # D6
        gain(bell(1567.98, 1.0, 0.8), 0.45),  # G6
    )
    chord = pad_to(delay(chord, 0.5), d)
    return soft_clip(mix(gain(boom, 0.9), gain(swell, 0.45), gain(chord, 0.8)), 1.2)


# ---------------------------------------------------------------------- build

RECIPES = [
    ("whoosh-short.wav", whoosh_short, 0.55),
    ("whoosh-transition.wav", whoosh_transition, 0.7),
    ("swipe-fast.wav", swipe_fast, 0.5),
    ("pop-ui.wav", pop_ui, 0.55),
    ("pop-soft.wav", pop_soft, 0.45),
    ("click-digital.wav", click_digital, 0.42),
    ("tap-button.wav", tap_button, 0.5),
    ("notification-pop.wav", notification_pop, 0.5),
    ("impact-hit.wav", impact_hit, 0.85),
    ("bass-hit.wav", bass_hit, 0.9),
    ("sub-boom.wav", sub_boom, 0.9),
    ("riser-short.wav", riser_short, 0.6),
    ("reverse-whoosh.wav", reverse_whoosh, 0.55),
    ("glitch-digital.wav", glitch_digital, 0.5),
    ("tick-micro.wav", tick_micro, 0.35),
    ("chime-success.wav", chime_success, 0.6),
    ("sparkle-shine.wav", sparkle_shine, 0.45),
    ("logo-sting.wav", logo_sting, 0.95),
]


def main():
    os.makedirs(OUT, exist_ok=True)
    print(f"Gerando {len(RECIPES)} efeitos sonoros em {os.path.normpath(OUT)}\n")
    for i, (name, fn, peak) in enumerate(RECIPES):
        rng = random.Random(1000 + i)  # deterministico
        write(name, fn(rng), peak=peak)
    print("\nOK")


if __name__ == "__main__":
    main()
