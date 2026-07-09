-- ════════════════════════════════════════════
-- EXTENSIÓN DE TABLA PEDIDOS
-- ════════════════════════════════════════════
ALTER TABLE pedidos
  ADD COLUMN IF NOT EXISTS shopify_order_number TEXT,
  ADD COLUMN IF NOT EXISTS precio_venta DECIMAL(12,2),
  ADD COLUMN IF NOT EXISTS costo_producto DECIMAL(12,2),
  ADD COLUMN IF NOT EXISTS variante_nombre TEXT,
  ADD COLUMN IF NOT EXISTS canal_adquisicion TEXT, -- 'meta', 'tiktok', 'organico', 'whatsapp', 'referido'
  ADD COLUMN IF NOT EXISTS utm_source TEXT,
  ADD COLUMN IF NOT EXISTS utm_campaign TEXT,
  ADD COLUMN IF NOT EXISTS utm_content TEXT,
  ADD COLUMN IF NOT EXISTS intentos_llamada INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS confirmado_por TEXT,
  ADD COLUMN IF NOT EXISTS fecha_confirmacion TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS transportadora TEXT,
  ADD COLUMN IF NOT EXISTS numero_guia TEXT,
  ADD COLUMN IF NOT EXISTS fecha_envio DATE,
  ADD COLUMN IF NOT EXISTS fecha_entrega_estimada DATE,
  ADD COLUMN IF NOT EXISTS fecha_entrega_real DATE,
  ADD COLUMN IF NOT EXISTS costo_envio DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS valor_recaudado DECIMAL(12,2),
  ADD COLUMN IF NOT EXISTS devolucion_motivo TEXT,
  ADD COLUMN IF NOT EXISTS shopify_fulfillment_id TEXT,
  ADD COLUMN IF NOT EXISTS prioridad TEXT DEFAULT 'normal', -- 'normal', 'urgente', 'prioritario'
  ADD COLUMN IF NOT EXISTS tags TEXT[], -- array de etiquetas
  ADD COLUMN IF NOT EXISTS asignado_a TEXT; -- user_id del confirmador asignado

-- ════════════════════════════════════════════
-- ROLES DE USUARIO
-- ════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS usuario_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  nombre TEXT NOT NULL,
  rol TEXT NOT NULL CHECK (rol IN ('superadmin','admin','confirmador','logistica','financiero','readonly')),
  activo BOOLEAN DEFAULT true,
  ultimo_acceso TIMESTAMPTZ,
  creado_por TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ════════════════════════════════════════════
-- LOG DE CONFIRMACIONES (llamadas)
-- ════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS confirmaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id UUID NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  usuario_id TEXT NOT NULL,
  usuario_nombre TEXT,
  intento INTEGER DEFAULT 1,
  resultado TEXT NOT NULL CHECK (resultado IN (
    'confirmado',
    'rechazado',
    'no_contesta',
    'numero_invalido',
    'rellamar',
    'duplicado',
    'fraude'
  )),
  notas TEXT,
  duracion_segundos INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ════════════════════════════════════════════
