"use client";

import * as React from "react";
import { add, format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TimePickerDemo } from "./time-picker-demo";

export function DateTimePicker() {
  const [date, setDate] = React.useState<Date>();

  /**
   * carry over the current time when a user clicks a new day
   * instead of resetting to 00:00
   */
  const handleSelect = (newDay: Date | undefined) => {
    if (!newDay) return;
    if (!date) {
      setDate(newDay);
      return;
    }
    const diff = newDay.getTime() - date.getTime();
    const diffInDays = diff / (1000 * 60 * 60 * 24);
    const newDateFull = add(date, { days: Math.ceil(diffInDays) });
    setDate(newDateFull);
  };

  return (
    <Popover>
      <PopoverTrigger
        asChild
        className="flex  bg-transparent backdrop-blur-lg shadow-2xl bg-neutral-900 rounded-[8px] p-2 pb-3 items-center space-y-2 w-full border-none"
      >
        <Button
          variant={"outline"}
          className={cn(
            " justify-start items-center text-neutral-400  text-left font-normal ",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className=" h-4 w-4 mt-2 text-neutral-400" />
          {date ? (
            format(date, "PPP HH:mm:ss")
          ) : (
            <span className="text-neutral-400">Pick a date</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-neutral-800 text-neutral-400">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(d) => handleSelect(d)}
          initialFocus
          className="  "
        />
        <div className="p-3 border-t ">
          <TimePickerDemo setDate={setDate} date={date} />
        </div>
      </PopoverContent>
    </Popover>
  );
}
