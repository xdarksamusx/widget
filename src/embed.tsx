import React from "react";
import ReactDOM from "react-dom/client";
import ChatWidget from "./components/ChatWidget";
// Create container
const containerId = "my-chat-widget-container";
let container = document.getElementById(containerId);

if (!container) {
  container = document.createElement("div");
  container.id = containerId;
  document.body.appendChild(container);
}

ReactDOM.createRoot(container).render(<ChatWidget />);
