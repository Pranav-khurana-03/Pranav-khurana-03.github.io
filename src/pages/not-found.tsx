import { Link } from "wouter";

export default function NotFound() {
  return (
    <section className="grid min-h-[100dvh] place-items-center px-6 text-center">
      <div>
        <h1 className="mb-4 text-6xl">Page not found</h1>
        <p className="mb-8 text-muted">That page doesn't exist.</p>
        <Link href="/" className="bg-cream px-6 py-3 text-sm font-medium text-dark">Back home</Link>
      </div>
    </section>
  );
}
