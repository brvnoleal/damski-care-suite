import { Dentista } from "@/types";

export const mockDentistas: Dentista[] = [
  { id: "1", nome: "Dra. Amanda Damski", especialidade: "Harmonização Orofacial", cro: "CRO-SP 12345", telefone: "(11) 99000-1111", email: "amanda@damski.com", status: "ativo" },
  { id: "2", nome: "Dr. Ricardo Ferreira", especialidade: "Ortodontia", cro: "CRO-SP 23456", telefone: "(11) 99000-2222", email: "ricardo@damski.com", status: "ativo" },
  { id: "3", nome: "Dra. Beatriz Lima", especialidade: "Endodontia", cro: "CRO-SP 34567", telefone: "(11) 99000-3333", email: "beatriz@damski.com", status: "ativo" },
  { id: "4", nome: "Dr. Carlos Mendes", especialidade: "Implantodontia", cro: "CRO-SP 45678", telefone: "(11) 99000-4444", email: "carlos@damski.com", status: "inativo" },
];
