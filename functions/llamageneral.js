export async function onRequest(context) {
  console.log("Groq function v11 (dynamic model GET + POST, LLAMA_GENERAL_API_KEY)");

  try {
    const { request, env } = context;

    let model, messages;

    if (request.method === "POST") {
      // Parse POST body
      let body;
      try {
        body = await request.json();
      } catch {
        return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400 });
      }

      model = body.model || "llama-3.3-70b-versatile"; // fully dynamic
      messages = body.messages
        ? body.messages
        : [{ role: "user", content: body.prompt || "Hello" }];

    } else if (request.method === "GET") {
      // Parse GET query parameters
      const url = new URL(request.url);
      model = url.searchParams.get("model") || "llama-3.3-70b-versatile"; // fully dynamic
      const prompt = url.searchParams.get("prompt") || "Hello";
      messages = [{ role: "user", content: prompt }];
    } else {
      return new Response(JSON.stringify({ error: "Unsupported method" }), { status: 405 });
    }

    // Ensure API key exists in env
    if (!env.LLAMA_GENERAL_API_KEY) {
      return new Response(
        JSON.stringify({ error: "LLAMA_GENERAL_API_KEY not configured" }),
        { status: 500 }
      );
    }

    // Call Groq OpenAI-compatible endpoint
    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${env.LLAMA_GENERAL_API_KEY}`
      },
      body: JSON.stringify({ model, messages })
    });

    const text = await groqResponse.text();

    return new Response(text, {
      status: groqResponse.status,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      { status: 500 }
    );
  }
}
