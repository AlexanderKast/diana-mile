-- Biblioteca de referencias de LAYOUT para "Landing magica". Son capturas de
-- anuncios que alimentan al modelo de imagen como inspiracion de
-- composicion: NUNCA se muestran al usuario ni se publican en una landing.
-- Por eso el bucket es privado y se lee solo con download() desde el
-- servidor (sin URL firmada que pueda filtrarse).

CREATE TABLE IF NOT EXISTS referencias_secciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo_seccion TEXT NOT NULL,
  ruta_storage TEXT NOT NULL UNIQUE,   -- "hero/hero-<uuid>.png"
  carpeta_origen TEXT NOT NULL,        -- auditoria del mapeo carpeta -> tipo
  apta BOOLEAN NOT NULL DEFAULT true,  -- apagar una referencia mala sin borrarla
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS referencias_secciones_tipo
  ON referencias_secciones (tipo_seccion) WHERE apta;

INSERT INTO storage.buckets (id, name, public)
VALUES ('referencias-secciones', 'referencias-secciones', false)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE referencias_secciones ENABLE ROW LEVEL SECURITY;

-- ORDER BY random() no se puede pedir por PostgREST: va como funcion. Un
-- solo round trip que no crece con el tamano de la biblioteca.
CREATE OR REPLACE FUNCTION referencia_seccion_aleatoria(p_tipo TEXT)
RETURNS TABLE (id UUID, ruta_storage TEXT)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT r.id, r.ruta_storage
  FROM referencias_secciones r
  WHERE r.tipo_seccion = p_tipo AND r.apta
  ORDER BY random()
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION referencia_seccion_aleatoria(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION referencia_seccion_aleatoria(TEXT) FROM anon, authenticated;
