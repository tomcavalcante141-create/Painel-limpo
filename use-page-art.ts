import { useEffect, useState } from "react";
import { toast } from "sonner";
import { createAndStorePanelImage, storeUploadedPanelImage } from "@/lib/create-image";
import { loadPanelImages, subscribeImages } from "@/lib/panel-images";
import type { ImageAspect } from "@/lib/templates";
import type { Character, Format, Panel } from "@/lib/types";

let inflight: string | null = null;
const jobSubs = new Set<(id: string | null) => void>();

function setInflight(id: string | null) {
  inflight = id;
  jobSubs.forEach((fn) => fn(id));
}

export function usePanelImageMap(ids: string[]) {
  const key = ids.join("|");
  const [images, setImages] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancel = false;
    const refresh = () => {
      void loadPanelImages(key ? key.split("|") : []).then((map) => {
        if (!cancel) setImages(map);
      });
    };
    refresh();
    const unsub = subscribeImages(refresh);
    return () => {
      cancel = true;
      unsub();
    };
  }, [key]);

  return images;
}

export function useImageJob() {
  const [id, setId] = useState<string | null>(inflight);
  useEffect(() => {
    const fn = (next: string | null) => setId(next);
    jobSubs.add(fn);
    return () => {
      jobSubs.delete(fn);
    };
  }, []);
  return id;
}

export async function runCreatePanelImage(input: {
  panel: Panel;
  format: Format;
  artStyle: string;
  characters: Character[];
  aspect: ImageAspect;
}) {
  if (inflight) return;
  if (!input.panel.description.trim()) {
    toast.error("Escreva o que o leitor vê antes de criar a imagem.");
    return;
  }
  setInflight(input.panel.id);
  try {
    const res = await createAndStorePanelImage({
      panelId: input.panel.id,
      format: input.format,
      description: input.panel.description,
      artStyle: input.artStyle,
      characters: input.characters,
      aspect: input.aspect,
    });
    if (!res.ok) toast.error(res.error);
    else toast.success("Imagem do painel pronta");
  } catch {
    toast.error("Não foi possível criar a imagem.");
  } finally {
    setInflight(null);
  }
}

export async function runUploadPanelImage(panelId: string, file: File) {
  if (inflight) return;
  setInflight(panelId);
  try {
    await storeUploadedPanelImage(panelId, file);
    toast.success("Imagem colocada no painel");
  } catch {
    toast.error("Não foi possível usar essa imagem.");
  } finally {
    setInflight(null);
  }
}
