// /functions/api.js

export async function onRequest(context) {
  const request = context.request;
  const env = context.env;

  const MISTRAL_API = "https://api.mistral.ai/v1/chat/completions";

  // Handle CORS preflight
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  // Simple GET test
  if (request.method === "GET") {
    return new Response("Proxy is Online", { status: 200 });
  }

  try {
    const body = await request.json();

    // Default model
    body.model = body.model || "open-mistral-7b";

    // Remove empty tools array if present
    if (body.tools && body.tools.length === 0) delete body.tools;

    const mistralResp = await fetch(MISTRAL_API, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.MY_SECRET_API_KEY_MINSTRAL}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    // Read full response before sending to avoid EOF errors in Python client
    const responseText = await mistralResp.text();

    return new Response(responseText, {
      status: mistralResp.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}