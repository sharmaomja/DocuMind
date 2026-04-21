"use client";

import "regenerator-runtime/runtime";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import axios from "axios";
import { ChatComposer } from "./components/chat-composer";
import { ChatConversation } from "./components/chat-conversation";
import { ChatHeader } from "./components/chat-header";
import { ChatSidebar } from "./components/chat-sidebar";

async function convertFiletoText(files: FileList) {
  const formData = new FormData();

  for (const file of files) {
    formData.append("file", file, file.name);
  }

  const resultData = await axios.post("/api/fileConverter", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return resultData.data.data;
}

const suggestedPrompts = [
  "Give me a TL;DR of this document",
  "What are the key risks mentioned here?",
  "Highlight any deadlines or timelines",
  "What are the main obligations or responsibilities?",
  "Extract all important numbers, pricing, or costs",
  "Summarize this for a non-technical person",
  "What are the key takeaways in bullet points?",
  "Are there any contradictions or inconsistencies?",
  "What decisions should I make based on this?",
  "Explain this like I'm a beginner",
  "What are the most important sections to focus on?",
  "Turn this into actionable tasks",
  "What questions should I ask after reading this?",
  "Identify any legal or compliance risks",
  "Give me a one-minute summary I can present",
];

export default function Chat() {
  const [input, setInput] = useState("");
  const [files, setFiles] = useState<FileList | undefined>(undefined);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
  });

  const isTextPart = (
    part: (typeof messages)[number]["parts"][number],
  ): part is Extract<
    (typeof messages)[number]["parts"][number],
    { type: "text" }
  > => part.type === "text";

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleStopListening = () => {
    SpeechRecognition.stopListening();

    if (transcript.trim()) {
      sendMessage({
        role: "user",
        parts: [{ type: "text", text: transcript }],
      });
      resetTranscript();
      setInput("");
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isProcessing || status === "streaming") return;

    const questionText = (transcript || input).trim();
    if (!questionText && !files?.length) return;

    setIsProcessing(true);

    try {
      let extractedText = "";

      if (files && files.length > 0) {
        extractedText = await convertFiletoText(files);
      }

      sendMessage({
        role: "user",
        parts: [
          {
            type: "text",
            text: "Extracted text from the pdf: " + extractedText,
          },
          { type: "text", text: questionText },
        ],
      });

      setFiles(undefined);
      setInput("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      resetTranscript();
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
  };

  const clearFiles = () => {
    setFiles(undefined);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const getDisplayableParts = (message: (typeof messages)[0]) => {
    if (message.role === "user") {
      return message.parts.filter(
        (part) =>
          isTextPart(part) &&
          !part.text.startsWith("Extracted text from the pdf:"),
      );
    }

    return message.parts.filter(isTextPart);
  };

  const isLoading = isProcessing || status === "streaming";
  const hasFiles = Boolean(files && files.length > 0);
  const fileCount = files?.length ?? 0;
  const draftInput = transcript || input;
  const canSubmit = !isLoading && (Boolean(draftInput.trim()) || hasFiles);
  const conversationMessages = messages
    .map((message) => ({
      id: message.id,
      role: message.role,
      parts: getDisplayableParts(message)
        .filter(
          (part): part is { type: "text"; text: string } =>
            part.type === "text",
        )
        .map((part) => part.text),
    }))
    .filter((message) => message.parts.length > 0);

  const handleInputChange = (value: string) => {
    if (transcript) {
      resetTranscript();
    }

    setInput(value);
  };

  const handleVoiceToggle = () => {
    if (listening) {
      handleStopListening();
      return;
    }

    SpeechRecognition.startListening({ continuous: true });
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--background)] text-[var(--foreground)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,0,0,0.09),transparent_30%),radial-gradient(circle_at_top_right,rgba(180,143,92,0.18),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.72),rgba(255,255,255,0.98))]" />
      <div className="grid-overlay pointer-events-none absolute inset-0 opacity-60" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1600px] flex-col px-4 pb-4 pt-4 sm:px-6 lg:px-8">
        <ChatHeader />

        <div className="flex flex-1 flex-col gap-6 py-6 lg:grid lg:grid-cols-[minmax(280px,360px)_minmax(0,1fr)] lg:gap-8">
          <ChatSidebar
            prompts={suggestedPrompts}
            onPromptClick={handlePromptClick}
          />

          <div className="flex min-h-[60svh] flex-col">
            <ChatConversation
              isLoading={isLoading}
              messages={conversationMessages}
              messagesEndRef={messagesEndRef}
            />
            <ChatComposer
              browserSupportsSpeechRecognition={
                browserSupportsSpeechRecognition
              }
              canSubmit={canSubmit}
              draftInput={draftInput}
              fileCount={fileCount}
              hasFiles={hasFiles}
              isLoading={isLoading}
              listening={listening}
              mounted={mounted}
              onClearFiles={clearFiles}
              onInputChange={handleInputChange}
              onOpenFilePicker={openFilePicker}
              onSubmit={handleSubmit}
              onVoiceToggle={handleVoiceToggle}
            />
          </div>
        </div>

        <input
          type="file"
          onChange={(e) => e.target.files && setFiles(e.target.files)}
          multiple
          accept=".pdf"
          ref={fileInputRef}
          className="hidden"
        />
      </div>
    </main>
  );
}
