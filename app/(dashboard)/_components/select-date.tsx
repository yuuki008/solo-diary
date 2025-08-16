"use client";

import { useState } from "react";
import { ChevronDownIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";

type SelectDateDialogProps = {
  date: string;
};

export default function SelectDateDialog({ date }: SelectDateDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const selectedDate = dayjs(date).toDate();

  const handleSelectDate = (date: Date | undefined) => {
    if (!date) return;

    router.push(`/?date=${dayjs(date).format("YYYY-MM-DD")}`);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-fit mx-auto sticky top-5 z-20 !bg-background hover:bg-accent"
        >
          {selectedDate
            ? dayjs(selectedDate).format("YYYY-MM-DD")
            : "Select date"}
          <ChevronDownIcon className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto overflow-hidden p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          captionLayout="dropdown"
          onSelect={handleSelectDate}
        />
      </PopoverContent>
    </Popover>
  );
}
