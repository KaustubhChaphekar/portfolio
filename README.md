# Kaustubh Chaphekar — 3D Portfolio

A Next.js 16 portfolio with real-time 3D (React Three Fiber + three.js), case studies, an AI assistant that answers questions about my work, and a quote form that emails every request to me.

## What's inside

- **Hero**: a noise-displaced shader core, orbit rings, a particle galaxy and bloom. It follows the cursor and drifts away on scroll.
- **AI Social Agent**: an animated robot (CC0, Quaternius) acts out each pipeline step in sync with a clickable stepper.
- **Case studies** at `/work/[slug]`, each with an architecture diagram, key decisions and its own Open Graph image. The content lives in [`lib/case-studies.ts`](lib/case-studies.ts).
- **Skills sphere**: a draggable 3D cloud of skills; hovering a category lights up its words.
- **Off-screen**: a travel globe with pins you can fly between, an ambient-music card, and a photo gallery with a lightbox.
- **Ask my AI**: a chat widget powered by Claude (`claude-opus-5`, low effort, streaming, prompt-cached). It answers only from this site's data.
- **Reaching me**: a quote form with email via Resend (plus an optional auto-reply), a WhatsApp button, an optional booking link, and Vercel Analytics events.
- **Sound**: ambient music toggle (CC0 tracks, downloaded only when switched on) and soft UI blips.
- **Fallbacks for weak devices**: devices with no GPU, low memory, data-saver or reduced motion get still images of every scene and never download three.js. Visitors can also switch 3D on or off in the footer.

## Edit the content

| What | Where |
|---|---|
| Profile, experience, projects, skills, services, education | [`lib/data.ts`](lib/data.ts) |
| WhatsApp number, booking link, pronouns (used by the AI) | `profile` in `lib/data.ts` |
| Travel pins | `places` in `lib/data.ts` |
| Photos | Put images in `public/gallery/` and list them in `photos` in `lib/data.ts` (the gallery hides while this is empty) |
| Case studies | [`lib/case-studies.ts`](lib/case-studies.ts) |
| Résumé | Replace `public/Kaustubh_Chaphekar_Resume.pdf` |
| What the AI knows and how it answers | [`lib/chat-prompt.ts`](lib/chat-prompt.ts) (built from the files above) |

## Run locally

```bash
npm install
cp .env.example .env.local   # fill in the keys you want to test
npm run dev                  # http://localhost:3000
```

Checks: `npm run lint`, `npm run typecheck`, `npm run build`.

Useful URLs:

- `?effects=on`, `?effects=off` and `?effects=auto` force the 3D mode (the choice is remembered).
- `/work/ai-social-agent`, `/work/subscription-engine` and `/work/worker-pipelines` are the case studies.

### Regenerating the still images

If you change a 3D scene, refresh its still twin in `public/fallback/`:

```bash
npm run build && npm start      # terminal 1
npm run capture:fallbacks       # terminal 2 (needs Chrome or Edge installed)
```

## Environment variables

| Variable | Needed for | Notes |
|---|---|---|
| `RESEND_API_KEY` | Quote form | Same key as the AI Social Agent. Until it's set, the form asks people to email you instead. |
| `ANTHROPIC_API_KEY` | Ask my AI | The chat button appears only when this is set at build time. Set a spend limit in the Anthropic Console. |
| `QUOTE_TO_EMAIL` | optional | Defaults to the email in `lib/data.ts`. |
| `QUOTE_FROM_EMAIL` | optional | Set to an address on your verified domain to turn on visitor auto-replies. |
| `CHAT_DAILY_LIMIT` | optional | Chat messages per server instance per day (default 400). |
| `NEXT_PUBLIC_SITE_URL` | optional | Your custom domain, for SEO. Vercel's URL is used otherwise. |

## Deploy to Vercel

1. The code is on GitHub at `KaustubhChaphekar/portfolio`.
2. On [vercel.com/new](https://vercel.com/new), import that repo. Vercel detects Next.js; keep the default build settings.
3. Under **Settings → Environment Variables**, add `RESEND_API_KEY` and `ANTHROPIC_API_KEY`, then **Redeploy**.
4. Under **Analytics** and **Speed Insights**, click **Enable**. Page views, Core Web Vitals and events (`quote_submitted`, `chat_opened`, `whatsapp_click`, `resume_download`) start flowing in. Custom events need a Pro plan; page views and Web Vitals work on Hobby.
5. Once you buy a domain, add it under **Settings → Domains**, set `NEXT_PUBLIC_SITE_URL`, verify the domain in Resend and set `QUOTE_FROM_EMAIL`.

Every push to `main` redeploys automatically.

## Performance

Lighthouse on a local production build (headless Chrome, which renders WebGL in software):

| Page | Performance | Accessibility | Best practices | SEO |
|---|---|---|---|---|
| Home, desktop | 97 | 100 | 100 | 100 |
| Home, mobile | 84 | 100 | 100 | 100 |
| Case study, desktop | 100 | 100 | 100 | 100 |
| Case study, mobile | 94 | 100 | 100 | 100 |

How the site stays fast:

- The hero text animates with CSS, so it paints before any JavaScript runs.
- The hero shows a still image first. On larger screens the live scene boots when the browser is idle, then crossfades in.
- The GPU check runs only when a 3D section is close to the viewport.
- Off-screen sections use `content-visibility: auto`.
- CSS is inlined, and body text uses the system font.

## Credits

- Robot: "RobotExpressive" by [Tomás Laulhé / Quaternius](https://quaternius.com), CC0, via the three.js examples
- Studio HDRI: [Poly Haven](https://polyhaven.com) `studio_small_09`, CC0
- Music: Loyalty Freak Music, CC0
- Earth land mask: three.js examples (`earth_specular_2048.jpg`)
- Fonts: Space Grotesk and JetBrains Mono (Google Fonts, OFL)

`legacy-static-site/` holds the earlier HTML/CSS portfolio. Next.js doesn't serve it; delete it whenever you like.
