'use client';
import React from 'react';
import { cn } from '@/lib/utils';

interface LiquidGlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  draggable?: boolean;
  expandable?: boolean;
  width?: string;
  height?: string;
  expandedWidth?: string;
  expandedHeight?: string;
  blurIntensity?: 'sm' | 'md' | 'lg' | 'xl';
  shadowIntensity?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  borderRadius?: string;
  glowIntensity?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Solid SaaS card — preserves LiquidGlassCard API for backward compatibility.
 * All glassmorphism removed; renders a clean white card with soft border + subtle shadow.
 */
export const LiquidGlassCard = ({
  children,
  className = '',
  borderRadius,
  width,
  height,
  // ignored legacy props
  draggable: _d,
  expandable: _e,
  expandedWidth: _ew,
  expandedHeight: _eh,
  blurIntensity: _b,
  shadowIntensity: _s,
  glowIntensity: _g,
  ...rest
}: LiquidGlassCardProps) => {
  return (
    <div
      className={cn(
        'relative bg-card border border-border rounded-lg shadow-sm transition-shadow hover:shadow-md',
        className
      )}
      style={{
        borderRadius: borderRadius,
        width: width || undefined,
        height: height || undefined,
      }}
      {...rest}
    >
      {children}
    </div>
  );
};
