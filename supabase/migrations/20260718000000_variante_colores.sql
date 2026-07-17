-- ════════════════════════════════════════════
-- COLORES DE VARIANTES (override editable desde el admin)
-- ════════════════════════════════════════════
-- Color propio (no depende de swatches nativos de Shopify) asignado a una
-- variante especifica, editable desde el constructor de productos del
-- admin. apps/shop lo lee con el cliente publico y, si existe, tiene
-- prioridad sobre el swatch nativo de Shopify (lib/shopify.ts).
CREATE TABLE IF NOT EXISTS variante_colores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  producto_handle TEXT NOT NULL,
  variant_id TEXT NOT NULL UNIQUE,
  color_hex TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS variante_colores_producto_handle_idx ON variante_colores (producto_handle);

ALTER TABLE variante_colores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "variante_colores publico lectura" ON variante_colores;
CREATE POLICY "variante_colores publico lectura" ON variante_colores FOR SELECT USING (true);

DROP POLICY IF EXISTS "variante_colores solo service role escritura" ON variante_colores;
CREATE POLICY "variante_colores solo service role escritura" ON variante_colores FOR INSERT WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "variante_colores solo service role update" ON variante_colores;
CREATE POLICY "variante_colores solo service role update" ON variante_colores FOR UPDATE USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "variante_colores solo service role delete" ON variante_colores;
CREATE POLICY "variante_colores solo service role delete" ON variante_colores FOR DELETE USING (auth.role() = 'service_role');
