"use client";
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) { return <main className="system-state"><h1>Something went wrong.</h1><p>We couldn’t load this page safely. Please try again.</p><button className="button button-primary" onClick={reset}>Try again</button></main>; }
