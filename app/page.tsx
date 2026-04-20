"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bot,
  FileText,
  Loader2,
  Mic,
  Paperclip,
  Send,
  Sparkles,
  User,
  Waves,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import SpeechRecognition, {useSpeechRecognition} from "react-speech-recognition";
import remarkGfm from "remark-gfm";
import axios from "axios";

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

const markdownComponents: Components = {
  h1: ({ children }) => (
    <h1 className="mt-6 mb-3 text-2xl font-semibold tracking-tight text-neutral-950 first:mt-0">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="mt-5 mb-2 text-xl font-semibold tracking-tight text-neutral-950 first:mt-0">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-4 mb-2 text-base font-semibold text-neutral-900 first:mt-0">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="mb-3 text-[15px] leading-7 text-neutral-700 last:mb-0">
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul className="mb-4 list-disc space-y-2 pl-5 text-[15px] leading-7 text-neutral-700">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-4 list-decimal space-y-2 pl-5 text-[15px] leading-7 text-neutral-700">
      {children}
    </ol>
  ),
  li: ({ children }) => <li>{children}</li>,
  table: ({ children }) => (
    <div className="my-5 overflow-x-auto border border-black/10 bg-white">
      <table className="min-w-full text-left text-sm">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border-b border-black/10 px-4 py-3 font-medium text-neutral-900">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border-b border-black/5 px-4 py-3 align-top text-neutral-700">
      {children}
    </td>
  ),
  code: ({ children, className }) => {
    const inline = !className;

    return inline ? (
      <code className="rounded bg-neutral-100 px-1.5 py-0.5 text-[13px] text-neutral-900">
        {children}
      </code>
    ) : (
      <pre className="my-4 overflow-x-auto bg-neutral-950 px-4 py-3 text-[13px] text-neutral-100">
        <code>{children}</code>
      </pre>
    );
  },
  blockquote: ({ children }) => (
    <blockquote className="my-4 border-l border-neutral-300 pl-4 text-neutral-600 italic">
      {children}
    </blockquote>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      className="underline decoration-neutral-400 underline-offset-4 transition hover:decoration-neutral-900"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
  hr: () => <hr className="my-5 border-black/10" />,
};

const suggestedPrompts = [
  "Summarize the document",
  "List the most important key points in here",
  "Explain this in simple language",
  "Find the core of this document",
];

const reveal = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function Chat() {
  const [input, setInput] = useState("");
  const [files, setFiles] = useState<FileList | undefined>(undefined);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  useEffect(() => {
  setMounted(true);
}, []);

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
  });

  const isTextPart = (
    part: (typeof messages)[number]["parts"][number],
  ): part is Extract<(typeof messages)[number]["parts"][number], { type: "text" }> =>
    part.type === "text";

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

  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--background)] text-[var(--foreground)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,0,0,0.09),transparent_30%),radial-gradient(circle_at_top_right,rgba(180,143,92,0.18),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.72),rgba(255,255,255,0.98))]" />
      <div className="grid-overlay pointer-events-none absolute inset-0 opacity-60" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1600px] flex-col px-4 pb-4 pt-4 sm:px-6 lg:px-8">
        <motion.header
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="border-b border-black/10 pb-4"
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="font-serif-display text-4xl tracking-[-0.04em] text-neutral-950 sm:text-5xl lg:text-6xl">
                docuMind
              </p>
              <div className="mt-5 max-w-2xl">
                <p className="max-w-[12ch] text-3xl font-medium tracking-[-0.04em] text-neutral-950 sm:text-4xl lg:text-[4.4rem] lg:leading-[0.92]">
                  Upload a document. Ask better questions.
                </p>
              </div>
            </div>
          </div>
        </motion.header>

        <div className="flex flex-1 flex-col gap-6 py-6 lg:grid lg:grid-cols-[minmax(280px,360px)_minmax(0,1fr)] lg:gap-8">
          <motion.aside
            variants={reveal}
            initial="hidden"
            animate="visible"
            className="flex flex-col justify-between border-b border-black/10 pb-6 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-8"
          >
            <div className="space-y-8">
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-neutral-500">
                  <Sparkles className="h-3.5 w-3.5" />
                  Workspace
                </div>
                <div className="space-y-3">
                  <p className="text-2xl font-medium tracking-[-0.04em] text-neutral-950 sm:text-3xl">
                    Read once. Retrieve instantly.
                  </p>
                </div>
              </section>

              <section className="space-y-4 border-t border-black/10 pt-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.22em] text-neutral-500">
                      Source files
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={openFilePicker}
                    className="inline-flex cursor-pointer items-center gap-2 border border-black px-3 py-2 text-xs font-medium text-black transition hover:bg-black hover:text-white"
                  >
                    <Paperclip className="h-3.5 w-3.5" />
                    Add PDF
                  </button>
                </div>

                {hasFiles ? (
                  <div className="space-y-3 border-t border-black/10 pt-4">
                    <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-neutral-500">
                      <span>{fileCount} selected</span>
                      <button
                        type="button"
                        onClick={clearFiles}
                        className="text-neutral-500 transition hover:text-neutral-950"
                      >
                        Clear
                      </button>
                    </div>
                    <div className="space-y-2">
                      {Array.from(files ?? []).map((file) => (
                        <div
                          key={`${file.name}-${file.lastModified}`}
                          className="flex items-center justify-between gap-3 border-b border-black/10 py-2"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <FileText className="h-4 w-4 flex-shrink-0 text-neutral-700" />
                            <span className="truncate text-sm text-neutral-900">
                              {file.name}
                            </span>
                          </div>
                          <span className="text-xs text-neutral-500">
                            PDF
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="border-t border-black/10 pt-4 text-sm leading-6 text-neutral-600">
                    No files yet.
                  </div>
                )}
              </section>

              <section className="space-y-4 border-t border-black/10 pt-5">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.22em] text-neutral-500">
                    Ask next
                  </p>
                </div>
                <div className="space-y-2">
                  {suggestedPrompts.map((prompt, index) => (
                    <motion.button
                      key={prompt}
                      type="button"
                      onClick={() => handlePromptClick(prompt)}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.12 + index * 0.06, duration: 0.35 }}
                      className="group flex w-full items-center justify-between border-b border-black/10 py-3 text-left text-sm text-neutral-700 transition hover:text-neutral-950"
                    >
                      <span>{prompt}</span>
                      <span className="text-neutral-300 transition group-hover:text-neutral-950">
                        +
                      </span>
                    </motion.button>
                  ))}
                </div>
              </section>
            </div>

          </motion.aside>

          <motion.section
            variants={reveal}
              initial={false}   
            animate="visible"
            transition={{ delay: 0.08 }}
            className="flex min-h-[60svh] flex-col"
          >
            <div className="flex items-center justify-between border-b border-black/10 pb-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-neutral-500">
                  Conversation
                </p>
              </div>
              <div className="inline-flex items-center gap-2 text-xs text-neutral-500">
                <Waves className="h-3.5 w-3.5" />
                {isLoading ? "Generating" : messages.length > 0 ? "Active" : "Ready"}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto py-6">
              {messages.length === 0 ? (
                <motion.div
                  variants={reveal}
                  initial="hidden"
                  animate="visible"
                  className="flex min-h-[38svh] flex-col justify-between gap-10"
                >
                  <div className="max-w-2xl">
                    <p className="font-serif-display text-3xl leading-none tracking-[-0.04em] text-neutral-950 sm:text-4xl">
                      Bring in a document to begin.
                    </p>
                  </div>

                  <div className="grid gap-4 border-t border-black/10 pt-5 sm:grid-cols-3">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.22em] text-neutral-500">
                        Step 01
                      </p>
                      <p className="mt-2 text-sm text-neutral-900">Attach a PDF.</p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.22em] text-neutral-500">
                        Step 02
                      </p>
                      <p className="mt-2 text-sm text-neutral-900">Ask a question.</p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.22em] text-neutral-500">
                        Step 03
                      </p>
                      <p className="mt-2 text-sm text-neutral-900">Refine.</p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <AnimatePresence initial={false}>
                  <div className="space-y-10">
                    {messages.map((message) => {
                      const displayParts = getDisplayableParts(message);

                      if (displayParts.length === 0) return null;

                      return (
                        <motion.article
                          key={message.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -12 }}
                          transition={{ duration: 0.35, ease: "easeOut" }}
                          className="border-b border-black/10 pb-8"
                        >
                          <div className="mb-4 flex items-center gap-3">
                            <div
                              className={`flex h-9 w-9 items-center justify-center rounded-full border ${
                                message.role === "user"
                                  ? "border-black bg-black text-white"
                                  : "border-black/10 bg-white text-neutral-950"
                              }`}
                            >
                              {message.role === "user" ? (
                                <User className="h-4 w-4" />
                              ) : (
                                <Bot className="h-4 w-4" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-neutral-950">
                                {message.role === "user" ? "You" : "docuMind"}
                              </p>
                              <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">
                                {message.role === "user"
                                  ? "Query"
                                  : "Document-grounded response"}
                              </p>
                            </div>
                          </div>

                          <div
                            className={`max-w-3xl ${
                              message.role === "user"
                                ? "text-lg leading-8 text-neutral-950"
                                : "rich-markdown"
                            }`}
                          >
                            {displayParts.map((part, index) => (
                              <div key={`${message.id}-${index}`} className="break-words">
                                {message.role === "user" ? (
                                  <p>{part.text}</p>
                                ) : (
                                  <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    components={markdownComponents}
                                  >
                                    {part.text}
                                  </ReactMarkdown>
                                )}
                              </div>
                            ))}
                          </div>
                        </motion.article>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                </AnimatePresence>
              )}
            </div>

            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18, duration: 0.45 }}
              className="border-t border-black/10 pt-4"
            >
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
                  <div className="flex-1 border border-black bg-white px-4 py-4 transition focus-within:border-neutral-900">
                    <div className="flex items-center justify-between gap-4 border-b border-black/10 pb-3">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.22em] text-neutral-500">
                          Ask docuMind
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={openFilePicker}
                        className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-neutral-700 transition hover:text-neutral-950"
                      >
                        <Paperclip className="h-3.5 w-3.5" />
                        Attach PDF
                      </button>
                    </div>

                    <div className="pt-4">
                      <input
                        type="text"
                        value={draftInput}
                        placeholder="What does this document actually say about termination, pricing, timeline, or risk?"
                        onChange={(e) => {
                          if (transcript) {
                            resetTranscript();
                          }
                          setInput(e.target.value);
                        }}
                        disabled={isLoading}
                        className="w-full bg-transparent text-base leading-7 text-neutral-950 outline-none placeholder:text-neutral-400 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>

                {mounted && (hasFiles || listening || !browserSupportsSpeechRecognition) && (
                      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-black/10 pt-3 text-xs text-neutral-500">
                        {hasFiles && (
                          <div className="inline-flex items-center gap-2 border border-black/10 bg-neutral-50 px-3 py-1.5 text-neutral-700">
                            <FileText className="h-3.5 w-3.5" />
                            <span>
                              {fileCount} PDF{fileCount > 1 ? "s" : ""} attached
                            </span>
                            <button
                              type="button"
                              onClick={clearFiles}
                              className="text-neutral-400 transition hover:text-neutral-950"
                              aria-label="Clear attached files"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                        {listening && <span>Listening for your question...</span>}
                        {!browserSupportsSpeechRecognition && (
                          <span>Voice input is unavailable in this browser.</span>
                        )}
                      </div>
                    )}
                                      </div>

                  <div className="flex items-center gap-3 self-end">
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.96 }}
                      onClick={
                        listening
                          ? handleStopListening
                          : () =>
                              SpeechRecognition.startListening({
                                continuous: true,
                              })
                      }
                     disabled={!mounted || !browserSupportsSpeechRecognition || isLoading}
                      className={`flex h-12 w-12 items-center justify-center border transition disabled:cursor-not-allowed disabled:opacity-40 ${
                        listening
                          ? "border-red-500 bg-red-500 text-white"
                          : "border-black bg-white text-neutral-950 hover:bg-neutral-950 hover:text-white"
                      }`}
                    >
                      <Mic className="h-4 w-4" />
                    </motion.button>

                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      type="submit"
                      disabled={isLoading || (!draftInput.trim() && !hasFiles)}
                      className="flex h-12 min-w-[124px] items-center justify-center gap-2 border border-black bg-black px-5 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                      Send
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.form>
          </motion.section>
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
