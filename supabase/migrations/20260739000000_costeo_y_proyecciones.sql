-- ════════════════════════════════════════════════════════════════════
-- COSTEO Y PROYECCIONES
--
-- Hasta ahora `pedidos.costo_producto` se LEIA en cuatro sitios
-- (financiero.ts, dashboard, reportes) y no se ESCRIBIA en ninguno.
-- Tampoco habia costo en Shopify: `inventoryItem.unitCost` estaba en null
-- en los 60 productos. O sea que toda utilidad que mostraba el panel se
-- calculaba como si la mercancia fuera gratis.
--
-- Esta migracion crea el lugar donde vive el costo y lo que se deriva de
-- el: costeo por producto, costos fijos del mes y proyeccion de ventas.
-- ════════════════════════════════════════════════════════════════════

-- ════════════════════════════════════════════
-- COSTO POR VARIANTE
--
-- Va por VARIANTE y no por producto porque el costo cambia con la
-- presentacion: un pack de 3 cuesta el triple que la unidad, y si se
-- costeara a nivel de producto el pack apareceria con un margen que no
-- existe.
--
-- `costo_unitario` es lo que Milito le paga a Nu Skin. Los otros dos son
-- los costos que el modelo BUHA separa y que Shopify no tiene donde
-- guardar: la comision de plataforma/pasarela y el flete + empaque.
-- ════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS costos_producto (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shopify_variant_id TEXT NOT NULL UNIQUE,
  shopify_product_id TEXT,
  producto_titulo TEXT,
  variante_titulo TEXT,

  -- NULL = todavia no se le puso costo. Es distinto de 0 (regalo o
  -- muestra), y esa diferencia es justo la que dispara la alerta: sin
  -- esto no se puede distinguir "no lo he cargado" de "no me cuesta".
  costo_unitario DECIMAL(12,2),
  costo_plataforma DECIMAL(12,2),
  costo_logistico DECIMAL(12,2),

  -- Margen objetivo propio, cuando este producto no se rige por el
  -- general de la tienda.
  margen_objetivo DECIMAL(5,4),

  actualizado_por TEXT,
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_costos_producto_product
  ON costos_producto(shopify_product_id);

-- Para listar rapido "los que les falta costo".
CREATE INDEX IF NOT EXISTS idx_costos_producto_sin_costo
  ON costos_producto(shopify_variant_id)
  WHERE costo_unitario IS NULL;

-- ════════════════════════════════════════════
-- COSTOS FIJOS MENSUALES
--
-- `gastos` ya existe pero es un registro puntual con fecha: sirve para
-- "pague $X de Meta el 12". Un costo fijo es otra cosa — se repite todos
-- los meses hasta que alguien lo da de baja, y es lo que permite
-- calcular el costo administrativo por venta sin volver a teclearlo cada
-- mes.
--
-- `vigente_hasta` NULL = sigue vivo. No se borra la fila al dar de baja
-- un costo: se le pone fecha de fin, para que los meses anteriores
-- sigan cuadrando.
-- ════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS costos_fijos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  categoria TEXT NOT NULL CHECK (categoria IN (
    'personal',        -- quien atiende, confirma, despacha
    'plataformas',     -- Shopify, Supabase, Vercel, Botcake
    'administrativo'   -- arriendo, servicios, contador, prestamos
  )),
  concepto TEXT NOT NULL,
  monto_cop DECIMAL(14,2) NOT NULL CHECK (monto_cop >= 0),
  vigente_desde DATE NOT NULL DEFAULT CURRENT_DATE,
  vigente_hasta DATE,
  registrado_por TEXT,
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT costos_fijos_vigencia_coherente
    CHECK (vigente_hasta IS NULL OR vigente_hasta >= vigente_desde)
);

CREATE INDEX IF NOT EXISTS idx_costos_fijos_vigentes
  ON costos_fijos(vigente_desde, vigente_hasta);

