"use client";

function ShieldIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M10 2l6.5 2.5v5c0 4.5-2.9 7.4-6.5 8.5-3.6-1.1-6.5-4-6.5-8.5v-5L10 2z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 10l2 2 4-4.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function RatingBar() {
  function handleDetailsClick(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    document.getElementById("testimonios")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="flex flex-wrap items-center gap-2 text-[13px]">
      <span className="flex items-center gap-1.5 font-medium text-carbon">
        <ShieldIcon />
        Compra contraentrega
      </span>
      <span className="text-ceniza">·</span>
      <span className="text-ceniza">Soporte por WhatsApp</span>
      <span className="text-ceniza">·</span>
      <a
        href="#testimonios"
        onClick={handleDetailsClick}
        className="text-morado underline underline-offset-2 cursor-pointer"
      >
        Ver detalles
      </a>
    </div>
  );
}
