import { useMemo, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  BookOpen,
  ChevronLeft,
  Copy,
  Focus,
  Map as MapIcon,
  Plus,
  Users,
  StickyNote,
  History,
  LayoutGrid,
} from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { ExportMenu } from "@/components/export-menu";
import { PagePreview } from "@/components/page-preview";
import { ScriptEditor } from "@/components/script-editor";
import {
  CharactersPanel,
  NotesPanel,
  OutlinePanel,
  VersionsPanel,
  WorldPanel,
} from "@/components/story-tools";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { currentChapterOf, useStudioStore } from "@/lib/store";
import { projectStats } from "@/lib/stats";
import { FORMAT_LABELS, type Project, type WorkspaceTab } from "@/lib/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const TABS: { id: WorkspaceTab; label: string; icon: typeof BookOpen }[] = [
  { id: "script", label: "Roteiro", icon: BookOpen },
  { id: "characters", label: "Elenco", icon: Users },
  { id: "world", label: "Mundo", icon: MapIcon },
  { id: "outline", label: "Estrutura", icon: LayoutGrid },
  { id: "notes", label: "Notas", icon: StickyNote },
  { id: "versions", label: "Versões", icon: History },
];

export function Workspace({ project }: { project: Project }) {
  const [tab, setTab] = useState<WorkspaceTab>("script");
  const [pageId, setPageId] = useState(currentChapterOf(project)?.pages[0]?.id ?? "");
  const [panelId, setPanelId] = useState<string | undefined>();
  const [focus, setFocus] = useState(false);
  const [mobilePane, setMobilePane] = useState<"pages" | "script" | "preview">("script");

  const updateProject = useStudioStore((s) => s.updateProject);
  const addPage = useStudioStore((s) => s.addPage);
  const addChapter = useStudioStore((s) => s.addChapter);
  const setCurrentChapter = useStudioStore((s) => s.setCurrentChapter);
  const renameChapter = useStudioStore((s) => s.renameChapter);
  const duplicateProject = useStudioStore((s) => s.duplicateProject);
  const saveVersion = useStudioStore((s) => s.saveVersion);

  const chapter = currentChapterOf(project);
  const pages = chapter?.pages ?? [];
  const activePage = pages.find((p) => p.id === pageId) ?? pages[0];
  const pageNumber = activePage ? pages.findIndex((p) => p.id === activePage.id) + 1 : 1;
  const stats = useMemo(() => projectStats(project), [project]);

  function goPage(id: string) {
    setPageId(id);
    setPanelId(undefined);
    setTab("script");
    setMobilePane("script");
  }

  return (
    <div className="flex h-dvh flex-col bg-bg text-fg">
      <header className="flex shrink-0 items-center gap-2 border-b border-border bg-surface px-3 py-2 md:px-4">
        <Link
          to="/studio"
          className="flex size-11 items-center justify-center rounded-md text-muted hover:bg-inset hover:text-fg"
          aria-label="Voltar ao estúdio"
        >
          <ChevronLeft className="size-5" />
        </Link>
        <BrandMark compact className="hidden sm:inline-flex" />
        <Input
          value={project.title}
          onChange={(e) => updateProject(project.id, { title: e.target.value })}
          className="h-11 max-w-56 border-0 bg-transparent font-display text-lg shadow-none md:max-w-xs"
          aria-label="Título do roteiro"
        />
        <button
          type="button"
          onClick={() => updateProject(project.id, { format: project.format === "manga" ? "hq" : "manga" })}
          className="hidden sm:inline-flex"
        >
          <Badge variant="outline">{FORMAT_LABELS[project.format]}</Badge>
        </button>
        <span className="hidden font-mono text-xs tabular-nums text-subtle lg:inline">
          {stats.pages} pág. · {stats.panels} painéis · {stats.balloons} balões
        </span>
        <div className="ml-auto flex items-center gap-1">
          <Button
            variant={focus ? "default" : "ghost"}
            size="icon-sm"
            onClick={() => setFocus((v) => !v)}
            aria-label="Modo foco"
            className="hidden md:inline-flex"
          >
            <Focus />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="hidden md:inline-flex"
            aria-label="Duplicar"
            onClick={() => {
              const id = duplicateProject(project.id);
              if (id) toast.success("Cópia criada no estúdio");
            }}
          >
            <Copy />
          </Button>
          <Button variant="ghost" size="sm" className="hidden md:inline-flex" onClick={() => saveVersion(project.id)}>
            Versão
          </Button>
          <ExportMenu project={project} />
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {!focus ? (
          <aside className="hidden w-56 shrink-0 flex-col border-r border-border bg-surface md:flex">
            <ScrollArea className="flex-1">
              <div className="p-3">
                <p className="px-1 text-xs font-medium uppercase tracking-[0.14em] text-muted">Capítulo</p>
                <select
                  className="mt-2 h-10 w-full rounded-md bg-inset px-2 text-sm"
                  value={project.currentChapterId}
                  onChange={(e) => {
                    setCurrentChapter(project.id, e.target.value);
                    const ch = project.chapters.find((c) => c.id === e.target.value);
                    if (ch?.pages[0]) goPage(ch.pages[0].id);
                  }}
                >
                  {project.chapters.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
                {chapter ? (
                  <Input
                    className="mt-2 h-9"
                    value={chapter.title}
                    onChange={(e) => renameChapter(project.id, chapter.id, e.target.value)}
                    aria-label="Nome do capítulo"
                  />
                ) : null}
                <Button variant="ghost" size="sm" className="mt-1 w-full justify-start" onClick={() => addChapter(project.id)}>
                  <Plus />
                  Capítulo
                </Button>

                <p className="mt-5 px-1 text-xs font-medium uppercase tracking-[0.14em] text-muted">Páginas</p>
                <ol className="mt-2 space-y-1">
                  {pages.map((p, i) => (
                    <li key={p.id}>
                      <button
                        type="button"
                        onClick={() => goPage(p.id)}
                        className={cn(
                          "flex w-full items-center justify-between rounded-md px-2 py-2 text-left text-sm",
                          activePage?.id === p.id ? "bg-primary text-primary-fg" : "hover:bg-inset",
                        )}
                      >
                        <span>Pág. {i + 1}</span>
                        <span className="font-mono text-xs tabular-nums opacity-70">{p.panels.length}</span>
                      </button>
                    </li>
                  ))}
                </ol>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 w-full"
                  onClick={() => {
                    const id = addPage(project.id, activePage?.id);
                    if (id) goPage(id);
                  }}
                >
                  <Plus />
                  Página
                </Button>
              </div>
            </ScrollArea>
            <nav className="grid grid-cols-3 gap-1 border-t border-border p-2">
              {TABS.map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    type="button"
                    title={t.label}
                    onClick={() => setTab(t.id)}
                    className={cn(
                      "flex h-11 flex-col items-center justify-center rounded-md text-micro",
                      tab === t.id ? "bg-inset text-fg" : "text-muted hover:bg-inset/60 hover:text-fg",
                    )}
                  >
                    <Icon className="size-4" />
                    {t.label}
                  </button>
                );
              })}
            </nav>
          </aside>
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex gap-1 overflow-x-auto border-b border-border px-2 py-2 md:hidden">
            {TABS.map((t) => (
              <Button key={t.id} size="sm" variant={tab === t.id ? "default" : "ghost"} onClick={() => setTab(t.id)}>
                {t.label}
              </Button>
            ))}
          </div>

          {tab === "script" ? (
            <>
              <div className="flex gap-1 border-b border-border px-2 py-2 lg:hidden">
                <PaneChip active={mobilePane === "pages"} onClick={() => setMobilePane("pages")}>
                  Páginas
                </PaneChip>
                <PaneChip active={mobilePane === "script"} onClick={() => setMobilePane("script")}>
                  Texto
                </PaneChip>
                <PaneChip active={mobilePane === "preview"} onClick={() => setMobilePane("preview")}>
                  Página
                </PaneChip>
              </div>
              <div className="flex min-h-0 flex-1">
                <ScrollArea className={cn("min-h-0 flex-1", mobilePane !== "script" && "hidden lg:block")}>
                  {activePage ? (
                    <ScriptEditor
                      projectId={project.id}
                      page={activePage}
                      pageNumber={pageNumber}
                      format={project.format}
                      characters={project.characters}
                      artStyle={project.artStyle ?? ""}
                      selectedPanelId={panelId}
                      onSelectPanel={setPanelId}
                    />
                  ) : (
                    <p className="p-8 text-sm text-muted">Nenhuma página neste capítulo.</p>
                  )}
                </ScrollArea>
                {!focus ? (
                  <aside
                    className={cn(
                      "w-full shrink-0 overflow-y-auto border-l border-border bg-inset/40 p-4 lg:w-80",
                      mobilePane !== "preview" && "hidden lg:block",
                    )}
                  >
                    {activePage ? (
                      <PagePreview
                        projectId={project.id}
                        page={activePage}
                        pageNumber={pageNumber}
                        format={project.format}
                        characters={project.characters}
                        artStyle={project.artStyle ?? ""}
                        selectedPanelId={panelId}
                        onSelectPanel={setPanelId}
                      />
                    ) : null}
                  </aside>
                ) : null}
                <aside className={cn("w-full overflow-y-auto p-3 lg:hidden", mobilePane !== "pages" && "hidden")}>
                  <ol className="space-y-1">
                    {pages.map((p, i) => (
                      <li key={p.id}>
                        <button
                          type="button"
                          onClick={() => goPage(p.id)}
                          className={cn(
                            "flex w-full items-center justify-between rounded-md px-3 py-3 text-left",
                            activePage?.id === p.id ? "bg-primary text-primary-fg" : "bg-surface",
                          )}
                        >
                          Página {i + 1}
                          <span className="font-mono text-xs">{p.panels.length}</span>
                        </button>
                      </li>
                    ))}
                  </ol>
                  <Button
                    className="mt-3 w-full"
                    variant="outline"
                    onClick={() => {
                      const id = addPage(project.id, activePage?.id);
                      if (id) goPage(id);
                    }}
                  >
                    <Plus />
                    Página
                  </Button>
                </aside>
              </div>
            </>
          ) : (
            <ScrollArea className="min-h-0 flex-1">
              {tab === "characters" ? <CharactersPanel project={project} /> : null}
              {tab === "world" ? <WorldPanel project={project} /> : null}
              {tab === "outline" ? <OutlinePanel project={project} /> : null}
              {tab === "notes" ? <NotesPanel project={project} /> : null}
              {tab === "versions" ? <VersionsPanel project={project} /> : null}
            </ScrollArea>
          )}
        </div>
      </div>
    </div>
  );
}

function PaneChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-10 rounded-md px-3 text-sm",
        active ? "bg-primary text-primary-fg" : "text-muted hover:bg-inset",
      )}
    >
      {children}
    </button>
  );
}
