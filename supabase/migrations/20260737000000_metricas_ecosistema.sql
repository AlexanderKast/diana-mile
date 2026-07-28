-- Eventos del sitio que no dejan rastro en ninguna otra tabla.
--
-- Hoy el unico es la instalacion como app: el banner sabia si ya estaba
-- instalada, pero nadie anotaba cuando alguien la instalaba, asi que no
-- habia forma de saber si empujarla servia de algo.
CREATE TABLE IF NOT EXISTS eventos_app (
  id BIGSERIAL PRIMARY KEY,
  tipo TEXT NOT NULL,
  ruta TEXT,
  plataforma TEXT,
  detalle JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_eventos_app_tipo ON eventos_app (tipo, created_at DESC);

ALTER TABLE eventos_app ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "eventos_app_service_role" ON eventos_app;
CREATE POLICY "eventos_app_service_role" ON eventos_app
  FOR ALL USING (auth.role() = 'service_role');

-- Todas las metricas del ecosistema en una sola consulta.
--
-- Va en una funcion y no en veinte consultas desde el panel porque cada
-- bloque cruza tablas distintas, y hacerlo por separado serian veinte
-- viajes de ida y vuelta cada vez que alguien abre la pagina.
--
-- Las ciudades se agrupan sin tildes: "Medellín" y "Medellin" son la misma,
-- y contarlas aparte partia el numero en dos.
--
-- El cuerpo completo esta en la base; ver la funcion metricas_ecosistema.
