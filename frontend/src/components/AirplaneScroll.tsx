import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TOTAL_FRAMES = 240;
const FRAME_PATH = '/sequence/';

function getFrameName(i: number): string {
  return `ezgif-frame-${String(i).padStart(3, '0')}.jpg`;
}

export default function AirplaneScroll() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  const [loaded, setLoaded] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [canvasReady, setCanvasReady] = useState(false);
  const hasDrawnFrameRef = useRef(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Text overlay opacity transforms
  const opacity1 = useTransform(scrollYProgress, [0, 0.12, 0.2, 0.25], [1, 1, 0.8, 0]);
  const opacity2 = useTransform(scrollYProgress, [0.2, 0.28, 0.42, 0.48], [0, 1, 1, 0]);
  const opacity3 = useTransform(scrollYProgress, [0.48, 0.55, 0.68, 0.75], [0, 1, 1, 0]);
  const opacity4 = useTransform(scrollYProgress, [0.78, 0.88, 1], [0, 1, 1]);

  // Subtle y translations for text
  const y1 = useTransform(scrollYProgress, [0, 0.25], [0, -40]);
  const y2 = useTransform(scrollYProgress, [0.2, 0.48], [30, 0]);
  const y3 = useTransform(scrollYProgress, [0.48, 0.75], [30, 0]);
  const y4 = useTransform(scrollYProgress, [0.78, 1], [40, 0]);

  // Preload all frames
  useEffect(() => {
    let loadedCount = 0;
    const images: HTMLImageElement[] = new Array(TOTAL_FRAMES);

    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      img.onload = () => {
        loadedCount++;
        loadedCount++;
        setLoadProgress(Math.round((loadedCount / TOTAL_FRAMES) * 100));
        if (loadedCount === TOTAL_FRAMES) {
          imagesRef.current = images;
          setLoaded(true);
        }
      };
      img.onerror = () => {
        loadedCount++;
        setLoadProgress(Math.round((loadedCount / TOTAL_FRAMES) * 100));
        if (loadedCount === TOTAL_FRAMES) {
          imagesRef.current = images;
          setLoaded(true);
        }
      };
      img.src = `${FRAME_PATH}${getFrameName(i + 1)}`;
      images[i] = img;
    }
  }, []);

  const drawFrame = useCallback((frameIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const img = imagesRef.current[frameIndex];
    if (!img || !img.complete || !img.naturalWidth) return;

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (w === 0 || h === 0) return;

    // Always reset canvas size to ensure clean state
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.clearRect(0, 0, w, h);

    // Contain-fit the image
    const imgAspect = img.naturalWidth / img.naturalHeight;
    const canvasAspect = w / h;
    let drawW: number, drawH: number, drawX: number, drawY: number;

    if (imgAspect > canvasAspect) {
      drawW = w;
      drawH = w / imgAspect;
      drawX = 0;
      drawY = (h - drawH) / 2;
    } else {
      drawH = h;
      drawW = h * imgAspect;
      drawX = (w - drawW) / 2;
      drawY = 0;
    }

    ctx.drawImage(img, drawX, drawY, drawW, drawH);

    if (!hasDrawnFrameRef.current) {
      hasDrawnFrameRef.current = true;
      setCanvasReady(true);
    }
  }, []);

  // Draw first frame once loaded
  useEffect(() => {
    if (loaded) {
      // Wait for React to render the canvas with proper dimensions
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          drawFrame(0);
        });
      });
    }
  }, [loaded, drawFrame]);

  // Map scroll progress to frame index
  useMotionValueEvent(scrollYProgress, 'change', (progress) => {
    if (!loaded) return;
    const frameIndex = Math.min(
      TOTAL_FRAMES - 1,
      Math.max(0, Math.floor(progress * (TOTAL_FRAMES - 1)))
    );
    currentFrameRef.current = frameIndex;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => drawFrame(frameIndex));
  });

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (loaded) drawFrame(currentFrameRef.current);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [loaded, drawFrame]);

  return (
    <section
      ref={containerRef}
      className="relative bg-background"
      style={{ height: '500vh' }}
    >
      {/* Loading state */}
      {!loaded && (
        <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center gap-6 z-50 bg-background">
          {/* Teal glow orb behind loader */}
          <div className="absolute w-64 h-64 rounded-full opacity-20 blur-[100px]" style={{ background: 'hsl(185 72% 54%)' }} />
          <p className="text-xs font-semibold tracking-[0.3em] uppercase text-muted-foreground">
            Loading Experience
          </p>
          <div className="w-64">
            <Progress value={loadProgress} className="h-1" />
          </div>
          <p className="text-xs text-muted-foreground font-mono">{loadProgress}%</p>
        </div>
      )}

      {/* Sticky canvas + overlays */}
      <div
        className="sticky top-0 h-screen w-full overflow-hidden bg-background"
        style={{
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.8s ease',
        }}
      >
        {/* Ambient teal glow behind airplane */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full opacity-[0.06] blur-[120px] pointer-events-none"
          style={{ background: 'hsl(185 72% 54%)' }}
        />

        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ display: 'block' }}
        />

        {/* Text Overlay 1: Hero title */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
          style={{ opacity: opacity1, y: y1 }}
        >
          <div className="text-center px-6 max-w-4xl">
            <h2 className="text-4xl md:text-6xl lg:text-8xl font-bold tracking-tight leading-[0.9] text-foreground">
              Avicon<span className="text-primary">.</span>
            </h2>
            <p className="mt-4 md:mt-6 text-base md:text-xl lg:text-2xl font-light tracking-wide text-muted-foreground">
              For all the digital aviation needs.
            </p>
          </div>
        </motion.div>

        {/* Text Overlay 2: Left aligned stats */}
        <motion.div
          className="absolute inset-0 flex items-center pointer-events-none z-10"
          style={{ opacity: opacity2, y: y2 }}
        >
          <div className="px-8 md:px-16 lg:px-24 max-w-2xl">
            <div className="text-xs font-semibold tracking-[0.3em] uppercase mb-4 text-primary/60">
              Intelligence Layer
            </div>
            <h3 className="text-3xl md:text-5xl lg:text-7xl font-bold tracking-tight leading-[0.95] text-foreground">
              Powering 256+
              <br />
              <span className="text-muted-foreground">
                Aviation Workflows.
              </span>
            </h3>
          </div>
        </motion.div>

        {/* Text Overlay 3: Right aligned */}
        <motion.div
          className="absolute inset-0 flex items-center justify-end pointer-events-none z-10"
          style={{ opacity: opacity3, y: y3 }}
        >
          <div className="px-8 md:px-16 lg:px-24 max-w-2xl text-right">
            <div className="text-xs font-semibold tracking-[0.3em] uppercase mb-4 text-primary/60">
              Architecture
            </div>
            <h3 className="text-3xl md:text-5xl lg:text-7xl font-bold tracking-tight leading-[0.95] text-foreground">
              Built for Speed.
              <br />
              <span className="text-muted-foreground">
                Designed for Scale.
              </span>
            </h3>
          </div>
        </motion.div>

        {/* Text Overlay 4: CTA */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center z-10"
          style={{ opacity: opacity4, y: y4 }}
        >
          <div className="text-center px-6 max-w-3xl">
            <h3 className="text-3xl md:text-5xl lg:text-7xl font-bold tracking-tight text-foreground">
              Power Your Next
              <br />
              <span className="text-primary">Breakthrough.</span>
            </h3>
            <p className="mt-4 md:mt-6 text-sm md:text-lg font-light text-muted-foreground">
              The aviation platform trusted by industry leaders worldwide.
            </p>
            <div className="mt-8 pointer-events-auto">
              <Button
                size="lg"
                className="gap-2 rounded-full px-8 text-sm font-medium"
                onClick={() => {
                  const el = document.getElementById('how-it-works');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Get Started <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Bottom gradient fade into next section */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none z-20" />
      </div>
    </section>
  );
}
