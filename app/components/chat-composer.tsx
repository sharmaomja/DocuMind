"use client";

import { motion } from "framer-motion";
import { FileText, Loader2, Mic, Paperclip, Send, X } from "lucide-react";
import type { FormEvent } from "react";

type ChatComposerProps = {
  browserSupportsSpeechRecognition: boolean;
  canSubmit: boolean;
  draftInput: string;
  fileCount: number;
  hasFiles: boolean;
  isLoading: boolean;
  listening: boolean;
  mounted: boolean;
  onClearFiles: () => void;
  onInputChange: (value: string) => void;
  onOpenFilePicker: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void | Promise<void>;
  onVoiceToggle: () => void;
};

export function ChatComposer({
  browserSupportsSpeechRecognition,
  canSubmit,
  draftInput,
  fileCount,
  hasFiles,
  isLoading,
  listening,
  mounted,
  onClearFiles,
  onInputChange,
  onOpenFilePicker,
  onSubmit,
  onVoiceToggle,
}: ChatComposerProps) {
  return (
    <motion.form
      onSubmit={onSubmit}
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
                onClick={onOpenFilePicker}
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
                onChange={(event) => onInputChange(event.target.value)}
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
                      onClick={onClearFiles}
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
              onClick={onVoiceToggle}
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
              disabled={!canSubmit}
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
  );
}
