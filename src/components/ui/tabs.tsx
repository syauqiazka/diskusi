"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextValue | null>(null);

export function Tabs({
  defaultValue,
  value,
  onValueChange,
  children,
  className,
}: {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}) {
  const [tab, setTab] = React.useState(value || defaultValue || "");

  const activeTab = value !== undefined ? value : tab;
  const setActiveTab = React.useCallback(
    (newValue: string) => {
      if (value === undefined) {
        setTab(newValue);
      }
      onValueChange?.(newValue);
    },
    [value, onValueChange]
  );

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={cn("space-y-4", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      className={cn(
        "flex flex-wrap items-center gap-1 border-b border-fluor/20 pb-1 font-mono text-xs",
        className
      )}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({
  value,
  children,
  className,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error("TabsTrigger must be used within Tabs");

  const isActive = context.activeTab === value;

  return (
    <button
      role="tab"
      type="button"
      aria-selected={isActive}
      onClick={() => context.setActiveTab(value)}
      className={cn(
        "px-4 py-2 border uppercase tracking-wider font-semibold transition-all cursor-pointer",
        isActive
          ? "bg-caution text-night border-caution font-bold shadow-sm"
          : "bg-night text-fluor/70 border-fluor/20 hover:border-fluor/50 hover:text-fluor",
        className
      )}
    >
      {children}
    </button>
  );
}

export function TabsContent({
  value,
  children,
  className,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error("TabsContent must be used within Tabs");

  if (context.activeTab !== value) return null;

  return (
    <div role="tabpanel" className={cn("pt-2 focus:outline-none", className)}>
      {children}
    </div>
  );
}
