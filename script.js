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
        {
          role: "system",
          content:
            "Your name is Marie, You are a helpful assistant for L'Oréal. Only answer questions related to L'Oréal, its products, history, or beauty advice. If a question is not related to L'Oréal, politely reply: 'Sorry, I can only answer questions about L'Oréal and its products.'",
        },
        { role: "user", content: message },
      ],
    };

    // Make the API request to your Cloudflare Worker endpoint
    // IMPORTANT: Replace the URL below with your actual Worker URL, e.g. "https://loreal-chatbot.yourname.workers.dev"
    const response = await fetch(
      "https://odd-star-5a20.evan24207.workers.dev/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

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
        : data.error
        ? `Error: ${data.error.message || data.error}`
        : "Sorry, I couldn't get a response.";

    // Show the assistant's reply in the chat window
    chatWindow.innerHTML = `<b>You:</b> ${message}<br><b>Bot:</b> ${reply}`;
  } catch (error) {
    // Show error message if something goes wrong
    chatWindow.innerHTML = `<b>You:</b> ${userInput.value}<br><b>Bot:</b> Sorry, there was an error connecting to OpenAI.`;
    console.error("OpenAI API error:", error);
  }
});
