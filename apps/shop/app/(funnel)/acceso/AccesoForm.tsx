"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@diana-mile/shared/ui/Input";
import { Button } from "@diana-mile/shared/ui/Button";
import { Spinner } from "@diana-mile/shared/ui/Spinner";

/**
 * Formulario de captura del panel pre-venta: nombre + email + telefono
 * opcional, a cambio del plan personal armado por el diagnostico. Tratado
 * como el checkout (ver instrucciones de la tarea): un solo campo con
 * fricción de más y la persona se va sin dejar el dato.
 *
 * Todo el layout (logo, fondo, ocultar header/footer del sitio) viene de
 * app/(funnel)/layout.tsx — este componente solo pone el formulario.
 */
export function AccesoForm({
  quizRespuestaId,
  errorInicial,
}: {
  quizRespuestaId: string | null;
  errorInicial: string | null;
}) {
  const router = useRouter();

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(errorInicial ?? "");
  // Cuenta existente con celular: /api/acceso mando un codigo por WhatsApp
  // y el formulario cambia a la pantalla de ingresarlo (ultimos 4 digitos
  // como pista). null = formulario normal.
  const [otpPista, setOtpPista] = useState<string | null>(null);
  const [codigoOtp, setCodigoOtp] = useState("");

  async function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!nombre.trim()) {
      setError("Contanos tu nombre.");
      return;
    }
    if (!email.trim()) {
      setError("Ingresa tu email.");
      return;
    }

    setEnviando(true);
    try {
      const res = await fetch("/api/acceso", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizRespuestaId,
          nombre: nombre.trim(),
          email: email.trim(),
          telefono: telefono.trim() || undefined,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.mensaje ?? "No pudimos guardar tus datos. Intenta de nuevo.");
        setEnviando(false);
        return;
      }

      if (data?.requiereOtp) {
        // Cuenta existente con celular: el codigo ya va en camino por
        // WhatsApp — se muestra la pantalla de ingresarlo, sin salir de aca.
        setOtpPista(data.telefonoPista ?? "");
        setEnviando(false);
      } else if (data?.requiereConfirmacion) {
        // Ese email ya tenia cuenta y no hay celular para el OTP — por
        // seguridad, /api/acceso NO emite cookie inmediata (solo el dueño
        // real puede confirmar clickeando el link que le llega a SU correo).
        router.push(`/acceso/revisa-correo?email=${encodeURIComponent(email.trim())}`);
      } else {
        // Cuenta nueva: /api/acceso ya dejo la cookie de sesion propia en la
        // respuesta, sin esperar a que confirme el correo (ver
        // lib/mi-plan-token.ts). El link magico igual le llega, por si otro
        // dia quiere entrar desde otro celular.
        router.push("/mi-plan");
      }
      // No se apaga `enviando` en el caso exitoso: la pantalla cambia via
      // router.push, y dejar el boton en estado de carga evita un doble
      // envio si la navegacion tarda un instante.
    } catch {
      setError("No pudimos conectar. Revisa tu internet e intenta de nuevo.");
      setEnviando(false);
    }
  }

  async function verificarOtp(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setEnviando(true);
    try {
      const res = await fetch("/api/acceso/verificar-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), token: codigoOtp.trim() }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.mensaje ?? "Codigo incorrecto. Intenta de nuevo.");
        setEnviando(false);
        return;
      }
      router.push("/mi-plan");
    } catch {
      setError("No pudimos conectar. Revisa tu internet e intenta de nuevo.");
      setEnviando(false);
    }
  }

  if (otpPista !== null) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5 py-8">
        <div className="flex flex-col gap-2 text-center">
          <h1 className="font-display text-2xl text-carbon">
            Te mandamos un codigo por WhatsApp
          </h1>
          <p className="text-sm text-carbon-suave">
            Llego a tu celular terminado en <strong>{otpPista}</strong> — el
            que registraste con esta cuenta. Escribilo aca y entras directo.
          </p>
        </div>

        <form onSubmit={verificarOtp} className="mt-6 flex flex-col gap-4">
          <Input
            label="Codigo"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="El codigo de 6 digitos"
            value={codigoOtp}
            onChange={(e) => setCodigoOtp(e.target.value.replace(/\D/g, ""))}
            required
          />

          {error && (
            <p className="text-sm text-error" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" variant="primary" className="mt-2 w-full" disabled={enviando}>
            {enviando && <Spinner />}
            {enviando ? "Verificando..." : "Entrar a mi plan"}
          </Button>

          <p className="text-center text-xs text-ceniza">
            ¿No te llego? Tambien te enviamos un link de acceso a tu correo —
            cualquiera de los dos sirve.
          </p>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5 py-8">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="font-display text-2xl text-carbon">Tu plan te espera</h1>
        <p className="text-sm text-carbon-suave">
          Dejanos tu nombre y tu email — entras a tu plan al toque, sin
          contraseña que recordar.
        </p>
      </div>

      {/* Oferta explicita: lo que desbloquea con el correo, sin adornos —
          los tres son literalmente lo que hay dentro del panel. */}
      <ul className="mt-5 flex flex-col gap-2">
        {[
          "Tu diagnostico guardado, para volver cuando quieras",
          "El reto de 7 dias con un mensaje de Milito cada dia",
          "Tu plan de 8 semanas, semana a semana",
        ].map((beneficio) => (
          <li key={beneficio} className="flex items-center gap-2.5 text-sm text-carbon">
            <span
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-dorado-oscuro text-blanco"
              aria-hidden="true"
            >
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                <path
                  d="M2 6l2.5 2.5L10 3"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            {beneficio}
          </li>
        ))}
      </ul>

      <form onSubmit={enviar} className="mt-6 flex flex-col gap-4">
        <Input
          label="Nombre"
          type="text"
          autoComplete="name"
          placeholder="Tu nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />
        <Input
          label="Email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          label="Celular (opcional)"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="Tu numero, con indicativo de pais"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
        />

        {error && (
          <p className="text-sm text-error" role="alert">
            {error}
          </p>
        )}

        <Button type="submit" variant="primary" className="mt-2 w-full" disabled={enviando}>
          {enviando && <Spinner />}
          {enviando ? "Entrando..." : "Quiero mi plan"}
        </Button>

        <p className="text-center text-xs text-ceniza">
          Te llega tambien un correo con acceso directo, por si otro dia
          entras desde otro celular o computador.
        </p>
      </form>
    </div>
  );
}
