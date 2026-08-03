-- ════════════════════════════════════════════
-- FUNNEL: GANCHO APAGADO PARA EL COACHING PAGO EN /comunidad
-- ════════════════════════════════════════════
--
-- La landing publica de la comunidad (app/(funnel)/comunidad) NO puede
-- mencionar "Circulo Milito" ni ningun plan pago todavia: se anuncia recien
-- cuando la comunidad tenga masa critica, decision de negocio de Alexander,
-- no tecnica. Esta clave deja el interruptor listo sin construir el
-- contenido: default 'false' (apagado), tipo 'booleano' igual que
-- shop_activo/linktree_activo (ver 20260703000000_admin_crm.sql). Activarla
-- es editar el valor desde /dashboard, no un deploy.
INSERT INTO config (clave, valor, tipo, descripcion) VALUES
  ('funnel_coaching_visible', 'false', 'booleano', 'Si la landing de comunidad (/comunidad) muestra el gancho hacia el coaching pago')
ON CONFLICT (clave) DO NOTHING;
