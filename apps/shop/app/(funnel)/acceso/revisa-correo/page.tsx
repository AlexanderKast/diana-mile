import Link from "next/link";

function IconoCorreo() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </svg>
  );
}

/**
 * Pantalla final del flujo de /acceso: no hay nada mas que hacer aca, solo
 * instrucciones simples de a donde ir (a prueba de quien nunca uso un
 * "magic link" antes de hoy).
 */
export default async function RevisaCorreoPage({
  searchParams,
}: {
  // Next 16: searchParams siempre es una Promise, hay que await-earla.
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-5 py-8 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full border border-dorado text-dorado-oscuro">
        <IconoCorreo />
      </span>

      <h1 className="font-display text-2xl text-carbon">Revisa tu correo</h1>

      <p className="text-sm text-carbon-suave">
        Te mandamos un link a{" "}
        {email ? <span className="font-semibold text-carbon">{email}</span> : "tu correo"}.
        Abrilo desde el mismo celular o computador donde estas ahora — con un
        toque entras directo a tu plan, sin contraseña.
      </p>

      <div className="mt-2 flex flex-col gap-2 rounded-2xl border border-arena bg-crema p-4 text-left">
        <p className="text-xs font-semibold uppercase tracking-wide text-carbon-suave">
          Si no lo ves en unos minutos
        </p>
        <ul className="list-disc pl-4 text-sm text-carbon">
          <li>Revisa la carpeta de spam o "no deseados".</li>
          <li>Busca un correo de Milito Life Shop.</li>
          <li>El link vale por poco tiempo — si vencio, pedi uno nuevo.</li>
        </ul>
      </div>

      <Link href="/acceso" className="mt-2 text-sm text-dorado-oscuro underline">
        Volver a intentar con otro email
      </Link>
    </div>
  );
}
