import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const NOTION_TOKEN = Deno.env.get("NOTION_TOKEN")!;
const NOTION_DATABASE_ID = "36f861abdf9481e68a76dbb5a125797d";
const NOTION_API = "https://api.notion.com/v1";
const NOTION_VERSION = "2022-06-28";

function notionHeaders() {
  return {
    "Authorization": `Bearer ${NOTION_TOKEN}`,
    "Notion-Version": NOTION_VERSION,
    "Content-Type": "application/json",
  };
}

async function pageExistsInDatabase(eventId: string): Promise<string | null> {
  const res = await fetch(`${NOTION_API}/databases/${NOTION_DATABASE_ID}/query`, {
    method: "POST",
    headers: notionHeaders(),
    body: JSON.stringify({
      filter: {
        property: "Event ID",
        rich_text: { equals: eventId },
      },
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Notion query failed: ${JSON.stringify(data)}`);
  if (data.results && data.results.length > 0) return data.results[0].id;
  return null;
}

async function upsertEvent(event: Record<string, unknown>): Promise<{ action: string; notionId?: string; error?: string }> {
  const dateStr = event.event_date
    ? new Date(event.event_date as string).toISOString().split("T")[0]
    : null;

  const tags = Array.isArray(event.tags)
    ? (event.tags as string[]).map((t) => ({ name: t }))
    : [];

  const properties: Record<string, unknown> = {
    "Event Name": { title: [{ text: { content: event.title || "" } }] },
    "City": { select: event.city_name ? { name: event.city_name as string } : null },
    "Organizer": { rich_text: [{ text: { content: event.organizer_name || "" } }] },
    "Location": { rich_text: [{ text: { content: event.location_name || "" } }] },
    "Address": { rich_text: [{ text: { content: event.address || "" } }] },
    "Phone": { phone_number: (event.phone_number as string) || null },
    "Website": { url: (event.website as string) || null },
    "Tags": { multi_select: tags },
    "Free": { checkbox: event.is_free === true },
    "Price": { rich_text: [{ text: { content: event.price_text || "" } }] },
    "Dogs Welcome": { checkbox: event.dogs_welcome === true },
    "Organizer URL": { url: (event.organizer_url as string) || null },
    "Event ID": { rich_text: [{ text: { content: event.id as string } }] },
  };

  if (dateStr) {
    properties["Date"] = { date: { start: dateStr } };
  }

  const existingPageId = await pageExistsInDatabase(event.id as string);

  if (existingPageId) {
    const res = await fetch(`${NOTION_API}/pages/${existingPageId}`, {
      method: "PATCH",
      headers: notionHeaders(),
      body: JSON.stringify({ properties }),
    });
    const data = await res.json();
    if (!res.ok) return { action: "update", error: JSON.stringify(data) };
    return { action: "updated", notionId: data.id };
  } else {
    const res = await fetch(`${NOTION_API}/pages`, {
      method: "POST",
      headers: notionHeaders(),
      body: JSON.stringify({
        parent: { database_id: NOTION_DATABASE_ID },
        properties,
      }),
    });
    const data = await res.json();
    if (!res.ok) return { action: "create", error: JSON.stringify(data) };
    return { action: "created", notionId: data.id };
  }
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

    const { data: events, error } = await supabase
      .from("events")
      .select(`
        id, title, description, location_name, address,
        phone_number, website,
        event_date, end_date, organizer_name, organizer_url,
        is_free, price_text, dogs_welcome, tags,
        cities ( name )
      `);

    if (error) throw error;

    const results = [];
    for (const event of events || []) {
      const flat = { ...event, city_name: (event.cities as { name: string } | null)?.name };
      const result = await upsertEvent(flat);
      results.push({ id: event.id, title: event.title, ...result });
    }

    const errors = results.filter((r) => r.error);

    return new Response(
      JSON.stringify({
        success: errors.length === 0,
        synced: results.filter((r) => !r.error).length,
        failed: errors.length,
        database_id: NOTION_DATABASE_ID,
        events: results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
