-- Fase 22: contenido diario dentro de cada semana del plan (168 dias:
-- 3 funnels x 8 semanas x 7 dias). El check-in ahora es por dia, no solo
-- semanal — se guarda como array de dias (1-7) marcados dentro de la fila
-- de la semana, sin necesidad de una tabla nueva.
ALTER TABLE plan_progreso
  ADD COLUMN IF NOT EXISTS dias_completados SMALLINT[] NOT NULL DEFAULT '{}';

COMMENT ON COLUMN plan_progreso.dias_completados IS
  'Dias (1-7) marcados como hechos dentro de esta semana del plan. Fase 22.';
