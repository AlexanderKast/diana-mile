-- Plantillas de referencia para "Landing magica": una imagen de layout por
-- tipo de seccion (las sube Alexander desde el admin). El generador adjunta
-- la plantilla activa del tipo como referencia de composicion en cada
-- llamada al modelo de imagen.

CREATE TABLE IF NOT EXISTS plantillas_secciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo_seccion TEXT NOT NULL,
  nombre TEXT NOT NULL,
  url_imagen TEXT NOT NULL,
  activa BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Una sola plantilla activa por tipo de seccion.
CREATE UNIQUE INDEX IF NOT EXISTS plantillas_secciones_activa_unica
  ON plantillas_secciones (tipo_seccion) WHERE activa;

-- Solo service_role (las APIs del admin).
ALTER TABLE plantillas_secciones ENABLE ROW LEVEL SECURITY;
