import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description: "Notes on getting quoted, earning backlinks, and pitching journalists well.",
  alternates: { canonical: "/blog" },
};

const posts = [
  {
    slug: "getting-your-first-quote-approved",
    title: "What makes a journalist actually use your quote",
    date: "September 2026",
    excerpt:
      "Most pitches get ignored for the same handful of reasons. Here's what separates the ones that get used.",
  },
];

export default function BlogIndexPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-20">
      <h1 className="font-display text-3xl font-semibold tracking-tight">
        Blog
      </h1>
      <div className="mt-10 space-y-10">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="block border-t border-rule pt-6"
          >
            <p className="font-dispatch text-xs text-ink-soft">{post.date}</p>
            <h2 className="mt-2 font-display text-xl font-semibold text-ink">
              {post.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-ink-soft">
              {post.excerpt}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
