/**
 * Normalizacion y validacion de los datos que la clienta dicta por chat.
 *
 * Por WhatsApp la gente escribe rapido y con errores: "medellin", "bogota",
 * "antioqia", el celular con puntos o con el 57 adelante. Shopify es
 * estricto con el departamento —si `province` no coincide con su lista, se
 * come la direccion entera sin dar error— asi que nada de lo que escribe
 * la persona llega crudo: se normaliza aqui y, si no se puede resolver con
 * confianza, se le vuelve a preguntar.
 */

/** Departamentos tal como los espera Shopify. Debe calzar con lib/colombia.ts. */
export const DEPARTAMENTOS = [
  "Amazonas",
  "Antioquia",
  "Arauca",
  "Atlántico",
  "Bogotá D.C.",
  "Bolívar",
  "Boyacá",
  "Caldas",
  "Caquetá",
  "Casanare",
  "Cauca",
  "Cesar",
  "Chocó",
  "Córdoba",
  "Cundinamarca",
  "Guainía",
  "Guaviare",
  "Huila",
  "La Guajira",
  "Magdalena",
  "Meta",
  "Nariño",
  "Norte de Santander",
  "Putumayo",
  "Quindío",
  "Risaralda",
  "San Andrés y Providencia",
  "Santander",
  "Sucre",
  "Tolima",
  "Valle del Cauca",
  "Vaupés",
  "Vichada",
] as const;

/** Ciudades grandes cuyo departamento se puede deducir sin preguntar. */
const DEPARTAMENTO_POR_CIUDAD: Record<string, string> = {
  bogota: "Bogotá D.C.",
  medellin: "Antioquia",
  envigado: "Antioquia",
  itagui: "Antioquia",
  bello: "Antioquia",
  rionegro: "Antioquia",
  cali: "Valle del Cauca",
  palmira: "Valle del Cauca",
  buenaventura: "Valle del Cauca",
  barranquilla: "Atlántico",
  soledad: "Atlántico",
  cartagena: "Bolívar",
  cucuta: "Norte de Santander",
  bucaramanga: "Santander",
  floridablanca: "Santander",
  pereira: "Risaralda",
  manizales: "Caldas",
  armenia: "Quindío",
  ibague: "Tolima",
  neiva: "Huila",
  villavicencio: "Meta",
  pasto: "Nariño",
  monteria: "Córdoba",
  valledupar: "Cesar",
  santamarta: "Magdalena",
  sincelejo: "Sucre",
  popayan: "Cauca",
  tunja: "Boyacá",
  riohacha: "La Guajira",
  quibdo: "Chocó",
  florencia: "Caquetá",
  yopal: "Casanare",
  arauca: "Arauca",
  mocoa: "Putumayo",
  leticia: "Amazonas",
  soacha: "Cundinamarca",
  chia: "Cundinamarca",
  zipaquira: "Cundinamarca",
};

