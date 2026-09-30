// Every piece of copy on the site lives here — edit this file to update the portfolio.

export const profile = {
  name: "Kaustubh Chaphekar",
  firstName: "Kaustubh",
  lastName: "Chaphekar",
  role: "Full-Stack Developer & Tech Lead",
  location: "Nashik, India",
  coords: { lat: 19.9975, lon: 73.7898 },
  timeZone: "Asia/Kolkata",
  email: "kaustubhchaphekar178@gmail.com",
  linkedin: "https://www.linkedin.com/in/kaustubh-chaphekar-569815161",
  github: "https://github.com/KaustubhChaphekar",
  resume: "/Kaustubh_Chaphekar_Resume.pdf",
  photo: "/me/kaustubh-chaphekar.jpg",
  // WhatsApp number in international format, digits only (country code first).
  whatsapp: "917218791254",
  whatsappMessage: "Hi Kaustubh, I found your portfolio and I'd like to talk about a website/project.",
  // Your Cal.com / Calendly link for a short intro call. Leave empty to hide the "Book a call" buttons.
  bookingUrl: "",
  // Optional, e.g. "he/him" or "she/her". The AI assistant uses them; when empty it refers to you by name.
  pronouns: "",
  tagline:
    "I build and own production SaaS end-to-end — from Next.js front ends and payment systems to async worker pipelines on Google Cloud.",
  summary:
    "Full-Stack Developer and Tech Lead with 2+ years building and owning a production SaaS platform end-to-end — from feature development and system architecture to DevOps, cloud infrastructure, and team leadership. I led a team of 3 developers, managed every deployment on Vercel and a Linux VPS, and ran Google Cloud Console, Sentry and PostHog across the full product lifecycle.",
  focus: "Next.js, subscription systems, async worker pipelines and payment integrations (Razorpay).",
};

export const stats = [
  { value: 2, suffix: "+", label: "years owning a production SaaS" },
  { value: 3, suffix: "", label: "developers led as tech lead" },
  { value: 8, suffix: "", label: "product modules architected" },
  { value: 5, suffix: "", label: "async worker pipelines on GCP" },
];

export const pillars = [
  {
    title: "Product engineering",
    body: "Next.js App Router, React, TypeScript and RTK Query — feature work with a clean split between UI, business logic and data access.",
    tags: ["Next.js", "React", "TypeScript", "Tailwind"],
  },
  {
    title: "Systems & infrastructure",
    body: "Pub/Sub + Cloud Run workers, Dockerized services on a Linux VPS, Redis caching, and production deploys on Vercel — monitored with Sentry and PostHog.",
    tags: ["GCP", "Docker", "Redis", "Vercel"],
  },
  {
    title: "Leadership",
    body: "Sprint planning, code reviews, every Git merge and branch — keeping a team of three shipping consistent, reviewed code.",
    tags: ["Sprints", "Code review", "Git flow"],
  },
];

export const experience = {
  role: "Full-Stack Developer & Tech Lead",
  company: "Wallxy",
  url: "https://wallxy.com",
  period: "03/2024 – Present",
  location: "Nashik",
  intro:
    "Built and maintain a production SaaS platform for design professionals covering collaboration, file management, subscriptions and content discovery.",
  highlights: [
    {
      title: "Led a team of 3 developers",
      body: "Managed sprint planning, conducted code reviews, handled all Git merges and branch management, and kept code quality consistent across the codebase.",
    },
    {
      title: "Owned all infrastructure and deployments",
      body: "Production deployments on Vercel, a Linux VPS running Dockerized backend workers, Google Cloud Console (APIs, Cloud Run, Pub/Sub), and application health via Sentry and PostHog.",
    },
    {
      title: "Architected the full-stack SaaS",
      body: "Projects, teams, gallery, company, blog and QuickDesk modules with RBAC, granular permissions, and clean separation between UI, business logic and data access layers.",
    },
    {
      title: "Production-grade Razorpay integration",
      body: "Full subscription lifecycle (trial → active → expired), ₹1 mandate verification, proration, add-ons, webhook handling, wallet/credits and invoice generation.",
    },
    {
      title: "Async worker infrastructure",
      body: "Google Cloud Pub/Sub and Cloud Run workers for campaign execution, PDF-to-DWG conversion, subscription expiry, email delivery and usage-based billing.",
    },
    {
      title: "Explore feed with Redis caching",
      body: "A multi-type feed (ideas, catalog, gallery, brands, people) with real-time search and trending content from cron-based feed workers.",
    },
    {
      title: "Brand Marketplace, end-to-end",
      body: "Brand profiles, a slug/email-domain system, subscription plan integration and the explore discovery UI.",
    },
    {
      title: "Technical SEO",
      body: "Meta tags, Open Graph, structured data, dynamic sitemaps and page-level optimizations to improve search visibility and indexing.",
    },
    {
      title: "Test coverage that means something",
      body: "Jest (unit + integration) and Playwright (E2E) covering auth flows, payment scenarios and a full 21-day subscription billing lifecycle.",
    },
  ],
  modules: ["Projects", "Teams", "Gallery", "Company", "Blog", "QuickDesk", "Explore", "Brand Marketplace"],
  stack: [
    "Next.js (App Router)", "React", "TypeScript", "Node.js", "Tailwind CSS", "Redux Toolkit (RTK Query)",
    "MongoDB / Mongoose", "Firebase", "Redis", "Docker", "GCP Pub/Sub", "Cloud Run", "Razorpay", "BunnyCDN",
    "Cloudinary", "CloudConvert", "Twilio", "Puppeteer", "Jest", "Playwright",
  ],
};

