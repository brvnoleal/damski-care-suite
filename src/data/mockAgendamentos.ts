import { Agendamento } from "@/types";

export const mockAgendamentos: Agendamento[] = [
  { id: "1", data: "2026-03-04", horario: "09:00", paciente_id: "1", dentista_id: "1", procedimento: "limpeza", status: "confirmado", valor: 150, forma_pagamento: "pix", parcelas: 1 },
  { id: "2", data: "2026-03-04", horario: "10:30", paciente_id: "3", dentista_id: "1", procedimento: "avaliacao", status: "agendado", valor: 0, forma_pagamento: "dinheiro", parcelas: 1 },
  { id: "3", data: "2026-03-04", horario: "14:00", paciente_id: "4", dentista_id: "2", procedimento: "restauracao", status: "agendado", valor: 350, forma_pagamento: "credito", parcelas: 3 },
  { id: "4", data: "2026-03-05", horario: "08:30", paciente_id: "2", dentista_id: "1", procedimento: "retorno", status: "agendado", valor: 100, forma_pagamento: "debito", parcelas: 1 },
  { id: "5", data: "2026-03-05", horario: "11:00", paciente_id: "6", dentista_id: "3", procedimento: "clareamento", status: "confirmado", valor: 800, forma_pagamento: "credito", parcelas: 6 },
  { id: "6", data: "2026-03-03", horario: "09:00", paciente_id: "1", dentista_id: "2", procedimento: "canal", status: "realizado", valor: 1200, forma_pagamento: "boleto", parcelas: 4 },
  { id: "7", data: "2026-03-02", horario: "15:00", paciente_id: "5", dentista_id: "1", procedimento: "urgencia", status: "cancelado", valor: 200, forma_pagamento: "dinheiro", parcelas: 1 },
];
