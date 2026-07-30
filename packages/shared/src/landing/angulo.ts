/**
 * Contrato del ANGULO DE VENTA.
 *
 * Un angulo es el brief estrategico con el que se genera la landing de un
 * producto: a quien le hablamos, que le duele, que desea, por que este
 * producto. No es copy final — es la materia prima que despues alimenta
 * el copy de cada seccion.
 *
 * Vive en la tabla `angulos_venta` dentro de una columna JSONB, asi que
 * este archivo es el UNICO sitio donde el formato esta definido: la base
 * no valida nada. Todo lo que entra (formulario del admin o respuesta de
 * Mistral) pasa por `normalizarAngulo` antes de guardarse.
 */

/** Los 11 tipos de seccion que la landing magica sabe renderizar. */
export const TIPOS_SECCION_VALIDOS = [
  "hero",
  "oferta",
  "beneficios",
  "comparativa",
  "autoridad",
  "uso",
  "sensorial",
  "testimonios",
  "antes_despues",
  "logistica",
  "faq",
] as const;

export type TipoSeccion = (typeof TIPOS_SECCION_VALIDOS)[number];

/**
 * Tope de cada campo de texto. Son campos de brief, no de copy: si uno se
 * desborda, el prompt que los concatena se come el presupuesto de tokens
 * y el modelo empieza a truncar por su cuenta, en silencio.
 */
export const LIMITE_TEXTO = 700;

/**
 * 9:16 es el formato por defecto: las secciones se apilan en una landing que
 * se ve en el celular, y el vertical largo es el que llena la pantalla sin
 * dejar la seccion a medio cuadro.
 */
export type ProporcionAngulo = "9:16" | "3:4" | "4:5";
export type SexoPersonajes = "femenino" | "masculino" | "mixto";

export type UnidadOferta = {
  cantidad: 1 | 2 | 3;
  /** Precio en COP, entero. Una sola moneda en todo el repo. */
  precio: number;
  /** Precio tachado. `null` = no hay comparacion; jamas se inventa. */
  precio_comparacion: number | null;
};

export type AnguloVenta = {
  /**
   * Nombre del angulo ("Zona intima negra o percudida"). Vive en su propia
   * columna, no en `datos`, pero se adjunta aqui al leerlo porque es la
   * ENTRADA que dirige toda la generacion: el brief, el copy de cada
   * seccion y la direccion de arte se escriben para ESTE enfoque.
   */
  nombre?: string;
  nombre_producto: string;
  color_predominante?: string;
  proporcion: ProporcionAngulo;
  pais_venta: string;
  pais_logistica: string;
  detalles_producto: string;
  angulo_venta: string;
  problema: string;
  avatar: string;
  resultado_deseado: string;
  solucion_ideal: string;
  mecanismo_unico: string;
  instrucciones_adicionales: string;
  oferta: { unidades: UnidadOferta[] };
  personajes: {
    nacionalidad: string;
    sexo: SexoPersonajes;
    edad_min: number;
    edad_max: number;
  };
  /** Maximo 3, solo del CDN de Shopify. */
  fotos_producto: string[];
  /** Maximo 4, solo del CDN de Shopify: material oficial Nu Skin o fotos reales. */
  fotos_antes_despues: string[];
  secciones: string[];
};

export const ANGULO_VACIO: AnguloVenta = {
  nombre_producto: "",
  proporcion: "9:16",
  pais_venta: "Colombia",
  pais_logistica: "Colombia",
  detalles_producto: "",
  angulo_venta: "",
  problema: "",
  avatar: "",
  resultado_deseado: "",
  solucion_ideal: "",
  mecanismo_unico: "",
  instrucciones_adicionales: "",
  oferta: { unidades: [] },
  personajes: {
    nacionalidad: "Colombia",
    sexo: "femenino",
    edad_min: 30,
    edad_max: 55,
  },
  fotos_producto: [],
  fotos_antes_despues: [],
  secciones: [],
};

const EDAD_MINIMA = 18;
const EDAD_MAXIMA = 90;

function texto(valor: unknown, porDefecto = ""): string {
  if (typeof valor !== "string") return porDefecto;
  return valor.trim().slice(0, LIMITE_TEXTO);
}

/** Entero no negativo en COP. Cualquier basura cae a 0. */
function pesos(valor: unknown): number {
  const numero = typeof valor === "string" ? Number(valor) : valor;
  if (typeof numero !== "number" || !Number.isFinite(numero) || numero < 0) {
    return 0;
  }
  return Math.round(numero);
}

/**
 * El precio tachado solo existe si es un numero mayor que cero. Un 0 o un
 * campo vacio significan "no hay comparacion", no "vale cero": pintar un
 * tachado de $0 seria una oferta falsa.
 */
function pesosOpcionales(valor: unknown): number | null {
  if (valor === null || valor === undefined || valor === "") return null;
  const numero = typeof valor === "string" ? Number(valor) : valor;
  if (typeof numero !== "number" || !Number.isFinite(numero) || numero <= 0) {
    return null;
  }
  return Math.round(numero);
}

/**
 * Solo se aceptan fotos del CDN de Shopify. El prompt de imagen las manda
 * a un servicio externo que las descarga: una URL arbitraria seria un
 * SSRF de manual, y una que apunte a otro dominio se cae en produccion
 * sin que nadie se entere.
 */
