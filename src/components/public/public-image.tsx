"use client";

import { useState, type ImgHTMLAttributes } from "react";
import { ImageOff } from "lucide-react";

/** Preserve the supplied photograph; keep its layout stable if the host fails. */
export function PublicImage({ alt = "", className, ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <span className={`public-image-fallback ${className ?? ""}`} role={alt ? "img" : undefined} aria-label={alt ? `${alt} — image unavailable` : undefined} aria-hidden={alt ? undefined : true}><ImageOff size={28} strokeWidth={1} /></span>;
  }

  // The existing image CDN supplies responsive formats and widths via srcSet.
  // eslint-disable-next-line @next/next/no-img-element
  return <img {...props} alt={alt} className={className} onError={() => setFailed(true)} />;
}
