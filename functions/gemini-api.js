export async function onRequest(context) {
  const { request, env } = context;

  // 1. Handle GET (Status Check)
  if (request.method === "GET") {
    return new Response(JSON.stringify({ status: "Gemini 2.5 Flash Proxy Active" }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  // 2. Handle POST (The API Call)
  if (request.method === "POST") {
    try {
      const { prompt } = await request.json();
      const apiKey = env.GEMINI_API_KEY;

      if (!apiKey) {
        return new Response("Error: Missing GEMINI_API_KEY secret", { status: 500 });
      }

      // Gemini 2.5 Flash Endpoint
      const apiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          // This enables the Google Search Grounding you're looking for
          tools: [
            {
              google_search_retrieval: {
                dynamic_retrieval_config: {
                  mode: "MODE_DYNAMIC",
                  dynamic_threshold: 0.3, // Adjusts when to trigger search
                },
              },
            },
          ],
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
