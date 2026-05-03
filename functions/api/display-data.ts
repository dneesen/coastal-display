import { buildDisplayData } from "../../src/lib/api/displayData";
import { profileFromSearchParams } from "../../src/lib/api/profileParams";

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
  const url = new URL(request.url);
  const profile = profileFromSearchParams(url.searchParams);
  const result = await buildDisplayData(profile, request.signal);

  return Response.json(result, {
    headers: {
      ...corsHeaders,
      "Cache-Control": `public, max-age=${Math.max(300, profile.display.refreshMinutes * 60)}`,
    },
  });
}
