'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { fadeInUp } from '@/lib/animations';

// Line chart data point
export interface DataPoint {
  label: string;
  value: number;
  color?: string;
}

// Simple line chart
interface LineChartProps {
  data: DataPoint[];
  height?: number;
  showGrid?: boolean;
  showTooltip?: boolean;
  className?: string;
}

export function AnimatedLineChart({
  data,
  height = 300,
  showGrid = true,
  showTooltip = true,
  className,
}: LineChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  const max = Math.max(...data.map((d) => d.value));
  const min = Math.min(...data.map((d) => d.value));
  const range = max - min;

  const points = data.map((point, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((point.value - min) / range) * 100;
    return { x, y, ...point };
  });

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <div className={cn('relative', className)} style={{ height }}>
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="w-full h-full"
      >
        {/* Grid lines */}
        {showGrid && (
          <g className="text-gray-200 dark:text-gray-700">
            {[0, 25, 50, 75, 100].map((y) => (
              <line
                key={y}
                x1="0"
                y1={y}
                x2="100"
                y2={y}
                stroke="currentColor"
                strokeWidth="0.2"
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </g>
        )}

        {/* Area under curve */}
        <motion.path
          d={`${pathD} L 100 100 L 0 100 Z`}
          fill="url(#gradient)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.2 }}
          transition={{ duration: 0.5 }}
        />

        {/* Line */}
        <motion.path
          d={pathD}
          fill="none"
          stroke="url(#lineGradient)"
          strokeWidth="0.5"
          vectorEffect="non-scaling-stroke"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />

        {/* Data points */}
        {points.map((point, index) => (
          <motion.circle
            key={index}
            cx={point.x}
            cy={point.y}
            r={hoveredPoint === index ? '1.5' : '1'}
            fill="currentColor"
            className="text-purple-600 cursor-pointer"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            onMouseEnter={() => setHoveredPoint(index)}
            onMouseLeave={() => setHoveredPoint(null)}
          />
        ))}

        {/* Gradients */}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#9333ea" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#9333ea" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
      </svg>

      {/* Tooltip */}
      {showTooltip && hoveredPoint !== null && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 pointer-events-none"
          style={{
            left: `${points[hoveredPoint].x}%`,
            top: `${points[hoveredPoint].y}%`,
            transform: 'translate(-50%, -100%)',
            marginTop: '-10px',
          }}
        >
          <p className="text-xs font-medium text-gray-900 dark:text-white">
            {data[hoveredPoint].label}
          </p>
          <p className="text-sm font-bold text-purple-600">
            ${data[hoveredPoint].value.toLocaleString()}
          </p>
        </motion.div>
      )}
    </div>
  );
}

// Bar chart
interface BarChartProps {
  data: DataPoint[];
  height?: number;
  horizontal?: boolean;
  showValues?: boolean;
  className?: string;
}

export function AnimatedBarChart({
  data,
  height = 300,
  horizontal = false,
  showValues = true,
  className,
}: BarChartProps) {
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  const max = Math.max(...data.map((d) => d.value));

  return (
    <div
      className={cn('relative', className)}
      style={{ height: horizontal ? data.length * 60 : height }}
    >
      <div className={cn('flex gap-2 h-full', horizontal ? 'flex-col' : 'flex-row items-end')}>
        {data.map((item, index) => {
          const percentage = (item.value / max) * 100;
          const isHovered = hoveredBar === index;

          return (
            <div
              key={index}
              className={cn('flex-1 flex', horizontal ? 'flex-row items-center' : 'flex-col justify-end')}
              onMouseEnter={() => setHoveredBar(index)}
              onMouseLeave={() => setHoveredBar(null)}
            >
              {horizontal ? (
                <>
                  <span className="text-xs text-gray-600 dark:text-gray-400 w-20 flex-shrink-0">
                    {item.label}
                  </span>
                  <motion.div
                    className={cn(
                      'h-8 rounded-lg relative group',
                      item.color || 'bg-gradient-to-r from-purple-600 to-blue-600'
                    )}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ opacity: 0.8 }}
                  >
                    {showValues && (
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-white">
                        ${item.value.toLocaleString()}
                      </span>
                    )}
                  </motion.div>
                </>
              ) : (
                <>
                  <motion.div
                    className={cn(
                      'w-full rounded-t-lg relative group',
                      item.color || 'bg-gradient-to-t from-purple-600 to-blue-600'
                    )}
                    initial={{ height: 0 }}
                    animate={{ height: `${percentage}%` }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ opacity: 0.8 }}
                  >
                    {showValues && isHovered && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-2 py-1 rounded text-xs whitespace-nowrap"
                      >
                        ${item.value.toLocaleString()}
                      </motion.div>
                    )}
                  </motion.div>
                  <span className="text-xs text-gray-600 dark:text-gray-400 mt-2 text-center">
                    {item.label}
                  </span>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Donut chart
interface DonutChartProps {
  data: DataPoint[];
  size?: number;
  thickness?: number;
  showLegend?: boolean;
  centerContent?: React.ReactNode;
  className?: string;
}

export function AnimatedDonutChart({
  data,
  size = 200,
  thickness = 30,
  showLegend = true,
  centerContent,
  className,
}: DonutChartProps) {
  const [hoveredSegment, setHoveredSegment] = useState<number | null>(null);

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const radius = size / 2;
  const innerRadius = radius - thickness;
  const circumference = 2 * Math.PI * radius;

  let currentAngle = -90; // Start from top

  const segments = data.map((item, index) => {
    const percentage = (item.value / total) * 100;
    const angle = (percentage / 100) * 360;
    const startAngle = currentAngle;
    currentAngle += angle;

    return {
      ...item,
      percentage,
      startAngle,
      endAngle: currentAngle,
    };
  });

  const colors = [
    'text-purple-600',
    'text-blue-600',
    'text-pink-600',
    'text-indigo-600',
    'text-cyan-600',
  ];

  return (
    <div className={cn('flex items-center gap-8', className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {segments.map((segment, index) => {
            const dashArray = `${(segment.percentage / 100) * circumference} ${circumference}`;
            const dashOffset =
              -((segments.slice(0, index).reduce((sum, s) => sum + s.percentage, 0) / 100) *
                circumference);

            return (
              <motion.circle
                key={index}
                cx={radius}
                cy={radius}
                r={radius - thickness / 2}
                fill="none"
                stroke="currentColor"
                strokeWidth={hoveredSegment === index ? thickness + 4 : thickness}
                strokeDasharray={dashArray}
                strokeDashoffset={dashOffset}
                className={cn(
                  'transition-all cursor-pointer',
                  segment.color || colors[index % colors.length]
                )}
                initial={{ strokeDasharray: `0 ${circumference}` }}
                animate={{ strokeDasharray: dashArray }}
                transition={{ duration: 1, delay: index * 0.1 }}
                onMouseEnter={() => setHoveredSegment(index)}
                onMouseLeave={() => setHoveredSegment(null)}
              />
            );
          })}
        </svg>

        {/* Center content */}
        {centerContent && (
          <div className="absolute inset-0 flex items-center justify-center">
            {centerContent}
          </div>
        )}
      </div>

      {/* Legend */}
      {showLegend && (
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="space-y-2"
        >
          {segments.map((segment, index) => (
            <div
              key={index}
              className="flex items-center gap-2 cursor-pointer"
              onMouseEnter={() => setHoveredSegment(index)}
              onMouseLeave={() => setHoveredSegment(null)}
            >
              <div
                className={cn(
                  'w-3 h-3 rounded-full',
                  segment.color || colors[index % colors.length].replace('text-', 'bg-')
                )}
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {segment.label}
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white ml-auto">
                {segment.percentage.toFixed(1)}%
              </span>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

// Sparkline mini chart
interface SparklineProps {
  data: number[];
  color?: string;
  showDots?: boolean;
  height?: number;
  className?: string;
}

export function Sparkline({
  data,
  color = 'text-purple-600',
  showDots = false,
  height = 40,
  className,
}: SparklineProps) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((value - min) / range) * 100;
    return { x, y, value };
  });

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <div className={cn('relative', className)} style={{ height }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
        <motion.path
          d={pathD}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={color}
          vectorEffect="non-scaling-stroke"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8 }}
        />
        
        {showDots &&
          points.map((point, index) => (
            <motion.circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="1.5"
              fill="currentColor"
              className={color}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.05 }}
            />
          ))}
      </svg>
    </div>
  );
}
