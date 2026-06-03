import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useClinicaContext } from "@/hooks/useClinicaContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Building2, Plus, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Clinica {
  id: string;
  nome: string;
  cnpj: string | null;
  email: string | null;
  telefone: string | null;
  status: string;
  created_at: string;
}

const SuperAdmin = () => {
  const { isSuperAdmin, loading } = useClinicaContext();
  const [clinicas, setClinicas] = useState<Clinica[]>([]);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    clinica_nome: "",
    clinica_cnpj: "",
    clinica_email: "",
    clinica_telefone: "",
    admin_nome: "",
    admin_email: "",
    admin_cpf: "",
  });
  const [credentials, setCredentials] = useState<{ email: string; password: string } | null>(null);

  const carregar = async () => {
    const { data } = await supabase.from("clinica").select("*").order("created_at", { ascending: false });
    setClinicas((data as any) ?? []);
  };

  useEffect(() => {
    if (isSuperAdmin) carregar();
  }, [isSuperAdmin]);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin" /></div>;
  }
  if (!isSuperAdmin) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("super-admin-create-clinica", {
        body: form,
      });
      if (error) throw error;
      if ((data as any).error) throw new Error((data as any).error);
      setCredentials({ email: (data as any).admin.email, password: (data as any).admin.password });
      toast.success("Clínica criada");
      setForm({ clinica_nome: "", clinica_cnpj: "", clinica_email: "", clinica_telefone: "", admin_nome: "", admin_email: "", admin_cpf: "" });
      carregar();
    } catch (err: any) {
      toast.error(err.message || "Erro ao criar clínica");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Building2 className="w-6 h-6 text-primary" />
            Clínicas (Super Admin)
          </h1>
          <p className="text-sm text-muted-foreground">Gerencie todas as clínicas do sistema</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setCredentials(null); }}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" />Nova Clínica</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Criar nova clínica</DialogTitle></DialogHeader>
            {credentials ? (
              <div className="space-y-3">
                <p className="text-sm">Clínica criada. Senha temporária do admin:</p>
                <div className="bg-muted p-3 rounded font-mono text-sm break-all">
                  <div><strong>E-mail:</strong> {credentials.email}</div>
                  <div><strong>Senha:</strong> {credentials.password}</div>
                </div>
                <p className="text-xs text-muted-foreground">Anote agora — não será exibida novamente.</p>
                <Button onClick={() => { setOpen(false); setCredentials(null); }} className="w-full">Fechar</Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="font-medium text-sm">Dados da clínica</div>
                <div><Label>Nome *</Label><Input required value={form.clinica_nome} onChange={(e) => setForm({ ...form, clinica_nome: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-2">
                  <div><Label>CNPJ</Label><Input value={form.clinica_cnpj} onChange={(e) => setForm({ ...form, clinica_cnpj: e.target.value })} /></div>
                  <div><Label>Telefone</Label><Input value={form.clinica_telefone} onChange={(e) => setForm({ ...form, clinica_telefone: e.target.value })} /></div>
                </div>
                <div><Label>E-mail</Label><Input type="email" value={form.clinica_email} onChange={(e) => setForm({ ...form, clinica_email: e.target.value })} /></div>

                <div className="font-medium text-sm pt-2">Primeiro admin</div>
                <div><Label>Nome *</Label><Input required value={form.admin_nome} onChange={(e) => setForm({ ...form, admin_nome: e.target.value })} /></div>
                <div><Label>E-mail *</Label><Input type="email" required value={form.admin_email} onChange={(e) => setForm({ ...form, admin_email: e.target.value })} /></div>
                <div><Label>CPF *</Label><Input required value={form.admin_cpf} onChange={(e) => setForm({ ...form, admin_cpf: e.target.value })} /></div>

                <Button type="submit" disabled={submitting} className="w-full">
                  {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Criar clínica
                </Button>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clinicas.map((c) => (
          <Card key={c.id}>
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                <span className="truncate">{c.nome}</span>
                <span className={`text-xs px-2 py-0.5 rounded ${c.status === "ativa" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                  {c.status}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-1">
              {c.cnpj && <div>CNPJ: {c.cnpj}</div>}
              {c.email && <div>{c.email}</div>}
              {c.telefone && <div>{c.telefone}</div>}
            </CardContent>
          </Card>
        ))}
        {clinicas.length === 0 && (
          <div className="col-span-full text-center text-muted-foreground py-8">Nenhuma clínica cadastrada.</div>
        )}
      </div>
    </div>
  );
};

export default SuperAdmin;
