// Copy this code into your Cloudflare Worker script

export default {
  async fetch(request, env) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json'
    };

    try {
      // Handle CORS preflight requests
      if (request.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
      }

      const apiKey = env.OPENAI_API_KEY; // Make sure to name your secret OPENAI_API_KEY in the Cloudflare Workers dashboard
      const apiUrl = 'https://api.openai.com/v1/chat/completions';
      const userInput = await request.json();

      // Build the request body for OpenAI
      const requestBody = {
        model: 'gpt-4o', // Correct model name
        messages: userInput.messages,
        max_tokens: 300,
      };
      // Forward 'tools' if present in the request
      if (userInput.tools) {
        requestBody.tools = userInput.tools;
      }

      // Make the API request to OpenAI
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      // Try to parse the response as JSON
      let data;
      try {
        data = await response.json();
      } catch (err) {
        return new Response(JSON.stringify({ error: 'Invalid JSON from OpenAI.' }), { status: 500, headers: corsHeaders });
      }

      // If OpenAI returns an error, forward it
      if (!response.ok) {
        return new Response(JSON.stringify({ error: data.error || 'OpenAI API error.' }), { status: response.status, headers: corsHeaders });
      }

      return new Response(JSON.stringify(data), { headers: corsHeaders });
    } catch (err) {
      // Catch-all error handler for unexpected errors
      return new Response(JSON.stringify({ error: err.message || 'Unexpected server error.' }), { status: 500, headers: corsHeaders });
    }
  }
};
