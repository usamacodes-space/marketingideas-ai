import * as cheerio from "cheerio";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { url } = await req.json();

  const res = await fetch(url, {
    redirect: "follow",
    headers: { "User-Agent": "marketingideas-bot/1.0" }
  });

  const html = await res.text();
  const $ = cheerio.load(html);

  const text = $("body").text().replace(/\s+/g, " ").toLowerCase();
  const links = $("a")
    .map((_, el) => $(el).attr("href") || "")
    .get()
    .join(" ")
    .toLowerCase();

  const hasPricing = links.includes("pricing");
  const hasBlog = links.includes("blog") || links.includes("articles") || links.includes("resources");
  const hasCareers = links.includes("careers") || links.includes("jobs");
  const hasDemoCTA =
    text.includes("request demo") || text.includes("book demo") || text.includes("talk to sales");

  const businessModel =
    hasPricing && hasDemoCTA ? "saas" :
    links.includes("shop") || links.includes("cart") ? "ecommerce" :
    hasBlog ? "content" :
    "unknown";

  const audience =
    text.includes("enterprise") || text.includes("sales") || text.includes("teams") || hasDemoCTA
      ? "b2b"
      : "b2c";

  const channels: string[] = [];
  if (hasDemoCTA) channels.push("sales-led");
  if (hasBlog) channels.push("content");
  if (text.includes("sign up") || text.includes("get started")) channels.push("product-led");

  const maturity = hasCareers && hasBlog ? "established" : "early";

  return NextResponse.json({
    businessModel,
    audience,
    channels,
    maturity,
    signals: {
      hasPricing,
      hasBlog,
      hasCareers,
      hasDemoCTA
    }
  });
}
