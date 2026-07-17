"use client";

import { FormEvent, useEffect, useState } from "react";
import { Product, ProductVariant } from "@diana-mile/shared/types";
import { Input, Textarea } from "@diana-mile/shared/ui/Input";
import { Button } from "@diana-mile/shared/ui/Button";
import { Spinner } from "@diana-mile/shared/ui/Spinner";
import { formatCOP, cx } from "@diana-mile/shared/utils";
import { normalizeColombianMobile } from "@/lib/phone";
import {
  DEPARTAMENTOS_COLOMBIA,
  CIUDADES_POR_DEPARTAMENTO,
  getBarriosSugeridos,
} from "@/lib/colombia";
import { useOrderSheet } from "@/components/product/OrderSheetContext";
import { PushOptIn } from "@/components/site/PushOptIn";

type SelectedVariant = Pick<ProductVariant, "id" | "title" | "price">;

type CODFormProps = {
  product: Product;
  selectedVariant: SelectedVariant;
};

type SuccessState = {
  orderNumber: string;
  telefono: string;
  /** E.164 (+573001234567), capturado en el momento del envio — no se
   * recalcula del input despues, que puede haber cambiado mientras la
   * peticion estaba en curso. */
  telefonoE164: string;
};

function IconPagoMini() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <rect
        x="2"
        y="5"
        width="16"
        height="10.5"
        rx="1.5"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="10.25" r="2.5" />
    </svg>
  );
}

function IconEnvioMini() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path
        d="M2 5.5h9v8.5H2v-8.5zM11 8.5h4l3 3v2.5h-7v-5.5z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="6" cy="15.5" r="1.7" />
      <circle cx="14.5" cy="15.5" r="1.7" />
    </svg>
  );
}

function IconSatisfaccionMini() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path
        d="M10 2l6.5 2.5v5c0 4.5-2.9 7.4-6.5 8.5-3.6-1.1-6.5-4-6.5-8.5v-5L10 2z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M7 10l2 2 4-4.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="none"
      className={className}
    >
      <path
        fill="currentColor"
        d="M12.04 2c-5.52 0-10 4.48-10 10 0 1.76.46 3.48 1.34 5L2 22l5.14-1.35a10 10 0 0 0 4.9 1.25h.01c5.52 0 10-4.48 10-10s-4.48-9.9-10.01-9.9Zm0 18.1h-.01a8.3 8.3 0 0 1-4.23-1.16l-.3-.18-3.05.8.82-2.97-.2-.3a8.26 8.26 0 0 1-1.27-4.4c0-4.58 3.73-8.3 8.31-8.3 2.22 0 4.3.87 5.87 2.44a8.24 8.24 0 0 1 2.43 5.87c0 4.58-3.73 8.3-8.3 8.3Zm4.55-6.22c-.25-.13-1.47-.72-1.7-.8-.23-.08-.4-.13-.56.13-.17.25-.65.8-.8.97-.14.17-.29.19-.54.06-.25-.13-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.38-.43.13-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.87.85-.87 2.08 0 1.23.89 2.42 1.02 2.58.13.17 1.75 2.67 4.24 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.16-.48-.29Z"
      />
    </svg>
  );
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className={className}
    >
      <path
        d="M5 3h3l1.5 4-2 1.5a9 9 0 0 0 4 4l1.5-2 4 1.5v3a2 2 0 0 1-2 2C9.5 17 3 10.5 3 5a2 2 0 0 1 2-2z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TruckIcon({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className={className}
    >
      <path
        d="M2 5.5h9v8.5H2v-8.5zM11 8.5h4l3 3v2.5h-7v-5.5z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="6" cy="15.5" r="1.7" />
      <circle cx="14.5" cy="15.5" r="1.7" />
    </svg>
  );
}

const MINI_BADGES = [
  { icon: IconPagoMini, label: "Paga al recibir" },
  { icon: IconEnvioMini, label: "Envío gratis" },
  { icon: IconSatisfaccionMini, label: "Satisfacción garantizada" },
];

