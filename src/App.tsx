import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Pacientes from "./pages/Pacientes";
import PacienteDetalhe from "./pages/PacienteDetalhe";
import Agenda from "./pages/Agenda";
import Dentistas from "./pages/Dentistas";
import Agendamentos from "./pages/Agendamentos";
import Insumos from "./pages/Insumos";
import Financeiro from "./pages/Financeiro";
import Configuracoes from "./pages/Configuracoes";
import Procedimentos from "./pages/Procedimentos";
import Documentos from "./pages/Documentos";
import SuperAdmin from "./pages/SuperAdmin";
import Login from "./pages/Login";
import EsqueciSenha from "./pages/EsqueciSenha";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import AnamnesePublica from "./pages/AnamnesePublica";
import DocumentoAssinar from "./pages/DocumentoAssinar";
import Confianca from "./pages/Confianca";

const queryClient = new QueryClient();

const App = () => {

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/esqueci-senha" element={<EsqueciSenha />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/anamnese/:clinicaId" element={<AnamnesePublica />} />
            <Route path="/anamnese/t/:token" element={<AnamnesePublica />} />
            <Route path="/d/:token" element={<DocumentoAssinar />} />
            <Route path="/confianca" element={<Confianca />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/pacientes" element={<Pacientes />} />
                      <Route path="/pacientes/:id" element={<PacienteDetalhe />} />
                      <Route path="/agenda" element={<Agenda />} />
                      <Route path="/dentistas" element={<Dentistas />} />
                      <Route path="/agendamentos" element={<Agendamentos />} />
                      <Route path="/insumos" element={<Insumos />} />
                      <Route path="/financeiro" element={<Financeiro />} />
                      <Route path="/procedimentos" element={<Procedimentos />} />
                      <Route path="/documentos" element={<Documentos />} />
                      <Route path="/configuracoes" element={<Configuracoes />} />
                      <Route path="/super-admin" element={<SuperAdmin />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </AppLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
