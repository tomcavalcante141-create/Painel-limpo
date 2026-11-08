import { useRef, useState } from "react";
import { ImagePlus, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { runCreatePanelImage, runUploadPanelImage, useImageJob, usePanelImageMap } from "@/components/use-page-art";
import { useStudioStore } from "@/lib/store";
import { gridTemplateAreas, panelArea, slotAspect, templateById } from "@/lib/templates";
import type { Character, Format, Page } from "@/lib/types";
import { cn } from "@/lib/utils";

export function PagePreview({
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
  onSelectPanel?: (id: string) => void;
}) {
  const template = templateById(page.template);
  const rtl = format === "manga";
  const images = usePanelImageMap(page.panels.map((p) => p.id));
  const busyId = useImageJob();
  const reorderPanels = useStudioStore((s) => s.reorderPanels);
  const updateProject = useStudioStore((s) => s.updateProject);
  const dragFrom = useRef<number | null>(null);
  const [over, setOver] = useState<number | null>(null);

  function finishDrag() {
    const from = dragFrom.current;
    dragFrom.current = null;
    if (from != null && over != null && from !== over) {
      reorderPanels(projectId, page.id, from, over);
    }
    setOver(null);
  }

  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted">Página {pageNumber}</p>
        <p className="mt-1 text-sm text-muted">Arraste um quadro para mudar o lugar dele na página.</p>
      </div>
      <label className="grid gap-1">
        <span className="text-xs font-medium text-muted">Estilo das imagens</span>
        <textarea
          value={artStyle}
          onChange={(e) => updateProject(projectId, { artStyle: e.target.value })}
          placeholder="Nanquim, chuva, luz fria…"
          rows={2}
          className="w-full resize-none rounded-md bg-surface px-3 py-2 text-sm text-fg shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-fg)_14%,transparent)] placeholder:text-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35"
        />
      </label>
      <div className="gutter-page aspect-page w-full rounded-xl p-2.5" dir={rtl ? "rtl" : "ltr"}>
        <div
          className="grid h-full gap-1"
          style={{
            gridTemplateAreas: gridTemplateAreas(template),
            gridTemplateRows: `repeat(${template.areas.length}, minmax(0, 1fr))`,
            direction: rtl ? "rtl" : "ltr",
          }}
        >
          {page.panels.map((panel, i) => {
            const area = panelArea(i);
            const selected = panel.id === selectedPanelId;
            const src = images[panel.id];
            const busy = busyId === panel.id;
            const placed = template.areas.join(" ").includes(area);
            return (
              <div
                key={panel.id}
                data-slot={i}
                onPointerEnter={() => {
                  if (dragFrom.current != null) setOver(i);
                }}
                className={cn(
                  "relative min-h-0 overflow-hidden rounded-sm bg-inset",
                  selected && "ring-2 ring-primary/50",
                  over === i && dragFrom.current != null && dragFrom.current !== i && "ring-2 ring-fg/40",
                )}
                style={{ gridArea: placed ? area : undefined }}
              >
                <button
                  type="button"
                  aria-label={`Painel ${i + 1}. Arraste para reorganizar.`}
                  onClick={() => onSelectPanel?.(panel.id)}
                  onPointerDown={(e) => {
                    if (e.button !== 0) return;
                    dragFrom.current = i;
                    setOver(i);
                    (e.currentTarget as HTMLButtonElement).setPointerCapture(e.pointerId);
                  }}
                  onPointerMove={(e) => {
                    if (dragFrom.current == null) return;
                    const el = document.elementFromPoint(e.clientX, e.clientY);
                    const slot = el?.closest("[data-slot]");
                    const idx = slot?.getAttribute("data-slot");
                    if (idx != null) setOver(Number(idx));
                  }}
                  onPointerUp={finishDrag}
                  onPointerCancel={finishDrag}
                  className="absolute inset-0 cursor-grab text-left active:cursor-grabbing"
                >
                  {src ? (
                    <img src={src} alt="" className="h-full w-full object-cover" draggable={false} />
                  ) : (
                    <span className="flex h-full items-end p-2 text-micro leading-snug text-muted" dir="ltr">
                      {panel.description.trim().slice(0, 72) || "Sem imagem"}
                    </span>
                  )}
                  <span
                    className={cn(
                      "absolute top-1 rounded-sm bg-surface/90 px-1 font-mono text-micro tabular-nums text-fg",
                      rtl ? "right-1" : "left-1",
                    )}
                  >
                    {i + 1}
                  </span>
                  {busy ? (
                    <span className="absolute inset-0 flex items-center justify-center bg-fg/45 text-xs text-primary-fg">
                      Criando…
                    </span>
                  ) : null}
                </button>
                <div className="absolute bottom-1 right-1 z-10 flex gap-1" dir="ltr">
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="secondary"
                    disabled={Boolean(busyId)}
                    aria-label={src ? "Refazer imagem" : "Criar imagem"}
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={() =>
                      void runCreatePanelImage({
                        panel,
                        format,
                        artStyle,
                        characters,
                        aspect: slotAspect(template, i),
                      })
                    }
                  >
                    <ImagePlus />
                  </Button>
                  <label
                    className={cn(
                      "inline-flex size-9 cursor-pointer items-center justify-center rounded-md bg-inset text-fg",
                      busyId && "pointer-events-none opacity-40",
                    )}
                    onPointerDown={(e) => e.stopPropagation()}
                  >
                    <Upload className="size-4" />
                    <span className="sr-only">Enviar imagem</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        e.target.value = "";
                        if (file) void runUploadPanelImage(panel.id, file);
                      }}
                    />
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <p className="text-center text-xs uppercase tracking-[0.14em] text-muted">
        {rtl ? "Mangá · direita para esquerda" : "HQ · esquerda para direita"}
        <span className="mx-1.5 text-border-strong">·</span>
        {template.label}
      </p>
    </div>
  );
}
