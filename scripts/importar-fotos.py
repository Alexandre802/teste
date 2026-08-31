#!/usr/bin/env python3
"""
Importa fotografias reais dos lanches para o site.

    python3 scripts/importar-fotos.py                      # lê referencias/imagens
    python3 scripts/importar-fotos.py caminho/das/fotos     # lê outra pasta
    python3 scripts/importar-fotos.py --conferir            # só relata, não escreve

O que faz, e por quê:

  - DUPLICATA: duas passadas. Primeiro sha256, que pega arquivo idêntico byte
    a byte. Depois um hash perceptual (dHash), que pega a MESMA foto salva de
    novo com outra compressão — o sha256 não vê essas, e elas chegaram assim.

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

# Distância máxima, em bits de 256, para duas fotos serem consideradas a
# mesma. As duplicatas reais ficaram em 3 e 5 bits; a foto diferente mais
# parecida ficou em 47. Qualquer corte entre 12 e 40 daria o mesmo resultado —
# 12 é conservador de propósito, para não descartar foto legítima.
LIMITE_PARECIDAS = 12


# ─────────────────────────────────────────────────────────────────────────
# Associação foto → produto.
#
# Preenchida à mão depois de olhar cada fotografia e comparar os ingredientes
# visíveis com as descrições de lib/catalog.ts. O script NÃO adivinha.
#
# O que separou as famílias parecidas: o CATÁLOGO distingue "Pão de
# hambúrguer" (redondo) de "Pão quadrado". Todas estas fotos têm pão redondo,
# então nenhuma pode ser da família "X Frangão", que é de pão quadrado.
#
# Foto sem certeza NÃO entra aqui. Ela é importada com nome neutro e fica de
# fora do catálogo — mostrar o lanche errado é pior que mostrar o marcador
# da marca.
# ─────────────────────────────────────────────────────────────────────────
ASSOCIACOES: dict[str, str] = {
    # pão, hambúrguer, ovo, queijo, batata palha, tomate, alface
    '026278c5-2e10-440c-b174-641b9deb581a': 'x-egg',
    # pão, frango, ovo, bacon, alface
    '1700e5ae-2cb0-497f-a482-01191c1e038b': 'x-frango-egg-bacon',
    # pão, frango, ovo, batata palha, alface — sem bacon
    '1b5155f4-004b-4c78-88c1-8dd2c04388ba': 'x-frango-egg',
    # pão, frango, batata palha, alface — sem ovo e sem bacon
    '711d124c-3c88-45e0-8b46-4a0743d99602': 'x-frango',
    # pão, frango, bacon, batata palha, alface — sem ovo
    '8c6ea501-2518-4040-b665-3bbf2bfd5d6c': 'x-frango-bacon',
    # pão, 2 salsichas em rodelas, queijo, batata palha, tomate, alface
    'c48022db-f251-4acf-812e-cded2c445003': 'hot-dog',
    # pão, hambúrguer, batata palha — sem queijo, sem salada
    'c855e1ee-d686-4648-867c-3325fb91c904': 'hamburguer',
    # pão, hambúrguer, QUEIJO, batata palha — o queijo é o que separa do
    # Hambúrguer simples acima
    'cdc3362f-4168-4861-9b17-fc72c5e11320': 'x-burguer',
}



def imagens_de(pasta: Path) -> list[Path]:
    return sorted(f for f in pasta.iterdir() if f.is_file() and f.suffix.lower() in EXTENSOES)


def resumo(caminho: Path) -> str:
    return hashlib.sha256(caminho.read_bytes()).hexdigest()


def impressao(caminho: Path, lado: int = 16) -> list[bool]:
    """
    dHash: compara cada pixel com o vizinho da direita, numa miniatura cinza.

    Guarda a ESTRUTURA da imagem, não os bytes. Por isso reconhece a mesma
    foto salva outra vez com compressão diferente — que é o caso das cópias
    que chegaram.
    """
    with Image.open(caminho) as im:
        p = im.convert('L').resize((lado + 1, lado), Image.LANCZOS)
        # `get_flattened_data` é a API nova; `getdata` some no Pillow 14
    ler = getattr(p, 'get_flattened_data', None) or p.getdata
    pixels = list(ler())
    bits: list[bool] = []
    for y in range(lado):
        linha = pixels[y * (lado + 1) : (y + 1) * (lado + 1)]
        bits.extend(linha[x] > linha[x + 1] for x in range(lado))
    return bits


def distancia(a: list[bool], b: list[bool]) -> int:
    return sum(x != y for x, y in zip(a, b))


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

    # ── segunda passada: mesma foto, compressão diferente ─────────────────
    restantes: list[Path] = []
    impressoes: list[tuple[list[bool], Path]] = []
    parecidas: list[tuple[str, str, int]] = []

    for arquivo in sorted(unicas.values()):
        digital = impressao(arquivo)
        gemea = next(
            ((d, a) for d, a in ((distancia(digital, i), a) for i, a in impressoes)
             if d <= LIMITE_PARECIDAS),
            None,
        )
        if gemea:
            parecidas.append((gemea[1].name, arquivo.name, gemea[0]))
        else:
            impressoes.append((digital, arquivo))
            restantes.append(arquivo)

    if parecidas:
        print(f'mesma foto com outra compressão ({len(parecidas)}) — só a primeira entra:')
        for mantida, descartada, d in parecidas:
            print(f'  {mantida}  ←  {descartada}   ({d} bits de diferença)')
        print()

    print(f'fotografias únicas: {len(restantes)}')
    print()

    if apenas_conferir:
        for i, arquivo in enumerate(restantes, 1):
            with Image.open(arquivo) as im:
                orientacao = 'horizontal' if im.width > im.height else 'vertical'
                print(f'  {i:02}. {arquivo.name:24} {im.width}x{im.height} {orientacao}')
        return 0

    # ── conversão ─────────────────────────────────────────────────────────
    DESTINO.mkdir(parents=True, exist_ok=True)
    # Os originais ficam FORA de public/: tudo que está lá é servido ao
    # visitante e entra no deploy. São arquivo de trabalho, não conteúdo.
    originais = RAIZ / 'referencias' / 'originais-lanches'
    originais.mkdir(parents=True, exist_ok=True)

    print(f'{"arquivo gerado":28} {"origem":24} {"dimensões":14} {"peso"}')
    print('─' * 78)

    sem_associacao = 0
    for i, arquivo in enumerate(restantes, 1):
        produto = ASSOCIACOES.get(arquivo.stem)
        if produto:
            nome = f'{produto}.webp'
        else:
            # nome neutro: o arquivo existe, mas nenhum produto aponta para ele
            sem_associacao += 1
            nome = f'lanche-michel-{sem_associacao:02}.webp'
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
        shutil.copy2(arquivo, originais / f'{saida.stem}{arquivo.suffix.lower()}')

        kb = saida.stat().st_size // 1024
        curto = arquivo.stem[:8]
        print(f'{nome:28} {curto:24} {dimensoes:14} {kb} KB')

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
