import type { ReactNode } from "react";
import { Plus, Trash2 } from "lucide-react";
import { AutoTextarea } from "@/components/auto-textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDateTime } from "@/lib/utils";
import { useStudioStore } from "@/lib/store";
import type { Project } from "@/lib/types";

export function CharactersPanel({ project }: { project: Project }) {
  const addCharacter = useStudioStore((s) => s.addCharacter);
  const updateCharacter = useStudioStore((s) => s.updateCharacter);
  const deleteCharacter = useStudioStore((s) => s.deleteCharacter);
  const addRelation = useStudioStore((s) => s.addRelation);
  const deleteRelation = useStudioStore((s) => s.deleteRelation);

  return (
    <div className="space-y-4 p-4 md:p-6">
      <Header
        title="Personagens"
        action={
          <Button size="sm" onClick={() => addCharacter(project.id)}>
            <Plus />
            Personagem
          </Button>
        }
      />
      {project.characters.length === 0 ? (
        <Empty text="Cadastre quem vive nesta história. O nome entra no diálogo automaticamente." />
      ) : (
        project.characters.map((c) => (
          <article key={c.id} className="rounded-xl bg-surface p-4 shadow-border">
            <div className="flex items-start gap-2">
              <Input
                value={c.name}
                onChange={(e) => updateCharacter(project.id, c.id, { name: e.target.value })}
                className="font-display text-lg"
              />
              <Button variant="ghost" size="icon-sm" onClick={() => deleteCharacter(project.id, c.id)} aria-label="Apagar">
                <Trash2 />
              </Button>
            </div>
            <Input
              value={c.role}
              onChange={(e) => updateCharacter(project.id, c.id, { role: e.target.value })}
              placeholder="Função na história"
              className="mt-2"
            />
            <Label className="mt-3 block text-xs text-muted">Aparência</Label>
            <AutoTextarea
              value={c.appearance}
              onChange={(v) => updateCharacter(project.id, c.id, { appearance: v })}
              placeholder="O que o desenhista precisa ver."
              className="mt-1"
            />
            <Label className="mt-3 block text-xs text-muted">Personalidade / voz</Label>
            <AutoTextarea
              value={c.personality}
              onChange={(v) => updateCharacter(project.id, c.id, { personality: v })}
            />
            <Label className="mt-3 block text-xs text-muted">Notas</Label>
            <AutoTextarea value={c.notes} onChange={(v) => updateCharacter(project.id, c.id, { notes: v })} />

            <div className="mt-4">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted">Relações</p>
              <ul className="mt-2 space-y-1">
                {c.relations.map((r) => {
                  const other = project.characters.find((x) => x.id === r.targetId);
                  return (
                    <li key={r.targetId} className="flex items-center gap-2 text-sm">
                      <span className="text-muted">{r.label}</span>
                      <span>{other?.name ?? "?"}</span>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="ml-auto"
                        onClick={() => deleteRelation(project.id, c.id, r.targetId)}
                        aria-label="Remover relação"
                      >
                        <Trash2 />
                      </Button>
                    </li>
                  );
                })}
              </ul>
              {project.characters.length > 1 ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  <select
                    className="h-9 flex-1 rounded-md bg-surface px-2 text-sm shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-fg)_14%,transparent)]"
                    defaultValue=""
                    onChange={(e) => {
                      const targetId = e.target.value;
                      if (!targetId) return;
                      addRelation(project.id, c.id, targetId, "conhece");
                      e.target.value = "";
                    }}
                  >
                    <option value="">Ligar a…</option>
                    {project.characters
                      .filter((o) => o.id !== c.id && !c.relations.some((r) => r.targetId === o.id))
                      .map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.name}
                        </option>
                      ))}
                  </select>
                </div>
              ) : null}
            </div>
          </article>
        ))
      )}
    </div>
  );
}

