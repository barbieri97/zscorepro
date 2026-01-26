export default defineNuxtRouteMiddleware(async (to) => {
  const ntfyUrl = "https://ntfy.sh/zscorepro";

  if (!ntfyUrl) return;

  // No servidor (SSR), from.path é undefined na primeira carga
  // No cliente, evita duplicar notificação na mesma página

  // Verifica se está no servidor
  if (import.meta.server) {
    // Envia notificação no servidor (primeira carga/SSR)
    try {
      await $fetch(ntfyUrl, {
        method: "POST",
        body: `[SSR] Página: ${to.path}`,
      });
    } catch (error) {
      console.error("Erro ao enviar notificação (SSR):", error);
    }
  } else if (import.meta.client) {
    // Envia notificação no cliente (navegação SPA)
    try {
      await $fetch(ntfyUrl, {
        method: "POST",
        body: `[Client] Página: ${to.path}`,
      });
    } catch (error) {
      console.error("Erro ao enviar notificação (client):", error);
    }
  }
});
