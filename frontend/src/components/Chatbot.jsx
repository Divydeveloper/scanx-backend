import React, { useState, useEffect, useRef } from "react";
import doctorGif from "./DoctorChatbot.gif"; // your GIF file
import "./Chatbot.css";

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const chatbotRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      if (chatbotRef.current && !chatbotRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
        },
        body: JSON.stringify({
          model: "openai/gpt-3.5-turbo",
          messages: [{ role: "user", content: input }],
        }),
      });

      const data = await response.json();
      const botReply = data.choices?.[0]?.message?.content || "Sorry, I didn't understand that.";

      setMessages((prev) => [...prev, { sender: "bot", text: botReply }]);
    } catch (error) {
      console.error("Error contacting OpenRouter:", error);
      setMessages((prev) => [...prev, { sender: "bot", text: "Error contacting AI." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="chatbot-container" ref={chatbotRef}>
      <button
        className="chat-toggle"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Toggle Chatbot"
        title="Chat with Doctor"
      >
        <img src={doctorGif} alt="Doctor chatbot icon" className="doctor-icon" />
      </button>

      {/* Show the cloud message only if chatbot is closed */}
      {!isOpen && (
        <div className="chat-bubble">
          HELP?
        </div>
      )}

      {isOpen && (
        <div className="chatbox">
          <div className="chat-header">ScanX Chatbot</div>
          <div className="chat-body">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`chat-message ${msg.sender === "user" ? "user" : "bot"}`}
              >
                {msg.text}
              </div>
            ))}

            {isTyping && (
              <div className="chat-message bot" style={{ fontStyle: "italic", opacity: 0.7 }}>
                AI is typing...
              </div>
            )}
          </div>

          <div className="chat-input">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Ask something..."
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
