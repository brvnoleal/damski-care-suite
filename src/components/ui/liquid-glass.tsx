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
 * Liquid Glass card — translucent surface with backdrop blur,
 * luminous inner border and soft elevated shadow.
 * Preserves legacy API; extra props are accepted and ignored.
 */
export const LiquidGlassCard = ({
  children,
  className = '',
  borderRadius,
  width,
  height,
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
        'relative glass-strong glass-hover rounded-xl',
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
