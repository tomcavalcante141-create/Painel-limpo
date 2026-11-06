import { generatePanelImage } from "@/lib/ai";
import { savePanelImage } from "@/lib/panel-images";
import type { ImageAspect } from "@/lib/templates";
import type { Character, Format } from "@/lib/types";

export function panelImagePrompt(input: {
  format: Format;
  description: string;
  artStyle: string;
  characters: Character[];
}): string {
  const style =
    input.format === "manga"
      ? "Single black-and-white manga panel, crisp ink line art, screentone, cinematic framing. No speech balloons, no captions, no letters, no logos, no watermark."
      : "Single full-color western comic panel, inked and painted, cinematic framing. No speech balloons, no captions, no letters, no logos, no watermark.";
  const names = input.characters.filter(
    (c) => c.name.trim().length > 1 && input.description.toLowerCase().includes(c.name.trim().toLowerCase()),
  );
  const cast = names
    .map((c) => `${c.name}: ${c.appearance || c.role || "as described"}`)
    .join(". ");
  return [style, input.artStyle.trim(), input.description.trim(), cast ? `Characters — ${cast}.` : ""]
    .filter(Boolean)
    .join("\n")
    .slice(0, 1400);
}

async function shrinkDataUrl(dataUrl: string): Promise<string> {
  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("imagem inválida"));
    img.src = dataUrl;
  });
  const maxEdge = 960;
  const scale = Math.min(1, maxEdge / Math.max(img.width, img.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(img.width * scale));
  canvas.height = Math.max(1, Math.round(img.height * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) return dataUrl;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.82);
}

export async function createAndStorePanelImage(input: {
  panelId: string;
  format: Format;
  description: string;
  artStyle: string;
  characters: Character[];
  aspect: ImageAspect;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const prompt = panelImagePrompt(input);
  const res = await generatePanelImage({ data: { prompt, aspectRatio: input.aspect } });
  if (!res.ok) return res;
  const shrunk = await shrinkDataUrl(`data:image/jpeg;base64,${res.b64}`);
  await savePanelImage(input.panelId, shrunk);
  return { ok: true };
}

export async function storeUploadedPanelImage(panelId: string, file: File): Promise<void> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
  const shrunk = await shrinkDataUrl(dataUrl);
  await savePanelImage(panelId, shrunk);
}
