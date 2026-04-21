"use client";

import { AnimatePresence, motion, type Variants } from "framer-motion";
import { Bot, User, Waves } from "lucide-react";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import { RefObject } from "react";
import remarkGfm from "remark-gfm";

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

const reveal: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

type ConversationMessage = {
  id: string;
  role: string;
  parts: string[];
};

type ChatConversationProps = {
  isLoading: boolean;
  messages: ConversationMessage[];
  messagesEndRef: RefObject<HTMLDivElement | null>;
};

export function ChatConversation({
  isLoading,
  messages,
  messagesEndRef,
}: ChatConversationProps) {
  return (
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
              {messages.map((message) => (
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
                    {message.parts.map((part, index) => (
                      <div key={`${message.id}-${index}`} className="break-words">
                        {message.role === "user" ? (
                          <p>{part}</p>
                        ) : (
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={markdownComponents}
                          >
                            {part}
                          </ReactMarkdown>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.article>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </AnimatePresence>
        )}
      </div>
    </motion.section>
  );
}
