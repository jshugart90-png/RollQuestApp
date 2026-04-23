import type { GymDay } from "../store/gym";

const DAYS: GymDay[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

/** Monday-start week containing `reference` (local timezone). */
export function getMondayWeekDates(reference = new Date()): { day: GymDay; date: Date }[] {
  const d = new Date(reference);
  d.setHours(12, 0, 0, 0);
  const dow = d.getDay(); // 0 Sun … 6 Sat
  const diffToMonday = (dow + 6) % 7;
  const monday = new Date(d);
  monday.setDate(d.getDate() - diffToMonday);
  monday.setHours(0, 0, 0, 0);
  return DAYS.map((day, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    return { day, date };
  });
}

export function formatShortWeekdayDate(date: Date): string {
  return date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

export function formatWeekRangeLabel(week: { date: Date }[]): string {
  if (week.length < 7) return "";
  const start = week[0].date;
  const end = week[6].date;
  const sameYear = start.getFullYear() === end.getFullYear();
  const startOpts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  const endOpts: Intl.DateTimeFormatOptions = sameYear
    ? { month: "short", day: "numeric" }
    : { month: "short", day: "numeric", year: "numeric" };
  return `${start.toLocaleDateString(undefined, startOpts)} – ${end.toLocaleDateString(undefined, endOpts)}`;
}
