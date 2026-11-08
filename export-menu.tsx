import { Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { printProject, projectToMarkdown } from "@/lib/export-script";
import type { Project } from "@/lib/types";
import { downloadText, slugify } from "@/lib/utils";

export function ExportMenu({ project }: { project: Project }) {
  const slug = slugify(project.title);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Download />
          Exportar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Enviar ao artista</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => printProject(project)}>Imprimir / PDF</DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            downloadText(`${slug}.md`, projectToMarkdown(project), "text/markdown");
            toast.success("Markdown baixado");
          }}
        >
          Markdown completo
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            downloadText(`${slug}-paineis.md`, projectToMarkdown(project, { panelsOnly: true }), "text/markdown");
            toast.success("Só as descrições");
          }}
        >
          Só descrições de painel
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            downloadText(`${slug}.json`, JSON.stringify(project, null, 2), "application/json");
            toast.success("Cópia JSON salva");
          }}
        >
          Backup JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
