import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function LoadingSpinner({ className, size = "md" }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8"
  };

  return (
    <div className={cn("animate-spin rounded-full border-2 border-gray-300 border-t-warm-brown", sizeClasses[size], className)} />
  );
}

export function LoadingDots({ className }: { className?: string }) {
  return (
    <div className={cn("flex space-x-1", className)}>
      <div className="w-2 h-2 bg-gold rounded-full loading-dot"></div>
      <div className="w-2 h-2 bg-gold rounded-full loading-dot"></div>
      <div className="w-2 h-2 bg-gold rounded-full loading-dot"></div>
    </div>
  );
}
