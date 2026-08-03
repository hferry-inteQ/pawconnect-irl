import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function inferCategory(title: string): string {
  const t = title.toLowerCase();
  if (/food|kibble|treat|chew|diet|nutrition|feast|recipe|formula/.test(t)) return "Food";
  if (/toy|ball|rope|squeaky|plush|fetch|tug/.test(t)) return "Toys";
  if (/harness|leash|collar|crate|bed|carrier|coat|jacket|boot/.test(t)) return "Gear";
  if (/flea|tick|vitamin|supplement|medicine|rx|health|dental|pill|probiotic/.test(t)) return "Health";
  if (/groom|shampoo|clipper|brush|nail|trim|dryer/.test(t)) return "Grooming";
  if (/camera|feeder|tracker|gps|door|dispenser|fountain|sensor|monitor/.test(t)) return "Tech";
  if (/vacuum|cleaner|odor|litter|stain|deodor/.test(t)) return "Home";
  if (/bark ?box|subscription|monthly|box/.test(t)) return "Subscription";
  return "General";
}

function inferStoreColor(store: string): string {
  const s = store.toLowerCase();
  if (s.includes("chewy")) return "bg-blue-700";
  if (s.includes("amazon")) return "bg-orange-500";
  if (s.includes("petco")) return "bg-teal-600";
  if (s.includes("petsmart")) return "bg-red-600";
  if (s.includes("walmart")) return "bg-blue-500";
  if (s.includes("target")) return "bg-red-500";
  if (s.includes("barkbox")) return "bg-emerald-600";
  if (s.includes("rei")) return "bg-green-700";
  if (s.includes("rover")) return "bg-amber-600";
  return "bg-stone-700";
}

function extractPrice(text: string): { price: number | null; priceText: string } {
  const m = text.match(/\$[\d,]+\.?\d*/);
  if (!m) return { price: null, priceText: text.trim() };
  return { price: parseFloat(m[0].replace(/[$,]/g, "")), priceText: m[0] };
}

function extractDiscount(title: string, desc: string): { pct: number | null; label: string } {
  const combined = title + " " + desc;
  const pctMatch = combined.match(/(\d+)%\s*off/i);
  if (pctMatch) return { pct: parseInt(pctMatch[1]), label: `${pctMatch[1]}% off` };
  const dollarMatch = combined.match(/\$(\d+)\s*off/i);
  if (dollarMatch) return { pct: null, label: `$${dollarMatch[1]} off` };
  const b2g1 = /buy\s*\d+\s*get\s*\d+/i.test(combined);
  if (b2g1) return { pct: null, label: "B2G1 Free" };
  return { pct: null, label: "" };
}

interface ParsedDeal {
  title: string;
  description: string;
  store: string;
  imageUrl: string;
  link: string;
  priceText: string;
  price: number | null;
  originalPriceText: string;
  originalPrice: number | null;
  discountPct: number | null;
  discountLabel: string;
  badges: string[];
  votes: number;
}

