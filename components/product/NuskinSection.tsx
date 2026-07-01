"use client";

import { useOrderSheet } from "@/components/product/OrderSheetContext";
import { Button } from "@/components/ui/Button";

export function NuskinSection() {
  const { product } = useOrderSheet();
  const nuskinDirectUrl = product.metafields.nuskinDirectUrl;

  if (!nuskinDirectUrl) return null;

  function openNuskin() {
    window.open(nuskinDirectUrl!, "_blank", "noopener,noreferrer");
  }

  return (
    <section className="px-6 py-10">
      <div className="mx-auto max-w-md rounded-[4px] border border-arena bg-crema p-6 text-center">
        <h2 className="font-display text-xl text-carbon">¿Eres distribuidora Nu Skin?</h2>
        <p className="mt-2 text-sm text-carbon-suave">
          Compra a precio de distribuidora directamente en la plataforma oficial de Nu Skin y
          acumula tus puntos con nuestro link.
        </p>
        <Button
          variant="secondary"
          type="button"
          onClick={openNuskin}
          className="mt-4 border-morado! text-morado! hover:bg-lila-suave!"
        >
          Comprar en Nu Skin ↗
        </Button>
        <p className="mt-3 text-xs text-ceniza">
          Seras redirigida a Nu Skin. Los puntos se cargan a nuestra linea automaticamente.
        </p>
      </div>
    </section>
  );
}
