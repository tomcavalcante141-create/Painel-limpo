import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { FileUp, Plus, Trash2 } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { NewProjectDialog } from "@/components/new-project-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useStudioStore } from "@/lib/store";
import { FORMAT_LABELS, KIND_LABELS, type Project } from "@/lib/types";
import { projectStats } from "@/lib/stats";
import { formatDate } from "@/lib/utils";

export const Route = createFileRoute("/studio/")({ component: StudioHome });

function StudioHome() {
  const projects = useStudioStore((s) => s.projects);
  const deleteProject = useStudioStore((s) => s.deleteProject);
  const importProject = useStudioStore((s) => s.importProject);
  const navigate = useNavigate();

  function onImport(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result)) as Project;
        if (!data?.title || !Array.isArray(data.chapters)) return;
        const id = importProject(data);
        void navigate({ to: "/studio/$projectId", params: { projectId: id } });
      } catch {
        /* ignore malformed */
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="min-h-dvh bg-bg">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <Link to="/" className="focus-visible:outline-none">
            <BrandMark />
          </Link>
          <div className="flex items-center gap-2">
            <label className="inline-flex">
              <input
                type="file"
                accept="application/json"
                className="sr-only"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onImport(f);
                  e.target.value = "";
                }}
              />
              <Button variant="outline" size="sm" asChild>
                <span>
                  <FileUp />
                  Importar
                </span>
              </Button>
            </label>
            <NewProjectDialog>
              <Button size="sm">
                <Plus />
                Novo roteiro
              </Button>
            </NewProjectDialog>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-medium tracking-tight">Estúdio</h1>
            <p className="mt-1 text-sm text-muted">Seus roteiros ficam neste aparelho.</p>
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="mt-12 rounded-xl bg-surface px-6 py-16 text-center shadow-border">
            <h2 className="font-display text-2xl">Nenhum roteiro ainda</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
              Comece pelo logline, ou abra um exemplo para ver a estrutura página a página.
            </p>
            <div className="mt-6">
              <NewProjectDialog>
                <Button>
                  <Plus />
                  Criar o primeiro
                </Button>
              </NewProjectDialog>
            </div>
          </div>
        ) : (
          <ul className="mt-8 grid gap-3">
            {projects.map((p) => (
              <ProjectRow key={p.id} project={p} onDelete={() => deleteProject(p.id)} />
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}

function ProjectRow({ project, onDelete }: { project: Project; onDelete: () => void }) {
  const stats = projectStats(project);
  return (
    <li className="group rounded-xl bg-surface shadow-border transition-[box-shadow] duration-150 hover:shadow-border-hover">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <Link
          to="/studio/$projectId"
          params={{ projectId: project.id }}
          className="min-w-0 flex-1 focus-visible:outline-none"
        >
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-xl font-medium tracking-tight">{project.title}</h2>
            <Badge variant="outline">{FORMAT_LABELS[project.format]}</Badge>
            <Badge variant="default">{KIND_LABELS[project.kind]}</Badge>
          </div>
          <p className="mt-1 line-clamp-2 text-sm text-muted">
            {project.logline || "Sem logline ainda."}
          </p>
          <p className="mt-2 font-mono text-xs tabular-nums text-subtle">
            {stats.pages} pág. · {stats.panels} painéis · {stats.balloons} balões · {formatDate(project.updatedAt)}
          </p>
        </Link>
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-muted hover:text-danger sm:opacity-0 sm:group-hover:opacity-100"
          onClick={onDelete}
          aria-label={`Apagar ${project.title}`}
        >
          <Trash2 />
        </Button>
      </div>
    </li>
  );
}
