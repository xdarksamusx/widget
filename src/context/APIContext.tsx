import { createContext, useContext, useEffect, useState } from "react";
import { type } from "@testing-library/user-event/dist/type";
import React from "react";

type ChatHistory = {
  role: string;
  content: string;
};

type Disclaimer = {
  id: string;
  topic: string;
  tone: string;
  statement: string;
  chat_history: ChatHistory[];
};

type APIContextType = {
  downloadConversation: () => Promise<void>;

  messages: { role: string; content: string }[];
  setMessages: React.Dispatch<
    React.SetStateAction<{ role: string; content: string }[]>
  >;

  generatedDisclaimer: string;
  activeDisclaimerId: string | null;
  setActiveDisclaimerId: React.Dispatch<React.SetStateAction<string | null>>;
  setGeneratedDisclaimer: React.Dispatch<React.SetStateAction<string>>;
  createDisclaimer: (
    messages: { role: string; content: string }[]
  ) => Promise<string>;
  continueConversation: (
    messages: { role: string; content: string }[]
  ) => Promise<string>;
};

const APIContext = createContext<APIContextType | undefined>(undefined);

export const APIProvider = ({ children }: { children: React.ReactNode }) => {
  const [generatedDisclaimer, setGeneratedDisclaimer] = useState("");
  const [activeDisclaimerId, setActiveDisclaimerId] = useState<string | null>(
    null
  );

  const [disclaimers, setDisclaimers] = useState<Disclaimer[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<{ role: string; content: string }[]>(
    []
  );

  const createDisclaimer = async (
    messages: { role: string; content: string }[]
  ): Promise<string> => {
    const formattedPrompt =
      messages.reverse().find((m) => m.role === "user")?.content || "";
    console.log("formattedPrompt", typeof formattedPrompt, formattedPrompt);

    const res = await fetch(`http://localhost:3000/disclaimers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },

      body: JSON.stringify({
        disclaimer: {
          user_id: activeDisclaimerId,
          message: [{ role: "user", content: formattedPrompt }],
          chat_history: [],
        },
      }),
    });
    console.log("checking response", res);
    const data = await res.json();

    setGeneratedDisclaimer(data.statement);
    setActiveDisclaimerId(data.id);
    console.log("state,emt", data);
    return data.statement;
  };

  const downloadConversation = async () => {
    try {
      const res = await fetch(
        `http://localhost:3000/disclaimers/${activeDisclaimerId}/download_pdf`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/pdf",
          },
        }
      );

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `disclaimer_${activeDisclaimerId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.log(error);
    }
  };
  const continueConversation = async (
    messages: { role: string; content: string }[]
  ): Promise<string> => {
    const formattedPrompt =
      messages
        .slice()
        .reverse()
        .find((m) => m.role === "user")?.content || "";

    try {
      const res = await fetch(
        `http://localhost:3000/disclaimers/${activeDisclaimerId}/continue`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            disclaimer: {
              message: [{ role: "user", content: formattedPrompt }],
              chat_history: messages,
            },
          }),
        }
      );
      const data = await res.json();
      console.log("data conversion", data);
      return data.statement;
    } catch (error) {
      console.error("Error continuing conversation", error);
      return "An error occurred. Please try again.";
    }
  };

  return (
    <APIContext.Provider
      value={{
        generatedDisclaimer,
        setGeneratedDisclaimer,
        activeDisclaimerId,
        setActiveDisclaimerId,
        createDisclaimer,
        messages,
        setMessages,
        continueConversation,
        downloadConversation,
      }}
    >
      {children}
    </APIContext.Provider>
  );
};

export const useAPIContext = () => {
  const context = useContext(APIContext);
  if (!context)
    throw new Error("APIContext must be used within the API Provider");
  return context;
};
