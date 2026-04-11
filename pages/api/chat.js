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
    return 'STAGE: SPOT. Start with a quiz, not an answer. Output exactly: [TYPE:quiz][TEXT:max 8 words][QUESTION:max 12 words][OPTA:concrete clue][OPTB:real example][OPTC:problem to test][OPTD:possible action]. Options under 7 words.';
  }

  if (exchangeCount <= 3) {
    return 'STAGE: TEST. Give one short claim for true/false. Output exactly: [TYPE:true_false][TEXT:one testable claim, max 12 words][QUESTION:True or false?].';
  }

  if (exchangeCount <= 5) {
    return 'STAGE: CHOOSE. Use multiple choice to make the student pick the strongest reason or next step. Output: [TYPE:quiz][TEXT:max 8 words][QUESTION:max 12 words][OPTA:...][OPTB:...][OPTC:...][OPTD:...]. Options under 7 words.';
  }

  if (exchangeCount <= 7) {
    return 'STAGE: APPLY. Ask for one short original sentence. Output: [TYPE:open][TEXT:max 8 words][QUESTION:max 14 words].';
  }

  return 'STAGE: NAME. If the student shows enough reasoning, trigger the reward. Output: [TYPE:fill_blanks][SENTENCE:When ___ connects to ___, it can change ___.][BLANK1:keyword from README][BLANK2:keyword from README][BLANK3:impact][TEXT:Voce desbloqueou o raciocinio! Para registrar essa conquista, complete as lacunas com os conceitos que descobrimos:].';
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
- Prefira quiz, multipla escolha, verdadeiro/falso, perguntas abertas curtas e lacunas.
- Nao use rotulos antigos de relacao como atividade.
- Linguagem curta, inspiradora e tecnica na medida certa.
- Referencias permitidas quando relevantes: sensores, circuitos, biomimetica, prototipos, ODS, cidades sustentaveis.

Formato obrigatorio:
- Responda somente com tags que o app entende.
- Tipos permitidos: [TYPE:quiz], [TYPE:true_false], [TYPE:open], [TYPE:fill_blanks].
- Tags possiveis: [TYPE:], [TEXT:], [QUESTION:], [OPTA:]..[OPTE:], [SENTENCE:], [BLANK1:]..[BLANK3:].
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
