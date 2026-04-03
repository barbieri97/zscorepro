/* ============================================================
   useGroupExpense — Composable para divisão de gastos em grupo
   Suporta múltiplas compras por sessão.
   ============================================================ */

/* ---------- Tipos ---------- */

export interface Participant {
  id: number;
  name: string;
  coversCount: number; // Quantas pessoas esse participante representa (ele + dependentes)
}

export interface Purchase {
  id: number;
  description: string;
  amount: number;
  paidById: number; // ID do participante que pagou
}

export interface ParticipantResult {
  participant: Participant;
  totalPaid: number;
  shouldPay: number;
  difference: number;
  status: "receive" | "pay" | "even";
}

export interface Transfer {
  from: string;
  to: string;
  amount: number;
}

interface AppState {
  participants: Participant[];
  purchases: Purchase[];
  nextParticipantId: number;
  nextPurchaseId: number;
}

/* ---------- Constantes ---------- */

const STORAGE_KEY = "group-expense-splitter-v2";

/* ---------- Estado global (singleton por processo) ---------- */

const participants = ref<Participant[]>([
  { id: 1, name: "", coversCount: 1 },
  { id: 2, name: "", coversCount: 1 },
]);

const purchases = ref<Purchase[]>([
  { id: 1, description: "", amount: 0, paidById: 1 },
]);

let nextParticipantId = 3;
let nextPurchaseId = 2;

/* ============================================================
   Composable principal
   ============================================================ */

