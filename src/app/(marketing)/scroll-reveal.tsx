"use client";

import { useEffect } from "react";

/**
 * Scroll animations for the marketing pages, driven by data attributes:
 * - `data-reveal`: fades and lifts in once it enters the viewport. Stagger with
 *   the `--reveal-delay` CSS variable.
 * - `data-reveal-play`: on a `data-reveal` element, pauses its children's CSS
 *   animations until it is revealed.
 * - `data-reveal-bar`: inside a revealed element, wipes in from the left.
 * - `data-count="1000"`: counts up from 0 once visible (`data-count-delay` in ms).
 *
 * The server HTML shows everything in its final state; the hidden start state
 * only applies once this component adds `reveal-ready` to <html>, so no-JS and
 * reduced-motion visitors see the page as-is.
 */
export function ScrollReveal() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!("IntersectionObserver" in window)) return;

    const root = document.documentElement;
    const reveals = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const counters = Array.from(document.querySelectorAll<HTMLElement>("[data-count]"));

    // Anything already on screen is shown immediately, so nothing flickers.
    const onScreen = (el: Element) => {
      const r = el.getBoundingClientRect();
      return r.top < window.innerHeight && r.bottom > 0;
    };
    const pendingReveals = reveals.filter((el) => {
      if (onScreen(el)) {
        el.classList.add("is-visible");
        return false;
      }
      return true;
    });
    const pendingCounters = counters.filter((el) => !onScreen(el));
    for (const el of pendingCounters) el.textContent = "0";

    root.classList.add("reveal-ready");

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          io.unobserve(el);
          if (el.dataset.count !== undefined) countUp(el);
          else el.classList.add("is-visible");
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.12 },
    );
    for (const el of [...pendingReveals, ...pendingCounters]) io.observe(el);

    return () => {
      io.disconnect();
      root.classList.remove("reveal-ready");
      for (const el of reveals) el.classList.remove("is-visible");
      for (const el of counters) el.textContent = format(Number(el.dataset.count));
    };
  }, []);

  return null;
}

function format(n: number) {
  return Math.round(n).toLocaleString("en-US");
}

function countUp(el: HTMLElement) {
  const target = Number(el.dataset.count);
  const delay = Number(el.dataset.countDelay ?? 0);
  const duration = 1200;
  let start: number | undefined;

  const step = (now: number) => {
    start ??= now;
    const p = Math.min((now - start) / duration, 1);
    el.textContent = format(target * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(step);
  };
  window.setTimeout(() => requestAnimationFrame(step), delay);
}
