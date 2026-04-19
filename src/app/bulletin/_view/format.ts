const DATE_FMT: Intl.DateTimeFormatOptions = {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
};

const SHORT_DATE_FMT: Intl.DateTimeFormatOptions = {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
};

export function formatBulletinDate(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00Z`).toLocaleDateString("en-US", DATE_FMT);
}

export function formatEventDate(isoDate: string): string {
  const weekday = new Date(`${isoDate}T00:00:00Z`).toLocaleDateString("en-US", {
    weekday: "long",
    timeZone: "UTC",
  });
  const rest = new Date(`${isoDate}T00:00:00Z`).toLocaleDateString(
    "en-US",
    SHORT_DATE_FMT,
  );
  return `${weekday}, ${rest}`;
}
