"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CustomCalendarProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

export function CustomCalendar({ selectedDate, onSelectDate }: CustomCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 3);
  minDate.setHours(0, 0, 0, 0);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    let firstDayOfWeek = firstDay.getDay();
    firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    
    const daysInMonth = lastDay.getDate();
    const days: (Date | null)[] = [];
    
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const days = getDaysInMonth(currentMonth);
  const monthYear = currentMonth.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleSelectDate = (date: Date) => {
    if (date < minDate) return;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    onSelectDate(`${year}-${month}-${day}`);
  };

  const isSelected = (date: Date) => {
    if (!selectedDate) return false;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}` === selectedDate;
  };

  const isToday = (date: Date) => date.toDateString() === today.toDateString();
  const isDisabled = (date: Date) => date < minDate;

  return (
    <div className="bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-850 rounded-xl p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePrevMonth}
          className="p-2 hover:bg-slate-200 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
        >
          <ChevronLeft size={20} className="text-slate-600 dark:text-zinc-400" />
        </button>
        <h3 className="font-bold text-slate-900 dark:text-zinc-100 capitalize">{monthYear}</h3>
        <button
          onClick={handleNextMonth}
          className="p-2 hover:bg-slate-200 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
        >
          <ChevronRight size={20} className="text-slate-600 dark:text-zinc-400" />
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map(day => (
          <div key={day} className="text-center text-xs font-bold text-slate-500 dark:text-zinc-400 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="h-10" />;
          }

          const selected = isSelected(date);
          const todayDate = isToday(date);
          const disabled = isDisabled(date);

          return (
            <button
              key={date.toISOString()}
              onClick={() => !disabled && handleSelectDate(date)}
              disabled={disabled}
              className={`
                h-10 w-10 rounded-full flex flex-col items-center justify-center text-sm font-medium transition-all relative
                ${selected ? 'bg-[#8CC540] text-white shadow-md' : ''}
                ${!selected && !disabled ? 'hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-900 dark:text-zinc-100' : ''}
                ${disabled ? 'text-slate-300 dark:text-zinc-600 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <span>{date.getDate()}</span>
              {todayDate && !selected && (
                <div className="absolute bottom-1 w-1 h-1 rounded-full bg-[#8CC540]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
