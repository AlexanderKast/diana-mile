-- Adicional ofrecido despues de cerrar el pedido.
--
-- El pedido se crea en cuanto la clienta confirma; el adicional se le
-- ofrece despues y, si lo acepta, se le suma a esa misma orden. Guardar la
-- oferta aqui es lo que permite entender un "si" suelto tres mensajes mas
-- tarde sin volver a preguntar que era.
--
-- Va en la conversacion y no en una tabla aparte porque solo puede haber
-- una oferta viva a la vez: dos adicionales pendientes en el mismo chat
-- serian imposibles de responder sin ambiguedad.
ALTER TABLE whatsapp_conversaciones
  ADD COLUMN IF NOT EXISTS upsell_pedido_id UUID REFERENCES pedidos(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS upsell_variant_id TEXT,
  ADD COLUMN IF NOT EXISTS upsell_producto TEXT,
  ADD COLUMN IF NOT EXISTS upsell_precio NUMERIC,
  ADD COLUMN IF NOT EXISTS upsell_ofrecido_at TIMESTAMPTZ;

-- Queda registro de como termino cada oferta para poder medir si el
-- adicional vale la pena o solo esta molestando a quien ya compro.
CREATE TABLE IF NOT EXISTS whatsapp_upsell_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id UUID REFERENCES pedidos(id) ON DELETE SET NULL,
  telefono TEXT,
  producto TEXT,
  precio NUMERIC,
  -- aceptado | rechazado | vencido | fallo
  resultado TEXT NOT NULL,
  detalle TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE whatsapp_upsell_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "upsell_log_service_role" ON whatsapp_upsell_log;
CREATE POLICY "upsell_log_service_role" ON whatsapp_upsell_log
  FOR ALL USING (auth.role() = 'service_role');
