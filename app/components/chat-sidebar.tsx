"use client";

import { motion, type Variants } from "framer-motion";

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

type ChatSidebarProps = {
  prompts: string[];
  onPromptClick: (prompt: string) => void;
};

export function ChatSidebar({ prompts, onPromptClick }: ChatSidebarProps) {
  return (
    <motion.aside
      variants={reveal}
      initial="hidden"
      animate="visible"
      className="flex flex-col justify-between border-b border-black/10 pb-6 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-8"
    >
      <div className="space-y-8">
        <section className="space-y-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-neutral-500">
              Ask next
            </p>
          </div>
          <div className="space-y-2">
            {prompts.map((prompt, index) => (
              <motion.button
                key={prompt}
                type="button"
                onClick={() => onPromptClick(prompt)}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: 0.12 + index * 0.06,
                  duration: 0.35,
                }}
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
  );
}
