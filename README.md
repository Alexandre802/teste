# teste

Repositório preparado para **criação de sites com Remotion** (vídeo e animação programática
em React), com as skills e servidores MCP de UI já instalados.

> O site ainda **não** foi criado — este commit é só o ferramental.

## O que está instalado

### Skills (`.claude/skills/`)

| Skill | Origem | Para que serve |
|---|---|---|
| `remotion-site` | escrita para este repositório | Pipeline completo de site com Remotion: scaffold, composições, animação, `@remotion/player`, render e deploy |
| `ui-ux-pro-max` | [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) v2.15.0 | Base local pesquisável de estilos, paletas, tipografia, padrões de landing, guidelines de UX e gráficos |
| `design`, `design-system`, `brand`, `ui-styling`, `banner-design`, `slides` | idem | Skills irmãs do mesmo pacote |

Instaladas com o CLI oficial: `npx ui-ux-pro-max-cli@latest init --ai claude`.

### Servidores MCP (`.mcp.json`)

| Servidor | Origem | Chave |
|---|---|---|
| `shadcn-ui` | [Jpisnice/shadcn-ui-mcp-server](https://github.com/Jpisnice/shadcn-ui-mcp-server) | `GITHUB_PERSONAL_ACCESS_TOKEN` — opcional (60 req/h sem token, 5000 com) |
| `21st` | [21st-dev/magic-mcp](https://github.com/21st-dev/magic-mcp) → 21st MCP | `TWENTY_FIRST_API_KEY` — obrigatória, em <https://21st.dev/mcp> |

As chaves são lidas por expansão de variável de ambiente. **Nenhuma chave fica no
repositório.**

```bash
export GITHUB_PERSONAL_ACCESS_TOKEN=ghp_...   # opcional
export TWENTY_FIRST_API_KEY=...               # necessária para o servidor 21st
```

O antigo `@21st-dev/magic` foi substituído pelo 21st MCP e as chaves antigas do Magic foram
invalidadas — gere uma nova.

### Documentado, não instalado

[google-research/frame-interpolation](https://github.com/google-research/frame-interpolation)
(FILM) — interpolação de frames para slow motion. Exige GPU NVIDIA, TensorFlow 2.6 e modelos
pré-treinados baixados à mão; as dependências conflitam com ambientes Python modernos.
Documentado em `.claude/skills/remotion-site/references/frame-interpolation.md`, com as
alternativas hospedadas (Replicate, Hugging Face). Ferramenta opcional de pós-produção.

## Pré-requisitos

- **Node.js 18+** — Remotion e os MCPs
- **Python 3.x** — script de busca do `ui-ux-pro-max` (só biblioteca padrão, sem rede)
- **FFmpeg** — embutido no Remotion; necessário à parte só para o FILM

## Uso

Reinicie o Claude Code para carregar as skills e os MCPs. Depois:

```
Crie uma landing page para <produto> com hero animado em Remotion
```

A skill `remotion-site` conduz: sistema visual → componentes → animação → render.

Busca direta na base de design:

```bash
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "saas landing minimalista" --domain style
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "Nome do Projeto" --design-system
```

## Licenças

- Remotion: gratuito para indivíduos e organizações até 3 pessoas; **empresas maiores
  precisam de licença** — <https://remotion.dev/license>
- `ui-ux-pro-max-skill`: MIT
- `shadcn-ui-mcp-server`: MIT
- FILM: Apache 2.0 (Google Research)