export function useGroupExpense() {
  const toast = useToast();

  /* ---------- Persistência ---------- */

  function saveToLocalStorage() {
    try {
      const state: AppState = {
        participants: participants.value,
        purchases: purchases.value,
        nextParticipantId,
        nextPurchaseId,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error("Erro ao salvar no localStorage:", error);
      toast.add({
        title: "Erro ao salvar",
        description: "Não foi possível salvar os dados localmente",
        icon: "i-heroicons-exclamation-triangle",
        color: "error",
      });
    }
  }

  function loadFromLocalStorage() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const state: AppState = JSON.parse(saved);
        participants.value = (state.participants ?? []).map((p) => ({
          ...p,
          coversCount: p.coversCount ?? 1,
        }));
        purchases.value = state.purchases ?? [];
        nextParticipantId = state.nextParticipantId ?? participants.value.length + 1;
        nextPurchaseId = state.nextPurchaseId ?? purchases.value.length + 1;
      }
    } catch (error) {
      console.error("Erro ao carregar do localStorage:", error);
      toast.add({
        title: "Erro ao carregar",
        description: "Não foi possível carregar os dados salvos",
        icon: "i-heroicons-exclamation-triangle",
        color: "warning",
      });
    }
  }

  function clearAll() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      participants.value = [
        { id: 1, name: "", coversCount: 1 },
        { id: 2, name: "", coversCount: 1 },
      ];
      purchases.value = [
        { id: 1, description: "", amount: 0, paidById: 1 },
      ];
      nextParticipantId = 3;
      nextPurchaseId = 2;
      toast.add({
        title: "Dados limpos",
        description: "Todos os dados foram removidos",
        icon: "i-heroicons-check-circle",
        color: "success",
      });
    } catch (error) {
      console.error("Erro ao limpar localStorage:", error);
    }
  }

  /* ---------- Watch auto-save ---------- */

  watch([participants, purchases], () => saveToLocalStorage(), { deep: true });

  /* ---------- Participantes ---------- */

  function addParticipant() {
    participants.value.push({ id: nextParticipantId++, name: "", coversCount: 1 });
    saveToLocalStorage();
  }

  function removeParticipant(id: number) {
    if (participants.value.length <= 1) {
      toast.add({
        title: "Atenção",
        description: "É necessário ter pelo menos 1 participante",
        icon: "i-heroicons-exclamation-triangle",
        color: "warning",
      });
      return;
    }
    participants.value = participants.value.filter((p) => p.id !== id);
    // Reatribuir compras cujo pagador foi removido para o primeiro participante restante
    const fallbackId = participants.value[0]?.id ?? -1;
    purchases.value = purchases.value.map((pu) =>
      pu.paidById === id ? { ...pu, paidById: fallbackId } : pu
    );
    saveToLocalStorage();
  }

  /* ---------- Compras ---------- */

  function addPurchase() {
    const defaultPayer = participants.value[0]?.id ?? 1;
    purchases.value.push({
      id: nextPurchaseId++,
      description: "",
      amount: 0,
      paidById: defaultPayer,
    });
    saveToLocalStorage();
  }

  function removePurchase(id: number) {
    if (purchases.value.length <= 1) {
      toast.add({
        title: "Atenção",
        description: "É necessário ter pelo menos 1 compra",
        icon: "i-heroicons-exclamation-triangle",
        color: "warning",
      });
      return;
    }
    purchases.value = purchases.value.filter((p) => p.id !== id);
    saveToLocalStorage();
  }

  /* ---------- Cálculos ---------- */

  const totalAmount = computed(() =>
    purchases.value.reduce((sum, p) => sum + (p.amount || 0), 0)
  );

  const totalParticipants = computed(() => participants.value.length);

  /**
   * Total de "cotas" = soma dos coversCount de todos os participantes.
   * Ex: André (3) + Gabriel (6) = 9 cotas.
   */
  const totalUnits = computed(() =>
    participants.value.reduce((sum, p) => sum + Math.max(p.coversCount || 1, 1), 0)
  );

  /** Custo por cota = totalAmount / totalUnits */
  const costPerUnit = computed(() =>
    totalUnits.value > 0 ? totalAmount.value / totalUnits.value : 0
  );

  /** Valor justo por participante individual (1 cota) — usado no card de resumo */
  const fairAmountPerPerson = computed(() => costPerUnit.value);

  const results = computed<ParticipantResult[]>(() => {
    return participants.value.map((participant) => {
      // Quanto esse participante pagou (soma de todas as compras onde ele é pagador)
      const totalPaid = purchases.value
        .filter((p) => p.paidById === participant.id)
        .reduce((sum, p) => sum + (p.amount || 0), 0);

      // Quanto ele deveria pagar = custo por cota × suas cotas
      const units = Math.max(participant.coversCount || 1, 1);
      const shouldPay = costPerUnit.value * units;

      const difference = totalPaid - shouldPay;

      return {
        participant,
        totalPaid,
        shouldPay,
        difference,
        status:
          difference > 0.01
            ? "receive"
            : difference < -0.01
              ? "pay"
              : "even",
      };
    });
  });

  /* ---------- Transferências sugeridas ---------- */

  const suggestedTransfers = computed<Transfer[]>(() => {
    const payers = results.value
      .filter((r) => r.status === "pay")
      .map((r) => ({ name: r.participant.name || "Sem nome", amount: Math.abs(r.difference) }))
      .sort((a, b) => b.amount - a.amount);

    const receivers = results.value
      .filter((r) => r.status === "receive")
      .map((r) => ({ name: r.participant.name || "Sem nome", amount: Math.abs(r.difference) }))
      .sort((a, b) => b.amount - a.amount);

    const transfers: Transfer[] = [];
    const payersCopy = payers.map((p) => ({ ...p }));
    const receiversCopy = receivers.map((r) => ({ ...r }));

    let i = 0;
    let j = 0;
    while (i < payersCopy.length && j < receiversCopy.length) {
      const payer = payersCopy[i];
      const receiver = receiversCopy[j];
      if (!payer || !receiver) break;

      const transferAmount = Math.min(payer.amount, receiver.amount);
      if (transferAmount > 0.01) {
        transfers.push({ from: payer.name, to: receiver.name, amount: transferAmount });
      }

      payer.amount -= transferAmount;
      receiver.amount -= transferAmount;

      if (payer.amount < 0.01) i++;
      if (receiver.amount < 0.01) j++;
    }

    return transfers;
  });

  /* ---------- Copiar resumo ---------- */

  function copyResults() {
    const lines = results.value.map((r) => {
      const name = r.participant.name || "Sem nome";
      if (r.status === "even") return `${name}: Quitado`;
      if (r.status === "receive")
        return `${name}: Deve receber R$ ${Math.abs(r.difference).toFixed(2)}`;
      return `${name}: Deve pagar R$ ${Math.abs(r.difference).toFixed(2)}`;
    });

    let transfersText = "";
    if (suggestedTransfers.value.length > 0) {
      transfersText =
        "\n\nSugestão de Transferências:\n" +
        suggestedTransfers.value
          .map((t, i) => `${i + 1}. ${t.from} → ${t.to}: R$ ${t.amount.toFixed(2)}`)
          .join("\n");
    }

    const summary =
      `Divisão de Gastos em Grupo\n\n` +
      `Participantes: ${totalParticipants.value} (${totalUnits.value} pessoas no total)\n` +
      `Total gasto: R$ ${totalAmount.value.toFixed(2)}\n` +
      `Custo por pessoa: R$ ${costPerUnit.value.toFixed(2)}\n\n` +
      `Acerto de contas:\n${lines.join("\n")}${transfersText}`;

    navigator.clipboard.writeText(summary);
    toast.add({
      title: "Copiado!",
      description: "Resumo copiado para a área de transferência",
      icon: "i-heroicons-check-circle",
      color: "success",
    });
  }

  /* ---------- Helpers de UI ---------- */

  function getStatusColor(status: string) {
    if (status === "receive") return "text-green-600 dark:text-green-400";
    if (status === "pay") return "text-red-600 dark:text-red-400";
    return "text-gray-500 dark:text-gray-400";
  }

  function getCardClass(status: string) {
    if (status === "receive")
      return "bg-green-50 dark:bg-green-950/20 border-green-300 dark:border-green-800";
    if (status === "pay")
      return "bg-red-50 dark:bg-red-950/20 border-red-300 dark:border-red-800";
    return "bg-gray-50 dark:bg-gray-950/20 border-gray-300 dark:border-gray-800";
  }

  function getStatusIcon(status: string) {
    if (status === "receive") return "i-heroicons-arrow-down-circle";
    if (status === "pay") return "i-heroicons-arrow-up-circle";
    return "i-heroicons-check-circle";
  }

  function getStatusText(status: string, difference: number) {
    if (status === "even") return "Quitado";
    if (status === "receive") return `Deve receber R$ ${Math.abs(difference).toFixed(2)}`;
    return `Deve pagar R$ ${Math.abs(difference).toFixed(2)}`;
  }

  function participantName(id: number) {
    return participants.value.find((p) => p.id === id)?.name || "Sem nome";
  }

  /* ---------- Exposição ---------- */

  return {
    // Estado
    participants,
    purchases,
    // Ações — participantes
    addParticipant,
    removeParticipant,
    // Ações — compras
    addPurchase,
    removePurchase,
    // Ações — geral
    loadFromLocalStorage,
    clearAll,
    copyResults,
    // Computados
    totalAmount,
    totalParticipants,
    totalUnits,
    costPerUnit,
    fairAmountPerPerson,
    results,
    suggestedTransfers,
    // Helpers de UI
    getStatusColor,
    getCardClass,
    getStatusIcon,
    getStatusText,
    participantName,
  };
}
