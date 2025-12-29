import React, { useEffect, useRef } from "react";
import { useAppSelector } from "../../hooks/useRedux";

const ParticleBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDark = useAppSelector((state: any) => state.theme?.isDark);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let particles: Particle[] = [];
    let animationFrameId: number;

    // --- CONFIGURATION ---
    const config = {
      particleCount: Math.min(window.innerWidth * 0.1, 100),
      connectionDist: 110,
      speed: 0.5,
      colors: {
        dark: {
          bg: "#000000", // Pure black for depth
          particle: "rgba(255, 255, 255, 0.8)", // Bright stars
          line: "rgba(255, 255, 255, 0.15)", // Faint connections
        },
        light: {
          bg: "#f8fafc", // Very light slate gray
          particle: "rgba(71, 85, 105, 0.7)", // Slate-600 dots
          line: "rgba(71, 85, 105, 0.15)", // Faint slate lines
        },
      },
    };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      init();
    };

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;

      constructor() {
        this.x = Math.random() * canvas!.width;
        this.y = Math.random() * canvas!.height;
        this.vx = (Math.random() - 0.5) * config.speed;
        this.vy = (Math.random() - 0.5) * config.speed;
        this.size = Math.random() * 2 + 1.5;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Bounce off edges
        if (this.x < 0 || this.x > canvas!.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas!.height) this.vy *= -1;
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = isDark
          ? config.colors.dark.particle
          : config.colors.light.particle;
        ctx.fill();
      }
    }

    const init = () => {
      particles = [];
      for (let i = 0; i < config.particleCount; i++) {
        particles.push(new Particle());
      }
    };

    const drawConnections = () => {
      if (!ctx) return;
      for (let a = 0; a < particles.length; a++) {
        for (let b = a; b < particles.length; b++) {
          const dx = particles[a].x - particles[b].x;
          const dy = particles[a].y - particles[b].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < config.connectionDist) {
            const opacity = 1 - distance / config.connectionDist;
            ctx.strokeStyle = isDark
              ? config.colors.dark.line.replace("0.15", `${opacity * 0.2}`)
              : config.colors.light.line.replace("0.15", `${opacity * 0.2}`);
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      if (!ctx || !canvas) return;
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.update();
        p.draw();
      });

      drawConnections();
      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener("resize", resize);
    resize();
    init();
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isDark]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0"
      style={{
        // Smoothly transition background color
        transition: "background-color 0.5s ease",
      }}
    />
  );
};

export default ParticleBackground;
