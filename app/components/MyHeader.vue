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
  },
  {
    label: "Financeiro",
    to: "/financeiro",
    icon: "i-heroicons-banknotes"

  },
  {
    label: "Calculadoras",
    to: "/calculadoras",
    icon: "i-heroicons-calculator"
  },
    {
    label: "Ferramentas",
    to: "/ferramentas",
    icon: "i-heroicons-wrench-screwdriver"
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
