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
    "nuxt-gtag",
  ],

  gtag: {
    id: "G-C6P9CVNT6V",
  },

  colorMode: {
    preference: "dark",
    fallback: "dark",
  },
  runtimeConfig: {
    public: {
      appVersion: process.env.npm_package_version || "1.0.0",
      supabaseUrl: '',
      supabaseKey: '',
    },
  },
});
