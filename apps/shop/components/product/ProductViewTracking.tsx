"use client";

import { useEffect } from "react";
import { trackViewContent } from "@/lib/tracking/client-events";

export function ProductViewTracking({
  contentId,
  contentName,
  value,
}: {
  contentId: string;
  contentName: string;
  value?: number;
}) {
  useEffect(() => {
    trackViewContent({ contentId, contentName, value });
  }, [contentId, contentName, value]);

  return null;
}
