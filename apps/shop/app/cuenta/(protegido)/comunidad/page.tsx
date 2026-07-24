import { redirect } from "next/navigation";
import { Button } from "@diana-mile/shared/ui/Button";
import { getClienteUser } from "@diana-mile/shared/supabase/server";
import { clienteTieneComunidad, getComunidadWhatsappLink } from "@/lib/community";

export default async function ComunidadPage() {
  const cliente = await getClienteUser();
  if (!cliente) redirect("/cuenta/login");

  const tieneAcceso = await clienteTieneComunidad(cliente.telefono);

  if (!tieneAcceso) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-arena bg-crema p-8 text-center">
        <p className="font-display text-xl text-carbon">Comunidad Milito Life</p>
        <p className="max-w-sm text-sm text-carbon-suave">
          Se desbloquea cuando tu pedido sea entregado — es nuestro regalo de bienvenida por
          recibirlo.
        </p>
      </div>
    );
  }

  const link = await getComunidadWhatsappLink();

  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-morado/20 bg-lila-suave p-8 text-center">
      <p className="font-display text-xl text-carbon">¡Ya eres parte de la comunidad!</p>
      <p className="max-w-sm text-sm text-carbon-suave">
        Entra al grupo de WhatsApp para acceder a contenido exclusivo, descuentos VIP y
        acompañamiento real.
      </p>
      <a href={link} target="_blank" rel="noopener noreferrer">
        <Button variant="primary">Unirme al grupo de WhatsApp →</Button>
      </a>
    </div>
  );
}
