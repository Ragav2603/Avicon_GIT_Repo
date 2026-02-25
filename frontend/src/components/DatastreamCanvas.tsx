import React, { useRef, useEffect } from 'react';
import { useScroll, useMotionValueEvent } from 'framer-motion';

const DatastreamCanvas: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { scrollYProgress } = useScroll();

    // Store scroll progress in a ref to avoid re-rendering the animation loop
    const scrollProgressRef = useRef(0);

    useMotionValueEvent(scrollYProgress, "change", (latest) => {
        scrollProgressRef.current = latest;
    });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Configuration
        const waves = [
            { amplitude: 30, frequency: 0.01, speed: 0.02, color: 'rgba(255, 99, 64, 0.4)' },  // Neon Orange
            { amplitude: 50, frequency: 0.005, speed: 0.015, color: 'rgba(166, 93, 180, 0.3)' }, // Neon Pink
            { amplitude: 20, frequency: 0.02, speed: 0.03, color: 'rgba(137, 174, 255, 0.5)' },  // Light Blue/Cyan
        ];

        let animationFrameId: number;
        let time = 0;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            // Draw initial state immediately on resize
            if (time === 0) draw();
        };

        const draw = () => {
            if (!ctx || !canvas) return;

            // Dimensions
            const width = canvas.width;
            const height = canvas.height;

            // Clear with slight trailing effect (fade)
            ctx.fillStyle = 'rgba(23, 46, 100, 0.1)'; // Midnight Blue background
            ctx.fillRect(0, 0, width, height);

            const scrollFactor = scrollProgressRef.current;
            const centerY = height / 2;

            waves.forEach((wave, i) => {
                ctx.beginPath();

                // Adjust colors based on scroll (transitioning logic can be complex, simplifying for aesthetics)
                const alpha = Math.max(0.1, 0.5 - (scrollFactor * 0.2));
                // e.g. color string is 'rgba(255, 99, 64, 0.4)', we can extract the base and override alpha
                const baseColor = wave.color.substring(0, wave.color.lastIndexOf(',') + 1);
                ctx.strokeStyle = `${baseColor} ${alpha})`;

                // Thicker lines based on scroll
                ctx.lineWidth = 2 + (scrollFactor * 3);

                // Draw wave
                for (let x = 0; x < width; x++) {
                    // Amplitude modifier based on scroll (gets more intense/ordered)
                    const ampMult = 1 + (scrollFactor * 1.5) + (Math.sin(time * 0.5 + i) * 0.2);

                    const dx = x * wave.frequency;
                    // Introduce scroll factor to the wave calculation for flow effect
                    const dy = Math.sin(dx + time * wave.speed + (scrollFactor * 10)) * wave.amplitude * ampMult;

                    // Complex wave interference pattern
                    const dy2 = Math.cos(dx * 0.5 - time * wave.speed * 0.5) * (wave.amplitude * 0.5);

                    const y = centerY + dy + dy2;

                    if (x === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                }
                ctx.stroke();
            });

            time++;
            animationFrameId = requestAnimationFrame(draw);
        };

        window.addEventListener('resize', resize);
        resize(); // Initial sizing and draw
        draw(); // Start loop

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 z-0 pointer-events-none w-full h-full bg-aviation-blue"
            aria-hidden="true"
        />
    );
};

export default DatastreamCanvas;
