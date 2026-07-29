-- Auto-optimizacion del rotador (Thompson sampling). Por producto se elige:
--   modo 'rotacion' = reparto parejo round-robin (default, como hasta ahora)
--   modo 'auto'     = bandit: mas trafico a la variante que mas convierte
-- La metrica de conversion es configurable: pedidos o clics a WhatsApp.

ALTER TABLE landing_rotacion
  ADD COLUMN IF NOT EXISTS modo TEXT NOT NULL DEFAULT 'rotacion'
    CHECK (modo IN ('rotacion', 'auto'));
ALTER TABLE landing_rotacion
  ADD COLUMN IF NOT EXISTS metrica TEXT NOT NULL DEFAULT 'pedidos'
    CHECK (metrica IN ('pedidos', 'clics'));

-- Config de rotacion de un producto (crea la fila si no existe).
CREATE OR REPLACE FUNCTION config_rotacion(p_handle TEXT)
RETURNS TABLE (modo TEXT, metrica TEXT)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT r.modo, r.metrica FROM landing_rotacion r
  WHERE r.producto_handle = p_handle;
$$;

-- Datos para el bandit: por variante ACTIVA del producto, visitas y
-- conversiones de los ultimos 30 dias. Ventana movil a proposito: si un
-- angulo se desgasta, el sistema lo nota en semanas, no arrastra meses.
CREATE OR REPLACE FUNCTION estadisticas_landing(p_handle TEXT, p_metrica TEXT)
RETURNS TABLE (slug TEXT, visitas BIGINT, conversiones BIGINT)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  WITH ventana AS (SELECT NOW() - INTERVAL '30 days' AS desde)
  SELECT
    v.slug,
    (SELECT COUNT(*) FROM visitas vi, ventana
      WHERE vi.ruta = '/l/' || v.slug AND vi.created_at >= ventana.desde) AS visitas,
    CASE WHEN p_metrica = 'clics' THEN
      (SELECT COUNT(*) FROM whatsapp_clics wc, ventana
        WHERE wc.landing_variante = v.slug AND wc.created_at >= ventana.desde)
    ELSE
      (SELECT COUNT(*) FROM pedidos p, ventana
        WHERE p.landing_variante = v.slug AND p.created_at >= ventana.desde)
    END AS conversiones
  FROM landing_variantes v
  WHERE v.producto_handle = p_handle AND v.estado = 'activa'
  ORDER BY v.posicion, v.created_at;
$$;

REVOKE EXECUTE ON FUNCTION config_rotacion(TEXT) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION estadisticas_landing(TEXT, TEXT) FROM anon, authenticated;

-- Las visitas de variantes se cuentan por ruta en cada request de /go en
-- modo auto: sin este indice cada eleccion escanea la tabla entera.
CREATE INDEX IF NOT EXISTS idx_visitas_ruta_fecha
  ON visitas (ruta, created_at DESC);
