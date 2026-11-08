import { createFileRoute, Link } from "@tanstack/react-router";
import { Workspace } from "@/components/workspace";
import { Button } from "@/components/ui/button";
import { useStudioStore } from "@/lib/store";

export const Route = createFileRoute("/studio/$projectId")({
  component: ProjectPage,
});

function ProjectPage() {
  const { projectId } = Route.useParams();
  const project = useStudioStore((s) => s.projects.find((p) => p.id === projectId));

  if (!project) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-bg px-6 text-center">
        <h1 className="font-display text-2xl">Roteiro não encontrado</h1>
        <p className="max-w-sm text-sm text-muted">Ele pode ter sido apagado neste aparelho.</p>
        <Button asChild>
          <Link to="/studio">Voltar ao estúdio</Link>
        </Button>
      </div>
    );
  }

  return <Workspace project={project} />;
}
