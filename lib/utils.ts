export function formatCOP(amount: string | number): string {
  const value = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

export function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * Shopify exige last_name para que shipping_address/customer se guarden
 * (si falta, descarta la direccion entera sin error). Partimos el nombre
 * completo en la primera palabra + resto; si no hay espacio, repetimos.
 */
export function splitFullName(nombreCompleto: string): { firstName: string; lastName: string } {
  const partes = nombreCompleto.trim().split(/\s+/);
  const firstName = partes[0] ?? "";
  const lastName = partes.length > 1 ? partes.slice(1).join(" ") : firstName;
  return { firstName, lastName };
}
