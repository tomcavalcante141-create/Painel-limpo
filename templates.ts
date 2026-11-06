import type { TemplateId } from "./types";

export interface PageTemplate {
  id: TemplateId;
  label: string;
  hint: string;
  panelCount: number;
  /** CSS grid-template-areas, one string per row */
  areas: string[];
  formats?: Array<"manga" | "hq">;
}

export const PAGE_TEMPLATES: PageTemplate[] = [
  {
    id: "splash",
    label: "Splash",
    hint: "Página inteira",
    panelCount: 1,
    areas: ["a"],
  },
  {
    id: "twoV",
    label: "2 faixas",
    hint: "Dois painéis empilhados",
    panelCount: 2,
    areas: ["a", "b"],
  },
  {
    id: "twoH",
    label: "2 colunas",
    hint: "Dois painéis lado a lado",
    panelCount: 2,
    areas: ["a b"],
  },
  {
    id: "threeV",
    label: "3 faixas",
    hint: "Ritmo de leitura vertical",
    panelCount: 3,
    areas: ["a", "b", "c"],
  },
  {
    id: "strip3",
    label: "Tira",
    hint: "Três quadros em faixa",
    panelCount: 3,
    areas: ["a b c"],
    formats: ["hq"],
  },
  {
    id: "widePlus2",
    label: "Faixa + 2",
    hint: "Estabelecimento e corte",
    panelCount: 3,
    areas: ["a a", "b c"],
  },
  {
    id: "invertedL",
    label: "L invertido",
    hint: "Um grande e dois pequenos",
    panelCount: 3,
    areas: ["a a b", "a a c"],
  },
  {
    id: "four",
    label: "Grade 4",
    hint: "Dois por dois",
    panelCount: 4,
    areas: ["a b", "c d"],
  },
  {
    id: "manga5",
    label: "Mangá 5",
    hint: "Página clássica de mangá",
    panelCount: 5,
    areas: ["a a a", "b b c", "d e e"],
    formats: ["manga"],
  },
  {
    id: "six",
    label: "Grade 6",
    hint: "Página densa",
    panelCount: 6,
    areas: ["a b", "c d", "e f"],
  },
];

const AREA_LETTERS = ["a", "b", "c", "d", "e", "f", "g", "h", "i"] as const;

export function templateById(id: TemplateId): PageTemplate {
  return PAGE_TEMPLATES.find((t) => t.id === id) ?? PAGE_TEMPLATES[0]!;
}

export function templatesFor(format: "manga" | "hq"): PageTemplate[] {
  return PAGE_TEMPLATES.filter((t) => !t.formats || t.formats.includes(format));
}

export function defaultTemplateFor(panelCount: number, format: "manga" | "hq"): TemplateId {
  const pool = templatesFor(format);
  const exact = pool.find((t) => t.panelCount === panelCount);
  if (exact) return exact.id;
  if (panelCount <= 1) return "splash";
  if (panelCount === 2) return format === "hq" ? "twoH" : "twoV";
  if (panelCount === 3) return format === "manga" ? "widePlus2" : "threeV";
  if (panelCount === 4) return "four";
  if (panelCount === 5) return format === "manga" ? "manga5" : "six";
  return "six";
}

export function panelArea(index: number): string {
  return AREA_LETTERS[index] ?? "a";
}

export function gridTemplateAreas(template: PageTemplate): string {
  return template.areas.map((row) => `"${row}"`).join(" ");
}

export type ImageAspect = "1:1" | "16:9" | "9:16" | "3:4" | "4:3" | "3:2" | "2:3";

/** Aspect ratio of a panel slot on a portrait page, so generated art fits the gutter. */
export function slotAspect(template: PageTemplate, index: number): ImageAspect {
  const letter = panelArea(index);
  const rows = template.areas.map((row) => row.split(/\s+/));
  const cols = rows[0]?.length ?? 1;
  let minR = Infinity;
  let maxR = -1;
  let minC = Infinity;
  let maxC = -1;
  rows.forEach((cells, r) => {
    cells.forEach((cell, c) => {
      if (cell !== letter) return;
      minR = Math.min(minR, r);
      maxR = Math.max(maxR, r);
      minC = Math.min(minC, c);
      maxC = Math.max(maxC, c);
    });
  });
  if (maxR < 0) return "3:4";
  const cellW = ((maxC - minC + 1) / cols) * 3;
  const cellH = ((maxR - minR + 1) / rows.length) * 4;
  const ar = cellW / cellH;
  if (ar > 1.7) return "16:9";
  if (ar > 1.35) return "3:2";
  if (ar > 1.08) return "4:3";
  if (ar > 0.92) return "1:1";
  if (ar > 0.72) return "3:4";
  if (ar > 0.55) return "2:3";
  return "9:16";
}
