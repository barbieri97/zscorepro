export default defineAppConfig({
  ui: {
    colors: {
      primary: "blue",
      secondary: "teal",
      success: "green",
      warning: "yellow",
      error: "red",
      neutral: "stone",
    },
    main: {
      base: 'min-h-[calc(100vh-var(--ui-header-height)+var(--ui-footer-height))]'
    }
  },
});
