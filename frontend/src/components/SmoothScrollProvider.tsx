import { useEffect, useRef } from "react";
import Lenis from "lenis";

const SmoothScrollProvider = ({ children }: { children: React.ReactNode }) => {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.5,
    });

    lenisRef.current = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Override native scrollIntoView calls to work with Lenis
    const originalScrollTo = window.scrollTo;
    window.scrollTo = (...args: any[]) => {
      if (args.length === 1 && typeof args[0] === "object" && args[0].behavior === "smooth") {
        lenis.scrollTo(args[0].top ?? 0, { duration: 1.2 });
      } else {
        originalScrollTo.apply(window, args as any);
      }
    };

    return () => {
      lenis.destroy();
      window.scrollTo = originalScrollTo;
    };
  }, []);

  return <>{children}</>;
};

export default SmoothScrollProvider;
