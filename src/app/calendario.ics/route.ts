import { MARKETS, MARKET_HOURS, mapsUrl } from "@/data/markets";
import { SPECIAL_STOPS } from "@/data/special-stops";

const DAY_CODE = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

const esc = (s: string) => s.replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n");
const hhmmss = (t: string) => t.replace(":", "") + "00";
const ymd = (d: Date) => `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;

/** Prima data utile (da oggi) per il giorno della settimana indicato. */
function firstOccurrence(day: number): Date {
  const d = new Date();
  while (d.getDay() !== day) d.setDate(d.getDate() + 1);
  return d;
}

/** Calendario .ics: un evento settimanale ricorrente per mercato (7:00-13:00, ora italiana) + tappe speciali (tutto il giorno). */
export function GET() {
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Mastrosimini Street Shop//Il furgone//IT",
    "CALSCALE:GREGORIAN",
    "X-WR-CALNAME:Il furgone di Mastrosimini",
    "X-WR-TIMEZONE:Europe/Rome",
    // fuso Europa/Roma con ora legale: serve perché gli eventi hanno un orario
    "BEGIN:VTIMEZONE",
    "TZID:Europe/Rome",
    "BEGIN:DAYLIGHT",
    "TZOFFSETFROM:+0100",
    "TZOFFSETTO:+0200",
    "TZNAME:CEST",
    "DTSTART:19700329T020000",
    "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU",
    "END:DAYLIGHT",
    "BEGIN:STANDARD",
    "TZOFFSETFROM:+0200",
    "TZOFFSETTO:+0100",
    "TZNAME:CET",
    "DTSTART:19701025T030000",
    "RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU",
    "END:STANDARD",
    "END:VTIMEZONE",
  ];
  for (const m of MARKETS) {
    const start = firstOccurrence(m.day);
    lines.push(
      "BEGIN:VEVENT",
      `UID:${m.slug}@mastrosiministreet.shop`,
      `DTSTAMP:${stamp}`,
      `DTSTART;TZID=Europe/Rome:${ymd(start)}T${hhmmss(MARKET_HOURS.start)}`,
      `DTEND;TZID=Europe/Rome:${ymd(start)}T${hhmmss(MARKET_HOURS.end)}`,
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
