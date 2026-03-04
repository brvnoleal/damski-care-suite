import { Agendamento } from "@/types";

export const mockAgendamentos: Agendamento[] = [
  { id: "1", data: "2026-03-04", horario: "09:00", paciente_id: "1", dentista_id: "1", status: "confirmado" },
  { id: "2", data: "2026-03-04", horario: "10:30", paciente_id: "3", dentista_id: "1", status: "agendado" },
  { id: "3", data: "2026-03-04", horario: "14:00", paciente_id: "4", dentista_id: "2", status: "agendado" },
  { id: "4", data: "2026-03-05", horario: "08:30", paciente_id: "2", dentista_id: "1", status: "agendado" },
  { id: "5", data: "2026-03-05", horario: "11:00", paciente_id: "6", dentista_id: "3", status: "confirmado" },
  { id: "6", data: "2026-03-03", horario: "09:00", paciente_id: "1", dentista_id: "2", status: "realizado" },
  { id: "7", data: "2026-03-02", horario: "15:00", paciente_id: "5", dentista_id: "1", status: "cancelado" },
];
