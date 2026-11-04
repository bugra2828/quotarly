// Shown instantly on navigation while a panel page renders on the server.
export default function Loading() {
  return (
    <div
      role="status"
      aria-label="Loading"
      className="mx-auto max-w-5xl space-y-8 px-6 py-12"
    >
      <div className="h-8 w-48 rounded-md bg-rule/60 motion-safe:animate-pulse" />
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="h-24 rounded-md bg-rule/40 motion-safe:animate-pulse" />
        <div className="h-24 rounded-md bg-rule/40 motion-safe:animate-pulse" />
        <div className="h-24 rounded-md bg-rule/40 motion-safe:animate-pulse" />
      </div>
      <div className="h-64 rounded-md bg-rule/40 motion-safe:animate-pulse" />
    </div>
  );
}
