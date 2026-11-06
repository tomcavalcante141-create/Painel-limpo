import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  BalloonType,
  Format,
  Page,
  Project,
  ProjectKind,
  TemplateId,
} from "./types";
import {
  makeBalloon,
  makeChapter,
  makeCharacter,
  makeNote,
  makePage,
  makePanel,
  makePlace,
  makeProject,
  makeRule,
} from "./factories";
import { createSampleProject } from "./seed";
import { defaultTemplateFor } from "./templates";
import { now, uid } from "./utils";

type ProjectPatch = Partial<Pick<Project, "title" | "format" | "kind" | "logline" | "artStyle">>;

interface StudioState {
  projects: Project[];
  seeded: boolean;
  ensureSeed: () => void;
  createProject: (input: {
    title: string;
    format: Format;
    kind: ProjectKind;
    logline?: string;
  }) => string;
  deleteProject: (id: string) => void;
  duplicateProject: (id: string) => string | null;
  importProject: (project: Project) => string;
  updateProject: (id: string, patch: ProjectPatch) => void;
  touch: (id: string) => void;

  setCurrentChapter: (projectId: string, chapterId: string) => void;
  addChapter: (projectId: string) => void;
  renameChapter: (projectId: string, chapterId: string, title: string) => void;
  deleteChapter: (projectId: string, chapterId: string) => void;

  addPage: (projectId: string, afterPageId?: string, template?: TemplateId) => string | null;
  deletePage: (projectId: string, pageId: string) => void;
  movePage: (projectId: string, pageId: string, dir: -1 | 1) => void;
  setPageTemplate: (projectId: string, pageId: string, template: TemplateId) => void;
  setPageNote: (projectId: string, pageId: string, note: string) => void;

  addPanel: (projectId: string, pageId: string, afterPanelId?: string) => void;
  deletePanel: (projectId: string, pageId: string, panelId: string) => void;
  movePanel: (projectId: string, pageId: string, panelId: string, dir: -1 | 1) => void;
  reorderPanels: (projectId: string, pageId: string, fromIndex: number, toIndex: number) => void;
  setPanelDescription: (projectId: string, pageId: string, panelId: string, description: string) => void;
  setPanelAnnotation: (projectId: string, pageId: string, panelId: string, annotation: string) => void;

  addBalloon: (projectId: string, pageId: string, panelId: string, type: BalloonType) => void;
  updateBalloon: (
    projectId: string,
    pageId: string,
    panelId: string,
    balloonId: string,
    patch: Partial<{ type: BalloonType; speaker: string; text: string }>,
  ) => void;
  deleteBalloon: (projectId: string, pageId: string, panelId: string, balloonId: string) => void;

  addCharacter: (projectId: string) => void;
  updateCharacter: (projectId: string, characterId: string, patch: Partial<Project["characters"][number]>) => void;
  deleteCharacter: (projectId: string, characterId: string) => void;
  addRelation: (projectId: string, characterId: string, targetId: string, label: string) => void;
  deleteRelation: (projectId: string, characterId: string, targetId: string) => void;

  addPlace: (projectId: string) => void;
  updatePlace: (projectId: string, placeId: string, patch: Partial<Project["places"][number]>) => void;
  deletePlace: (projectId: string, placeId: string) => void;

  addRule: (projectId: string) => void;
  updateRule: (projectId: string, ruleId: string, patch: Partial<Project["worldRules"][number]>) => void;
  deleteRule: (projectId: string, ruleId: string) => void;

  addTimeline: (projectId: string) => void;
  updateTimeline: (projectId: string, eventId: string, patch: Partial<Project["timeline"][number]>) => void;
  deleteTimeline: (projectId: string, eventId: string) => void;

  addBeat: (projectId: string, actId: string) => void;
  updateBeat: (projectId: string, actId: string, beatId: string, patch: Partial<{ title: string; summary: string }>) => void;
  deleteBeat: (projectId: string, actId: string, beatId: string) => void;
  renameAct: (projectId: string, actId: string, title: string) => void;