/** minusculas, sin tildes y sin espacios extra: para comparar. */
function clave(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

/** Distancia de edicion, para tolerar erratas de una o dos letras. */
function distancia(a: string, b: string): number {
  if (a === b) return 0;
  const fila = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let anterior = fila[0];
    fila[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const temp = fila[j];
      fila[j] = Math.min(
        fila[j] + 1,
        fila[j - 1] + 1,
        anterior + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
      anterior = temp;
    }
  }
  return fila[b.length];
}

/**
 * Resuelve lo que escribio la persona a un departamento valido de Shopify.
 * Devuelve null si no hay una coincidencia confiable — en ese caso hay que
 * preguntar, nunca adivinar: un departamento equivocado hace que Shopify
 * descarte la direccion completa.
 */
export function normalizarDepartamento(entrada: string): string | null {
  if (!entrada?.trim()) return null;
  const k = clave(entrada);

  const exacto = DEPARTAMENTOS.find((d) => clave(d) === k);
  if (exacto) return exacto;

  // Formas como "bogota dc", "bogota", "distrito capital".
  if (/^bogota/.test(k) || k === "distritocapital" || k === "dc") {
    return "Bogotá D.C.";
  }
  if (k.includes("sanandres")) return "San Andrés y Providencia";
  if (k.includes("nortedesantander") || k === "nsantander") {
    return "Norte de Santander";
  }
  if (k.includes("valle")) return "Valle del Cauca";
  if (k.includes("guajira")) return "La Guajira";

  // Erratas cortas: "antioqia", "cundinamarka".
  let mejor: { nombre: string; d: number } | null = null;
  for (const d of DEPARTAMENTOS) {
    const dist = distancia(k, clave(d));
    if (!mejor || dist < mejor.d) mejor = { nombre: d, d: dist };
  }
  // Se acepta solo si la diferencia es minima respecto al largo: asi
  // "antioqia" pasa pero "santander" no se convierte en "Santander" cuando
  // en realidad quiso decir "Norte de Santander".
  if (mejor && mejor.d <= Math.max(1, Math.floor(k.length * 0.2))) {
    return mejor.nombre;
  }

  return null;
}

/** Deduce el departamento por ciudad, para no preguntar de mas. */
export function departamentoPorCiudad(ciudad: string): string | null {
  if (!ciudad?.trim()) return null;
  return DEPARTAMENTO_POR_CIUDAD[clave(ciudad)] ?? null;
}

export type TelefonoNormalizado = {
  e164: string;
  display: string;
};

/**
 * Celular colombiano. Acepta lo que la gente escribe de verdad: con
 * espacios, puntos, guiones, con +57, con 57 o con 0057 adelante.
 */
export function normalizarCelular(
  entrada: string,
): TelefonoNormalizado | null {
  let digitos = (entrada ?? "").replace(/\D/g, "");
  if (digitos.startsWith("0057")) digitos = digitos.slice(4);
  else if (digitos.startsWith("57") && digitos.length === 12) {
    digitos = digitos.slice(2);
  }
  if (!/^3\d{9}$/.test(digitos)) return null;
  return {
    e164: `+57${digitos}`,
    display: `+57 ${digitos.slice(0, 3)} ${digitos.slice(3, 6)} ${digitos.slice(6)}`,
  };
}

export type DatosPedido = {
  nombre: string;
  telefono: string;
  departamento: string;
  ciudad: string;
  barrio: string;
  direccion: string;
};

/**
 * Comprueba que los datos que dice tener el modelo aparezcan de verdad en
 * lo que escribio la persona.
 *
 * Existe porque paso: el modelo cerro un pedido con una direccion sacada
 * de un ejemplo del prompt, no de la conversacion. Una direccion inventada
 * significa un envio perdido y un cliente enojado, asi que esto no se le
 * puede dejar al prompt: se verifica en codigo antes de tocar Shopify.
 *
 * La comparacion es por partes significativas (numeros y palabras largas):
 * la persona escribe "calle 10 numero 43-25" y el modelo lo normaliza a
 * "Calle 10 #43-25", que es correcto y debe pasar.
 */
export function datosConSustento(
  datos: { direccion: string; barrio: string; ciudad: string; nombre: string },
  mensajesDeLaPersona: string[],
): { ok: boolean; sinSustento: string[] } {
  const dicho = clave(mensajesDeLaPersona.join(" "));
  const sinSustento: string[] = [];

  const respalda = (valor: string, minimo: number): boolean => {
    const partes = valor
      .split(/[\s,.#\-()]+/)
      .map((p) => clave(p))
      .filter((p) => p.length >= 2 && !/^(de|la|el|los|las|del|apto|int|no)$/.test(p));
    if (!partes.length) return false;
    const presentes = partes.filter((p) => dicho.includes(p)).length;
    return presentes / partes.length >= minimo;
  };

  // La direccion es lo mas critico: se exige que la mayor parte de lo que
  // la compone haya salido de la boca de la clienta.
  if (!respalda(datos.direccion, 0.5)) sinSustento.push("direccion");
  if (!respalda(datos.barrio, 0.5)) sinSustento.push("barrio");
  if (!respalda(datos.ciudad, 0.5)) sinSustento.push("ciudad");
  // Del nombre basta con que una parte coincida: la gente da solo el
  // primer nombre y despues el apellido en otro mensaje.
  if (!respalda(datos.nombre, 0.34)) sinSustento.push("nombre");

  return { ok: sinSustento.length === 0, sinSustento };
}

export type ValidacionPedido =
  | { ok: true; datos: DatosPedido & { telefonoE164: string } }
  | { ok: false; faltantes: string[]; problemas: string[] };

/**
 * Revisa los datos antes de mandarlos a Shopify. Devuelve exactamente que
 * falta y que esta mal, para que el agente lo pregunte en concreto en vez
 * de pedir "los datos" otra vez.
 */
export function validarDatosPedido(
  parcial: Partial<DatosPedido>,
): ValidacionPedido {
  const faltantes: string[] = [];
  const problemas: string[] = [];

  const nombre = parcial.nombre?.trim() ?? "";
  // Shopify parte el nombre en nombre y apellido: uno solo deja el pedido
  // a medias y complica la entrega.
  if (!nombre) faltantes.push("nombre completo");
  else if (nombre.split(/\s+/).length < 2) {
    problemas.push("el nombre esta incompleto, falta el apellido");
  }

  const tel = normalizarCelular(parcial.telefono ?? "");
  if (!parcial.telefono?.trim()) faltantes.push("celular");
  else if (!tel) {
    problemas.push(
      "el celular no parece valido: debe ser colombiano de 10 digitos y empezar por 3",
    );
  }

  const ciudad = parcial.ciudad?.trim() ?? "";
  if (!ciudad) faltantes.push("ciudad");

  // Si no dio departamento pero la ciudad es conocida, se deduce.
  let departamento = parcial.departamento?.trim()
    ? normalizarDepartamento(parcial.departamento)
    : departamentoPorCiudad(ciudad);

  if (!departamento) {
    if (parcial.departamento?.trim()) {
      problemas.push(
        `no reconozco el departamento "${parcial.departamento.trim()}"`,
      );
    } else {
      faltantes.push("departamento");
    }
  }

  const direccion = parcial.direccion?.trim() ?? "";
  if (!direccion) faltantes.push("direccion completa");
  else if (direccion.length < 8) {
    problemas.push("la direccion parece incompleta");
  }

  const barrio = parcial.barrio?.trim() ?? "";
  if (!barrio) faltantes.push("barrio");

  if (faltantes.length || problemas.length || !tel || !departamento) {
    return { ok: false, faltantes, problemas };
  }

  return {
    ok: true,
    datos: {
      nombre,
      telefono: tel.display,
      telefonoE164: tel.e164,
      departamento,
      ciudad,
      barrio,
      direccion,
    },
  };
}
