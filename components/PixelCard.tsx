"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

// Define the Pixel class for animation
class Pixel {
  width: number;
  height: number;
  ctx: CanvasRenderingContext2D;
  x: number;
  y: number;
  color: string;
  speed: number;
  size: number;
  sizeStep: number;
  minSize: number;
  maxSizeInteger: number;
  maxSize: number;
  delay: number;
  disappearDelay: number;
  counter: number;
  disappearCounter: number;
  counterStep: number;
  isIdle: boolean;
  isReverse: boolean;
  isShimmer: boolean;
  isDisappearing: boolean;
  centerDistance: number;

  constructor(
    canvas: HTMLCanvasElement, 
    context: CanvasRenderingContext2D, 
    x: number, 
    y: number, 
    color: string, 
    speed: number,
    normalizedDistance: number
  ) {
    this.width = canvas.width;
    this.height = canvas.height;
    this.ctx = context;
    this.x = x;
    this.y = y;
    this.color = color;
    this.speed = this.getRandomValue(0.1, 0.9) * speed;
    this.size = 0;
    this.sizeStep = Math.random() * 0.4;
    this.minSize = 0.5;
    this.maxSizeInteger = 2;
    this.maxSize = this.getRandomValue(this.minSize, this.maxSizeInteger);
    // Appearance starts from center out - closer pixels appear first
    this.delay = normalizedDistance * 200;
    // Disappearance starts from outside in - farther pixels disappear first
    this.disappearDelay = (1 - normalizedDistance) * 200;
    this.counter = 0;
    this.disappearCounter = 0;
    this.counterStep = Math.random() * 4 + (this.width + this.height) * 0.01;
    this.isIdle = false;
    this.isReverse = false;
    this.isShimmer = false;
    this.isDisappearing = false;
    this.centerDistance = normalizedDistance;
  }

