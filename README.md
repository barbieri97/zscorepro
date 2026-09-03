# ZSCOREPRO

> Ferramentas online para psicometristas e pesquisadores

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/barbieri97/psicdigital)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Nuxt](https://img.shields.io/badge/Nuxt-3.x-00DC82.svg)](https://nuxt.com)

## 📋 Sobre o Projeto

ZSCOREPRO é uma plataforma web que oferece ferramentas estatísticas e psicométricas online, desenvolvida especialmente para psicometristas, psicólogos e pesquisadores. O objetivo é facilitar análises estatísticas e cálculos psicométricos de forma rápida e intuitiva.

🌐 **Site:** [www.zscorepro.com.br](https://www.zscorepro.com.br/)

## ✨ Funcionalidades

### 📊 Calculadoras

- **Calculadora de Z-score** - Converta escores para Z, T, percentil ou ponto ponderado
- **Análise Descritiva** - Resumo estatístico com medidas de tendência central e dispersão
- **Calculadora de Idade** - Calcule a idade exata a partir da data de nascimento
- **RCI (Índice de Mudança Confiável)** - Avalie se a mudança entre duas medições é significativa
- **Conta Compartilhada** - Divisão inteligente de gastos entre pessoas

### 🛠️ Ferramentas

- **Gerador de Gráficos** - Crie gráficos de barra, linha ou pizza a partir de seus dados
- **QR Code Generator** - Gere QR Codes para URLs, textos ou dados de forma rápida

### 🎲 Simulações

- **Tabuleiro de Galton** - Demonstração visual de como a variabilidade aleatória dos escores gera a distribuição normal
- **Áreas de Brodmann** - Atlas interativo das áreas corticais, com conjuntos prontos, conjuntos próprios e exportação em SVG/PNG ([API pública](#-api-pública-áreas-de-brodmann))

## 🔌 API pública: Áreas de Brodmann

O atlas de Brodmann também está disponível como API aberta, sem autenticação e liberada
para qualquer origem (CORS). Ela recebe os mesmos dados que você monta na interface —
grupos de áreas, cada um com rótulo e cor — e devolve as pranchas em SVG ou PNG.

Base: `https://www.zscorepro.com.br`

### `POST /api/brodmann/export`

Corpo em JSON:

| Campo | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `groups` | `Array<{ label, color, areas }>` | `[]` | Grupos de áreas. `label` é o rótulo na legenda, `color` um hexadecimal (`#D92B2B`) e `areas` a lista de números de áreas de Brodmann. Uma área só pode aparecer em um grupo. Sem grupos, devolve a prancha com as cores originais do atlas. |
| `view` | `"lateral" \| "medial" \| "both"` | `"both"` | Prancha desejada. |
| `format` | `"svg" \| "png"` | `"svg"` | Formato da imagem. |
| `legend` | `boolean` | `true` quando há grupos | Desenha a legenda abaixo da prancha. |
| `title` | `string` | — | Título da legenda (até 120 caracteres). |
| `note` | `string` | — | Texto de apoio sob o título (até 400 caracteres). |
| `fadeUnselected` | `boolean` | `true` | Esmaece as áreas fora dos grupos. |
| `scale` | `number` (1 a 4) | `2` | Multiplicador de resolução do PNG. |

A resposta depende de `view`:

- `lateral` ou `medial` → a imagem em si, com `Content-Type` `image/svg+xml` ou `image/png`.
- `both` → um JSON `{ "lateral": ..., "medial": ... }`, com o SVG em texto ou o PNG como data URI.

Entradas inválidas (cor fora do formato hexadecimal, área inexistente, área repetida em
dois grupos) devolvem `400` com a mensagem do problema.

```bash
# Prancha lateral em SVG, com a rede da linguagem destacada
curl -X POST https://www.zscorepro.com.br/api/brodmann/export \
  -H 'Content-Type: application/json' \
  -d '{
    "view": "lateral",
    "format": "svg",
    "title": "Linguagem",
    "note": "Rede perissilviana esquerda.",
    "groups": [
      { "label": "Broca", "color": "#D92B2B", "areas": [44, 45] },
      { "label": "Wernicke", "color": "#1B57A6", "areas": [22] }
    ]
  }' -o brodmann-lateral.svg
```

### `GET /api/brodmann/meta`

Devolve o que é preciso para montar a requisição acima: as áreas válidas com nome e
vistas em que aparecem, a paleta padrão e os conjuntos prontos usados na interface.

```bash
curl https://www.zscorepro.com.br/api/brodmann/meta
```

## 🚀 Tecnologias

- [Nuxt 3](https://nuxt.com/) - Framework Vue.js
- [Vue 3](https://vuejs.org/) - Framework JavaScript
- [TypeScript](https://www.typescriptlang.org/) - Superset JavaScript
- [Nuxt UI](https://ui.nuxt.com/) - Biblioteca de componentes
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS

## 📦 Instalação

### Pré-requisitos

- Node.js 18+
- npm ou yarn

### Passos

```bash
# Clone o repositório
git clone https://github.com/barbieri97/zscorepro.git

# Entre no diretório
cd zscorepro

# Instale as dependências
npm install

# Execute em modo de desenvolvimento
npm run dev

# Acesse http://localhost:3000
```

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview

# Lint e formatação
npm run lint
npm run lint:fix
npm run format

# Versionamento
npm run release:patch  # 1.0.0 → 1.0.1
npm run release:minor  # 1.0.0 → 1.1.0
npm run release:major  # 1.0.0 → 2.0.0
```

## 📁 Estrutura do Projeto

```
psicdigital/
├── .vscode/              # Configurações do VSCode
├── components/           # Componentes Vue
├── pages/               # Páginas da aplicação
│   ├── calculadoras/    # Calculadoras estatísticas
│   ├── ferramentas/     # Ferramentas diversas
│   └── simulacoes/      # Simulações interativas
├── stores/              # Pinia stores
├── composables/         # Composables Vue
├── public/              # Arquivos estáticos
├── nuxt.config.ts       # Configuração do Nuxt
├── package.json         # Dependências
└── tsconfig.json        # Configuração TypeScript
```

## 🎨 Funcionalidades em Destaque

### Calculadora de Z-score

Converte escores brutos em diferentes escalas padronizadas, incluindo:

- Escores Z (média 0, desvio padrão 1)
- Escores T (média 50, desvio padrão 10)
- Percentis
- Pontos ponderados

### RCI - Índice de Mudança Confiável

Ferramenta essencial para avaliar se mudanças em escores entre duas aplicações são estatisticamente significativas, considerando o erro de medida.

### Tabuleiro de Galton

Simulação interativa que demonstra visualmente como eventos aleatórios independentes resultam em uma distribuição normal, conceito fundamental em estatística.

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Faça um Fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feat/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'feat: adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feat/nova-funcionalidade`)
5. Abra um Pull Request

### Padrão de Commits

Este projeto segue [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - Nova funcionalidade
- `fix:` - Correção de bug
- `docs:` - Documentação
- `style:` - Formatação
- `refactor:` - Refatoração
- `test:` - Testes
- `chore:` - Manutenção

## 📝 Roadmap

- [ ] Adicionar mais calculadoras psicométricas
- [ ] Implementar exportação de resultados em PDF
- [ ] Criar área de usuário para salvar histórico de cálculos
- [ ] Adicionar tutoriais em vídeo
- [ ] Implementar modo dark/light
- [ ] Adicionar suporte a múltiplos idiomas

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

**André Barbieri**

- LinkedIn: [@andre-barbieri](https://www.linkedin.com/in/andre-barbieri)
- Instagram: [@barbieri.psi](https://instagram.com/barbieri.psi)
- WhatsApp: [+55 11 99397-1098](https://wa.me/5511993971098)

## 🙏 Agradecimentos

- Comunidade Nuxt
- Psicólogos e pesquisadores que contribuíram com feedback
- Todos os colaboradores do projeto

---

Desenvolvido com ❤️ para a comunidade de psicometria e pesquisa
