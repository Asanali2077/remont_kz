import { Star } from "lucide-react";

interface StarsProps {
  value: number;
  className?: string;
}

export function Stars({ value, className }: StarsProps) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  
  return (
    <div className={`flex items-center gap-1 ${className || ""}`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < full 
              ? "fill-current" 
              : half && i === full 
                ? "fill-current/50" 
                : "stroke-current"
          }`}
        />
      ))}
      <span className="ml-1 text-sm text-muted-foreground">
        {value.toFixed(1)}
      </span>
    </div>
  );
}
