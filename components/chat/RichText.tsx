import Link from "next/link";
import type { ReactNode } from "react";

// Renders the small Markdown subset the assistant uses (paragraphs, bullets, **bold**,
// _italic_, [links](url)) as React elements — never as raw HTML.

const SAFE_URL = /^(\/|#|https:\/\/|mailto:)/;

function inline(text: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*|_([^_]+)_/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const key = `${keyBase}-${i++}`;
    if (m[1] && m[2]) {
      const href = m[2];
      if (!SAFE_URL.test(href)) out.push(m[1]);
      else if (href.startsWith("/") || href.startsWith("#"))
        out.push(
          <Link key={key} href={href} className="text-cyan underline underline-offset-2">
            {m[1]}
          </Link>,
        );
      else
        out.push(
          <a key={key} href={href} target="_blank" rel="noopener noreferrer" className="text-cyan underline underline-offset-2">
            {m[1]}
          </a>,
        );
    } else if (m[3]) out.push(<strong key={key} className="font-semibold text-ink">{m[3]}</strong>);
    else if (m[4]) out.push(<em key={key} className="text-muted">{m[4]}</em>);
    last = re.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export default function RichText({ text }: { text: string }) {
  const blocks = text.trim().split(/\n{2,}/);
  return (
    <>
      {blocks.map((block, b) => {
        const lines = block.split("\n");
        const bullets = lines.every((l) => /^\s*[-*•]\s+/.test(l));
        if (bullets)
          return (
            <ul key={b} className="my-2 list-disc space-y-1 pl-5 first:mt-0 last:mb-0">
              {lines.map((l, i) => (
                <li key={i}>{inline(l.replace(/^\s*[-*•]\s+/, ""), `${b}-${i}`)}</li>
              ))}
            </ul>
          );
        return (
          <p key={b} className="my-2 first:mt-0 last:mb-0">
            {lines.map((l, i) => (
              <span key={i}>
                {i > 0 && <br />}
                {inline(l.replace(/^\s*[-*•]\s+/, "• "), `${b}-${i}`)}
              </span>
            ))}
          </p>
        );
      })}
    </>
  );
}
