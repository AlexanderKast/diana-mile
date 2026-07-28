import { calcularCosteoCatalogo } from "@/lib/costeo";
import { TablaCostos } from "@/components/admin/TablaCostos";
import StatsCard from "@/components/admin/StatsCard";
import { formatCOP } from "@diana-mile/shared/utils";
import type { SaludCosteo } from "@diana-mile/shared/finanzas/costeo";

export const metadata = {
  title: "Costos por producto | Milito Life Shop Admin",
};

// El catalogo se lee de Shopify en cada carga: si se cachea, un producto
// creado hoy no aparece en la lista de "sin costo" y es justo el que hay
// que costear.
export const dynamic = "force-dynamic";

const FILTROS_VALIDOS: SaludCosteo[] = [
  "sin_costo",
  "perdida",
  "bajo_objetivo",
  "sano",
];

export default async function CostosPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const filtroParam = typeof params.filtro === "string" ? params.filtro : null;
  const filtro = FILTROS_VALIDOS.includes(filtroParam as SaludCosteo)
    ? (filtroParam as SaludCosteo)
    : null;

  const resumen = await calcularCosteoCatalogo();

  if (!resumen.shopifyConfigurado) {
    return (
      <div>
        <h1 className="font-display text-2xl text-carbon mb-2">Costos por producto</h1>
        <div className="bg-blanco border border-arena rounded-[4px] p-6 max-w-lg">
          <p className="text-sm text-carbon-suave">
            Falta configurar Shopify (<code>SHOPIFY_STORE_DOMAIN</code> y{" "}
            <code>SHOPIFY_ADMIN_API_TOKEN</code>). Sin eso no se puede leer el
            catálogo para costearlo.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl text-carbon mb-1">Costos por producto</h1>
        <p className="text-sm text-carbon-suave max-w-2xl">
          Lo que Milito le paga a Nu Skin por cada presentación. Es el número del
          que cuelga todo lo demás: sin él, la utilidad que muestra Finanzas se
          calcula como si la mercancía fuera gratis.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatsCard label="Variantes" value={resumen.total} />
        <StatsCard label="Sin costo" value={resumen.sinCosto} />
        <StatsCard label="Pierden plata" value={resumen.enPerdida} />
        <StatsCard
          label="Margen bruto medio"
          value={
            resumen.margenBrutoPromedio === null
              ? "—"
              : `${(resumen.margenBrutoPromedio * 100).toFixed(0)}%`
          }
        />
      </div>

      {resumen.sinCosto > 0 && (
        <div className="mb-6 rounded-[4px] border border-error/30 bg-error/5 px-5 py-4">
          <p className="text-sm font-semibold text-error mb-1">
            {resumen.sinCosto} de {resumen.total} variantes no tienen costo cargado
          </p>
          <p className="text-sm text-carbon-suave">
            Mientras siga así, el margen bruto medio de arriba solo habla de las{" "}
            {resumen.total - resumen.sinCosto} que sí lo tienen, y la utilidad del
            panel está por encima de la real.
          </p>
        </div>
      )}

      <p className="text-xs text-ceniza mb-3">
        Costos accesorios por defecto:{" "}
        {formatCOP(resumen.parametros.costoPlataformaDefault)} de plataforma y{" "}
        {formatCOP(resumen.parametros.costoLogisticoDefault)} de logística por
        pedido. Publicidad {(resumen.parametros.pctPublicidad * 100).toFixed(0)}% y
        administración {(resumen.parametros.pctAdmin * 100).toFixed(0)}% del precio
        de venta. Margen objetivo{" "}
        {(resumen.parametros.margenObjetivo * 100).toFixed(0)}%.
      </p>

      <TablaCostos filas={resumen.filas} filtroInicial={filtro} />
    </div>
  );
}
