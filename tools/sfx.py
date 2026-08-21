"""Sintetiza a biblioteca de efeitos sonoros (sem narracao).
Tudo gerado do zero com numpy -> 48kHz, 16-bit, estereo."""
import os, wave
import numpy as np

SR = 48000
OUT = "public/sfx"
rng = np.random.default_rng(7)


def t(dur):        return np.linspace(0, dur, int(SR * dur), False)
def noise(dur):    return rng.uniform(-1, 1, int(SR * dur))


def env(n, a=0.01, d=0.2, s=0.0, r=0.2, curve=2.0):
    """Envelope ADSR simples, com curva para ataque mais seco."""
    a_n, d_n, r_n = int(a*SR), int(d*SR), int(r*SR)
    s_n = max(0, n - a_n - d_n - r_n)
    e = np.concatenate([
        np.linspace(0, 1, max(1, a_n)) ** (1/curve),
        np.linspace(1, s, max(1, d_n)) if d_n else np.array([]),
        np.full(s_n, s),
        np.linspace(s, 0, max(1, r_n)) ** curve if r_n else np.array([]),
    ])
    return np.resize(e, n)


def lp(x, cut, order=2):
    """Passa-baixa de 1a ordem aplicado N vezes (suficiente para SFX)."""
    a = np.exp(-2*np.pi*cut/SR)
    y = x.copy()
    for _ in range(order):
        out = np.empty_like(y); z = 0.0
        for i in range(len(y)):
            z = (1-a)*y[i] + a*z
            out[i] = z
        y = out
    return y


def onepole(x, cut_arr):
    """Passa-baixa com corte variando no tempo (para sweeps de whoosh)."""
    a = np.exp(-2*np.pi*np.clip(cut_arr, 20, SR/2.2)/SR)
    out = np.empty_like(x); z = 0.0
    for i in range(len(x)):
        z = (1-a[i])*x[i] + a[i]*z
        out[i] = z
    return out


def hp(x, cut):
    lo = lp(x, cut, 1)
    return x - lo


def sine(f, dur, ph=0.0):
    return np.sin(2*np.pi*np.cumsum(np.full(int(SR*dur), f))/SR + ph)


def sweep(f0, f1, dur, kind="exp"):
    n = int(SR*dur)
    f = np.geomspace(f0, f1, n) if kind == "exp" else np.linspace(f0, f1, n)
    return np.sin(2*np.pi*np.cumsum(f)/SR)


def stereo(x, pan=0.0, width=0.0):
    """pan -1..1; width>0 gera leve descorrelacao entre os canais."""
    l = x * np.sqrt((1-pan)/2) * 2**0.5
    r = x * np.sqrt((1+pan)/2) * 2**0.5
    if width:
        d = int(SR*width)
        r = np.concatenate([np.zeros(d), r])[:len(r)]
    return np.stack([l, r], 1)


def save(name, sig, peak=0.85):
    if sig.ndim == 1:
        sig = stereo(sig)
    m = np.abs(sig).max()
    if m > 0:
        sig = sig / m * peak
    # fade curtinho nas pontas evita clique de corte
    f = min(200, len(sig)//8)
    if f > 1:
        sig[:f] *= np.linspace(0, 1, f)[:, None]
        sig[-f:] *= np.linspace(1, 0, f)[:, None]
    os.makedirs(OUT, exist_ok=True)
    with wave.open(f"{OUT}/{name}.wav", "w") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(sig, -1, 1)*32767).astype("<i2").tobytes())
    print(f"  {name}.wav  {len(sig)/SR:.2f}s")


