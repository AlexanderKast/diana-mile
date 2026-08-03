-- ════════════════════════════════════════════
-- SESION GRUPAL: SUSCRIPCION MENSUAL CON MERCADO PAGO
-- ════════════════════════════════════════════
--
-- Nivel 2 de la escalera de 3 (ver EscaleraOferta.tsx): sesion grupal de
-- entrenamiento con Milito, COL$399.000/mes, cobrada con Mercado Pago
-- (API de Suscripciones: /preapproval_plan + /preapproval). Independiente
-- de `usuarios_plan` a proposito — comprar la sesion grupal no requiere
-- haber hecho el quiz ni tener cuenta en el panel pre-venta, es una compra
-- de ecommerce comun (nombre + email), como un pedido de Shopify.
CREATE TABLE IF NOT EXISTS suscripciones_sesion_grupal (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  email TEXT NOT NULL,
  telefono TEXT,
  mercadopago_preapproval_id TEXT UNIQUE,
  estado TEXT NOT NULL DEFAULT 'pendiente'
    CHECK (estado IN ('pendiente', 'autorizada', 'pausada', 'cancelada')),
  monto NUMERIC(12, 2) NOT NULL DEFAULT 399000,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE suscripciones_sesion_grupal IS
  'Suscripcion mensual a la sesion grupal de entrenamiento con Milito (COL$399.000/mes), pagada con Mercado Pago. estado se actualiza desde el webhook de Mercado Pago (subscription_preapproval / subscription_authorized_payment).';

CREATE OR REPLACE FUNCTION suscripciones_sesion_grupal_tocar_actualizado_en()
RETURNS TRIGGER AS $$
BEGIN
  NEW.actualizado_en = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS suscripciones_sesion_grupal_actualizado_en ON suscripciones_sesion_grupal;
CREATE TRIGGER suscripciones_sesion_grupal_actualizado_en
  BEFORE UPDATE ON suscripciones_sesion_grupal
  FOR EACH ROW EXECUTE FUNCTION suscripciones_sesion_grupal_tocar_actualizado_en();

CREATE INDEX IF NOT EXISTS idx_suscripciones_sesion_grupal_estado
  ON suscripciones_sesion_grupal (estado);

CREATE INDEX IF NOT EXISTS idx_suscripciones_sesion_grupal_email
  ON suscripciones_sesion_grupal (email);

-- Sin politica de lectura propia: no hay sesion de usuario asociada a esta
-- compra (es email+nombre, sin cuenta) — mismo patron que quiz_respuestas,
-- solo el backend (service_role) entra. El panel admin la consulta con la
-- misma clave de servicio que usa para `pedidos`.
ALTER TABLE suscripciones_sesion_grupal ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "suscripciones_sesion_grupal_service_role" ON suscripciones_sesion_grupal;
CREATE POLICY "suscripciones_sesion_grupal_service_role" ON suscripciones_sesion_grupal
  FOR ALL USING (auth.role() = 'service_role');