// The robot in the AI Social Agent section acts out each step with one of these clips.
export type AgentStage = {
  key: string;
  label: string;
  tool: string;
  detail: string;
  animation: string;
};

export const aiAgent = {
  name: "AI Social Agent",
  year: "2026",
  kind: "Personal project",
  status: "Live · private repo",
  headline: "An autonomous agent that writes, voices, edits and publishes a YouTube Short every day.",
  body: "One daily run takes an idea from a queue (or lets the AI pick one), writes a 5–7 scene script, voices it with word-level timings, finds matching vertical footage, renders a captioned 9:16 video with music and motion, uploads it to YouTube, then drops a first comment and files it into a playlist. A secure, installable dashboard shows each step light up live — and a review mode lets me approve, retitle or re-thumbnail before anything goes public.",
  stages: [
    { key: "script", label: "Script", tool: "Gemini / OpenAI", detail: "5–7 scene script, title, alt titles and thumbnail text as strict JSON — learns from which hooks got the most views.", animation: "Idle" },
    { key: "voice", label: "Voice", tool: "ElevenLabs", detail: "Flash v2.5 voice-over with word timings; falls back to the free Gemini voice when quota runs out.", animation: "Yes" },
    { key: "footage", label: "Footage", tool: "Pexels", detail: "A vertical stock clip matched to every scene's visual query.", animation: "Walking" },
    { key: "render", label: "Render", tool: "FFmpeg", detail: "720×1280 render with word-by-word captions, title card, slow pans, progress bar and CC0 music.", animation: "Running" },
    { key: "upload", label: "Upload", tool: "YouTube Data API", detail: "Upload, custom thumbnail, playlist and a first comment asking viewers a question.", animation: "Jump" },
    { key: "save", label: "Save", tool: "MongoDB", detail: "Posts, run history, settings and analytics snapshots — the memory the next script learns from.", animation: "ThumbsUp" },
  ] satisfies AgentStage[],
  highlights: [
    { title: "Fallbacks at every step", body: "Gemini Flash → Flash-Lite (or OpenAI) for scripts, ElevenLabs → Gemini TTS for voice, retries with backoff, and a 3-attempt daily cap so failures never burn credits." },
    { title: "Idempotent scheduling on free infra", body: "Render's free tier sleeps, so GitHub Actions and cron-job.org ping /api/cron hourly — the app posts only when due and never twice a day." },
    { title: "Live step tracker", body: "Server-sent events light up each stage with timers; time left is estimated from past runs, next to logs, run history and voice credits." },
    { title: "Review before publish", body: "Private upload, watch the MP4 in the dashboard, choose one of three titles or thumbnails, then approve & publish." },
    { title: "Hardened sign-in", body: "Passkeys (WebAuthn), signed sessions with sign-out-everywhere, brute-force lockout with email alerts, CSRF origin checks, CSP/HSTS and a 90-day audit log." },
    { title: "Phone app + alerts", body: "Installable PWA with web-push for “ready for review”, “published” and failures; Resend emails and a weekly analytics digest." },
  ],
  metrics: [
    { value: "6", label: "pipeline stages" },
    { value: "4", label: "AI & media APIs orchestrated" },
    { value: "13", label: "node:test suites incl. a real FFmpeg render" },
    { value: "1/day", label: "Shorts, fully automatic" },
  ],
  stack: [
    "Next.js 16", "React 19", "TypeScript", "Tailwind v4", "MongoDB / Mongoose", "Gemini", "OpenAI",
    "ElevenLabs", "Pexels", "FFmpeg", "YouTube Data API", "WebAuthn", "Web Push", "Resend", "GitHub Actions", "Render",
  ],
};

