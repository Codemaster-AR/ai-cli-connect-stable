export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === "GET") {
    return new Response(JSON.stringify({ status: "Gemini 2.5 Flash Proxy Active" }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  if (request.method === "POST") {
    try {
      const { prompt } = await request.json();
      const apiKey = env.GEMINI_API_KEY;

      if (!apiKey) {
        return new Response("Error: Missing GEMINI_API_KEY", { status: 500 });
      }

      // 1. Updated Endpoint for 2.5 Flash
      const apiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          // 2. The new simplified tool syntax for 2.x+ models
          tools: [{ google_search: {} }] 
        }),
      });

      const data = await response.json();
      return new Response(JSON.stringify(data), {
        headers: { "Content-Type": "application/json" },
      });

    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
  }

  return new Response("Method Not Allowed", { status: 405 });
}
