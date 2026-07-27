-- Intentos fallidos del acceso temporal a /cuenta.
--
-- El codigo unico es corto y todas las clientas comparten el mismo, asi que
-- sin un freno cualquiera puede probar combinaciones hasta dar con el y
-- entrar a cuentas ajenas. Esto lo limita por IP.
--
-- Se borra junto con el endpoint el dia que vuelva el codigo por WhatsApp.
CREATE TABLE IF NOT EXISTS acceso_intentos (
  id BIGSERIAL PRIMARY KEY,
  ip TEXT NOT NULL,
  telefono TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_acceso_intentos_ip
  ON acceso_intentos (ip, created_at DESC);

ALTER TABLE acceso_intentos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "acceso_intentos_service_role" ON acceso_intentos;
CREATE POLICY "acceso_intentos_service_role" ON acceso_intentos
  FOR ALL USING (auth.role() = 'service_role');
