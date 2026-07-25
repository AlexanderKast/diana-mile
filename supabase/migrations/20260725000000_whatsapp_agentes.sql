-- ════════════════════════════════════════════
-- AGENTES DE WHATSAPP (Botcake)
-- Outbox de mensajes salientes + eventos entrantes
-- ════════════════════════════════════════════

-- Cola de mensajes salientes. Nunca se llama a Botcake directo desde un
-- request: se inserta aqui, se intenta enviar, y un cron reintenta los
-- fallidos. Trazabilidad completa de todo lo enviado por WhatsApp.
CREATE TABLE IF NOT EXISTS whatsapp_mensajes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id UUID REFERENCES pedidos(id) ON DELETE SET NULL,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  telefono TEXT NOT NULL, -- E.164 con +
  tipo TEXT NOT NULL, -- confirmacion | recordatorio | envio | remarketing | manual
  plantilla TEXT NOT NULL, -- nombre de la plantilla de WhatsApp
  variables JSONB NOT NULL DEFAULT '{}', -- params posicionales {"1": "...", "2": "..."}
  estado TEXT NOT NULL DEFAULT 'pendiente', -- pendiente | enviado | fallido | descartado
  intentos INT NOT NULL DEFAULT 0,
  ultimo_error TEXT,
  enviado_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS whatsapp_mensajes_estado_idx ON whatsapp_mensajes (estado);
CREATE INDEX IF NOT EXISTS whatsapp_mensajes_telefono_idx ON whatsapp_mensajes (telefono);
CREATE INDEX IF NOT EXISTS whatsapp_mensajes_pedido_idx ON whatsapp_mensajes (pedido_id);

-- Respuestas del cliente que Botcake reenvia al webhook de la app
-- (botones de plantillas, mensajes libres, etc.)
CREATE TABLE IF NOT EXISTS whatsapp_eventos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id UUID REFERENCES pedidos(id) ON DELETE SET NULL,
  telefono TEXT NOT NULL,
  evento TEXT NOT NULL, -- confirmado | modificar | anulado | asesor | mensaje
  payload JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS whatsapp_eventos_telefono_idx ON whatsapp_eventos (telefono);
CREATE INDEX IF NOT EXISTS whatsapp_eventos_pedido_idx ON whatsapp_eventos (pedido_id);

ALTER TABLE whatsapp_mensajes ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_eventos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "whatsapp_mensajes_service_role" ON whatsapp_mensajes;
CREATE POLICY "whatsapp_mensajes_service_role" ON whatsapp_mensajes FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "whatsapp_eventos_service_role" ON whatsapp_eventos;
CREATE POLICY "whatsapp_eventos_service_role" ON whatsapp_eventos FOR ALL USING (auth.role() = 'service_role');
