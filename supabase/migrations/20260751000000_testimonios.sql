-- ════════════════════════════════════════════
-- TESTIMONIOS REALES DE CLIENTAS
-- ════════════════════════════════════════════
--
-- La tienda no tiene testimonios propios, y AGENTS.md prohibe inventarlos
-- (ademas de que en Colombia una resena fabricada es publicidad enganosa).
-- Se recolectan de clientas reales: se les pregunta por WhatsApp unos dias
-- despues de la entrega y se guarda lo que respondan, tal cual.
--
-- LA REGLA QUE NO SE NEGOCIA
-- Nada llega a una landing sin `estado = 'aprobado'` Y `consentimiento =
-- true`. Son dos cosas distintas y las dos las marca una persona:
--   - consentimiento: la clienta dijo que si se puede publicar.
--   - estado: alguien del equipo lo leyo y decidio publicarlo.
-- El sistema NO deduce el consentimiento del texto. "Me encanto" no es
-- permiso para publicar el nombre de alguien en una pagina de ventas.

CREATE TABLE IF NOT EXISTS testimonios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id UUID REFERENCES pedidos(id) ON DELETE SET NULL,
  telefono TEXT,
  producto_handle TEXT,
  texto TEXT NOT NULL,
  nombre TEXT,
  ciudad TEXT,
  estado TEXT NOT NULL DEFAULT 'pendiente'
    CHECK (estado IN ('pendiente','aprobado','rechazado')),
  consentimiento BOOLEAN NOT NULL DEFAULT false,
  solicitado_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- La consulta que hace el generador de landings: los aprobados de un
-- producto. Va por (handle, estado) porque siempre filtra por los dos.
CREATE INDEX IF NOT EXISTS idx_testimonios_handle_estado
  ON testimonios (producto_handle, estado);

-- Para que el cron no vuelva a pedirle testimonio a quien ya se le pidio.
-- Se marca aunque la clienta nunca responda: insistir es lo que hace que
-- bloqueen el numero.
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS testimonio_solicitado_at TIMESTAMPTZ;

-- Sin politicas: solo service_role entra. Un testimonio pendiente es el
-- mensaje privado de una clienta que todavia no autorizo nada; que sea
-- legible desde el cliente publico seria filtrar su opinion y su telefono.
ALTER TABLE testimonios ENABLE ROW LEVEL SECURITY;
