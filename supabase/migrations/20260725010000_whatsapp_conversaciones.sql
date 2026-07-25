-- ════════════════════════════════════════════
-- CONVERSACIONES DE WHATSAPP (agente IA)
-- Memoria de la charla + estado de la ventana de 24h
-- ════════════════════════════════════════════

-- Una fila por telefono: el hilo con esa persona.
CREATE TABLE IF NOT EXISTS whatsapp_conversaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telefono TEXT NOT NULL UNIQUE, -- E.164 con +
  nombre TEXT,
  -- Ultimo mensaje ENTRANTE: define si seguimos dentro de la ventana de
  -- 24h de WhatsApp (solo ahi se puede responder con texto libre).
  ultimo_entrante_at TIMESTAMPTZ,
  ultimo_experto TEXT, -- id del experto que atendio por ultima vez
  -- Datos que el agente va aprendiendo de la persona (objetivo, interes,
  -- si es cliente, si quiere ser creadora, etc.)
  perfil JSONB NOT NULL DEFAULT '{}',
  -- Interruptor por persona: si un humano toma la conversacion, la IA calla.
  ia_activa BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS whatsapp_conversaciones_telefono_idx ON whatsapp_conversaciones (telefono);

-- Historial de mensajes (memoria del agente).
CREATE TABLE IF NOT EXISTS whatsapp_conversacion_mensajes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversacion_id UUID NOT NULL REFERENCES whatsapp_conversaciones(id) ON DELETE CASCADE,
  rol TEXT NOT NULL, -- user | assistant
  contenido TEXT NOT NULL,
  experto TEXT, -- que experto respondio (solo en rol=assistant)
  tokens INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS whatsapp_conv_mensajes_conv_idx
  ON whatsapp_conversacion_mensajes (conversacion_id, created_at DESC);

ALTER TABLE whatsapp_conversaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_conversacion_mensajes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "whatsapp_conversaciones_service_role" ON whatsapp_conversaciones;
CREATE POLICY "whatsapp_conversaciones_service_role" ON whatsapp_conversaciones FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "whatsapp_conv_mensajes_service_role" ON whatsapp_conversacion_mensajes;
CREATE POLICY "whatsapp_conv_mensajes_service_role" ON whatsapp_conversacion_mensajes FOR ALL USING (auth.role() = 'service_role');
