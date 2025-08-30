"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Plus, X } from "lucide-react";
import { useState } from "react";

export default function Playground() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative w-full flex items-center justify-center">
      <Button
        className={cn(
          "transition-opacity duration-300 ease-in-out",
          isOpen ? "opacity-0" : "opacity-100"
        )}
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        aria-label="open menu"
      >
        <Plus className="w-4 h-4" />
      </Button>

      <div
        className={cn(
          "w-full max-w-[500px] mx-auto grid transition-all duration-800",
          isOpen
            ? "grid-rows-[1fr] w-full opacity-100"
            : "grid-rows-[0fr] w-0 opacity-0"
        )}
      >
        <div className="overflow-hidden border rounded-lg">
          <div className="p-4 relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2"
              onClick={() => setIsOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>

            <div className="text-sm text-muted-foreground">New Post</div>

            <Textarea />
            <Button>Post</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
