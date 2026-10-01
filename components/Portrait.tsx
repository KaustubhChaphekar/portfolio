import Image from "next/image";
// Imported only for its blur placeholder; the page uses the stable public URL below, so Google
// sees the same image address on the page, in the sitemap and in the structured data.
import portraitFile from "@/public/me/kaustubh-chaphekar.jpg";
import { experience, profile } from "@/lib/data";
import { TiltCard } from "./ui";

export const portraitAlt = `${profile.name}, ${profile.role.toLowerCase()} based in ${profile.location}`;

// Photo card for the About section: gradient border, tilt toward the cursor, and a light
// sheen that sweeps across on hover.
export default function Portrait() {
  return (
    <TiltCard className="mx-auto w-full max-w-[380px] rounded-[2rem]">
      <figure className="relative rounded-[2rem] bg-gradient-to-br from-cyan/70 via-violet/60 to-pink/70 p-[1.5px] shadow-[0_40px_90px_-35px_rgb(155_140_255/0.55)]">
        <div className="relative overflow-hidden rounded-[calc(2rem-1.5px)] bg-bg">
          <Image
            src={profile.photo}
            alt={portraitAlt}
            width={1254}
            height={1254}
            placeholder="blur"
            blurDataURL={portraitFile.blurDataURL}
            sizes="(min-width: 1024px) 380px, 80vw"
            className="aspect-[4/5] w-full object-cover object-[50%_35%] transition-transform duration-700 group-hover:scale-[1.03]"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg via-bg/5 to-transparent" aria-hidden />
          <div
            className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(115deg,transparent_35%,rgb(255_255_255/0.14)_50%,transparent_65%)] transition-transform duration-1000 group-hover:translate-x-full"
            aria-hidden
          />
          <figcaption className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
            <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-mint/30 bg-bg/60 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-mint backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-mint" /> Open to opportunities
            </span>
            <p className="font-display text-xl font-semibold tracking-tight">{profile.name}</p>
            <p className="mt-0.5 text-sm text-ink/70">
              Tech Lead @ {experience.company} · {profile.location}
            </p>
          </figcaption>
        </div>
      </figure>
    </TiltCard>
  );
}

// Small round photo, used next to the hero's role line.
export function Avatar({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <span
      className={`relative inline-flex shrink-0 rounded-full bg-gradient-to-br from-cyan via-violet to-pink p-[1.5px] ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src={profile.photo}
        alt={profile.name}
        width={size * 2}
        height={size * 2}
        sizes={`${size}px`}
        className="h-full w-full rounded-full object-cover object-[50%_30%]"
        priority
      />
    </span>
  );
}
