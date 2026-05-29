import { useEffect, useRef, useState } from "react";
import { Building2, Upload, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LiquidGlassCard } from "@/components/ui/liquid-glass";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface ClinicProfile {
  documento: string;
  razaoSocial: string;
  nome: string;
  telefone: string;
  cep: string;
  rua: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
}

const STORAGE_KEY = "clinic_profile";
const LOGO_KEY = "clinic_logo";
const NAME_KEY = "clinic_name";
const MAX_LOGO_SIZE = 10 * 1024 * 1024;

const ESTADOS = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];

const empty: ClinicProfile = {
  documento: "", razaoSocial: "", nome: "", telefone: "",
  cep: "", rua: "", numero: "", complemento: "", bairro: "", cidade: "", estado: "",
};

const maskCnpjCpf = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 14);
  if (d.length <= 11) {
    return d
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }
  return d
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
};

const maskTelefone = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 10) return d.replace(/(\d{2})(\d{4})(\d)/, "($1) $2-$3");
  return d.replace(/(\d{2})(\d{5})(\d)/, "($1) $2-$3");
};

const maskCep = (v: string) => v.replace(/\D/g, "").slice(0, 8).replace(/(\d{5})(\d)/, "$1-$2");

const PerfilConsultorio = () => {
  const [profile, setProfile] = useState<ClinicProfile>(empty);
  const [logo, setLogo] = useState<string | null>(() => localStorage.getItem(LOGO_KEY));
  const [loadingCep, setLoadingCep] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try { setProfile({ ...empty, ...JSON.parse(raw) }); } catch {}
    } else {
      const nome = localStorage.getItem(NAME_KEY) || "";
      setProfile((p) => ({ ...p, nome }));
    }
  }, []);

  const update = <K extends keyof ClinicProfile>(k: K, v: ClinicProfile[K]) =>
    setProfile((p) => ({ ...p, [k]: v }));

  const handleCepBlur = async () => {
    const d = profile.cep.replace(/\D/g, "");
    if (d.length !== 8) return;
    setLoadingCep(true);
    try {
      const r = await fetch(`https://viacep.com.br/ws/${d}/json/`);
      const data = await r.json();
      if (data.erro) { toast.error("CEP não encontrado."); return; }
      setProfile((p) => ({
        ...p,
        rua: data.logradouro || p.rua,
        bairro: data.bairro || p.bairro,
        cidade: data.localidade || p.cidade,
        estado: data.uf || p.estado,
        complemento: data.complemento || p.complemento,
      }));
    } catch {
      toast.error("Falha ao buscar CEP.");
    } finally {
      setLoadingCep(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
      toast.error("Apenas arquivos JPG ou PNG.");
      e.target.value = ""; return;
    }
    if (file.size > MAX_LOGO_SIZE) {
      toast.error("Logo deve ter no máximo 10MB.");
      e.target.value = ""; return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      setLogo(url);
      localStorage.setItem(LOGO_KEY, url);
      toast.success("Logo atualizado.");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleRemoveLogo = () => {
    setLogo(null);
    localStorage.removeItem(LOGO_KEY);
  };

  const handleSave = () => {
    if (!profile.nome.trim()) {
      toast.error("Informe o nome da clínica.");
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    localStorage.setItem(NAME_KEY, profile.nome.trim());
    toast.success("Perfil do consultório salvo.");
  };

  return (
    <LiquidGlassCard draggable={false} className="p-5 lg:col-span-2">
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Building2 className="w-4.5 h-4.5 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Perfil do Consultório</h2>
            <p className="text-xs text-muted-foreground">Informações da clínica</p>
          </div>
        </div>

        {/* Logo */}
        <div className="flex items-center gap-4 p-3 rounded-lg bg-white/5">
          <div className="w-16 h-16 rounded-md bg-white flex items-center justify-center overflow-hidden shrink-0">
            {logo ? (
              <img src={logo} alt="Logo da clínica" className="w-full h-full object-cover" />
            ) : (
              <Building2 className="w-6 h-6 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">Logo da clínica</p>
            <p className="text-xs text-muted-foreground">JPG ou PNG, máximo 10MB.</p>
            <div className="flex gap-2 mt-2">
              <Button size="sm" variant="outline" className="gap-1.5" onClick={() => fileRef.current?.click()}>
                <Upload className="w-3.5 h-3.5" /> Enviar
              </Button>
              {logo && (
                <Button size="sm" variant="ghost" className="gap-1.5 text-destructive" onClick={handleRemoveLogo}>
                  <Trash2 className="w-3.5 h-3.5" /> Remover
                </Button>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/jpg"
              className="hidden"
              onChange={handleLogoUpload}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>CNPJ / CPF</Label>
            <Input
              value={profile.documento}
              onChange={(e) => update("documento", maskCnpjCpf(e.target.value))}
              placeholder="00.000.000/0000-00"
              maxLength={18}
            />
          </div>
          <div className="space-y-2">
            <Label>Razão social</Label>
            <Input value={profile.razaoSocial} onChange={(e) => update("razaoSocial", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Nome da clínica</Label>
            <Input value={profile.nome} onChange={(e) => update("nome", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Telefone</Label>
            <Input
              value={profile.telefone}
              onChange={(e) => update("telefone", maskTelefone(e.target.value))}
              placeholder="(00) 00000-0000"
              maxLength={15}
            />
          </div>
          <div className="space-y-2">
            <Label>CEP</Label>
            <Input
              value={profile.cep}
              onChange={(e) => update("cep", maskCep(e.target.value))}
              onBlur={handleCepBlur}
              placeholder="00000-000"
              maxLength={9}
            />
            {loadingCep && <p className="text-xs text-muted-foreground">Buscando endereço...</p>}
          </div>
          <div className="space-y-2 md:col-span-1">
            <Label>Rua</Label>
            <Input value={profile.rua} onChange={(e) => update("rua", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Número</Label>
            <Input value={profile.numero} onChange={(e) => update("numero", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Complemento</Label>
            <Input value={profile.complemento} onChange={(e) => update("complemento", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Bairro</Label>
            <Input value={profile.bairro} onChange={(e) => update("bairro", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Cidade</Label>
            <Input value={profile.cidade} onChange={(e) => update("cidade", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Estado</Label>
            <Select value={profile.estado} onValueChange={(v) => update("estado", v)}>
              <SelectTrigger><SelectValue placeholder="UF" /></SelectTrigger>
              <SelectContent>
                {ESTADOS.map((uf) => <SelectItem key={uf} value={uf}>{uf}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave}>Salvar perfil</Button>
        </div>
      </div>
    </LiquidGlassCard>
  );
};

export default PerfilConsultorio;
