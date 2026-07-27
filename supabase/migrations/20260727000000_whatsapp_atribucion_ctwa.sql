-- ════════════════════════════════════════════
-- ATRIBUCION DE ANUNCIOS CLICK-TO-WHATSAPP
-- ════════════════════════════════════════════
--
-- Cuando alguien llega desde un anuncio de Click-to-WhatsApp, Meta incluye
-- un ctwa_clid en el objeto `referral` del primer mensaje. Ese id es lo
-- unico que conecta la venta con el anuncio que la origino: si no se
-- guarda ahi mismo, se pierde para siempre y la campana queda sin
-- atribucion aunque la compra si ocurra.

ALTER TABLE whatsapp_conversaciones
  ADD COLUMN IF NOT EXISTS ctwa_clid TEXT,
  -- Titulo del anuncio, source_id y demas: sirve para saber que creativo
  -- trae las conversaciones que mas cierran.
  ADD COLUMN IF NOT EXISTS origen_anuncio JSONB;

ALTER TABLE pedidos
  ADD COLUMN IF NOT EXISTS ctwa_clid TEXT,
  -- web | whatsapp — de donde salio el pedido.
  ADD COLUMN IF NOT EXISTS canal_venta TEXT;
