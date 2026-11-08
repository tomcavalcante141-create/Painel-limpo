import { useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useStudioStore } from "@/lib/store";
import type { Format, ProjectKind } from "@/lib/types";
import { cn } from "@/lib/utils";

export function NewProjectDialog({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [logline, setLogline] = useState("");
  const [format, setFormat] = useState<Format>("manga");
  const [kind, setKind] = useState<ProjectKind>("oneshot");
  const createProject = useStudioStore((s) => s.createProject);
  const navigate = useNavigate();

  function submit() {
    const id = createProject({ title: title.trim() || "Sem título", format, kind, logline });
    setOpen(false);
    setTitle("");
    setLogline("");
    setFormat("manga");
    setKind("oneshot");
    void navigate({ to: "/studio/$projectId", params: { projectId: id } });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo roteiro</DialogTitle>
          <DialogDescription>Escolha o formato. O ritmo do editor acompanha.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Estação Fechada"
              autoFocus
            />
          </div>
          <div className="grid gap-2">
            <Label>Formato</Label>
            <div className="grid grid-cols-2 gap-2">
              <Choice selected={format === "manga"} onClick={() => setFormat("manga")} title="Mangá" hint="Leitura da direita, menos texto" />
              <Choice selected={format === "hq"} onClick={() => setFormat("hq")} title="HQ ocidental" hint="Leitura da esquerda, splashes" />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Tipo</Label>
            <div className="grid grid-cols-2 gap-2">
              <Choice selected={kind === "oneshot"} onClick={() => setKind("oneshot")} title="One-shot" hint="Uma história, um fôlego" />
              <Choice selected={kind === "serial"} onClick={() => setKind("serial")} title="Capítulos" hint="Série com vários blocos" />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="logline">Logline (opcional)</Label>
            <Textarea
              id="logline"
              value={logline}
              onChange={(e) => setLogline(e.target.value)}
              placeholder="Uma frase que segura a história."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={submit}>Abrir editor</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Choice({
  selected,
  onClick,
  title,
  hint,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  hint: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-lg px-3 py-3 text-left transition-[box-shadow,background-color] duration-150",
        selected ? "bg-primary text-primary-fg" : "bg-inset text-fg hover:bg-inset/80",
      )}
    >
      <span className="block text-sm font-medium">{title}</span>
      <span className={cn("mt-0.5 block text-xs", selected ? "text-primary-fg/70" : "text-muted")}>{hint}</span>
    </button>
  );
}
