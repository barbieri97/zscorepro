// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  css: ["~/assets/css/main.css"],

  modules: [
    "@nuxt/content",
    "@nuxt/eslint",
    "@nuxt/hints",
    "@nuxt/image",
    "@nuxt/scripts",
    "@nuxt/test-utils",
    "@nuxt/ui",
    "@nuxthub/core",
    "@nuxtjs/supabase",
    "nuxt-gtag",
  ],

  supabase: {
    redirect: false,
    types: '~/types/database.types',
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY
      || process.env.SUPABASE_PUBLISHABLE_KEY
      || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  },

  gtag: {
    id: "G-C6P9CVNT6V",
  },

  colorMode: {
    preference: "dark",
    fallback: "dark",
  },
  runtimeConfig: {
    supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    public: {
      appVersion: process.env.npm_package_version || "1.0.0",
    },
  },
});
