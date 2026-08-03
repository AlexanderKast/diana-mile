-- Identidad anonima del funnel: el UUID de la cookie propia `ml_visitante`
-- (1 año, emitida por apps/shop/proxy.ts). Liga todas las respuestas de
-- quiz de una misma persona ENTRE puertas — es lo que permite no repetirle
-- preguntas ya respondidas. No hay tabla de visitantes a proposito: la
-- cookie ES la identidad, la columna solo la persiste.
ALTER TABLE quiz_respuestas ADD COLUMN IF NOT EXISTS visitante_id UUID;
CREATE INDEX IF NOT EXISTS idx_quiz_respuestas_visitante
  ON quiz_respuestas (visitante_id) WHERE visitante_id IS NOT NULL;

COMMENT ON COLUMN quiz_respuestas.visitante_id IS
  'UUID de la cookie ml_visitante (identidad anonima cross-puerta). NULL en filas anteriores a la cookie o con cookies bloqueadas.';

-- Vinculo anonimo -> cuenta: cuando la persona se registra en /acceso, su
-- visitante_id queda en la cuenta y el historial anonimo queda unido a ella.
ALTER TABLE usuarios_plan ADD COLUMN IF NOT EXISTS visitante_id UUID;

COMMENT ON COLUMN usuarios_plan.visitante_id IS
  'UUID de la cookie ml_visitante con la que la persona respondio quizzes antes de registrarse.';
