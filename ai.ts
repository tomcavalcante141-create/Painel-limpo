import { createServerFn } from "@tanstack/react-start";

export type SuggestKind = "expand" | "rhythm" | "dialogue";

const ASPECTS = new Set(["1:1", "16:9", "9:16", "3:4", "4:3", "3:2", "2:3"]);

export const suggestScript = createServerFn({ method: "POST" })
  .validator((input: { kind: SuggestKind; format: "manga" | "hq"; context: string }) => input)
  .handler(async ({ data }) => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { ok: false as const, error: "A ajuda de escrita não está disponível agora." };

    const formatLabel = data.format === "manga" ? "mangá (ritmo visual, menos texto, SFX fortes)" : "HQ ocidental (diálogos mais presentes, splashes)";
    const instructions: Record<SuggestKind, string> = {
      expand:
        "Reescreva a descrição visual do painel de forma concreta e filmável: plano, ação, cenário, expressão. 2 a 4 frases. Sem diálogo. Português brasileiro. Devolva só o texto novo.",
      rhythm:
        "Analise o ritmo desta página de quadrinho. Diga se está falada, vazia ou equilibrada. Sugira no máximo 3 ajustes práticos (cortar balão, quebrar painel, virar página). Português brasileiro. Texto curto.",
      dialogue:
        "Sugira 1 ou 2 falas alternativas mais naturais e em voz do personagem, no mesmo tom. Português brasileiro. Liste as falas, cada uma em uma linha, sem numeração longa.",
    };

    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-4.5",
        max_tokens: 350,
        temperature: 0.7,
        messages: [
          {
            role: "system",
            content: `Você é um editor de roteiros de quadrinhos. Formato: ${formatLabel}. ${instructions[data.kind]}`,
          },
          { role: "user", content: data.context.slice(0, 2500) },
        ],
      }),
    });

    if (!res.ok) return { ok: false as const, error: "Não foi possível gerar a sugestão." };

    const body = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const text = body.choices?.[0]?.message?.content?.trim() ?? "";
    if (!text) return { ok: false as const, error: "A sugestão veio vazia." };
    return { ok: true as const, text };
  });

export const generatePanelImage = createServerFn({ method: "POST" })
  .validator((input: { prompt: string; aspectRatio: string }) => {
    const prompt = input.prompt.trim().slice(0, 1400);
    const aspectRatio = ASPECTS.has(input.aspectRatio) ? input.aspectRatio : "3:4";
    return { prompt, aspectRatio };
  })
  .handler(async ({ data }) => {
    if (!data.prompt) return { ok: false as const, error: "Descreva o painel antes de criar a imagem." };
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { ok: false as const, error: "A criação de imagens não está disponível agora." };

    const res = await fetch("https://api.x.ai/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-imagine-image-2.0",
        prompt: data.prompt,
        aspect_ratio: data.aspectRatio,
        resolution: "1k",
        quality: "low",
        response_format: "b64_json",
        n: 1,
      }),
    });

    if (!res.ok) {
      let code = "";
      try {
        const err = (await res.json()) as { code?: string };
        code = err.code ?? "";
      } catch {
        code = "";
      }
      if (res.status === 403 || code.includes("spending") || code.includes("credit")) {
        return {
          ok: false as const,
          error: "Os créditos de imagem acabaram. Quando houver saldo, o quadro é criado daqui.",
        };
      }
      return { ok: false as const, error: "Não foi possível criar a imagem." };
    }
    const body = (await res.json()) as { data?: { b64_json?: string }[] };
    const b64 = body.data?.[0]?.b64_json;
    if (!b64) return { ok: false as const, error: "A imagem não veio. Tente de novo." };
    return { ok: true as const, b64 };
  });
