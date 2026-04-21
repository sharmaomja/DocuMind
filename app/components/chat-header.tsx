"use client";

import { motion } from "framer-motion";

export function ChatHeader() {
  return (
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
          <div className="mt-5 max-w-7xl">
            <p className="max-w-[50ch] text-5xl font-medium tracking-[-0.04em] text-neutral-950">
              Upload a document. Ask questions.
            </p>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
