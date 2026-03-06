export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  // 1. Handle GET Requests (Useful for testing)
  if (request.method === "GET") {
    return new Response(
      JSON.stringify({ message: "Gemini endpoint is live. Send a POST request to chat." }),
      { headers: { "Content-Type": "application/json" } }
    );
  }

  // 2. Handle POST Requests (The main interaction)
  if (request.method === "POST") {
    try {
      const body = await request.json();
      const userPrompt = body.prompt || "Hello!";
      
      // Access the Secret defined in Cloudflare Dashboard
      const API_KEY = env.GEMINI_API_KEY;

      if (!API_KEY) {
        return new Response("Configuration Error: GEMINI_API_KEY is not set.", { status: 500 });
      }

      // Call the Gemini API
      // Note: Using v1beta for access to latest features like grounding
      const geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: userPrompt }] }],
            // If you want to enable search grounding later, it goes here in 'tools'
          }),
        }
      );

      const data = await geminiResponse.json();

      return new Response(JSON.stringify(data), {
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*" // Adjust if you want to restrict access
        },
      });

    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  }

  // 3. Handle Other Methods (PUT, DELETE, etc.)
  return new Response("Method Not Allowed", { status: 405 });
}
