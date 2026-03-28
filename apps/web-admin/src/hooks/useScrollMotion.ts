import * as React from 'react';

/**
 * Scroll-driven motion (parallax without jank)
 * - Uses requestAnimationFrame
 * - Exposes scrollY as CSS variables so we can animate background + images smoothly
 */
export function useScrollMotion() {
  const [scrollY, setScrollY] = React.useState(0);

  React.useEffect(() => {
    let raf = 0;

    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        setScrollY(window.scrollY || 0);
      });
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  return scrollY;
}
