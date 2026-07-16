import type { EstadoPedido } from "@diana-mile/shared/types";

function formatFecha(fecha: string): string {
  return new Date(fecha).toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const PASOS: { estado: EstadoPedido; titulo: string; descripcion: string }[] = [
  {
    estado: "pendiente",
    titulo: "Pedido recibido",
    descripcion: "Tu pedido quedó registrado.",
  },
  {
    estado: "confirmado",
    titulo: "Confirmado",
    descripcion: "Validamos tus datos por teléfono/WhatsApp.",
  },
  {
    estado: "en_preparacion",
    titulo: "En preparación",
    descripcion: "Estamos alistando tu pedido para el envío.",
  },
  {
    estado: "enviado",
    titulo: "Enviado",
    descripcion: "Tu pedido va en camino.",
  },
  {
    estado: "entregado",
    titulo: "Entregado",
    descripcion: "Ya lo tienes en tus manos.",
  },
];

const BANNERS_TERMINALES: Partial<
  Record<EstadoPedido, { titulo: string; descripcion: string }>
> = {
  devuelto: {
    titulo: "Pedido devuelto",
    descripcion:
      "Este pedido fue devuelto. Si tienes dudas, escríbenos por WhatsApp.",
  },
  cancelado: {
    titulo: "Pedido cancelado",
    descripcion: "Este pedido fue cancelado.",
  },
  fraude: {
    titulo: "Pedido en revisión",
    descripcion: "Estamos revisando este pedido. Te contactaremos pronto.",
  },
};

export function PedidoTimeline({
  estado,
  transportadora,
  numeroGuia,
  urlTracking,
  fechaEnvio,
  fechaEntregaEstimada,
  fechaEntregaReal,
}: {
  estado: EstadoPedido;
  transportadora: string | null;
  numeroGuia: string | null;
  urlTracking: string | null;
  fechaEnvio: string | null;
  fechaEntregaEstimada: string | null;
  fechaEntregaReal: string | null;
}) {
  const banner = BANNERS_TERMINALES[estado];

  if (banner) {
    return (
      <div className="rounded-2xl border border-arena bg-crema p-5">
        <p className="font-display text-lg text-carbon">{banner.titulo}</p>
        <p className="mt-1 text-sm text-carbon-suave">{banner.descripcion}</p>
      </div>
    );
  }

  const indiceActual = PASOS.findIndex((p) => p.estado === estado);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-6">
        {PASOS.map((paso, index) => {
          const alcanzado = index <= indiceActual;
          return (
            <div key={paso.estado} className="relative flex gap-4">
              <div className="flex flex-col items-center">
                <span
                  className={
                    alcanzado
                      ? "h-3 w-3 shrink-0 rounded-full bg-dorado-oscuro"
                      : "h-3 w-3 shrink-0 rounded-full border-2 border-arena bg-blanco"
                  }
                />
                {index < PASOS.length - 1 && (
                  <span
                    className={
                      alcanzado
                        ? "mt-1 w-0.5 flex-1 bg-dorado/50"
                        : "mt-1 w-0.5 flex-1 bg-arena"
                    }
                  />
                )}
              </div>
              <div className="flex flex-col gap-0.5 pb-2">
                <p
                  className={
                    alcanzado
                      ? "text-sm font-semibold text-carbon"
                      : "text-sm font-semibold text-ceniza"
                  }
                >
                  {paso.titulo}
                </p>
                <p className="text-sm text-carbon-suave">{paso.descripcion}</p>
                {paso.estado === "enviado" && alcanzado && fechaEnvio && (
                  <p className="text-xs text-ceniza">
                    Enviado el {formatFecha(fechaEnvio)}
                  </p>
                )}
                {paso.estado === "enviado" &&
                  alcanzado &&
                  fechaEntregaEstimada && (
                    <p className="text-xs text-ceniza">
                      Entrega estimada: {formatFecha(fechaEntregaEstimada)}
                    </p>
                  )}
                {paso.estado === "entregado" &&
                  alcanzado &&
                  fechaEntregaReal && (
                    <p className="text-xs text-ceniza">
                      Entregado el {formatFecha(fechaEntregaReal)}
                    </p>
                  )}
              </div>
            </div>
          );
        })}
      </div>

      {(transportadora || numeroGuia) && (
        <div className="rounded-2xl border border-arena bg-crema p-4 text-sm">
          {transportadora && (
            <p className="text-carbon-suave">
              Transportadora:{" "}
              <span className="text-carbon">{transportadora}</span>
            </p>
          )}
          {numeroGuia && (
            <p className="mt-1 text-carbon-suave">
              Guía: <span className="text-carbon">{numeroGuia}</span>
            </p>
          )}
          {urlTracking && numeroGuia && (
            <a
              href={`${urlTracking}${numeroGuia}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-xs text-dorado-oscuro underline"
            >
              Rastrear envío →
            </a>
          )}
        </div>
      )}
    </div>
  );
}
