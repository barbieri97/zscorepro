<script setup lang="ts">
import { Analytics } from "@vercel/analytics/nuxt";

const { init } = useAuth()
await init()
</script>

<template>
  <UApp>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <Analytics />
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
