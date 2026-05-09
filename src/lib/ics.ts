// Minimal RFC-5545 calendar invite (.ics) generator for booking
// confirmations. We render a single VEVENT and trigger a download.
// Apple Calendar, Google Calendar, Outlook all import this file directly.

export interface IcsEvent {
  uid: string;
  title: string;
  description?: string;
  location?: string;
  startUtc: Date;
  endUtc: Date;
  organizer?: { name: string; email: string };
}

const padTwo = (n: number) => String(n).padStart(2, "0");

const toIcsDate = (d: Date): string => {
  return (
    d.getUTCFullYear().toString() +
    padTwo(d.getUTCMonth() + 1) +
    padTwo(d.getUTCDate()) +
    "T" +
    padTwo(d.getUTCHours()) +
    padTwo(d.getUTCMinutes()) +
    padTwo(d.getUTCSeconds()) +
    "Z"
  );
};

// RFC-5545 §3.3.11 escaping. Backslash, comma, and semicolon become escaped;
// newlines become literal \n inside text.
const escapeText = (raw: string): string =>
  raw
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");

const foldLine = (line: string): string => {
  // RFC-5545 §3.1: fold lines longer than 75 octets with CRLF + space.
  if (line.length <= 75) return line;
  const chunks: string[] = [];
  let i = 0;
  while (i < line.length) {
    const chunkLen = i === 0 ? 75 : 74;
    chunks.push((i === 0 ? "" : " ") + line.slice(i, i + chunkLen));
    i += chunkLen;
  }
  return chunks.join("\r\n");
};

export const buildIcs = (event: IcsEvent): string => {
  const dtStamp = toIcsDate(new Date());
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Elevated Health Augusta//Booking//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${event.uid}`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${toIcsDate(event.startUtc)}`,
    `DTEND:${toIcsDate(event.endUtc)}`,
    `SUMMARY:${escapeText(event.title)}`,
  ];
  if (event.description) {
    lines.push(`DESCRIPTION:${escapeText(event.description)}`);
  }
  if (event.location) {
    lines.push(`LOCATION:${escapeText(event.location)}`);
  }
  if (event.organizer) {
    lines.push(
      `ORGANIZER;CN=${escapeText(event.organizer.name)}:mailto:${event.organizer.email}`,
    );
  }
  lines.push("END:VEVENT", "END:VCALENDAR");
  return lines.map(foldLine).join("\r\n");
};

export const downloadIcs = (event: IcsEvent, filename = "appointment.ics") => {
  const ics = buildIcs(event);
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".ics") ? filename : `${filename}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
