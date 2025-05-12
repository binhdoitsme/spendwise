"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { CalendarIcon, Check } from "lucide-react";
import { DateTime } from "luxon";
import { useCallback, useEffect, useState, type ChangeEvent } from "react";

interface DateInputProps {
  label?: string;
  placeholder?: string;
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  error?: boolean;
  errorMessage?: string;
  yearRange?: { start: number; end: number };
  dateFormat?: string;
}

export function DateInput({
  label,
  // placeholder = "Select date",
  value,
  onChange,
  className,
  disabled = false,
  required = false,
  error = false,
  errorMessage,
  yearRange = { start: 1900, end: new Date().getFullYear() },
  dateFormat = "yyyy/MM/dd",
}: DateInputProps) {
  const [date, setDate] = useState<Date | undefined>(value);
  const [dateString, setDateString] = useState<string>("");
  const [internalError, setInternalError] = useState<boolean>(error);
  const [internalErrorMessage, setInternalErrorMessage] = useState<
    string | undefined
  >(errorMessage);
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("calendar");

  // Generate arrays for month and day selection
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const getDaysInMonth = (year?: number, month?: number) => {
    if (!year || !month) return Array.from({ length: 31 }, (_, i) => i + 1);

    const daysInMonth = DateTime.local(year, month).daysInMonth || 31;
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  };

  // Extract year, month, and day from the current date
  const currentYear = date ? DateTime.fromJSDate(date).year : undefined;
  const currentMonth = date ? DateTime.fromJSDate(date).month : undefined;
  const currentDay = date ? DateTime.fromJSDate(date).day : undefined;

  const [selectedYear, setSelectedYear] = useState<number | undefined>(
    currentYear
  );
  const [yearInputValue, setYearInputValue] = useState<string>(
    currentYear?.toString() || ""
  );
  const [selectedMonth, setSelectedMonth] = useState<number | undefined>(
    currentMonth
  );
  const [selectedDay, setSelectedDay] = useState<number | undefined>(
    currentDay
  );
  const [daysInMonth, setDaysInMonth] = useState<number[]>(
    getDaysInMonth(selectedYear, selectedMonth)
  );
  const [yearError, setYearError] = useState<boolean>(false);

  // Common function to update the date and call onChange
  const updateDate = useCallback(
    (newDate: Date | undefined) => {
      setDate(newDate);
      if (onChange) {
        onChange(newDate);
      }
    },
    [onChange]
  );

  // Update the date string when the date changes
  useEffect(() => {
    if (date) {
      setDateString(DateTime.fromJSDate(date).toFormat(dateFormat));
      setSelectedYear(DateTime.fromJSDate(date).year);
      setYearInputValue(DateTime.fromJSDate(date).year.toString());
      setSelectedMonth(DateTime.fromJSDate(date).month);
      setSelectedDay(DateTime.fromJSDate(date).day);
    } else {
      setDateString("");
      setSelectedYear(undefined);
      setYearInputValue("");
      setSelectedMonth(undefined);
      setSelectedDay(undefined);
    }
  }, [date, dateFormat]);

  // Update days in month when year or month changes
  useEffect(() => {
    setDaysInMonth(getDaysInMonth(selectedYear, selectedMonth));

    // If the selected day is greater than the days in the new month, adjust it
    if (selectedDay && selectedYear && selectedMonth) {
      const maxDays =
        DateTime.local(selectedYear, selectedMonth).daysInMonth || 31;
      if (selectedDay > maxDays) {
        setSelectedDay(maxDays);
      }
    }
  }, [selectedYear, selectedMonth, selectedDay]);

  // Update the date when year, month, or day changes
  useEffect(() => {
    if (selectedYear && selectedMonth && selectedDay) {
      const newDate = DateTime.local(
        selectedYear,
        selectedMonth,
        selectedDay
      ).toJSDate();
      updateDate(newDate);
    }
  }, [selectedYear, selectedMonth, selectedDay, updateDate]);

  // Update the date from the calendar
  const handleCalendarSelect = (selectedDate: Date | undefined) => {
    updateDate(selectedDate);
    setOpen(false);
  };

  // Update the date from the text input
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setDateString(inputValue);

    // Try to parse the date
    const parsedDate = DateTime.fromFormat(inputValue, dateFormat);

    if (parsedDate.isValid) {
      updateDate(parsedDate.toJSDate());
      setInternalError(false);
      setInternalErrorMessage(undefined);
    } else {
      setInternalError(true);
      setInternalErrorMessage(
        `Please enter a valid date in ${dateFormat} format`
      );
    }
  };

  // Handle year input change
  const handleYearInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setYearInputValue(inputValue);

    // Validate year input
    const yearValue = Number.parseInt(inputValue, 10);
    if (
      !isNaN(yearValue) &&
      yearValue >= yearRange.start &&
      yearValue <= yearRange.end
    ) {
      setSelectedYear(yearValue);
      setYearError(false);
    } else {
      setYearError(true);
    }
  };

  // Handle month selection
  const handleMonthChange = (month: string) => {
    setSelectedMonth(Number.parseInt(month));
  };

  // Handle day selection
  const handleDayChange = (day: string) => {
    setSelectedDay(Number.parseInt(day));
  };

  // Format month name
  const getMonthName = (month: number) => {
    return DateTime.local(2000, month).toFormat("MMMM");
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label
          htmlFor="date-input"
          className={internalError ? "text-destructive" : ""}
        >
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}

      <div className="flex gap-2">
        <Input
          id="date-input"
          type="text"
          value={dateString}
          onChange={handleInputChange}
          placeholder={dateFormat}
          disabled={disabled}
          className={cn(
            internalError && "border-destructive focus-visible:ring-destructive"
          )}
          aria-invalid={internalError}
        />

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "px-2",
                internalError &&
                  "border-destructive text-destructive hover:border-destructive focus:ring-destructive"
              )}
              disabled={disabled}
            >
              <CalendarIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 h-[21rem]" align="end">
            <Tabs
              defaultValue={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 rounded-sm">
                <TabsTrigger value="calendar">Calendar</TabsTrigger>
                <TabsTrigger value="picker">Year/Month/Day</TabsTrigger>
              </TabsList>

              <TabsContent value="calendar" className="p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={handleCalendarSelect}
                  initialFocus
                  defaultMonth={date}
                  fromYear={yearRange.start}
                  toYear={yearRange.end}
                />
              </TabsContent>

              <TabsContent value="picker" className="p-4 pt-2 space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="year-input"
                      className={yearError ? "text-destructive" : ""}
                    >
                      Year
                    </Label>
                    <Input
                      id="year-input"
                      type="number"
                      min={yearRange.start}
                      max={yearRange.end}
                      value={yearInputValue}
                      onChange={handleYearInputChange}
                      placeholder="Enter year"
                      className={cn(
                        yearError &&
                          "border-destructive focus-visible:ring-destructive"
                      )}
                    />
                    {yearError && (
                      <p className="text-xs text-destructive">
                        Please enter a year between {yearRange.start} and{" "}
                        {yearRange.end}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="month-select">Month</Label>
                    <Select
                      value={selectedMonth?.toString()}
                      onValueChange={handleMonthChange}
                    >
                      <SelectTrigger id="month-select" className="w-full">
                        <SelectValue placeholder="Month" />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map((month) => (
                          <SelectItem key={month} value={month.toString()}>
                            {getMonthName(month)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="day-select">Day</Label>
                    <Select
                      value={selectedDay?.toString()}
                      onValueChange={handleDayChange}
                      disabled={!selectedYear || !selectedMonth}
                    >
                      <SelectTrigger id="day-select" className="w-full">
                        <SelectValue placeholder="Day" />
                      </SelectTrigger>
                      <SelectContent>
                        {daysInMonth.map((day) => (
                          <SelectItem key={day} value={day.toString()}>
                            {day}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  className="w-full"
                  onClick={() => setOpen(false)}
                  disabled={
                    !selectedYear || !selectedMonth || !selectedDay || yearError
                  }
                >
                  <Check className="mr-2 h-4 w-4" />
                  Confirm
                </Button>
              </TabsContent>
            </Tabs>
          </PopoverContent>
        </Popover>
      </div>

      {internalError && internalErrorMessage && (
        <p className="text-sm font-medium text-destructive">
          {internalErrorMessage}
        </p>
      )}
    </div>
  );
}
