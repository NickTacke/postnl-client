// postnl date <-> Date. handles dd-MM-yyyy[ HH:mm:ss] and iso yyyy-MM-dd.
// parsePnlDate/formatDate operate in LOCAL time (postnl dates are nl-local).
// lenient postnl date: a parsed Date or the raw wire string when format is unknown
export type PnlDate = Date | string;

const pad = (n: number) => String(n).padStart(2, "0");
const num = (v: string | undefined) => Number(v ?? 0);

const ISO = /^\d{4}-\d{2}-\d{2}$/;
const NL_DATE = /^\d{2}-\d{2}-\d{4}$/;
const NL_DATETIME = /^\d{2}-\d{2}-\d{4} \d{2}:\d{2}:\d{2}$/;

export function parsePnlDate(input: string): Date {
  const trimmed = input.trim();
  const [datePart = "", timePart] = trimmed.split(" ");
  let y: number;
  let mo: number;
  let d: number;
  if (ISO.test(trimmed)) {
    const [yy, mm, dd] = datePart.split("-");
    y = num(yy);
    mo = num(mm);
    d = num(dd);
  } else if (NL_DATE.test(trimmed) || NL_DATETIME.test(trimmed)) {
    const [dd, mm, yy] = datePart.split("-");
    y = num(yy);
    mo = num(mm);
    d = num(dd);
  } else {
    throw new Error(`invalid postnl date: ${input}`);
  }
  const [hh, mi, ss] = (timePart ?? "00:00:00").split(":");
  return new Date(y, mo - 1, d, num(hh), num(mi), num(ss));
}

export function formatDate(date: Date, kind: "date" | "datetime"): string {
  const d = `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()}`;
  if (kind === "date") return d;
  return `${d} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

export function formatIsoDate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
