import api from "./api.js";

document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("chatbot-toggle-btn");
  const chatWindow = document.getElementById("chatbot-window");
  const closeBtn = document.getElementById("close-chatbot");
  const sendBtn = document.getElementById("chatbot-send-btn");
  const userInput = document.getElementById("chatbot-user-input");
  const msgBox = document.getElementById("chatbot-msg-box");

  if (!toggleBtn || !chatWindow) return;

  const scrollToBottom = () => {
    setTimeout(() => {
      msgBox.scrollTop = msgBox.scrollHeight;
    }, 50);
  };

  toggleBtn.addEventListener("click", () => {
    const isClosed =
      chatWindow.style.display === "none" || !chatWindow.style.display;
    chatWindow.style.display = isClosed ? "flex" : "none";
    if (isClosed) scrollToBottom();
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      chatWindow.style.display = "none";
    });
  }

  const appendMessage = (text, type, isError = false) => {
    const div = document.createElement("div");
    div.className = `msg ${type}-msg`;
    div.textContent = text;
    if (isError) div.style.color = "red";
    msgBox.appendChild(div);
    scrollToBottom();
    return div;
  };

  const sendMessage = async () => {
    const text = userInput.value.trim();
    if (!text) return;

    appendMessage(text, "user");
    userInput.value = "";

    const loader = appendMessage("Thinking... 🤖", "bot");

    try {
      const response = await api.post("/ai/chat-bot", { message: text });
      loader.remove();

      if (response.data.success) {
        appendMessage(response.data.data, "bot");
      } else {
        appendMessage(
          response.data.data || "Connection error. Please try again later. 😟",
          "bot",
          true,
        );
      }
    } catch (error) {
      loader.remove();
      appendMessage("Network error. Try again later.", "bot", true);
      console.error("Axios Error:", error);
    }
  };

  if (sendBtn) sendBtn.addEventListener("click", sendMessage);
  userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
  });
});
