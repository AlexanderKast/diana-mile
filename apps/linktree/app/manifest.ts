import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Diana Mile",
    short_name: "Diana Mile",
    description: "Wellness & Antiaging — todos mis enlaces en un solo lugar.",
    start_url: "/",
    display: "standalone",
    background_color: "#F2EDE6",
    theme_color: "#F2EDE6",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
