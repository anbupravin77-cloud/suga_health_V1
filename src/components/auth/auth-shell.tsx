import Link from "next/link";
import type { ReactNode } from "react";

export function AuthShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <main className="auth-editorial">
      <header className="auth-editorial-header">
        <Link href="/" className="auth-editorial-brand" aria-label="Suga.Health home">
          <strong>SUGA.HEALTH</strong>
          <span>live naturally</span>
        </Link>
        <Link href="/" className="auth-editorial-back">Back to home</Link>
      </header>

      <section className="auth-editorial-layout">
        <div className="auth-editorial-intro">
          <div>
            <h1>{title}</h1>
            <p>{description}</p>
          </div>
          <div className="auth-editorial-media" aria-label="Image placeholder" role="img" />
        </div>

        <div className="auth-editorial-form">
          {children}
        </div>
      </section>
    </main>
  );
}
