import { CalendarDays } from "lucide-react";
import { useEffect, useState } from "react";
import type { DateRange } from "react-day-picker";
import { fr } from "react-day-picker/locale";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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

export function RangeSelector({
  onWindowRangeChange,
  windowActualTotal,
}: RangeSelectorProps) {
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>(
    () => createDefaultWorkdayDateRange(5),
  );

  useEffect(() => {
    const defaultRange = createDefaultWorkdayDateRange(5);
    onWindowRangeChange(
      toWorkdayRangeFromDateSelection(defaultRange?.from, defaultRange?.to),
    );
  }, []);

  const windowRange = toWorkdayRangeFromDateSelection(
    selectedRange?.from,
    selectedRange?.to,
  );

  const handleRangeChange = (range: DateRange | undefined) => {
    setSelectedRange(range);
    onWindowRangeChange(
      toWorkdayRangeFromDateSelection(range?.from, range?.to),
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3 items-start">
      <div>
        <Popover>
          <PopoverTrigger
            render={
              <Button variant="outline" className="justify-start w-full">
                <CalendarDays className="w-4 h-4" />
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
      <div className="text-muted-foreground text-xs space-y-1 lg:text-right">
        <div>
          Jours ouvres retenus:{" "}
          <strong>{windowRange.workdayDates.length}</strong>
        </div>
        <div>
          Realise sur la periode:{" "}
          <strong>{formatMinutes(windowActualTotal)}</strong>
        </div>
      </div>
    </div>
  );
}
