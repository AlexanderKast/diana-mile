import Link from "next/link";

const LINKTREE_URL = process.env.NEXT_PUBLIC_LINKTREE_URL || "/";

export function SiteFooter() {
  return (
    <footer className="border-t border-arena bg-blanco px-6 py-8 text-sm text-ceniza">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <p>Milito Life Shop · Bienestar y rituales de piel</p>
        <div className="flex flex-wrap gap-4">
          <Link href="/productos" className="hover:text-carbon">
            Productos
          </Link>
          <Link href={LINKTREE_URL} className="hover:text-carbon">
            Redes
          </Link>
        </div>
      </div>
    </footer>
  );
}
