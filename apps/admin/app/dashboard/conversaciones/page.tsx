import BandejaConversaciones from "@/components/admin/BandejaConversaciones";

export const metadata = { title: "Conversaciones | Milito Life Shop Admin" };
export const dynamic = "force-dynamic";

/**
 * Atender WhatsApp sin salir del panel.
 *
 * Todo lo necesario ya existia: el historial en `whatsapp_conversacion_mensajes`,
 * el envio en `botcake/client.ts` y el interruptor de la IA. Faltaba la
 * pantalla.
 */
export default function ConversacionesPage() {
  return (
    <div>
      <h1 className="mb-2 font-display text-2xl text-carbon">Conversaciones</h1>
      <p className="mb-6 max-w-2xl text-sm text-carbon-suave">
        Todos los chats de WhatsApp. Primero quien está esperando a una
        persona. Al escribir a mano se apaga la IA de esa conversación, para
        que no respondan las dos.
      </p>
      <BandejaConversaciones />
    </div>
  );
}