export function WorldPanel({ project }: { project: Project }) {
  const addPlace = useStudioStore((s) => s.addPlace);
  const updatePlace = useStudioStore((s) => s.updatePlace);
  const deletePlace = useStudioStore((s) => s.deletePlace);
  const addRule = useStudioStore((s) => s.addRule);
  const updateRule = useStudioStore((s) => s.updateRule);
  const deleteRule = useStudioStore((s) => s.deleteRule);
  const addTimeline = useStudioStore((s) => s.addTimeline);
  const updateTimeline = useStudioStore((s) => s.updateTimeline);
  const deleteTimeline = useStudioStore((s) => s.deleteTimeline);

  return (
    <div className="space-y-8 p-4 md:p-6">
      <section>
        <Header
          title="Lugares"
          action={
            <Button size="sm" onClick={() => addPlace(project.id)}>
              <Plus />
              Lugar
            </Button>
          }
        />
        {project.places.length === 0 ? <Empty text="Onde a história acontece." /> : null}
        <div className="mt-3 space-y-3">
          {project.places.map((p) => (
            <article key={p.id} className="rounded-xl bg-surface p-4 shadow-border">
              <div className="flex gap-2">
                <Input value={p.name} onChange={(e) => updatePlace(project.id, p.id, { name: e.target.value })} />
                <Button variant="ghost" size="icon-sm" onClick={() => deletePlace(project.id, p.id)} aria-label="Apagar">
                  <Trash2 />
                </Button>
              </div>
              <AutoTextarea
                className="mt-2"
                value={p.description}
                onChange={(v) => updatePlace(project.id, p.id, { description: v })}
                placeholder="Atmosfera, detalhes visuais…"
              />
            </article>
          ))}
        </div>
      </section>

      <section>
        <Header
          title="Regras do mundo"
          action={
            <Button size="sm" onClick={() => addRule(project.id)}>
              <Plus />
              Regra
            </Button>
          }
        />
        <div className="mt-3 space-y-3">
          {project.worldRules.map((r) => (
            <article key={r.id} className="rounded-xl bg-surface p-4 shadow-border">
              <div className="flex gap-2">
                <Input value={r.title} onChange={(e) => updateRule(project.id, r.id, { title: e.target.value })} />
                <Button variant="ghost" size="icon-sm" onClick={() => deleteRule(project.id, r.id)} aria-label="Apagar">
                  <Trash2 />
                </Button>
              </div>
              <AutoTextarea className="mt-2" value={r.body} onChange={(v) => updateRule(project.id, r.id, { body: v })} />
            </article>
          ))}
        </div>
      </section>

      <section>
        <Header
          title="Linha do tempo"
          action={
            <Button size="sm" onClick={() => addTimeline(project.id)}>
              <Plus />
              Evento
            </Button>
          }
        />
        <div className="mt-3 space-y-3">
          {project.timeline.map((e) => (
            <article key={e.id} className="rounded-xl bg-surface p-4 shadow-border">
              <div className="flex gap-2">
                <Input
                  value={e.when}
                  onChange={(ev) => updateTimeline(project.id, e.id, { when: ev.target.value })}
                  placeholder="Quando"
                  className="max-w-32"
                />
                <Input
                  value={e.title}
                  onChange={(ev) => updateTimeline(project.id, e.id, { title: ev.target.value })}
                  placeholder="Título"
                />
                <Button variant="ghost" size="icon-sm" onClick={() => deleteTimeline(project.id, e.id)} aria-label="Apagar">
                  <Trash2 />
                </Button>
              </div>
              <AutoTextarea className="mt-2" value={e.body} onChange={(v) => updateTimeline(project.id, e.id, { body: v })} />
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export function OutlinePanel({ project }: { project: Project }) {
  const addBeat = useStudioStore((s) => s.addBeat);
  const updateBeat = useStudioStore((s) => s.updateBeat);
  const deleteBeat = useStudioStore((s) => s.deleteBeat);
  const renameAct = useStudioStore((s) => s.renameAct);
  const updateProject = useStudioStore((s) => s.updateProject);

  return (
    <div className="space-y-4 p-4 md:p-6">
      <Header title="Estrutura" />
      <div>
        <Label className="text-xs text-muted">Logline</Label>
        <AutoTextarea
          className="mt-1"
          value={project.logline}
          onChange={(v) => updateProject(project.id, { logline: v })}
          placeholder="Uma frase. O contrato com o leitor."
        />
      </div>
      {project.outline.map((act) => (
        <section key={act.id} className="rounded-xl bg-surface p-4 shadow-border">
          <Input
            value={act.title}
            onChange={(e) => renameAct(project.id, act.id, e.target.value)}
            className="font-display text-lg"
          />
          <ul className="mt-3 space-y-3">
            {act.beats.map((b) => (
              <li key={b.id} className="rounded-lg bg-inset p-3">
                <div className="flex gap-2">
                  <Input
                    value={b.title}
                    onChange={(e) => updateBeat(project.id, act.id, b.id, { title: e.target.value })}
                  />
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => deleteBeat(project.id, act.id, b.id)}
                    aria-label="Apagar beat"
                  >
                    <Trash2 />
                  </Button>
                </div>
                <AutoTextarea
                  className="mt-2 bg-surface"
                  value={b.summary}
                  onChange={(v) => updateBeat(project.id, act.id, b.id, { summary: v })}
                  placeholder="O que acontece neste beat."
                />
              </li>
            ))}
          </ul>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => addBeat(project.id, act.id)}>
            <Plus />
            Beat
          </Button>
        </section>
      ))}
    </div>
  );
}

export function NotesPanel({ project }: { project: Project }) {
  const addNote = useStudioStore((s) => s.addNote);
  const updateNote = useStudioStore((s) => s.updateNote);
  const deleteNote = useStudioStore((s) => s.deleteNote);

  return (
    <div className="space-y-4 p-4 md:p-6">
      <Header
        title="Notas"
        action={
          <Button size="sm" onClick={() => addNote(project.id)}>
            <Plus />
            Nota
          </Button>
        }
      />
      {project.notes.length === 0 ? <Empty text="Ideias soltas. Depois viram cenas." /> : null}
      {project.notes.map((n) => (
        <article key={n.id} className="rounded-xl bg-surface p-4 shadow-border">
          <div className="flex gap-2">
            <Input value={n.title} onChange={(e) => updateNote(project.id, n.id, { title: e.target.value })} />
            <Button variant="ghost" size="icon-sm" onClick={() => deleteNote(project.id, n.id)} aria-label="Apagar">
              <Trash2 />
            </Button>
          </div>
          <AutoTextarea className="mt-2" value={n.body} onChange={(v) => updateNote(project.id, n.id, { body: v })} />
          <p className="mt-2 font-mono text-xs text-subtle">{formatDateTime(n.updatedAt)}</p>
        </article>
      ))}
    </div>
  );
}

export function VersionsPanel({ project }: { project: Project }) {
  const saveVersion = useStudioStore((s) => s.saveVersion);
  const restoreVersion = useStudioStore((s) => s.restoreVersion);
  const deleteVersion = useStudioStore((s) => s.deleteVersion);

  return (
    <div className="space-y-4 p-4 md:p-6">
      <Header
        title="Versões"
        action={
          <Button size="sm" onClick={() => saveVersion(project.id)}>
            Salvar versão
          </Button>
        }
      />
      <p className="text-sm text-muted">Um recorte do capítulo atual. Restaurar troca as páginas, não os personagens.</p>
      {project.versions.length === 0 ? <Empty text="Nenhuma versão salva ainda." /> : null}
      <ul className="space-y-2">
        {project.versions.map((v) => (
          <li key={v.id} className="flex items-center gap-3 rounded-xl bg-surface px-4 py-3 shadow-border">
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{v.label}</p>
              <p className="font-mono text-xs tabular-nums text-subtle">
                {formatDateTime(v.createdAt)} · {v.pages.length} pág.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => restoreVersion(project.id, v.id)}>
              Restaurar
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={() => deleteVersion(project.id, v.id)} aria-label="Apagar versão">
              <Trash2 />
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Header({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="font-display text-2xl font-medium tracking-tight">{title}</h2>
      {action}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="rounded-lg bg-inset px-4 py-6 text-sm text-muted">{text}</p>;
}