-- GASTOS / EXPENSES
-- ════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS gastos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL CHECK (tipo IN (
    'publicidad_meta',
    'publicidad_tiktok',
    'publicidad_google',
    'publicidad_otro',
    'plataformas',   -- Shopify, Supabase, Vercel, etc.
    'logistica',     -- guías, empaques
    'producto',      -- costo de mercancía
    'nomina',        -- confirmadores, asesores
    'operativo',     -- otros gastos operativos
    'otro'
  )),
  descripcion TEXT NOT NULL,
  monto DECIMAL(14,2) NOT NULL,
  moneda TEXT DEFAULT 'COP',
  tasa_cambio DECIMAL(10,4) DEFAULT 1, -- para convertir USD a COP
  monto_cop DECIMAL(14,2), -- siempre en COP para comparar
  fecha DATE NOT NULL,
  periodo TEXT, -- 'YYYY-MM' para agrupar por mes
  pedido_id UUID REFERENCES pedidos(id), -- si aplica a un pedido
  comprobante_url TEXT,
  plataforma TEXT, -- cuenta de anuncios específica
  campana TEXT,    -- nombre de campaña
  registrado_por TEXT,
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ════════════════════════════════════════════
-- TRANSPORTADORAS (catálogo)
-- ════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS transportadoras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE, -- 'interrapidisimo', 'servientrega', etc.
  activa BOOLEAN DEFAULT true,
  url_tracking TEXT, -- URL base para tracking público
  contacto TEXT,
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO transportadoras (nombre, slug, url_tracking) VALUES
  ('Interrapidísimo', 'interrapidisimo', 'https://www.interrapidisimo.com/rastreo/?guia='),
  ('Servientrega', 'servientrega', 'https://www.servientrega.com/rastreo/?guia='),
  ('TCC', 'tcc', 'https://www.tcc.com.co/rastreo/?guia='),
  ('Coordinadora', 'coordinadora', 'https://www.coordinadora.com/rastreo/?guia='),
  ('Deprisa', 'deprisa', 'https://www.deprisa.com/rastreo/?guia='),
  ('Envia', 'envia', 'https://app.envia.co/rastreo/'),
  ('Otro', 'otro', NULL)
ON CONFLICT (slug) DO NOTHING;

-- ════════════════════════════════════════════
-- LOG DE ACTIVIDAD (audit trail)
-- ════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS actividad_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id TEXT,
  usuario_email TEXT,
  accion TEXT NOT NULL, -- 'pedido_confirmado', 'guia_asignada', 'estado_actualizado', etc.
  entidad TEXT NOT NULL, -- 'pedido', 'gasto', 'usuario', 'config'
  entidad_id TEXT,
  datos_anteriores JSONB,
  datos_nuevos JSONB,
  ip TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ════════════════════════════════════════════
-- CONFIG DEL SITIO (extender tabla config)
-- ════════════════════════════════════════════
INSERT INTO config (clave, valor, tipo, descripcion) VALUES
  ('costo_envio_base', '7500', 'numero', 'Costo base de envío en COP'),
  ('margen_objetivo_pct', '35', 'numero', 'Margen objetivo por pedido en %'),
  ('transportadora_default', 'interrapidisimo', 'texto', 'Transportadora por defecto'),
  ('shop_activo', 'true', 'booleano', 'Si la tienda está activa'),
  ('linktree_activo', 'true', 'booleano', 'Si el linktree está activo'),
  ('meta_pixel_id', '', 'texto', 'Meta Pixel ID'),
  ('tiktok_pixel_id', '', 'texto', 'TikTok Pixel ID'),
  ('hora_cierre_despacho', '15:00', 'texto', 'Hora límite de despacho del día')
ON CONFLICT (clave) DO NOTHING;

-- ════════════════════════════════════════════
-- RLS POLICIES
-- ════════════════════════════════════════════
ALTER TABLE confirmaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE gastos ENABLE ROW LEVEL SECURITY;
ALTER TABLE transportadoras ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuario_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE actividad_log ENABLE ROW LEVEL SECURITY;

-- Transportadoras: lectura pública (para el formulario de envío)
DROP POLICY IF EXISTS "transportadoras_select" ON transportadoras;
CREATE POLICY "transportadoras_select" ON transportadoras FOR SELECT USING (true);

-- Todo lo demás: solo service_role
DROP POLICY IF EXISTS "confirmaciones_service_role" ON confirmaciones;
CREATE POLICY "confirmaciones_service_role" ON confirmaciones FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "gastos_service_role" ON gastos;
CREATE POLICY "gastos_service_role" ON gastos FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "usuario_roles_service_role" ON usuario_roles;
CREATE POLICY "usuario_roles_service_role" ON usuario_roles FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "actividad_log_service_role" ON actividad_log;
CREATE POLICY "actividad_log_service_role" ON actividad_log FOR ALL USING (auth.role() = 'service_role');
