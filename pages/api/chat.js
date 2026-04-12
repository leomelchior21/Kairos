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

function buildInteractionRule({ step, masteryLevel, questionType, firstQuestion }) {
  const base = [
    `Learning step: ${step.id} (${step.label}).`,
    `Question type: ${questionType}.`,
    `Mastery level: ${masteryLevel}.`,
    `Student topic: ${firstQuestion}.`,
    `Goal: ${step.goal}.`,
  ];

  const simplify = masteryLevel === 'lost' || masteryLevel === 'emerging'
    ? 'Use very short words, concrete clues, and closed choices. If the last answer was weak, reframe without any negative label.'
    : 'Allow one small inference, but still keep the task short.';

  const contentGuard = [
    'Kai chooses the scaffold. The student must never choose the activity, strategy, lens, path, move, or interaction type.',
    'All visible choices must be about the student topic itself: possible meanings, examples, causes, evidence, steps, or claims.',
    'Never use visible options like "find a clue", "test a claim", "match examples", "build a sentence", "best lens", or "which move helps".',
    'Never copy schema words into the response. Invalid visible text includes: "max 10 words", "content question", "topic option", "one content clue", "expected word", or "meaning/example".',
  ].join('\n');

  const stepGuidance = {
    hook: 'Create a content hook. Ask the student to identify a concrete clue inside the topic, not the learning strategy.',
    prior_knowledge: 'Create one short content claim about the topic for true/false.',
    guided_discovery: 'Use topic words, examples, causes, actors, or process parts.',
    checkpoint: 'Ask for the strongest content meaning, evidence, cause, contrast, or action.',
    synthesis_challenge: 'Use the exact concepts discovered in this topic. The blanks are content words.',
    final_reveal: 'Now reveal the concise answer and add curriculum connection cards if relevant.',
  };

  const typeRules = {
    multiple_choice: 'Use tag names TYPE, TEXT, QUESTION, OPTA, OPTB, OPTC, OPTD, ANSWER, HINT. TYPE must be multiple_choice. Fill every other tag with real topic content.',
    tap_choice: 'Use tag names TYPE, TEXT, QUESTION, OPTA, OPTB, OPTC, OPTD, ANSWER, HINT. TYPE must be tap_choice. Fill every other tag with real topic content.',
    true_false: 'Use tag names TYPE, TEXT, QUESTION, ANSWER, HINT. TYPE must be true_false. TEXT is a real topic claim. ANSWER is true or false.',
    match: 'Use tag names TYPE, TEXT, QUESTION, PAIR1, PAIR2, PAIR3, HINT. TYPE must be match. Each pair uses real topic content in left|right form.',
    sort: 'Use tag names TYPE, TEXT, QUESTION, ITEM1, ITEM2, ITEM3, ITEM4, ORDER, HINT. TYPE must be sort. Items are real topic steps. ORDER is numeric.',
    fill_blanks: 'Use tag names TYPE, TEXT, SENTENCE, BLANK1, BLANK2, BLANK3, HINT. TYPE must be fill_blanks. Sentence and blanks use real topic concepts.',
    short_answer: 'Use tag names TYPE, TEXT, QUESTION, HINT. TYPE must be short_answer. The question asks for a real content answer in five words or less.',
    final_reveal: 'Use tag names TYPE, TEXT, FINAL, CONNECTION1, CONNECTION2. TYPE must be final_reveal. FINAL is the concise answer. Each connection uses real title|discipline|reason.',
  };

  return [...base, simplify, contentGuard, stepGuidance[step.id], typeRules[step.interaction]].join('\n');
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
  const supportMode = kaiContext.supportMode || 'normal';
  const routeAdjustments = Number(kaiContext.routeAdjustments || 0);
  const stepIndex = Number(kaiContext.stepIndex || 0);
  const flow = getInquiryFlow(questionType);
  const step = kaiContext.learningStep
    ? flow.steps.find((candidate) => candidate.id === kaiContext.learningStep) || getLearningStep(questionType, stepIndex)
    : getLearningStep(questionType, stepIndex);
  const preferredInteraction = kaiContext.preferredInteraction || step.interaction;
  const effectiveStep = { ...step, interaction: preferredInteraction };
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
- Support mode: ${supportMode}
- Route adjustments: ${routeAdjustments}
- Perfil de linguagem: ${languageProfile}

Codigo de etica:
- Nunca forneca definicoes prontas, resolucoes completas, codigos completos ou respostas finais.
- Se o estudante pedir a resposta, diga exatamente: "Eu sou seu parceiro de treino mental, o mapa eu ja te dei, agora vamos construir o caminho!" Depois faca uma pergunta curta.
- Use diagnostico invisivel: lost, emerging, developing, secure, ready_to_synthesize.
- If understanding is weak, reduce text, simplify vocabulary, give a hint, and use closed interactions.
- If understanding is stronger, ask for inference or synthesis.
- If the last answer shows weak evidence, silently change tactics. Avoid all negative labels and do not ask the student to repeat the same task.
- Weak evidence should trigger a simpler route: a concrete example, a narrower true/false claim, or fewer content choices.
- Prefer low-language-load interactions: multiple choice, tap choice, true/false, match, sort, fill blanks, very short answer.
- Open-ended writing is optional and should appear later.
- Kai escolhe a interacao e a estrategia. O estudante so escolhe respostas sobre o conteudo.
- Nunca pergunte qual caminho, movimento, lente, estrategia ou tipo de interacao ajuda mais.
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

${supportMode === 'reroute' ? 'ROUTE ADJUSTMENT: The previous answer was weak or partial. Do not mention that. Create a simpler content task and continue calmly.' : ''}

${buildInteractionRule({ step: effectiveStep, masteryLevel, questionType, firstQuestion })}

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
