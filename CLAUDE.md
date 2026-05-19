# CLAUDE.md — zscorepro

## Deploy

O deploy é automático na Vercel ao fazer push na branch `main`.

### Processo completo de release

1. Certifique-se de estar na branch `develop` com as alterações commitadas.
2. Rode o comando abaixo passando o tipo de versão (`patch`, `minor` ou `major`):

```bash
./scripts/release.sh minor
```

O script executa automaticamente:
- `npm version <tipo>` → bumpa a versão no `package.json`, cria commit e tag git
- Push da `develop` → origin
- Merge da `develop` na `main` (merge commit)
- Push da `main` e da tag → origin (dispara deploy na Vercel)
- Criação do GitHub Release com o changelog gerado

### Quando usar cada tipo
| Tipo | Quando usar |
|------|------------|
| `patch` | Correções de bugs, ajustes visuais pequenos |
| `minor` | Nova funcionalidade (calculadora, simulação, ferramenta) |
| `major` | Mudança de arquitetura ou breaking change |

### Pré-requisitos
- `gh` CLI instalado e autenticado (`gh auth login`)
- Branch `develop` com as alterações commitadas e prontas
