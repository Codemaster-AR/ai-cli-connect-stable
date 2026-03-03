export async function onRequestPost(context) {
  console.log("Groq function v7"); // Version print

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

    // Allowed models for safety
    const allowedModels = [
      "llama-3.3-70b-versatile",
      "llama-3.1-405b-reasoning",
      "meta-llama/llama-4-scout-17b-16e-instruct",
      "qwen/qwen3-coder-flash",
      "qwen/qwen3-coder-plus"
    ];

    // Dynamic model selection with validation
    const model = body.model || "llama-3.3-70b-versatile";
    if (!allowedModels.includes(model)) {
      return new Response(
        JSON.stringify({ error: `Invalid model. Allowed: ${allowedModels.join(", ")}` }),
        { status: 400 }
      );
    }

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

    // Return raw upstream response
    const text = await groqResponse.text();

    return new Response(text, {
      status: groqResponse.status,
      headers: { "Content-Type": "application/json" }
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
