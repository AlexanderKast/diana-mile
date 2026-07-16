-- ════════════════════════════════════════════
-- CONTENIDO PREMIUM (área de clientes /cuenta)
-- ════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS contenidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descripcion TEXT,
  tipo TEXT NOT NULL CHECK (tipo IN ('rutina', 'guia', 'plan_alimentacion')),
  cuerpo TEXT, -- contenido en markdown
  archivo_path TEXT, -- ruta en el bucket 'contenidos' (nullable, no todo contenido tiene descargable)
  publicado BOOLEAN DEFAULT false,
  orden INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bucket privado — el acceso a los archivos es solo via URL firmada
-- (createSignedUrl con service_role), nunca lectura publica directa.
INSERT INTO storage.buckets (id, name, public)
VALUES ('contenidos', 'contenidos', false)
ON CONFLICT (id) DO NOTHING;

-- ════════════════════════════════════════════
-- CONFIG: estados de pedido que dan acceso a contenido premium
-- ════════════════════════════════════════════
INSERT INTO config (clave, valor, tipo, descripcion) VALUES
  ('contenido_estados_acceso', '["confirmado","en_preparacion","enviado","entregado"]', 'json', 'Estados de pedido que desbloquean el contenido premium en /cuenta')
ON CONFLICT (clave) DO NOTHING;

-- ════════════════════════════════════════════
-- RLS POLICIES
-- ════════════════════════════════════════════
ALTER TABLE contenidos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "contenidos_service_role" ON contenidos;
CREATE POLICY "contenidos_service_role" ON contenidos FOR ALL USING (auth.role() = 'service_role');

-- Storage: el bucket 'contenidos' no tiene policies de storage.objects para
-- anon/authenticated — solo se accede via createSignedUrl con service_role
-- desde el servidor (ver api/cuenta/contenidos/[id]/descarga).
