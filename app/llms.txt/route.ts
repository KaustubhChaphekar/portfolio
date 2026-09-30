import { caseStudies } from "@/lib/case-studies";
import { aiAgent, education, experience, profile, services, skills, whatsappLink } from "@/lib/data";
import { productionUrl } from "@/lib/site";

// /llms.txt — a plain-text summary for AI assistants and AI search engines (llmstxt.org).
export const dynamic = "force-static";

export function GET() {
  const body = `# ${profile.name}

> ${profile.role} based in ${profile.location}. ${profile.tagline}

${profile.summary}

## Experience
- ${experience.role}, ${experience.company} (${experience.url}), ${experience.period}. ${experience.intro}
${experience.highlights.map((h) => `  - ${h.title}: ${h.body}`).join("\n")}

## Featured project: ${aiAgent.name}
${aiAgent.headline} ${aiAgent.body}

## Case studies
${caseStudies.map((c) => `- [${c.title}](${productionUrl}/work/${c.slug}): ${c.subtitle}`).join("\n")}

## Skills
${skills.map((g) => `- ${g.name}: ${g.items.join(", ")}`).join("\n")}

## Services (freelance)
${services.map((s) => `- ${s.title}: ${s.body}`).join("\n")}

## Education
${education.map((e) => `- ${e.degree}, ${e.school} (${e.period})`).join("\n")}

## Contact
- Website: ${productionUrl}
- Quote request: ${productionUrl}/#quote
- Email: ${profile.email}
- WhatsApp: ${whatsappLink}
- LinkedIn: ${profile.linkedin}
- GitHub: ${profile.github}
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
