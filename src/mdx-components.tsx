import type { MDXComponents } from "mdx/types";
import Link from "next/link";

const components: MDXComponents = {
  h1: ({ children }) => (
    <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="mt-10 font-display text-xl font-semibold text-ink">
      {children}
    </h2>
  ),
  p: ({ children }) => (
    <p className="mt-4 leading-7 text-ink-soft">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="mt-4 list-disc space-y-2 pl-5 text-ink-soft">
      {children}
    </ul>
  ),
  a: ({ href, children }) => (
    <Link href={href ?? "#"} className="text-ink underline">
      {children}
    </Link>
  ),
};

export function useMDXComponents(): MDXComponents {
  return components;
}
