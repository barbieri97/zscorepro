import type { NavigationMenuItem } from "@nuxt/ui";

export interface NavItem extends NavigationMenuItem {
  description?: string;
  children?: NavItem[];
}

export const useNavigation = () => {
  const items = computed<NavItem[]>(() => [
    {
      label: "Home",
      to: "/",
      icon: "i-heroicons-document-text",
    },
    {
      label: "Blog",
      to: "/blog",
      icon: "i-heroicons-document-text"
    },
    {
      label: "Calculadoras",
      to: "/calculadoras",
      icon: "i-heroicons-calculator",
      children: [
        {
          label: "Financeiro",
          to: "/calculadoras/financeiro",
          description: "Calculadoras para a área financeira, como juros e investimentos.",
          icon: "i-heroicons-banknotes",
          children: [
            {
              label: "Conta Compartilhada",
              to: "/calculadoras/financeiro/conta-compartilhada",
              description: "Calculadora de divisão de gastos que permite informar quanto cada pessoa pagou e mostra automaticamente quem deve pagar ou receber para que a conta fique dividida de forma justa.",
              icon: "i-heroicons-percent-badge",
            }
          ]
        },
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
