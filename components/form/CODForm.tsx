"use client";

import { FormEvent, useState } from "react";
import { Product, ProductVariant } from "@/types";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { normalizeColombianMobile } from "@/lib/phone";
import { DEPARTAMENTOS_COLOMBIA, CIUDADES_POR_DEPARTAMENTO } from "@/lib/colombia";

type SelectedVariant = Pick<ProductVariant, "id" | "title" | "price">;

type CODFormProps = {
  product: Product;
  selectedVariant: SelectedVariant;
};

type SuccessState = {
  orderNumber: string;
  telefono: string;
};

export function CODForm({ product, selectedVariant }: CODFormProps) {
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [departamento, setDepartamento] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [direccion, setDireccion] = useState("");
  const [notas, setNotas] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<SuccessState | null>(null);

  const ciudadesSugeridas = departamento ? CIUDADES_POR_DEPARTAMENTO[departamento] ?? [] : [];

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!nombre.trim() || !telefono.trim() || !departamento || !ciudad.trim() || !direccion.trim()) {
      setError("Por favor completa todos los campos requeridos.");
      return;
    }

    const telefonoNormalizado = normalizeColombianMobile(telefono);
    if (!telefonoNormalizado) {
      setError("Ingresa un celular colombiano valido de 10 digitos, por ejemplo 300 123 4567.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          telefono: telefonoNormalizado.e164,
          email: email.trim() || undefined,
          departamento,
          ciudad,
          direccion,
          notas,
          variantId: selectedVariant.id,
          slug: product.handle,
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
    const mensaje = `Hola, acabo de confirmar mi pedido ${success.orderNumber} de ${product.title} (${selectedVariant.title}).`;
    const whatsappUrl = `https://wa.me/${whatsappNumero}?text=${encodeURIComponent(mensaje)}`;

    return (
      <div className="animate-fade-in-up flex flex-col items-start gap-4 rounded-[4px] border border-arena bg-crema p-6">
        <style>{`
          @keyframes codform-check-circle {
            from { transform: scale(0); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
          @keyframes codform-check-mark {
            from { stroke-dashoffset: 24; }
            to { stroke-dashoffset: 0; }
          }
          .codform-check-circle {
            animation: codform-check-circle 300ms ease-out both;
          }
          .codform-check-mark {
            stroke-dasharray: 24;
            stroke-dashoffset: 24;
            animation: codform-check-mark 400ms 200ms ease-out forwards;
          }
        `}</style>
        <span className="codform-check-circle flex h-11 w-11 items-center justify-center rounded-full border border-dorado text-dorado">
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
            <path className="codform-check-mark" d="M20 6L9 17l-5-5" />
          </svg>
        </span>
        <div className="flex flex-col gap-1">
          <h3 className="font-display text-2xl text-carbon">Pedido confirmado</h3>
          <p className="text-sm text-ceniza">Numero de pedido: {success.orderNumber}</p>
        </div>
        <p className="text-sm text-carbon-suave">
          Te contactaremos en maximo 24 horas al {success.telefono}.
        </p>
        {whatsappNumero ? (
          <Button
            variant="secondary"
            type="button"
            onClick={() => window.open(whatsappUrl, "_blank", "noopener,noreferrer")}
          >
            Escribenos por WhatsApp
          </Button>
        ) : (
          <p className="text-sm text-ceniza">Te contactaremos pronto.</p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Nombre completo"
        type="text"
        autoComplete="name"
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
            inputMode="numeric"
            autoComplete="tel-national"
            maxLength={13}
            required
            value={telefono}
            onChange={(e) => setTelefono(e.target.value.replace(/[^\d\s]/g, ""))}
            placeholder="300 123 4567"
            className="flex-1 min-h-[44px] bg-transparent px-4 py-2.5 text-base text-carbon placeholder:text-ceniza focus:outline-none"
          />
        </div>
      </div>

      <Input
        label="Correo (opcional)"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="tucorreo@ejemplo.com"
      />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="departamento" className="text-xs text-ceniza font-medium">
          Departamento
        </label>
        <select
          id="departamento"
          autoComplete="address-level1"
          required
          value={departamento}
          onChange={(e) => setDepartamento(e.target.value)}
          className="min-h-[44px] rounded-[2px] border border-arena bg-blanco px-4 py-2.5 text-base text-carbon focus:outline-none focus:border-dorado transition-colors"
        >
          <option value="" disabled>
            Selecciona tu departamento
          </option>
          {DEPARTAMENTOS_COLOMBIA.map((dep) => (
            <option key={dep} value={dep}>
              {dep}
            </option>
          ))}
        </select>
      </div>

      <Input
        label="Ciudad"
        type="text"
        autoComplete="address-level2"
        list="ciudades-sugeridas"
        required
        value={ciudad}
        onChange={(e) => setCiudad(e.target.value)}
        placeholder={departamento ? "Escribe o elige tu ciudad" : "Bogota, Medellin..."}
      />
      <datalist id="ciudades-sugeridas">
        {ciudadesSugeridas.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>

      <Textarea
        label="Direccion completa"
        rows={3}
        autoComplete="street-address"
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

      <Button variant="primary" type="submit" disabled={loading} className="w-full">
        {loading ? (
          <>
            <Spinner className="text-blanco" />
            Procesando tu pedido...
          </>
        ) : (
          "Confirmar pedido — Contraentrega"
        )}
      </Button>
    </form>
  );
}
