-- ════════════════════════════════════════════
-- FUNNEL PRE-VENTA: QUIZ, CUENTA LIGERA Y PROGRESO
-- ════════════════════════════════════════════
--
-- La cascada del funnel nuevo (app/(funnel)) es:
--
--   quiz_respuestas  →  usuarios_plan  →  plan_progreso / reto_progreso
--   (diagnostico,        (cuenta ligera,     (lo que la clienta desbloquea
--    sin cuenta aun)      link magico)         y completa dentro del panel)
--
-- Estas 4 tablas son NUEVAS y separadas a proposito de lo que ya existe:
--
--   · NO son `leads`. `leads` es el CRM comercial (pipeline de ventas,
--     scoring, WhatsApp). Una respuesta de quiz o una cuenta del panel no
--     es un lead comercial hasta que alguien decida convertirla en uno; no
--     se mezclan las tablas para no ensuciar el pipeline de ventas con
--     trafico de diagnostico que nunca escribe ni contesta.
--   · NO son `/cuenta` (`admins`, el OTP por WhatsApp). Ese es el area de
--     clientas que YA COMPRARON, gateada por pedido entregado. El panel
--     nuevo (`mi-plan`) es PRE-VENTA: se entra con el email por link
--     magico de Supabase Auth, no con un codigo de WhatsApp.
--
-- QUIEN ES DUEÑO DE UNA FILA
-- `usuarios_plan` no esta anclada 1:1 a un `auth.users` desde el insert:
-- el registro puede nacer del quiz (server, sin sesion) y solo mas tarde
-- la clienta confirma su email con el link magico. Por eso el emparejamiento
-- con la sesion autenticada es por EMAIL (`usuario_plan_actual()` abajo),
-- igual que `es_admin()` empareja por `user_id` en la tabla `admins`.

-- ── quiz_respuestas: el diagnostico, antes de que exista cuenta ─────────
--
-- Cada "puerta" de entrada (piel / energia / peso / sesion de negocio) tiene
-- su propio cuestionario. `respuestas` guarda las crudas tal como las dio la
-- persona; `score` y `segmento` son la lectura que hace el codigo sobre
-- ellas (igual que `leads.score`: se calcula en TypeScript, no aca).
-- `paso_abandono` existe para poder ver en que pregunta se cae la gente
-- cuando `completado` queda en false.
CREATE TABLE IF NOT EXISTS quiz_respuestas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  puerta TEXT NOT NULL
    CHECK (puerta IN ('piel', 'energia', 'peso', 'sesion', 'negocio')),
  respuestas JSONB NOT NULL DEFAULT '{}'::jsonb,
  score INTEGER,
  segmento TEXT,
  -- Codigo ISO (ej. 'CO', 'US'). No se valida contra una lista aca: la
  -- fuente es el formulario/geolocalizacion del funnel, no esta tabla.
  pais TEXT,
  -- Derivado de `pais` en codigo (packages/shared), no una eleccion libre:
  -- decide si la oferta que ve la persona es contraentrega en COP o el
  -- plan premium en USD.
  zona_oferta TEXT CHECK (zona_oferta IN ('co_cod', 'usd_premium')),
  fecha_objetivo DATE,
  completado BOOLEAN NOT NULL DEFAULT false,
  paso_abandono INTEGER,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE quiz_respuestas IS
  'Primer eslabon del funnel pre-venta: diagnostico respondido antes de que exista cuenta. Alimenta usuarios_plan.quiz_respuesta_id cuando la persona se registra.';

-- updated_at automatico, mismo patron que leads_tocar_updated_at (ver
-- 20260737000000_crm_lead_scoring.sql).
CREATE OR REPLACE FUNCTION quiz_respuestas_tocar_actualizado_en()
RETURNS TRIGGER AS $$
BEGIN
  NEW.actualizado_en = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS quiz_respuestas_actualizado_en ON quiz_respuestas;
CREATE TRIGGER quiz_respuestas_actualizado_en
  BEFORE UPDATE ON quiz_respuestas
  FOR EACH ROW EXECUTE FUNCTION quiz_respuestas_tocar_actualizado_en();

-- La consulta del embudo: cuantas respuestas hay por puerta y cuantas se
-- completaron. Va compuesto porque el dashboard siempre filtra por los dos.
CREATE INDEX IF NOT EXISTS idx_quiz_respuestas_puerta_completado
  ON quiz_respuestas (puerta, completado);

CREATE INDEX IF NOT EXISTS idx_quiz_respuestas_zona_oferta
  ON quiz_respuestas (zona_oferta);

-- Sin politica de lectura propia: el quiz se responde ANTES de que exista
-- sesion, asi que no hay con que emparejarlo todavia. Mismo patron que
-- `testimonios`/`acceso_intentos`: solo el backend (service_role) entra.
ALTER TABLE quiz_respuestas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "quiz_respuestas_service_role" ON quiz_respuestas;
CREATE POLICY "quiz_respuestas_service_role" ON quiz_respuestas
  FOR ALL USING (auth.role() = 'service_role');