async function fetchSlickdeals(): Promise<ParsedDeal[]> {
  const res = await fetch("https://slickdeals.net/deals/pet-care/", {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; PawConnectBot/1.0)",
      "Accept": "text/html,application/xhtml+xml",
    },
  });

  if (!res.ok) throw new Error(`Slickdeals fetch failed: ${res.status}`);

  const html = await res.text();
  const deals: ParsedDeal[] = [];

  const titlePattern = /class="[^"]*(?:dealTitle|title|fpItem)[^"]*"[^>]*>([^<]{10,})</gi;
  const pricePattern = /class="[^"]*(?:price|finalPrice)[^"]*"[^>]*>\s*(\$[\d.,]+)\s*</gi;
  const storePattern = /class="[^"]*(?:storeName|merchantName|store)[^"]*"[^>]*>([^<]{2,30})</gi;
  const thumbsPattern = /class="[^"]*(?:voteCount|thumbsCount)[^"]*"[^>]*>\s*(\d+)\s*</gi;

  const jsonLdMatches = html.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi);
  for (const match of jsonLdMatches) {
    try {
      const data = JSON.parse(match[1]);
      const items = Array.isArray(data) ? data : [data];
      for (const item of items) {
        if (item["@type"] === "Product" || item.name) {
          const { pct, label } = extractDiscount(item.name || "", item.description || "");
          const { price, priceText } = extractPrice(item.offers?.price ? `$${item.offers.price}` : "");
          deals.push({
            title: item.name || "",
            description: item.description || "",
            store: item.brand?.name || item.offers?.seller?.name || "Various",
            imageUrl: item.image || "",
            link: item.offers?.url || item.url || "#",
            priceText,
            price,
            originalPriceText: "",
            originalPrice: null,
            discountPct: pct,
            discountLabel: label,
            badges: [],
            votes: 0,
          });
        }
      }
    } catch {
      // ignore parse errors
    }
  }

  if (deals.length === 0) {
    const titles: string[] = [];
    let m: RegExpExecArray | null;
    while ((m = titlePattern.exec(html)) !== null && titles.length < 20) {
      const t = m[1].replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#39;/g, "'").trim();
      if (t.length > 15 && !titles.includes(t)) titles.push(t);
    }

    const prices: string[] = [];
    while ((m = pricePattern.exec(html)) !== null) prices.push(m[1]);

    const stores: string[] = [];
    while ((m = storePattern.exec(html)) !== null) {
      const s = m[1].trim();
      if (s.length > 1) stores.push(s);
    }

    const voteCounts: number[] = [];
    while ((m = thumbsPattern.exec(html)) !== null) voteCounts.push(parseInt(m[1]));

    titles.forEach((title, i) => {
      const { pct, label } = extractDiscount(title, "");
      const { price, priceText } = extractPrice(prices[i] || "");
      deals.push({
        title,
        description: "",
        store: stores[i] || "Slickdeals",
        imageUrl: "",
        link: "https://slickdeals.net/deals/pet-care/",
        priceText,
        price,
        originalPriceText: "",
        originalPrice: null,
        discountPct: pct,
        discountLabel: label,
        badges: ["From Slickdeals"],
        votes: voteCounts[i] || 0,
      });
    });
  }

  return deals.filter(d => d.title.length > 0);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { count: expiredCount } = await supabase
      .from("pet_deals")
      .update({ is_expired: true })
      .lt("expires_at", new Date().toISOString())
      .eq("is_expired", false);

    let scraped: ParsedDeal[] = [];
    let scrapeError: string | null = null;
    try {
      scraped = await fetchSlickdeals();
    } catch (err) {
      scrapeError = String(err);
    }

    let upserted = 0;
    if (scraped.length > 0) {
      const rows = scraped.map(d => ({
        title: d.title,
        description: d.description,
        store: d.store,
        store_logo_color: inferStoreColor(d.store),
        category: inferCategory(d.title),
        image_url: d.imageUrl || "https://images.pexels.com/photos/1254140/pexels-photo-1254140.jpeg",
        link: d.link,
        price: d.price,
        original_price: d.originalPrice,
        price_text: d.priceText,
        original_price_text: d.originalPriceText,
        discount_pct: d.discountPct,
        discount_label: d.discountLabel,
        badges: d.badges,
        votes: d.votes,
        comment_count: 0,
        is_featured: (d.votes ?? 0) > 100,
        is_expired: false,
        posted_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        last_verified_at: new Date().toISOString(),
      }));

      const { count } = await supabase.from("pet_deals").insert(rows);
      upserted = count ?? rows.length;
    }

    await supabase
      .from("pet_deals")
      .update({ last_verified_at: new Date().toISOString() })
      .eq("is_expired", false);

    return new Response(
      JSON.stringify({
        success: true,
        expired: expiredCount ?? 0,
        scraped: scraped.length,
        upserted,
        scrape_error: scrapeError,
        ran_at: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: String(err) }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
