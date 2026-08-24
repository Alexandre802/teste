# Ferramentas de UI: ui-ux-pro-max, shadcn MCP, 21st MCP

Ordem de uso ao montar um site: **decidir o sistema visual → pegar componentes reais →
gerar o que não existe pronto → animar no Remotion**.

## 1. ui-ux-pro-max — decisão visual (local, sem rede)

Skill instalada em `.claude/skills/ui-ux-pro-max/`. Base de dados local pesquisada por
Python (só biblioteca padrão, nenhuma chamada de rede).

```bash
P=.claude/skills/ui-ux-pro-max/scripts/search.py

python3 $P "saas landing minimalista"  --domain style
python3 $P "fintech confiança"          --domain color
python3 $P "editorial elegante"         --domain typography
python3 $P "landing de produto"         --domain landing
python3 $P "onboarding"                 --domain ux
python3 $P "dashboard de métricas"      --domain chart
python3 $P "hero animado"               --domain gsap
python3 $P "componentes de card"        --domain product --stack react
```

Domínios: `style`, `color`, `chart`, `landing`, `product`, `ux`, `typography`, `icons`,
`gsap`, `react`, `web`, `google-fonts`.
Flags úteis: `--stack react|nextjs|shadcn|threejs|…`, `--max-results 1-20`, `--json`,
`--full`, `--design-system --project-name "Nome"` (gera um design system completo).

Gere o design system uma vez, salve em `design/DESIGN.md` e trate como fonte da verdade —
as cores do vídeo Remotion e as do site precisam sair do mesmo lugar.

Skills irmãs instaladas: `design`, `design-system`, `brand`, `ui-styling`, `banner-design`,
`slides`.

## 2. MCP `shadcn-ui` — componentes reais do shadcn/ui v4

Configurado em `.mcp.json` (`@jpisnice/shadcn-ui-mcp-server`, framework `react`).

Ferramentas:

| Ferramenta | Uso |
|---|---|
| `list_components` | lista todos os componentes disponíveis |
| `get_component` | código-fonte de um componente |
| `get_component_demo` | exemplo de uso — leia antes de integrar |
| `get_component_metadata` | dependências e metadados |
| `list_blocks` / `get_block` | blocks prontos (`dashboard-01`, `login-03`, `calendar-01`…) |
| `list_themes` / `get_theme` / `apply_theme` | temas TweakCN |
| `get_directory_structure` | navegar o repositório do shadcn |

Prefira `get_block` a montar seção do zero: os blocks já vêm com layout responsivo e
estados resolvidos. Para landing page, comece por `list_blocks` e adapte.

**Rate limit:** sem token são 60 requisições/hora contra a API do GitHub. Com um
`GITHUB_PERSONAL_ACCESS_TOKEN` (escopo público basta, sem permissão de escrita) sobe para
5000/h. Defina no ambiente antes de abrir a sessão:

```bash
export GITHUB_PERSONAL_ACCESS_TOKEN=ghp_xxx
```

Outros frameworks: troque `--framework` em `.mcp.json` para `svelte`, `vue` ou
`react-native`. Base UI no lugar de Radix: `--ui-library base`.

## 3. MCP `21st` — busca e geração de UI

O antigo `@21st-dev/magic` virou um proxy: o servidor atual é o **21st MCP**, HTTP em
`https://21st.dev/api/mcp`, autenticado por `x-api-key`.

```bash
export TWENTY_FIRST_API_KEY=...   # chave em https://21st.dev/mcp
```

Ferramentas principais (nomes atuais; os antigos `21st_magic_*` ainda são aceitos):

| Atual | Antigo | Uso |
|---|---|---|
| `generate` | `21st_magic_component_builder` / `_refiner` | gerar ou refinar um componente |
| `search` | — | buscar no catálogo (componentes, temas, templates) |
| `get_inspiration` | `21st_magic_component_inspiration` | referência visual |
| `search_logo` | `logo_search` | logo em SVG (uma marca por chamada) |

Chame `tools/list` na sessão para ver o conjunto completo — o servidor expõe mais que essas
quatro. Sem a variável de ambiente definida, o servidor `21st` falha ao conectar e as demais
ferramentas continuam funcionando normalmente.

## Como combinar

1. `ui-ux-pro-max --design-system` → estilo, paleta, tipografia, seções.
2. `shadcn-ui: list_blocks` / `get_block` → esqueleto real das seções estáticas do site.
3. `21st: search` → o que faltar; `21st: generate` só quando não existir nada próximo.
4. Aplique a paleta do passo 1 sobre tudo (tokens CSS compartilhados).
5. Remotion entra no que é movimento: hero, transições de seção, explainer, peça de campanha.

Não gere componente novo quando existe block pronto — o block já resolveu responsividade,
foco e estados, e é menos código para revisar.

## Custos e chaves

| Servidor | Chave | Sem chave |
|---|---|---|
| `shadcn-ui` | `GITHUB_PERSONAL_ACCESS_TOKEN` (opcional) | funciona, 60 req/h |
| `21st` | `TWENTY_FIRST_API_KEY` (obrigatória) | não conecta |

`.mcp.json` referencia as variáveis por expansão — **nenhuma chave é gravada no
repositório**, e deve continuar assim.