# ----------------------------------------------------------------- efeitos
def whoosh(dur=0.30, f0=300, f1=4500, f2=500, pan=0.0, body=0.0):
    n = int(SR*dur)
    x = noise(dur)
    k = np.concatenate([np.geomspace(f0, f1, n//2), np.geomspace(f1, f2, n-n//2)])
    y = onepole(x, k) * env(n, 0.05*dur, 0.35*dur, 0.35, 0.60*dur, 1.6)
    y = hp(y, 180)
    if body:
        y = y + body*sweep(90, 45, dur)*env(n, 0.02, dur*0.5, 0.2, dur*0.45)
    return stereo(y, pan, width=0.004 if pan == 0 else 0)


def make_all():
    # --- passagens de ar -------------------------------------------------
    save("whoosh_short", whoosh(0.26, 400, 5200, 700))
    save("whoosh_trans", whoosh(0.62, 180, 3800, 260, body=0.55))
    n = int(SR*0.13); x = onepole(noise(0.13), np.geomspace(900, 7000, n))
    x *= env(n, 0.012, 0.03, 0.25, 0.08, 1.2)
    pan = np.linspace(-1, 1, n)
    save("swipe", np.stack([x*np.sqrt((1-pan)/2)*1.41, x*np.sqrt((1+pan)/2)*1.41], 1))
    save("reverse_whoosh", whoosh(0.46, 5000, 300, 200)[::-1].copy())

    # --- interface -------------------------------------------------------
    n = int(SR*0.11)
    p = sweep(1500, 520, 0.11)*env(n, 0.001, 0.05, 0.05, 0.06, 2.4)
    p += 0.35*hp(noise(0.11), 2500)*env(n, 0.0008, 0.012, 0.0, 0.01, 3)
    save("pop_ui", p)

    n = int(SR*0.10)
    save("soft_pop", sweep(820, 340, 0.10)*env(n, 0.004, 0.05, 0.05, 0.05, 2.0))

    n = int(SR*0.035)
    save("click", hp(noise(0.035), 3200)*env(n, 0.0005, 0.008, 0.0, 0.026, 3.2))

    n = int(SR*0.075)
    tp = sweep(420, 180, 0.075)*env(n, 0.001, 0.03, 0.0, 0.045, 2.6)
    tp += 0.25*hp(noise(0.075), 4000)*env(n, 0.0004, 0.006, 0.0, 0.008, 3)
    save("tap", tp)

    n = int(SR*0.30)
    nt = (sine(1244, 0.30)*0.6 + sine(1661, 0.30)*0.4)*env(n, 0.004, 0.10, 0.18, 0.19, 2.2)
    nt += 0.5*(sine(1661, 0.30, 1.0))*np.concatenate(
        [np.zeros(int(SR*0.055)), env(n-int(SR*0.055), 0.004, 0.09, 0.12, 0.15, 2.2)])
    save("notif", nt)

    n = int(SR*0.022)
    save("tick", hp(noise(0.022), 6000)*env(n, 0.0003, 0.004, 0.0, 0.017, 3.4))

    # --- impactos --------------------------------------------------------
    n = int(SR*0.55)
    im = sweep(210, 48, 0.55)*env(n, 0.001, 0.18, 0.10, 0.36, 2.4)
    im += 0.55*lp(noise(0.55), 2200)*env(n, 0.001, 0.07, 0.02, 0.20, 3.0)
    save("impact", im)

    n = int(SR*0.60)
    bh = sweep(120, 38, 0.60)*env(n, 0.002, 0.22, 0.12, 0.36, 2.2)
    bh += 0.25*lp(noise(0.60), 700)*env(n, 0.002, 0.10, 0.03, 0.30, 3.0)
    save("bass_hit", bh)

    n = int(SR*0.95)
    sb = sweep(62, 26, 0.95)*env(n, 0.006, 0.35, 0.20, 0.55, 1.8)
    save("sub_boom", sb, 0.95)

    # --- transicoes ------------------------------------------------------
    n = int(SR*0.95)
    rs = onepole(noise(0.95), np.geomspace(300, 9000, n))*env(n, 0.5, 0.25, 0.9, 0.12, 0.8)
    rs = rs*np.linspace(0.05, 1, n)**1.6
    rs += 0.4*sweep(180, 1500, 0.95)*np.linspace(0, 0.9, n)**2
    save("riser", rs)

    n = int(SR*0.20)
    g = noise(0.20)
    step = int(SR*0.008)
    for i in range(0, n-step, step):          # stutter/bitcrush
        if rng.random() < 0.55:
            g[i:i+step] = g[i]
        if rng.random() < 0.25:
            g[i:i+step] = 0
    g = hp(onepole(g, np.geomspace(2000, 600, n)), 300)
    g = np.round(g*7)/7
    save("glitch", g*env(n, 0.001, 0.06, 0.5, 0.09, 1.6))

    # --- positivos -------------------------------------------------------
    n = int(SR*0.70)
    ch = np.zeros(n)
    for i, f in enumerate([1046.5, 1318.5, 1568.0, 2093.0]):
        d = int(SR*0.055*i)
        m = n - d
        tt = np.arange(m)/SR
        ch[d:] += (np.sin(2*np.pi*f*tt) + 0.3*np.sin(2*np.pi*2*f*tt))*env(m, 0.003, 0.20, 0.12, 0.40, 2.0)/(i+1.4)
    save("success", ch)

    n = int(SR*0.55)
    sp = np.zeros(n)
    for _ in range(26):
        f = rng.uniform(2600, 9500); d = int(rng.uniform(0, 0.30)*SR)
        m = n - d
        sp[d:] += np.sin(2*np.pi*f*np.arange(m)/SR)*env(m, 0.002, 0.05, 0.0, 0.14, 2.6)*rng.uniform(0.3, 1.0)
    save("sparkle", hp(sp, 2200))

    n = int(SR*1.35)
    st = np.zeros(n)
    tt = np.arange(n)/SR
    for f, a in [(110, .9), (164.8, .7), (220, .6), (329.6, .4), (440, .3)]:
        st += a*np.sin(2*np.pi*f*tt)
    st *= env(n, 0.16, 0.30, 0.30, 0.85, 1.5)
    hit = int(SR*0.16)
    st[hit:] += 1.1*np.resize(sweep(180, 42, (n-hit)/SR), n-hit)*env(n-hit, 0.001, 0.25, 0.06, 0.60, 2.2)
    st[hit:] += 0.5*np.resize(hp(noise(0.5), 3000)*env(int(SR*0.5), 0.001, 0.12, 0.0, 0.30, 2.4), n-hit)
    save("logo_sting", st)


if __name__ == "__main__":
    print("gerando efeitos sonoros...")
    make_all()
