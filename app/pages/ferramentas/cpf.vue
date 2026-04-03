<script setup lang="ts">
import { ref, watch } from "vue"

const toast = useToast()

const useFormatting = ref(true)
const generatedCpf = ref("")

function calculateCheckDigit(digits: number[], startWeight: number) {
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    sum += digits[i] * (startWeight - i);
  }
  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
}

function generateNewCpf() {
  const digits: number[] = [];
  for (let i = 0; i < 9; i++) {
    digits.push(Math.floor(Math.random() * 10));
  }
  
  // Evitar CPFs com todos os dígitos iguais (ex: 111.111.111-11)
  if (digits.every(d => d === digits[0])) {
    digits[0] = (digits[0] + 1) % 10;
  }
  
  const d1 = calculateCheckDigit(digits, 10);
  digits.push(d1);
  const d2 = calculateCheckDigit(digits, 11);
  digits.push(d2);
  
  const cpfStr = digits.join('');
  generatedCpf.value = useFormatting.value 
    ? `${cpfStr.substring(0,3)}.${cpfStr.substring(3,6)}.${cpfStr.substring(6,9)}-${cpfStr.substring(9,11)}`
    : cpfStr;
}

// Generate automatically when formatting is toggled
watch(useFormatting, () => {
    // We re-format the existing CPF without regenerating if we want.
    // However, it's simpler to just format the existing one instead of rolling new numbers.
    const rawDigits = generatedCpf.value.replace(/\D/g, '');
    if (useFormatting.value) {
      if (rawDigits.length === 11) {
        generatedCpf.value = `${rawDigits.substring(0,3)}.${rawDigits.substring(3,6)}.${rawDigits.substring(6,9)}-${rawDigits.substring(9,11)}`;
      }
    } else {
      generatedCpf.value = rawDigits;
    }
})

function copyCpf() {
  if (!generatedCpf.value) return;
  navigator.clipboard.writeText(generatedCpf.value);
  toast.add({
    title: "CPF copiado!",
    description: `Formato: ${useFormatting.value ? 'Com' : 'Sem'} pontuação`,
    icon: "i-heroicons-check-circle",
    color: "success"
  })
}

// Inicializar com um CPF ao carregar a página
generateNewCpf()

</script>

<template>
  <UContainer class="py-10 flex justify-center">
    <UCard class="w-full max-w-lg">
      <template #header>
        <h2 class="text-lg font-semibold text-center">
          Gerador de CPF
        </h2>
        <p class="text-sm text-gray-500 text-center mt-1">
          Gere números de CPF válidos para testes.
        </p>
      </template>

      <div class="space-y-8 my-6">
        <div class="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
          <div>
            <div class="font-medium">Usar pontuação</div>
            <div class="text-sm text-gray-500">Exibe como 000.000.000-00</div>
          </div>
          <USwitch v-model="useFormatting" />
        </div>

        <div class="flex flex-col gap-2">
          <label class="font-medium text-sm text-gray-700 dark:text-gray-300">CPF de Teste Gerado</label>
          <div class="flex items-center gap-2">
            <UInput
              v-model="generatedCpf"
              readonly
              class="flex-1 text-center text-xl font-mono tracking-widest bg-gray-50 dark:bg-gray-900"
              size="xl"
            />
            <UButton
              icon="i-heroicons-clipboard-document"
              color="gray"
              variant="solid"
              size="xl"
              @click="copyCpf"
              title="Copiar"
            />
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-center">
          <UButton
            icon="i-heroicons-arrow-path"
            label="Gerar Novo CPF"
            size="lg"
            color="primary"
            @click="generateNewCpf"
          />
        </div>
      </template>
    </UCard>
  </UContainer>
</template>
