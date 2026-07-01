"use client";

function IconStar() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 20 20"
      fill="var(--dorado)"
      aria-hidden="true"
    >
      <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.8l-5.2 2.8 1-5.8-4.3-4.1 5.9-.9L10 1.5z" />
    </svg>
  );
}

export function RatingBar() {
  function handleVerResenasClick(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    document.getElementById("testimonios")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="flex flex-wrap items-center gap-2 text-[13px]">
      <span className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <IconStar key={i} />
        ))}
      </span>
      <span className="font-medium text-carbon">4.9</span>
      <span className="text-ceniza">·</span>
      <span className="text-ceniza">127 reseñas</span>
      <span className="text-ceniza">·</span>
      <a
        href="#testimonios"
        onClick={handleVerResenasClick}
        className="text-morado underline underline-offset-2 cursor-pointer"
      >
        Ver reseñas ↓
      </a>
    </div>
  );
}
