-- ════════════════════════════════════════════
-- ESCALAMIENTO A HUMANO
-- Cuando el agente no sabe algo, se calla y avisa a Diana.
-- ════════════════════════════════════════════

ALTER TABLE whatsapp_conversaciones
  ADD COLUMN IF NOT EXISTS escalado_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS motivo_escalado TEXT;

-- Para listar primero a quien lleva mas tiempo esperando respuesta humana.
CREATE INDEX IF NOT EXISTS whatsapp_conversaciones_escalado_idx
  ON whatsapp_conversaciones (escalado_at DESC NULLS LAST);
