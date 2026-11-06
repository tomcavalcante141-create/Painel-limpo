import { BALLOON_LABELS, FORMAT_LABELS, KIND_LABELS, type Balloon, type Page, type Project } from "./types";

function balloonLine(b: Balloon): string {
  if (b.type === "sfx") return `SFX: ${b.text || "—"}`;
  if (b.type === "caption") return `LEGENDA: ${b.text || "—"}`;
  if (b.type === "thought") {
    const who = b.speaker.trim() || "???";
    return `${who} (pensamento): ${b.text || "—"}`;
  }
  const who = b.speaker.trim() || "???";
  return `${who}: ${b.text || "—"}`;
}

export function pageToMarkdown(page: Page, pageNumber: number, options?: { panelsOnly?: boolean }): string {
  const lines: string[] = [`## Página ${pageNumber}`];
  if (page.note.trim() && !options?.panelsOnly) {
    lines.push(`*Nota: ${page.note.trim()}*`, "");
  }
  page.panels.forEach((panel, i) => {
    lines.push(`### Painel ${i + 1}`);
    lines.push(panel.description.trim() || "_(sem descrição visual)_");
    if (!options?.panelsOnly) {
      for (const b of panel.balloons) {
        if (b.text.trim() || b.speaker.trim()) lines.push(`- ${balloonLine(b)}`);
      }
      if (panel.annotation.trim()) lines.push(`- _Anotação: ${panel.annotation.trim()}_`);
    }
    lines.push("");
  });
  return lines.join("\n");
}

export function projectToMarkdown(project: Project, options?: { panelsOnly?: boolean }): string {
  const header = [
    `# ${project.title}`,
    "",
    `**Formato:** ${FORMAT_LABELS[project.format]} · **Tipo:** ${KIND_LABELS[project.kind]}`,
    project.logline.trim() ? `**Logline:** ${project.logline.trim()}` : "",
    "",
  ].filter((l) => l !== "");

  const body = project.chapters.flatMap((ch) => {
    const block = [`# ${ch.title}`, ""];
    ch.pages.forEach((page, i) => {
      block.push(pageToMarkdown(page, i + 1, options));
    });
    return block;
  });

  if (!options?.panelsOnly && project.characters.length) {
    body.push("# Personagens", "");
    for (const c of project.characters) {
      body.push(`## ${c.name}`);
      if (c.role) body.push(`*${c.role}*`);
      if (c.appearance) body.push(`**Aparência:** ${c.appearance}`);
      if (c.personality) body.push(`**Personalidade:** ${c.personality}`);
      if (c.notes) body.push(c.notes);
      body.push("");
    }
  }

  return [...header, ...body].join("\n").trim() + "\n";
}

export function projectToPlainText(project: Project, options?: { panelsOnly?: boolean }): string {
  return projectToMarkdown(project, options)
    .replace(/^#+\s/gm, "")
    .replace(/\*\*/g, "")
    .replace(/\*/g, "");
}

export function printHtml(project: Project, options?: { panelsOnly?: boolean }): string {
  const mdish = projectToMarkdown(project, options);
  const escaped = mdish
    .replace(/&/g, "&")
    .replace(/</g, "<")
    .replace(/>/g, ">");
  const htmlBody = escaped
    .split("\n")
    .map((line) => {
      if (line.startsWith("# ")) return `<h1>${line.slice(2)}</h1>`;
      if (line.startsWith("## ")) return `<h2>${line.slice(3)}</h2>`;
      if (line.startsWith("### ")) return `<h3>${line.slice(4)}</h3>`;
      if (line.startsWith("- ")) return `<p class="line">${line.slice(2)}</p>`;
      if (!line.trim()) return "";
      return `<p>${line}</p>`;
    })
    .join("\n");

  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>${project.title} — Painel</title>
  <style>
    @page { margin: 18mm 16mm; }
    body { font-family: "Source Serif 4", Georgia, serif; color: #1b1814; background: #fff; max-width: 720px; margin: 0 auto; padding: 32px 24px; line-height: 1.5; }
    h1 { font-family: Fraunces, Georgia, serif; font-size: 28px; margin: 0 0 8px; }
    h2 { font-size: 18px; margin: 28px 0 8px; letter-spacing: 0.04em; text-transform: uppercase; }
    h3 { font-size: 14px; margin: 16px 0 4px; color: #3d4f4b; }
    p { margin: 0 0 6px; }
    p.line { padding-left: 16px; }
    .meta { color: #6d655b; font-size: 13px; margin-bottom: 24px; }
  </style>
</head>
<body>
  ${htmlBody}
</body>
</html>`;
}

export function printProject(project: Project, options?: { panelsOnly?: boolean }) {
  const html = printHtml(project, options);
  const frame = document.createElement("iframe");
  frame.setAttribute("aria-hidden", "true");
  frame.style.position = "fixed";
  frame.style.right = "0";
  frame.style.bottom = "0";
  frame.style.width = "0";
  frame.style.height = "0";
  frame.style.border = "0";
  document.body.appendChild(frame);
  const doc = frame.contentDocument;
  if (!doc) {
    frame.remove();
    return;
  }
  doc.open();
  doc.write(html);
  doc.close();
  const run = () => {
    frame.contentWindow?.focus();
    frame.contentWindow?.print();
    setTimeout(() => frame.remove(), 1000);
  };
  if (frame.contentWindow?.document.readyState === "complete") run();
  else frame.onload = run;
}