-- ════════════════════════════════════════════
-- ESCENARIOS DE PROYECCION
--
-- Se guarda el ESCENARIO (los supuestos), nunca los resultados: si se
-- guardaran los numeros calculados, al cambiar una formula los
-- escenarios viejos quedarian mostrando cifras que ya no salen de
-- ningun lado. Se recalculan siempre al abrirlos.
-- ════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS proyecciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  periodo TEXT NOT NULL,               -- 'YYYY-MM'

  inversion_publicidad DECIMAL(14,2) NOT NULL CHECK (inversion_publicidad >= 0),
  part_publicidad DECIMAL(5,4) NOT NULL CHECK (part_publicidad > 0 AND part_publicidad <= 1),
  ticket_promedio DECIMAL(12,2) NOT NULL CHECK (ticket_promedio > 0),
  margen_bruto DECIMAL(5,4) NOT NULL CHECK (margen_bruto >= 0 AND margen_bruto <= 1),
  tasa_despacho DECIMAL(5,4) NOT NULL CHECK (tasa_despacho > 0 AND tasa_despacho <= 1),
  tasa_entrega DECIMAL(5,4) NOT NULL CHECK (tasa_entrega > 0 AND tasa_entrega <= 1),
  costos_fijos_mes DECIMAL(14,2) NOT NULL DEFAULT 0 CHECK (costos_fijos_mes >= 0),

  -- Reparto del presupuesto de ads por producto y por estrategia.
  distribucion_productos JSONB DEFAULT '[]'::jsonb,
  distribucion_estrategias JSONB DEFAULT '[]'::jsonb,

  creado_por TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_proyecciones_periodo
  ON proyecciones(periodo DESC, created_at DESC);

-- ════════════════════════════════════════════
-- ALERTAS DESCARTADAS
--
-- Las alertas se calculan en vivo contra los datos reales; no hay tabla
-- de alertas. Lo unico que hace falta guardar es cuales decidio ignorar
-- alguien, y hasta cuando.
--
-- `silenciada_hasta` NULL = para siempre. Con fecha = "recuerdamelo
-- despues", que es lo que se quiere para algo como "faltan los costos
-- fijos de este mes": no es falso, es que todavia no toca.
-- ════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS alertas_descartadas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL,
  -- Que fila concreta se descarto ('' = la alerta entera, sin detalle).
  referencia TEXT NOT NULL DEFAULT '',
  silenciada_hasta TIMESTAMPTZ,
  descartada_por TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE (tipo, referencia)
);

CREATE INDEX IF NOT EXISTS idx_alertas_descartadas_vigentes
  ON alertas_descartadas(tipo, silenciada_hasta);

-- ════════════════════════════════════════════
-- CONFIGURACION FINANCIERA
--
-- Va en la tabla `config` que ya existe (misma que cod_tope_pedido), no
-- en una tabla nueva: es el mismo tipo de dato — un puñado de valores
-- editables desde el admin sin desplegar.
--
-- Los porcentajes vienen del modelo BUHA verificado contra la hoja:
-- publicidad 20% del precio de venta, admin 10%, margen objetivo 50%.
-- ════════════════════════════════════════════
INSERT INTO config (clave, valor, descripcion) VALUES
  ('fin_margen_objetivo', '0.50',
   'Margen bruto objetivo. Fija el precio sugerido: costo total / (1 - margen).'),
  ('fin_pct_publicidad', '0.20',
   'Publicidad como porcentaje del precio de venta, para el costeo por producto.'),
  ('fin_pct_admin', '0.10',
   'Carga administrativa como porcentaje del precio de venta, para el costeo por producto.'),
  ('fin_costo_plataforma_default', '5000',
   'Costo de plataforma/pasarela por pedido cuando la variante no tiene uno propio (COP).'),
  ('fin_costo_logistico_default', '16000',
   'Costo de flete + empaque por pedido cuando la variante no tiene uno propio (COP).')
ON CONFLICT (clave) DO NOTHING;

-- ════════════════════════════════════════════
-- updated_at automatico
-- ════════════════════════════════════════════
CREATE OR REPLACE FUNCTION finanzas_tocar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_costos_producto_updated ON costos_producto;
CREATE TRIGGER trg_costos_producto_updated
  BEFORE UPDATE ON costos_producto
  FOR EACH ROW EXECUTE FUNCTION finanzas_tocar_updated_at();

DROP TRIGGER IF EXISTS trg_costos_fijos_updated ON costos_fijos;
CREATE TRIGGER trg_costos_fijos_updated
  BEFORE UPDATE ON costos_fijos
  FOR EACH ROW EXECUTE FUNCTION finanzas_tocar_updated_at();

DROP TRIGGER IF EXISTS trg_proyecciones_updated ON proyecciones;
CREATE TRIGGER trg_proyecciones_updated
  BEFORE UPDATE ON proyecciones
  FOR EACH ROW EXECUTE FUNCTION finanzas_tocar_updated_at();

-- ════════════════════════════════════════════
-- RLS — todo por service_role, igual que gastos y confirmaciones.
-- Sin policies: nadie llega con la clave anonima.
-- ════════════════════════════════════════════
ALTER TABLE costos_producto ENABLE ROW LEVEL SECURITY;
ALTER TABLE costos_fijos ENABLE ROW LEVEL SECURITY;
ALTER TABLE proyecciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE alertas_descartadas ENABLE ROW LEVEL SECURITY;
