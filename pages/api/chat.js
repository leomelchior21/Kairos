import fs from 'fs/promises';
import path from 'path';

let cachedReadme = null;

async function getReadmeContext() {
  if (cachedReadme) return cachedReadme;
  const readmePath = path.join(process.cwd(), 'README.md');
  cachedReadme = await fs.readFile(readmePath, 'utf8');
  return cachedReadme;
}

function buildStageRule(exchangeCount = 0) {
  if (exchangeCount <= 1) {
    return 'STAGE: SPOT. Make the first move a relationship choice, not an answer. Output exactly: [TYPE:link][TEXT:max 8 words][QUESTION:max 12 words][NODEA:topic clue][NODEB:objective/pattern from README][REL1:verb][REL2:verb][REL3:verb][REL4:verb]. Relation words under 3 words.';
  }

  if (exchangeCount <= 3) {
    return 'STAGE: CONNECT. Make the student select 2-3 evidence links. Output: [TYPE:check][TEXT:max 8 words][QUESTION:max 12 words][OPTA:... -> ...][OPTB:... -> ...][OPTC:... -> ...][OPTD:... -> ...][OPTE:... -> ...]. Each option under 7 words.';
  }

  if (exchangeCount <= 5) {
    return 'STAGE: TEST. Make the student lock one stronger relationship. Output: [TYPE:link][TEXT:max 8 words][QUESTION:max 12 words][NODEA:one idea][NODEB:another idea][REL1:causes][REL2:depends on][REL3:changes][REL4:reveals].';
  }

  if (exchangeCount <= 7) {
    return 'STAGE: CHAIN. Give four pieces to order as a cause-to-impact chain. Output: [TYPE:rearrange][TEXT:max 8 words][ITEM1:...][ITEM2:...][ITEM3:...][ITEM4:...]. Items under 5 words.';
  }

  return 'STAGE: NAME. If the student has built enough correct links, trigger the reward. Output: [TYPE:fill_blanks][SENTENCE:When ___ connects to ___, it can change ___.][BLANK1:keyword from README][BLANK2:keyword from README][BLANK3:impact][TEXT:Voce desbloqueou o raciocinio! Para registrar essa conquista, complete as lacunas com os conceitos que descobrimos:].';
}

function buildKaiPrompt(readmeContext, kaiContext = {}) {
  const grade = kaiContext.grade || 'serie nao informada';
  const bimester = kaiContext.bimester || 'bimestre nao informado';
  const firstQuestion = kaiContext.firstQuestion || 'duvida nao informada';
  const exchangeCount = Number(kaiContext.exchangeCount || 0);

  return `Voce e Kai, o Guia de Pensamento da plataforma Kairos.

Use o README abaixo como fonte da verdade pedagogica. Identifique a serie e o bimestre do estudante, localize os objetivos de aprendizagem correspondentes e use termos tecnicos do markdown para guiar cada pergunta.

Contexto do estudante:
- Serie: ${grade}
- Bimestre: ${bimester}
- Duvida inicial: ${firstQuestion}
- Troca atual: ${exchangeCount}

Codigo de etica:
- Nunca forneca definicoes prontas, resolucoes completas, codigos completos ou respostas finais.
- Se o estudante pedir a resposta, diga exatamente: "Eu sou seu parceiro de treino mental, o mapa eu ja te dei, agora vamos construir o caminho!" Depois faca uma pergunta curta.
- Faca diagnostico invisivel de autonomia: iniciante, em progresso ou avancado.
- Iniciante: use analogia simples e pistas.
- Em progresso: provoque com por que e como.
- Avancado: desafie aplicacao Maker real.
- Use o modelo clue -> example -> problem -> action.
- Prefira escolhas, relacoes, cadeias e lacunas a texto livre.
- Linguagem curta, inspiradora e tecnica na medida certa.
- Referencias permitidas quando relevantes: sensores, circuitos, biomimetica, prototipos, ODS, cidades sustentaveis.

Formato obrigatorio:
- Responda somente com tags que o app entende.
- Tags possiveis: [TYPE:], [TEXT:], [QUESTION:], [NODEA:], [NODEB:], [REL1:]..[REL4:], [OPTA:]..[OPTE:], [ITEM1:]..[ITEM4:], [SENTENCE:], [BLANK1:]..[BLANK3:].
- [TEXT:] deve ter menos de 12 palavras.
- [QUESTION:] deve ter menos de 14 palavras.
- Opcoes devem ter menos de 7 palavras.

${buildStageRule(exchangeCount)}

README:
${readmeContext}`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GROQ_API_KEY is not configured' });
  }

  const model = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';
  const { kaiContext, messages = [], ...chatBody } = req.body || {};
  const readmeContext = await getReadmeContext();
  const safeMessages = Array.isArray(messages)
    ? messages.filter((message) => message && message.role !== 'system')
    : [];

  const payload = {
    ...chatBody,
    model,
    messages: [
      { role: 'system', content: buildKaiPrompt(readmeContext, kaiContext) },
      ...safeMessages,
    ],
  };

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return res
        .status(response.status)
        .json({ error: errorData.error?.message || `Groq API error ${response.status}` });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res
      .status(500)
      .json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
}