export type Project = {
  slug: string;
  title: string;
  kind: string;
  year: string;
  blurb: string;
  tags: string[];
  href?: string;
  art: "agent" | "billing" | "workers" | "explore" | "finance";
  wide?: boolean;
};

export const projects: Project[] = [
  {
    slug: "ai-social-agent",
    title: "AI Social Agent",
    kind: "Personal",
    year: "2026",
    blurb: "Script → voice → footage → render → upload, every day, with no one at the keyboard. LLM + TTS fallbacks, review mode, passkeys and a PWA dashboard.",
    tags: ["Next.js 16", "Gemini", "ElevenLabs", "FFmpeg", "YouTube API"],
    href: "/work/ai-social-agent",
    art: "agent",
    wide: true,
  },
  {
    slug: "subscription-engine",
    title: "Subscription & Billing Engine",
    kind: "Wallxy",
    year: "2024–",
    blurb: "Razorpay trial → active → expired lifecycle with ₹1 mandates, proration, add-ons, wallet credits, invoices and webhooks — tested across a 21-day billing run.",
    tags: ["Razorpay", "Webhooks", "Playwright"],
    href: "/work/subscription-engine",
    art: "billing",
  },
  {
    slug: "worker-pipelines",
    title: "Async Worker Pipelines",
    kind: "Wallxy",
    year: "2024–",
    blurb: "Pub/Sub topics fanning out to Cloud Run and Dockerized VPS workers: campaigns, PDF→DWG, expiry, email and usage billing.",
    tags: ["GCP Pub/Sub", "Cloud Run", "Docker"],
    href: "/work/worker-pipelines",
    art: "workers",
  },
  {
    slug: "explore-feed",
    title: "Explore Feed & Brand Marketplace",
    kind: "Wallxy",
    year: "2024–",
    blurb: "Multi-type discovery feed with Redis caching, real-time search and cron-built trending, plus brand profiles wired to subscription plans.",
    tags: ["Redis", "Cron workers", "Next.js"],
    art: "explore",
  },
  {
    slug: "finance-dashboard",
    title: "Real-Time Financial Transaction Dashboard",
    kind: "Personal",
    year: "",
    blurb: "A responsive React dashboard with real-time data updates and interactive Chart.js visualizations, state managed with the Context API.",
    tags: ["React", "Chart.js", "Context API"],
    art: "finance",
  },
];

export const services = [
  {
    title: "Business & marketing websites",
    body: "Fast, responsive Next.js sites with technical SEO built in — meta tags, Open Graph, structured data and sitemaps.",
    tags: ["Next.js", "SEO", "Vercel"],
  },
  {
    title: "Web apps & SaaS",
    body: "Dashboards, auth, teams, roles and permissions — full stack from the database schema to the deploy pipeline.",
    tags: ["React", "Node.js", "MongoDB"],
  },
  {
    title: "Payments & subscriptions",
    body: "Razorpay checkouts, mandates, trials, proration, add-ons, invoices and webhooks that survive real billing cycles.",
    tags: ["Razorpay", "Webhooks", "Billing"],
  },
  {
    title: "3D & interactive sites",
    body: "three.js / React Three Fiber experiences like this one — landing pages and product showcases people remember.",
    tags: ["three.js", "R3F", "Motion"],
  },
  {
    title: "Automation & AI agents",
    body: "Background workers, scheduled pipelines and LLM-powered automations that run on their own and alert you when they don't.",
    tags: ["LLMs", "Pub/Sub", "Cron"],
  },
  {
    title: "Infra, DevOps & performance",
    body: "Docker, GCP, Vercel and VPS setups with Sentry and PostHog monitoring, plus Core Web Vitals tuning.",
    tags: ["Docker", "GCP", "Sentry"],
  },
];

