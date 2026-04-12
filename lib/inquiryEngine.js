/**
 * @typedef {'concept'|'fact'|'mechanism'|'comparison'|'problem_solution'} QuestionType
 * @typedef {'multiple_choice'|'tap_choice'|'true_false'|'match'|'sort'|'fill_blanks'|'short_answer'|'final_reveal'} InteractionType
 * @typedef {'lost'|'emerging'|'developing'|'secure'|'ready_to_synthesize'} MasteryLevel
 * @typedef {'hook'|'prior_knowledge'|'guided_discovery'|'checkpoint'|'synthesis_challenge'|'final_reveal'} LearningStepId
 *
 * @typedef {Object} LearningStep
 * @property {LearningStepId} id
 * @property {string} label
 * @property {InteractionType} interaction
 * @property {string} goal
 *
 * @typedef {Object} InquiryFlow
 * @property {QuestionType} questionType
 * @property {LearningStep[]} steps
 *
 * @typedef {Object} StudentState
 * @property {string} grade
 * @property {string} year
 * @property {string} question
 * @property {QuestionType} questionType
 * @property {number} masteryScore
 * @property {MasteryLevel} masteryLevel
 * @property {number} stepIndex
 * @property {Array<Object>} evidence
 */

export const QUESTION_TYPES = ['concept', 'fact', 'mechanism', 'comparison', 'problem_solution'];
export const INTERACTION_TYPES = [
  'multiple_choice',
  'tap_choice',
  'true_false',
  'match',
  'sort',
  'fill_blanks',
  'short_answer',
  'final_reveal',
];
export const MASTERY_LEVELS = ['lost', 'emerging', 'developing', 'secure', 'ready_to_synthesize'];

const FLOW_LIBRARY = {
  concept: [
    { id: 'hook', label: 'Hook', interaction: 'multiple_choice', goal: 'Notice one content clue.' },
    { id: 'prior_knowledge', label: 'Prior knowledge', interaction: 'true_false', goal: 'Test one topic claim.' },
    { id: 'guided_discovery', label: 'Guided discovery', interaction: 'match', goal: 'Match topic examples to meanings.' },
    { id: 'checkpoint', label: 'Checkpoint', interaction: 'multiple_choice', goal: 'Choose the strongest content meaning.' },
    { id: 'synthesis_challenge', label: 'Synthesis', interaction: 'fill_blanks', goal: 'Complete the topic sentence.' },
    { id: 'final_reveal', label: 'Final reveal', interaction: 'final_reveal', goal: 'Confirm the answer earned by reasoning.' },
  ],
  fact: [
    { id: 'hook', label: 'Hook', interaction: 'multiple_choice', goal: 'Choose the content criterion.' },
    { id: 'prior_knowledge', label: 'Prior knowledge', interaction: 'true_false', goal: 'Test one evidence claim.' },
    { id: 'guided_discovery', label: 'Guided discovery', interaction: 'multiple_choice', goal: 'Choose the deciding content evidence.' },
    { id: 'checkpoint', label: 'Checkpoint', interaction: 'short_answer', goal: 'State the evidence in a few words.' },
    { id: 'synthesis_challenge', label: 'Synthesis', interaction: 'fill_blanks', goal: 'Complete the factual sentence.' },
    { id: 'final_reveal', label: 'Final reveal', interaction: 'final_reveal', goal: 'Reveal the fact and why it fits.' },
  ],
  mechanism: [
    { id: 'hook', label: 'Hook', interaction: 'multiple_choice', goal: 'Find the input-output pattern.' },
    { id: 'prior_knowledge', label: 'Prior knowledge', interaction: 'true_false', goal: 'Test a simple mechanism claim.' },
    { id: 'guided_discovery', label: 'Guided discovery', interaction: 'sort', goal: 'Order the process steps.' },
    { id: 'checkpoint', label: 'Checkpoint', interaction: 'multiple_choice', goal: 'Choose the cause of the change.' },
    { id: 'synthesis_challenge', label: 'Synthesis', interaction: 'fill_blanks', goal: 'Complete the mechanism sentence.' },
    { id: 'final_reveal', label: 'Final reveal', interaction: 'final_reveal', goal: 'Reveal the complete explanation.' },
  ],
  comparison: [
    { id: 'hook', label: 'Hook', interaction: 'tap_choice', goal: 'Choose the content feature to compare.' },
    { id: 'prior_knowledge', label: 'Prior knowledge', interaction: 'true_false', goal: 'Test one similarity or difference.' },
    { id: 'guided_discovery', label: 'Guided discovery', interaction: 'match', goal: 'Match traits to each side.' },
    { id: 'checkpoint', label: 'Checkpoint', interaction: 'multiple_choice', goal: 'Pick the clearest contrast.' },
    { id: 'synthesis_challenge', label: 'Synthesis', interaction: 'fill_blanks', goal: 'Complete the comparison sentence.' },
    { id: 'final_reveal', label: 'Final reveal', interaction: 'final_reveal', goal: 'Reveal the comparison.' },
  ],
  problem_solution: [
    { id: 'hook', label: 'Hook', interaction: 'tap_choice', goal: 'Choose the content problem focus.' },
    { id: 'prior_knowledge', label: 'Prior knowledge', interaction: 'true_false', goal: 'Test one cause claim.' },
    { id: 'guided_discovery', label: 'Guided discovery', interaction: 'match', goal: 'Match causes to possible actions.' },
    { id: 'checkpoint', label: 'Checkpoint', interaction: 'multiple_choice', goal: 'Pick the most testable next step.' },
    { id: 'synthesis_challenge', label: 'Synthesis', interaction: 'fill_blanks', goal: 'Complete the solution sentence.' },
    { id: 'final_reveal', label: 'Final reveal', interaction: 'final_reveal', goal: 'Reveal the solution pattern.' },
  ],
};

