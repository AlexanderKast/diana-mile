import { redirect } from "next/navigation";

/**
 * `/coach` era el placeholder del coaching 1 a 1 (bloqueado por pasarela de
 * pago). La escalera de 3 niveles en /mi-plan y en el resultado de "sesion"
 * lo reemplaza con una oferta real (sesion grupal, ver /sesion-grupal) —
 * este archivo solo redirige por si queda algun link viejo apuntando aca.
 */
export default function CoachPage() {
  redirect("/mi-plan");
}
