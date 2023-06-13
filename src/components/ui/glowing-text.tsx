import { cn } from "@/lib/utils";
import type { PropsWithChildren } from "react";

type Props = {
  level?: number;
  spread?: "sm" | "md" | "lg";
  className?: string;
  glowGradient?: string;
};

export const GlowingText = ({
  children,
  level = 70,
  spread = "md",
  className,
  glowGradient = "from-cyan-300 to-cyan-400",
}: PropsWithChildren<Props>) => {
  return (
    <span className={cn("relative whitespace-nowrap", className)}>
      <span
        className={cn(
          "absolute bg-gradient-to-r bg-clip-text text-transparent",
          glowGradient,
          spread === "sm" && "blur-sm",
          spread === "md" && "blur-md",
          spread === "lg" && "blur-lg"
        )}
        style={{
          opacity: `${level}%`,
        }}
      >
        {children}
      </span>
      <span
        className={cn(
          "bg-gradient-to-r bg-clip-text text-transparent",
          glowGradient
        )}
      >
        {children}
      </span>
    </span>
  );
};
