import { confirmoHacePoco, esRepeticion } from "../packages/shared/src/botcake/ia/guardas";

/** Los dos casos que se vieron en la conversacion real de produccion. */
const REPETIDO =
  "Antes de cerrarlo, confirmame cual presentacion quieres para no equivocarme. ¿Me dices cual del catalogo te sirve?";

const casosRepeticion: [string, string, string | null, boolean][] = [
  ["el caso real: identico", REPETIDO, REPETIDO, true],
  ["identico con otra puntuacion", REPETIDO.replace("?", "") + ".", REPETIDO, true],
  ["identico con mayusculas", REPETIDO.toUpperCase(), REPETIDO, true],
  ["mensaje distinto", "¿Te sirve el pack de 2?", REPETIDO, false],
  ["sin mensaje previo", REPETIDO, null, false],
  ["parecido pero no igual", REPETIDO + " Tenemos 1 unidad y pack de 2.", REPETIDO, false],
];

const casosConfirmacion: [string, string, string | null, boolean][] = [
  ["el caso real: solo 'Hola'", "Hola", "Si esta bien", false],
  ["saludo con signos", "¡Hola!", "Si esta bien", false],
  ["buenas tardes", "Buenas tardes", "correcto", false],
  ["dice que si", "Si esta bien", null, true],
  ["dice dale", "Dale", null, true],
  ["hagale pues", "hagale", null, true],
  ["confirma y luego da un dato", "Calle 5 #10-20", "si, correcto", true],
  ["pregunta cualquier cosa", "Cuanto vale el envio?", "hola", false],
  ["dato suelto sin confirmar antes", "Calle 5 #10-20", "hola", false],
  ["de una", "de una", null, true],
  ["cuanto vale (precio, no si)", "Cuanto vale el envio?", null, false],
  ["ya esta listo mi pedido", "ya esta listo mi pedido?", null, false],
  ["cuando sale el pedido", "cuando sale mi pedido", null, false],
  ["vale a secas", "vale", null, true],
  ["listo a secas", "listo", null, true],
  ["si señora", "si señora", null, true],
];

let fallos = 0;
console.log("REPETICION");
for (const [nombre, nueva, previa, esperado] of casosRepeticion) {
  const r = esRepeticion(nueva, previa);
  const ok = r === esperado;
  if (!ok) fallos++;
  console.log(`  ${ok ? "OK  " : "FALLA"} ${nombre.padEnd(32)} ${r ? "bloquea" : "pasa"}`);
}

console.log("\nCONFIRMACION RECIENTE");
for (const [nombre, actual, anterior, esperado] of casosConfirmacion) {
  const r = confirmoHacePoco(actual, anterior);
  const ok = r === esperado;
  if (!ok) fallos++;
  console.log(`  ${ok ? "OK  " : "FALLA"} ${nombre.padEnd(32)} ${r ? "crea pedido" : "pide confirmar"}`);
}

console.log(fallos ? `\n${fallos} fallos` : "\nTodos correctos");
if (fallos) process.exit(1);
