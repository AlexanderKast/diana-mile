-- CRM: etapas de embudo, lead scoring y timeline de actividades.
--
-- POR QUE
-- Hasta ahora un lead tenia UN solo estado: `convertido` booleano. O compro o
-- no. Eso no permite saber a quien perseguir hoy, ni por que se perdio uno, ni
-- cuanto vale lo que hay abierto. Tampoco habia forma de unir un lead con su
-- conversacion de WhatsApp ni con su pedido: lo unico en comun era el telefono,
-- en texto y sin indice.
--
-- QUE SE AGREGA
--   · etapa      -> las 5 fases del embudo comercial
--   · score      -> 0-100, calculado en codigo (packages/shared/src/crm/scoring.ts)
--   · temperatura-> derivada del score, para leerla de un vistazo
--   · el resto de campos que un pipeline necesita para no ser un adorno
--   · lead_actividades -> el timeline, y la materia prima del score
--
-- OJO CON `estado` DE PEDIDOS
-- `pedidos.estado` es un pipeline OPERATIVO (pendiente -> enviado -> entregado).
-- `leads.etapa` es COMERCIAL (nuevo -> calificado -> ... -> cerrado). Son cosas
-- distintas y no deben mezclarse: un lead cerrado arranca un pedido pendiente.

-- ── leads: etapa y scoring ───────────────────────────────────────────────

ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS etapa TEXT NOT NULL DEFAULT 'nuevo',
  ADD COLUMN IF NOT EXISTS score INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS temperatura TEXT NOT NULL DEFAULT 'frio',
  ADD COLUMN IF NOT EXISTS probabilidad_cierre NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS valor_estimado NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS motivo_perdida TEXT,
  ADD COLUMN IF NOT EXISTS asignado_a TEXT,
  ADD COLUMN IF NOT EXISTS ultima_interaccion_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS pedido_id UUID REFERENCES pedidos(id) ON DELETE SET NULL;

-- Las 5 fases que pidio el negocio. El CHECK va en la base y no solo en
-- TypeScript porque a esta tabla tambien escribe el agente de WhatsApp.
ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_etapa_check;
ALTER TABLE leads ADD CONSTRAINT leads_etapa_check
  CHECK (etapa IN ('nuevo', 'calificado', 'negociacion', 'cerrado', 'perdido'));

ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_temperatura_check;
ALTER TABLE leads ADD CONSTRAINT leads_temperatura_check
  CHECK (temperatura IN ('frio', 'tibio', 'caliente'));

ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_score_check;
ALTER TABLE leads ADD CONSTRAINT leads_score_check
  CHECK (score >= 0 AND score <= 100);

-- Perder un lead sin decir por que es tirar el dato mas util del embudo: es lo
-- unico que dice si el problema es el precio, la cobertura o el producto.
ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_perdida_con_motivo;
ALTER TABLE leads ADD CONSTRAINT leads_perdida_con_motivo
  CHECK (etapa <> 'perdido' OR (motivo_perdida IS NOT NULL AND motivo_perdida <> ''));

-- Los leads que ya existen: los convertidos van a 'cerrado', el resto a 'nuevo'
-- (el default). Sin esto el tablero arrancaria mintiendo sobre lo ya vendido.
UPDATE leads SET etapa = 'cerrado' WHERE convertido = true AND etapa = 'nuevo';
UPDATE leads SET ultima_interaccion_at = created_at WHERE ultima_interaccion_at IS NULL;

-- ── Indices que nunca existieron ─────────────────────────────────────────
-- `telefono` es la unica llave real entre leads, pedidos y conversaciones, y
-- hasta hoy cada busqueda era un scan completo.
CREATE INDEX IF NOT EXISTS idx_leads_telefono ON leads(telefono);
CREATE INDEX IF NOT EXISTS idx_leads_etapa_score ON leads(etapa, score DESC);
CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_ultima_interaccion ON leads(ultima_interaccion_at DESC);

-- ── updated_at automatico ────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION leads_tocar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS leads_updated_at ON leads;
CREATE TRIGGER leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION leads_tocar_updated_at();

-- ── lead_actividades: el timeline ────────────────────────────────────────
-- Cada toque queda registrado. Es lo que alimenta el score (recencia, numero
-- de interacciones, objeciones) y lo que permite abrir una tarjeta y entender
-- en tres segundos que paso con esa persona.
CREATE TABLE IF NOT EXISTS lead_actividades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN (
    'mensaje_entrante',
    'mensaje_saliente',
    'llamada',
    'cambio_etapa',
    'nota',
    'pedido',
    'objecion'
  )),
  detalle TEXT,
  payload JSONB DEFAULT '{}'::jsonb,
  creado_por TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lead_actividades_lead
  ON lead_actividades(lead_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lead_actividades_tipo
  ON lead_actividades(tipo, created_at DESC);

ALTER TABLE lead_actividades ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lead_actividades solo service role" ON lead_actividades
  FOR ALL USING (auth.role() = 'service_role');

-- ── Vista del pipeline ───────────────────────────────────────────────────
-- Une lead + conversacion + pedido por telefono, para no repetir el join en
-- cada consulta del panel. Es una vista y no una tabla: el dato sigue viviendo
-- en un solo sitio.
CREATE OR REPLACE VIEW leads_pipeline AS
SELECT
  l.id,
  l.nombre,
  l.telefono,
  l.ciudad,
  l.producto_interes,
  l.fuente,
  l.etapa,
  l.score,
  l.temperatura,
  l.probabilidad_cierre,
  l.valor_estimado,
  l.motivo_perdida,
  l.asignado_a,
  l.convertido,
  l.pedido_id,
  l.ultima_interaccion_at,
  l.created_at,
  l.updated_at,
  c.id                AS conversacion_id,
  c.ia_activa,
  c.escalado_at,
  c.ultimo_experto,
  p.shopify_order_number,
  p.estado            AS pedido_estado,
  p.precio_total      AS pedido_total,
  (SELECT COUNT(*) FROM lead_actividades a WHERE a.lead_id = l.id) AS n_actividades
FROM leads l
LEFT JOIN whatsapp_conversaciones c ON c.telefono = l.telefono
LEFT JOIN pedidos p ON p.id = l.pedido_id;

COMMENT ON COLUMN leads.score IS
  '0-100. Lo calcula packages/shared/src/crm/scoring.ts, no la base: la logica se comparte entre el agente de WhatsApp y el panel.';
COMMENT ON COLUMN leads.probabilidad_cierre IS
  'Porcentaje estimado. Arranca con valores conservadores por etapa x temperatura; se recalibra cuando haya volumen real. No es un modelo entrenado.';
