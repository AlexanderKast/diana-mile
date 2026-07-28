import { crearRutaVisitas } from "@diana-mile/shared/analitica/visitas";

/**
 * Visitas de la tienda — y de www y app, que no tienen credenciales de
 * base de datos y publican aqui cruzando dominio (por eso el cuerpo va
 * como text/plain: ver el handler compartido).
 */
export const POST = crearRutaVisitas("shop");
