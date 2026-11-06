import type { Balloon, Chapter, Page, Project } from "./types";

export interface PageStats {
  panels: number;
  balloons: number;
  dialogue: number;
  thoughts: number;
  captions: number;
  sfx: number;
  words: number;
  emptyPanels: number;
  density: "leve" | "boa" | "falada" | "densa";
  hints: string[];
}

export interface ProjectStats {
  pages: number;
  panels: number;
  balloons: number;
  characters: number;
  words: number;
  chapters: number;
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function balloonWords(balloons: Balloon[]): number {
  return balloons.reduce((n, b) => n + wordCount(b.text), 0);
}

export function pageStats(page: Page, format: "manga" | "hq"): PageStats {
  const balloons = page.panels.flatMap((p) => p.balloons);
  const dialogue = balloons.filter((b) => b.type === "dialogue").length;
  const thoughts = balloons.filter((b) => b.type === "thought").length;
  const captions = balloons.filter((b) => b.type === "caption").length;
  const sfx = balloons.filter((b) => b.type === "sfx").length;
  const words = balloonWords(balloons) + page.panels.reduce((n, p) => n + wordCount(p.description), 0);
  const emptyPanels = page.panels.filter((p) => !p.description.trim()).length;
  const balloonCount = balloons.length;
  const perPanel = page.panels.length ? balloonCount / page.panels.length : 0;

  let density: PageStats["density"] = "boa";
  if (balloonCount <= 2 && page.panels.length <= 2) density = "leve";
  if (balloonCount >= 8 || perPanel >= 3.2) density = "falada";
  if (balloonCount >= 12 || words >= 220) density = "densa";

  const hints: string[] = [];
  const balloonCap = format === "manga" ? 7 : 9;
  if (balloonCount > balloonCap) {
    hints.push(
      format === "manga"
        ? "Página muito falada para mangá. Quebre em mais painéis ou corte diálogo."
        : "Muitos balões nesta página. Considere cortar ou espalhar em outra página.",
    );
  }
  const heavy = page.panels.find((p) => p.balloons.filter((b) => b.type !== "sfx").length >= 4);
  if (heavy) {
    hints.push("Um painel está carregado de texto. Divida a ação em dois quadros.");
  }
  if (emptyPanels > 0) {
    hints.push(
      emptyPanels === 1
        ? "Há um painel sem descrição visual."
        : `${emptyPanels} painéis ainda sem descrição visual.`,
    );
  }
  if (page.panels.length === 1 && balloonCount >= 5) {
    hints.push("Splash com muito texto. O leitor precisa de ar — ou de mais quadros.");
  }
  if (dialogue === 0 && page.panels.length >= 3 && sfx === 0 && captions === 0) {
    hints.push("Página muda. Se for intencional, anote o silêncio na legenda.");
  }

  return {
    panels: page.panels.length,
    balloons: balloonCount,
    dialogue,
    thoughts,
    captions,
    sfx,
    words,
    emptyPanels,
    density,
    hints,
  };
}

export function chapterStats(chapter: Chapter): Omit<ProjectStats, "characters" | "chapters"> {
  const pages = chapter.pages.length;
  const panels = chapter.pages.reduce((n, p) => n + p.panels.length, 0);
  const balloons = chapter.pages.reduce(
    (n, p) => n + p.panels.reduce((m, pan) => m + pan.balloons.length, 0),
    0,
  );
  const words = chapter.pages.reduce((n, page) => {
    return (
      n +
      page.panels.reduce((m, pan) => m + wordCount(pan.description) + balloonWords(pan.balloons), 0)
    );
  }, 0);
  return { pages, panels, balloons, words };
}

export function projectStats(project: Project): ProjectStats {
  const base = project.chapters.reduce(
    (acc, ch) => {
      const s = chapterStats(ch);
      return {
        pages: acc.pages + s.pages,
        panels: acc.panels + s.panels,
        balloons: acc.balloons + s.balloons,
        words: acc.words + s.words,
      };
    },
    { pages: 0, panels: 0, balloons: 0, words: 0 },
  );
  return {
    ...base,
    characters: project.characters.length,
    chapters: project.chapters.length,
  };
}

export const DENSITY_LABELS: Record<PageStats["density"], string> = {
  leve: "Leve",
  boa: "Equilibrada",
  falada: "Falada",
  densa: "Densa",
};
