export type Format = "manga" | "hq";
export type ProjectKind = "oneshot" | "serial";
export type BalloonType = "dialogue" | "thought" | "caption" | "sfx";
export type WorkspaceTab = "script" | "characters" | "world" | "outline" | "notes" | "versions";

export type TemplateId =
  | "splash"
  | "twoV"
  | "twoH"
  | "threeV"
  | "widePlus2"
  | "invertedL"
  | "four"
  | "manga5"
  | "six"
  | "strip3";

export interface Balloon {
  id: string;
  type: BalloonType;
  speaker: string;
  text: string;
}

export interface Panel {
  id: string;
  description: string;
  annotation: string;
  balloons: Balloon[];
}

export interface Page {
  id: string;
  template: TemplateId;
  note: string;
  panels: Panel[];
}

export interface Chapter {
  id: string;
  title: string;
  pages: Page[];
}

export interface CharacterRelation {
  targetId: string;
  label: string;
}

export interface Character {
  id: string;
  name: string;
  role: string;
  appearance: string;
  personality: string;
  notes: string;
  relations: CharacterRelation[];
}

export interface Place {
  id: string;
  name: string;
  description: string;
}

export interface WorldRule {
  id: string;
  title: string;
  body: string;
}

export interface TimelineEvent {
  id: string;
  title: string;
  when: string;
  body: string;
}

export interface Beat {
  id: string;
  title: string;
  summary: string;
}

export interface Act {
  id: string;
  title: string;
  beats: Beat[];
}

export interface Note {
  id: string;
  title: string;
  body: string;
  updatedAt: number;
}

export interface VersionSnapshot {
  id: string;
  label: string;
  createdAt: number;
  chapterId: string;
  pages: Page[];
}

export interface Project {
  id: string;
  title: string;
  format: Format;
  kind: ProjectKind;
  logline: string;
  artStyle: string;
  createdAt: number;
  updatedAt: number;
  currentChapterId: string;
  chapters: Chapter[];
  characters: Character[];
  places: Place[];
  worldRules: WorldRule[];
  timeline: TimelineEvent[];
  outline: Act[];
  notes: Note[];
  versions: VersionSnapshot[];
}

export const BALLOON_LABELS: Record<BalloonType, string> = {
  dialogue: "Diálogo",
  thought: "Pensamento",
  caption: "Legenda",
  sfx: "SFX",
};

export const FORMAT_LABELS: Record<Format, string> = {
  manga: "Mangá",
  hq: "HQ ocidental",
};

export const KIND_LABELS: Record<ProjectKind, string> = {
  oneshot: "One-shot",
  serial: "Capítulos",
};
