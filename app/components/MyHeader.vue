<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";

const items = computed<NavigationMenuItem[]>(() => [
    {
    label: "Home",
    to: "/",
    icon: "i-heroicons-document-text",
  },
  {
    label: "Blog",
    to: "/blog",
    icon: "i-heroicons-document-text",
    disabled: true
  },

  {
    label: "Calculadoras",
    to: "/calculadoras",
    icon: "i-heroicons-calculator",
    children: [

      {
        label: "Financeiro",
        to: "/calculadoras/financeiro",
        description: "Calculadoras para a area financeira, como juros e investimentos",
        icon: "i-heroicons-banknotes",
        disabled: true,
        children: [
          {
            label: "Juros compostos",
            to: "/calculadora/financeiro/juros-compostos",
            icon: "i-heroicons-percent-badge",
            disabled: true
          }
        ]
      },
      {
        label: "Z-Score",
        to: "/calculadoras/zscore",
        description: "Calcula o Z-score para amostras normativas",
        icon: "i-tabler-circle-letter-z"
      },
      {
        label: "Idade",
        to: "/calculadoras/idade",
        description: "Calcula a idade exata a partir da data de nascimento.",
        icon: "i-heroicons-calendar",
        disabled: true
      },
      {
        label: "Indice de Mudança Confiável - RCI",
        to: "/calculadoras/idade",
        description: "Verifica se a mudança é real ou erro de medida.",
        icon: "i-heroicons-arrows-right-left",
        disabled: true
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
        description: "Gerador de QR code a partir de um texto ou link"
      },
      {
        label: "Gerador de CPF",
        to: "/ferramentas/cpf",
        icon: "i-heroicons-identification",
        description: "gerador de números de cpf validos para testes",
        disabled: true
      },
      {
        label: "Gerador de gráficos",
        to: "/ferramentas/graficos",
        icon: "i-heroicons-presentation-chart-bar",
        description: "gerador de gráficos de barra, linha ou pizza"
      },
    ]
  },
]);
</script>

<template>
  <UHeader mode="slideover">
    <template #title>
      <h1 class="text-primary">ZSCOREPRO</h1>
    </template>

    <UNavigationMenu :items="items" />

    <template #right>
      <UColorModeButton />

      <UTooltip text="Open on GitHub" :kbds="['meta', 'G']">
        <UButton
          color="neutral"
          variant="ghost"
          to="https://github.com/barbieri97/zscorepro"
          target="_blank"
          icon="i-simple-icons-github"
          aria-label="GitHub"
        />
      </UTooltip>
    </template>

    
    <template #body>
      <UNavigationMenu :items="items" orientation="vertical" class="-mx-2.5" />
    </template>
  </UHeader>
</template>
