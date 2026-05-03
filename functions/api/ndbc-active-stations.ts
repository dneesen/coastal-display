type PagesFunctionContext = {
  request: Request;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function onRequestOptions() {
  return new Response(null, { headers: corsHeaders });
}

export async function onRequestGet({ request }: PagesFunctionContext) {
  const response = await fetch("https://www.ndbc.noaa.gov/activestations.xml", { signal: request.signal });
  if (!response.ok) {
    return new Response(`NDBC active stations failed: ${response.status}`, { status: 502, headers: corsHeaders });
  }

  return new Response(await response.text(), {
    headers: {
      ...corsHeaders,
      "Content-Type": "text/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
