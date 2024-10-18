import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(value: number | undefined, decimals: number = 2): string {
  if (value === undefined) return 'N/A';
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatNumberWithCommas(value: number | string): string {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function parseFormattedNumber(value: string): number {
  return parseFloat(value.replace(/,/g, ''));
}