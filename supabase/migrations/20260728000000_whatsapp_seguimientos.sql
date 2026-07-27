-- ════════════════════════════════════════════
-- SEGUIMIENTO DEL CICLO DE VIDA DEL CLIENTE
-- ════════════════════════════════════════════
--
-- Una fila por toque programado. Existe para saber que ya se mando y no
-- repetirlo: un cron que mirara solo el estado del pedido volveria a
-- enviar el mismo mensaje en cada corrida.

CREATE TABLE IF NOT EXISTS whatsapp_seguimientos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id UUID REFERENCES pedidos(id) ON DELETE CASCADE,
  telefono TEXT NOT NULL,
  -- bienvenida | cuidado | valor | resultados | comunidad | recompra
  etapa TEXT NOT NULL,
  programado_para TIMESTAMPTZ NOT NULL,
  enviado_at TIMESTAMPTZ,
  -- pendiente | enviado | cancelado (si el cliente pide parar o anula)
  estado TEXT NOT NULL DEFAULT 'pendiente',
  contexto JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Un pedido no puede tener dos veces la misma etapa.
CREATE UNIQUE INDEX IF NOT EXISTS whatsapp_seguimientos_unico
  ON whatsapp_seguimientos (pedido_id, etapa);

CREATE INDEX IF NOT EXISTS whatsapp_seguimientos_pendientes
  ON whatsapp_seguimientos (estado, programado_para);

ALTER TABLE whatsapp_seguimientos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "whatsapp_seguimientos_service_role" ON whatsapp_seguimientos;
CREATE POLICY "whatsapp_seguimientos_service_role" ON whatsapp_seguimientos FOR ALL USING (auth.role() = 'service_role');

-- Quien pide parar promociones no vuelve a recibir MARKETING.
ALTER TABLE whatsapp_conversaciones
  ADD COLUMN IF NOT EXISTS promociones_activas BOOLEAN NOT NULL DEFAULT TRUE;
