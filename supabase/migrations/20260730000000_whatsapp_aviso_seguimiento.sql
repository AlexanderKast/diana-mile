-- Marca de que ya se le mando el recordatorio de "sigo revisando lo tuyo".
-- Sin esto, el vigilante repetiria el mensaje en cada corrida del cron.
ALTER TABLE whatsapp_conversaciones
  ADD COLUMN IF NOT EXISTS aviso_seguimiento_at TIMESTAMPTZ;
