"use client";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { useState } from "react";

export default function Playground() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative w-full flex items-center justify-center">
      <div className="fixed bottom-2 w-full">
        <div className="border relative w-fit mx-auto flex flex-col items-center max-w-[500px] rounded-lg">
          <div
            className={cn(
              "transition-all duration-500",
              isOpen ? "w-[500px] h-[500px]" : "w-0 h-0"
            )}
          ></div>
          <button
            onClick={() => setIsOpen((prev) => !prev)}
            aria-label="open menu"
            className="bg-transparent border-none cursor-pointer p-2"
          >
            <Plus
              className={cn(
                "w-6 h-6 transition-all duration-500",
                isOpen ? "rotate-45" : "rotate-0"
              )}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
