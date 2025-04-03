"use client";

import { useEffect, useId, useRef, useState } from "react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

interface AnimatedGridPatternProps {
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  strokeDasharray?: any;
  className?: string;
  numLines?: number;
  lineColors?: string[];
}

export function AnimatedGridPattern({
  width = 40,
  height = 40,
  x = -1,
  y = -1,
  strokeDasharray = 0,
  className,
  numLines = 3,
  lineColors = ["#3b82f6", "#10b981", "#f59e0b"],
  ...props
}: AnimatedGridPatternProps) {
  const id = useId();
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [lines, setLines] = useState(() => generateLines(numLines));

  function generateLines(count: number) {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      points: generateLinePoints(),
      color: lineColors[i % lineColors.length],
    }));
  }

  function generateLinePoints() {
    const numPoints = Math.floor(dimensions.width / width) || 10;
    const points = [];
    let currentX = 0;
    const maxY = dimensions.height
      ? Math.floor(dimensions.height / height)
      : 10;

    const minY = Math.floor(maxY * 0.25);
    const maxStartY = Math.floor(maxY * 0.75);

    let currentY = Math.floor(Math.random() * (maxStartY - minY)) + minY;
    let currentDirection = Math.random() < 0.5 ? 1 : -1;

    for (let i = 0; i < numPoints; i++) {
      points.push([currentX, currentY]);
      currentX += 1;

      if (Math.random() < 0.05) {
        currentDirection = Math.random() < 0.5 ? 1 : -1;
      }

      const movement = Math.random() < 0.8 ? 0 : 1;
      currentY += currentDirection * movement;

      currentY = Math.max(0, Math.min(currentY, maxY));
    }

    return points;
  }

  const updateLinePoints = (id: number) => {
    setLines((currentLines) =>
      currentLines.map((line) =>
        line.id === id
          ? {
              ...line,
              points: generateLinePoints(),
            }
          : line
      )
    );
  };

  useEffect(() => {
    if (dimensions.width && dimensions.height) {
      console.log("Dimensions updated:", dimensions);
      const newLines = generateLines(numLines);
      console.log("Generated lines:", newLines);
      setLines(newLines);
    }
  }, [dimensions, numLines]);

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
    };
  }, [containerRef]);

  return (
    <svg
      ref={containerRef}
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full fill-gray-400/30 stroke-gray-400/30",
        className
      )}
      {...props}
    >
      <defs>
        <pattern
          id={id}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          x={x}
          y={y}
        >
          <path
            d={`M.5 ${height}V.5H${width}`}
            fill="none"
            strokeDasharray={strokeDasharray}
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
      <svg x={x} y={y} className="overflow-visible">
        {dimensions.width > 0 &&
          dimensions.height > 0 &&
          lines.map((line, index) => (
            <g key={`line-${line.id}`}>
              <motion.path
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{
                  pathLength: 1,
                  opacity: [0, 1, 1, 0],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  delay: index * 0.5,
                  times: [0, 0.1, 0.9, 1],
                }}
                onAnimationComplete={() => updateLinePoints(line.id)}
                d={`M ${line.points
                  .map(([x, y]) => `${x * width} ${y * height}`)
                  .join(" L ")}`}
                fill="none"
                stroke={line.color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ mixBlendMode: "screen" }}
              />
              <motion.circle
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 1, 1, 0],
                  scale: [0, 1, 1, 0],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  delay: index * 0.5,
                  times: [0, 0.1, 0.9, 1],
                }}
                cx={line.points[0][0] * width}
                cy={line.points[0][1] * height}
                r="4"
                fill={line.color}
                filter="url(#glow)"
                style={{ mixBlendMode: "screen" }}
              />
            </g>
          ))}
      </svg>
    </svg>
  );
}
