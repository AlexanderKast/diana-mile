/**
 * Fuente unica de los datos de despacho y entrega.
 *
 * POR QUE EXISTE ESTE ARCHIVO
 * "Envio 24-72h" estaba escrito a mano en siete sitios (ScarcityBar,
 * TrustBadges, GuaranteeSection, ProductHeroCTA, TestimonialsSection,
 * product-content y los prompts de las landings generadas), y era falso en
 * casi todo el pais. Con el dato duplicado no hay forma de corregirlo una
 * vez: se corrige en un componente y sigue mintiendo en los otros seis.
 *
 * DE DONDE SALEN LAS CIFRAS
 * De `cobertura_entrega`, que es el dato real de la transportadora:
 *
 *   1-2 dias habiles →    10 municipios (Medellin y su area metropolitana)
 *   3-5 dias habiles → 2.201 municipios (incluye Bogota, Cali, Barranquilla,
 *                                        Cartagena y Bucaramanga)
 *   6-8 dias habiles →   118 municipios
 *
 * Osea que 24-72h (1 a 3 dias) se cumple en 10 de 2.329 municipios. Ni
 * siquiera en las "ciudades principales": todas menos Medellin son 3-5.
 * Prometer 24-72h en la pagina de producto es publicidad enganosa (Ley
 * 1480) y es la causa numero uno de una devolucion en contraentrega: la
 * clienta ya no lo quiere cuando llega al cuarto dia.
 *
 * COMO SE ACTUALIZA
 * Si la transportadora cambia sus tiempos, se actualiza `cobertura_entrega`
 * y se revisan estas constantes contra la consulta de arriba. Cuando ya se
 * conoce la ciudad de la clienta, NO se usa esto: se usa su fila exacta de
 * `cobertura_entrega`, que es mas preciso y mas convincente.
 */

/**
 * Ciudad desde la que sale el despacho.
 *
 * Deducida de los datos: los unicos 10 municipios con entrega en 1-2 dias
 * son Medellin y su area metropolitana (Bello, Envigado, Itagui, Sabaneta,
 * La Estrella, Caldas, Copacabana, Girardota, Barbosa). Bogota figura en
 * 3-5 dias, que es incompatible con despachar desde alli.
 */
export const CIUDAD_DESPACHO = "Medellín";

/** Hora de corte real de despacho, en horario de Colombia (UTC-5). */
export const HORA_CORTE_DESPACHO = 10;

/** Donde se entrega en 1-2 dias habiles. */
export const ENTREGA_RAPIDA = "Medellín y su área metropolitana";

/**
 * Linea corta para badges y botones. No promete un plazo porque en un badge
 * no cabe el matiz, y un plazo sin matiz es el que genera la devolucion.
 */
export const ENTREGA_BADGE = "Envío a todo el país";

/** Linea completa, para donde si hay espacio de decir la verdad entera. */
export const ENTREGA_DETALLE =
  "1 a 2 días hábiles en Medellín y su área metropolitana · 3 a 5 en el resto del país";

/** Version compacta del detalle, para bloques estrechos. */
export const ENTREGA_DETALLE_CORTO =
  "1-2 días hábiles en Medellín · 3-5 en el resto del país";
