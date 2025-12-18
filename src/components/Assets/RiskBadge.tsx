// src/components/Assets/RiskBadge.tsx
// Location: src/components/Assets/RiskBadge.tsx
// Standalone risk badge component with variants

'use client';

import React from 'react';
import { Shield, AlertTriangle, Info } from 'lucide-react';
import { COLORS, RISK_COLOR_MAP } from '@/lib/constants';

interface RiskBadgeProps {
  risk: string;
  size?: 'small' | 'default' | 'large';
  showIcon?: boolean;
  showTooltip?: boolean;
  variant?: 'solid' | 'outline' | 'ghost';
}

export function RiskBadge({
  risk,
  size = 'default',
  showIcon = true,
  showTooltip = false,
  variant = 'solid',
}: RiskBadgeProps) {
  const color = RISK_COLOR_MAP[risk as keyof typeof RISK_COLOR_MAP] || COLORS.warningAmber;

  // Size classes
  const sizeClasses = {
    small: 'px-2 py-0.5 text-xs',
    default: 'px-2.5 py-1 text-sm',
    large: 'px-3 py-1.5 text-base',
  };

  const iconSizes = {
    small: 10,
    default: 12,
    large: 14,
  };

  // Variant styles
  const getVariantStyles = () => {
    switch (variant) {
      case 'solid':
        return {
          backgroundColor: `${color}20`,
          color: color,
          border: 'none',
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: color,
          border: `1px solid ${color}`,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          color: color,
          border: 'none',
        };
      default:
        return {
          backgroundColor: `${color}20`,
          color: color,
          border: 'none',
        };
    }
  };

  // Get risk icon
  const getRiskIcon = () => {
    if (risk.includes('High')) return AlertTriangle;
    if (risk.includes('Low')) return Shield;
    return Info;
  };

  const Icon = getRiskIcon();

  return (
    <span
      className={`${sizeClasses[size]} rounded font-semibold inline-flex items-center gap-1 transition-all hover:scale-105`}
      style={getVariantStyles()}
      title={showTooltip ? getRiskDescription(risk) : undefined}
    >
      {showIcon && <Icon size={iconSizes[size]} />}
      {risk} Risk
    </span>
  );
}

// Get risk description for tooltip
function getRiskDescription(risk: string): string {
  const descriptions: Record<string, string> = {
    Low: 'Minimal capital loss risk with stable, predictable returns',
    'Low-Medium': 'Limited downside risk with moderate return stability',
    Medium: 'Balanced risk-return profile with some volatility',
    'Medium-High': 'Higher potential returns with increased volatility',
    High: 'Significant return potential with notable volatility',
  };

  return descriptions[risk] || 'Risk assessment not available';
}

// Preset risk badge variants
export function LowRiskBadge() {
  return <RiskBadge risk="Low" />;
}

export function MediumRiskBadge() {
  return <RiskBadge risk="Medium" />;
}

export function HighRiskBadge() {
  return <RiskBadge risk="High" />;
}

// Risk level comparison component
export function RiskComparison({ risks }: { risks: string[] }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {risks.map((risk, idx) => (
        <RiskBadge key={idx} risk={risk} size="small" />
      ))}
    </div>
  );
}

// Risk indicator with progress bar
export function RiskIndicator({ risk }: { risk: string }) {
  const getRiskScore = (r: string): number => {
    const scores: Record<string, number> = {
      Low: 20,
      'Low-Medium': 40,
      Medium: 60,
      'Medium-High': 80,
      High: 100,
    };
    return scores[r] || 50;
  };

  const score = getRiskScore(risk);
  const color = RISK_COLOR_MAP[risk as keyof typeof RISK_COLOR_MAP] || COLORS.warningAmber;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-400">Risk Level</span>
        <RiskBadge risk={risk} size="small" />
      </div>
      <div className="w-full h-2 rounded-full" style={{ backgroundColor: COLORS.slateGrey }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${score}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
}