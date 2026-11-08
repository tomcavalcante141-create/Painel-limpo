import type { ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Eye, MessageSquare, PanelsTopLeft } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import { SAMPLE_PROJECT_ID } from "@/lib/seed";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <div className="min-h-dvh bg-bg text-fg">
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-5 md:px-8">
        <BrandMark />
        <nav className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="hidden sm:inline-flex" asChild>
            <Link to="/studio">Estúdio</Link>
          </Button>
          <Button size="sm" asChild>
            <Link to="/studio">
              Escrever
              <ArrowRight />
            </Link>
          </Button>
        </nav>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-16 pt-8 md:grid-cols-2 md:gap-16 md:px-8 md:pb-24 md:pt-12">
          <div className="stagger-in">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">Estúdio de roteiro</p>
            <h1 className="mt-4 font-display text-4xl font-medium leading-tight tracking-tight text-fg md:text-6xl">
              Escreva a HQ. Painel a painel.
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-muted md:text-lg">
              Um editor feito para roteiristas de quadrinhos e mangá. Não é um documento genérico: é
              página, painel, o que o leitor vê e o que o personagem fala.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link to="/studio">
                  Começar um roteiro
                  <ArrowRight />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/studio/$projectId" params={{ projectId: SAMPLE_PROJECT_ID }}>
                  Abrir o exemplo
                </Link>
              </Button>
            </div>
          </div>
          <HeroPage />
        </section>

        <section className="border-y border-border bg-surface">
          <div className="mx-auto grid max-w-6xl gap-px bg-border md:grid-cols-4">
            <Anatomy
              kicker="Página"
              title="A unidade de ritmo"
              body="Cada página tem um layout. O sistema numera sozinho. Você pensa em virada, não em parágrafo."
            />
            <Anatomy
              kicker="Painel"
              title="O que o leitor vê"
              body="Descrição visual primeiro. Plano, ação, cenário — separado do que se fala."
            />
            <Anatomy
              kicker="Balão"
              title="O que se ouve"
              body="Diálogo, pensamento, legenda e SFX. Cada um no lugar certo, com o personagem certo."
            />
            <Anatomy
              kicker="Preview"
              title="A página no papel"
              body="Crie a imagem de cada quadro e arraste para organizar a página. Mangá lê da direita; HQ da esquerda."
            />
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
          <div className="max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">Do logline ao PDF</p>
            <h2 className="mt-3 font-display text-3xl font-medium tracking-tight md:text-4xl">
              A história inteira, no mesmo caderno.
            </h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <FeatureCard
              icon={<PanelsTopLeft className="size-5" />}
              title="Mangá ou HQ"
              body="Ritmo e leitura mudam com o formato. Templates de página para splash, faixa, grade e mangá clássico."
            />
            <FeatureCard
              icon={<Eye className="size-5" />}
              title="Personagens e mundo"
              body="Fichas, relações, lugares, regras, timeline e estrutura de atos. Notas soltas viram cenas depois."
            />
            <FeatureCard
              icon={<MessageSquare className="size-5" />}
              title="Exportar para o artista"
              body="A página montada com as imagens, PDF do roteiro, Markdown ou só as descrições de painel."
            />
          </div>
        </section>
      </main>

      <footer className="border-t border-border px-5 py-8 md:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <BrandMark />
          <p className="text-sm text-muted">Roteiros para HQ e mangá. Os desenhos ficam com você.</p>
        </div>
      </footer>
    </div>
  );
}

function Anatomy({ kicker, title, body }: { kicker: string; title: string; body: string }) {
  return (
    <div className="bg-surface px-6 py-8 md:px-8">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">{kicker}</p>
      <h3 className="mt-3 font-display text-xl font-medium">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
    </div>
  );
}

function FeatureCard({ icon, title, body }: { icon: ReactNode; title: string; body: string }) {
  return (
    <article className="rounded-xl bg-surface p-6 shadow-border">
      <div className="flex size-10 items-center justify-center rounded-md bg-inset text-primary">{icon}</div>
      <h3 className="mt-4 font-display text-xl font-medium">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
    </article>
  );
}

function HeroPage() {
  return (
    <div className="relative mx-auto w-full max-w-sm">
      <div className="absolute -left-6 top-8 hidden h-40 w-28 rotate-[-8deg] rounded-lg bg-inset shadow-border md:block" />
      <div className="gutter-page relative aspect-page rounded-xl p-3">
        <div
          className="grid h-full gap-1.5"
          style={{ gridTemplateAreas: `"a a a" "b b c" "d e e"`, gridTemplateRows: "1.2fr 1fr 1fr" }}
        >
          <HeroPanel area="a" n="1" caption="Plataforma vazia. 1h14." />
          <HeroPanel area="b" n="2" caption="A catraca lacrada." balloon />
          <HeroPanel area="c" n="3" caption="Celular: último trem 00:42." />
          <HeroPanel area="d" n="4" caption="Lanterna no túnel." />
          <HeroPanel area="e" n="5" caption="O fiscal. Uniforme seco." balloon />
        </div>
      </div>
      <p className="mt-3 text-center text-xs uppercase tracking-[0.16em] text-muted">Página 1 · Estação Fechada</p>
    </div>
  );
}

function HeroPanel({
  area,
  n,
  caption,
  balloon,
}: {
  area: string;
  n: string;
  caption: string;
  balloon?: boolean;
}) {
  return (
    <div className="relative overflow-hidden rounded-sm bg-inset" style={{ gridArea: area }}>
      <span className="absolute left-1.5 top-1.5 font-mono text-micro tabular-nums text-subtle">{n}</span>
      <p className="absolute inset-x-2 bottom-2 text-micro leading-snug text-muted">{caption}</p>
      {balloon ? (
        <span className="absolute right-2 top-6 rounded-full bg-surface px-2 py-1 text-micro text-fg shadow-border">
          — Moça. Fechou.
        </span>
      ) : null}
    </div>
  );
}
