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
    <span
      className={`suga-brand-logo suga-brand-logo--${size}${inverse ? " suga-brand-logo--inverse" : ""}`}
    >
      <Image
        src="/img/logo/Suga.health%20Live%20Naturally%20Logo.png"
        alt="Suga.Health — Live Naturally"
        width={1473}
        height={1068}
        priority={priority}
        className="suga-brand-logo-art"
      />
    </span>
  );
}
