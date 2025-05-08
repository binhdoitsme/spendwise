"use client";

import { useState, useEffect, useRef, type ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface CurrencyInputProps {
  label?: string;
  value?: number;
  onChange?: (value: number) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  locale?: string;
  currencyCode?: string;
  showCurrencySymbol?: boolean;
}

export function CurrencyInput({
  label,
  value = 0,
  onChange,
  placeholder = "0",
  className,
  disabled = false,
  required = false,
  locale = navigator.language || "en-US",
  currencyCode,
  showCurrencySymbol = true,
}: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [cursorPosition, setCursorPosition] = useState<number | null>(null);

  // Get locale-specific separators
  const getFormatters = () => {
    // Create a number formatter for the specified locale
    const numberFormatter = new Intl.NumberFormat(locale);

    // Extract the decimal and thousand separators from the formatter
    const parts = numberFormatter.formatToParts(1234.5);
    const thousandSeparator =
      parts.find((part) => part.type === "group")?.value || ",";
    const decimalSeparator =
      parts.find((part) => part.type === "decimal")?.value || ".";

    // Create a currency formatter if a currency code is provided
    const currencyFormatter = currencyCode
      ? new Intl.NumberFormat(locale, {
          style: "currency",
          currency: currencyCode,
          currencyDisplay: "symbol",
        })
      : null;

    // Extract the currency symbol if needed
    let currencySymbol = "";
    if (showCurrencySymbol && currencyFormatter) {
      const currencyParts = currencyFormatter.formatToParts(0);
      currencySymbol =
        currencyParts.find((part) => part.type === "currency")?.value || "";
    }

    return { thousandSeparator, decimalSeparator, currencySymbol };
  };

  const { thousandSeparator, decimalSeparator, currencySymbol } =
    getFormatters();

  // Format the number according to locale
  const formatValue = (val: number): string => {
    return new Intl.NumberFormat(locale, {
      useGrouping: true,
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Parse the formatted string back to a number
  const parseFormattedValue = (val: string): number => {
    // Remove all characters except digits and decimal separator
    return Number(val.replace(/[^0-9]/g, ""));
  };

  // Initialize display value
  useEffect(() => {
    if (value !== undefined) {
      setDisplayValue(formatValue(value));
    }
  }, [locale, value]);

  // Handle input changes
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const newCursorPosition = input.selectionStart;

    // Remove any non-digit characters
    const rawValue = input.value.replace(/[^0-9]/g, "");

    // Convert to number
    const numericValue = parseFormattedValue(rawValue);

    // Format the number and update the state
    const newFormattedValue = formatValue(numericValue);
    setDisplayValue(newFormattedValue);

    // Calculate cursor position adjustment
    if (newCursorPosition !== null) {
      // Count thousand separators before cursor in the old value
      const oldSeparatorCount = (
        input.value
          .substring(0, newCursorPosition)
          .match(new RegExp(`\\${thousandSeparator}`, "g")) || []
      ).length;

      // Count thousand separators before cursor in the new value
      // We need to estimate where the cursor would be in the new value
      const estimatedCursorPos = Math.min(
        newCursorPosition,
        newFormattedValue.length
      );
      const newSeparatorCount = (
        newFormattedValue
          .substring(0, estimatedCursorPos)
          .match(new RegExp(`\\${thousandSeparator}`, "g")) || []
      ).length;

      // Adjust cursor position based on the difference in thousand separators
      setCursorPosition(
        newCursorPosition + (newSeparatorCount - oldSeparatorCount)
      );
    }

    // Call the onChange callback with the numeric value
    if (onChange) {
      onChange(numericValue);
    }
  };

  // Restore cursor position after React updates the input
  useEffect(() => {
    if (inputRef.current && cursorPosition !== null) {
      inputRef.current.selectionStart = cursorPosition;
      inputRef.current.selectionEnd = cursorPosition;
      setCursorPosition(null);
    }
  }, [displayValue, cursorPosition]);

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label htmlFor="currency-input">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      <div className="relative">
        {currencySymbol && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {currencySymbol}
          </span>
        )}
        <Input
          id="currency-input"
          ref={inputRef}
          type="text"
          value={displayValue}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={cn(
            currencySymbol && "pl-7",
            "aria-invalid:ring-destructive/20"
          )}
          dir={
            ["ar", "he", "fa", "ur"].includes(locale.split("-")[0])
              ? "rtl"
              : "ltr"
          }
        />
      </div>
    </div>
  );
}
