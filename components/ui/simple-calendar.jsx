'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isToday 
} from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

export function SimpleCalendar({
  className,
  classNames,
  showOutsideDays = true,
  selected,
  onSelect,
  modifiers = {},
  modifiersClassNames = {},
  ...props
}) {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const dateFormat = "d";
  const days = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const weekDays = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa']; 
  // Adjusted manually or derived from locale could be better, but fixed is stable.
  // Actually, let's derive them to be safe with 'es' locale if needed, 
  // but for "Simple" calendar, hardcoded Spanish initials is fine and robust.
  // Wait, startOfWeek with locale:es usually starts on Monday. 
  // Let's check: es locale starts on Monday.
  const weekDaysEs = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'];

  return (
    <div className={cn("p-3 w-full", className)} {...props}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 space-x-4">
        <span className="text-sm font-medium text-white capitalize pl-2">
          {format(currentMonth, "MMMM yyyy", { locale: es })}
        </span>
        <div className="flex items-center space-x-1">
          <button
            onClick={prevMonth}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-white border-zinc-700 hover:bg-zinc-800"
            )}
            type="button"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={nextMonth}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-white border-zinc-700 hover:bg-zinc-800"
            )}
            type="button"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Weekdays Row */}
      <div className="grid grid-cols-7 mb-2">
        {weekDaysEs.map((day) => (
          <div
            key={day}
            className="text-zinc-400 text-[0.8rem] font-normal text-center h-9 flex items-center justify-center"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1 w-full">
        {days.map((day, dayIdx) => {
          const isSelected = selected ? isSameDay(day, selected) : false;
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isDayToday = isToday(day);
          
          // Check modifiers
          let hasSlots = false;
          if (modifiers.hasSlots) {
             hasSlots = modifiers.hasSlots(day);
          }

          // Construct className based on state
          const dayClassName = cn(
            "h-14 w-full p-0 font-normal text-sm flex items-center justify-center rounded-full relative transition-colors",
            !isCurrentMonth && "text-zinc-600 opacity-50",
            isCurrentMonth && "text-white hover:bg-zinc-800 hover:text-white cursor-pointer",
            isSelected && "bg-white text-zinc-950 hover:bg-white hover:text-zinc-950 font-medium opacity-100",
            hasSlots && !isSelected && "font-bold text-emerald-400",
            modifiersClassNames.hasSlots && hasSlots && !isSelected ? modifiersClassNames.hasSlots : ""
          );

          // Apply special indicator for slots if needed (manual rendering since we bypass DayPicker)
          // The user passed: "font-bold text-emerald-400 relative after:content-[''] after:absolute after:top-1 after:right-1 after:w-1.5 after:h-1.5 after:bg-emerald-500 after:rounded-full"
          // We can just apply that class directly if hasSlots is true.

          return (
            <div key={day.toString()} className="w-full aspect-square flex items-center justify-center">
                <button
                    type="button"
                    onClick={() => onSelect && onSelect(day)}
                    disabled={!isCurrentMonth} // Optional: disable outside days selection
                    className={dayClassName}
                >
                    <time dateTime={format(day, 'yyyy-MM-dd')}>
                        {format(day, dateFormat)}
                    </time>
                    {/* Manual dot indicator if not using CSS after pseudo-element from prop */}
                    {hasSlots && !isSelected && (
                         <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    )}
                </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
