import { getTranslations } from "next-intl/server";
import Image from "next/image";
import type { ReactNode } from "react";

import { SectionHeading } from "./section-heading";

interface TrackCardProps {
  name: string;
  version: string;
  description: string;
  logo: ReactNode;
}

function TrackCard({ name, version, description, logo }: TrackCardProps) {
  return (
    <article className="group relative flex h-full flex-col gap-4 rounded-xl border border-white/8 bg-card p-6  transition hover:-translate-y-0.5 hover:border-white/20">
      <span
        aria-hidden
        className="absolute inset-e-4 top-4 text-muted-foreground/40 transition group-hover:text-brand group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
      >
        <svg
          viewBox="0 0 24 24"
          className="size-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M7 17 17 7M9 7h8v8" />
        </svg>
      </span>

      <div className="flex size-10 items-center justify-center rounded-lg border border-white/10 bg-white/3 text-foreground">
        {logo}
      </div>

      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold text-foreground">{name}</h3>
          <span className="rounded-md border border-white/10 bg-white/4 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground/80">
            {version}
          </span>
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground/70 sm:text-[13px]">
          {description}
        </p>
      </div>
    </article>
  );
}
const CHIP_CENTER_X = 600;
const CHIP_HALF_WIDTH = 66;
const CHIP_TOP_Y = 24;
const CHIP_SLOT_SPACING = 32;
const CHIP_LEFT_X = CHIP_CENTER_X - CHIP_HALF_WIDTH;
const CHIP_RIGHT_X = CHIP_CENTER_X + CHIP_HALF_WIDTH;
const LINE_APPROACH_OFFSET = 42;
const DEFAULT_SIGNAL_DURATION = "2.8s";
const DEFAULT_SIGNAL_DASHARRAY = "0.15 1";
const DEFAULT_STATIC_STROKE = "rgba(255,255,255,0.06)";
const DEFAULT_STATIC_STROKE_WIDTH = 1;
const DEFAULT_SIGNAL_STROKE_WIDTH = 2.5;

interface ConnectorLine {
  id: string;
  color: string;
  delay: string;
  signalDuration: string;
  signalDasharray: string;
  staticStroke: string;
  staticStrokeWidth: number;
  signalStrokeWidth: number;
  points: ReadonlyArray<{ x: number; y: number }>;
}

const CONNECTOR_LINES: ReadonlyArray<ConnectorLine> = [
  {
    id: "next",
    color: "#FFFFFF",
    delay: "1.2s",
    signalDuration: DEFAULT_SIGNAL_DURATION,
    signalDasharray: DEFAULT_SIGNAL_DASHARRAY,
    staticStroke: DEFAULT_STATIC_STROKE,
    staticStrokeWidth: DEFAULT_STATIC_STROKE_WIDTH,
    signalStrokeWidth: DEFAULT_SIGNAL_STROKE_WIDTH,
    points: [
      { x: 200, y: 200 },
      { x: 200, y: 30 },
      { x: 540, y: 30 },
    ],
  },
  {
    id: "react",
    color: "#58C4DC",
    delay: "0.4s",
    signalDuration: DEFAULT_SIGNAL_DURATION,
    signalDasharray: DEFAULT_SIGNAL_DASHARRAY,
    staticStroke: DEFAULT_STATIC_STROKE,
    staticStrokeWidth: DEFAULT_STATIC_STROKE_WIDTH,
    signalStrokeWidth: DEFAULT_SIGNAL_STROKE_WIDTH,
    points: [
      { x: 600, y: 300 },
      { x: 600, y: 178 },
      { x: CHIP_LEFT_X - LINE_APPROACH_OFFSET, y: 178 },
      {
        x: CHIP_LEFT_X - LINE_APPROACH_OFFSET,
        y: CHIP_TOP_Y + CHIP_SLOT_SPACING * 1,
      },
      { x: CHIP_LEFT_X, y: CHIP_TOP_Y + CHIP_SLOT_SPACING * 1 },
    ],
  },
  {
    id: "ts",
    color: "#3178C6",
    delay: "0.8s",
    signalDuration: DEFAULT_SIGNAL_DURATION,
    signalDasharray: DEFAULT_SIGNAL_DASHARRAY,
    staticStroke: DEFAULT_STATIC_STROKE,
    staticStrokeWidth: DEFAULT_STATIC_STROKE_WIDTH,
    signalStrokeWidth: DEFAULT_SIGNAL_STROKE_WIDTH,
    points: [
      { x: 1000, y: 305 },
      { x: 1000, y: 108 },
      { x: 860, y: 108 },
      { x: 860, y: 30 },
      { x: CHIP_RIGHT_X, y: 30 },
    ],
  },
  {
    id: "tailwind",
    color: "#00BCFF",
    delay: "1.2s",
    signalDuration: DEFAULT_SIGNAL_DURATION,
    signalDasharray: DEFAULT_SIGNAL_DASHARRAY,
    staticStroke: DEFAULT_STATIC_STROKE,
    staticStrokeWidth: DEFAULT_STATIC_STROKE_WIDTH,
    signalStrokeWidth: DEFAULT_SIGNAL_STROKE_WIDTH,
    points: [
      { x: 300, y: 480 },
      { x: 300, y: 335 },
      { x: 470, y: 335 },
      { x: 470, y: 94 },
      { x: CHIP_LEFT_X, y: 94 },
    ],
  },
  {
    id: "shadcn",
    color: "#FFFFFF",
    delay: "1.6s",
    signalDuration: DEFAULT_SIGNAL_DURATION,
    signalDasharray: DEFAULT_SIGNAL_DASHARRAY,
    staticStroke: DEFAULT_STATIC_STROKE,
    staticStrokeWidth: DEFAULT_STATIC_STROKE_WIDTH,
    signalStrokeWidth: DEFAULT_SIGNAL_STROKE_WIDTH,
    points: [
      { x: 900, y: 480 },
      { x: 900, y: 338 },
      { x: 740, y: 338 },
      { x: 740, y: 62 },
      { x: CHIP_RIGHT_X, y: 62 },
    ],
  },
];

