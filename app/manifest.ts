import type { MetadataRoute } from "next";
import { HOME_DESCRIPTION, HOME_TITLE, SITE_NAME } from "@/lib/seo";

// Web app manifest → habilita "Añadir a pantalla de inicio" con icono propio en
// Android/PWA. En iOS el icono lo aporta app/apple-icon.png (apple-touch-icon).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} · ${HOME_TITLE}`,
    short_name: SITE_NAME,
    description: HOME_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#1A1A1A",
    theme_color: "#1A1A1A",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
