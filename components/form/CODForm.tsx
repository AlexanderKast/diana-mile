"use client";

import { FormEvent, useState } from "react";
import { Product } from "@/types";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";

type CODFormProps = {
  product: Product;
};

type SuccessState = {
  orderNumber: string;
  telefono: string;
};

export function CODForm({ product }: CODFormProps) {
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [direccion, setDireccion] = useState("");
  const [notas, setNotas] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<SuccessState | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!nombre.trim() || !telefono.trim() || !ciudad.trim() || !direccion.trim()) {
      setError("Por favor completa todos los campos requeridos.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          telefono,
          ciudad,
          direccion,
          notas,
          productSlug: product.handle,
          variantId: product.variantId,
          cantidad: 1,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.mensaje ?? "No pudimos procesar tu pedido. Intenta de nuevo.");
      }

      setSuccess({ orderNumber: data.orderNumber, telefono: data.telefono });
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos procesar tu pedido. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    const whatsappNumero = process.env.NEXT_PUBLIC_WHATSAPP_NUMERO;
    const mensaje = `Hola, acabo de confirmar mi pedido ${success.orderNumber} de ${product.title}.`;
    const whatsappUrl = `https://wa.me/${whatsappNumero}?text=${encodeURIComponent(mensaje)}`;

    return (
      <div className="animate-fade-in-up flex flex-col items-start gap-4 rounded-[4px] border border-arena bg-crema p-6">
        <span className="flex h-11 w-11 items-center justify-center rounded-full border border-dorado text-dorado">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </span>
        <div className="flex flex-col gap-1">
          <h3 className="font-display text-2xl text-carbon">Pedido recibido</h3>
          <p className="text-sm text-ceniza">Numero de pedido: {success.orderNumber}</p>
        </div>
        <p className="text-sm text-carbon-suave">
          Te contactaremos en menos de 24 horas al {success.telefono} para confirmar la entrega.
        </p>
        <Button
          variant="secondary"
          type="button"
          onClick={() => window.open(whatsappUrl, "_blank", "noopener,noreferrer")}
        >
          Ir a WhatsApp
        </Button>
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

      <div className="flex flex-col gap-1.5">
        <label htmlFor="telefono" className="text-xs text-ceniza font-medium">
          Telefono celular
        </label>
        <div className="flex min-h-[44px] overflow-hidden rounded-[2px] border border-arena bg-blanco focus-within:border-dorado transition-colors">
          <span className="flex items-center px-4 text-base text-ceniza border-r border-arena">+57</span>
          <input
            id="telefono"
            type="tel"
            required
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            placeholder="300 123 4567"
            className="flex-1 min-h-[44px] bg-transparent px-4 py-2.5 text-base text-carbon placeholder:text-ceniza focus:outline-none"
          />
        </div>
      </div>

      <Input
        label="Ciudad"
        type="text"
        required
        value={ciudad}
        onChange={(e) => setCiudad(e.target.value)}
        placeholder="Bogota, Medellin..."
      />

      <Textarea
        label="Direccion completa"
        rows={3}
        required
        value={direccion}
        onChange={(e) => setDireccion(e.target.value)}
        placeholder="Calle, numero, barrio, apto..."
      />

      <Textarea
        label="Notas adicionales"
        rows={2}
        value={notas}
        onChange={(e) => setNotas(e.target.value)}
        placeholder="Referencias de entrega (opcional)"
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
            Procesando...
          </>
        ) : (
          "Confirmar pedido — Contraentrega"
        )}
      </Button>
    </form>
  );
}
