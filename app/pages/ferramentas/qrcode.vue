<script setup lang="ts">
import { ref, computed, watch } from "vue"
import QRCode from "qrcode"

const toast = useToast()

/* Inputs */
const text = ref("")
const size = ref(256)
const darkColor = ref("#000000")
const lightColor = ref("#ffffff")

/* Output */
const qrDataUrl = ref<string | null>(null)

/* Gerar QR */
async function generateQR() {
  if (!text.value.trim()) {
    qrDataUrl.value = null
    return
  }

  qrDataUrl.value = await QRCode.toDataURL(text.value, {
    width: size.value,
    margin: 2,
    color: {
      dark: darkColor.value,
      light: lightColor.value
    }
  })
}

/* Atualizar automaticamente */
watch([text, size, darkColor, lightColor], generateQR)

/* Download */
function downloadQR() {
  if (!qrDataUrl.value) return

  const link = document.createElement("a")
  link.href = qrDataUrl.value
  link.download = "qr-code.png"
  link.click()

  toast.add({
    title: "QR Code baixado",
    icon: "i-heroicons-check-circle",
    color: "success"
  })
}
</script>

<template>
  <UContainer class="py-10 flex justify-center">
    <UCard class="w-full max-w-3xl">
      <!-- Header -->
      <template #header>
        <h2 class="text-lg font-semibold text-center">
          Gerador de QR Code
        </h2>
      </template>

      <!-- Inputs -->
      <div class="grid gap-4 md:grid-cols-2 my-10">
        <UFormField label="Texto ou URL">
          <UInput
            v-model="text"
            placeholder="https://exemplo.com"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Tamanho (px)">
          <UInput
            v-model.number="size"
            type="number"
            min="128"
            max="512"
          />
        </UFormField>

        <UFormField label="Cor do QR">
          <UColorPicker v-model="darkColor" />
        </UFormField>

        <UFormField label="Cor de fundo">
          <UColorPicker v-model="lightColor"  />
        </UFormField>
      </div>

      <!-- Preview -->
      <div v-if="qrDataUrl" class="space-y-4">
        <div class="flex justify-center p-4 border rounded">
          <img :src="qrDataUrl" alt="QR Code gerado" />
        </div>
      </div>

      <!-- Footer -->
      <template #footer>
          <UButton
            icon="i-heroicons-arrow-down-tray"
            label="Baixar QR Code"
            @click="downloadQR"
          />
      </template>
    </UCard>
  </UContainer>
</template>
