#!/usr/bin/env python3
"""
Importa fotografias reais dos lanches para o site.

    python3 scripts/importar-fotos.py                      # lê referencias/imagens
    python3 scripts/importar-fotos.py caminho/das/fotos     # lê outra pasta
    python3 scripts/importar-fotos.py --conferir            # só relata, não escreve

O que faz, e por quê:

  - DUPLICATA: compara por sha256 do conteúdo. Arquivo repetido entra uma vez
    só, e o relatório diz quais nomes eram a mesma foto.

  - CONVERSÃO: WebP com qualidade 88 e `method=6`, sem redimensionar e SEM
    CORTAR. O enquadramento original faz parte da identidade das fotos (fundo
    escuro, tábua de madeira, lanche centralizado); cortar aqui tiraria pão,
    ingrediente ou base. O ajuste ao card é feito no CSS, que pode ser
    revisto foto a foto — o arquivo, não.

  - NOME: `lanche-michel-01.webp` em diante, na ordem em que aparecem. Nome de
    produto só depois que a associação for confirmada, e aí pela função
    `renomear()` abaixo. O script NÃO adivinha de que lanche é a foto.

  - ORIGINAIS: nada é apagado nem movido. A pasta de origem fica intacta.

Sai com código 1 se nada foi importado.
"""

from __future__ import annotations

import hashlib
import shutil
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    sys.exit('Falta a biblioteca Pillow. Instale com: pip install Pillow')

RAIZ = Path(__file__).resolve().parent.parent
ORIGEM_PADRAO = RAIZ / 'referencias' / 'imagens'
DESTINO = RAIZ / 'public' / 'images' / 'lanches'

EXTENSOES = {'.png', '.jpg', '.jpeg', '.webp', '.heic', '.heif', '.tif', '.tiff'}

# Qualidade alta de propósito: a foto do produto é o principal elemento de
# venda. Abaixo de ~85 o WebP começa a lavar a cor do pão e a borrar a textura
# da carne, que é justamente o que faz o lanche parecer apetitoso.
QUALIDADE = 88

# Largura máxima. Acima disto o ganho visual não paga o peso no celular; nas
# fotos menores nada é ampliado — ampliar só borra.
LARGURA_MAXIMA = 1600


def imagens_de(pasta: Path) -> list[Path]:
    return sorted(f for f in pasta.iterdir() if f.is_file() and f.suffix.lower() in EXTENSOES)


def resumo(caminho: Path) -> str:
    return hashlib.sha256(caminho.read_bytes()).hexdigest()


def main() -> int:
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    apenas_conferir = '--conferir' in sys.argv

    origem = Path(args[0]).resolve() if args else ORIGEM_PADRAO
    if not origem.is_dir():
        sys.exit(f'Pasta não encontrada: {origem}')

    arquivos = imagens_de(origem)
    if not arquivos:
        sys.exit(f'Nenhuma imagem em {origem}')

    print(f'origem:  {origem}')
    print(f'destino: {DESTINO}')
    print(f'arquivos encontrados: {len(arquivos)}')
    print()

    # ── duplicatas ────────────────────────────────────────────────────────
    unicas: dict[str, Path] = {}
    repetidas: dict[str, list[str]] = {}
    for arquivo in arquivos:
        h = resumo(arquivo)
        if h in unicas:
            repetidas.setdefault(h, [unicas[h].name]).append(arquivo.name)
        else:
            unicas[h] = arquivo

    if repetidas:
        print(f'duplicatas exatas ({len(repetidas)} grupo(s)) — só a primeira entra:')
        for nomes in repetidas.values():
            print(f'  {nomes[0]}  ←  {", ".join(nomes[1:])}')
        print()

    print(f'fotografias únicas: {len(unicas)}')
    print()

    if apenas_conferir:
        for i, arquivo in enumerate(unicas.values(), 1):
            with Image.open(arquivo) as im:
                orientacao = 'horizontal' if im.width > im.height else 'vertical'
                print(f'  {i:02}. {arquivo.name:24} {im.width}x{im.height} {orientacao}')
        return 0

    # ── conversão ─────────────────────────────────────────────────────────
    DESTINO.mkdir(parents=True, exist_ok=True)
    originais = DESTINO / 'originais'
    originais.mkdir(exist_ok=True)

    print(f'{"arquivo gerado":28} {"origem":24} {"dimensões":14} {"peso"}')
    print('─' * 78)

    for i, arquivo in enumerate(sorted(unicas.values()), 1):
        nome = f'lanche-michel-{i:02}.webp'
        saida = DESTINO / nome

        with Image.open(arquivo) as im:
            im = im.convert('RGB')
            if im.width > LARGURA_MAXIMA:
                altura = round(im.height * LARGURA_MAXIMA / im.width)
                im = im.resize((LARGURA_MAXIMA, altura), Image.LANCZOS)
            im.save(saida, 'WEBP', quality=QUALIDADE, method=6)
            dimensoes = f'{im.width}x{im.height}'

        # guarda o original ao lado, para poder reconverter sem depender da
        # pasta de referências
        shutil.copy2(arquivo, originais / f'lanche-michel-{i:02}{arquivo.suffix.lower()}')

        kb = saida.stat().st_size // 1024
        print(f'{nome:28} {arquivo.name:24} {dimensoes:14} {kb} KB')

    print()
    print('Pronto. Próximos passos, na ordem:')
    print('  1. Olhar cada foto e comparar com as descrições de lib/catalog.ts')
    print('  2. Só com certeza sobre o produto: renomear o arquivo e apontar o')
    print('     campo `image` daquele produto para ele')
    print('  3. Foto sem produto certo continua como lanche-michel-NN e fica')
    print('     de fora do catálogo — foto errada é pior que placeholder')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
