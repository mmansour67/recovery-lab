/** Formats an instant as a YYYY-MM-DD calendar date in the given IANA timezone. */
export function localDateString(instant: Date, timezone: string): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(instant); // en-CA formats as YYYY-MM-DD
}

/** Parses a YYYY-MM-DD string into a UTC-midnight Date, matching how Prisma stores @db.Date columns. */
export function utcMidnightFromDateString(dateString: string): Date {
  return new Date(`${dateString}T00:00:00.000Z`);
}
