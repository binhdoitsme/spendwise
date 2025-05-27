"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { AnimatePresence, motion } from "motion/react";

import { cn } from "@/lib/utils";

const Tabs = TabsPrimitive.Root;

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  const [activeTabWidth, setActiveTabWidth] = React.useState(0);
  const [activeTabLeft, setActiveTabLeft] = React.useState(0);
  const listRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const updateActiveTab = () => {
      const list = listRef.current;
      if (!list) return;
      const activeTab = list.querySelector(
        '[data-slot="tabs-trigger"][data-state="active"]'
      ) as HTMLElement;
      if (activeTab) {
        const listRect = list.getBoundingClientRect();
        const activeRect = activeTab.getBoundingClientRect();
        setActiveTabWidth(activeRect.width);
        setActiveTabLeft(activeRect.left - listRect.left);
      } else {
        setActiveTabWidth(0);
        setActiveTabLeft(0);
      }
    };
    updateActiveTab();
    window.addEventListener("resize", updateActiveTab);
    const observer = new MutationObserver(updateActiveTab);
    if (listRef.current) {
      observer.observe(listRef.current, {
        attributes: true,
        attributeFilter: ["data-state"],
        subtree: true,
      });
    }
    return () => {
      window.removeEventListener("resize", updateActiveTab);
      observer.disconnect();
    };
  }, []);

  return (
    <div className={cn("relative", className)}>
      <TabsPrimitive.List
        ref={listRef}
        data-slot="tabs-list"
        className={cn(
          "bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]",
          className
        )}
        {...props}
      />
      {activeTabWidth > 0 && (
        <motion.div
          className="absolute top-0 left-0 h-9 bg-background dark:bg-input/30 rounded-md shadow-sm border border-transparent dark:border-input z-0"
          style={{
            width: activeTabWidth,
            x: activeTabLeft,
          }}
          initial={false}
          animate={{
            width: activeTabWidth,
            x: activeTabLeft,
          }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30,
          }}
        />
      )}
    </div>
  );
}
TabsList.displayName = TabsPrimitive.List.displayName;

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "data-[state=active]:bg-transparent dark:data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring text-foreground dark:text-muted-foreground relative z-10 inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
        "cursor-pointer"
      )}
      {...props}
    />
  );
}
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    {...props}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
  >
    <AnimatePresence mode="sync">
      <motion.div
        key={props.value}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  </TabsPrimitive.Content>
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
