import { INSTAGRAM_URL, MARKETS, MARKET_HOURS, SUNDAY_NOTE } from "@/data/markets";

/** Disegna "Il giro della settimana" in verticale 1080x1920 (storie/WhatsApp) e lo scarica come PNG. */
export function downloadCalendarImage() {
  const W = 1080;
  const H = 1920;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d")!;
  const font = getComputedStyle(document.documentElement).getPropertyValue("--font-poppins").trim() || "Poppins";
  const f = (w: number, px: number) => `${w} ${px}px ${font}, Arial, sans-serif`;

  g.fillStyle = "#0c0c0c";
  g.fillRect(0, 0, W, H);
  g.fillStyle = "#d4a85c";
  g.fillRect(0, 0, W, 14);

  g.textAlign = "center";
  g.fillStyle = "#d4a85c";
  g.font = f(600, 38);
  g.fillText("UN MERCATO DIVERSO OGNI GIORNO", W / 2, 150);
  g.fillStyle = "#fff";
  g.font = f(800, 118);
  g.fillText("DOVE SIAMO", W / 2, 290);
  g.font = f(500, 40);
  g.fillText(`Ogni mercato dalle ${MARKET_HOURS.from} alle ${MARKET_HOURS.to}`, W / 2, 360);

  g.textAlign = "left";
  MARKETS.forEach((m, i) => {
    const y = 440 + i * 205;
    g.fillStyle = "#161616";
    g.fillRect(70, y, W - 140, 175);
    g.fillStyle = "#d4a85c";
    g.beginPath();
    g.arc(160, y + 87, 52, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#0c0c0c";
    g.textAlign = "center";
    g.font = f(800, 34);
    g.fillText(m.dayName.slice(0, 3).toUpperCase(), 160, y + 100);
    g.textAlign = "left";
    g.fillStyle = "#fff";
    g.font = f(800, 54);
    g.fillText(m.town.toUpperCase(), 250, y + 78);
    g.fillStyle = "#d4a85c";
    g.font = f(500, 30);
    g.fillText(m.spot, 250, y + 128, W - 340);
  });

  g.textAlign = "center";
  g.fillStyle = "#fff";
  g.font = f(500, 34);
  g.fillText(SUNDAY_NOTE, W / 2, 1720);
  g.fillStyle = "#d4a85c";
  g.font = f(800, 44);
  g.fillText("MASTROSIMINI STREET SHOP", W / 2, 1810);
  g.fillStyle = "#fff";
  g.font = f(500, 32);
  g.fillText(INSTAGRAM_URL.replace("https://www.", "").replace(/\/$/, ""), W / 2, 1860);

  const a = document.createElement("a");
  a.download = "dove-siamo-mastrosimini.png";
  a.href = c.toDataURL("image/png");
  a.click();
}
