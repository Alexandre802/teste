#!/usr/bin/env python3
"""
Alinha o TEXTO da narração ao áudio e gera src/config/narrationText.ts.

Por que existe: sem transcrição, o vídeo só consegue casar com o RITMO da fala
(ver analyze_audio.py). Com o texto, passa a casar com o CONTEÚDO — dá para
saber em que segundo cada palavra é falada e, portanto, em que segundo cada
tela deve entrar.

Como funciona (alinhamento forçado leve, sem modelo de ASR):
  1. lê as frases detectadas no áudio (PHRASES em speechMap.ts)
  2. distribui as palavras do texto entre essas frases, proporcionalmente ao
     número de sílabas de cada palavra
  3. dentro de cada frase, encaixa cada palavra no onset de palavra (BEAT)
     mais próximo do seu tempo estimado

Uso:
    # 1. salve a narração em texto puro, uma frase por linha (ou corrido)
    #    em narration.txt
    # 2. rode:
    python3 tools/align_text.py narration.txt

No fim, o script SUGERE os valores de SCENE_STARTS procurando as palavras-chave
de cada tela (pior, consultar, segundos, pague...) no texto alinhado.
"""

import os
import re
import sys
import unicodedata

TS_PATH = "src/config/narrationText.ts"
SPEECH_MAP = "src/config/speechMap.ts"

# palavras-chave que identificam cada tela, na ordem do roteiro
SCENE_KEYWORDS = {
    "oportunidades": ["oportunidade", "oportunidades", "perdeu", "perdendo"],
    "eoPior": ["pior"],
    "precisaConsultar": ["precisa", "consultar", "lugar"],
    "cemMais": ["cem", "100", "tipos", "segundos"],
    "pagueSo": ["pague", "pagar", "mensalidade", "usar"],
}


def strip_accents(s: str) -> str:
    return "".join(c for c in unicodedata.normalize("NFD", s) if unicodedata.category(c) != "Mn")


def syllables(word: str) -> int:
    w = strip_accents(word.lower())
    w = re.sub(r"[^a-z]", "", w)
    if not w:
        return 1
    groups = re.findall(r"[aeiou]+", w)
    return max(1, len(groups))


def read_list(name: str, text: str):
    """Lê um array numérico simples (BEATS) do speechMap.ts."""
    m = re.search(rf"export const {name}: number\[\] = \[(.*?)\];", text, re.S)
    if not m:
        return []
    return [float(x) for x in re.findall(r"-?\d+\.?\d*", m.group(1))]


def read_phrases(text: str):
    m = re.search(r"export const PHRASES: Phrase\[\] = \[(.*?)\];", text, re.S)
    if not m:
        return []
    out = []
    for a, b in re.findall(r"\{\s*start:\s*(-?\d+\.?\d*),\s*end:\s*(-?\d+\.?\d*)\s*\}", m.group(1)):
        out.append((float(a), float(b)))
    return out


