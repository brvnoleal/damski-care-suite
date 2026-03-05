import { Agendamento } from "@/types";

export const mockAgendamentos: Agendamento[] = [
  { id: "1", data: "2026-03-04", horario: "09:00", paciente_id: "1", dentista_id: "1", procedimento: "limpeza", status: "confirmado" },
  { id: "2", data: "2026-03-04", horario: "10:30", paciente_id: "3", dentista_id: "1", procedimento: "avaliacao", status: "agendado" },
  { id: "3", data: "2026-03-04", horario: "14:00", paciente_id: "4", dentista_id: "2", procedimento: "restauracao", status: "agendado" },
  { id: "4", data: "2026-03-05", horario: "08:30", paciente_id: "2", dentista_id: "1", procedimento: "retorno", status: "agendado" },
  { id: "5", data: "2026-03-05", horario: "11:00", paciente_id: "6", dentista_id: "3", procedimento: "clareamento", status: "confirmado" },
  { id: "6", data: "2026-03-03", horario: "09:00", paciente_id: "1", dentista_id: "2", procedimento: "canal", status: "realizado" },
  { id: "7", data: "2026-03-02", horario: "15:00", paciente_id: "5", dentista_id: "1", procedimento: "urgencia", status: "cancelado" },
];
