// One-shot generator for the generic social card at public/og.png (1200×630):
// the LaTira logo centered on the brand's near-black background, with black
// padding all around. Re-run when the logo or brand colour changes:
//   node scripts/generate-og.mjs
// It rasterises with next/og (the same engine Next uses for OG images), so no
// extra image tooling is needed. The output is committed as a static asset.
//
// The logo paths are the ACTUAL brand mark (kept in sync with the header SVG in
// components/Header.tsx), including the red stripe (#FF4203) over the "i" — not
// the flat white-only public/LaTira-logo.svg, which omits it.

// `next/og` isn't resolvable from a plain Node script (it's wired through Next's
// bundler), so we reach the shipped module directly. This is a build-time
// one-shot, not app code, so the internal path is an acceptable trade-off.
import ogModule from "next/dist/server/og/image-response.js";
import { writeFileSync, mkdirSync } from "node:fs";
import { createElement as h } from "react";

const { ImageResponse } = ogModule;

// Brand mark from components/Header.tsx (viewBox "20 0 150.456 87.2263"): six
// white paths + the red stripe over the "i".
const LOGO_SVG = `<svg viewBox="20 0 150.456 87.2263" xmlns="http://www.w3.org/2000/svg">
<path d="M150.955 87.2263C145.255 87.2263 141.355 83.8063 141.355 78.8263C141.355 73.1863 146.335 69.2863 155.095 68.5063L159.775 68.0863V67.2463C159.775 65.0863 158.395 63.6463 156.355 63.6463C154.315 63.6463 152.875 65.0863 152.755 67.1863L142.255 66.9463C142.495 60.1063 148.555 55.1263 156.655 55.1263C164.635 55.1263 170.455 60.4063 170.455 67.5463V77.0263C170.455 80.2063 170.635 84.1663 171.055 86.6263H160.555C160.315 85.3663 160.195 83.9863 160.195 83.0263C158.395 85.4263 155.035 87.2263 150.955 87.2263ZM154.915 79.9063C157.615 79.9063 159.895 77.5663 159.895 74.4463V74.2063L155.935 74.6263C153.775 74.8663 152.155 75.7663 152.155 77.5663C152.155 79.0063 153.235 79.9063 154.915 79.9063Z" fill="#FFFDFD"/>
<path d="M119.138 86.6263V56.0263H129.938L129.638 62.9263C131.138 56.6263 135.878 54.8263 140.738 56.0263V66.8263C135.938 65.9263 129.938 66.6463 129.938 74.0263V86.6263H119.138Z" fill="#FFFDFD"/>
<path d="M105.738 86.6263V56.0263H115.738V86.6263H105.738Z" fill="#FFFDFD"/>
<path d="M105.738 51.9961V0H115.738V51.9961H105.738Z" fill="#FF4203"/>
<path d="M102.029 86.5063C93.929 88.3063 85.8291 85.8463 85.8291 74.9263V65.0263H81.0291V56.0263H85.8291V48.2263H96.6291V56.0263H102.929V65.0263H96.6291V74.0263C96.6291 77.8063 99.1491 78.0463 102.029 77.5063V86.5063Z" fill="#FFFDFD"/>
<path d="M60.1884 87.2263C54.4884 87.2263 50.5884 83.8063 50.5884 78.8263C50.5884 73.1863 55.5684 69.2863 64.3284 68.5063L69.0084 68.0863V67.2463C69.0084 65.0863 67.6284 63.6463 65.5884 63.6463C63.5484 63.6463 62.1084 65.0863 61.9884 67.1863L51.4884 66.9463C51.7284 60.1063 57.7884 55.1263 65.8884 55.1263C73.8684 55.1263 79.6884 60.4063 79.6884 67.5463V77.0263C79.6884 80.2063 79.8684 84.1663 80.2884 86.6263H69.7884C69.5484 85.3663 69.4284 83.9863 69.4284 83.0263C67.6284 85.4263 64.2684 87.2263 60.1884 87.2263ZM64.1484 79.9063C66.8484 79.9063 69.1284 77.5663 69.1284 74.4463V74.2063L65.1684 74.6263C63.0084 74.8663 61.3884 75.7663 61.3884 77.5663C61.3884 79.0063 62.4684 79.9063 64.1484 79.9063Z" fill="#FFFDFD"/>
<path d="M20 86.6263V44.6263H31.4V77.2663H48.8V86.6263H20Z" fill="#FFFDFD"/>
</svg>`;

const logoDataUri = `data:image/svg+xml;base64,${Buffer.from(LOGO_SVG).toString("base64")}`;

// Logo viewBox is 150.456×87.2263 (≈1.725:1). ~520px wide leaves generous black
// padding on a 1200×630 frame, keeping the mark centered and comfortably inset.
const LOGO_W = 520;
const LOGO_H = Math.round((LOGO_W * 87.2263) / 150.456);

const element = h(
  "div",
  {
    style: {
      width: "100%",
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#1A1A1A",
    },
  },
  h("img", { src: logoDataUri, width: LOGO_W, height: LOGO_H }),
);

const resp = new ImageResponse(element, { width: 1200, height: 630 });
const buf = Buffer.from(await resp.arrayBuffer());

mkdirSync(new URL("../public/", import.meta.url), { recursive: true });
writeFileSync(new URL("../public/og.png", import.meta.url), buf);
console.log(`wrote public/og.png (${buf.length} bytes, 1200x630)`);