function pointsToPath(points: ReadonlyArray<{ x: number; y: number }>) {
  return points
    .map((point, index) => `${index === 0 ? "M" : "L"}${point.x} ${point.y}`)
    .join(" ");
}

function ConnectorLines() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1200 550"
      className="pointer-events-none absolute inset-0 z-0 hidden h-full w-full lg:block"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <filter id="line-glow">
          <feGaussianBlur
            in="SourceGraphic"
            stdDeviation="3"
            result="blur"
          />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <style>{`
          @keyframes signal-travel {
            0%   { stroke-dashoffset: 1.15; opacity: 0; }
            5%   { opacity: 1; }
            90%  { opacity: 1; }
            100% { stroke-dashoffset: -0.15; opacity: 0; }
          }
        `}</style>
      </defs>

      {CONNECTOR_LINES.map((line) => {
        const path = pointsToPath(line.points);

        return (
          <g key={line.id}>
            {/* Static track */}
            <path
              d={path}
              stroke={line.staticStroke}
              strokeWidth={line.staticStrokeWidth}
              fill="none"
            />

            {/* Traveling signal */}
            <path
              d={path}
              stroke={line.color}
              strokeWidth={line.signalStrokeWidth}
              strokeLinecap="round"
              fill="none"
              filter="url(#line-glow)"
              pathLength="1"
              strokeDasharray={line.signalDasharray}
              style={{
                animation: `signal-travel ${line.signalDuration} linear infinite`,
                animationDelay: line.delay,
              }}
            />
          </g>
        );
      })}
    </svg>
  );
}
// Inline SVG logos - simple, neutral marks
function NextLogo() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-5"
      fill="currentColor"
    >
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12c2.508 0 4.836-.77 6.762-2.088L8.51 8.888V17.6H6.8V6.4h2.116l9.94 13.34A11.94 11.94 0 0 0 24 12C24 5.373 18.627 0 12 0Zm3.3 6.4h1.7v8.8l-1.7-2.282V6.4Z" />
    </svg>
  );
}

function ReactLogo() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
    >
      <circle
        cx="12"
        cy="12"
        r="1.8"
        fill="currentColor"
      />
      <ellipse
        cx="12"
        cy="12"
        rx="10"
        ry="4"
      />
      <ellipse
        cx="12"
        cy="12"
        rx="10"
        ry="4"
        transform="rotate(60 12 12)"
      />
      <ellipse
        cx="12"
        cy="12"
        rx="10"
        ry="4"
        transform="rotate(120 12 12)"
      />
    </svg>
  );
}

