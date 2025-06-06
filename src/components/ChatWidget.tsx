import React, { useState, useEffect, useRef } from "react";
import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css";
import CloseButton from "./CloseButton";
import { useAPIContext } from "../context/APIContext";
import { Rnd } from "react-rnd";

const ChatWidget = () => {
  const bottomRef = useRef<HTMLLIElement | null>(null);
  const {
    generatedDisclaimer,
    setGeneratedDisclaimer,
    activeDisclaimerId,
    setActiveDisclaimerId,
    messages,
    setMessages,
    createDisclaimer,
    continueConversation,
    downloadConversation,
  } = useAPIContext();

  const [formData, setFormData] = useState({ prompt: "" });
  const [isOpen, setIsOpen] = useState(true);
  const [position, setPosition] = useState({
    x: window.innerWidth / 2 - 160,
    y: window.innerHeight / 4,
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleCloseButton = () => setIsOpen((prev) => !prev);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const userMsg = { role: "user", content: formData.prompt };
    const updated = [...messages, userMsg];

    let botReply = "";

    try {
      if (activeDisclaimerId) {
        botReply = await continueConversation(updated);
      } else {
        botReply = await createDisclaimer(updated);
      }

      setMessages([...updated, { role: "assistant", content: botReply }]);
      console.log("review messages", messages);
      setFormData({ prompt: "" });
    } catch (error) {
      console.error("Submission error:", error);
    }
  };

  return (
    <div className="relative">
      <button
        className="fixed bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full z-50"
        onClick={() => setIsOpen(!isOpen)}
      ></button>

      {isOpen && (
        <div className="h-full w-full p-2 box-border">
          <div>
            <Rnd
              default={{
                x: 150,
                y: 205,
                width: 500,
                height: 400,
              }}
              minWidth={500}
              minHeight={190}
              bounds="window"
            >
              <div className="bg-white shadow-md rounded-lg flex flex-col h-full w-full">
                <div className="bg-red-500 drag-handle w-full   py-2 flex   items-center justify-begin text-white px-2 cursor-move">
                  <CloseButton onClick={handleCloseButton} />
                </div>

                <div className="flex-grow overflow-y-auto scroll-smooth my-2  box-border mt-4 mb-8  ">
                  {messages.filter((m) => m.role !== "system").length === 0 ? (
                    <ul className="flex flex-col gap-2 w-full px-4">
                      <li className="text-gray-500 text-center italic px-4 w-full max-w-[95%] min-h-[100vh] py-2 rounded-lg text-sm shadow-sm">
                        No conversation yet. Start by entering a topic.
                      </li>
                    </ul>
                  ) : (
                    <ul className="flex flex-col gap-2 w-full px-4  mb-4">
                      {messages.map((msg, i) => {
                        const isLast =
                          i === messages.length - 1 && msg.role === "assistant";
                        return (
                          <li
                            key={msg.content}
                            ref={isLast ? bottomRef : null}
                            className={` mt-2  w-full max-w-[95%] px-4 py-2 rounded-lg text-sm shadow-sm ${
                              msg.role === "user"
                                ? "bg-blue-100"
                                : "bg-gray-100"
                            }`}
                          >
                            <strong className="block text-gray-700 mb-1">
                              {msg.role === "user" ? "You" : "Bot"}:
                            </strong>
                            <p className="whitespace-pre-line">{msg.content}</p>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>

                <div className="shrink-0">
                  <form
                    onSubmit={handleSubmit}
                    className="px-6 pb-2 pt-6 mt-4 shrink-0 "
                  >
                    <div className="flex flex-col  ">
                      <textarea
                        rows={3}
                        name="prompt"
                        value={formData.prompt}
                        onChange={handleChange}
                        placeholder="Enter a disclaimer topic"
                        className="w-full resize-none border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 shadow-sm"
                      />
                      <div className="flex justify-center  sm:flex-row gap-3">
                        <button className=" bg-blue-600 hover:bg-blue-700 text-white mt-4 mb-4 font-semibold px-4 py-2 rounded-lg shadow-md transition-colors duration-200">
                          Generate
                        </button>

                        <button
                          onClick={downloadConversation}
                          className=" bg-green-600 hover:bg-green-700 text-white mt-4 mb-4 font-semibold px-4 py-2 rounded-lg shadow-md transition-colors duration-200"
                        >
                          Download
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </Rnd>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
