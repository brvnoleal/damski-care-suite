import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import logo from "@/assets/cloudsmile-logo.png.asset.json";
import loginAnimation from "@/assets/login.mp4.asset.json";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate("/", { replace: true });
    });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    navigate("/", { replace: true });
  };

  return (
    <main className="min-h-screen grid lg:grid-cols-2 bg-background">
      <Helmet>
        <title>Entrar — CloudSmile</title>
        <meta name="description" content="Acesse o CloudSmile, o sistema de gestão para clínicas odontológicas. Entre com seu e-mail e senha para gerenciar sua clínica." />
        <link rel="canonical" href="https://cloudsmile.com.br/login" />
        <meta property="og:title" content="Entrar — CloudSmile" />
        <meta property="og:description" content="Acesse o CloudSmile, o sistema de gestão para clínicas odontológicas." />
        <meta property="og:url" content="https://cloudsmile.com.br/login" />
      </Helmet>
      <section className="hidden lg:flex items-center justify-center p-10 bg-background">
        <div className="flex flex-col items-center text-center max-w-md">
          <video
            src={loginAnimation.url}
            autoPlay
            loop
            muted
            playsInline
            aria-label="CloudSmile - Sistema de gestão para clínicas odontológicas"
            className="w-full max-w-sm h-auto"
          />
          <p className="mt-6 text-muted-foreground">
            Gestão inteligente para a sua clínica odontológica.
          </p>
        </div>
      </section>

      <section className="flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex justify-center lg:hidden mb-4">
              <img src={logo.url} alt="CloudSmile" className="h-16 w-auto" />
            </div>
            <CardTitle>Acessar o sistema</CardTitle>
            <CardDescription>Entre com seu e-mail e senha</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Senha</Label>
                  <Link to="/esqueci-senha" className="text-xs text-primary hover:underline">
                    Esqueci minha senha
                  </Link>
                </div>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Entrando..." : "Entrar"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
