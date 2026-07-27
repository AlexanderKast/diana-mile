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
    let canal: ReturnType<typeof supabase.channel> | null = null;
    let montado = true;

    /**
     * El socket hay que autenticarlo a mano.
     *
     * La sesion vive en una cookie y el cliente la lee de forma asincrona,
     * asi que si se suscribe de una el socket sale con la clave anonima. La
     * politica de lectura exige ser admin, de modo que Postgres no manda
     * ninguna fila: el canal responde SUBSCRIBED —parece que todo va bien—
     * y no llega un solo evento. Sintoma exacto que tenia el panel.
     */
    const arrancar = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!montado) return;

      if (session?.access_token) {
        await supabase.realtime.setAuth(session.access_token);
      }
      if (!montado) return;

      canal = suscribir(supabase);
    };

    // El token caduca cada hora; sin renovarlo en el socket, el canal se
    // queda mudo a mitad de la jornada sin avisar.
    const { data: auth } = supabase.auth.onAuthStateChange((_evento, sesion) => {
      if (sesion?.access_token) void supabase.realtime.setAuth(sesion.access_token);
    });

    const aplicar = (operacion: string, fila?: Pedido, vieja?: Partial<Pedido>) =>
      setPedidos((previos) => {
        if (operacion === "DELETE") {
          const id = vieja?.id;
          return id ? previos.filter((p) => p.id !== id) : previos;
        }
        if (!fila?.id) return previos;

        const i = previos.findIndex((p) => p.id === fila.id);

        // Nuevo: arriba del todo, que es donde se mira primero.
        if (i === -1) return [fila, ...previos];

        // Actualizado: se reemplaza en su sitio para no reordenar la lista
        // bajo el cursor de quien la esta leyendo.
        const copia = [...previos];
        copia[i] = fila;
        return copia;
      });

    /**
     * Se escucha una difusion y no "postgres changes".
     *
     * Con postgres_changes el canal se suscribia y no llegaba ni un evento:
     * Realtime comprueba la politica de lectura contra cada fila y aqui no
     * la resolvia, aunque la misma consulta con este mismo token si
     * devuelve las filas. Ahora un disparador publica el cambio y el
     * permiso se decide una sola vez, al entrar al canal.
     */
    const suscribir = (cliente: ReturnType<typeof createClient>) =>
      cliente
      .channel("pedidos", { config: { private: true } })
      .on("broadcast", { event: "INSERT" }, ({ payload }) =>
        aplicar("INSERT", payload?.record as Pedido),
      )
      .on("broadcast", { event: "UPDATE" }, ({ payload }) =>
        aplicar("UPDATE", payload?.record as Pedido),
      )
      .on("broadcast", { event: "DELETE" }, ({ payload }) =>
        aplicar("DELETE", undefined, payload?.old_record as Partial<Pedido>),
      )
      .subscribe((estado) => {
        setEnVivo(estado === "SUBSCRIBED");
        if (estado === "CHANNEL_ERROR" || estado === "TIMED_OUT") {
          console.warn(`[pedidos-en-vivo] canal ${estado}`);
        }
      });

    void arrancar();

    return () => {
      montado = false;
      auth.subscription.unsubscribe();
      if (canal) void supabase.removeChannel(canal);
    };
  }, []);

  // El setter sale para que el panel siga pintando sus cambios al
  // instante: esperar a que el evento de vuelta por la red haria que cada
  // clic se sienta lento.
  return { pedidos, setPedidos, enVivo };
}
