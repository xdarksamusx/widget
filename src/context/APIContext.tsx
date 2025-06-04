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
    const formattedPrompt = [...messages];

    const res = await fetch(`http://localhost:3000/disclaimers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },

      body: JSON.stringify({
        disclaimer: {
          message: formattedPrompt,
        },
      }),
    });
    const data = await res.json();

    setGeneratedDisclaimer(data.statement);
    setActiveDisclaimerId(data.id);
    return data.statement;
  };

  const downloadConversation = async () => {
    try {
      const res = fetch(
        `http://localhost:3000/disclaimers/${activeDisclaimerId}/download_pdf`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/pdf",
          },
        }
      );
    } catch (error) {}
  };

  const continueConversation = async (
    activeDisclaimerId: string,
    message: string
  ) => {
    const formattedPrompt = [{ role: "user", content: message }];

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
              message,
            },
          }),
        }
      );
      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Error continuing conversation", error);

      return {
        id: "",
        topic: "",
        tone: "",
        statement: "",
        chat_history: [],
      };
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
