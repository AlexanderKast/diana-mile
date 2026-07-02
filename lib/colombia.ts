/**
 * Nombres de departamento tal como Shopify los reconoce para resolver
 * shipping_address.province/province_code. Un valor libre que Shopify no
 * matchea contra su lista interna hace que descarte la direccion ENTERA
 * silenciosamente (sin error), asi que este campo va como select, no texto libre.
 */
export const DEPARTAMENTOS_COLOMBIA = [
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

/**
 * Ciudades/municipios principales por departamento, para sugerir en un
 * <input list="..."> (datalist). A diferencia de province, Shopify guarda
 * "city" como texto libre sin matchear contra ninguna lista — por eso esto
 * es solo autocompletado, NUNCA un <select> que bloquee texto libre. Un
 * cliente de un municipio chico que no este aca debe poder escribirlo igual.
 */
export const CIUDADES_POR_DEPARTAMENTO: Record<string, string[]> = {
  Amazonas: ["Leticia", "Puerto Nariño"],
  Antioquia: [
    "Medellín", "Bello", "Itagüí", "Envigado", "Apartadó", "Turbo", "Rionegro",
    "Sabaneta", "La Estrella", "Caldas", "Copacabana", "Girardota", "Marinilla",
    "Caucasia", "Necoclí", "Chigorodó",
  ],
  Arauca: ["Arauca", "Arauquita", "Saravena", "Tame"],
  Atlántico: ["Barranquilla", "Soledad", "Malambo", "Sabanalarga", "Puerto Colombia", "Galapa"],
  "Bogotá D.C.": ["Bogotá"],
  Bolívar: ["Cartagena", "Magangué", "Turbaco", "Arjona", "El Carmen de Bolívar"],
  Boyacá: ["Tunja", "Duitama", "Sogamoso", "Chiquinquirá", "Paipa"],
  Caldas: ["Manizales", "La Dorada", "Chinchiná", "Villamaría"],
  Caquetá: ["Florencia", "San Vicente del Caguán"],
  Casanare: ["Yopal", "Aguazul", "Villanueva"],
  Cauca: ["Popayán", "Santander de Quilichao", "Puerto Tejada"],
  Cesar: ["Valledupar", "Aguachica", "Codazzi"],
  Chocó: ["Quibdó", "Istmina"],
  Córdoba: ["Montería", "Lorica", "Cereté", "Sahagún"],
  Cundinamarca: [
    "Soacha", "Facatativá", "Zipaquirá", "Chía", "Girardot", "Fusagasugá", "Mosquera",
    "Madrid", "Funza", "Cajicá",
  ],
  Guainía: ["Inírida"],
  Guaviare: ["San José del Guaviare"],
  Huila: ["Neiva", "Pitalito", "Garzón"],
  "La Guajira": ["Riohacha", "Maicao", "Uribia"],
  Magdalena: ["Santa Marta", "Ciénaga", "Fundación"],
  Meta: ["Villavicencio", "Acacías", "Granada"],
  Nariño: ["Pasto", "Tumaco", "Ipiales"],
  "Norte de Santander": ["Cúcuta", "Ocaña", "Villa del Rosario", "Los Patios"],
  Putumayo: ["Mocoa", "Puerto Asís"],
  Quindío: ["Armenia", "Calarcá", "La Tebaida"],
  Risaralda: ["Pereira", "Dosquebradas", "Santa Rosa de Cabal"],
  "San Andrés y Providencia": ["San Andrés", "Providencia"],
  Santander: ["Bucaramanga", "Floridablanca", "Girón", "Piedecuesta", "Barrancabermeja"],
  Sucre: ["Sincelejo", "Corozal"],
  Tolima: ["Ibagué", "Espinal", "Melgar"],
  "Valle del Cauca": ["Cali", "Palmira", "Buenaventura", "Tuluá", "Cartago", "Buga", "Yumbo"],
  Vaupés: ["Mitú"],
  Vichada: ["Puerto Carreño"],
};
