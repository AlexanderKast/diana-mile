import { problemasDeCatalogo } from "../packages/shared/src/botcake/ia/guardia-catalogo";

const catalogo = {
  titulos: [
    "Epoch® Polishing Bar — Barra Exfoliante Corporal",
    "Epoch® Glacial Marine Mud — Mascarilla",
  ],
  precios: new Set([89700, 161500, 129900]),
};

const casos: [string, string, boolean][] = [
  ["precio real", "La barra te sale en $89.700 y pagas al recibir.", false],
  ["precio inventado", "El serum te sale en $215.000, ¿te lo mando?", true],
  ["producto ajeno ofrecido", "Te recomiendo el LumiSpa, es ideal para ti.", true],
  ["producto ajeno explicado", "ageLOC es la linea antiedad de la marca, trabaja las causas del envejecimiento.", false],
  ["producto de la tienda", "Te recomiendo el Polishing Bar, queda muy bien.", false],
  ["galvanic ofrecido", "Tenemos el Galvanic Spa tambien.", true],
  ["dias no es precio", "Te llega en 3 a 5 dias habiles.", false],
  ["marine mud si esta", "El Glacial Marine Mud te sirve, vale $161.500.", false],
  ["precio con redondeo", "Son $89.700 en total.", false],
  ["sin catalogo no bloquea", "Te recomiendo el LumiSpa por $300.000.", false],
];

let fallos = 0;
for (const [nombre, texto, deberiaBloquear] of casos) {
  const cat = nombre === "sin catalogo no bloquea" ? null : catalogo;
  const p = problemasDeCatalogo(texto, cat);
  const bloqueo = p !== null;
  const ok = bloqueo === deberiaBloquear;
  if (!ok) fallos++;
  console.log(
    `${ok ? "OK  " : "FALLA"} ${nombre.padEnd(26)} ${bloqueo ? `bloquea (${p!.tipo}: ${p!.detalle})` : "pasa"}`,
  );
}
console.log(fallos ? `\n${fallos} fallos` : "\nTodos correctos");
