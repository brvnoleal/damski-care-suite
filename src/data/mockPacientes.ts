import { Paciente } from "@/types";

export const mockPacientes: Paciente[] = [
  { id: "1", nome: "Maria Silva", cpf: "123.456.789-12", telefone: "(11) 99999-1234", email: "maria@email.com", data_nascimento: "1985-03-15", status: "ativo" },
  { id: "2", nome: "João Oliveira", cpf: "234.567.890-45", telefone: "(11) 98888-5678", email: "joao@email.com", data_nascimento: "1990-07-22", status: "ativo" },
  { id: "3", nome: "Ana Costa", cpf: "345.678.901-78", telefone: "(11) 97777-9012", email: "ana@email.com", data_nascimento: "1978-11-08", status: "ativo" },
  { id: "4", nome: "Pedro Santos", cpf: "456.789.012-23", telefone: "(11) 96666-3456", email: "pedro@email.com", data_nascimento: "1995-01-30", status: "ativo" },
  { id: "5", nome: "Carla Dias", cpf: "567.890.123-56", telefone: "(11) 95555-7890", email: "carla@email.com", data_nascimento: "1988-09-14", status: "inativo" },
  { id: "6", nome: "Lucas Mendes", cpf: "678.901.234-89", telefone: "(11) 94444-2345", email: "lucas@email.com", data_nascimento: "1992-05-20", status: "ativo" },
];
