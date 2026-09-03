#!/usr/bin/env python3
"""
Alinha as cenas do reel a narracao.

A fala e segmentada por envelope de energia; cada frase da copy recebe a
fatia de tempo proporcional a sua contagem de silabas (a taxa de fala e
praticamente constante, entao isso mapeia frase em relogio com precisao) e
as fronteiras sao encaixadas nas pausas reais do audio.

Imprime as duracoes prontas para colar em src/config/timeline.ts.
"""
import os
import re
import subprocess
import sys
import wave

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
MP3 = os.path.join(HERE, "..", "..", "referencias", "audio",
                   "AUDIO-2026-08-13-17-03-11.mp3")
WAV = "/tmp/monttra-narr.wav"

# frase falada em cada cena, na ordem da narracao
FRASES = [
    ("s01Hook", "Método não dá resultado. Mas sabe por quê?"),
    ("s02Nao", "Não é necessariamente por causa do método."),
    ("s03Caos", "É porque, quando seus ganhos e gastos ficam espalhados em anotações, planilhas e contas diferentes,"),
    ("s04Dinheiro", "você até pode estar fazendo dinheiro"),
    ("s05Enxergar", "mas não consegue enxergar quanto realmente está ganhando."),
    ("s06Quanto", "Você sabe exatamente quanto entrou, quanto saiu"),
    ("s11TudoUm", "e quanto realmente sobrou pra você esse mês?"),
    ("s07Prever", "E mais importante: você consegue prever quanto vai fechar na próxima semana?"),
    ("s08Nasceu", "Foi pensando nisso que nasceu a Monttra."),
    ("s09Phone", "Uma plataforma criada para quem trabalha com métodos, apostas esportivas e surebets e quer transformar suas operações em números claros."),
    ("s10Periodo", "Você acompanha tudo que entrou e saiu por dia, semana, mês, 90 dias ou ano."),
    ("s12Operacao", "Registra suas surebets em uma calculadora inteligente, acompanha lucro, percentual sobre o investimento e detalhes de cada operação."),
    ("s13Previsao", "E ainda define metas para saber exatamente onde quer chegar."),
    ("s15Clareza", "Porque não basta ganhar dinheiro. Você precisa saber quanto ganhou, quanto gastou e ter clareza para planejar os próximos passos."),
    ("s14Cta", "Quer parar de trabalhar no escuro e começar a ter controle dos seus números? Teste a Monttra gratuitamente por 3 dias."),
]


def decode():
    if not os.path.exists(WAV):
        subprocess.run(
            ["npx", "remotion", "ffmpeg", "-v", "error", "-i", MP3,
             "-ac", "1", "-ar", "16000", "-acodec", "pcm_s16le", "-y", WAV],
            cwd=os.path.join(HERE, ".."), check=True,
        )
    return WAV


def segments(a, sr):
    """Trechos de fala, separados pelas pausas."""
    win = int(sr * 0.01)
    rms = np.array([
        np.sqrt((a[i * win:(i + 1) * win] ** 2).mean()) for i in range(len(a) // win)
    ])
    db = 20 * np.log10(rms + 1e-9)
    on = db > (np.percentile(db, 92) - 30)

    # fecha buracos curtos (respiracao dentro da palavra)
    i = 0
    while i < len(on):
        j = i
        while j < len(on) and on[j] == on[i]:
            j += 1
        if j - i < 8 and i > 0:
            on[i:j] = on[i - 1]
        i = j

    out, i = [], 0
    while i < len(on):
        if on[i]:
            j = i
            while j < len(on) and on[j]:
                j += 1
            out.append((i * 0.01, j * 0.01))
            i = j
        else:
            i += 1
    return [s for s in out if s[1] - s[0] > 0.08]


def syllables(text):
    text = re.sub(r"[^a-záàâãéêíóôõúüç ]", "", text.lower())
    return max(1, len(re.findall(r"[aeiouáàâãéêíóôõúü]+", text)))


def main():
    w = wave.open(decode())
    sr, n = w.getframerate(), w.getnframes()
    a = np.frombuffer(w.readframes(n), dtype="<i2").astype(np.float32) / 32768
    dur = n / sr

    segs = segments(a, sr)
    speech = sum(e - s for s, e in segs)
    gaps = [(segs[i][1] + segs[i + 1][0]) / 2 for i in range(len(segs) - 1)]

    def clock(t):
        """Tempo de fala acumulado -> relogio."""
        acc = 0.0
        for s, e in segs:
            if acc + (e - s) >= t:
                return s + (t - acc)
            acc += e - s
        return segs[-1][1]

    sil = [syllables(t) for _, t in FRASES]
    total = sum(sil)

    bounds, acc = [0.0], 0
    for s in sil[:-1]:
        acc += s
        t = clock(speech * acc / total)
        bounds.append(round(min(gaps, key=lambda g: abs(g - t)), 2))
    bounds.append(round(dur, 2))

    print(f"narracao {dur:.2f}s — {len(segs)} trechos de fala\n")
    print("export const SCENE_SECONDS = {")
    for i, (name, txt) in enumerate(FRASES):
        d = bounds[i + 1] - bounds[i]
        print(f'  {name}: {d:.2f}, // {bounds[i]:5.2f}s  "{txt[:52]}"')
    print("} as const;")


if __name__ == "__main__":
    sys.exit(main())
