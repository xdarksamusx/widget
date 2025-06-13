import { createContext, useContext, useState } from "react";
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

  activeDisclaimerId: string | null;
  setActiveDisclaimerId: React.Dispatch<React.SetStateAction<string | null>>;
  createDisclaimer: (
    messages: { role: string; content: string }[]
  ) => Promise<string>;
  continueConversation: (
    messages: { role: string; content: string }[]
  ) => Promise<string>;
};

const APIContext = createContext<APIContextType | undefined>(undefined);

export const APIProvider = ({ children }: { children: React.ReactNode }) => {
  const baseUrl = process.env.REACT_APP_API_BASE_URL;
  console.log("BASE URL:", baseUrl);

  const [activeDisclaimerId, setActiveDisclaimerId] = useState<string | null>(
    null
  );

  const [messages, setMessages] = useState<{ role: string; content: string }[]>(
    []
  );

  const createDisclaimer = async (
    messages: { role: string; content: string }[]
  ): Promise<string> => {
    const formattedPrompt =
      [...messages].reverse().find((m) => m.role === "user")?.content || "";
    console.log("formattedPrompt", typeof formattedPrompt, formattedPrompt);

    const res = await fetch(`${baseUrl}/disclaimers`, {
      method: "POST",
      credentials: "include",

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

    setActiveDisclaimerId(data.id);
    console.log("state,emt", data);
    return data.statement;
  };

  const downloadConversation = async () => {
    try {
      const res = await fetch(
        `${baseUrl}/disclaimers/${activeDisclaimerId}/download_pdf`,
        {
          method: "GET",
          credentials: "include",

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
        `${baseUrl}/disclaimers/${activeDisclaimerId}/continue`,
        {
          method: "PATCH",
          credentials: "include",

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
