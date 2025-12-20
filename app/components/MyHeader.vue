<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";

const route = useRoute();

const items = computed<NavigationMenuItem[]>(() => [
    {
    label: "Home",
    to: "/",
    active: "/"
    icon: "i-heroicons-document-text",
  },
  {
    label: "Blog",
    to: "/blog",
    active: route.path.startsWith("/blog"),
    icon: "i-heroicons-document-text",
  },
  {
    label: "Financeiro",
    to: "/financeiro",
    active: route.path.startsWith("/financeiro"),
  },
  {
    label: "Calculadoras",
    to: "/calculadoras",
    active: route.path.startsWith("/calculadoras"),
  },
    {
    label: "Ferramentas",
    to: "/ferramentas",
    active: route.path.startsWith("/ferramentas"),
  },
]);
</script>

<template>
  <UHeader title="ZSCOREPRO">

    <UNavigationMenu :items="items" />

    <template #right>
      <UColorModeButton />

      <UTooltip text="Open on GitHub" :kbds="['meta', 'G']">
        <UButton
          color="neutral"
          variant="ghost"
          to="https://github.com/barbieri97"
          target="_blank"
          icon="i-simple-icons-github"
          aria-label="GitHub"
        />
      </UTooltip>
    </template>
  </UHeader>
</template>
