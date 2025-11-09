/**
 * AudioLevelIndicator Component
 * 
 * Displays real-time audio input level as a visual indicator.
 */

import { Mic, Speaker } from "lucide-react";

interface AudioLevelIndicatorProps {
  level: number; // 0-100
  isActive?: boolean;
  label?: "Input" | "Output";
  className?: string;
}

export function AudioLevelIndicator({
  level,
  isActive = true,
  label,
  className = "",
}: AudioLevelIndicatorProps) {
  // Convert level to percentage
  const percentage = Math.min(100, Math.max(0, level));
  const isOutput = label === "Output";

  // Determine color based on level (monochrome)
  const getColor = () => {
    if (percentage < 30) return "bg-gray-400 dark:bg-gray-500";
    if (percentage < 60) return "bg-gray-500 dark:bg-gray-400";
    if (percentage < 80) return "bg-gray-600 dark:bg-gray-300";
    return "bg-gray-700 dark:bg-gray-200";
  };

  const Icon = isOutput ? Speaker : Mic;

  if (!isActive) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Icon className="h-4 w-4 text-muted-foreground" />
        {label && (
          <span className="text-xs text-muted-foreground">{label}:</span>
        )}
        <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-gray-400 rounded-full" style={{ width: "0%" }} />
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Icon className="h-4 w-4 text-foreground" />
      {label && (
        <span className="text-xs text-muted-foreground font-medium">
          {label}:
        </span>
      )}
      <div className="w-24 h-2 bg-muted rounded-full overflow-hidden relative">
        <div
          className={`h-full rounded-full transition-all duration-75 ${getColor()}`}
          style={{ width: `${percentage}%` }}
        />
        {/* Peak indicator */}
        {percentage > 80 && (
          <div className="absolute right-0 top-0 h-full w-0.5 bg-black dark:bg-white animate-pulse" />
        )}
      </div>
      <span className="text-xs text-muted-foreground min-w-[2.5rem] text-right">
        {Math.round(percentage)}%
      </span>
    </div>
  );
}

