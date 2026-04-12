import fs from 'fs/promises';
import path from 'path';
import {
  classifyQuestion,
  getInquiryFlow,
  getLanguageProfile,
  getLearningStep,
  getMasteryLevel,
  normalizeYear,
  selectConnectionCards,
} from '../../lib/inquiryEngine.js';

let cachedReadme = null;
let cachedCsv = null;

async function getReadmeContext() {
  if (cachedReadme) return cachedReadme;
  const readmePath = path.join(process.cwd(), 'README.md');
  cachedReadme = await fs.readFile(readmePath, 'utf8');
  return cachedReadme;
}

async function getCsvContext() {
  if (cachedCsv) return cachedCsv;
  const csvPath = path.join(process.cwd(), 'pedagogical_context', 'conteudos_2026_consolidado.csv');
  cachedCsv = await fs.readFile(csvPath, 'utf8').catch(() => '');
  return cachedCsv;
}

function buildInteractionRule({ step, masteryLevel, questionType }) {
  const base = [
    `Learning step: ${step.id} (${step.label}).`,
    `Question type: ${questionType}.`,
    `Mastery level: ${masteryLevel}.`,
    `Goal: ${step.goal}.`,
  ];

  const simplify = masteryLevel === 'lost' || masteryLevel === 'emerging'
    ? 'Use very short words, concrete clues, and closed choices. If the last answer was weak, reframe instead of saying incorrect.'
    : 'Allow one small inference, but still keep the task short.';

  const typeRules = {
    multiple_choice: 'Output: [TYPE:multiple_choice][TEXT:max 10 words][QUESTION:max 14 words][OPTA:...][OPTB:...][OPTC:...][OPTD:...][ANSWER:A|B|C|D][HINT:one clue].',
    tap_choice: 'Output: [TYPE:tap_choice][TEXT:max 10 words][QUESTION:max 14 words][OPTA:...][OPTB:...][OPTC:...][OPTD:...][ANSWER:A|B|C|D][HINT:one clue].',
    true_false: 'Output: [TYPE:true_false][TEXT:one short claim][QUESTION:True or false?][ANSWER:true|false][HINT:one clue].',
    match: 'Output: [TYPE:match][TEXT:max 10 words][QUESTION:max 14 words][PAIR1:left|right][PAIR2:left|right][PAIR3:left|right][HINT:one clue].',
    sort: 'Output: [TYPE:sort][TEXT:max 10 words][QUESTION:max 14 words][ITEM1:...][ITEM2:...][ITEM3:...][ITEM4:...][ORDER:1,2,3,4][HINT:one clue].',
    fill_blanks: 'Output: [TYPE:fill_blanks][TEXT:Voce desbloqueou o raciocinio! Complete as lacunas.][SENTENCE:short sentence with ___ blanks][BLANK1:expected word][BLANK2:expected word][BLANK3:expected word][HINT:one clue].',
    short_answer: 'Output: [TYPE:short_answer][TEXT:max 10 words][QUESTION:answer in 5 words or less][HINT:one clue].',
    final_reveal: 'Output: [TYPE:final_reveal][TEXT:Answer unlocked][FINAL:short final answer, 1-3 sentences][CONNECTION1:title|discipline|why it connects][CONNECTION2:title|discipline|why it connects].',
  };

  return [...base, simplify, typeRules[step.interaction]].join('\n');
}

function formatConnectionCards(cards = []) {
  if (!cards.length) return 'No CSV connection cards found for this year.';
  return cards
    .map((card, index) => `${index + 1}. ${card.title} | ${card.discipline} | ${card.detail}`)
    .join('\n');
}

