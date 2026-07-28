-- ════════════════════════════════════════════════════════════════════
-- METODO DE PAGO, COSTO DE DEVOLUCIONES Y CONSIGNACION
--
-- Tres fugas que el modulo financiero todavia no veia:
--
-- 1. Un COD devuelto pago flete de ida Y de vuelta sin dejar un peso.
--    Es la perdida mas grande de contraentrega y no se registraba en
--    ninguna parte — ni en lo real ni en la proyeccion.
--
-- 2. Todo se trataba como contraentrega. Un pago anticipado por
--    pasarela paga ~3% + cargo fijo + IVA sobre la comision, que se
--    conoce AL VENDER (a diferencia del recaudo, que se conoce al
--    entregar). Sin metodo_pago no habia donde congelar lo correcto.
--
-- 3. Entre la entrega y la consignacion, el recaudo esta en manos de la
--    transportadora. Sin fecha_consignacion no se puede saber cuanta
--    plata esta en transito ni hace cuanto — y una guia recaudada que
--    nunca se consigna es la fuga clasica de COD.
-- ════════════════════════════════════════════════════════════════════

ALTER TABLE pedidos
  ADD COLUMN IF NOT EXISTS metodo_pago TEXT NOT NULL DEFAULT 'contraentrega'
    CHECK (metodo_pago IN ('contraentrega', 'anticipado')),
  ADD COLUMN IF NOT EXISTS costo_devolucion DECIMAL(12,2),
  ADD COLUMN IF NOT EXISTS fecha_consignacion DATE;

COMMENT ON COLUMN pedidos.costo_devolucion IS
  'Flete de la devolucion, congelado al marcarla. NULL = no aplica o no se sabe.';
COMMENT ON COLUMN pedidos.fecha_consignacion IS
  'Dia en que la transportadora consigno el recaudo. NULL en entregado = efectivo en transito.';

CREATE INDEX IF NOT EXISTS idx_pedidos_sin_consignar
  ON pedidos(fecha_entrega_real)
  WHERE estado = 'entregado' AND fecha_consignacion IS NULL;

ALTER TABLE proyecciones
  ADD COLUMN IF NOT EXISTS pct_anticipado DECIMAL(5,4) NOT NULL DEFAULT 0
    CHECK (pct_anticipado >= 0 AND pct_anticipado <= 1),
  ADD COLUMN IF NOT EXISTS costo_flete_devolucion DECIMAL(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS pasarela_pct DECIMAL(5,4) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS pasarela_fijo DECIMAL(12,2) NOT NULL DEFAULT 0;

INSERT INTO config (clave, valor, descripcion) VALUES
  ('fin_pasarela_pct', '0.0299',
   'Comision porcentual de la pasarela de pago sobre el valor cobrado (0.0299 = 2.99%).'),
  ('fin_pasarela_fijo', '900',
   'Cargo fijo de la pasarela por transaccion, en COP.'),
  ('fin_iva_comision', '0.19',
   'IVA que la pasarela cobra sobre SU comision (no sobre la venta).'),
  ('fin_flete_devolucion', '16000',
   'Flete de retorno cuando un pedido se devuelve, en COP. La transportadora cobra la vuelta ademas de la ida.'),
  ('fin_iva_tarifa', '0.19',
   'Tarifa de IVA implicita en los precios de venta. Al legalizarse, esa fraccion de lo recaudado se debe.')
ON CONFLICT (clave) DO NOTHING;
