import * as React from "react";
import { cn } from "@/lib/utils";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
}

export const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <section
        ref={ref}
        className={cn("py-16 md:py-24", className)}
        {...props}
      >
        {children}
      </section>
    );
  }
);
Section.displayName = "Section";

export const Container = React.forwardRef<HTMLDivElement, SectionProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("container mx-auto px-4 md:px-6 max-w-7xl", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Container.displayName = "Container";
