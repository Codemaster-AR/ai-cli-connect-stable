export async function onRequestPost(context) {
  try {
    const body = await context.request.json();

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${context.env.QWEN_DEV_KEY}`,
        "HTTP-Referer": "https://ai-cli-connect-stable.pages.dev",
        "X-Title": "AI CLI"
      },
      body: JSON.stringify({
        ...body,
        model: "qwen/qwen3-coder-480b-a35b:free"
      })
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
