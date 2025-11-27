import React, { useState, useRef, useEffect } from "react";
import { FaPaperPlane, FaTimes } from "react-icons/fa";
import "./ChatBotWidget.css";
// SVG avatar vàng-đen
const BotAvatar = () => (
  <div className="chatbot-bot-avatar">
    <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="16" fill="#FFD600" />
      <path d="M8 26c0-4 3.5-7 8-7s8 3 8 7" stroke="#222" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="16" cy="14" r="6" fill="#222" />
      <rect x="5" y="10" width="4" height="10" rx="2" fill="#FFD600" stroke="#222" strokeWidth="2"/>
      <rect x="23" y="10" width="4" height="10" rx="2" fill="#FFD600" stroke="#222" strokeWidth="2"/>
      <rect x="10" y="4" width="12" height="4" rx="2" fill="#FFD600" stroke="#222" strokeWidth="2"/>
    </svg>
  </div>
);

const RASA_URL = "http://localhost:5005/webhooks/rest/webhook";

const ChatBotWidget = ({ onClose, isOpen }) => {
  const [messages, setMessages] = useState([
    { from: "bot", text: "Xin chào! Tôi có thể giúp gì cho bạn?" }
  ]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { from: "user", text: input };
    setMessages((msgs) => [...msgs, userMsg]);
    setInput("");

    try {
      const res = await fetch(RASA_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sender: "user1", message: input })
      });
      const data = await res.json();
      if (data.length > 0) {
        data.forEach((msg) => {
          if (msg.text) {
            setMessages((msgs) => [...msgs, { from: "bot", text: msg.text }]);
          }
        });
      } else {
        setMessages((msgs) => [
          ...msgs,
          { from: "bot", text: "Xin lỗi, tôi chưa hiểu ý bạn." }
        ]);
      }
    } catch (err) {
      setMessages((msgs) => [
        ...msgs,
        { from: "bot", text: "Lỗi kết nối tới chatbot." }
      ]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div className={`chatbot-widget${isOpen ? ' open' : ''}`} tabIndex={-1}>
      {isOpen && <>
        <div className="chatbot-header">
          <BotAvatar /> ChatBot
          <button className="chatbot-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className="chatbot-messages">
          {messages.map((msg, idx) => (
            msg.from === "bot" ? (
              <div key={idx} style={{ display: 'flex', alignItems: 'flex-start' }}>
                <BotAvatar />
                <div className="chatbot-message bot">{msg.text}</div>
              </div>
            ) : (
              <div
                key={idx}
                className="chatbot-message user"
              >
                {msg.text}
              </div>
            )
          ))}
          <div ref={chatEndRef} />
        </div>
        <div className="chatbot-input">
          <input
            type="text"
            placeholder="Nhập tin nhắn..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button onClick={sendMessage}>
            <FaPaperPlane />
          </button>
        </div>
      </>}
    </div>
  );
};

export default ChatBotWidget; 