function fotosDeShopify(valor: unknown, maximo: number): string[] {
  if (!Array.isArray(valor)) return [];
  const validas: string[] = [];
  for (const cruda of valor) {
    if (typeof cruda !== "string") continue;
    try {
      const url = new URL(cruda);
      if (url.protocol !== "https:") continue;
      if (url.hostname !== "cdn.shopify.com") continue;
      validas.push(cruda);
    } catch {
      // URL invalida: se descarta en silencio, el admin la ve faltar.
    }
    if (validas.length === maximo) break;
  }
  return validas;
}

function unaDe<T extends string>(
  valor: unknown,
  opciones: readonly T[],
  porDefecto: T,
): T {
  return opciones.includes(valor as T) ? (valor as T) : porDefecto;
}

function edad(valor: unknown, porDefecto: number): number {
  const numero = typeof valor === "string" ? Number(valor) : valor;
  if (typeof numero !== "number" || !Number.isFinite(numero)) return porDefecto;
  return Math.min(EDAD_MAXIMA, Math.max(EDAD_MINIMA, Math.round(numero)));
}

function normalizarUnidades(valor: unknown): UnidadOferta[] {
  if (!Array.isArray(valor)) return [];
  const unidades: UnidadOferta[] = [];
  for (const cruda of valor) {
    if (!cruda || typeof cruda !== "object") continue;
    const fila = cruda as Record<string, unknown>;
    const cantidad = Math.round(Number(fila.cantidad));
    if (cantidad !== 1 && cantidad !== 2 && cantidad !== 3) continue;
    unidades.push({
      cantidad: cantidad as 1 | 2 | 3,
      precio: pesos(fila.precio),
      precio_comparacion: pesosOpcionales(fila.precio_comparacion),
    });
  }
  return unidades;
}

/**
 * Deja cualquier entrada con la forma de un `AnguloVenta`.
 *
 * NUNCA lanza: se llama con lo que escribio el admin a medias y con lo que
 * respondio un modelo, y en ninguno de los dos casos un campo raro puede
 * tumbar el guardado. Lo que no se entiende se cae al default y el admin
 * lo ve vacio en el formulario.
 */
export function normalizarAngulo(crudo: unknown): AnguloVenta {
  const fuente = (
    crudo && typeof crudo === "object" ? crudo : {}
  ) as Record<string, unknown>;

  const oferta = (
    fuente.oferta && typeof fuente.oferta === "object" ? fuente.oferta : {}
  ) as Record<string, unknown>;
  const personajes = (
    fuente.personajes && typeof fuente.personajes === "object"
      ? fuente.personajes
      : {}
  ) as Record<string, unknown>;

  const edadMin = edad(personajes.edad_min, ANGULO_VACIO.personajes.edad_min);
  const edadMaxCruda = edad(
    personajes.edad_max,
    ANGULO_VACIO.personajes.edad_max,
  );

  const color = texto(fuente.color_predominante);

  return {
    nombre_producto: texto(fuente.nombre_producto),
    // Campo opcional: se omite si viene vacio, para que no quede un string
    // en blanco viajando al prompt de imagen como si fuera un color.
    ...(color ? { color_predominante: color } : {}),
    proporcion: unaDe(fuente.proporcion, ["9:16", "3:4", "4:5"] as const, "9:16"),
    pais_venta: texto(fuente.pais_venta, ANGULO_VACIO.pais_venta) ||
      ANGULO_VACIO.pais_venta,
    pais_logistica:
      texto(fuente.pais_logistica, ANGULO_VACIO.pais_logistica) ||
      ANGULO_VACIO.pais_logistica,
    detalles_producto: texto(fuente.detalles_producto),
    angulo_venta: texto(fuente.angulo_venta),
    problema: texto(fuente.problema),
    avatar: texto(fuente.avatar),
    resultado_deseado: texto(fuente.resultado_deseado),
    solucion_ideal: texto(fuente.solucion_ideal),
    mecanismo_unico: texto(fuente.mecanismo_unico),
    instrucciones_adicionales: texto(fuente.instrucciones_adicionales),
    oferta: { unidades: normalizarUnidades(oferta.unidades) },
    personajes: {
      nacionalidad:
        texto(
          personajes.nacionalidad,
          ANGULO_VACIO.personajes.nacionalidad,
        ) || ANGULO_VACIO.personajes.nacionalidad,
      sexo: unaDe(
        personajes.sexo,
        ["femenino", "masculino", "mixto"] as const,
        "femenino",
      ),
      edad_min: edadMin,
      // Un rango invertido (55-30) no se rechaza: se aplana al minimo, que
      // es lo que el admin queria decir al teclear el primer numero.
      edad_max: Math.max(edadMin, edadMaxCruda),
    },
    fotos_producto: fotosDeShopify(fuente.fotos_producto, 3),
    fotos_antes_despues: fotosDeShopify(fuente.fotos_antes_despues, 4),
    secciones: Array.isArray(fuente.secciones)
      ? fuente.secciones.filter(
          (s): s is TipoSeccion =>
            typeof s === "string" &&
            (TIPOS_SECCION_VALIDOS as readonly string[]).includes(s),
        )
      : [],
  };
}
