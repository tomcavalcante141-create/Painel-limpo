import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  ImagePlus,
  MessageSquare,
  Plus,
  Sparkles,
  StickyNote,
  Trash2,
  Volume2,
} from "lucide-react";
import { AutoTextarea } from "@/components/auto-textarea";
import { runCreatePanelImage, useImageJob, usePanelImageMap } from "@/components/use-page-art";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { suggestScript } from "@/lib/ai";
import { deletePanelImage } from "@/lib/panel-images";
import { DENSITY_LABELS, pageStats } from "@/lib/stats";
import { useStudioStore } from "@/lib/store";
import { slotAspect, templateById, templatesFor } from "@/lib/templates";
import {
  BALLOON_LABELS,
  type BalloonType,
  type Character,
  type Format,
  type Page,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const BALLOON_TYPES: BalloonType[] = ["dialogue", "thought", "caption", "sfx"];

export function ScriptEditor({
  projectId,
  page,
  pageNumber,
  format,
  characters,
  artStyle,
  selectedPanelId,
  onSelectPanel,
}: {
  projectId: string;
  page: Page;
  pageNumber: number;
  format: Format;
  characters: Character[];
  artStyle: string;
  selectedPanelId?: string;
  onSelectPanel: (id: string) => void;
}) {
  const stats = pageStats(page, format);
  const setPageTemplate = useStudioStore((s) => s.setPageTemplate);
  const setPageNote = useStudioStore((s) => s.setPageNote);
  const addPanel = useStudioStore((s) => s.addPanel);
  const deletePage = useStudioStore((s) => s.deletePage);
  const [busy, setBusy] = useState(false);

  async function askRhythm() {
    setBusy(true);
    try {
      const context = page.panels
        .map((p, i) => {
          const balls = p.balloons.map((b) => `${b.type}${b.speaker ? ` ${b.speaker}` : ""}: ${b.text}`).join(" | ");
          return `Painel ${i + 1}: ${p.description || "(vazio)"} // ${balls || "sem balões"}`;
        })
        .join("\n");
      const res = await suggestScript({ data: { kind: "rhythm", format, context } });
      if (res.ok) toast.message("Ritmo da página", { description: res.text });
      else toast.error(res.error);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 md:px-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">Página {pageNumber}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <Badge variant={stats.density === "falada" || stats.density === "densa" ? "warn" : "ok"}>
              {DENSITY_LABELS[stats.density]}
            </Badge>
            <span className="font-mono text-xs tabular-nums text-subtle">
              {stats.panels} painéis · {stats.balloons} balões
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Layout
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {templatesFor(format).map((t) => (
                <DropdownMenuItem key={t.id} onClick={() => setPageTemplate(projectId, page.id, t.id)}>
                  {t.label}
                  <span className="ml-auto text-xs text-muted">{t.panelCount}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm" onClick={askRhythm} disabled={busy}>
            <Sparkles />
            Ritmo
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => deletePage(projectId, page.id)}
            aria-label="Apagar página"
          >
            <Trash2 />
          </Button>
        </div>
      </div>

      {stats.hints.length > 0 ? (
        <ul className="mt-4 space-y-1 rounded-lg bg-warn/10 px-3 py-2 text-sm text-warn">
          {stats.hints.map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ul>
      ) : null}

      <div className="mt-4">
        <AutoTextarea
          value={page.note}
          onChange={(v) => setPageNote(projectId, page.id, v)}
          placeholder="Nota da página (virada, silêncio, referência para o artista)…"
          className="bg-inset/60 text-sm"
        />
      </div>

      <ol className="mt-6 space-y-8">
        {page.panels.map((panel, i) => (
          <li key={panel.id}>
            <PanelBlock
              projectId={projectId}
              pageId={page.id}
              panel={panel}
              index={i}
              format={format}
              characters={characters}
              artStyle={artStyle}
              aspect={slotAspect(templateById(page.template), i)}
              selected={panel.id === selectedPanelId}
              onSelect={() => onSelectPanel(panel.id)}
              canDelete={page.panels.length > 1}
              canMoveUp={i > 0}
              canMoveDown={i < page.panels.length - 1}
            />
          </li>
        ))}
      </ol>

      <div className="mt-6">
        <Button variant="outline" onClick={() => addPanel(projectId, page.id)}>
          <Plus />
          Painel
        </Button>
      </div>
    </div>
  );
}

function PanelBlock({
  projectId,
  pageId,
  panel,
  index,
  format,
  characters,
  artStyle,
  aspect,
  selected,
  onSelect,
  canDelete,
  canMoveUp,
  canMoveDown,
}: {
  projectId: string;
  pageId: string;
  panel: Page["panels"][number];
  index: number;
  format: Format;
  characters: Character[];
  artStyle: string;
  aspect: ReturnType<typeof slotAspect>;
  selected: boolean;
  onSelect: () => void;
  canDelete: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
}) {
  const setPanelDescription = useStudioStore((s) => s.setPanelDescription);
  const setPanelAnnotation = useStudioStore((s) => s.setPanelAnnotation);
  const addBalloon = useStudioStore((s) => s.addBalloon);
  const deletePanel = useStudioStore((s) => s.deletePanel);
  const movePanel = useStudioStore((s) => s.movePanel);
  const addPanel = useStudioStore((s) => s.addPanel);
  const [busy, setBusy] = useState(false);
  const [showNote, setShowNote] = useState(Boolean(panel.annotation));
  const imageJob = useImageJob();
  const images = usePanelImageMap([panel.id]);
  const shot = images[panel.id];

  async function expand() {
    setBusy(true);
    try {
      const res = await suggestScript({
        data: {
          kind: "expand",
          format,
          context: panel.description || "Painel sem descrição. Invente uma ação concreta, cinematográfica, curta.",
        },
      });
      if (res.ok) setPanelDescription(projectId, pageId, panel.id, res.text);
      else toast.error(res.error);
    } finally {
      setBusy(false);
    }
  }

  return (
    <article
      onClick={onSelect}
      className={cn(
        "rounded-xl bg-surface p-4 shadow-border transition-[box-shadow] duration-150",
        selected && "shadow-border-hover",
      )}
    >
      <header className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">Painel {index + 1}</p>
        <div className="flex items-center">
          <Button variant="ghost" size="icon-sm" disabled={!canMoveUp} onClick={() => movePanel(projectId, pageId, panel.id, -1)} aria-label="Subir painel">
            <ChevronUp />
          </Button>
          <Button variant="ghost" size="icon-sm" disabled={!canMoveDown} onClick={() => movePanel(projectId, pageId, panel.id, 1)} aria-label="Descer painel">
            <ChevronDown />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={() => setShowNote((v) => !v)} aria-label="Anotação">
            <StickyNote />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            disabled={!canDelete}
            onClick={() => {
              void deletePanelImage(panel.id);
              deletePanel(projectId, pageId, panel.id);
            }}
            aria-label="Apagar painel"
          >
            <Trash2 />
          </Button>
        </div>
      </header>

      <p className="mt-3 text-xs font-medium text-muted">O que o leitor vê</p>
      <AutoTextarea
        value={panel.description}
        onChange={(v) => setPanelDescription(projectId, pageId, panel.id, v)}
        placeholder="Plano, ação, cenário, expressão…"
        className="mt-1 paper-rule min-h-24"
      />
      <div className="mt-2 flex flex-wrap justify-end gap-1">
        <Button
          variant="outline"
          size="sm"
          disabled={Boolean(imageJob)}
          onClick={() =>
            void runCreatePanelImage({ panel, format, artStyle, characters, aspect })
          }
        >
          <ImagePlus />
          {imageJob === panel.id ? "Criando…" : shot ? "Refazer imagem" : "Criar imagem"}
        </Button>
        <Button variant="ghost" size="sm" onClick={expand} disabled={busy}>
          <Sparkles />
          Expandir descrição
        </Button>
      </div>
      {shot ? (
        <img
          src={shot}
          alt=""
          className="mt-3 aspect-video w-full rounded-md object-cover outline outline-1 -outline-offset-1 outline-fg/10"
        />
      ) : null}

      {showNote ? (
        <AutoTextarea
          value={panel.annotation}
          onChange={(v) => setPanelAnnotation(projectId, pageId, panel.id, v)}
          placeholder="Anotação para o artista ou para você…"
          className="mt-2 bg-inset/70"
        />
      ) : null}

      <div className="mt-4 space-y-3">
        {panel.balloons.map((b) => (
          <BalloonRow
            key={b.id}
            projectId={projectId}
            pageId={pageId}
            panelId={panel.id}
            balloon={b}
            characters={characters}
            format={format}
          />
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {BALLOON_TYPES.map((t) => (
          <Button key={t} variant="outline" size="sm" onClick={() => addBalloon(projectId, pageId, panel.id, t)}>
            {t === "sfx" ? <Volume2 /> : <MessageSquare />}
            {BALLOON_LABELS[t]}
          </Button>
        ))}
        <Button variant="ghost" size="sm" onClick={() => addPanel(projectId, pageId, panel.id)}>
          <Plus />
          Painel abaixo
        </Button>
      </div>
    </article>
  );
}

function BalloonRow({
  projectId,
  pageId,
  panelId,
  balloon,
  characters,
  format,
}: {
  projectId: string;
  pageId: string;
  panelId: string;
  balloon: Page["panels"][number]["balloons"][number];
  characters: Character[];
  format: Format;
}) {
  const updateBalloon = useStudioStore((s) => s.updateBalloon);
  const deleteBalloon = useStudioStore((s) => s.deleteBalloon);
  const [busy, setBusy] = useState(false);
  const names = characters.map((c) => c.name).filter(Boolean);
  const datalistId = `speakers-${panelId}`;

  async function altDialogue() {
    setBusy(true);
    try {
      const res = await suggestScript({
        data: {
          kind: "dialogue",
          format,
          context: `${balloon.type} ${balloon.speaker}: ${balloon.text || "(vazio)"}`,
        },
      });
      if (res.ok) toast.message("Alternativas", { description: res.text });
      else toast.error(res.error);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-lg bg-inset/80 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={balloon.type}
          onChange={(e) =>
            updateBalloon(projectId, pageId, panelId, balloon.id, { type: e.target.value as BalloonType })
          }
          className="h-9 rounded-md bg-surface px-2 text-xs font-medium text-fg shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-fg)_14%,transparent)]"
        >
          {BALLOON_TYPES.map((t) => (
            <option key={t} value={t}>
              {BALLOON_LABELS[t]}
            </option>
          ))}
        </select>
        {balloon.type === "dialogue" || balloon.type === "thought" ? (
          <>
            <Input
              list={datalistId}
              value={balloon.speaker}
              onChange={(e) => updateBalloon(projectId, pageId, panelId, balloon.id, { speaker: e.target.value })}
              placeholder="Quem fala"
              className="h-9 max-w-40"
            />
            <datalist id={datalistId}>
              {names.map((n) => (
                <option key={n} value={n} />
              ))}
            </datalist>
          </>
        ) : null}
        <div className="ml-auto flex">
          {(balloon.type === "dialogue" || balloon.type === "thought") && balloon.text ? (
            <Button variant="ghost" size="icon-sm" onClick={altDialogue} disabled={busy} aria-label="Sugerir fala">
              <Sparkles />
            </Button>
          ) : null}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => deleteBalloon(projectId, pageId, panelId, balloon.id)}
            aria-label="Apagar balão"
          >
            <Trash2 />
          </Button>
        </div>
      </div>
      <AutoTextarea
        value={balloon.text}
        onChange={(v) => updateBalloon(projectId, pageId, panelId, balloon.id, { text: v })}
        placeholder={balloon.type === "sfx" ? "KRAK, silêncio, chuva…" : "Texto do balão…"}
        className="mt-2 min-h-11 bg-surface"
      />
    </div>
  );
}