export function normalizeYear(grade = '') {
  const match = String(grade).match(/[6-9]/);
  return match ? `${match[0]}o ano` : '';
}

export function classifyQuestion(question = '') {
  const q = question.toLowerCase().trim();
  if (/\b(compare|comparison|versus|vs\.?|difference|different|similar|better|worse)\b/.test(q)) {
    return 'comparison';
  }
  if (/^(how|why)\s+(does|do|did|can|could|would|is|are)\b/.test(q) || /\b(work|works|process|happen|happens|mechanism|function)\b/.test(q)) {
    return 'mechanism';
  }
  if (/\b(problem|solution|solve|fix|prevent|reduce|improve|protect|design|build)\b/.test(q) || /^how can\b/.test(q)) {
    return 'problem_solution';
  }
  if (/\b(tallest|largest|smallest|highest|lowest|oldest|newest|capital|population|date|year|who|where|when|which)\b/.test(q)) {
    return 'fact';
  }
  return 'concept';
}

export function getInquiryFlow(questionType = 'concept') {
  return {
    questionType: FLOW_LIBRARY[questionType] ? questionType : 'concept',
    steps: FLOW_LIBRARY[questionType] || FLOW_LIBRARY.concept,
  };
}

export function getLearningStep(questionType = 'concept', stepIndex = 0) {
  const flow = getInquiryFlow(questionType);
  return flow.steps[Math.min(Math.max(stepIndex, 0), flow.steps.length - 1)];
}

export function getMasteryLevel(score = 0) {
  const safeScore = Math.max(0, Math.min(100, Number(score) || 0));
  if (safeScore >= 85) return 'ready_to_synthesize';
  if (safeScore >= 70) return 'secure';
  if (safeScore >= 45) return 'developing';
  if (safeScore >= 20) return 'emerging';
  return 'lost';
}

export function getLanguageProfile(grade = '') {
  const year = normalizeYear(grade);
  const profiles = {
    '6o ano': 'Very simple English. Concrete words. One sentence at a time. PT-BR hints allowed.',
    '7o ano': 'Simple English. Use school science and sustainability words with examples.',
    '8o ano': 'Clear middle-school English. Use systems, evidence, health, and biology terms when relevant.',
    '9o ano': 'Slightly more abstract English. Use evidence, method, society, technology, and causality.',
  };
  return profiles[year] || profiles['7o ano'];
}

export function parseCsv(text = '') {
  const rows = [];
  let row = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"' && inQuotes && next === '"') {
      cell += '"';
      i++;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      row.push(cell);
      cell = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') i++;
      row.push(cell);
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += char;
    }
  }

  if (cell || row.length) {
    row.push(cell);
    if (row.some((value) => value.trim())) rows.push(row);
  }

  const [headers = [], ...dataRows] = rows;
  return dataRows.map((values) => {
    const record = {};
    headers.forEach((header, index) => {
      record[header.trim()] = (values[index] || '').trim();
    });
    return record;
  });
}

