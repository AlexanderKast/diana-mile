/**
 * Comprueba el marco de persuasion.
 *
 *   npx tsx scripts/probar-persuasion.mts
 *
 * Verifica el conteo, que no haya ids repetidos, que los limites viajen en
 * TODAS las fases (si se pierden en una, el agente queda sin frenos justo en
 * la fase donde mas presiona) y que cada fase reciba lo suyo y no lo ajeno.
 */

import {
  PARAMETROS,
  TOTAL_PARAMETROS,
  bloquePersuasion,
} from "../packages/shared/src/botcake/ia/persuasion.ts";
import type { FaseAgente } from "../packages/shared/src/crm/scoring.ts";

let fallos = 0;
const check = (ok: boolean, msg: string) => {
  console.log(`${ok ? "✓" : "✗"} ${msg}`);
  if (!ok) fallos += 1;
};

check(TOTAL_PARAMETROS >= 75, `${TOTAL_PARAMETROS} parámetros (pedidos: más de 75)`);

const ids = PARAMETROS.map((p) => p.id);
check(new Set(ids).size === ids.length, "sin ids repetidos");

const porBloque = PARAMETROS.reduce<Record<string, number>>((acc, p) => {
  acc[p.bloque] = (acc[p.bloque] ?? 0) + 1;
  return acc;
}, {});
console.log("\n  Reparto por bloque:");
for (const [b, n] of Object.entries(porBloque)) {
  console.log(`    ${b.padEnd(16)} ${n}`);
}
console.log();

const FASES: FaseAgente[] = ["descubrimiento", "propuesta", "cierre"];
const limites = PARAMETROS.filter((p) => p.bloque === "limite");

for (const fase of FASES) {
  const texto = bloquePersuasion(fase);
  const todosLosLimites = limites.every((l) => texto.includes(l.regla));
  check(todosLosLimites, `fase "${fase}" conserva los ${limites.length} límites`);
}

// El setter no puede estar pidiendo direccion.
const desc = bloquePersuasion("descubrimiento");
check(
  desc.includes("NO pidas direccion"),
  'la fase "descubrimiento" prohíbe pedir datos de envío',
);
check(
  !desc.includes("Pide los datos de a dos maximo"),
  'la fase "descubrimiento" NO recibe las reglas de toma de datos',
);

// El closer no puede volver a calificar.
const cierre = bloquePersuasion("cierre");
check(
  cierre.includes("NO vuelvas a calificar"),
  'la fase "cierre" prohíbe volver a calificar',
);
check(
  cierre.includes("¿te mando 1 o el pack de 2?"),
  'la fase "cierre" sí recibe el cierre alternativo',
);

// Los tres claims prohibidos deben estar presentes siempre.
for (const fase of FASES) {
  const t = bloquePersuasion(fase);
  const ok =
    t.includes("PROHIBIDO decir cuantas clientas tiene Milito") &&
    t.includes("PROHIBIDA la urgencia falsa") &&
    t.includes("suplemento dietario, no un medicamento");
  check(ok, `fase "${fase}" mantiene los claims prohibidos`);
}

console.log(`\n--- ${fallos} fallo(s) ---`);
process.exit(fallos > 0 ? 1 : 0);
