# Três Estrelas — plano de produção do vídeo

Documento gerado a partir da análise do que está em `referencias/`.
Formato-alvo: **banner wide 3:1** (mesma proporção das 7 artes e do vídeo de referência).

---

## 1. O que já existe no repositório

| Pasta | Conteúdo | Situação |
| --- | --- | --- |
| `referencias/imagens/` | 7 artes-chave, todas 2172×724 (3:1), PNG rgb24 | ✅ completas, mas **achatadas** (ver §5) |
| `referencias/audio/` | `Vídeo de ref .mp4` (32,1s · 1728×576 · 30fps) e `qlfck4.mp4` (21,7s · 720×1280 · 30fps) | ⚠️ são **referências de motion**, não a narração |
| `referencias/copy/Copy 1.txt` | Roteiro com marcações de tempo (8–12s, 16–20s, 27–30s) | ✅ |
| — | Narração, trilha, SFX | ❌ ausentes |
| — | Logo Três Estrelas isolado (PNG/SVG com alpha) | ❌ ausente |
| — | Fonte da marca | ❌ ausente |
| — | Projeto de render | ❌ ausente nesta branch |

As 7 artes cobrem **exatamente** as cenas do roteiro, numa relação 1:1.

## 2. Como as referências foram analisadas

Não há reprodução de vídeo aqui; a leitura foi feita decodificando os arquivos:
amostragem de quadros a 1 fps para a estrutura geral, tiras densas a 5 fps nas
transições, detecção de corte por diferença de cena e envelope de energia do
áudio para extrair a grade rítmica. As conclusões abaixo vêm desses dados.

## 3. Linguagem de motion extraída das referências

**Vídeo 1 (banner 3:1, Bagy)** — é a referência estrutural principal.

- **Zero cortes secos.** A detecção de cena não acusa nenhum corte acima do
  limiar: os 32s são um fluxo contínuo. Isso casa com o pedido do roteiro
  ("a pessoa nem percebe onde terminou e começou").
- **Grade rítmica de 120 BPM**, acentos a cada **0,50s** (15 quadros a 30fps),
  começando em ~2,46s. Todo evento de animação cai na grade; os blocos trocam
  a cada ~8 tempos (≈4s).
- **Transição entre blocos** (medida quadro a quadro em 5,6s→7,4s):
  1. estouro branco de 1–2 quadros (flash);
  2. quadro de aberração cromática (RGB split) + desfoque direcional, com
     deslocamento de matiz para roxo/azul;
  3. o tipo novo assenta no centro **primeiro**;
  4. os elementos laterais entram por fora do quadro, com passagem além do
     ponto final e retorno;
  5. contadores sobem por último (216 → 238 K), estilo odômetro.
- **Composição**: tipografia gigante fixa no centro, tudo o mais orbitando —
  cards de produto, avatares circulares, toasts de "Novo pedido", logos.
- **Encerramento**: cartela de CTA com pílula de link.

**Vídeo 2 (vertical, Mercado Livre)** — filmagem de tela; o que importa é o
conteúdo exibido. Acrescenta três recursos:

- blocos de cor inteiros trocando (branco → azul → amarelo) como transição;
- contadores numéricos como protagonistas ("1.247", "105M+" → "120M+");
- mosaico de cards preenchendo a tela e depois se dissolvendo;
- ênfase palavra a palavra, com a palavra-chave trocando de cor.

**Resumo aplicável**: tipo gigante ancorado + elementos entrando de fora com
overshoot + contadores + flash/glitch de 2 quadros na virada + tudo travado
numa grade de 0,5s. É esse o "exatamente assim".

## 4. Mapa de cenas (30s, 7 artes)

| Tempo | Cena | Arte | Motion |
| --- | --- | --- | --- |
| 0–4s | VOCÊ VENDE. A GENTE FAZ CHEGAR. | `E557D04C` (3 iPhones) | 3 telas entram escalonadas; toasts de pedido pipocam em cada uma; tipo assenta à direita |
| 4–8s | Revelação da operação | `6E79A0E6` (CD + caminhões) | recuo de câmera; os pedidos se afastam e revelam o CD e a frota |
| 8–12s | ESCALA | `E98E85B3` (+100.000) | milhares de caixas atravessam e formam o número; contador sobe até 100.000 |
| 12–16s | URGÊNCIA | `156E4839` (rastreio ML) | status avança vendido → separado → enviado; prazo aparece; tipo entra por linha |
| 16–20s | A GRANDE PROMESSA | `1A845E11` (mapa GOIÂNIA→SP) | caixa cruza o mapa na rota; "FULL DE VERDADE." bate no tempo forte |
| 20–26s | CONFIANÇA | `EE0F2194` (caixa protegida) | domo digital pulsa; 4 selos entram em sequência; fluxo de status e ★★★★★ |
| 26–30s | ASSINATURA | `9FBB8066` (Três Estrelas) | nada para: caixas e rotas seguem em movimento, emenda no início |

## 5. Bloqueio principal: as artes estão achatadas

Os 7 PNGs são composições finalizadas, sem canal alfa, **com o texto embutido
na imagem**. O motion das referências depende de elementos independentes
(cada card, cada caixa, cada linha de texto animando em tempos diferentes).
Com imagem achatada só é possível mover a arte inteira — o que resulta num
movimento muito mais fraco do que o pedido.

Dois caminhos:

- **A — plates sem texto (recomendado).** Exportar cada arte em camadas ou, no
  mínimo, o fundo sem o texto. O fundo fotográfico/3D (caminhões, CD, caixas,
  brilho) entra como plate e todo o resto — tipografia, cards de pedido,
  contadores, UI de rastreio, rota do mapa, selos, estrelas — é construído em
  código e animado. É assim que as duas referências são feitas.
- **B — sem os plates.** Recorte por chroma do fundo azul para separar alguns
  elementos e recriação do texto por cima do texto original coberto. Funciona,
  mas deixa halo nas bordas e limita as cenas 1, 4 e 6.

## 6. Plano técnico

- **Remotion** (React), como nos outros projetos deste repositório. Há uma base
  reutilizável na branch `claude/referencias-folder-structure-x498m2`, em
  `video/`: Remotion 4.0.509, React 19, cenas separadas por arquivo e módulos
  já prontos de tipografia cinética, FX, SFX e timeline.
- **Composição**: 2172×724 a 30fps, 900 quadros (30s).
- **Timeline travada em 15 quadros** (0,5s), espelhando os 120 BPM da referência.
- **Transição compartilhada**: flash branco de 2 quadros + RGB split + desfoque
  direcional, como componente único usado nas 6 viradas.
- **Loop**: o último quadro emenda no primeiro, sem cartela de encerramento.

## 7. Pendências antes do build

1. **Áudio** — não há narração nem trilha. O roteiro é cronometrado e a
   referência é sincronizada ao ritmo; sem áudio o corte fica arbitrário.
2. **Plates sem texto** (§5) — define se o resultado chega ao nível da referência.
3. **Logo** em PNG/SVG com transparência.
4. **Fonte** — o display das artes é uma condensada bold em itálico; sem o
   arquivo da marca, será aproximada por uma equivalente livre.
