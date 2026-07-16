-- ════════════════════════════════════════════
-- SUSCRIPCIONES DE NOTIFICACIONES PUSH
-- ════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS push_suscripciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  telefono TEXT, -- E.164, nullable: puede suscribirse sin sesion (ej. justo tras completar un pedido)
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS push_suscripciones_telefono_idx ON push_suscripciones (telefono);

ALTER TABLE push_suscripciones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "push_suscripciones_service_role" ON push_suscripciones;
CREATE POLICY "push_suscripciones_service_role" ON push_suscripciones FOR ALL USING (auth.role() = 'service_role');
