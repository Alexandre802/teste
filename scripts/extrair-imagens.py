"""
Recorta os assets do site a partir das capturas de referencia enviadas pela
propria Comida Caseira da Marcia Costa (marcia-costa/referencias).

Nenhuma imagem vem de outro cliente ou de banco de imagens: tudo sai das tres
telas de referencia. Rode com:

    python3 scripts/extrair-imagens.py

Para trocar uma foto por uma fotografia real da casa, basta sobrescrever o
arquivo final em public/images/ -- o script nao precisa ser executado de novo.
"""

from pathlib import Path

from PIL import Image

RAIZ = Path(__file__).resolve().parent.parent
REF = RAIZ / "referencias"
OUT = RAIZ / "public" / "images"

HOME = REF / "01-home.png"
CARDAPIO = REF / "02-cardapio.png"

# (arquivo de origem, caixa de recorte, destino, largura final, qualidade)
RECORTES = [
    (HOME, (60, 50, 206, 196), "brand/logo.png", 512, None),
    (HOME, (600, 206, 933, 866), "banners/hero.jpg", 900, 84),
    (HOME, (488, 1205, 905, 1492), "banners/delivery.jpg", 900, 84),
    # Recorte proprio da fotografia do hero (a mesma marmita), sem pegar a
    # borda laranja da peca de referencia.
    (HOME, (612, 330, 933, 700), "banners/qualidade.jpg", 800, 84),
    (CARDAPIO, (59, 357, 393, 558), "products/marmita-padrao.jpg", 800, 84),
    (CARDAPIO, (59, 574, 393, 757), "products/marmita-especial.jpg", 800, 84),
    (CARDAPIO, (59, 773, 393, 952), "products/lasanha.jpg", 800, 84),
    (CARDAPIO, (59, 967, 393, 1132), "products/beirute-com-fritas.jpg", 800, 84),
    (CARDAPIO, (59, 1147, 393, 1315), "products/marmitex-noturna.jpg", 800, 84),
    (CARDAPIO, (59, 1331, 393, 1493), "products/acai-500ml.jpg", 800, 84),
]


def main() -> None:
    faltando = [p for p in (HOME, CARDAPIO) if not p.exists()]
    if faltando:
        raise SystemExit(
            "Referencias ausentes: " + ", ".join(str(p) for p in faltando)
        )

    for origem, caixa, destino, largura, qualidade in RECORTES:
        imagem = Image.open(origem).convert("RGB").crop(caixa)
        if imagem.width < largura:
            altura = round(imagem.height * largura / imagem.width)
            imagem = imagem.resize((largura, altura), Image.LANCZOS)
        alvo = OUT / destino
        alvo.parent.mkdir(parents=True, exist_ok=True)
        if qualidade is None:
            imagem.save(alvo, optimize=True)
        else:
            imagem.save(alvo, quality=qualidade, optimize=True, progressive=True)
        print(f"{destino}: {imagem.width}x{imagem.height}")


if __name__ == "__main__":
    main()