  addNote: (projectId: string) => void;
  updateNote: (projectId: string, noteId: string, patch: Partial<{ title: string; body: string }>) => void;
  deleteNote: (projectId: string, noteId: string) => void;

  saveVersion: (projectId: string, label?: string) => void;
  restoreVersion: (projectId: string, versionId: string) => void;
  deleteVersion: (projectId: string, versionId: string) => void;
}

function mapProject(projects: Project[], id: string, fn: (p: Project) => Project): Project[] {
  return projects.map((p) => (p.id === id ? { ...fn(p), updatedAt: now() } : p));
}

function mapChapter(project: Project, fn: (ch: Project["chapters"][number]) => Project["chapters"][number]): Project {
  const chapterId = project.currentChapterId;
  return {
    ...project,
    chapters: project.chapters.map((ch) => (ch.id === chapterId ? fn(ch) : ch)),
  };
}

function currentChapter(project: Project) {
  return project.chapters.find((c) => c.id === project.currentChapterId) ?? project.chapters[0];
}

export function getProject(projects: Project[], id: string): Project | undefined {
  return projects.find((p) => p.id === id);
}

export const useStudioStore = create<StudioState>()(
  persist(
    (set, get) => ({
      projects: [],
      seeded: false,

      ensureSeed: () => {
        if (get().seeded) return;
        set({ projects: [createSampleProject()], seeded: true });
      },

      createProject: (input) => {
        const project = makeProject(input);
        set({ projects: [project, ...get().projects] });
        return project.id;
      },

      deleteProject: (id) => {
        set({ projects: get().projects.filter((p) => p.id !== id) });
      },

      duplicateProject: (id) => {
        const src = getProject(get().projects, id);
        if (!src) return null;
        const copy: Project = JSON.parse(JSON.stringify(src)) as Project;
        const remap = new Map<string, string>();
        const nextId = () => {
          const n = uid();
          return n;
        };
        copy.id = nextId();
        copy.title = `${src.title} (cópia)`;
        copy.createdAt = now();
        copy.updatedAt = now();
        copy.versions = [];
        copy.chapters = copy.chapters.map((ch) => {
          const nid = nextId();
          remap.set(ch.id, nid);
          return {
            ...ch,
            id: nid,
            pages: ch.pages.map((page) => ({
              ...page,
              id: nextId(),
              panels: page.panels.map((panel) => ({
                ...panel,
                id: nextId(),
                balloons: panel.balloons.map((b) => ({ ...b, id: nextId() })),
              })),
            })),
          };
        });
        copy.currentChapterId = remap.get(src.currentChapterId) ?? copy.chapters[0]!.id;
        copy.characters = copy.characters.map((c) => {
          const nid = nextId();
          remap.set(c.id, nid);
          return { ...c, id: nid };
        });
        copy.characters = copy.characters.map((c) => ({
          ...c,
          relations: c.relations.map((r) => ({
            ...r,
            targetId: remap.get(r.targetId) ?? r.targetId,
          })),
        }));
        copy.places = copy.places.map((p) => ({ ...p, id: nextId() }));
        copy.worldRules = copy.worldRules.map((r) => ({ ...r, id: nextId() }));
        copy.timeline = copy.timeline.map((e) => ({ ...e, id: nextId() }));
        copy.outline = copy.outline.map((a) => ({
          ...a,
          id: nextId(),
          beats: a.beats.map((b) => ({ ...b, id: nextId() })),
        }));
        copy.notes = copy.notes.map((n) => ({ ...n, id: nextId() }));
        set({ projects: [copy, ...get().projects] });
        return copy.id;
      },

      importProject: (project) => {
        const incoming: Project = { ...project, id: project.id || uid(), updatedAt: now() };
        if (get().projects.some((p) => p.id === incoming.id)) incoming.id = uid();
        set({ projects: [incoming, ...get().projects] });
        return incoming.id;
      },

      updateProject: (id, patch) => {
        set({
          projects: mapProject(get().projects, id, (p) => ({ ...p, ...patch })),
        });
      },

      touch: (id) => {
        set({
          projects: get().projects.map((p) => (p.id === id ? { ...p, updatedAt: now() } : p)),
        });
      },

      setCurrentChapter: (projectId, chapterId) => {
        set({
          projects: mapProject(get().projects, projectId, (p) => ({ ...p, currentChapterId: chapterId })),
        });
      },

      addChapter: (projectId) => {
        set({
          projects: mapProject(get().projects, projectId, (p) => {
            const n = p.chapters.length + 1;
            const ch = makeChapter(`Capítulo ${n}`, p.format);
            return { ...p, chapters: [...p.chapters, ch], currentChapterId: ch.id, kind: "serial" };
          }),
        });
      },

      renameChapter: (projectId, chapterId, title) => {
        set({
          projects: mapProject(get().projects, projectId, (p) => ({
            ...p,
            chapters: p.chapters.map((c) => (c.id === chapterId ? { ...c, title } : c)),
          })),
        });
      },

      deleteChapter: (projectId, chapterId) => {
        set({
          projects: mapProject(get().projects, projectId, (p) => {
            if (p.chapters.length <= 1) return p;
            const chapters = p.chapters.filter((c) => c.id !== chapterId);
            return {
              ...p,
              chapters,
              currentChapterId: p.currentChapterId === chapterId ? chapters[0]!.id : p.currentChapterId,
            };
          }),
        });
      },

      addPage: (projectId, afterPageId, template) => {
        let created: string | null = null;
        set({
          projects: mapProject(get().projects, projectId, (p) =>
            mapChapter(p, (ch) => {
              const page = makePage(template ?? defaultTemplateFor(1, p.format));
              created = page.id;
              if (!afterPageId) return { ...ch, pages: [...ch.pages, page] };
              const idx = ch.pages.findIndex((pg) => pg.id === afterPageId);
              const pages = [...ch.pages];
              pages.splice(idx + 1, 0, page);
              return { ...ch, pages };
            }),
          ),
        });
        return created;
      },

      deletePage: (projectId, pageId) => {
        set({
          projects: mapProject(get().projects, projectId, (p) =>
            mapChapter(p, (ch) => {
              if (ch.pages.length <= 1) return ch;
              return { ...ch, pages: ch.pages.filter((pg) => pg.id !== pageId) };
            }),
          ),
        });
      },

      movePage: (projectId, pageId, dir) => {
        set({
          projects: mapProject(get().projects, projectId, (p) =>
            mapChapter(p, (ch) => {
              const i = ch.pages.findIndex((pg) => pg.id === pageId);
              const j = i + dir;
              if (i < 0 || j < 0 || j >= ch.pages.length) return ch;
              const pages = [...ch.pages];
              const [item] = pages.splice(i, 1);
              pages.splice(j, 0, item!);
              return { ...ch, pages };
            }),
          ),
        });
      },

      setPageTemplate: (projectId, pageId, template) => {
        set({
          projects: mapProject(get().projects, projectId, (p) =>
            mapChapter(p, (ch) => ({
              ...ch,
              pages: ch.pages.map((pg) => (pg.id === pageId ? { ...pg, template } : pg)),
            })),
          ),
        });
      },

      setPageNote: (projectId, pageId, note) => {
        set({
          projects: mapProject(get().projects, projectId, (p) =>
            mapChapter(p, (ch) => ({
              ...ch,
              pages: ch.pages.map((pg) => (pg.id === pageId ? { ...pg, note } : pg)),
            })),
          ),
        });
      },

      addPanel: (projectId, pageId, afterPanelId) => {
        set({
          projects: mapProject(get().projects, projectId, (p) =>
            mapChapter(p, (ch) => ({
              ...ch,
              pages: ch.pages.map((pg) => {
                if (pg.id !== pageId) return pg;
                const panel = makePanel();
                const panels = [...pg.panels];
                if (!afterPanelId) panels.push(panel);
                else {
                  const idx = panels.findIndex((x) => x.id === afterPanelId);
                  panels.splice(idx + 1, 0, panel);
                }
                const template = defaultTemplateFor(panels.length, p.format);
                return { ...pg, panels, template };
              }),
            })),
          ),
        });
      },

      deletePanel: (projectId, pageId, panelId) => {
        set({
          projects: mapProject(get().projects, projectId, (p) =>
            mapChapter(p, (ch) => ({
              ...ch,
              pages: ch.pages.map((pg) => {
                if (pg.id !== pageId || pg.panels.length <= 1) return pg;
                const panels = pg.panels.filter((x) => x.id !== panelId);
                return { ...pg, panels, template: defaultTemplateFor(panels.length, p.format) };
              }),
            })),
          ),
        });
      },

      movePanel: (projectId, pageId, panelId, dir) => {
        set({
          projects: mapProject(get().projects, projectId, (p) =>
            mapChapter(p, (ch) => ({
              ...ch,
              pages: ch.pages.map((pg) => {
                if (pg.id !== pageId) return pg;
                const i = pg.panels.findIndex((x) => x.id === panelId);
                const j = i + dir;
                if (i < 0 || j < 0 || j >= pg.panels.length) return pg;
                const panels = [...pg.panels];
                const [item] = panels.splice(i, 1);
                panels.splice(j, 0, item!);
                return { ...pg, panels };
              }),
            })),
          ),
        });
      },

      reorderPanels: (projectId, pageId, fromIndex, toIndex) => {
        set({
          projects: mapProject(get().projects, projectId, (p) =>
            mapChapter(p, (ch) => ({
              ...ch,
              pages: ch.pages.map((pg) => {
                if (pg.id !== pageId) return pg;
                if (fromIndex === toIndex) return pg;
                if (fromIndex < 0 || toIndex < 0 || fromIndex >= pg.panels.length || toIndex >= pg.panels.length) {
                  return pg;
                }
                const panels = [...pg.panels];
                const [item] = panels.splice(fromIndex, 1);
                panels.splice(toIndex, 0, item!);
                return { ...pg, panels };
              }),
            })),
          ),
        });
      },

      setPanelDescription: (projectId, pageId, panelId, description) => {
        set({
          projects: mapProject(get().projects, projectId, (p) =>
            mapChapter(p, (ch) => ({
              ...ch,
              pages: ch.pages.map((pg) =>
                pg.id !== pageId
                  ? pg
                  : {
                      ...pg,
                      panels: pg.panels.map((pan) => (pan.id === panelId ? { ...pan, description } : pan)),
                    },
              ),
            })),
          ),
        });
      },

      setPanelAnnotation: (projectId, pageId, panelId, annotation) => {
        set({
          projects: mapProject(get().projects, projectId, (p) =>
            mapChapter(p, (ch) => ({
              ...ch,
              pages: ch.pages.map((pg) =>
                pg.id !== pageId
                  ? pg
                  : {
                      ...pg,
                      panels: pg.panels.map((pan) => (pan.id === panelId ? { ...pan, annotation } : pan)),
                    },
              ),
            })),
          ),
        });
      },

      addBalloon: (projectId, pageId, panelId, type) => {
        set({
          projects: mapProject(get().projects, projectId, (p) =>
            mapChapter(p, (ch) => ({
              ...ch,
              pages: ch.pages.map((pg) =>
                pg.id !== pageId
                  ? pg
                  : {
                      ...pg,
                      panels: pg.panels.map((pan) =>
                        pan.id !== panelId ? pan : { ...pan, balloons: [...pan.balloons, makeBalloon(type)] },
                      ),
                    },
              ),
            })),
          ),
        });
      },

      updateBalloon: (projectId, pageId, panelId, balloonId, patch) => {
        set({
          projects: mapProject(get().projects, projectId, (p) =>
            mapChapter(p, (ch) => ({
              ...ch,
              pages: ch.pages.map((pg) =>
                pg.id !== pageId
                  ? pg
                  : {
                      ...pg,
                      panels: pg.panels.map((pan) =>
                        pan.id !== panelId
                          ? pan
                          : {
                              ...pan,
                              balloons: pan.balloons.map((b) => (b.id === balloonId ? { ...b, ...patch } : b)),
                            },
                      ),
                    },
              ),
            })),
          ),
        });
      },

      deleteBalloon: (projectId, pageId, panelId, balloonId) => {
        set({
          projects: mapProject(get().projects, projectId, (p) =>
            mapChapter(p, (ch) => ({
              ...ch,
              pages: ch.pages.map((pg) =>
                pg.id !== pageId
                  ? pg
                  : {
                      ...pg,
                      panels: pg.panels.map((pan) =>
                        pan.id !== panelId
                          ? pan
                          : { ...pan, balloons: pan.balloons.filter((b) => b.id !== balloonId) },
                      ),
                    },
              ),
            })),
          ),
        });
      },

      addCharacter: (projectId) => {
        set({
          projects: mapProject(get().projects, projectId, (p) => ({
            ...p,
            characters: [...p.characters, makeCharacter("Novo personagem")],
          })),
        });
      },

      updateCharacter: (projectId, characterId, patch) => {
        set({
          projects: mapProject(get().projects, projectId, (p) => ({
            ...p,
            characters: p.characters.map((c) => (c.id === characterId ? { ...c, ...patch } : c)),
          })),
        });
      },

      deleteCharacter: (projectId, characterId) => {
        set({
          projects: mapProject(get().projects, projectId, (p) => ({
            ...p,
            characters: p.characters
              .filter((c) => c.id !== characterId)
              .map((c) => ({ ...c, relations: c.relations.filter((r) => r.targetId !== characterId) })),
          })),
        });
      },

      addRelation: (projectId, characterId, targetId, label) => {
        if (!targetId || characterId === targetId) return;
        set({
          projects: mapProject(get().projects, projectId, (p) => ({
            ...p,
            characters: p.characters.map((c) => {
              if (c.id !== characterId) return c;
              if (c.relations.some((r) => r.targetId === targetId)) return c;
              return { ...c, relations: [...c.relations, { targetId, label }] };
            }),
          })),
        });
      },

      deleteRelation: (projectId, characterId, targetId) => {
        set({
          projects: mapProject(get().projects, projectId, (p) => ({
            ...p,
            characters: p.characters.map((c) =>
              c.id !== characterId ? c : { ...c, relations: c.relations.filter((r) => r.targetId !== targetId) },
            ),
          })),
        });
      },

      addPlace: (projectId) => {
        set({
          projects: mapProject(get().projects, projectId, (p) => ({
            ...p,
            places: [...p.places, makePlace("Novo lugar")],
          })),
        });
      },

      updatePlace: (projectId, placeId, patch) => {
        set({
          projects: mapProject(get().projects, projectId, (p) => ({
            ...p,
            places: p.places.map((x) => (x.id === placeId ? { ...x, ...patch } : x)),
          })),
        });
      },

      deletePlace: (projectId, placeId) => {
        set({
          projects: mapProject(get().projects, projectId, (p) => ({
            ...p,
            places: p.places.filter((x) => x.id !== placeId),
          })),
        });
      },

      addRule: (projectId) => {
        set({
          projects: mapProject(get().projects, projectId, (p) => ({
            ...p,
            worldRules: [...p.worldRules, makeRule("Nova regra")],
          })),
        });
      },

      updateRule: (projectId, ruleId, patch) => {
        set({
          projects: mapProject(get().projects, projectId, (p) => ({
            ...p,
            worldRules: p.worldRules.map((x) => (x.id === ruleId ? { ...x, ...patch } : x)),
          })),
        });
      },

      deleteRule: (projectId, ruleId) => {
        set({
          projects: mapProject(get().projects, projectId, (p) => ({
            ...p,
            worldRules: p.worldRules.filter((x) => x.id !== ruleId),
          })),
        });
      },

      addTimeline: (projectId) => {
        set({
          projects: mapProject(get().projects, projectId, (p) => ({
            ...p,
            timeline: [...p.timeline, { id: uid(), title: "Evento", when: "", body: "" }],
          })),
        });
      },

      updateTimeline: (projectId, eventId, patch) => {
        set({
          projects: mapProject(get().projects, projectId, (p) => ({
            ...p,
            timeline: p.timeline.map((x) => (x.id === eventId ? { ...x, ...patch } : x)),
          })),
        });
      },

      deleteTimeline: (projectId, eventId) => {
        set({
          projects: mapProject(get().projects, projectId, (p) => ({
            ...p,
            timeline: p.timeline.filter((x) => x.id !== eventId),
          })),
        });
      },

      addBeat: (projectId, actId) => {
        set({
          projects: mapProject(get().projects, projectId, (p) => ({
            ...p,
            outline: p.outline.map((a) =>
              a.id !== actId ? a : { ...a, beats: [...a.beats, { id: uid(), title: "Beat", summary: "" }] },
            ),
          })),
        });
      },

      updateBeat: (projectId, actId, beatId, patch) => {
        set({
          projects: mapProject(get().projects, projectId, (p) => ({
            ...p,
            outline: p.outline.map((a) =>
              a.id !== actId
                ? a
                : { ...a, beats: a.beats.map((b) => (b.id === beatId ? { ...b, ...patch } : b)) },
            ),
          })),
        });
      },

      deleteBeat: (projectId, actId, beatId) => {
        set({
          projects: mapProject(get().projects, projectId, (p) => ({
            ...p,
            outline: p.outline.map((a) =>
              a.id !== actId ? a : { ...a, beats: a.beats.filter((b) => b.id !== beatId) },
            ),
          })),
        });
      },

      renameAct: (projectId, actId, title) => {
        set({
          projects: mapProject(get().projects, projectId, (p) => ({
            ...p,
            outline: p.outline.map((a) => (a.id === actId ? { ...a, title } : a)),
          })),
        });
      },

      addNote: (projectId) => {
        set({
          projects: mapProject(get().projects, projectId, (p) => ({
            ...p,
            notes: [makeNote("Nota solta"), ...p.notes],
          })),
        });
      },

      updateNote: (projectId, noteId, patch) => {
        set({
          projects: mapProject(get().projects, projectId, (p) => ({
            ...p,
            notes: p.notes.map((n) => (n.id === noteId ? { ...n, ...patch, updatedAt: now() } : n)),
          })),
        });
      },

      deleteNote: (projectId, noteId) => {
        set({
          projects: mapProject(get().projects, projectId, (p) => ({
            ...p,
            notes: p.notes.filter((n) => n.id !== noteId),
          })),
        });
      },

      saveVersion: (projectId, label) => {
        set({
          projects: mapProject(get().projects, projectId, (p) => {
            const ch = currentChapter(p);
            if (!ch) return p;
            const snap = {
              id: uid(),
              label: label?.trim() || `Versão ${p.versions.length + 1}`,
              createdAt: now(),
              chapterId: ch.id,
              pages: JSON.parse(JSON.stringify(ch.pages)) as Page[],
            };
            return { ...p, versions: [snap, ...p.versions].slice(0, 30) };
          }),
        });
      },

      restoreVersion: (projectId, versionId) => {
        set({
          projects: mapProject(get().projects, projectId, (p) => {
            const snap = p.versions.find((v) => v.id === versionId);
            if (!snap) return p;
            return {
              ...p,
              currentChapterId: p.chapters.some((c) => c.id === snap.chapterId)
                ? snap.chapterId
                : p.currentChapterId,
              chapters: p.chapters.map((c) =>
                c.id === snap.chapterId ? { ...c, pages: JSON.parse(JSON.stringify(snap.pages)) as Page[] } : c,
              ),
            };
          }),
        });
      },

      deleteVersion: (projectId, versionId) => {
        set({
          projects: mapProject(get().projects, projectId, (p) => ({
            ...p,
            versions: p.versions.filter((v) => v.id !== versionId),
          })),
        });
      },
    }),
    {
      name: "painel-studio-v1",
      skipHydration: true,
      partialize: (s) => ({ projects: s.projects, seeded: s.seeded }),
    },
  ),
);

export function currentChapterOf(project: Project) {
  return project.chapters.find((c) => c.id === project.currentChapterId) ?? project.chapters[0];
}
