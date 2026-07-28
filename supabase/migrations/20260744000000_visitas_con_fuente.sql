-- ════════════════════════════════════════════════════════════════════
-- VISITAS CON FUENTE DE TRAFICO
--
-- El pixel de Meta cuenta visitas pero ese numero vive en Meta: aqui no
-- quedaba nada, asi que la pestaña de metricas no podia decir de donde
-- llega la gente. Esta tabla guarda UNA fila por sesion (no por
-- pageview) con la fuente ya derivada en el servidor a partir de utm,
-- click ids (fbclid/ttclid/gclid) y referrer.
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS visitas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fuente TEXT NOT NULL,
  medio TEXT NOT NULL DEFAULT 'organico' CHECK (medio IN ('organico', 'pago')),
  ruta TEXT,
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_visitas_fecha ON visitas(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_visitas_fuente ON visitas(fuente, created_at DESC);

ALTER TABLE visitas ENABLE ROW LEVEL SECURITY;
