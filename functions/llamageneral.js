export async function onRequest(context) {
  console.log("Groq function v12 (CORS FIXED, dynamic model GET + POST)");

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  try {
    const { request, env } = context;

    // 1. Handle Preflight OPTIONS request (CRITICAL for browsers)
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    let model, messages;

    if (request.method === "POST") {
      let body;
      try {
        body = await request.json();
      } catch {
        return new Response(JSON.stringify({ error: "Invalid JSON body" }), { 
          status: 400, 
          headers: corsHeaders 
        });
      }

      model = body.model || "llama-3.3-70b-versatile";
      messages = body.messages || [{ role: "user", content: body.prompt || "Hello" }];

    } else if (request.method === "GET") {
      const url = new URL(request.url);
      model = url.searchParams.get("model") || "llama-3.3-70b-versatile";
      const prompt = url.searchParams.get("prompt") || "Hello";
      messages = [{ role: "user", content: prompt }];
    } else {
      return new Response(JSON.stringify({ error: "Unsupported method" }), { 
        status: 405, 
        headers: corsHeaders 
      });
    }

    if (!env.LLAMA_GENERAL_API_KEY) {
      return new Response(
        JSON.stringify({ error: "LLAMA_GENERAL_API_KEY not configured" }),
        { status: 500, headers: corsHeaders }
      );
    }

    // Call Groq
    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${env.LLAMA_GENERAL_API_KEY}`
      },
      body: JSON.stringify({ model, messages })
    });

    const text = await groqResponse.text();

    // 2. Return response with CORS headers
    return new Response(text, {
      status: groqResponse.status,
      headers: { 
        ...corsHeaders,
        "Content-Type": "application/json" 
      }
    });

  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      { status: 500, headers: corsHeaders }
    );
  }
}
