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
      src="/img/logo/suga-health-logo-transparent.png"
      alt="Suga.Health"
      width={2944}
      height={1300}
      priority={priority}
      className={`suga-brand-logo suga-brand-logo--${size}${inverse ? " suga-brand-logo--inverse" : ""}`}
    />
  );
}
