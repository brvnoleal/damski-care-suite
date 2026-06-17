import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface ResponsiveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function ResponsiveDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  className,
}: ResponsiveDialogProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className={cn(
          "!top-4 !bottom-4 !h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] sm:max-w-lg p-0 flex flex-col gap-0 rounded-2xl overflow-hidden border border-border shadow-2xl",
          className,
        )}
      >
        <SheetHeader className="p-6 pb-4 border-b border-border/40">
          <SheetTitle>{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>
        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="p-6">{children}</div>
        </ScrollArea>
        {footer && (
          <SheetFooter className="p-4 border-t border-border/40 flex-row gap-2 sm:justify-end">
            {footer}
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
