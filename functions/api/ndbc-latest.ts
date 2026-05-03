type PagesFunctionContext = {
  request: Request;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function stationIdFromRequest(request: Request) {
  const station = new URL(request.url).searchParams.get("station")?.trim().toUpperCase();
  return station && /^[A-Z0-9-]+$/.test(station) ? station : undefined;
}

export async function onRequestOptions() {
  return new Response(null, { headers: corsHeaders });
}

export async function onRequestGet({ request }: PagesFunctionContext) {
  const station = stationIdFromRequest(request);
  if (!station) {
    return new Response("Missing or invalid NDBC station", { status: 400, headers: corsHeaders });
  }

  const response = await fetch(`https://www.ndbc.noaa.gov/data/realtime2/${station}.txt`, { signal: request.signal });
  if (!response.ok) {
    return new Response(`NDBC latest failed: ${response.status}`, { status: 502, headers: corsHeaders });
  }

  return new Response(await response.text(), {
    headers: {
      ...corsHeaders,
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=600",
    },
  });
}
