-- El panel se actualiza por difusion desde la base, no por "postgres
-- changes".
--
-- Con postgres_changes el canal se suscribia bien pero no llegaba ni un
-- evento: Realtime evalua la politica de lectura contra cada fila y para
-- este caso no la resolvia, aunque la misma consulta con el JWT del admin
-- devuelve las filas sin problema. Con service_role —que se salta RLS— los
-- eventos llegaban, lo que senala justo a ese paso.
--
-- La difusion invierte el control: un disparador publica el cambio en un
-- canal, y quien puede escuchar ese canal se decide una sola vez sobre
-- realtime.messages. Ademas escala mejor, porque no hay que comprobar
-- permisos por fila y por suscriptor.
CREATE OR REPLACE FUNCTION pedidos_difundir_cambio()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, realtime
AS $$
BEGIN
  PERFORM realtime.broadcast_changes(
    'pedidos', TG_OP, TG_OP, TG_TABLE_NAME, TG_TABLE_SCHEMA, NEW, OLD
  );
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS pedidos_difundir ON pedidos;
CREATE TRIGGER pedidos_difundir
  AFTER INSERT OR UPDATE OR DELETE ON pedidos
  FOR EACH ROW EXECUTE FUNCTION pedidos_difundir_cambio();

-- Solo los admins escuchan ese canal. La comprobacion se hace una vez al
-- suscribirse, no por cada pedido que cambia.
DROP POLICY IF EXISTS "admins escuchan pedidos" ON realtime.messages;
CREATE POLICY "admins escuchan pedidos" ON realtime.messages
  FOR SELECT TO authenticated
  USING (realtime.topic() = 'pedidos' AND es_admin());
