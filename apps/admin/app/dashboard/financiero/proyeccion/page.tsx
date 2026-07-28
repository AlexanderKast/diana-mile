import { leerSupuestos } from "@/lib/proyeccion-datos";
import { SimuladorProyeccion } from "@/components/admin/SimuladorProyeccion";

export const metadata = {
  title: "Proyección | Milito Life Shop Admin",
};

export const dynamic = "force-dynamic";

export default async function ProyeccionPage() {
  const supuestos = await leerSupuestos();

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl text-carbon mb-1">Proyección</h1>
        <p className="text-sm text-carbon-suave max-w-2xl">
          Cuánto hay que vender para que el mes cierre en verde. En contraentrega{" "}
          <strong className="font-semibold">facturar no es recaudar</strong>: se
          factura, se despacha una parte y de eso se entrega otra parte. Lo que
          entra a caja es el producto de las tres cosas.
        </p>
      </div>

      <SimuladorProyeccion sugeridos={supuestos} />
    </div>
  );
}
