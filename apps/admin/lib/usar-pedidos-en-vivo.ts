"use client";

import { useEffect, useState } from "react";
import { createClient } from "@diana-mile/shared/supabase/client";
import type { Pedido } from "@diana-mile/shared/types";

/**
 * Mantiene la lista de pedidos al dia sin recargar la pagina.
 *
 * En una operacion contraentrega el panel se mira todo el dia y varias
 * personas tocan los mismos pedidos: el agente de WhatsApp crea ordenes
 * solo, Shopify avisa de las de la web, y alguien mas puede estar
 * confirmando desde otro computador. Con la carga del servidor y ya, lo
 * que se ve en pantalla envejece a los pocos minutos y se termina
 * despachando sobre datos viejos.
 *
 * La lectura en el navegador va con la sesion del admin (politica
 * "pedidos lectura admins"), no con service_role.
 */
export function usarPedidosEnVivo(iniciales: Pedido[]) {
  const [pedidos, setPedidos] = useState<Pedido[]>(iniciales);
  const [enVivo, setEnVivo] = useState(false);

  // Si el servidor manda otra lista (al navegar o revalidar), manda esa.
  // Se compara por contenido y no por identidad del array: cualquier
  // renderizado del padre crea uno nuevo, y reemplazar a ciegas borraria
  // el cambio que alguien acaba de hacer desde el panel antes de que
  // llegue su confirmacion.
  const firma = iniciales.map((p) => `${p.id}:${p.updated_at ?? ""}`).join("|");
  useEffect(() => {
    setPedidos(iniciales);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firma]);

  useEffect(() => {
    const supabase = createClient();

    const canal = supabase
      .channel("pedidos-en-vivo")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "pedidos" },
        (payload) => {
          setPedidos((previos) => {
            if (payload.eventType === "DELETE") {
              const viejo = payload.old as Partial<Pedido>;
              return previos.filter((p) => p.id !== viejo.id);
            }

            const fila = payload.new as Pedido;
            const i = previos.findIndex((p) => p.id === fila.id);

            // Nuevo: arriba del todo, que es donde se mira primero.
            if (i === -1) return [fila, ...previos];

            // Actualizado: se reemplaza en su sitio para no reordenar la
            // lista bajo el cursor de quien la esta leyendo.
            const copia = [...previos];
            copia[i] = fila;
            return copia;
          });
        },
      )
      .subscribe((estado) => {
        setEnVivo(estado === "SUBSCRIBED");
        if (estado === "CHANNEL_ERROR" || estado === "TIMED_OUT") {
          console.warn(`[pedidos-en-vivo] canal ${estado}`);
        }
      });

    return () => {
      void supabase.removeChannel(canal);
    };
  }, []);

  // El setter sale para que el panel siga pintando sus cambios al
  // instante: esperar a que el evento de vuelta por la red haria que cada
  // clic se sienta lento.
  return { pedidos, setPedidos, enVivo };
}
