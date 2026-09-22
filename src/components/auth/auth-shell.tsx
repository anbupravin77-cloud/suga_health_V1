import Link from "next/link";
import type { ReactNode } from "react";

export function AuthShell({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <main className="legacy-public refined-auth min-h-screen flex items-center justify-center bg-stone-50 p-4">
      <section className="w-full max-w-lg rounded-2xl bg-white p-6 sm:p-8 shadow-sm border border-stone-200">
        <div className="mb-6 text-center">
          <Link href="/" className="inline-flex flex-col items-center mb-4">
            <span className="font-sans text-xl font-black tracking-tighter text-stone-950">SUGA<span className="text-neutral-400">.</span>HEALTH</span>
            <span className="brand-tagline text-stone-500 mt-0.5">live naturally</span>
          </Link>
          <h1 className="font-sans text-2xl font-bold tracking-tight text-stone-900">{title}</h1>
          <p className="mt-1 text-xs text-stone-500">{description}</p>
        </div>
        {children}
        <div className="mt-6 pt-4 border-t border-stone-100 text-center text-xs text-stone-500">
          <Link href="/" className="hover:text-stone-900">← Back to Home</Link>
        </div>
      </section>
    </main>
  );
}
