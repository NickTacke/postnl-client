// postnl date <-> Date. handles dd-MM-yyyy[ HH:mm:ss] and iso yyyy-MM-dd
const pad = (n: number) => String(n).padStart(2, "0");
const num = (v: string | undefined) => Number(v ?? 0);

export function parsePnlDate(input: string): Date {
  const [datePart = "", timePart] = input.trim().split(" ");
  let y: number;
  let mo: number;
  let d: number;
  if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
    const [yy, mm, dd] = datePart.split("-");
    y = num(yy);
    mo = num(mm);
    d = num(dd);
  } else {
    const [dd, mm, yy] = datePart.split("-");
    y = num(yy);
    mo = num(mm);
    d = num(dd);
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