export function selectConnectionCards(csvText = '', { grade = '', question = '', questionType = 'concept', limit = 4 } = {}) {
  const yearDigit = (String(grade).match(/[6-9]/) || [''])[0];
  if (!yearDigit) return [];

  const terms = new Set(
    String(question)
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter((term) => term.length > 3)
  );

  return parseCsv(csvText)
    .filter((row) => String(row.Ano || '').includes(`${yearDigit}`))
    .map((row) => {
      const content = getCsvField(row, 'content');
      const objectives = getCsvField(row, 'objectives');
      const haystack = `${row.Disciplina || ''} ${content} ${objectives}`.toLowerCase();
      let score = 0;
      terms.forEach((term) => {
        if (haystack.includes(term)) score += 3;
      });
      if (questionType === 'problem_solution' && /(maker|tecnologia|projeto|solucao|problema)/i.test(haystack)) score += 2;
      if (questionType === 'mechanism' && /(modelo|processo|circuito|sistema|investig)/i.test(haystack)) score += 2;
      if (questionType === 'fact' && /(pesquisa|evidencia|dados|medida)/i.test(haystack)) score += 2;
      return { row, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ row }) => ({
      year: row.Ano || grade,
      discipline: row.Disciplina || 'Curriculo',
      title: firstLine(getCsvField(row, 'content') || 'Conexao curricular'),
      detail: firstLine(getCsvField(row, 'objectives') || 'Use essa ideia em um projeto da serie.'),
    }));
}

function getCsvField(row, kind) {
  const keys = Object.keys(row || {});
  if (kind === 'content') {
    const key = keys.find((candidate) => {
      const lower = candidate.toLowerCase();
      return lower.includes('conte') && lower.includes('tema');
    });
    return key ? row[key] : '';
  }
  if (kind === 'objectives') {
    const key = keys.find((candidate) => {
      const lower = candidate.toLowerCase();
      return lower.includes('habil') || lower.includes('objetivo');
    });
    return key ? row[key] : '';
  }
  return '';
}

function firstLine(text = '') {
  return String(text)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)[0]
    ?.slice(0, 150) || '';
}

export const EXAMPLE_FLOWS = [
  {
    question: 'What is solarpunk?',
    questionType: 'concept',
    keyConcepts: ['sustainable future', 'technology with nature', 'social imagination', 'design choices'],
    misconceptions: ['It is only solar panels.', 'It is fantasy with no practical action.', 'It means rejecting technology.'],
    steps: ['Hook multiple choice', 'Prior-knowledge true/false', 'Match examples to ideas', 'Checkpoint choice', 'Fill-in-the-blanks synthesis', 'Final reveal'],
    masteryUpdates: ['lost -> emerging', 'emerging -> developing', 'developing -> secure', 'secure -> ready_to_synthesize'],
    synthesis: 'Solarpunk imagines a ___ future where ___ and ___ work together.',
    finalAnswer: 'Solarpunk is a cultural and design movement that imagines hopeful, sustainable futures where technology, nature, and community work together.',
  },
  {
    question: 'What is the tallest mountain in the world?',
    questionType: 'fact',
    keyConcepts: ['measurement', 'above sea level', 'evidence', 'Mount Everest'],
    misconceptions: ['Tallest always means base-to-peak.', 'The answer does not depend on how we measure.', 'A fact does not need criteria.'],
    steps: ['Hook criteria choice', 'True/false measurement claim', 'Evidence choice', 'Short evidence answer', 'Fill-in-the-blanks synthesis', 'Final reveal'],
    masteryUpdates: ['lost -> emerging', 'emerging -> developing', 'developing -> secure', 'secure -> ready_to_synthesize'],
    synthesis: 'Using height above ___, the tallest mountain is ___.',
    finalAnswer: 'The tallest mountain above sea level is Mount Everest. If measured from base to peak, Mauna Kea is often discussed separately.',
  },
  {
    question: 'What was the cold war?',
    questionType: 'concept',
    keyConcepts: ['ideological conflict', 'United States', 'Soviet Union', 'proxy wars', 'nuclear tension'],
    misconceptions: ['It was one normal battle.', 'It was cold because of weather.', 'Only soldiers were involved.'],
    steps: ['Hook clue choice', 'True/false conflict claim', 'Match actors to ideas', 'Checkpoint cause choice', 'Fill-in-the-blanks synthesis', 'Final reveal'],
    masteryUpdates: ['lost -> emerging', 'emerging -> developing', 'developing -> secure', 'secure -> ready_to_synthesize'],
    synthesis: 'The Cold War was a ___ conflict between the ___ and the ___.',
    finalAnswer: 'The Cold War was a long political, ideological, and military rivalry after World War II, mainly between the United States and the Soviet Union, fought through pressure, alliances, arms races, and proxy conflicts rather than direct war between them.',
  },
];
