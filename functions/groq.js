export async function onRequestPost(context) {
  try {
    const { request, env } = context;

    // Parse body safely
    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON body" }),
        { status: 400 }
      );
    }

    // Dynamic model selection
    const model = body.model || "llama-3.3-70b-versatile";

    // Support both `prompt` and `messages`
    const messages = body.messages
      ? body.messages
      : [
          {
            role: "user",
            content: body.prompt || "Hello"
          }
        ];

    // Ensure API key exists
    if (!env.GROQ_API_KEY) {
      return new Response(
        JSON.stringify({ error: "GROQ_API_KEY not configured" }),
        { status: 500 }
      );
    }

    // Call Groq OpenAI-compatible endpoint
    const groqResponse = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model,
          messages
        })
      }
    );

    // Return raw upstream response (prevents JS parsing crashes)
    const text = await groqResponse.text();

    return new Response(text, {
      status: groqResponse.status,
      headers: {
        "Content-Type": "application/json"
      }
    });

  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error.message
      }),
      { status: 500 }
    );
  }
}
