"use client";

import { FormEvent, useState } from "react";
import { Input } from "@diana-mile/shared/ui/Input";
import { Button } from "@diana-mile/shared/ui/Button";
import { Spinner } from "@diana-mile/shared/ui/Spinner";
import { normalizeColombianMobile } from "@/lib/phone";

type LeadCaptureFormProps = {
  fuente?: string;
  productoInteres?: string;
};

export function LeadCaptureForm({ fuente = "linktree", productoInteres }: LeadCaptureFormProps) {
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!nombre.trim() || !telefono.trim()) {
      setError("Por favor ingresa tu nombre y telefono.");
      return;
    }

    const telefonoNormalizado = normalizeColombianMobile(telefono);
    if (!telefonoNormalizado) {
      setError("Ingresa un celular colombiano valido de 10 digitos, por ejemplo 300 123 4567.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          telefono: telefonoNormalizado.e164,
          ciudad: ciudad || undefined,
          producto_interes: productoInteres,
          fuente,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.mensaje ?? "No pudimos enviar tus datos. Intenta de nuevo.");
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos enviar tus datos. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="animate-fade-in-up rounded-2xl border border-arena bg-crema p-6 text-center">
        <p className="text-carbon">Gracias, te contactaremos pronto.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Nombre completo"
        type="text"
        required
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        placeholder="Tu nombre y apellido"
      />

      <Input
        label="Telefono celular"
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        maxLength={13}
        required
        value={telefono}
        onChange={(e) => setTelefono(e.target.value.replace(/[^\d\s]/g, ""))}
        placeholder="300 123 4567"
      />

      <Input
        label="Ciudad"
        type="text"
        value={ciudad}
        onChange={(e) => setCiudad(e.target.value)}
        placeholder="Bogota, Medellin... (opcional)"
      />

      {error && (
        <p className="text-sm text-error" role="alert">
          {error}
        </p>
      )}

      <Button variant="primary" type="submit" disabled={loading}>
        {loading ? (
          <>
            <Spinner className="text-blanco" />
            Enviando...
          </>
        ) : (
          "Quiero saber mas"
        )}
      </Button>
    </form>
  );
}
