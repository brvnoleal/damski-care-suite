import { ANAMNESE_BLOCOS, AnamneseField } from "@/lib/anamnese";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type AnamneseValues = Record<string, any>;

interface Props {
  values: AnamneseValues;
  onChange: (next: AnamneseValues) => void;
  readOnly?: boolean;
}

const FieldRenderer = ({ field, value, onSet, readOnly }: { field: AnamneseField; value: any; onSet: (v: any) => void; readOnly?: boolean }) => {
  if (field.type === "text") {
    return <Input value={value ?? ""} onChange={(e) => onSet(e.target.value)} placeholder={field.placeholder} disabled={readOnly} />;
  }
  if (field.type === "textarea") {
    return <Textarea value={value ?? ""} onChange={(e) => onSet(e.target.value)} placeholder={field.placeholder} disabled={readOnly} rows={3} />;
  }
  if (field.type === "boolean") {
    const v = value === true ? "sim" : value === false ? "nao" : "";
    return (
      <RadioGroup
        className="flex gap-4"
        value={v}
        onValueChange={(val) => onSet(val === "sim")}
        disabled={readOnly}
      >
        <div className="flex items-center gap-2">
          <RadioGroupItem value="sim" id={`${field.key}-sim`} />
          <Label htmlFor={`${field.key}-sim`} className="text-sm font-normal">Sim</Label>
        </div>
        <div className="flex items-center gap-2">
          <RadioGroupItem value="nao" id={`${field.key}-nao`} />
          <Label htmlFor={`${field.key}-nao`} className="text-sm font-normal">Não</Label>
        </div>
      </RadioGroup>
    );
  }
  if (field.type === "boolean_detalhe") {
    const obj = (value ?? {}) as { sim?: boolean; detalhe?: string };
    return (
      <div className="space-y-2">
        <RadioGroup
          className="flex gap-4"
          value={obj.sim === true ? "sim" : obj.sim === false ? "nao" : ""}
          onValueChange={(val) => onSet({ ...obj, sim: val === "sim" })}
          disabled={readOnly}
        >
          <div className="flex items-center gap-2">
            <RadioGroupItem value="sim" id={`${field.key}-sim`} />
            <Label htmlFor={`${field.key}-sim`} className="text-sm font-normal">Sim</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="nao" id={`${field.key}-nao`} />
            <Label htmlFor={`${field.key}-nao`} className="text-sm font-normal">Não</Label>
          </div>
        </RadioGroup>
        {obj.sim && (
          <Textarea
            value={obj.detalhe ?? ""}
            onChange={(e) => onSet({ ...obj, detalhe: e.target.value })}
            placeholder={field.placeholder ?? "Detalhe"}
            rows={2}
            disabled={readOnly}
          />
        )}
      </div>
    );
  }
  if (field.type === "select") {
    return (
      <Select value={value ?? ""} onValueChange={onSet} disabled={readOnly}>
        <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
        <SelectContent>
          {(field.options || []).map((opt) => (
            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }
  return null;
};

export const AnamneseFormFields = ({ values, onChange, readOnly }: Props) => {
  const setField = (bloco: string, key: string, v: any) => {
    const next = { ...values, [bloco]: { ...(values[bloco] || {}), [key]: v } };
    onChange(next);
  };

  return (
    <div className="space-y-8">
      {ANAMNESE_BLOCOS.map((bloco) => (
        <section key={bloco.key} className="space-y-4">
          <header className="space-y-1">
            <h3 className="text-lg font-semibold text-foreground">{bloco.titulo}</h3>
            {bloco.descricao && <p className="text-xs text-muted-foreground">{bloco.descricao}</p>}
          </header>
          <div className="space-y-4">
            {bloco.campos.map((field) => (
              <div key={field.key} className="space-y-2">
                <Label className="text-sm">
                  {field.label}
                  {field.required && <span className="text-destructive ml-1">*</span>}
                </Label>
                <FieldRenderer
                  field={field}
                  value={(values[bloco.key] || {})[field.key]}
                  onSet={(v) => setField(bloco.key, field.key, v)}
                  readOnly={readOnly}
                />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};
