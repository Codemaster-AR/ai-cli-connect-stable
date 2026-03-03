// /functions/qwen.js
export async function onRequest(context) {
  const { request, env } = context;

  // --- Handle GET requests (quick test) ---
  if (request.method === "GET") {
    return new Response(JSON.stringify({
      message: "Qwen function is alive! Use POST to send prompts."
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  // --- Only allow POST for actual AI requests ---
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const body = await request.json();

    // --- Use model from request, fallback to default ---
    const modelId = body.model || "qwen3-coder-plus"; // default model

    const payload = {
      model: modelId,
      messages: body.messages || [{ role: "user", content: body.prompt || "" }],
      temperature: body.temperature ?? 0.5,
      max_tokens: body.max_tokens ?? 200
    };

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${env.QWEN_DEV_KEY}`,
        "Referer": "https://ai-cli-connect-stable.pages.dev",
        "X-Title": "AI CLI"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({
      error: "Qwen proxy error",
      details: err.message
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
