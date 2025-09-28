import * as React from "react";
import { cn } from "@/lib/cn";

interface AccordionContextValue {
  value: string | null;
  setValue: (value: string | null) => void;
}

const AccordionContext = React.createContext<AccordionContextValue | undefined>(
  undefined
);

export interface AccordionProps {
  children: React.ReactNode;
  type?: "single" | "multiple";
  defaultValue?: string;
}

export const Accordion = ({
  children,
  type = "single",
  defaultValue = null
}: AccordionProps) => {
  const [value, setValue] = React.useState<string | null>(defaultValue);

  const handleSetValue = (next: string | null) => {
    if (type === "multiple") {
      setValue(next);
      return;
    }
    setValue((current) => (current === next ? null : next));
  };

  return (
    <AccordionContext.Provider value={{ value, setValue: handleSetValue }}>
      <div className="space-y-2">{children}</div>
    </AccordionContext.Provider>
  );
};

export interface AccordionItemProps
  extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

export const AccordionItem = ({
  value,
  className,
  children,
  ...props
}: AccordionItemProps) => (
  <div
    data-accordion-item={value}
    className={cn("overflow-hidden rounded-lg border border-slate-200", className)}
    {...props}
  >
    {children}
  </div>
);

export interface AccordionTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  targetValue: string;
}

export const AccordionTrigger = ({
  className,
  children,
  targetValue,
  ...props
}: AccordionTriggerProps) => {
  const context = React.useContext(AccordionContext);
  if (!context) {
    throw new Error("AccordionTrigger must be used within Accordion");
  }

  const isOpen = context.value === targetValue;

  return (
    <button
      type="button"
      onClick={() => context.setValue(targetValue)}
      className={cn(
        "flex w-full items-center justify-between bg-slate-100 px-4 py-3 text-left text-sm font-medium text-slate-900 transition-colors hover:bg-slate-200",
        className
      )}
      aria-expanded={isOpen}
      {...props}
    >
      <span>{children}</span>
      <span className="text-xs text-slate-600">{isOpen ? "Hide" : "Show"}</span>
    </button>
  );
};

export const AccordionContent = ({
  className,
  children,
  targetValue,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { targetValue: string }) => {
  const context = React.useContext(AccordionContext);
  if (!context) {
    throw new Error("AccordionContent must be used within Accordion");
  }

  const isOpen = context.value === targetValue;

  return (
    <div
      hidden={!isOpen}
      className={cn("border-t border-slate-200 bg-white px-4 py-3 text-sm", className)}
      {...props}
    >
      {children}
    </div>
  );
};
