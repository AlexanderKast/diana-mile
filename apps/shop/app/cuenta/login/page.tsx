"use client";

import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@diana-mile/shared/supabase/client";
import { Button } from "@diana-mile/shared/ui/Button";
import { Input } from "@diana-mile/shared/ui/Input";
import { Spinner } from "@diana-mile/shared/ui/Spinner";
import { normalizeColombianMobile } from "@/lib/phone";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/cuenta";

  const [paso, setPaso] = useState<"celular" | "codigo">("celular");
  const [celular, setCelular] = useState("");
  const [codigo, setCodigo] = useState("");
  const [telefonoE164, setTelefonoE164] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function enviarCodigo(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const normalizado = normalizeColombianMobile(celular);
    if (!normalizado) {
      setError("Ingresa un celular colombiano valido (ej. 300 123 4567).");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: otpError } = await supabase.auth.signInWithOtp({
      phone: normalizado.e164,
      options: { channel: "whatsapp" },
    });
    setLoading(false);

    if (otpError) {
      setError("No pudimos enviar el codigo. Intenta de nuevo.");
      return;
    }

    setTelefonoE164(normalizado.e164);
    setPaso("codigo");
  }

  async function confirmarCodigo(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: verifyError } = await supabase.auth.verifyOtp({
      phone: telefonoE164,
      token: codigo,
      type: "sms",
    });

    setLoading(false);

    if (verifyError) {
      setError("Codigo incorrecto o vencido.");
      return;
    }

    router.push(next);
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-crema px-6">
      <div className="w-full max-w-sm animate-fade-in-up">
        <p className="text-center font-display text-3xl text-carbon mb-2">
          Mi cuenta
        </p>
        <p className="text-center text-sm text-carbon-suave mb-8">
          Milito Life Shop
        </p>

        <div className="bg-blanco border border-arena rounded-2xl p-6 shadow-[0_1px_3px_rgba(26,23,20,0.08)]">
          {paso === "celular" ? (
            <form onSubmit={enviarCodigo} className="flex flex-col gap-5">
              <p className="text-sm text-carbon-suave">
                Ingresa tu celular y te enviamos un código por WhatsApp.
              </p>
              <Input
                label="Celular"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                placeholder="300 123 4567"
                value={celular}
                onChange={(e) => setCelular(e.target.value)}
                required
              />
              {error && (
                <p className="text-xs text-error" role="alert">
                  {error}
                </p>
              )}
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={loading}
              >
                {loading && <Spinner />}
                {loading ? "Enviando..." : "Enviar código"}
              </Button>
            </form>
          ) : (
            <form onSubmit={confirmarCodigo} className="flex flex-col gap-5">
              <p className="text-sm text-carbon-suave">
                Te enviamos un código por WhatsApp al{" "}
                <span className="font-semibold text-carbon">
                  {telefonoE164}
                </span>
                .
              </p>
              <Input
                label="Código de 6 dígitos"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                required
              />
              {error && (
                <p className="text-xs text-error" role="alert">
                  {error}
                </p>
              )}
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={loading}
              >
                {loading && <Spinner />}
                {loading ? "Verificando..." : "Confirmar código"}
              </Button>
              <button
                type="button"
                onClick={() => setPaso("celular")}
                className="text-xs text-ceniza underline"
              >
                Cambiar número de celular
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
