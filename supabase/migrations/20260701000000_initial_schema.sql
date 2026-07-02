-- Leads capturados (personas que dieron datos sin comprar)
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  telefono TEXT NOT NULL,
  email TEXT,
  ciudad TEXT,
  producto_interes TEXT,
  fuente TEXT,
  utm_source TEXT,
  utm_campaign TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pedidos COD (espejo local de lo que se envia a Shopify)
CREATE TABLE IF NOT EXISTS pedidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shopify_order_id TEXT,
  nombre TEXT NOT NULL,
  telefono TEXT NOT NULL,
  direccion TEXT NOT NULL,
  barrio TEXT,
  ciudad TEXT NOT NULL,
  departamento TEXT,
  latitud DOUBLE PRECISION,
  longitud DOUBLE PRECISION,
  producto_nombre TEXT NOT NULL,
  producto_sku TEXT,
  variant_id TEXT,
  cantidad INTEGER DEFAULT 1,
  precio_total DECIMAL(10,2),
  estado TEXT DEFAULT 'pendiente',
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Configuracion del sitio (editable desde el admin)
CREATE TABLE IF NOT EXISTS config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clave TEXT UNIQUE NOT NULL,
  valor TEXT,
  tipo TEXT DEFAULT 'texto',
  descripcion TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admins: usuarios de Supabase Auth autorizados a usar /dashboard y /api/admin/**.
-- NEXT_PUBLIC_SUPABASE_ANON_KEY es publica, cualquiera puede auto-registrarse
-- contra Supabase Auth directo (bypass de nuestra UI de login). Por eso la
-- autorizacion real no es "hay sesion" sino "el user_id esta en esta tabla".
-- Esta tabla solo se lee con service_role (ver lib/supabase-server.ts).
CREATE TABLE IF NOT EXISTS admins (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO config (clave, valor, tipo, descripcion) VALUES
('linktree_links', '[{"label":"Tienda","url":"/productos","icon":"bag"},{"label":"WhatsApp","url":"https://wa.me/57XXXXXXXXXX","icon":"whatsapp"},{"label":"Instagram","url":"https://instagram.com/militolifeshop","icon":"instagram"},{"label":"TikTok","url":"https://tiktok.com/@militolifeshop","icon":"tiktok"}]', 'json', 'Links del linktree'),
('linktree_titulo', 'Milito Life Shop', 'texto', 'Titulo del linktree'),
('linktree_subtitulo', 'Bienestar · Anti-edad · Rituales de piel', 'texto', 'Subtitulo del linktree'),
('whatsapp_numero', '57XXXXXXXXXX', 'texto', 'Numero de WhatsApp para pedidos')
ON CONFLICT (clave) DO NOTHING;

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE config ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "config publico lectura" ON config;
CREATE POLICY "config publico lectura" ON config FOR SELECT USING (true);

DROP POLICY IF EXISTS "leads solo service role" ON leads;
CREATE POLICY "leads solo service role" ON leads FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "pedidos solo service role" ON pedidos;
CREATE POLICY "pedidos solo service role" ON pedidos FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "admins solo service role" ON admins;
CREATE POLICY "admins solo service role" ON admins FOR ALL USING (auth.role() = 'service_role');
