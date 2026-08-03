/**
 * Validacion/formato de telefono INTERNACIONAL, separado a proposito de
 * lib/phone.ts (que es solo celular colombiano y esta en produccion en el
 * checkout — no se toca).
 *
 * La puerta de acceso al panel (/acceso) sirve a las 5 puertas del quiz,
 * que a su vez sirven zona_oferta 'co_cod' (Colombia, contraentrega) y
 * 'usd_premium' (resto del mundo, plan premium). El telefono ahi es
 * OPCIONAL y no tiene que ser un celular colombiano — por eso esta
 * validacion es deliberadamente laxa: min de digitos + rango razonable,
 * sin normalizar a un E.164 con codigo de pais que aca no conocemos.
 */
export type TelefonoInternacionalValido = {
  digits: string;
  display: string;
};

const MIN_DIGITOS = 7;
const MAX_DIGITOS = 15; // E.164 tope real.

export function normalizeTelefonoInternacional(
  input: string,
): TelefonoInternacionalValido | null {
  const digits = input.replace(/[^\d+]/g, "").replace(/(?!^)\+/g, "");

  const soloDigitos = digits.replace(/\D/g, "");
  if (soloDigitos.length < MIN_DIGITOS || soloDigitos.length > MAX_DIGITOS) {
    return null;
  }

  return {
    digits: digits.startsWith("+") ? digits : `+${soloDigitos}`,
    display: digits.startsWith("+") ? digits : `+${soloDigitos}`,
  };
}
