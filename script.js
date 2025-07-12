/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// Set initial message
chatWindow.textContent = "👋 Hello! How can I help you today?";

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Get the user's message
  const message = userInput.value;

  // Show user's message in the chat window
  chatWindow.innerHTML = `<b>You:</b> ${message}<br><i>Thinking...</i>`;

  // Call the OpenAI API using fetch
  try {
    // Prepare the request body for the OpenAI API
    const requestBody = {
      model: "gpt-4o", // Use the gpt-4o model
      messages: [
        { role: "system", content: "You are a helpful assistant for L'Oréal." },
        { role: "user", content: message },
      ],
      // Add the prompt tool with your custom prompt ID
      tools: [
        {
          type: "prompt",
          id: "pmpt_6871bf3541248195a7b0499d932338dd0ff3a23e7c63555f",
          version: "2",
        },
      ],
    };

    // Make the API request to your Cloudflare Worker endpoint
    // IMPORTANT: Replace the URL below with your actual Worker URL, e.g. "https://loreal-chatbot.yourname.workers.dev"
    const response = await fetch("https://loreal-chatbot.yourname.workers.dev", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody),
    });

    // Try to parse the response as JSON
    let data;
    try {
      data = await response.json();
    } catch (err) {
      chatWindow.innerHTML = `<b>You:</b> ${message}<br><b>Bot:</b> Sorry, there was a problem with the server response. (CORS or network error)`;
      console.error("Response parse error:", err);
      return;
    }

    // Get the assistant's reply
    const reply =
      data.choices && data.choices[0] && data.choices[0].message.content
        ? data.choices[0].message.content
        : (data.error ? `Error: ${data.error.message || data.error}` : "Sorry, I couldn't get a response.");

    // Show the assistant's reply in the chat window
    chatWindow.innerHTML = `<b>You:</b> ${message}<br><b>Bot:</b> ${reply}`;
  } catch (error) {
    // Show error message if something goes wrong
    chatWindow.innerHTML = `<b>You:</b> ${userInput.value}<br><b>Bot:</b> Sorry, there was an error connecting to OpenAI.`;
    console.error("OpenAI API error:", error);
  }
});
