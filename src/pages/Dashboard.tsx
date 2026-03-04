import { Users, Calendar, Package, FileCheck, Activity } from "lucide-react";
import StatCard from "@/components/StatCard";
import AlertCard from "@/components/AlertCard";

const Dashboard = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Visão geral da clínica — Damski Odonto
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Pacientes Ativos"
          value={148}
          icon={Users}
          trend={{ value: "+12 este mês", positive: true }}
        />

        <StatCard
          title="Sessões Hoje"
          value={8}
          subtitle="3 concluídas"
          icon={Calendar}
          variant="gold"
        />

        <StatCard
          title="Pendentes de Assinatura"
          value={5}
          subtitle="Últimos 7 dias"
          icon={FileCheck}
          variant="warning"
        />

        <StatCard
          title="Insumos Críticos"
          value={3}
          subtitle="Vencimento próximo"
          icon={Package}
          variant="warning"
        />
      </div>

    </div>
  );
};

export default Dashboard;