export const processSteps = [
  { title: "Share your idea", body: "Fill in the quote form — what you need, your budget and timeline." },
  { title: "Scope & quote", body: "I reply with questions, a clear scope and a fixed quote." },
  { title: "Build in the open", body: "Regular demos on a live preview link, so there are no surprises." },
  { title: "Launch & support", body: "Deploy, SEO and analytics set up, a handover walkthrough, then support." },
];

export type SkillGroup = { name: string; color: string; items: string[] };

export const skills: SkillGroup[] = [
  { name: "Frontend", color: "#5ee7ff", items: ["React.js", "Next.js", "TypeScript", "HTML5", "CSS3", "Tailwind CSS", "JavaScript (ES6+)", "Radix UI", "Framer Motion"] },
  { name: "State", color: "#9b8cff", items: ["Redux Toolkit", "RTK Query", "Redux Persist"] },
  { name: "Backend", color: "#7dffb3", items: ["Node.js", "Express.js", "Next.js API Routes"] },
  { name: "Data & Cloud", color: "#ffb86b", items: ["MongoDB", "Firebase", "Redis", "GCP Pub/Sub", "Cloud Run"] },
  { name: "DevOps", color: "#ff7eb6", items: ["Docker", "Vercel", "Linux VPS", "GCP Console", "Git", "GitHub", "Sentry", "PostHog", "SEO"] },
  { name: "Integrations", color: "#ffe26b", items: ["Razorpay", "BunnyCDN", "Cloudinary", "Twilio", "FCM", "Nodemailer"] },
  { name: "Testing", color: "#c6a6ff", items: ["Jest", "React Testing Library", "Playwright", "Supertest"] },
];

export const education = [
  { degree: "M.Sc. (Computer Science)", school: "A.S.M. College of Science, Pune", period: "2021 – 2023", score: "CGPA 7.73" },
  { degree: "B.Sc. (Computer Science)", school: "HAL College of Commerce and Science, Nashik", period: "08/2018 – 04/2021", score: "71.37%" },
];

export const languages = [
  { name: "English", level: "Professional working proficiency" },
  { name: "Marathi", level: "Native or bilingual proficiency" },
];

export const interests = ["Exploring distant lands", "Feeling the music", "Capturing moments"];

export const whatsappLink = `https://wa.me/${profile.whatsapp}?text=${encodeURIComponent(profile.whatsappMessage)}`;

// Pins on the travel globe. Add the places you've been — kind "visited" shows as a trip.
//   { name: "Goa", country: "India", lat: 15.2993, lon: 74.124, kind: "visited", note: "Monsoon road trip", year: "2025" },
export type Place = {
  name: string;
  country: string;
  lat: number;
  lon: number;
  kind: "home" | "studied" | "visited";
  note?: string;
  year?: string;
};

export const places: Place[] = [
  { name: "Nashik", country: "India", lat: 19.9975, lon: 73.7898, kind: "home", note: "Home, and where I build Wallxy" },
  { name: "Pune", country: "India", lat: 18.5204, lon: 73.8567, kind: "studied", note: "M.Sc. Computer Science", year: "2021–2023" },
];

// Photo gallery. Put images in public/gallery/ and list them here; the gallery stays hidden while this is empty.
//   { src: "/gallery/goa-sunset.jpg", alt: "Sunset over Palolem beach", place: "Goa", width: 1600, height: 1067 },
export type Photo = { src: string; alt: string; place?: string; width: number; height: number };

export const photos: Photo[] = [];

// Background music (CC0 — Loyalty Freak Music). Only downloaded when a visitor turns sound on.
export const music = [
  { src: "/audio/ambient-once-more-with-you.mp3", title: "Once more with you" },
  { src: "/audio/chill-traveling-in-your-mind.mp3", title: "Traveling in your mind" },
  { src: "/audio/ambient-one-cool-minute.mp3", title: "One Cool Minute" },
  { src: "/audio/chill-coexistenz.mp3", title: "Coexistenz" },
];
export const musicArtist = "Loyalty Freak Music (CC0)";

export const nav = [
  { href: "#about", label: "About" },
  { href: "#experience", label: "Experience" },
  { href: "#ai-agent", label: "AI Agent" },
  { href: "#projects", label: "Work" },
  { href: "#skills", label: "Skills" },
  { href: "#services", label: "Services" },
  { href: "#contact", label: "Contact" },
];
