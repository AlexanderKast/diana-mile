/**
 * Casos de prueba del lead scoring.
 *
 *   npx tsx scripts/probar-scoring.mts
 *
 * No es un test unitario formal (el repo no tiene runner). Es lo que hace
 * falta para poder mirar el numero y decidir si tiene sentido: cada caso
 * imprime de donde sale cada punto. Un score que no se puede explicar no se
 * puede corregir.
 */

import {
  calcularScore,
  evaluarLead,
  type SenalesLead,
  type EtapaLead,
} from "../packages/shared/src/crm/scoring.ts";

type Caso = {
  nombre: string;
  etapa: EtapaLead;
  senales: SenalesLead;
  esperado: "frio" | "tibio" | "caliente";
};

const CASOS: Caso[] = [
  {
    nombre: "Compró — como se veía justo antes de cerrar",
    etapa: "negociacion",
    senales: {
      pidioPrecio: true,
      preguntoEnvioASuCiudad: true,
      dijoQueLoQuiere: true,
      mensajesEnviados: 9,
      respondioEnMenosDeUnaHora: true,
      llegoAlCheckout: true,
      abrioLinkDeProducto: true,
      ciudadConRecaudo: true,
      productoContraentrega: true,
      ticketDentroDelTope: true,
      diasDesdeUltimaInteraccion: 0,
    },
    esperado: "caliente",
  },
  {
    nombre: "Abandonó el checkout hace 2 días",
    etapa: "negociacion",
    senales: {
      pidioPrecio: true,
      llegoAlCheckout: true,
      mensajesEnviados: 4,
      ciudadConRecaudo: true,
      productoContraentrega: true,
      ticketDentroDelTope: true,
      diasDesdeUltimaInteraccion: 2,
    },
    esperado: "caliente",
  },
  {
    nombre: "Preguntó precio y desapareció hace un mes",
    etapa: "nuevo",
    senales: {
      pidioPrecio: true,
      mensajesEnviados: 2,
      diasDesdeUltimaInteraccion: 32,
      vecesQueNoContesto: 2,
    },
    esperado: "frio",
  },
  {
    nombre: "Interesada pero en ciudad sin recaudo, producto de vitrina",
    etapa: "calificado",
    senales: {
      pidioPrecio: true,
      pidioFotoOInfo: true,
      dijoQueLoQuiere: true,
      mensajesEnviados: 6,
      diasDesdeUltimaInteraccion: 1,
      ciudadConRecaudo: false,
      productoContraentrega: false,
      ticketDentroDelTope: false,
    },
    esperado: "tibio",
  },
  {
    nombre: "Lead nuevo del que no se sabe nada todavía",
    etapa: "nuevo",
    senales: { diasDesdeUltimaInteraccion: 0 },
    esperado: "frio",
  },
  {
    nombre: "Iba bien pero pidió cancelar",
    etapa: "negociacion",
    senales: {
      pidioPrecio: true,
      dijoQueLoQuiere: true,
      llegoAlCheckout: true,
      mensajesEnviados: 7,
      ciudadConRecaudo: true,
      productoContraentrega: true,
      ticketDentroDelTope: true,
      diasDesdeUltimaInteraccion: 1,
      pidioCancelar: true,
      objecionSinResolver: true,
    },
    esperado: "tibio",
  },
];

let fallos = 0;

for (const caso of CASOS) {
  const r = evaluarLead(caso.senales, caso.etapa);
  const ok = r.temperatura === caso.esperado;
  if (!ok) fallos += 1;

  console.log(`\n${ok ? "✓" : "✗"} ${caso.nombre}`);
  console.log(
    `   score ${String(r.score).padStart(3)}  ·  ${r.temperatura.padEnd(8)} ` +
      `·  fase ${r.fase.padEnd(14)} ·  prob. cierre ${r.probabilidad}%`,
  );
  if (!ok) console.log(`   ESPERADO: ${caso.esperado}`);
  for (const d of r.detalle) {
    const signo = d.puntos > 0 ? "+" : "";
    console.log(`      ${signo}${String(d.puntos).padStart(3)}  ${d.senal}`);
  }
}

// Un lead sin ninguna senal no puede salir con score: seria premiar el vacio.
const vacio = calcularScore({});
console.log(`\n${vacio.score === 0 ? "✓" : "✗"} Sin señales → score ${vacio.score} (${vacio.temperatura})`);
if (vacio.score !== 0) fallos += 1;

console.log(`\n--- ${CASOS.length + 1} casos, ${fallos} fallo(s) ---`);
process.exit(fallos > 0 ? 1 : 0);
