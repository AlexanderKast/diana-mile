-- Rotador de landings: variantes ocultas por producto + rotación round-robin
-- y atribución de eventos (visita, clic WhatsApp, lead, pedido) a la variante.

-- La columna `sitio` la insertaba el código desde 20260744 pero ninguna
-- migración la creó (en producción se agregó a mano). Se formaliza aquí.
ALTER TABLE visitas ADD COLUMN IF NOT EXISTS sitio TEXT;

-- `pedidos` tenía utm_source/campaign/content pero no utm_medium.
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS utm_medium TEXT;

CREATE TABLE IF NOT EXISTS landing_variantes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  producto_handle TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  nombre TEXT NOT NULL,
  -- ProductLandingContent PARCIAL: solo los bloques que la variante
  -- sobrescribe; el resto lo hereda de la landing pública del producto.
  contenido JSONB NOT NULL DEFAULT '{}'::jsonb,
  estado TEXT NOT NULL DEFAULT 'activa' CHECK (estado IN ('activa', 'pausada')),
  posicion INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_landing_variantes_handle
  ON landing_variantes (producto_handle, estado);

ALTER TABLE landing_variantes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "landing_variantes publico lectura" ON landing_variantes;
CREATE POLICY "landing_variantes publico lectura" ON landing_variantes FOR SELECT USING (true);

DROP POLICY IF EXISTS "landing_variantes solo service role escritura" ON landing_variantes;
CREATE POLICY "landing_variantes solo service role escritura" ON landing_variantes FOR INSERT WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "landing_variantes solo service role update" ON landing_variantes;
CREATE POLICY "landing_variantes solo service role update" ON landing_variantes FOR UPDATE USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "landing_variantes solo service role delete" ON landing_variantes;
CREATE POLICY "landing_variantes solo service role delete" ON landing_variantes FOR DELETE USING (auth.role() = 'service_role');

-- Contador de rotación por producto. RLS sin políticas: solo service_role.
CREATE TABLE IF NOT EXISTS landing_rotacion (
  producto_handle TEXT PRIMARY KEY,
  contador BIGINT NOT NULL DEFAULT 0
);

ALTER TABLE landing_rotacion ENABLE ROW LEVEL SECURITY;

-- Incrementa el contador y devuelve el slug de la variante activa que toca
-- (round-robin estable por posicion). NULL si el producto no tiene activas.
CREATE OR REPLACE FUNCTION rotar_landing(p_handle TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  n BIGINT;
  elegido TEXT;
BEGIN
  INSERT INTO landing_rotacion (producto_handle, contador)
    VALUES (p_handle, 1)
    ON CONFLICT (producto_handle)
    DO UPDATE SET contador = landing_rotacion.contador + 1
    RETURNING contador INTO n;

  SELECT slug INTO elegido FROM (
    SELECT slug,
           ROW_NUMBER() OVER (ORDER BY posicion, created_at) - 1 AS idx,
           COUNT(*) OVER () AS total
    FROM landing_variantes
    WHERE producto_handle = p_handle AND estado = 'activa'
  ) v
  WHERE v.idx = (n % v.total);

  RETURN elegido;
END;
$$;

REVOKE EXECUTE ON FUNCTION rotar_landing(TEXT) FROM anon, authenticated;

-- Atribución por variante en los tres destinos de eventos.
ALTER TABLE pedidos        ADD COLUMN IF NOT EXISTS landing_variante TEXT;
ALTER TABLE whatsapp_clics ADD COLUMN IF NOT EXISTS landing_variante TEXT;
ALTER TABLE leads          ADD COLUMN IF NOT EXISTS landing_variante TEXT;
