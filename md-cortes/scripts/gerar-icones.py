#!/usr/bin/env python3
"""
Gera os ícones da PWA a partir de scripts/icone.html.

Por que existe: o Chromium headless não entrega captura confiável abaixo de uns
600px — ele força um tamanho mínimo de janela e reescala o resultado, o que
cortava o desenho nos tamanhos pequenos. Então renderiza-se uma vez em 1024 e a
redução é feita aqui, por média de blocos, sem depender de nenhuma biblioteca
de imagem instalada.

Uso:  python3 scripts/gerar-icones.py
"""

import os
import struct
import subprocess
import sys
import tempfile
import zlib

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHROME = os.environ.get(
    "CHROME_BIN", "/opt/pw-browsers/chromium-1194/chrome-linux/chrome"
)
FONTE = 1024


# ── PNG: ler ──────────────────────────────────────────────────────────────
def ler_png(caminho):
    dados = open(caminho, "rb").read()
    assert dados[:8] == b"\x89PNG\r\n\x1a\n", "não é PNG"
    pos, idat, cabecalho = 8, bytearray(), None
    while pos < len(dados):
        (tamanho,) = struct.unpack(">I", dados[pos : pos + 4])
        tipo = dados[pos + 4 : pos + 8]
        corpo = dados[pos + 8 : pos + 8 + tamanho]
        if tipo == b"IHDR":
            cabecalho = struct.unpack(">IIBBBBB", corpo)
        elif tipo == b"IDAT":
            idat += corpo
        elif tipo == b"IEND":
            break
        pos += 12 + tamanho

    largura, altura, profundidade, tipo_cor, _, _, entrelacado = cabecalho
    assert profundidade == 8 and not entrelacado, "esperado PNG 8 bits sem entrelace"
    canais = {0: 1, 2: 3, 4: 2, 6: 4}[tipo_cor]
    bruto = zlib.decompress(bytes(idat))

    # Desfaz os filtros linha a linha (PNG spec, seção 9).
    passo = largura * canais
    saida = bytearray(altura * passo)
    anterior = bytearray(passo)
    origem = 0
    for y in range(altura):
        filtro = bruto[origem]
        origem += 1
        linha = bytearray(bruto[origem : origem + passo])
        origem += passo
        if filtro == 1:
            for i in range(canais, passo):
                linha[i] = (linha[i] + linha[i - canais]) & 0xFF
        elif filtro == 2:
            for i in range(passo):
                linha[i] = (linha[i] + anterior[i]) & 0xFF
        elif filtro == 3:
            for i in range(passo):
                esq = linha[i - canais] if i >= canais else 0
                linha[i] = (linha[i] + ((esq + anterior[i]) >> 1)) & 0xFF
        elif filtro == 4:
            for i in range(passo):
                a = linha[i - canais] if i >= canais else 0
                b = anterior[i]
                c = anterior[i - canais] if i >= canais else 0
                p = a + b - c
                pa, pb, pc = abs(p - a), abs(p - b), abs(p - c)
                pr = a if (pa <= pb and pa <= pc) else (b if pb <= pc else c)
                linha[i] = (linha[i] + pr) & 0xFF
        saida[y * passo : (y + 1) * passo] = linha
        anterior = linha
    return largura, altura, canais, saida


# ── PNG: escrever ─────────────────────────────────────────────────────────
def escrever_png(caminho, largura, altura, canais, pixels):
    tipo_cor = {1: 0, 2: 4, 3: 2, 4: 6}[canais]
    passo = largura * canais
    bruto = bytearray()
    for y in range(altura):
        bruto.append(0)  # filtro None: o ganho de comprimir melhor não paga aqui
        bruto += pixels[y * passo : (y + 1) * passo]

    def bloco(tipo, corpo):
        return (
            struct.pack(">I", len(corpo))
            + tipo
            + corpo
            + struct.pack(">I", zlib.crc32(tipo + corpo) & 0xFFFFFFFF)
        )

    with open(caminho, "wb") as arq:
        arq.write(b"\x89PNG\r\n\x1a\n")
        arq.write(bloco(b"IHDR", struct.pack(">IIBBBBB", largura, altura, 8, tipo_cor, 0, 0, 0)))
        arq.write(bloco(b"IDAT", zlib.compress(bytes(bruto), 9)))
        arq.write(bloco(b"IEND", b""))


def reduzir(largura, altura, canais, pixels, destino):
    """Média de blocos. Para uma redução inteira (1024→512, 1024→256…) é o
    mesmo que uma reamostragem de área, e não deixa serrilhado no dourado."""
    fx, fy = largura / destino, altura / destino
    saida = bytearray(destino * destino * canais)
    for y in range(destino):
        y0, y1 = int(y * fy), max(int((y + 1) * fy), int(y * fy) + 1)
        for x in range(destino):
            x0, x1 = int(x * fx), max(int((x + 1) * fx), int(x * fx) + 1)
            n = (y1 - y0) * (x1 - x0)
            for c in range(canais):
                total = 0
                for yy in range(y0, y1):
                    base = yy * largura * canais + c
                    for xx in range(x0, x1):
                        total += pixels[base + xx * canais]
                saida[(y * destino + x) * canais + c] = total // n
    return saida


def renderizar(consulta, saida):
    subprocess.run(
        [
            CHROME, "--headless", "--disable-gpu", "--no-sandbox", "--hide-scrollbars",
            "--default-background-color=00000000",
            f"--screenshot={saida}", f"--window-size={FONTE},{FONTE}",
            f"file://{RAIZ}/scripts/icone.html?lado={FONTE}&{consulta}",
        ],
        check=True, capture_output=True,
    )


def main():
    if not os.path.exists(CHROME):
        sys.exit(f"Chromium não encontrado em {CHROME}. Defina CHROME_BIN.")
    destino_dir = os.path.join(RAIZ, "public", "icones")
    os.makedirs(destino_dir, exist_ok=True)

    # (consulta de render, [(arquivo, tamanho), …])
    trabalhos = [
        ("escala=1", [("icone-512.png", 512), ("icone-192.png", 192), ("apple-touch-icon.png", 180)]),
        ("escala=0.70", [("mascara-512.png", 512)]),
        ("escala=2.6&badge=1", [("badge-72.png", 72)]),
    ]

    with tempfile.TemporaryDirectory() as tmp:
        for consulta, alvos in trabalhos:
            grande = os.path.join(tmp, "grande.png")
            renderizar(consulta, grande)
            largura, altura, canais, pixels = ler_png(grande)
            for nome, lado in alvos:
                menor = reduzir(largura, altura, canais, pixels, lado)
                escrever_png(os.path.join(destino_dir, nome), lado, lado, canais, menor)
                print(f"  {nome}  {lado}×{lado}")


if __name__ == "__main__":
    main()
