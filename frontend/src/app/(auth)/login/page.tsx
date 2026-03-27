"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Bot, ShieldCheck, Sparkles } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getErrorMessage } from "@/lib/errors";
import { loginSchema, type LoginSchema } from "@/lib/validations/auth";

export default function LoginPage() {
  const { login, loading } = useAuth();
  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" }
  });

  return (
    <div className="grid min-h-screen bg-black lg:grid-cols-[1.1fr_0.9fr]">
      <div className="auth-hero relative hidden overflow-hidden p-12 text-slate-100 lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_18%,rgba(34,211,238,0.14),transparent_24%),radial-gradient(circle_at_78%_76%,rgba(16,185,129,0.1),transparent_26%)]" />

        <div className="relative max-w-2xl space-y-10">
          <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-medium text-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.28)] backdrop-blur">
            <Sparkles className="h-4 w-4 text-cyan-300" />
            Plataforma SaaS de atendimento inteligente
          </div>

          <div className="space-y-6">
            <h1 className="max-w-2xl text-5xl font-semibold leading-[1.02] tracking-[-0.05em] xl:text-6xl">
              Operacao de WhatsApp com presenca visual premium.
            </h1>
            <p className="max-w-xl text-lg leading-8 text-slate-400">
              Um painel escuro, elegante e direto para administrar atendimento, automacao e operacao em padrao de
              produto SaaS serio.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="glass-stroke rounded-[1.75rem] border border-white/10 bg-white/[0.05] p-6 backdrop-blur">
              <Bot className="h-5 w-5 text-cyan-300" />
              <p className="mt-5 text-base font-semibold tracking-[-0.02em] text-white">Inbox operacional</p>
              <p className="mt-2 text-sm leading-7 text-slate-400">
                Controle conversas, bot, handoff e mensagens manuais com uma experiencia de helpdesk mais madura.
              </p>
            </div>

            <div className="glass-stroke rounded-[1.75rem] border border-white/10 bg-white/[0.05] p-6 backdrop-blur">
              <ShieldCheck className="h-5 w-5 text-emerald-300" />
              <p className="mt-5 text-base font-semibold tracking-[-0.02em] text-white">Sessao protegida</p>
              <p className="mt-2 text-sm leading-7 text-slate-400">
                Acesso privado, rotas protegidas e fluxo pronto para operacao real de uma plataforma multiempresa.
              </p>
            </div>
          </div>
        </div>

        <div className="glass-stroke relative rounded-[1.9rem] border border-white/10 bg-white/[0.05] p-7 backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Control room</p>
          <p className="mt-3 max-w-xl text-sm leading-7 text-slate-400">
            Base pronta para escalar com multiempresa, billing, observabilidade, handoff humano e operacao assistida
            por IA.
          </p>
        </div>
      </div>

      <div className="relative flex items-center justify-center p-6 md:p-10 lg:p-14">
        <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.14),transparent_58%)]" />

        <Card className="glass-stroke relative w-full max-w-[31rem] border-white/10 bg-black/70 backdrop-blur-2xl">
          <CardHeader className="space-y-4 pb-2">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Acesso seguro
            </div>

            <div className="space-y-2">
              <CardTitle className="text-3xl font-semibold tracking-[-0.04em] text-white">Entrar no painel</CardTitle>
              <CardDescription className="text-sm leading-7 text-slate-500">
                Entre com seu e-mail e senha para acessar a operacao da empresa ou a camada administrativa da
                plataforma.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <form
              className="space-y-5"
              onSubmit={form.handleSubmit(async (values) => {
                try {
                  await login(values);
                  toast.success("Login realizado com sucesso");
                } catch (error) {
                  toast.error(getErrorMessage(error, "Falha ao entrar"));
                }
              })}
            >
              <div className="space-y-2.5">
                <Label htmlFor="email">E-mail corporativo</Label>
                <Input autoComplete="email" id="email" placeholder="admin@empresa.com" {...form.register("email")} />
                {form.formState.errors.email ? (
                  <p className="text-xs font-medium text-rose-400">{form.formState.errors.email.message}</p>
                ) : null}
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="password">Senha</Label>
                <Input
                  autoComplete="current-password"
                  id="password"
                  type="password"
                  placeholder="Digite sua senha"
                  {...form.register("password")}
                />
                {form.formState.errors.password ? (
                  <p className="text-xs font-medium text-rose-400">{form.formState.errors.password.message}</p>
                ) : null}
              </div>

              <Button className="h-12 w-full text-sm font-semibold" disabled={loading} type="submit">
                {loading ? "Entrando..." : "Entrar no painel"}
                {!loading ? <ArrowRight className="h-4 w-4" /> : null}
              </Button>
            </form>

            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-sm leading-7 text-slate-500">
              O sistema adapta a experiencia conforme seu perfil, mantendo a area tecnica separada da operacao diaria.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