-- ── usuarios_plan: la cuenta ligera del panel pre-venta ──────────────────
--
-- Separada de `admins` (login del dashboard) y de la sesion OTP de
-- `/cuenta` (clientas que ya compraron). El acceso a esta cuenta es el link
-- magico de Supabase Auth por email — ver AGENTS.md de esta tarea.
CREATE TABLE IF NOT EXISTS usuarios_plan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  telefono TEXT UNIQUE,
  nombre TEXT,
  quiz_respuesta_id UUID REFERENCES quiz_respuestas(id) ON DELETE SET NULL,
  pais TEXT,
  zona_oferta TEXT CHECK (zona_oferta IN ('co_cod', 'usd_premium')),
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ultimo_acceso TIMESTAMPTZ,
  -- Una fila sin ningun dato de contacto no es alcanzable por nadie: ni el
  -- link magico (necesita email) ni WhatsApp (necesita telefono).
  CONSTRAINT usuarios_plan_contacto_check
    CHECK (email IS NOT NULL OR telefono IS NOT NULL)
);

COMMENT ON TABLE usuarios_plan IS
  'Cuenta ligera del panel pre-venta (mi-plan), separada de admins y de la sesion OTP de /cuenta. Se entra por link magico de Supabase Auth (email); telefono/nombre pueden llegar antes, desde el quiz.';

-- `email` y `telefono` ya quedan indexados por el UNIQUE de arriba (Postgres
-- crea un indice unico automatico para cada columna UNIQUE) — no se
-- duplica el indice.
CREATE INDEX IF NOT EXISTS idx_usuarios_plan_zona_oferta
  ON usuarios_plan (zona_oferta);

-- Empareja la sesion autenticada (link magico, email en el JWT) con su
-- propia fila en usuarios_plan. SECURITY DEFINER por la misma razon que
-- es_admin(): la politica se evalua con el rol de quien consulta, y ese rol
-- no puede leer usuarios_plan libremente para buscarse a si mismo.
CREATE OR REPLACE FUNCTION usuario_plan_actual()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT id FROM usuarios_plan
  WHERE email IS NOT NULL
    AND lower(email) = lower(auth.jwt() ->> 'email')
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION usuario_plan_actual() FROM public;
GRANT EXECUTE ON FUNCTION usuario_plan_actual() TO authenticated;

ALTER TABLE usuarios_plan ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "usuarios_plan_service_role" ON usuarios_plan;
CREATE POLICY "usuarios_plan_service_role" ON usuarios_plan
  FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "usuarios_plan_lectura_propia" ON usuarios_plan;
CREATE POLICY "usuarios_plan_lectura_propia" ON usuarios_plan
  FOR SELECT TO authenticated
  USING (id = usuario_plan_actual());

-- ── plan_progreso: las 8 semanas del programa ────────────────────────────
--
-- Una fila por semana que la clienta desbloquea dentro del panel. No se
-- crean las 8 de una vez: `desbloqueada_en` queda NULL hasta que le toque.
CREATE TABLE IF NOT EXISTS plan_progreso (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES usuarios_plan(id) ON DELETE CASCADE,
  semana INTEGER NOT NULL CHECK (semana BETWEEN 1 AND 8),
  desbloqueada_en TIMESTAMPTZ,
  completada BOOLEAN NOT NULL DEFAULT false,
  notas TEXT,
  -- Una clienta no puede tener dos filas para la misma semana.
  CONSTRAINT plan_progreso_usuario_semana_unico UNIQUE (usuario_id, semana)
);

COMMENT ON TABLE plan_progreso IS
  'Avance semanal (1-8) del programa dentro del panel pre-venta. Una fila por usuario x semana.';

CREATE INDEX IF NOT EXISTS idx_plan_progreso_usuario
  ON plan_progreso (usuario_id);

ALTER TABLE plan_progreso ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "plan_progreso_service_role" ON plan_progreso;
CREATE POLICY "plan_progreso_service_role" ON plan_progreso
  FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "plan_progreso_lectura_propia" ON plan_progreso;
CREATE POLICY "plan_progreso_lectura_propia" ON plan_progreso
  FOR SELECT TO authenticated
  USING (usuario_id = usuario_plan_actual());

-- ── reto_progreso: el reto corto de 7 dias ───────────────────────────────
--
-- Programa aparte y mas corto que las 8 semanas (gancho de entrada rapido).
-- `completado_en` con timestamp en vez de un booleano: sirve para medir en
-- que dia exacto se completa cada uno, no solo si se completo.
CREATE TABLE IF NOT EXISTS reto_progreso (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES usuarios_plan(id) ON DELETE CASCADE,
  dia INTEGER NOT NULL CHECK (dia BETWEEN 1 AND 7),
  completado_en TIMESTAMPTZ,
  CONSTRAINT reto_progreso_usuario_dia_unico UNIQUE (usuario_id, dia)
);

COMMENT ON TABLE reto_progreso IS
  'Avance diario (1-7) del reto corto del funnel pre-venta. Una fila por usuario x dia.';

CREATE INDEX IF NOT EXISTS idx_reto_progreso_usuario
  ON reto_progreso (usuario_id);

ALTER TABLE reto_progreso ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reto_progreso_service_role" ON reto_progreso;
CREATE POLICY "reto_progreso_service_role" ON reto_progreso
  FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "reto_progreso_lectura_propia" ON reto_progreso;
CREATE POLICY "reto_progreso_lectura_propia" ON reto_progreso
  FOR SELECT TO authenticated
  USING (usuario_id = usuario_plan_actual());
