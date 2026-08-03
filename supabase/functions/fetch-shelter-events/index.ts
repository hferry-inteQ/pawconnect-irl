import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ShelterSource {
  city_slug: string;
  org_name: string;
  events_url: string;
  category: "adoption" | "fostering" | "charity" | "training";
}

const SHELTER_SOURCES: ShelterSource[] = [
  {
    city_slug: "dallas",
    org_name: "SPCA of Texas",
    events_url: "https://spca.org/adopt/adoption-events",
    category: "adoption",
  },
  {
    city_slug: "fort-worth",
    org_name: "Humane Society of North Texas",
    events_url: "https://www.hsnt.org/events",
    category: "adoption",
  },
  {
    city_slug: "austin",
    org_name: "Austin Pets Alive!",
    events_url: "https://www.austinpetsalive.org/events",
    category: "adoption",
  },
  {
    city_slug: "chicago",
    org_name: "PAWS Chicago",
    events_url: "https://www.pawschicago.org/our-work/pet-adoption/adoption-events",
    category: "adoption",
  },
  {
    city_slug: "chicago",
    org_name: "The Anti-Cruelty Society",
    events_url: "https://anticruelty.org/events",
    category: "adoption",
  },
  {
    city_slug: "new-orleans",
    org_name: "Louisiana SPCA",
    events_url: "https://www.louisianaspca.org/events",
    category: "adoption",
  },
];

interface ParsedEvent {
  title: string;
  description: string;
  location_name: string;
  address: string;
  event_date: string;
  end_date: string | null;
  organizer_name: string;
  category: string;
  tags: string[];
  source_url: string;
}

async function scrapeJsonLdEvents(
  url: string,
  orgName: string,
): Promise<ParsedEvent[]> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "PawsConnectBot/1.0 (community event aggregator; contact@inteq.com)",
      },
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) return [];
    const html = await res.text();

    const jsonLdBlocks: string[] = [];
    const pattern = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
    let match;
    while ((match = pattern.exec(html)) !== null) {
      jsonLdBlocks.push(match[1]);
    }

    const events: ParsedEvent[] = [];

    for (const block of jsonLdBlocks) {
      try {
        const data = JSON.parse(block);
        const items = Array.isArray(data) ? data : [data];

        for (const item of items) {
          if (item["@type"] !== "Event") continue;

          const loc = item.location;
          const locationName =
            loc?.name ?? loc?.["@type"] === "Place" ? loc?.name ?? "" : "";
          const address =
            typeof loc?.address === "string"
              ? loc.address
              : [
                  loc?.address?.streetAddress,
                  loc?.address?.addressLocality,
                  loc?.address?.addressRegion,
                  loc?.address?.postalCode,
                ]
                  .filter(Boolean)
                  .join(", ");

          events.push({
            title: item.name ?? "Untitled Event",
            description:
              item.description?.replace(/<[^>]+>/g, "").slice(0, 1000) ?? "",
            location_name: locationName,
            address,
            event_date: item.startDate ?? new Date().toISOString(),
            end_date: item.endDate ?? null,
            organizer_name: item.organizer?.name ?? orgName,
            category: "adoption",
            tags: [orgName.toLowerCase().replace(/\s+/g, "-")],
            source_url: url,
          });
        }
      } catch {
        // malformed JSON-LD — skip
      }
    }

    return events;
  } catch {
    return [];
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: cities } = await supabase
      .from("cities")
      .select("id, slug");

    const { data: categories } = await supabase
      .from("event_categories")
      .select("id, slug");

    const cityMap = Object.fromEntries(
      (cities ?? []).map((c: { id: string; slug: string }) => [c.slug, c.id]),
    );
    const catMap = Object.fromEntries(
      (categories ?? []).map((c: { id: string; slug: string }) => [
        c.slug,
        c.id,
      ]),
    );

    const results: { org: string; found: number; inserted: number }[] = [];

    for (const source of SHELTER_SOURCES) {
      const cityId = cityMap[source.city_slug];
      if (!cityId) continue;

      const categoryId = catMap[source.category];
      if (!categoryId) continue;

      const parsed = await scrapeJsonLdEvents(source.events_url, source.org_name);

      let inserted = 0;

      for (const ev of parsed) {
        if (new Date(ev.event_date) < new Date()) continue;

        const row = {
          title: ev.title,
          description: ev.description,
          location_name: ev.location_name || source.org_name,
          address: ev.address,
          city_id: cityId,
          category_id: categoryId,
          event_date: ev.event_date,
          end_date: ev.end_date,
          image_url:
            "https://images.pexels.com/photos/406014/pexels-photo-406014.jpeg",
          organizer_name: ev.organizer_name,
          is_sponsored: false,
          is_free: true,
          tags: ev.tags,
        };

        const { error } = await supabase
          .from("events")
          .insert(row);

        if (!error) inserted++;
      }

      results.push({
        org: source.org_name,
        found: parsed.length,
        inserted,
      });
    }

    const totalInserted = results.reduce((s, r) => s + r.inserted, 0);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Shelter event sync complete. ${totalInserted} new events inserted.`,
        details: results,
        ran_at: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: String(err) }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
