"use client";

import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils";

const TYPING_MS = 26;
const LINE_PAUSE_MS = 720;
const LOOP_GAP_MS = 1400;
const LOG_CAP = 6;
const MAX_ROTATE_X = 8;
const MAX_ROTATE_Y = 11;

const TERMINAL_LINE_KEYS = [
  "landing-terminal-line-0",
  "landing-terminal-line-1",
  "landing-terminal-line-2",
  "landing-terminal-line-3",
  "landing-terminal-line-4",
  "landing-terminal-line-5",
  "landing-terminal-line-6",
] as const;

type LogEntry = {
  id: string;
  text: string;
};

function lineTone(line: string) {
  const t = line.trimStart();
  if (t.startsWith("⚠")) return "warn" as const;
  if (t.startsWith("✓")) return "ok" as const;
  return "cmd" as const;
}

function lineToneClass(tone: ReturnType<typeof lineTone>) {
  return cn(
    tone === "cmd" && "text-cyan-300/90",
    tone === "warn" && "text-amber-300/90",
    tone === "ok" && "text-emerald-300/90",
  );
}

export function TerminalAnimation() {
  // Translation
  const t = useTranslations();

  // Variables
  const lines = useMemo(() => TERMINAL_LINE_KEYS.map((key) => t(key)), [t]);

  // Refs
  const shellRef = useRef<HTMLDivElement>(null);
  const logLineIdRef = useRef(0);

  // State
  const [lineIndex, setLineIndex] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [log, setLog] = useState<LogEntry[]>([]);

  // Motion
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const rotateXTarget = useTransform(
    mouseY,
    [0, 1],
    [MAX_ROTATE_X, -MAX_ROTATE_X],
  );
  const rotateYTarget = useTransform(
    mouseX,
    [0, 1],
    [-MAX_ROTATE_Y, MAX_ROTATE_Y],
  );
  const rotateX = useSpring(rotateXTarget, {
    stiffness: 180,
    damping: 20,
    mass: 0.35,
  });
  const rotateY = useSpring(rotateYTarget, {
    stiffness: 180,
    damping: 20,
    mass: 0.35,
  });

  // Variables
  const currentLine = lines[lineIndex] ?? "";
  const visible = currentLine.slice(0, charCount);

  // Effects
  useEffect(() => {
    if (!lines.length) return;

    if (charCount < currentLine.length) {
      const id = window.setTimeout(() => setCharCount((c) => c + 1), TYPING_MS);
      return () => window.clearTimeout(id);
    }

    const id = window.setTimeout(
      () => {
        logLineIdRef.current += 1;
        setLog((prev) =>
          [
            ...prev,
            { id: `log-${logLineIdRef.current}`, text: currentLine },
          ].slice(-LOG_CAP),
        );
        setLineIndex((i) => (i + 1) % lines.length);
        setCharCount(0);
      },
      LINE_PAUSE_MS + (lineIndex === lines.length - 1 ? LOOP_GAP_MS : 0),
    );

    return () => window.clearTimeout(id);
  }, [charCount, currentLine, lineIndex, lines]);

  // Functions
  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const el = shellRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
      mouseX.set(x);
      mouseY.set(y);
    },
    [mouseX, mouseY],
  );

  const onMouseLeave = useCallback(() => {
    mouseX.set(0.5);
    mouseY.set(0.5);
  }, [mouseX, mouseY]);

  // Variables
  const tone = lineTone(visible);

  return (
    <div className="relative mx-auto w-full max-w-xl px-2 lg:max-w-none">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 scale-110 blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse at 50% 55%, rgba(34, 211, 238, 0.2), transparent 58%)",
        }}
      />

      <motion.div
        className="primary-badge-float absolute -inset-s-2 top-6 z-20 hidden rounded-full border border-cyan-300/20 bg-primary-surface px-3 py-1 text-[11px] font-medium tracking-wide text-cyan-300/90 backdrop-blur-md sm:block"
        animate={{ y: [0, -8, 0], opacity: [0.9, 1, 0.9] }}
        transition={{
          duration: 3.2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.2,
        }}
      >
        {t("landing-terminal-badge-next")}
      </motion.div>
      <motion.div
        className="primary-badge-float absolute -inset-e-4 top-1/4 z-20 hidden rounded-full border border-sky-300/20 bg-primary-surface px-3 py-1 text-[11px] font-medium tracking-wide text-sky-300/90 backdrop-blur-md sm:block"
        animate={{ y: [0, -10, 0], opacity: [0.88, 1, 0.88] }}
        transition={{
          duration: 3.6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.8,
        }}
      >
        {t("landing-terminal-badge-react")}
      </motion.div>
      <motion.div
        className="primary-badge-float absolute -bottom-2 inset-s-1/4 z-20 hidden rounded-full border border-emerald-300/20 bg-primary-surface px-3 py-1 text-[11px] font-medium tracking-wide text-emerald-300/85 backdrop-blur-md sm:block"
        animate={{ y: [0, -7, 0], opacity: [0.86, 1, 0.86] }}
        transition={{
          duration: 3.4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1.4,
        }}
      >
        {t("landing-terminal-badge-ts")}
      </motion.div>

      <div
        className="mx-auto perspective-distant"
        onMouseLeave={onMouseLeave}
        onMouseMove={onMouseMove}
      >
        <motion.div
          className="transition-transform duration-200 ease-out will-change-transform"
          ref={shellRef}
          style={{
            rotateX,
            rotateY,
            transformStyle: "preserve-3d",
          }}
          whileHover={{ scale: 1.012 }}
          transition={{ type: "spring", stiffness: 220, damping: 20 }}
        >
          <div className="rounded-2xl border border-white/12 bg-primary-surface shadow-[0_24px_80px_rgba(0,0,0,0.55),0_0_0_1px_rgba(34,211,238,0.1)] backdrop-blur-sm">
            <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
              <div className="flex gap-1.5">
                <span className="size-2.5 rounded-full bg-[#FF5F57]/90" />
                <span className="size-2.5 rounded-full bg-[#FEBC2E]/90" />
                <span className="size-2.5 rounded-full bg-[#28C840]/90" />
              </div>
              <span className="ms-3 font-mono text-[11px] text-primary-muted">
                {t("landing-terminal-window-title")}
              </span>
            </div>
            <div
              className="relative min-h-[220px] space-y-2.5 px-4 py-4 font-mono text-[13px] leading-relaxed sm:min-h-[280px] sm:text-sm"
            >
              <div className="relative space-y-2">
                <AnimatePresence initial={false}>
                  {log.map((entry) => (
                    <motion.p
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 0.55, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      key={entry.id}
                      className={cn(
                        "whitespace-pre-wrap wrap-break-word transition-opacity",
                        lineToneClass(lineTone(entry.text)),
                      )}
                    >
                      {entry.text}
                    </motion.p>
                  ))}
                </AnimatePresence>
                <p
                  className={cn(
                    "whitespace-pre-wrap wrap-break-word",
                    lineToneClass(tone),
                  )}
                >
                  {visible}
                  <motion.span
                    className="primary-caret ms-0.5 inline-block h-[1.05em] w-2 translate-y-px rounded-[2px] bg-emerald-400 align-middle"
                    aria-hidden
                    style={{
                      boxShadow: "0 0 14px rgba(74, 222, 128, 0.55)",
                    }}
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{
                      duration: 0.9,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
