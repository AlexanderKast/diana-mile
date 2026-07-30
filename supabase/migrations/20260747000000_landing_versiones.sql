-- Historial de versiones de landings: cada guardado archiva la version
-- anterior con su autor. Seguro contra "alguien dano la landing ganadora
-- y nadie sabe cuando".

CREATE TABLE IF NOT EXISTS landing_versiones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- 'variante:<uuid>' o 'producto:<handle>'
  referencia TEXT NOT NULL,
  contenido JSONB NOT NULL,
  autor TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_landing_versiones_ref
  ON landing_versiones (referencia, created_at DESC);

-- Solo service_role (se lee y escribe desde las APIs del admin).
ALTER TABLE landing_versiones ENABLE ROW LEVEL SECURITY;
