-- ════════════════════════════════════════════════════════════════════
-- TRM Y COSTOS EN DOLARES
--
-- Varias plataformas se pagan en dolares (Shopify, Vercel, Supabase) y
-- todo el modelo financiero vive en pesos. Convertir con "el dolar de
-- hoy" haria que la utilidad de un mes ya cerrado cambiara sola cada vez
-- que se mueve la divisa: se convierte con la tasa del DIA EN QUE SE
-- PAGO, y esa tasa se guarda.
--
-- Fuente: Tasa Representativa del Mercado de la Superintendencia
-- Financiera, publicada en datos.gov.co. Es la oficial, gratuita y sin
-- llave.
-- ════════════════════════════════════════════════════════════════════

-- `vigente_hasta` existe porque la TRM de un viernes rige tambien sabado,
-- domingo y festivos. Buscar por fecha exacta devolveria vacio justo los
-- dias en que no se publica.
CREATE TABLE IF NOT EXISTS tasas_cambio (
  fecha DATE PRIMARY KEY,
  vigente_hasta DATE NOT NULL,
  usd_cop DECIMAL(12,4) NOT NULL CHECK (usd_cop > 0),
  fuente TEXT NOT NULL DEFAULT 'superfinanciera',
  obtenida_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tasas_cambio_vigencia
  ON tasas_cambio(fecha, vigente_hasta);

-- Costos fijos en moneda extranjera.
--
-- `monto_origen` es lo que de verdad se paga (39 USD de Shopify).
-- `monto_cop` pasa a ser el valor convertido mas reciente: sirve para
-- mostrar rapido, pero el calculo de un mes concreto usa la TRM del dia
-- de cobro de ESE mes.
--
-- `dia_cobro` importa: el dolar del 5 no es el del 28.
ALTER TABLE costos_fijos
  ADD COLUMN IF NOT EXISTS moneda TEXT NOT NULL DEFAULT 'COP'
    CHECK (moneda IN ('COP', 'USD')),
  ADD COLUMN IF NOT EXISTS monto_origen DECIMAL(14,2),
  ADD COLUMN IF NOT EXISTS dia_cobro INTEGER
    CHECK (dia_cobro IS NULL OR (dia_cobro >= 1 AND dia_cobro <= 28)),
  -- Lo que el banco cobro de verdad, cuando se sabe. Manda sobre la TRM:
  -- la tarjeta suma su propio margen y el 4x1000, asi que la TRM sola
  -- subestima el costo real.
  ADD COLUMN IF NOT EXISTS monto_cop_real DECIMAL(14,2);

COMMENT ON COLUMN costos_fijos.monto_origen IS
  'Lo que se paga en la moneda original. En COP es igual a monto_cop.';
COMMENT ON COLUMN costos_fijos.dia_cobro IS
  'Dia del mes en que se cobra. Se topa en 28 para que exista en febrero.';
COMMENT ON COLUMN costos_fijos.monto_cop_real IS
  'Lo que el banco cobro de verdad. Manda sobre la conversion por TRM.';

UPDATE costos_fijos
   SET monto_origen = monto_cop
 WHERE monto_origen IS NULL;

ALTER TABLE tasas_cambio ENABLE ROW LEVEL SECURITY;
