/**
 * Date formatting for the timeline.
 * Dates are written as "YYYY-MM" (month + year) or "YYYY" (year only) in data/timeline.json.
 */
import { getLanguage } from './i18n.js';

function formatDatePart(value) {
  const [year, month] = String(value).split('-').map(Number);
  if (!month) return String(year);

  return new Intl.DateTimeFormat(getLanguage(), {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, 1)));
}

/**
 * { start: "2026-06", end: "2026-08" } -> "Jun 2026 – Aug 2026"
 * { start: "2023-02" }                 -> "Feb 2023"
 * { start: "2026-06", end: "present" } -> "Jun 2026 – Present"
 */
export function formatPeriod({ start, end }, presentLabel) {
  const from = formatDatePart(start);
  if (!end) return from;
  const to = end === 'present' ? presentLabel : formatDatePart(end);
  return `${from} – ${to}`;
}