function TsLogo() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-5"
      fill="currentColor"
    >
      <path d="M3 3h18v18H3V3Zm10.5 10v-1.5h-7V13H9v6h1.5v-6h3Zm1.2 3.7c.3.6 1 1 1.9 1 1.3 0 2.2-.7 2.2-1.9 0-1-.6-1.5-1.7-2l-.3-.1c-.6-.3-.8-.4-.8-.8 0-.3.3-.6.7-.6.5 0 .7.2.9.6l1.2-.8c-.5-.8-1.2-1.1-2.1-1.1-1.3 0-2.1.8-2.1 1.9 0 1.1.6 1.6 1.6 2l.3.1c.6.3.9.4.9.9 0 .3-.3.6-.9.6-.6 0-1-.3-1.3-.8l-1.2.8Z" />
    </svg>
  );
}

function TailwindLogo() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-5"
      fill="currentColor"
    >
      <path d="M12 6c-2.7 0-4.3 1.3-5 4 1-1.3 2.2-1.8 3.5-1.5.8.2 1.3.8 2 1.4.9.9 2 2 4.5 2 2.7 0 4.3-1.3 5-4-1 1.3-2.2 1.8-3.5 1.5-.8-.2-1.3-.8-2-1.4C15.6 7 14.5 6 12 6ZM7 12c-2.7 0-4.3 1.3-5 4 1-1.3 2.2-1.8 3.5-1.5.8.2 1.3.8 2 1.4.9.9 2 2 4.5 2 2.7 0 4.3-1.3 5-4-1 1.3-2.2 1.8-3.5 1.5-.8-.2-1.3-.8-2-1.4C10.6 13 9.5 12 7 12Z" />
    </svg>
  );
}

function ShadcnLogo() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M4 20 20 4M13 20l7-7" />
    </svg>
  );
}

// 6 connector lines - one per card, each with its own color and delay

export async function SupportedTracks() {
  const t = await getTranslations();

  return (
    <section
      id="tracks"
      className="relative isolate overflow-hidden bg-background py-24 sm:py-32 lg:py-40"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
      />

      <div className="container mx-auto px-4 lg:px-8">
        {/* Section heading */}
        <SectionHeading
          title={t("tracks-title")}
          subtitle={t("tracks-subtitle")}
        />

        <div className="relative mx-auto mt-20 max-w-5xl">
          <div className="flex items-center justify-center">
            <div className="border-2 border-white/10 rounded-xl p-4 outline outline-brand">
              <Image
                src="/brain.svg"
                alt={t("tracks-chip-alt")}
                width={100}
                height={100}
              />
            </div>
          </div>

          <div className="absolute -top-4 left-0 right-0 bottom-0">
            <ConnectorLines />
          </div>
          <div className="relative mt-20">
            <div className="relative z-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <TrackCard
                name={t("tracks-next-name")}
                version={t("tracks-next-version")}
                description={t("tracks-next-desc")}
                logo={<NextLogo />}
              />
              <TrackCard
                name={t("tracks-react-name")}
                version={t("tracks-react-version")}
                description={t("tracks-react-desc")}
                logo={<ReactLogo />}
              />
              <TrackCard
                name={t("tracks-ts-name")}
                version={t("tracks-ts-version")}
                description={t("tracks-ts-desc")}
                logo={<TsLogo />}
              />
            </div>

            <div className="relative z-10 mt-5 mx-auto grid max-w-3xl grid-cols-1 gap-5 sm:grid-cols-2">
              <TrackCard
                name={t("tracks-tailwind-name")}
                version={t("tracks-tailwind-version")}
                description={t("tracks-tailwind-desc")}
                logo={<TailwindLogo />}
              />
              <TrackCard
                name={t("tracks-shadcn-name")}
                version={t("tracks-shadcn-version")}
                description={t("tracks-shadcn-desc")}
                logo={<ShadcnLogo />}
              />
            </div>
          </div>

          <p className="mt-12 text-center text-sm text-white/30">
            {t("tracks-footnote")}
          </p>
        </div>
      </div>
    </section>
  );
}
