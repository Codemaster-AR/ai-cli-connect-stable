// /functions/groq.js

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const body = await request.json();

    // 🔥 Dynamic model selection
    const modelId = body.model || "llama-3.3-70b-versatile";

    const payload = {
      model: modelId,
      messages: body.messages || [
        { role: "user", content: body.prompt || "" }
      ],
      tools: body.tools || undefined,
      tool_choice: body.tool_choice || "auto",
      temperature: body.temperature ?? 0.0,
      max_tokens: body.max_tokens ?? 1024
    };

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${env.GROQ_API_KEY}`
        },
        body: JSON.stringify(payload)
      }
    );

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({
      error: "Groq proxy error",
      details: err.message
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
