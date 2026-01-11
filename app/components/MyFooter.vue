<script setup lang="ts">
const config = useRuntimeConfig();
const version = config.public.appVersion;
</script>
<template>
  <UFooter>
    <template #left>
      <p class="text-muted text-sm">
        Copyright © {{ new Date().getFullYear() }} - v{{ version }}
      </p>
    </template>

    <template #right>
      <UButton
        icon="i-simple-icons-whatsapp"
        color="neutral"
        variant="ghost"
        to="https://wa.me/5511993971098"
        target="_blank"
        aria-label="Discord"
      />
      <UButton
        icon="i-simple-icons-instagram"
        color="neutral"
        variant="ghost"
        to="https://instagram.com/barbieri.psi"
        target="_blank"
        aria-label="instagram"
      />
      <UButton
        icon="i-simple-icons-linkedin"
        color="neutral"
        variant="ghost"
        to="https://www.linkedin.com/in/andre-barbieri"
        target="_blank"
        aria-label="Linkedin"
      />
    </template>
  </UFooter>
</template>
