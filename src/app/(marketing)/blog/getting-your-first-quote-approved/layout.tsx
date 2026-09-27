export default function BlogPostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="mx-auto max-w-2xl px-6 py-20">{children}</div>;
}
