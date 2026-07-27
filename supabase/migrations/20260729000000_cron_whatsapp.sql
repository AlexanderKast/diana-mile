-- ════════════════════════════════════════════
-- CRON DEL CICLO DE WHATSAPP (en Supabase, no en Vercel)
-- ════════════════════════════════════════════
--
-- Vercel en plan Hobby solo admite crons diarios, y este ciclo
-- —reintentos del outbox, recordatorios, seguimientos y carritos— necesita
-- correr cada 15 minutos. Se resuelve con pg_cron, que ya viene con
-- Supabase y no depende del plan de Vercel.

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- El secreto no se escribe en la definicion del job: se guarda aparte y se
-- lee al llamar, para poder rotarlo sin recrear el cron y para que no
-- quede a la vista de quien liste cron.job.
CREATE TABLE IF NOT EXISTS cron_secretos (
  clave TEXT PRIMARY KEY,
  valor TEXT NOT NULL
);
ALTER TABLE cron_secretos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "cron_secretos_service_role" ON cron_secretos;
CREATE POLICY "cron_secretos_service_role" ON cron_secretos FOR ALL USING (auth.role() = 'service_role');

-- El valor real se carga aparte:
--   INSERT INTO cron_secretos (clave, valor) VALUES ('cron_secret', '<CRON_SECRET>')
--   ON CONFLICT (clave) DO UPDATE SET valor = EXCLUDED.valor;

CREATE OR REPLACE FUNCTION disparar_cron_whatsapp()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  secreto TEXT;
BEGIN
  SELECT valor INTO secreto FROM cron_secretos WHERE clave = 'cron_secret';
  IF secreto IS NULL THEN
    RAISE WARNING 'cron_whatsapp: falta el secreto, no se llama';
    RETURN;
  END IF;

  PERFORM net.http_get(
    url := 'https://shop.militolife.com/api/cron/whatsapp',
    headers := jsonb_build_object('Authorization', 'Bearer ' || secreto),
    timeout_milliseconds := 30000
  );
END;
$$;

SELECT cron.unschedule('whatsapp-ciclo')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'whatsapp-ciclo');

SELECT cron.schedule('whatsapp-ciclo', '*/15 * * * *', 'SELECT disparar_cron_whatsapp()');
