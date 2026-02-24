import * as React from 'react';

export function useRevealOnScroll() {
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    const t = window.setTimeout(() => setReady(true), 30);
    return () => window.clearTimeout(t);
  }, []);

  React.useEffect(() => {
    if (!ready) return;

    const elements = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal="1"]'));
    if (!elements.length) return;

    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    if (reduceMotion) {
      elements.forEach((el) => el.setAttribute('data-reveal-state', 'in'));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            (e.target as HTMLElement).setAttribute('data-reveal-state', 'in');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '60px 0px -10% 0px' },
    );

    elements.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [ready]);
}
