import type { NavigationMenuItem } from "@nuxt/ui";

export interface NavItem extends NavigationMenuItem {
  description?: string;
  children?: NavItem[];
}

export const useNavigation = () => {
  const { isAuthorOrAdmin } = useProfile()

  const items = computed<NavItem[]>(() => [
    {
      label: "Home",
      to: "/",
      icon: "i-heroicons-home",
    },
    {
      label: "Blog",
      to: "/blog",
      icon: "i-heroicons-document-text"
    },
    {
      label: "Equipe",
      to: "/equipe",
      icon: "i-heroicons-user-group",
    },
    ...(isAuthorOrAdmin.value ? [{
      label: "Admin",
      to: "/admin",
      icon: "i-heroicons-cog-6-tooth",
    }] : []),
    {
      label: "Calculadoras",
      to: "/calculadoras",
      icon: "i-heroicons-calculator",
      children: [
        {
          label: "Z-Score",
          to: "/calculadoras/zscore",
          description: "Converta escores para Z, T, percentil ou ponto ponderado.",
          icon: "i-tabler-circle-letter-z"
        },
        {
          label: "Idade",
          to: "/calculadoras/idade",
          description: "Calcule a idade exata a partir da data de nascimento.",
          icon: "i-heroicons-calendar",
        },
        {
          label: "Análise descritiva",
          to: "/calculadoras/descritiva",
          description: "Gera um resumo estatístico básico dos dados, incluindo medidas de tendência central e dispersão.",
          icon: "i-heroicons-table-cells"
        },
        {
          label: "Índice de Mudança Confiável - RCI",
          to: "/calculadoras/rci",
          description: "Avalie se a mudança entre duas medições é significativa.",
          icon: "i-heroicons-arrows-right-left",
          disabled: true // Changed from true to false so it can be accessed like in the old home page
        }
      ]
    },
    {
      label: "Ferramentas",
      to: "/ferramentas",
      icon: "i-heroicons-wrench-screwdriver",
      children: [
        {
          label: "Gerador de QR Code",
          to: "/ferramentas/qrcode",
          icon: "i-heroicons-qr-code",
          description: "Gere QR Codes para URLs, textos ou dados de forma rápida."
        },
        {
          label: "Gerador de CPF",
          to: "/ferramentas/cpf",
          icon: "i-heroicons-identification",
          description: "Gerador de números de CPF válidos para testes."
        },
        {
          label: "Gerador de Gráficos",
          to: "/ferramentas/graficos",
          icon: "i-heroicons-presentation-chart-bar",
          description: "Crie gráficos de barra, linha ou pizza a partir de seus dados."
        },
      ]
    },
    {
      label: "Simulações",
      to: "/simulacoes",
      icon: "i-heroicons-beaker",
      children: [
        {
          label: "Tabuleiro de Galton",
          description: "Demonstração visual de como a variabilidade aleatória dos escores gera a distribuição normal.",
          to: "/simulacoes/galton-board",
          icon: "i-heroicons-chart-bar"
        },
        {
          label: "Torre de Hanói",
          description: "Simulação do clássico teste neuropsicológico de planejamento. Mova todos os discos para outro pino com o menor número de movimentos possível.",
          to: "/simulacoes/torre-hanoi",
          icon: "i-heroicons-puzzle-piece"
        },
        {
          label: "Tarefa de Simon",
          description: "Simulação do Spatial Stroop Task: responda à direção da seta ignorando sua posição na tela. Mede o controle inibitório e o tempo de reação.",
          to: "/simulacoes/simon-task",
          icon: "i-heroicons-bolt"
        }
      ]
    }
  ]);

  // Extracts tools grouped by main category, flattening sub-categories (like Financeiro) for display in cards
  const groupedTools = computed(() => {
    return items.value
      .filter((item) => item.children && item.children.length > 0)
      .map((category) => {
        const flatChildren: NavItem[] = [];

        category.children?.forEach((child) => {
          if (child.children) {
            // Subcategory like Financeiro => push its children to the flat list
            flatChildren.push(...child.children);
          } else {
            flatChildren.push(child);
          }
        });

        return {
          ...category,
          tools: flatChildren
        };
      });
  });

  return {
    items,
    groupedTools
  };
};
