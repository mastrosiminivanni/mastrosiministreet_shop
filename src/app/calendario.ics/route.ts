import { MARKETS, mapsUrl } from "@/data/markets";
import { SPECIAL_STOPS } from "@/data/special-stops";

const DAY_CODE = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

const esc = (s: string) => s.replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n");
const ymd = (d: Date) => `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;

/** Prima data utile (da oggi) per il giorno della settimana indicato. */
function firstOccurrence(day: number): Date {
  const d = new Date();
  while (d.getDay() !== day) d.setDate(d.getDate() + 1);
  return d;
}

/** Calendario .ics: un evento settimanale ricorrente per mercato (tutto il giorno: gli orari non sono ancora definiti) + tappe speciali. */
export function GET() {
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Mastrosimini Street Shop//Il furgone//IT",
    "CALSCALE:GREGORIAN",
    "X-WR-CALNAME:Il furgone di Mastrosimini",
  ];
  for (const m of MARKETS) {
    const start = firstOccurrence(m.day);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    lines.push(
      "BEGIN:VEVENT",
      `UID:${m.slug}@mastrosiministreet.shop`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${ymd(start)}`,
      `DTEND;VALUE=DATE:${ymd(end)}`,
      `RRULE:FREQ=WEEKLY;BYDAY=${DAY_CODE[m.day]}`,
      `SUMMARY:${esc(`Il furgone a ${m.town}`)}`,
      `LOCATION:${esc(`${m.spot}, ${m.town}`)}`,
      `GEO:${m.lat};${m.lng}`,
      `DESCRIPTION:${esc(`Mastrosimini Street Shop: un mercato diverso ogni giorno. ${mapsUrl(m)}`)}`,
      "END:VEVENT",
    );
  }
  for (const s of SPECIAL_STOPS) {
    const d = new Date(`${s.date}T00:00:00`);
    const end = new Date(d);
    end.setDate(end.getDate() + 1);
    lines.push(
      "BEGIN:VEVENT",
      `UID:special-${s.date}@mastrosiministreet.shop`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${ymd(d)}`,
      `DTEND;VALUE=DATE:${ymd(end)}`,
      `SUMMARY:${esc(`Tappa speciale: il furgone a ${s.town}`)}`,
      `LOCATION:${esc([s.spot, s.town].filter(Boolean).join(", "))}`,
      "END:VEVENT",
    );
  }
  lines.push("END:VCALENDAR");
  return new Response(lines.join("\r\n") + "\r\n", {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="mastrosimini-furgone.ics"',
    },
  });
}
