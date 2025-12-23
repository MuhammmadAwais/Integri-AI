import React, { useEffect, useRef } from "react";

interface ParticleSphereProps {
  /** The specific color of the particles (e.g., "#00ffcc" or "rgb(0, 255, 255)") */
  color?: string;
  /** How many particles to render (default: 1000) */
  count?: number;
  /** Rotation speed (default: 0.002) */
  speed?: number;
  /** Size of the sphere (default: 1) */
  size?: number;
}

const ParticleSphere: React.FC<ParticleSphereProps> = ({
  color = "#ffffff",
  count = 1500,
  speed = 0.005,
  size = 1,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // --- Physics & Math Configuration ---
    let animationFrameId: number;
    let particles: { x: number; y: number; z: number }[] = [];

    // Canvas dimensions
    let w = (canvas.width = canvas.clientWidth);
    let h = (canvas.height = canvas.clientHeight);

    // Resize handler
    const handleResize = () => {
      if (canvasRef.current) {
        w = canvas.width = canvasRef.current.clientWidth;
        h = canvas.height = canvasRef.current.clientHeight;
      }
    };
    window.addEventListener("resize", handleResize);

    // --- Initialize Particles (Fibonacci Sphere Algorithm) ---
    // This distributes points evenly on a sphere surface (better than random)
    const initParticles = () => {
      particles = [];
      const goldenRatio = (1 + 5 ** 0.5) / 2;

      for (let i = 0; i < count; i++) {
        // Math based on spherical distribution
        const theta = (2 * Math.PI * i) / goldenRatio;
        const phi = Math.acos(1 - (2 * (i + 0.5)) / count);

        // Convert Spherical to Cartesian (x, y, z)
        // Radius is slightly randomized for "cloud" depth effect
        const r = 200 * size + Math.random() * 20;

        particles.push({
          x: r * Math.sin(phi) * Math.cos(theta),
          y: r * Math.sin(phi) * Math.sin(theta),
          z: r * Math.cos(phi),
        });
      }
    };

    initParticles();

    // --- Animation Loop ---
    let rotationAngle = 0;

    const render = () => {
      // Clear screen
      ctx.clearRect(0, 0, w, h);

      // Update rotation
      rotationAngle += speed;
      const sin = Math.sin(rotationAngle);
      const cos = Math.cos(rotationAngle);

      // Set Style
      ctx.fillStyle = color;

      // Center of screen
      const cx = w / 2;
      const cy = h / 2;

      // Loop through particles
      particles.forEach((p) => {
        // 1. Rotate around Y-axis (Standard Rotation Matrix)
        const rotX = p.x * cos - p.z * sin;
        const rotZ = p.z * cos + p.x * sin;

        // 2. Perspective Projection (3D -> 2D)
        // Similar to the physics of a camera lens
        const perspective = 300 / (300 + rotZ); // Focal length calculation

        const x2d = cx + rotX * perspective;
        const y2d = cy + p.y * perspective;
        const radius = 1.5 * perspective; // Particles further away look smaller

        // 3. Draw Particle
        ctx.beginPath();
        ctx.arc(x2d, y2d, radius, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [color, count, speed, size]); // Re-run if props change

  return <canvas ref={canvasRef} className="w-full h-full bg-transparent" />;
};

export default ParticleSphere;
