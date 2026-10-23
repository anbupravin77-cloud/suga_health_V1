import Image from "next/image";

type BrandLogoSize = "header" | "footer" | "patient" | "portal" | "auth" | "card" | "test";

export function BrandLogo({
  size = "header",
  inverse = false,
  priority = false,
}: {
  size?: BrandLogoSize;
  inverse?: boolean;
  priority?: boolean;
}) {
  return (
    <Image
      src="/img/logo/IMG-20261022-WA0009.jpg"
      alt="Suga.Health — Live Naturally"
      width={2944}
      height={1300}
      priority={priority}
      className={`suga-brand-logo suga-brand-logo--${size}${inverse ? " suga-brand-logo--inverse" : ""}`}
    />
  );
}
