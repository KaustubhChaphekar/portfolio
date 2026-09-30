import type { Project } from "./data";

// Long-form case studies rendered at /work/[slug]. Wallxy's code is private, so its studies
// stay at the level of the résumé; add specifics (numbers, trade-offs) whenever you like.

export type FlowNode = { label: string; detail?: string };
export type FlowLane = { title: string; nodes: FlowNode[] };

export type CaseStudy = {
  slug: string;
  title: string;
  subtitle: string;
  kind: string;
  period: string;
  role: string;
  status: string;
  // ISO dates for search engines (Article structured data and the sitemap).
  published: string;
  updated?: string;
  art: Project["art"];
  stack: string[];
  summary: string;
  facts: { value: string; label: string }[];
  problem: string[];
  architecture: { intro: string; lanes: FlowLane[] };
  sections: { title: string; paragraphs?: string[]; bullets?: string[] }[];
  decisions: { title: string; body: string }[];
  next?: string[];
};

export const caseStudies: CaseStudy[] = [
  {
    slug: "ai-social-agent",
    title: "AI Social Agent",
    subtitle: "An autonomous pipeline that writes, voices, edits and publishes a YouTube Short every day, running on free-tier infrastructure.",
    kind: "Personal project",
    period: "Jun – Sep 2026",
    role: "Solo: product, architecture, build, deploy",
    status: "Live · private repo",
    published: "2026-09-29",
    art: "agent",
    stack: [
      "Next.js 16", "React 19", "TypeScript", "Tailwind v4", "MongoDB / Mongoose", "Gemini", "OpenAI", "ElevenLabs",
      "Pexels", "FFmpeg", "YouTube Data API", "SimpleWebAuthn", "Web Push", "Resend", "GitHub Actions", "Render",
    ],
    summary:
      "One daily run takes an idea from a queue, writes a 5–7 scene script, voices it with word-level timings, finds matching vertical footage, renders a captioned 9:16 video with music and motion, uploads it to YouTube, then comments, files it into a playlist and notifies me. A secure, installable dashboard shows every step live.",
    facts: [
      { value: "6", label: "pipeline stages, each with a fallback" },
      { value: "4", label: "AI & media APIs orchestrated" },
      { value: "13", label: "node:test suites, incl. a real FFmpeg render" },
      { value: "24", label: "commits from first idea to production" },
    ],
    problem: [
      "Posting short-form video every day is the same routine every time: pick a topic, write a hook, record a voice-over, hunt for footage, cut it, caption it, upload it, fill in the metadata. That's the kind of work an agent should do.",
      "The constraints made it interesting. It had to run on free tiers (a Render instance that sleeps when idle, the Gemini free tier, a free MongoDB cluster), never post twice or burn paid credits on a failure loop, and still leave room for a human to review a video before it goes public.",
    ],
    architecture: {
      intro:
        "A single Next.js 16 app is both the dashboard and the worker. External pingers wake it hourly; an idempotent cron endpoint decides whether today's run is due.",
      lanes: [
        {
          title: "Trigger",
          nodes: [
            { label: "GitHub Actions + cron-job.org", detail: "hourly POST /api/cron with a bearer secret" },
            { label: "Due check", detail: "post time passed · nothing posted today · < 3 attempts" },
          ],
        },
        {
          title: "Pipeline",
          nodes: [
            { label: "Script", detail: "Gemini Flash → Flash-Lite, or OpenAI · strict JSON" },
            { label: "Voice", detail: "ElevenLabs Flash v2.5 → Gemini TTS" },
            { label: "Footage", detail: "Pexels clip per scene query" },
            { label: "Render", detail: "FFmpeg 720×1280 · word captions · music" },
            { label: "Upload", detail: "YouTube Data API · thumbnail · playlist" },
          ],
        },
        {
          title: "State & signals",
          nodes: [
            { label: "MongoDB", detail: "posts · runs · ideas · settings · analytics" },
            { label: "Dashboard", detail: "SSE live steps · review queue · PWA" },
            { label: "Alerts", detail: "Resend email · Web Push" },
          ],
        },
      ],
    },
    sections: [
      {
        title: "The pipeline",
        bullets: [
          "Script: the LLM returns a title, two alternative titles, thumbnail texts, a 3-second hook and 5–7 scenes (narration + a filmable stock-footage query) as strict JSON. It avoids recent topics and, once 5+ videos are two days old, learns from which hooks got the most views.",
          "Voice: ElevenLabs returns audio with word timings for synced captions; when quota runs low or a call fails, the free Gemini voice takes over, and a low-quota alert fires at 20% remaining.",
          "Render: FFmpeg builds a 9:16 video with word-by-word captions and highlighted key words, a title card, a slow pan on every clip, a progress bar and royalty-free background music.",
          "Publish: upload, custom thumbnail where YouTube allows it, add to a channel playlist, and post a first comment that asks viewers a question.",
        ],
      },
      {
        title: "Review mode",
        paragraphs: [
          "In Review first mode the video uploads privately and waits. The MP4 is kept in MongoDB (up to 150 MB, swept after 7 days) so I can watch it on the dashboard, pick one of three titles or write my own, pick a thumbnail, then Approve & publish, or let YouTube auto-publish after N hours.",
        ],
      },
      {
        title: "Security for a single-owner dashboard",
        bullets: [
          "Password sign-in plus passkeys (Face ID, fingerprint, Windows Hello) via WebAuthn.",
          "HttpOnly signed session cookie; Sign out everywhere ends every other session at once, and changing the password signs out every device.",
          "Brute-force lockout (5 failed attempts per network per 15 minutes) with an email alert, plus an email on sign-in from a new network.",
          "CSRF origin checks on writes, CSP, X-Frame-Options, HSTS, strict referrer, no-store API responses, and a 90-day activity log.",
        ],
      },
      {
        title: "Testing & CI",
        paragraphs: [
          "node:test suites cover the pipeline, scheduling, captions, error descriptions, auth and security, and a real FFmpeg render with no network. GitHub Actions runs lint, typecheck, tests and a production build on every push and pull request.",
        ],
      },
      {
        title: "What broke, and how I fixed it",
        bullets: [
          "GitHub's scheduled workflows are best-effort: on one day only 5 of ~20 hourly runs fired, none in the posting window. I added cron-job.org as a second pinger (safe, because the endpoint never posts twice) and a Post it now button when a post is an hour late.",
          "Next.js bundles lib/ separately into each route handler while the custom server loads it with require, which duplicated in-memory state (split logs, double runs). Moving pipeline state onto globalThis made it one shared instance.",
          "YouTube keeps uploads from unverified API projects private, and OAuth refresh tokens expire after 7 days while the consent screen is in Testing, so both are documented in the setup guide and surfaced in the run log.",
        ],
      },
    ],
    decisions: [
      { title: "Idempotent cron, external pingers", body: "Free Render instances sleep, so the in-process cron can't be trusted. Any number of pings is safe: the app posts only when today's slot has passed and nothing has been posted yet." },
      { title: "A fallback at every paid step", body: "Gemini Flash falls back to Flash-Lite on 429/503; ElevenLabs falls back to Gemini TTS. Retries use backoff, and a 3-attempt daily cap stops a broken key from burning credits." },
      { title: "A contract the prompt can't break", body: "The output schema is appended to every prompt, default or custom, so the pipeline always receives the fields it needs no matter how the niche prompt is worded." },
      { title: "Human in the loop, optionally", body: "Auto mode publishes directly; review mode uploads privately and waits for approval, which catches mistakes and adds the human input platforms increasingly expect." },
    ],
    next: [
      "Edit the script on the dashboard before it renders",
      "Record my own voice-over in the browser, timed with forced alignment",
      "A fact-check pass that flags unsupported claims",
      "A trend scout that suggests ideas from what's working in the niche",
    ],
  },
  {
    slug: "subscription-engine",
    title: "Subscription & Billing Engine",
    subtitle: "The Razorpay-powered subscription system behind Wallxy, from free trial to renewal, with the billing rules a real SaaS needs.",
    kind: "Wallxy · work",
    period: "2024 – present",
    role: "Full-stack developer & tech lead",
    status: "In production",
    published: "2026-09-29",
    art: "billing",
    stack: ["Next.js", "Node.js", "TypeScript", "MongoDB", "Razorpay", "GCP Pub/Sub", "Cloud Run", "Jest", "Playwright"],
    summary:
      "I built Wallxy's production Razorpay integration: the full subscription lifecycle, mandate verification, proration, add-ons, webhook handling, a wallet with credits, and invoice generation, backed by asynchronous workers for expiry and usage-based billing.",
    facts: [
      { value: "3", label: "lifecycle states: trial → active → expired" },
      { value: "₹1", label: "mandate verification before billing" },
      { value: "21-day", label: "billing lifecycle covered end-to-end in Playwright" },
      { value: "2", label: "async billing workers: expiry & usage" },
    ],
    problem: [
      "Wallxy is a SaaS for design professionals, so subscriptions are the business. Billing has to be right in every edge case: upgrades mid-cycle, add-ons, trials that convert or lapse, and payment events that arrive asynchronously from Razorpay.",
    ],
    architecture: {
      intro: "A simplified view of how the pieces fit together.",
      lanes: [
        { title: "Customer", nodes: [{ label: "Plans & checkout", detail: "Next.js UI" }, { label: "₹1 mandate", detail: "payment method verified" }] },
        { title: "Billing core", nodes: [{ label: "Razorpay", detail: "subscriptions & payments" }, { label: "Webhook handling", detail: "payment events → subscription state" }, { label: "MongoDB", detail: "subscriptions · wallet · invoices" }] },
        { title: "Async workers", nodes: [{ label: "GCP Pub/Sub", detail: "billing events" }, { label: "Cloud Run", detail: "subscription expiry · usage billing" }] },
      ],
    },
    sections: [
      {
        title: "What it covers",
        bullets: [
          "Full subscription lifecycle: trial → active → expired.",
          "₹1 mandate verification before recurring billing starts.",
          "Proration when plans change, and add-ons on top of a plan.",
          "Webhook handling for Razorpay payment and subscription events.",
          "A wallet with credits, and invoice generation.",
          "Subscription plans wired into the Brand Marketplace module.",
        ],
      },
      {
        title: "Asynchronous by design",
        paragraphs: [
          "Time-based work, like expiring subscriptions and usage-based billing, runs outside the request path as workers on Google Cloud Pub/Sub and Cloud Run, so users never wait on it and it doesn't depend on someone visiting the app.",
        ],
      },
      {
        title: "Tested like money depends on it",
        paragraphs: [
          "Jest unit and integration tests cover the payment scenarios, and Playwright end-to-end tests walk through auth flows and a full 21-day subscription billing lifecycle.",
        ],
      },
    ],
    decisions: [
      { title: "Verify before you bill", body: "A ₹1 mandate confirms the payment method up front, before a trial converts into a paid subscription." },
      { title: "Events over polling", body: "Razorpay webhooks drive state changes, and Pub/Sub workers handle the time-based transitions: expiry and usage billing." },
      { title: "Test the calendar, not just the function", body: "Billing bugs hide in time. The E2E suite follows a subscription across a 21-day cycle instead of testing each step alone." },
    ],
  },
  {
    slug: "worker-pipelines",
    title: "Async Worker Pipelines & Platform Ops",
    subtitle: "The background infrastructure behind Wallxy: Pub/Sub workers on Cloud Run, Dockerized workers on a Linux VPS, cron-built feeds, and the monitoring around them.",
    kind: "Wallxy · work",
    period: "2024 – present",
    role: "Owned all infrastructure & deployments",
    status: "In production",
    published: "2026-09-29",
    art: "workers",
    stack: ["GCP Pub/Sub", "Cloud Run", "Docker", "Linux VPS", "Redis", "MongoDB", "Vercel", "Sentry", "PostHog", "CloudConvert"],
    summary:
      "I own Wallxy's infrastructure end to end: production deployments on Vercel, a Linux VPS running Dockerized backend workers, Google Cloud (APIs, Cloud Run, Pub/Sub), and application health through Sentry and PostHog.",
    facts: [
      { value: "5", label: "worker pipelines on Pub/Sub + Cloud Run" },
      { value: "5", label: "content types in the Explore feed" },
      { value: "3", label: "developers whose deploys and merges I manage" },
      { value: "3", label: "runtimes: Vercel · Cloud Run · VPS" },
    ],
    problem: [
      "A design-collaboration SaaS does a lot of work nobody should wait for: running campaigns, converting PDFs into DWG files, expiring subscriptions, sending email, and billing for usage. It also needs a fast, fresh discovery feed.",
    ],
    architecture: {
      intro: "A simplified view of the async side of the platform.",
      lanes: [
        { title: "App", nodes: [{ label: "Next.js on Vercel", detail: "UI + API routes" }, { label: "MongoDB", detail: "primary data" }] },
        { title: "Queue & workers", nodes: [{ label: "GCP Pub/Sub", detail: "topics per job type" }, { label: "Cloud Run workers", detail: "campaigns · PDF→DWG · expiry · email · usage billing" }] },
        { title: "Feeds & ops", nodes: [{ label: "Docker on Linux VPS", detail: "backend & cron feed workers" }, { label: "Redis", detail: "Explore feed cache" }, { label: "Sentry + PostHog", detail: "errors & product analytics" }] },
      ],
    },
    sections: [
      {
        title: "Worker pipelines",
        bullets: [
          "Campaign execution",
          "PDF-to-DWG conversion",
          "Subscription expiry",
          "Email delivery",
          "Usage-based billing",
        ],
      },
      {
        title: "Explore feed",
        paragraphs: [
          "A multi-type feed covering ideas, catalog, gallery, brands and people, with Redis caching, real-time search, and trending content computed by cron-based feed workers.",
        ],
      },
      {
        title: "Operating it",
        paragraphs: [
          "I manage production deployments on Vercel and the VPS, administer Google Cloud Console, and watch application health in Sentry and PostHog. As tech lead I also run sprint planning and code reviews, and handle every Git merge and branch for a team of three.",
        ],
      },
    ],
    decisions: [
      { title: "Keep slow work off the request path", body: "Anything that can take seconds or minutes goes onto a Pub/Sub topic and a worker, so the UI stays fast." },
      { title: "Right host for each job", body: "Serverless Cloud Run for bursty queue work, a Dockerized VPS for long-running and cron workers, and Vercel for the Next.js app." },
      { title: "Cache the feed, compute trends offline", body: "Redis serves the Explore feed quickly, while cron workers precompute trending content instead of calculating it per request." },
    ],
  },
];

export const getCaseStudy = (slug: string) => caseStudies.find((c) => c.slug === slug);
