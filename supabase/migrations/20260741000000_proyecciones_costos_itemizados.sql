-- ════════════════════════════════════════════════════════════════════
-- ESCENARIOS DE PROYECCION CON COSTOS ITEMIZADOS
--
-- El escenario guardaba `margen_bruto` como un numero suelto. Ahora el
-- margen se DERIVA de los costos, asi que hay que guardar los costos: si
-- solo se guardara el margen, al abrir un escenario viejo no habria forma
-- de saber de que costos salio ni de recalcularlo cuando suba el flete.
--
-- `margen_bruto` se conserva y se sigue escribiendo, calculado en el
-- servidor a partir de estos mismos costos. Sirve para consultar y
-- comparar escenarios sin rehacer la aritmetica en SQL.
-- ════════════════════════════════════════════════════════════════════

ALTER TABLE proyecciones
  ADD COLUMN IF NOT EXISTS costo_mercancia DECIMAL(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS costo_logistico DECIMAL(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS costo_plataforma DECIMAL(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS costo_fulfillment DECIMAL(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS pct_recaudo DECIMAL(5,4) NOT NULL DEFAULT 0;

ALTER TABLE proyecciones
  DROP CONSTRAINT IF EXISTS proyecciones_margen_bruto_check;

-- El margen puede dar NEGATIVO, y tiene que poder guardarse asi: significa
-- que a esos costos cada venta deja saldo en contra. El CHECK original lo
-- prohibia (>= 0) y habria rechazado justo el escenario que mas urge ver.
ALTER TABLE proyecciones
  ALTER COLUMN margen_bruto TYPE DECIMAL(6,4),
  ALTER COLUMN margen_bruto SET DEFAULT 0;

ALTER TABLE proyecciones
  ADD CONSTRAINT proyecciones_margen_bruto_check CHECK (margen_bruto <= 1);

-- Dos escenarios con el mismo nombre son un error de dedo, no una
-- intencion: al guardar se actualiza el que ya existe.
CREATE UNIQUE INDEX IF NOT EXISTS idx_proyecciones_nombre
  ON proyecciones(lower(nombre));
