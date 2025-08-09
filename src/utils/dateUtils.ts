import { zonedTimeToUtc } from 'date-fns-tz';

const EASTERN = 'America/New_York';

/**
 * Input rules:
 * - If the user picks a local time (e.g., "2025-08-13T09:15:00"), pass that string (no Z!).
 * - If you already have a UTC ISO (ends with Z), DON'T convert again — just use it as-is.
 */
export function toUtcIsoForSave(input: string | Date): string {
  if (input instanceof Date) {
    // If it's a Date from your UI picker, treat it as EASTERN wall time
    // by formatting to a bare local ISO (no Z), then convert once:
    const localIso = [
      input.getFullYear().toString().padStart(4, '0'),
      (input.getMonth() + 1).toString().padStart(2, '0'),
      input.getDate().toString().padStart(2, '0'),
    ].join('-') + 'T' +
    [input.getHours().toString().padStart(2, '0'),
     input.getMinutes().toString().padStart(2, '0'),
     input.getSeconds().toString().padStart(2, '0')].join(':');

    return zonedTimeToUtc(localIso, EASTERN).toISOString();
  }

  // string path
  const s = input.trim();

  // If it already looks like UTC (has a trailing Z or +hh:mm offset), don't “convert” again
  if (/[zZ]$/.test(s) || /[+-]\d{2}:\d{2}$/.test(s)) {
    return new Date(s).toISOString();
  }

  // Otherwise it’s a bare local wall time (no zone) like "2025-08-13T09:15:00"
  return zonedTimeToUtc(s, EASTERN).toISOString();
}
