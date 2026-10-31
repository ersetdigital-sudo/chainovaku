"use client";

import { useLayoutEffect, useRef } from "react";
import type { ChangeEvent, InputHTMLAttributes } from "react";
import { formatNumber } from "../../lib/format";
import { onlyDigits } from "../../lib/utils";

type RupiahInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "inputMode" | "value" | "onChange"
> & {
  value: string;
  onValueChange: (digits: string) => void;
};

function cleanDigits(value: string): string {
  return onlyDigits(value).replace(/^0+(?=\d)/, "");
}

function caretPosition(formatted: string, digitCount: number): number {
  let seen = 0;
  for (let index = 0; index < formatted.length; index += 1) {
    if (!/\d/.test(formatted[index])) continue;
    seen += 1;
    if (seen === digitCount) return index + 1;
  }
  return formatted.length;
}

export function RupiahInput({
  value,
  onValueChange,
  ...props
}: RupiahInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const caretRef = useRef<number | null>(null);
  const display = value ? formatNumber(value) : "";

  useLayoutEffect(() => {
    const caret = caretRef.current;
    caretRef.current = null;
    if (caret !== null && inputRef.current) {
      inputRef.current.setSelectionRange(caret, caret);
    }
  }, [display]);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const raw = event.currentTarget.value;
    const selection = event.currentTarget.selectionStart ?? raw.length;
    const digitsBefore = onlyDigits(raw.slice(0, selection)).length;
    const next = cleanDigits(raw);
    const formatted = next ? formatNumber(next) : "";
    caretRef.current = caretPosition(
      formatted,
      Math.min(digitsBefore, next.length),
    );
    onValueChange(next);
  }

  return (
    <input
      {...props}
      ref={inputRef}
      type="text"
      inputMode="numeric"
      value={display}
      onChange={handleChange}
    />
  );
}
