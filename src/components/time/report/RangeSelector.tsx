import { CalendarDays } from "lucide-react";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { fr } from "react-day-picker/locale";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  createDefaultWorkdayDateRange,
  formatMinutes,
  formatShortDateLabel,
  toWorkdayRangeFromDateSelection,
  type WorkdayRange,
} from "@/lib/time";

interface RangeSelectorProps {
  onWindowRangeChange: (range: WorkdayRange) => void;
  windowActualTotal: number;
}

export function RangeSelector({ onWindowRangeChange, windowActualTotal }: RangeSelectorProps) {
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>(() =>
    createDefaultWorkdayDateRange(5),
  );

  const windowRange = toWorkdayRangeFromDateSelection(selectedRange?.from, selectedRange?.to);

  const handleRangeChange = (range: DateRange | undefined) => {
    setSelectedRange(range);
    onWindowRangeChange(toWorkdayRangeFromDateSelection(range?.from, range?.to));
  };

  return (
    <div className="grid grid-cols-1 items-start gap-3 lg:grid-cols-2">
      <div>
        <Popover>
          <PopoverTrigger
            render={
              <Button variant="outline" className="w-full justify-start">
                <CalendarDays className="h-4 w-4" />
                {windowRange.startDate && windowRange.endDate
                  ? `${formatShortDateLabel(windowRange.startDate)} - ${formatShortDateLabel(windowRange.endDate)}`
                  : "Selectionnez une plage de dates"}
              </Button>
            }
          />
          <PopoverContent align="start" className="w-auto p-1">
            <Calendar
              mode="range"
              numberOfMonths={1}
              selected={selectedRange}
              onSelect={handleRangeChange}
              locale={fr}
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="space-y-1 text-xs text-muted-foreground lg:text-right">
        <div>
          Jours ouvres retenus: <strong>{windowRange.workdayDates.length}</strong>
        </div>
        <div>
          Realise sur la periode: <strong>{formatMinutes(windowActualTotal)}</strong>
        </div>
      </div>
    </div>
  );
}
