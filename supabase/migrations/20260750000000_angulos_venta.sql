-- ════════════════════════════════════════════════════════════════════
-- ANGULOS DE VENTA
--
-- Un angulo es el BRIEF ESTRATEGICO de un producto: a quien le hablamos,
-- que dolor tiene, que desea, por que este producto y no otro. Es la
-- materia prima con la que despues se escribe el copy de cada seccion de
-- la landing. Un mismo producto puede tener varios angulos vivos a la
-- vez (el mismo serum vendido por "manchas" o por "arrugas" no lleva el
-- mismo brief), y de ahi que la llave sea handle + nombre y no el handle
-- solo.
--
-- `datos` es JSONB y no una columna por campo a proposito: el formulario
-- del angulo va a seguir creciendo (mas fotos, mas contexto, mas
-- parametros de personajes) y no tiene sentido pagar una migracion por
-- cada campo nuevo. El contrato de verdad vive en TypeScript, en
-- packages/shared/src/landing/angulo.ts, y todo lo que entra pasa por
-- `normalizarAngulo` antes de tocar esta tabla.
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS angulos_venta (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  producto_handle TEXT NOT NULL,
  nombre TEXT NOT NULL,
  datos JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- La lista del admin siempre es "los angulos de ESTE producto, el ultimo
-- tocado primero".
CREATE INDEX IF NOT EXISTS angulos_venta_handle
  ON angulos_venta (producto_handle, updated_at DESC);

-- Case-insensitive: "Manchas" y "manchas" son el mismo angulo, y dos
-- filas con el mismo nombre dejarian al admin sin forma de distinguirlas.
CREATE UNIQUE INDEX IF NOT EXISTS angulos_venta_nombre_unico
  ON angulos_venta (producto_handle, lower(nombre));

-- ════════════════════════════════════════════
-- updated_at automatico
-- ════════════════════════════════════════════
CREATE OR REPLACE FUNCTION angulos_tocar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_angulos_venta_updated ON angulos_venta;
CREATE TRIGGER trg_angulos_venta_updated
  BEFORE UPDATE ON angulos_venta
  FOR EACH ROW EXECUTE FUNCTION angulos_tocar_updated_at();

-- ════════════════════════════════════════════
-- RLS — solo service_role, igual que el resto del admin.
-- Sin policies: nadie llega con la clave anonima.
-- ════════════════════════════════════════════
ALTER TABLE angulos_venta ENABLE ROW LEVEL SECURITY;
