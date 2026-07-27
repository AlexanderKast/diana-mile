-- ════════════════════════════════════════════
-- CLICS AL BOTON DE WHATSAPP DE LA WEB
-- ════════════════════════════════════════════
--
-- Los anuncios de Click-to-WhatsApp ya se atribuyen solos: Meta manda un
-- ctwa_clid en el primer mensaje. Pero quien entra a la tienda por
-- organico, por el link de la bio o por un anuncio que lleva a la web y
-- DESPUES abre WhatsApp, llegaba sin nada. Esa venta se cerraba y Meta
-- nunca se enteraba de que la habia originado.
--
-- Aqui queda el rastro del clic. Cuando esa persona escribe, el webhook
-- busca el clic que le corresponde y recupera los cookies de Meta (_fbp y
-- _fbc) y los utm, que es lo que necesita la CAPI para cerrar el circulo.
--
-- El emparejamiento se hace por el TEXTO del mensaje, no por un codigo
-- metido en el chat: cada pagina manda un texto distinto, asi que el texto
-- ya identifica la pagina sin ensuciar la conversacion.

CREATE TABLE IF NOT EXISTS whatsapp_clics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- El texto exacto que se prellena. Es la llave del emparejamiento.
  mensaje TEXT NOT NULL,
  ruta TEXT,
  titulo TEXT,
  -- shop | linktree | www | app
  origen TEXT,

  -- Cookies del pixel de Meta. Sin esto la CAPI no puede unir la
  -- conversacion con la sesion de navegacion.
  fbp TEXT,
  fbc TEXT,

  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  referrer TEXT,

  -- Se llena cuando el webhook lo empareja con quien escribio.
  conversacion_id UUID REFERENCES whatsapp_conversaciones(id) ON DELETE SET NULL,
  emparejado_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- El webhook busca clics recientes sin emparejar con ese mismo texto. El
-- indice parcial mantiene barata esa consulta aunque la tabla crezca:
-- solo indexa lo que todavia esta pendiente.
CREATE INDEX IF NOT EXISTS idx_clics_pendientes
  ON whatsapp_clics (mensaje, created_at DESC)
  WHERE conversacion_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_clics_conversacion
  ON whatsapp_clics (conversacion_id);

ALTER TABLE whatsapp_clics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "clics_service_role" ON whatsapp_clics;
CREATE POLICY "clics_service_role" ON whatsapp_clics FOR ALL USING (auth.role() = 'service_role');
