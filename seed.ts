import type { Project } from "./types";
import { makeBalloon, makeChapter, makeCharacter, makePage, makePanel, makePlace, makeRule } from "./factories";
import { uid, now } from "./utils";

export const SAMPLE_PROJECT_ID = "sample-estacao-fechada";

export function createSampleProject(): Project {
  const nara = makeCharacter("Nara", "Protagonista");
  nara.appearance = "23 anos. Casaco oversized grafite, fone no pescoço, mochila de lona. Cabelo preso de qualquer jeito.";
  nara.personality = "Observa antes de falar. Irônica quando está nervosa. Não gosta de pedir ajuda.";
  nara.notes = "Designer freelancer. Volta do estúdio de um cliente no centro.";

  const fiscal = makeCharacter("O Fiscal", "Antagonista / mistério");
  fiscal.appearance = "Uniforme de metrô de outra década. Crachá sem foto. Sorriso que não chega aos olhos.";
  fiscal.personality = "Educado demais. Fala como se o relógio dele não andasse.";
  fiscal.notes = "Nunca pisca nos close-ups. Não molha no chuvisco.";

  nara.relations = [{ targetId: fiscal.id, label: "desconfia" }];
  fiscal.relations = [{ targetId: nara.id, label: "escolheu" }];

  const estacao = makePlace(
    "Estação República — plataforma 2",
    "Madrugada. Lâmpadas fluorescentes com um tubo piscando. Chuva no claraboia. Catalogadoras de anúncio da década passada.",
  );
  const tunel = makePlace(
    "Túnel sentido Barra Funda",
    "Cheiro de ozônio e óleo. Os azulejos param de fazer sentido depois de vinte metros.",
  );

  const p1 = makePage("widePlus2", [
    makePanel(
      "PLANO ABERTO. Plataforma vazia, 1h14. Chuva estilhaça a claraboia. Um único banco molhado. O letreiro eletrônico morreu no meio de uma palavra: REPUBL—",
      [makeBalloon("caption", "", "São Paulo. Terça. O último trem já passou.")],
    ),
    makePanel(
      "NARA de costas, parada diante da catraca fechada com corrente e cadeado. O fone pende sem música. A mochila pesa num ombro só.",
    ),
    makePanel(
      "CLOSE do celular: 01:14. Última mensagem do app: “ÚLTIMO TREM 00:42 — Serviço encerrado.” Polegar hesitando sobre “chamar carro”. Sem crédito.",
    ),
  ]);
  p1.note = "Estabelecer silêncio. Quase nenhum diálogo.";

  const p2 = makePage("manga5", [
    makePanel(
      "Nara anda na borda da plataforma. Passos ecoam demais. Ela olha o túnel como quem olha um poço.",
      [makeBalloon("thought", "Nara", "Se eu voltar pela rua, são treze quarteirões. De madrugada. Sozinha.")],
    ),
    makePanel(
      "De dentro do túnel, uma lanterna fraca. Não aponta para ela. Aponta para o chão, como quem varre.",
    ),
    makePanel(
      "O FISCAL surge no limite da luz, já no recinto da plataforma, como se sempre tivesse estado ali. Uniforme seco.",
      [makeBalloon("dialogue", "O Fiscal", "Moça. Plataforma dois fechou.")],
    ),
    makePanel(
      "Nara dá um passo atrás. A corrente da catraca ao fundo. Ele entre ela e a saída do túnel.",
      [
        makeBalloon("dialogue", "Nara", "Eu… perdi o último."),
        makeBalloon("dialogue", "O Fiscal", "Todo mundo perde o último. Uma hora."),
      ],
    ),
    makePanel(
      "CLOSE da boca dele. O sorriso. Atrás, o letreiro tenta ligar: uma letra só. R.",
      [makeBalloon("sfx", "", "tic  tic  tic")],
    ),
  ]);

  const p3 = makePage("invertedL", [
    makePanel(
      "ELE se aproxima sem apressar. A lanterna agora ilumina o crachá: o plástico está opaco, sem nome, sem foto. Nara segura a alça da mochila.",
      [
        makeBalloon("dialogue", "O Fiscal", "Tem um serviço extra. Não sai no aplicativo."),
        makeBalloon("dialogue", "Nara", "Não tem trem extra. Eu trabalho com mapa da cidade."),
        makeBalloon("dialogue", "O Fiscal", "Mapa. Bonito. O mapa não desce no túnel."),
      ],
    ),
    makePanel(
      "DETALHE. A água da chuva escorre da claraboia e desvia dele. O chão ao redor está seco num círculo perfeito.",
    ),
    makePanel(
      "Nara olha o círculo. Entende. O celular vibra: SEM SINAL. Ela escolhe a escada de serviço, não o túnel.",
      [makeBalloon("thought", "Nara", "Ele não molha.")],
    ),
  ]);

  const p4 = makePage("twoV", [
    makePanel(
      "ELA sobe a escada de serviço dois degraus de cada vez. Porta de ferro no topo, destrancada. Luz de rua entra como faca. Ele não a persegue — fica na plataforma, lanterna agora apagada.",
      [makeBalloon("dialogue", "O Fiscal", "Amanhã o último passa mais cedo.")],
    ),
    makePanel(
      "EXTERIOR. República de madrugada. Nara encosta na mureta, respira. A estação abaixo apaga um bloco de luz de cada vez. Último quadro: o letreiro, visto de cima pelos vãos, finalmente completa: REPÚBLICA — e apaga.",
      [
        makeBalloon("caption", "", "Ela pega o ônibus. Não conta para ninguém."),
        makeBalloon("caption", "", "Na quarta, o último trem sai às 00:10."),
      ],
    ),
  ]);
  p4.note = "Não mostrar se ele ainda está lá. O leitor decide.";

  const chapter = makeChapter("One-shot", "manga", [p1, p2, p3, p4]);

  const t = now();
  return {
    id: SAMPLE_PROJECT_ID,
    title: "Estação Fechada",
    format: "manga",
    kind: "oneshot",
    logline:
      "Numa madrugada de São Paulo, uma passageira descobre que a estação fechou — e que o fiscal no túnel não deveria existir.",
    artStyle: "Nanquim, noite chuvosa em São Paulo, luz fluorescente fria, realismo urbano.",
    createdAt: t,
    updatedAt: t,
    currentChapterId: chapter.id,
    chapters: [chapter],
    characters: [nara, fiscal],
    places: [estacao, tunel],
    worldRules: [
      makeRule(
        "Quem perde o último",
        "O Fiscal só aparece para quem fica sozinho depois do encerramento. Câmeras não o gravam. Água não o toca.",
      ),
    ],
    timeline: [
      {
        id: uid(),
        title: "Último trem",
        when: "00:42",
        body: "Nara ainda estava no ateliê do cliente, atrasada de propósito.",
      },
      {
        id: uid(),
        title: "Catraca lacrada",
        when: "01:14",
        body: "Ela chega. O serviço já encerrou. O Fiscal acorda.",
      },
    ],
    outline: [
      {
        id: uid(),
        title: "Começo",
        beats: [
          { id: uid(), title: "A cidade fecha", summary: "Plataforma morta, chuva, o app confirma: ela perdeu." },
        ],
      },
      {
        id: uid(),
        title: "Conflito",
        beats: [
          { id: uid(), title: "O homem seco", summary: "O Fiscal oferece um trem que não existe. Nara percebe o círculo seco." },
        ],
      },
      {
        id: uid(),
        title: "Clímax",
        beats: [{ id: uid(), title: "A escada, não o túnel", summary: "Ela recusa a oferta e sobe o serviço." }],
      },
      {
        id: uid(),
        title: "Resolução",
        beats: [
          { id: uid(), title: "Amanhã mais cedo", summary: "Livramento ambíguo. O horário do último trem encolhe." },
        ],
      },
    ],
    notes: [
      {
        id: uid(),
        title: "Tom",
        body: "Terror quieto, não jump scare. Referência de ritmo: Ito nas páginas 2–3, mas com São Paulo realista no estabelecimento.",
        updatedAt: t,
      },
    ],
    versions: [],
  };
}
