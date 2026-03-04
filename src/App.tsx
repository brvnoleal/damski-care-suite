import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import Dashboard from "./pages/Dashboard";
import Pacientes from "./pages/Pacientes";
import PacienteDetalhe from "./pages/PacienteDetalhe";
import Dentistas from "./pages/Dentistas";
import Agendamentos from "./pages/Agendamentos";

import Insumos from "./pages/Insumos";
import Financeiro from "./pages/Financeiro";

import Configuracoes from "./pages/Configuracoes";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route
            path="/*"
            element={
              <AppLayout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/pacientes" element={<Pacientes />} />
                  <Route path="/pacientes/:id" element={<PacienteDetalhe />} />
                  <Route path="/dentistas" element={<Dentistas />} />
                  <Route path="/agendamentos" element={<Agendamentos />} />
                  
                  <Route path="/insumos" element={<Insumos />} />
                  <Route path="/financeiro" element={<Financeiro />} />
                  <Route path="/fiscalizacao" element={<Fiscalizacao />} />
                  <Route path="/configuracoes" element={<Configuracoes />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AppLayout>
            }
          />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
