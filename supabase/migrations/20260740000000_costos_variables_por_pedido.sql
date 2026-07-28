-- ════════════════════════════════════════════════════════════════════
-- COSTOS VARIABLES POR PEDIDO
--
-- Costos que escalan con cada venta. Hasta ahora el unico que se
-- registraba era el flete (`costo_envio`, que se captura al marcar el
-- envio). El resto se perdia, asi que la utilidad salia alta aunque el
-- producto ya estuviera costeado.
--
-- Se separan por el MOMENTO en que se conocen, no por tipo:
--
--   · plataforma y fulfillment se saben al vender
--       -> se congelan al crear el pedido
--   · recaudo se sabe al entregar (es un % de lo que de verdad se cobro)
--       -> se registra en ese momento
--
-- Igual que `costo_producto`, se congelan para que la utilidad de un mes
-- ya cerrado no cambie sola cuando alguien actualiza un parametro.
--
-- La comision de recaudo es propia de contraentrega y no la tenia nadie:
-- la transportadora cobra un porcentaje por recibir el efectivo en la
-- puerta. Sobre un ticket alto no es menor, y crece con la venta.
-- ════════════════════════════════════════════════════════════════════

ALTER TABLE pedidos
  ADD COLUMN IF NOT EXISTS costo_plataforma DECIMAL(12,2),
  ADD COLUMN IF NOT EXISTS costo_fulfillment DECIMAL(12,2),
  ADD COLUMN IF NOT EXISTS costo_recaudo DECIMAL(12,2);

COMMENT ON COLUMN pedidos.costo_plataforma IS
  'Comision de pasarela/plataforma. Congelado al crear el pedido. NULL = no se sabe, nunca 0.';
COMMENT ON COLUMN pedidos.costo_fulfillment IS
  'Empaque, picking y alistamiento. Congelado al crear el pedido.';
COMMENT ON COLUMN pedidos.costo_recaudo IS
  'Lo que cobra la transportadora por recaudar el efectivo. Se registra al entregar, sobre el valor recaudado.';

CREATE INDEX IF NOT EXISTS idx_pedidos_sin_costear
  ON pedidos(created_at DESC)
  WHERE costo_producto IS NULL OR costo_plataforma IS NULL;

INSERT INTO config (clave, valor, descripcion) VALUES
  ('fin_costo_fulfillment_default', '2000',
   'Empaque, picking y alistamiento por pedido (COP). Se congela al crear el pedido.'),
  ('fin_pct_recaudo', '0.03',
   'Comision de la transportadora por recaudar el efectivo, como fraccion del valor recaudado (0.03 = 3%).')
ON CONFLICT (clave) DO NOTHING;
