-- ════════════════════════════════════════════
-- APRENDIZAJE DEL AGENTE
-- ════════════════════════════════════════════
--
-- Un modelo de lenguaje no aprende solo: sus pesos no cambian por
-- conversar. Lo que si se puede acumular son las respuestas que dio una
-- persona cuando el agente escalo, para devolverselas como contexto la
-- proxima vez que aparezca la misma duda.
--
-- La busqueda es por significado y no por palabras: "¿sirve en el
-- embarazo?" y "estoy embarazada, lo puedo usar?" son la misma pregunta
-- escrita distinto y por palabras clave no coincidirian.

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS whatsapp_aprendizaje (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pregunta TEXT NOT NULL,
  respuesta TEXT NOT NULL,
  embedding vector(1024),          -- mistral-embed
  origen TEXT NOT NULL DEFAULT 'humano',
  veces_usada INT NOT NULL DEFAULT 0,
  activa BOOLEAN NOT NULL DEFAULT TRUE,
  creado_por TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS whatsapp_aprendizaje_vec
  ON whatsapp_aprendizaje USING hnsw (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS whatsapp_aprendizaje_activa
  ON whatsapp_aprendizaje (activa);

CREATE TABLE IF NOT EXISTS whatsapp_pendientes_aprender (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telefono TEXT NOT NULL,
  pregunta TEXT NOT NULL,
  contexto TEXT,
  estado TEXT NOT NULL DEFAULT 'pendiente',
  aprendizaje_id UUID REFERENCES whatsapp_aprendizaje(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS whatsapp_pendientes_estado
  ON whatsapp_pendientes_aprender (estado, created_at DESC);

ALTER TABLE whatsapp_aprendizaje ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_pendientes_aprender ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "aprendizaje_service_role" ON whatsapp_aprendizaje;
CREATE POLICY "aprendizaje_service_role" ON whatsapp_aprendizaje FOR ALL USING (auth.role() = 'service_role');
DROP POLICY IF EXISTS "pendientes_service_role" ON whatsapp_pendientes_aprender;
CREATE POLICY "pendientes_service_role" ON whatsapp_pendientes_aprender FOR ALL USING (auth.role() = 'service_role');

-- Umbral alto a proposito: es preferible no encontrar nada y escalar, a
-- responder con algo parecido pero de otro tema.
CREATE OR REPLACE FUNCTION buscar_aprendizaje(
  consulta vector(1024),
  umbral FLOAT DEFAULT 0.75,
  tope INT DEFAULT 3
)
RETURNS TABLE (id UUID, pregunta TEXT, respuesta TEXT, similitud FLOAT)
LANGUAGE sql STABLE
AS $$
  SELECT a.id, a.pregunta, a.respuesta,
         1 - (a.embedding <=> consulta) AS similitud
  FROM whatsapp_aprendizaje a
  WHERE a.activa AND a.embedding IS NOT NULL
    AND 1 - (a.embedding <=> consulta) > umbral
  ORDER BY a.embedding <=> consulta
  LIMIT tope;
$$;

CREATE OR REPLACE FUNCTION incrementar_uso_aprendizaje(ids UUID[])
RETURNS void LANGUAGE sql AS $$
  UPDATE whatsapp_aprendizaje
  SET veces_usada = veces_usada + 1, updated_at = NOW()
  WHERE id = ANY(ids);
$$;