function buildKaiPrompt(readmeContext, csvCards, kaiContext = {}) {
  const grade = kaiContext.grade || 'serie nao informada';
  const year = normalizeYear(grade) || 'ano nao informado';
  const firstQuestion = kaiContext.firstQuestion || 'duvida nao informada';
  const questionType = kaiContext.questionType || classifyQuestion(firstQuestion);
  const masteryScore = Number(kaiContext.masteryScore || 0);
  const masteryLevel = kaiContext.masteryLevel || getMasteryLevel(masteryScore);
  const stepIndex = Number(kaiContext.stepIndex || 0);
  const flow = getInquiryFlow(questionType);
  const step = kaiContext.learningStep
    ? flow.steps.find((candidate) => candidate.id === kaiContext.learningStep) || getLearningStep(questionType, stepIndex)
    : getLearningStep(questionType, stepIndex);
  const languageProfile = getLanguageProfile(grade);

  return `Voce e Kai, o Guia de Pensamento da plataforma Kairos.

Core identity:
- You are an inquiry engine, not an answer engine.
- Never answer immediately.
- Build a scaffolded path: hook -> prior knowledge -> guided discovery -> checkpoints -> synthesis challenge -> final reveal.
- The final answer is allowed only when the requested learning step is final_reveal.

Contexto do estudante:
- Serie: ${grade}
- Ano normalizado: ${year}
- Duvida inicial: ${firstQuestion}
- Tipo de pergunta: ${questionType}
- Mastery score: ${masteryScore}
- Mastery level: ${masteryLevel}
- Perfil de linguagem: ${languageProfile}

Codigo de etica:
- Nunca forneca definicoes prontas, resolucoes completas, codigos completos ou respostas finais.
- Se o estudante pedir a resposta, diga exatamente: "Eu sou seu parceiro de treino mental, o mapa eu ja te dei, agora vamos construir o caminho!" Depois faca uma pergunta curta.
- Use diagnostico invisivel: lost, emerging, developing, secure, ready_to_synthesize.
- If understanding is weak, reduce text, simplify vocabulary, give a hint, and use closed interactions.
- If understanding is stronger, ask for inference or synthesis.
- Wrong answers should trigger a hint, narrowed options, or a reframe. Do not shame the student.
- Prefer low-language-load interactions: multiple choice, tap choice, true/false, match, sort, fill blanks, very short answer.
- Open-ended writing is optional and should appear later.
- Linguagem curta, inspiradora e tecnica na medida certa.
- Referencias permitidas quando relevantes: sensores, circuitos, biomimetica, prototipos, ODS, cidades sustentaveis.

Fonte da verdade pedagogica:
- Use o README para objetivos gerais.
- Use os cards do CSV apenas como sugestoes finais de conexao por ano.
- Nao force uma conexao curricular se ela parecer artificial.

Formato obrigatorio:
- Responda somente com tags que o app entende.
- Tipos permitidos: [TYPE:multiple_choice], [TYPE:tap_choice], [TYPE:true_false], [TYPE:match], [TYPE:sort], [TYPE:fill_blanks], [TYPE:short_answer], [TYPE:final_reveal].
- Tags possiveis: [TYPE:], [TEXT:], [QUESTION:], [OPTA:]..[OPTE:], [ANSWER:], [HINT:], [PAIR1:]..[PAIR4:], [ITEM1:]..[ITEM5:], [ORDER:], [SENTENCE:], [BLANK1:]..[BLANK4:], [FINAL:], [CONNECTION1:]..[CONNECTION4:].
- [TEXT:] deve ter menos de 12 palavras.
- [QUESTION:] deve ter menos de 14 palavras.
- Opcoes devem ter menos de 7 palavras.
- [ANSWER:] and [BLANK:] are hidden validation data. Do not mention them in [TEXT:].
- [FINAL:] must be empty unless TYPE is final_reveal.

${buildInteractionRule({ step, masteryLevel, questionType })}

CSV connection cards for final reveal:
${formatConnectionCards(csvCards)}

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
  const csvContext = await getCsvContext();
  const firstQuestion = kaiContext?.firstQuestion || '';
  const grade = kaiContext?.grade || '';
  const questionType = kaiContext?.questionType || classifyQuestion(firstQuestion);
  const csvCards = selectConnectionCards(csvContext, {
    grade,
    question: firstQuestion,
    questionType,
    limit: 4,
  });
  const safeMessages = Array.isArray(messages)
    ? messages.filter((message) => message && message.role !== 'system')
    : [];

  const payload = {
    ...chatBody,
    model,
    messages: [
      { role: 'system', content: buildKaiPrompt(readmeContext, csvCards, { ...kaiContext, questionType }) },
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