export function CODForm({ product, selectedVariant }: CODFormProps) {
  const { discountApplied, markOrderCompleted, pricing } = useOrderSheet();
  const [step, setStep] = useState<1 | 2>(1);
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [departamento, setDepartamento] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [barrio, setBarrio] = useState("");
  const [direccion, setDireccion] = useState("");
  const [notas, setNotas] = useState("");
  const [envioPrioritario, setEnvioPrioritario] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<SuccessState | null>(null);
  const [draftOrderId, setDraftOrderId] = useState<string | null>(null);
  const [ubicacion, setUbicacion] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [ubicacionEstado, setUbicacionEstado] = useState<
    "idle" | "cargando" | "lista" | "error"
  >("idle");

  const precioBase = parseFloat(selectedVariant.price);
  const precioConDescuento = discountApplied
    ? precioBase * (1 - pricing.discountPercent / 100)
    : precioBase;
  const precioTotal =
    precioConDescuento +
    (envioPrioritario ? parseFloat(pricing.envioPrioritarioPrecio) : 0);

  const ciudadesSugeridas = departamento
    ? (CIUDADES_POR_DEPARTAMENTO[departamento] ?? [])
    : [];
  const barriosSugeridos = getBarriosSugeridos(ciudad);

  // Carrito abandonado: en cuanto nombre + telefono son validos, se
  // registra para remarketing (con debounce, no en cada tecla). Si el
  // pedido se termina completando, /api/orders/complete lo marca como
  // convertido.
  useEffect(() => {
    if (success) return;

    const telefonoValido = normalizeColombianMobile(telefono);
    if (!nombre.trim() || !telefonoValido) return;

    const timeout = setTimeout(() => {
      fetch("/api/leads/carrito", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          telefono: telefonoValido.e164,
          ciudad: ciudad || null,
          producto_interes: `${product.title} — ${selectedVariant.title}`,
          variantId: selectedVariant.id,
        }),
      }).catch(() => {
        // Best-effort, nunca debe interrumpir el flujo de compra.
      });
    }, 1500);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nombre, telefono, ciudad, success]);

  function capturarUbicacion() {
    if (!navigator.geolocation) {
      setUbicacionEstado("error");
      return;
    }
    setUbicacionEstado("cargando");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUbicacion({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setUbicacionEstado("lista");
      },
      () => setUbicacionEstado("error"),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  function validatePaso1(): string | null {
    if (
      !nombre.trim() ||
      !telefono.trim() ||
      !departamento ||
      !ciudad.trim() ||
      !barrio.trim() ||
      !direccion.trim()
    ) {
      return "Por favor completa todos los campos requeridos.";
    }

    if (!normalizeColombianMobile(telefono)) {
      return "Ingresa un celular colombiano valido de 10 digitos, por ejemplo 300 123 4567.";
    }

    return null;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const errorPaso1 = validatePaso1();
    if (errorPaso1) {
      setError(errorPaso1);
      return;
    }

    const telefonoNormalizado = normalizeColombianMobile(telefono);
    if (!telefonoNormalizado) {
      setError(
        "Ingresa un celular colombiano valido de 10 digitos, por ejemplo 300 123 4567.",
      );
      return;
    }

    if (step === 1) {
      setLoading(true);
      try {
        const res = await fetch("/api/orders/draft", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nombre,
            telefono: telefonoNormalizado.e164,
            email: email.trim() || undefined,
            departamento,
            ciudad,
            barrio: barrio.trim() || undefined,
            direccion,
            ubicacion,
            variantId: selectedVariant.id,
            slug: product.handle,
            descuentoAplicado: discountApplied,
            envioPrioritario,
            draftOrderId,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data?.mensaje ?? "No pudimos guardar tu pedido. Intenta de nuevo.",
          );
        }

        setDraftOrderId(data.draftOrderId);
        setStep(2);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "No pudimos guardar tu pedido. Intenta de nuevo.",
        );
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!draftOrderId) {
      setError("Algo salio mal con tu pedido. Vuelve a ingresar tus datos.");
      setStep(1);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/orders/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          draftOrderId,
          nombre,
          telefono: telefonoNormalizado.e164,
          departamento,
          ciudad,
          barrio: barrio.trim() || undefined,
          direccion,
          notas,
          ubicacion,
          variantId: selectedVariant.id,
          slug: product.handle,
          descuentoAplicado: discountApplied,
          envioPrioritario,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data?.mensaje ?? "No pudimos confirmar tu pedido. Intenta de nuevo.",
        );
      }

      setSuccess({
        orderNumber: data.orderNumber,
        telefono: data.telefono,
        telefonoE164: telefonoNormalizado.e164,
      });
      markOrderCompleted();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No pudimos confirmar tu pedido. Intenta de nuevo.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    const whatsappNumero = process.env.NEXT_PUBLIC_WHATSAPP_NUMERO;
    const mensaje = `Hola, acabo de confirmar mi pedido ${success.orderNumber} de ${product.title} (${selectedVariant.title}).`;
    const whatsappUrl = `https://wa.me/${whatsappNumero}?text=${encodeURIComponent(mensaje)}`;

    return (
      <div className="animate-fade-in-up flex flex-col items-start gap-4 rounded-2xl border border-arena bg-crema p-6">
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
          <h3 className="font-display text-2xl text-carbon">
            ¡Tu ritual está en camino!
          </h3>
          <p className="text-sm text-ceniza">
            Numero de pedido: {success.orderNumber}
          </p>
        </div>

        <p className="text-sm text-carbon-suave">
          Tomaste una gran decisión. En los próximos días vas a notar la
          diferencia en tu piel — igual que miles de mujeres que ya forman parte
          de la comunidad Milito Life Shop.
        </p>

        <div className="flex flex-col gap-2.5 w-full">
          <p className="flex items-center gap-2 text-sm text-carbon-suave">
            <span className="shrink-0 text-dorado-oscuro">
              <PhoneIcon />
            </span>
            Recibirás una llamada de confirmación en las próximas horas al{" "}
            {success.telefono}
          </p>
          <p className="flex items-center gap-2 text-sm text-carbon-suave">
            <span className="shrink-0 text-dorado-oscuro">
              <TruckIcon />
            </span>
            Tu pedido saldrá en 24-48 horas hábiles
          </p>
          <p className="flex items-center gap-2 text-sm text-carbon-suave">
            <span className="shrink-0 text-dorado-oscuro">
              <WhatsAppIcon className="h-4 w-4" />
            </span>
            ¿Tienes dudas? Escríbenos por WhatsApp
          </p>
        </div>

        {whatsappNumero ? (
          <button
            type="button"
            onClick={() =>
              window.open(whatsappUrl, "_blank", "noopener,noreferrer")
            }
            className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] px-6 text-sm font-semibold tracking-wide text-blanco transition-transform duration-200 hover:scale-[1.02] active:scale-[0.97]"
          >
            <WhatsAppIcon />
            Chatear con Milito Life Shop →
          </button>
        ) : (
          <p className="text-sm text-ceniza">Te contactaremos pronto.</p>
        )}

        <PushOptIn telefono={success.telefonoE164} />

        <a
          href="/productos"
          className="self-center text-sm text-carbon-suave underline underline-offset-2"
        >
          Seguir explorando productos
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div
        className="flex items-center justify-center gap-2"
        aria-hidden="true"
      >
        <span className="h-1.5 w-8 rounded-full bg-morado" />
        <span
          className={cx(
            "h-1.5 w-8 rounded-full",
            step >= 1 ? "bg-morado" : "bg-arena",
          )}
        />
        <span
          className={cx(
            "h-1.5 w-8 rounded-full",
            step >= 2 ? "bg-morado" : "bg-arena",
          )}
        />
      </div>

      {step === 1 && (
        <div key="paso-1" className="animate-fade-in-up flex flex-col gap-4">
          <h3 className="font-display text-lg text-carbon">
            ¿A dónde lo enviamos?
          </h3>
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
            <label
              htmlFor="telefono"
              className="text-xs text-ceniza font-medium"
            >
              Telefono celular
            </label>
            <div className="flex min-h-[44px] overflow-hidden rounded-lg border border-arena bg-blanco focus-within:border-dorado transition-colors">
              <span className="flex items-center px-4 text-base text-ceniza border-r border-arena">
                +57
              </span>
              <input
                id="telefono"
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                maxLength={13}
                required
                value={telefono}
                onChange={(e) =>
                  setTelefono(e.target.value.replace(/[^\d\s]/g, ""))
                }
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
            <label
              htmlFor="departamento"
              className="text-xs text-ceniza font-medium"
            >
              Departamento
            </label>
            <select
              id="departamento"
              autoComplete="address-level1"
              required
              value={departamento}
              onChange={(e) => setDepartamento(e.target.value)}
              className="min-h-[44px] rounded-lg border border-arena bg-blanco px-4 py-2.5 text-base text-carbon focus:outline-none focus:border-dorado transition-colors"
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
            placeholder={
              departamento ? "Escribe o elige tu ciudad" : "Bogota, Medellin..."
            }
          />
          <datalist id="ciudades-sugeridas">
            {ciudadesSugeridas.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>

          <Input
            label="Barrio o sector"
            type="text"
            autoComplete="address-line2"
            list="barrios-sugeridos"
            required
            value={barrio}
            onChange={(e) => setBarrio(e.target.value)}
            placeholder="Ej. Chapinero, El Poblado..."
          />
          <datalist id="barrios-sugeridos">
            {barriosSugeridos.map((b) => (
              <option key={b} value={b} />
            ))}
          </datalist>

          <Textarea
            label="Direccion completa"
            rows={3}
            autoComplete="street-address"
            required
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            placeholder="Calle, numero, apto..."
          />

          <div className="flex flex-col gap-1.5">
            <button
              type="button"
              onClick={capturarUbicacion}
              disabled={
                ubicacionEstado === "cargando" || ubicacionEstado === "lista"
              }
              className="flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-arena text-sm text-carbon-suave transition-colors hover:bg-crema disabled:opacity-70"
            >
              {ubicacionEstado === "cargando" && (
                <Spinner className="text-carbon-suave" />
              )}
              {ubicacionEstado === "lista"
                ? "Ubicación compartida ✓"
                : "Compartir mi ubicación (opcional, ayuda a la entrega)"}
            </button>
            {ubicacionEstado === "error" && (
              <p className="text-xs text-ceniza">
                No pudimos obtener tu ubicación. No pasa nada, tu pedido igual
                se procesa con la dirección que escribiste.
              </p>
            )}
          </div>

          <Textarea
            label="Notas adicionales"
            rows={2}
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            placeholder="Referencias de entrega (opcional)"
          />

          {discountApplied && (
            <p className="rounded-2xl bg-lila-suave px-4 py-2.5 text-sm font-medium text-morado-oscuro text-center">
              10% de descuento aplicado a tu pedido ✓
            </p>
          )}

          <label
            className={cx(
              "flex items-start gap-3 rounded-2xl border-[1.5px] bg-crema p-3.5 cursor-pointer transition-colors",
              envioPrioritario ? "border-dorado-oscuro" : "border-dorado/40",
            )}
          >
            <input
              type="checkbox"
              checked={envioPrioritario}
              onChange={(e) => setEnvioPrioritario(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-dorado-oscuro"
            />
            <span className="flex flex-col gap-0.5">
              <span className="flex items-center gap-1.5">
                <span className="rounded-lg bg-dorado-oscuro px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-blanco">
                  Recomendado
                </span>
              </span>
              <span className="text-sm font-medium text-carbon">
                Agrega {pricing.envioPrioritarioLabel} por solo{" "}
                {formatCOP(pricing.envioPrioritarioPrecio)}
              </span>
              <span className="text-xs text-carbon-suave">
                Tu pedido se envía más rápido que los demás.
              </span>
            </span>
          </label>

          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
            {MINI_BADGES.map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="flex items-center gap-1.5 text-[11px] text-carbon-suave"
              >
                <span className="text-dorado-oscuro">
                  <Icon />
                </span>
                {label}
              </span>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div key="paso-2" className="animate-fade-in-up flex flex-col gap-4">
          <h3 className="font-display text-lg text-carbon">Confirmación</h3>

          <div className="flex flex-col gap-2 rounded-2xl border border-arena bg-crema p-4 text-sm text-carbon">
            <p>
              ✓ {product.title} — {selectedVariant.title}
            </p>
            <p>
              ✓ Total:{" "}
              <span className="font-semibold">{formatCOP(precioTotal)}</span>
            </p>
            <p>
              ✓ Envío a {ciudad}, {departamento}
            </p>
            {envioPrioritario && <p>✓ {pricing.envioPrioritarioLabel}</p>}
            {discountApplied && <p>✓ 10% de descuento aplicado</p>}
            <p>✓ Pago al recibir tu pedido</p>
          </div>

          <button
            type="button"
            onClick={() => setStep(1)}
            className="self-start text-sm text-carbon-suave underline underline-offset-2"
          >
            ← Editar mis datos
          </button>
        </div>
      )}

      {error && (
        <p className="text-sm text-error" role="alert">
          {error}
        </p>
      )}

      <Button
        variant="primary"
        type="submit"
        disabled={loading}
        className="cta-pulse w-full"
      >
        {loading ? (
          <>
            <Spinner className="text-blanco" />
            Procesando tu pedido...
          </>
        ) : step === 1 ? (
          "Realizar pedido →"
        ) : (
          "Confirmar mi pedido — pago al recibir"
        )}
      </Button>
    </form>
  );
}
