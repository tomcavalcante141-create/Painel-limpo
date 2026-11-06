import type {
  Act,
  Balloon,
  BalloonType,
  Chapter,
  Character,
  Format,
  Note,
  Page,
  Panel,
  Place,
  Project,
  ProjectKind,
  TemplateId,
  WorldRule,
} from "./types";
import { uid, now } from "./utils";
import { defaultTemplateFor } from "./templates";

export function makeBalloon(type: BalloonType, speaker = "", text = ""): Balloon {
  return { id: uid(), type, speaker, text };
}

export function makePanel(description = "", balloons: Balloon[] = []): Panel {
  return { id: uid(), description, annotation: "", balloons };
}

export function makePage(template: TemplateId, panels?: Panel[]): Page {
  return {
    id: uid(),
    template,
    note: "",
    panels: panels ?? [makePanel()],
  };
}

export function makeChapter(title: string, format: Format, pages?: Page[]): Chapter {
  return {
    id: uid(),
    title,
    pages: pages ?? [makePage(defaultTemplateFor(1, format))],
  };
}

export function makeCharacter(name: string, role = ""): Character {
  return {
    id: uid(),
    name,
    role,
    appearance: "",
    personality: "",
    notes: "",
    relations: [],
  };
}

export function makePlace(name: string, description = ""): Place {
  return { id: uid(), name, description };
}

export function makeRule(title: string, body = ""): WorldRule {
  return { id: uid(), title, body };
}

export function makeNote(title = "Nota", body = ""): Note {
  return { id: uid(), title, body, updatedAt: now() };
}

export function defaultOutline(): Act[] {
  return [
    { id: uid(), title: "Começo", beats: [] },
    { id: uid(), title: "Conflito", beats: [] },
    { id: uid(), title: "Clímax", beats: [] },
    { id: uid(), title: "Resolução", beats: [] },
  ];
}

export function makeProject(input: {
  title: string;
  format: Format;
  kind: ProjectKind;
  logline?: string;
}): Project {
  const chapter = makeChapter(input.kind === "oneshot" ? "One-shot" : "Capítulo 1", input.format);
  const t = now();
  return {
    id: uid(),
    title: input.title.trim() || "Sem título",
    format: input.format,
    kind: input.kind,
    logline: input.logline?.trim() ?? "",
    artStyle: "",
    createdAt: t,
    updatedAt: t,
    currentChapterId: chapter.id,
    chapters: [chapter],
    characters: [],
    places: [],
    worldRules: [],
    timeline: [],
    outline: defaultOutline(),
    notes: [],
    versions: [],
  };
}
