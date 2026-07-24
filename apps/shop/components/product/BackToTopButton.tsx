"use client";

import { useEffect, useState } from "react";

function ArrowUpIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10 15.5V4.5" strokeLinecap="round" />
      <path d="M5 9.5 10 4.5 15 9.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function BackToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Volver al inicio"
      className="fixed right-4 bottom-20 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-arena bg-blanco text-carbon-suave shadow-[0_4px_16px_rgba(26,23,20,0.18)] transition-transform hover:scale-105 active:scale-95 md:bottom-6"
    >
      <ArrowUpIcon />
    </button>
  );
}