  getRandomValue(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  draw(): void {
    if (this.size <= 0.01) return;
    
    const centerOffset = this.maxSizeInteger * 0.5 - this.size * 0.5;
    this.ctx.fillStyle = this.color;
    this.ctx.fillRect(
      this.x + centerOffset,
      this.y + centerOffset,
      this.size,
      this.size
    );
  }

  appear(): void {
    this.isDisappearing = false;
    this.disappearCounter = 0;
    
    // Delay based on distance from center (closer pixels animate first)
    if (this.counter <= this.delay) {
      this.counter += this.counterStep;
      return;
    }
    
    // Once we reach max size, switch to shimmer mode
    if (this.size >= this.maxSize) {
      this.isShimmer = true;
    }
    
    // Either grow the pixel or make it shimmer
    if (this.isShimmer) {
      this.shimmer();
    } else {
      this.size += this.sizeStep;
    }
    
    this.draw();
  }

  disappear(): void {
    this.isIdle = false;
    this.isDisappearing = true;
    
    // Reset the counter used for appear animation
    this.counter = 0;
    
    // For disappearing, pixels further from center start disappearing first
    // Reduce the delay by 40% to speed up the start of disappearing animation
    if (this.disappearCounter <= this.disappearDelay * 0.6) {
      this.disappearCounter += this.counterStep * 1.5; // Faster counter increment
      
      // Continue shimmering while waiting to disappear
      if (this.isShimmer) {
        this.shimmer();
        this.draw();
      }
      return;
    }
    
    // Once the delay is over, gradually reduce the size
    // Keep shimmering during the early stages of disappearing
    if (this.size > this.minSize) {
      // Continue the shimmer effect during disappearance
      if (this.isShimmer) {
        this.shimmer();
      }
      
      // Increase the reduction speed by increasing the factor from 0.2 to 0.35
      this.size -= this.sizeStep * 0.5;
    } else {
      // When we get below the minimum size, stop shimmering and just shrink
      this.isShimmer = false;
      // Increase the final shrinking speed from 0.2 to 0.4
      this.size -= this.sizeStep * 1;
      
      // Only mark as idle when completely gone
      if (this.size <= 0) {
        this.isIdle = true;
        return;
      }
    }
    
    this.draw();
  }

  shimmer(): void {
    // Shimmer effect: oscillate pixel size between max and min
    if (this.size >= this.maxSize) {
      this.isReverse = true;
    } else if (this.size <= this.minSize) {
      this.isReverse = false;
    }
    
    // Adjust size based on direction
    if (this.isReverse) {
      this.size -= this.speed;
    } else {
      this.size += this.speed;
    }
  }

  reset(): void {
    // Reset all animation state for this pixel
    this.size = 0;
    this.counter = 0;
    this.disappearCounter = 0;
    this.isIdle = false;
    this.isReverse = false;
    this.isShimmer = false;
    this.isDisappearing = false;
  }
}

const VARIANTS = {
  blue: {
    colors: "#e0f2fe,#7dd3fc,#0ea5e9",
    gap: 4,
    speed: 80,
  },
  pink: {
    colors: "#fecdd3,#fda4af,#e11d48",
    gap: 4,
    speed: 80,
  },
  purple: {
    colors: "#ddd6fe,#a78bfa,#7c3aed",
    gap: 4,
    speed: 80,
  },
  green: {
    colors: "#a7f3d0,#6ee7b7,#10b981",
    gap: 4,
    speed: 80,
  }
};

type PixelCardProps = {
  children: React.ReactNode;
  variant?: "blue" | "pink" | "purple" | "green";
  className?: string;
  onClick?: () => void;
};

export default function PixelCard({
  children,
  variant = "blue",
  className = "",
  onClick
}: PixelCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pixelsRef = useRef<Pixel[]>([]);
  const animationRef = useRef<number | null>(null);
  const [animationState, setAnimationState] = useState<'idle' | 'appear' | 'disappear'>('idle');
  
  // Get variant configuration
  const variantCfg = VARIANTS[variant as keyof typeof VARIANTS] || VARIANTS.blue;
  const finalColors = variantCfg.colors;
  const finalGap = variantCfg.gap;
  const finalSpeed = variantCfg.speed;

  // Initialize pixels
  const initPixels = () => {
    if (!containerRef.current || !canvasRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const width = Math.floor(rect.width);
    const height = Math.floor(rect.height);
    const ctx = canvasRef.current.getContext("2d");
    
    if (!ctx) return;

    canvasRef.current.width = width;
    canvasRef.current.height = height;
    canvasRef.current.style.width = `${width}px`;
    canvasRef.current.style.height = `${height}px`;

    const colorsArray = finalColors.split(",");
    const pxs: Pixel[] = [];
    
    // Calculate center point
    const centerX = width / 2;
    const centerY = height / 2;
    
    // First pass to calculate max distance for normalization
    let maxDistance = 0;
    const points: {x: number, y: number, distance: number}[] = [];
    
    for (let x = 0; x < width; x += finalGap) {
      for (let y = 0; y < height; y += finalGap) {
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        maxDistance = Math.max(maxDistance, distance);
        points.push({x, y, distance});
      }
    }
    
    // Second pass to create pixels with normalized distances
    for (const point of points) {
      const color = colorsArray[Math.floor(Math.random() * colorsArray.length)];
      const normalizedDistance = point.distance / maxDistance;
      
      pxs.push(
        new Pixel(
          canvasRef.current,
          ctx,
          point.x,
          point.y,
          color,
          finalSpeed * 0.001,
          normalizedDistance
        )
      );
    }
    
    pixelsRef.current = pxs;
    
    // Clear the canvas
    ctx.clearRect(0, 0, width, height);
  };

  // Animation loop
  const animate = () => {
    if (!canvasRef.current) return;
    
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    
    let allIdle = true;
    
    for (const pixel of pixelsRef.current) {
      if (animationState === 'appear') {
        pixel.appear();
      } else if (animationState === 'disappear') {
        pixel.disappear();
      }
      
      if (!pixel.isIdle) {
        allIdle = false;
      }
    }
    
    if (allIdle && animationState !== 'idle') {
      setAnimationState('idle');
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    } else {
      animationRef.current = requestAnimationFrame(animate);
    }
  };

  // Start or stop animation based on state
  useEffect(() => {
    if (animationState !== 'idle') {
      if (!animationRef.current) {
        animationRef.current = requestAnimationFrame(animate);
      }
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [animationState]);

  // Reset for animation direction change
  useEffect(() => {
    if (animationState === 'appear') {
      // Reset pixels for a clean start when appearing
      for (const pixel of pixelsRef.current) {
        if (pixel.isDisappearing) {
          pixel.reset();
        }
      }
    }
  }, [animationState]);

  // Initialize on mount and handle resizing
  useEffect(() => {
    initPixels();
    
    const observer = new ResizeObserver(() => {
      initPixels();
    });
    
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    
    return () => {
      observer.disconnect();
    };
  }, [finalGap, finalColors, finalSpeed]);

  // Event handlers
  const onMouseEnter = () => {
    setAnimationState('appear');
  };
  
  const onMouseLeave = () => {
    setAnimationState('disappear');
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative border border-white/10 rounded-xl overflow-hidden h-full w-full",
        className
      )}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
    >
      <canvas
        className="absolute inset-0 w-full h-full block z-0"
        ref={canvasRef}
      />
      <div className="relative z-10 p-4 h-full w-full flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
