const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const MONTHS_LONG = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function parseDate(value: string | Date): Date {
  return value instanceof Date ? value : new Date(value);
}

export function startOfDay(date = new Date()): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

export function startOfWeek(date = new Date()): Date {
  const next = startOfDay(date);
  const weekday = next.getDay();
  const daysFromMonday = weekday === 0 ? 6 : weekday - 1;
  next.setDate(next.getDate() - daysFromMonday);
  return next;
}

export function startOfMonth(date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function startOfYear(date = new Date()): Date {
  return new Date(date.getFullYear(), 0, 1);
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function formatIndianDate(value: string | Date): string {
  const date = parseDate(value);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${date.getFullYear()}`;
}

export function addDays(value: string | Date, days: number): Date {
  const date = parseDate(value);
  date.setDate(date.getDate() + days);
  return date;
}

export function formatDate(value: string | Date): string {
  const date = parseDate(value);
  return `${date.getDate()} ${MONTHS_SHORT[date.getMonth()]} ${date.getFullYear()}`;
}

export function formatLongDate(value: string | Date = new Date()): string {
  const date = parseDate(value);
  return `${WEEKDAYS[date.getDay()]}, ${date.getDate()} ${MONTHS_LONG[date.getMonth()]}`;
}

export function formatTime(value: string | Date): string {
  const date = parseDate(value);
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const suffix = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${hour12}:${minutes} ${suffix}`;
}

export function formatDateTime(value: string | Date, now = new Date()): string {
  const date = parseDate(value);
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (isSameDay(date, now)) {
    return `Today, ${formatTime(date)}`;
  }
  if (isSameDay(date, yesterday)) {
    return `Yesterday, ${formatTime(date)}`;
  }
  return `${date.getDate()} ${MONTHS_SHORT[date.getMonth()]}, ${formatTime(date)}`;
}

export function greeting(now = new Date()): string {
  const hour = now.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function daysAgo(days: number, from = new Date()): Date {
  const date = new Date(from);
  date.setDate(date.getDate() - days);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function isWithinDays(value: string | Date, days: number, now = new Date()): boolean {
  const date = parseDate(value);
  return date >= daysAgo(days - 1, now) && date <= now;
}

export function toISODate(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
