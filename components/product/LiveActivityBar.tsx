"use client";

import { useEffect, useState } from "react";

const MIN_VIEWERS = 18;
const MAX_VIEWERS = 31;
const UPDATE_INTERVAL_MS = 45000;
const DEFAULT_VIEWERS = 24;

function randomViewers(): number {
  return Math.floor(Math.random() * (MAX_VIEWERS - MIN_VIEWERS + 1)) + MIN_VIEWERS;
}

export function LiveActivityBar() {
  const [viewers, setViewers] = useState(DEFAULT_VIEWERS);

  useEffect(() => {
    setViewers(randomViewers());

    const interval = setInterval(() => {
      setViewers(randomViewers());
    }, UPDATE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2 border-l-[3px] border-morado bg-lila-suave px-4 py-2.5 text-[12px] text-morado-oscuro">
      <div className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-red-500" />
      <span>{viewers} personas están viendo esto ahora</span>
    </div>
  );
}
