-- La tabla de pedidos del panel se actualiza en vivo. Para que el
-- navegador reciba los cambios necesita leer con la sesion del usuario, no
-- con service_role, asi que hace falta una politica de SELECT.
--
-- Tiene que ser SOLO para admins: los clientes de la tienda se autentican
-- contra este mismo proyecto (login por OTP en /cuenta), asi que abrirlo a
-- "authenticated" le daria a cualquier clienta los pedidos de todas.
--
-- La comprobacion va en una funcion SECURITY DEFINER porque la politica se
-- evalua con el rol de quien consulta, y ese rol no puede leer `admins`.
CREATE OR REPLACE FUNCTION es_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid());
$$;

REVOKE ALL ON FUNCTION es_admin() FROM public;
GRANT EXECUTE ON FUNCTION es_admin() TO authenticated;

DROP POLICY IF EXISTS "pedidos lectura admins" ON pedidos;
CREATE POLICY "pedidos lectura admins" ON pedidos
  FOR SELECT TO authenticated
  USING (es_admin());

ALTER PUBLICATION supabase_realtime ADD TABLE pedidos;