def main() -> None:
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    txt_path = sys.argv[1]
    if not os.path.exists(txt_path):
        print(f"não encontrei {txt_path}")
        sys.exit(1)

    with open(SPEECH_MAP) as f:
        sm = f.read()
    phrases = read_phrases(sm)
    beats = read_list("BEATS", sm)
    if not phrases:
        print("speechMap.ts sem PHRASES — rode antes: python3 tools/analyze_audio.py")
        sys.exit(1)

    with open(txt_path) as f:
        raw = f.read()

    words = [w for w in re.findall(r"[^\s]+", raw) if re.search(r"[A-Za-zÀ-ÿ0-9]", w)]
    if not words:
        print("texto vazio")
        sys.exit(1)

    weights = [syllables(w) for w in words]
    total_w = sum(weights)
    # peso de fala de cada frase = sua duração
    durations = [b - a for a, b in phrases]
    total_d = sum(durations)

    # 1) reparte as palavras entre as frases, proporcional à duração falada
    per_phrase: list[list[int]] = [[] for _ in phrases]
    acc_w = 0.0
    pi = 0
    cum_d = durations[0]
    for i, w in enumerate(words):
        # fração de fala já consumida por este ponto do texto
        frac = (acc_w + weights[i] / 2) / total_w
        target_d = frac * total_d
        while pi < len(phrases) - 1 and target_d > cum_d:
            pi += 1
            cum_d += durations[pi]
        per_phrase[pi].append(i)
        acc_w += weights[i]

    # 2) dentro de cada frase, distribui por sílaba e encaixa no beat mais próximo
    starts = [0.0] * len(words)
    for p_idx, (a, b) in enumerate(phrases):
        idxs = per_phrase[p_idx]
        if not idxs:
            continue
        wsum = sum(weights[i] for i in idxs) or 1
        span = max(0.001, b - a)
        acc = 0.0
        inner = [x for x in beats if a - 0.06 <= x <= b + 0.06]
        for i in idxs:
            t = a + (acc / wsum) * span
            acc += weights[i]
            if inner:
                t = min(inner, key=lambda x: abs(x - t))
            starts[i] = round(t, 2)

    # monotonicidade
    for i in range(1, len(words)):
        if starts[i] < starts[i - 1]:
            starts[i] = starts[i - 1]

    ts = f'''/**
 * ARQUIVO GERADO — não edite à mão.
 * Regere com: python3 tools/align_text.py narration.txt
 *
 * Transcrição da narração alinhada ao áudio ({len(words)} palavras).
 * O tempo de cada palavra vem de um alinhamento forçado leve: as palavras são
 * distribuídas pelas frases detectadas no áudio por peso silábico e encaixadas
 * no onset de palavra mais próximo (ver tools/align_text.py).
 *
 * Com isso as cenas podem entrar exatamente quando o assunto é falado.
 */

export type SpokenWord = {{ text: string; start: number }};

export const WORDS: SpokenWord[] = [
{chr(10).join(f'  {{ text: {w!r}, start: {starts[i]} }},'.replace("'", '"') for i, w in enumerate(words))}
];

/** instante (s) em que uma palavra é falada; -1 se não estiver na narração */
export const wordTime = (needle: string): number => {{
  const n = needle.toLowerCase();
  const hit = WORDS.find((w) =>
    w.text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\\u0300-\\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "")
      .includes(n.normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").replace(/[^a-z0-9]/g, "")),
  );
  return hit ? hit.start : -1;
}};
'''
    with open(TS_PATH, "w") as f:
        f.write(ts)

    print(f"{len(words)} palavras alinhadas em {len(phrases)} frases -> {TS_PATH}")
    print(f"  taxa: {len(words) / (phrases[-1][1] - phrases[0][0]) * 60:.0f} palavras/min")
    print()
    print("Primeiras palavras por frase:")
    for p_idx, (a, b) in enumerate(phrases):
        idxs = per_phrase[p_idx]
        if not idxs:
            continue
        frag = " ".join(words[i] for i in idxs)
        print(f"  {a:6.2f}s  {frag[:74]}")

    print()
    print("SUGESTÃO de SCENE_STARTS (primeira ocorrência das palavras-chave):")
    norm = [strip_accents(w.lower()).strip(".,!?:;()") for w in words]
    for scene, keys in SCENE_KEYWORDS.items():
        hit = None
        for k in keys:
            kk = strip_accents(k.lower())
            for i, w in enumerate(norm):
                if w == kk or w.startswith(kk):
                    hit = (starts[i], words[i])
                    break
            if hit:
                break
        if hit:
            print(f"  {scene:<18} {hit[0]:6.2f}s   (palavra \"{hit[1]}\")")
        else:
            print(f"  {scene:<18}   —      (nenhuma palavra-chave encontrada)")
    print()
    print("Confira os valores e ajuste SCENE_STARTS em src/config/timeline.ts.")


if __name__ == "__main__":
    main()
