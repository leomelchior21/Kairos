/**
 * @typedef {'concept'|'fact'|'mechanism'|'comparison'|'problem_solution'} QuestionType
 * @typedef {'multiple_choice'|'tap_choice'|'true_false'|'match'|'sort'|'fill_blanks'|'short_answer'|'final_reveal'} InteractionType
 * @typedef {'lost'|'emerging'|'developing'|'secure'|'ready_to_synthesize'} MasteryLevel
 * @typedef {string} LearningStepId
 *
 * @typedef {Object} LearningStep
 * @property {LearningStepId} id
 * @property {string} label
 * @property {InteractionType} interaction
 * @property {string} goal
 * @property {string} coverage
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
    { id: 'identify_kind', label: 'What kind of idea?', interaction: 'multiple_choice', goal: 'Classify what the topic is.', coverage: 'Decide whether the topic is a movement, object, process, event, place, value, or system.' },
    { id: 'core_features', label: 'Core features', interaction: 'tap_choice', goal: 'Find essential traits.', coverage: 'Identify the traits that must be present for the concept to count.' },
    { id: 'examples_boundary', label: 'Examples and limits', interaction: 'match', goal: 'Separate examples from lookalikes.', coverage: 'Use examples and nonexamples to define the boundary of the concept.' },
    { id: 'misconception_check', label: 'Misconception check', interaction: 'true_false', goal: 'Test a common confusion.', coverage: 'Address one likely misconception without giving a lecture.' },
    { id: 'relationships', label: 'Why it matters', interaction: 'multiple_choice', goal: 'Connect the idea to impact.', coverage: 'Connect the concept to cause, purpose, consequence, or real-world context.' },
    { id: 'application', label: 'Use it somewhere', interaction: 'multiple_choice', goal: 'Apply the concept.', coverage: 'Apply the concept in a concrete school, maker, social, environmental, or daily-life situation.' },
    { id: 'micro_synthesis', label: 'Tiny explanation', interaction: 'short_answer', goal: 'Say the idea briefly.', coverage: 'Ask for a five-word-or-less content phrase that shows the student can name the central idea.' },
    { id: 'synthesis_challenge', label: 'Synthesis', interaction: 'fill_blanks', goal: 'Complete the topic sentence.', coverage: 'Make a final sentence that includes the concept type, core traits, and impact.' },
    { id: 'final_reveal', label: 'Final reveal', interaction: 'final_reveal', goal: 'Confirm the answer earned by reasoning.', coverage: 'Reveal the concise answer and connect it to the student year.' },
  ],
  fact: [
    { id: 'clarify_target', label: 'What fact is needed?', interaction: 'multiple_choice', goal: 'Identify the exact fact target.', coverage: 'Clarify whether the question asks for a name, number, place, date, person, measurement, or category.' },
    { id: 'criterion', label: 'Criterion', interaction: 'multiple_choice', goal: 'Choose the deciding rule.', coverage: 'Identify the rule or criterion that makes the fact valid.' },
    { id: 'candidate_check', label: 'Candidate check', interaction: 'tap_choice', goal: 'Compare possible answers.', coverage: 'Look at plausible candidates and distractors before revealing the fact.' },
    { id: 'evidence_check', label: 'Evidence check', interaction: 'true_false', goal: 'Test one evidence claim.', coverage: 'Check what evidence supports the fact.' },
    { id: 'boundary_case', label: 'Boundary case', interaction: 'multiple_choice', goal: 'Notice a caveat.', coverage: 'Handle a common exception, measurement caveat, or ambiguity.' },
    { id: 'micro_synthesis', label: 'Tiny evidence', interaction: 'short_answer', goal: 'Name the evidence.', coverage: 'Ask for a short phrase naming the criterion or evidence.' },
    { id: 'synthesis_challenge', label: 'Synthesis', interaction: 'fill_blanks', goal: 'Complete the factual sentence.', coverage: 'Make a final sentence with the criterion, answer, and evidence.' },
    { id: 'final_reveal', label: 'Final reveal', interaction: 'final_reveal', goal: 'Reveal the fact and why it fits.', coverage: 'Reveal the fact plus the criterion that makes it true.' },
  ],
  mechanism: [
    { id: 'input_output', label: 'Input and output', interaction: 'multiple_choice', goal: 'Find what enters and leaves.', coverage: 'Identify the starting input and final output of the mechanism.' },
    { id: 'parts_roles', label: 'Parts and roles', interaction: 'match', goal: 'Match parts to jobs.', coverage: 'Name important parts and what each part does.' },
    { id: 'sequence', label: 'Order the process', interaction: 'sort', goal: 'Put steps in order.', coverage: 'Order the mechanism from first action to result.' },
    { id: 'cause_effect', label: 'Cause and effect', interaction: 'true_false', goal: 'Test the causal link.', coverage: 'Check the cause-effect relationship that makes the mechanism work.' },
    { id: 'variable_change', label: 'What changes?', interaction: 'multiple_choice', goal: 'Spot a variable.', coverage: 'Identify what changes if one input, part, or condition changes.' },
    { id: 'application', label: 'Use the model', interaction: 'multiple_choice', goal: 'Apply the mechanism.', coverage: 'Apply the mechanism to a concrete example or maker analogy.' },
    { id: 'synthesis_challenge', label: 'Synthesis', interaction: 'fill_blanks', goal: 'Complete the mechanism sentence.', coverage: 'Make a final sentence with input, process, and output.' },
    { id: 'final_reveal', label: 'Final reveal', interaction: 'final_reveal', goal: 'Reveal the complete explanation.', coverage: 'Reveal the full mechanism in a concise sequence.' },
  ],
  comparison: [
    { id: 'comparison_axis', label: 'Comparison axis', interaction: 'tap_choice', goal: 'Choose the shared feature.', coverage: 'Choose a fair feature or criterion for comparing both sides.' },
    { id: 'side_a', label: 'First side', interaction: 'multiple_choice', goal: 'Identify side A.', coverage: 'Identify a key trait, purpose, or role of the first item.' },
    { id: 'side_b', label: 'Second side', interaction: 'multiple_choice', goal: 'Identify side B.', coverage: 'Identify a key trait, purpose, or role of the second item.' },
    { id: 'shared_traits', label: 'Similarities', interaction: 'true_false', goal: 'Test one similarity.', coverage: 'Check what both sides share.' },
    { id: 'differences', label: 'Differences', interaction: 'match', goal: 'Match traits to sides.', coverage: 'Match distinctive traits to the correct side.' },
    { id: 'why_difference_matters', label: 'Why it matters', interaction: 'multiple_choice', goal: 'Explain the importance.', coverage: 'Connect the contrast to meaning, impact, use, or consequence.' },
    { id: 'synthesis_challenge', label: 'Synthesis', interaction: 'fill_blanks', goal: 'Complete the comparison sentence.', coverage: 'Make a final sentence with axis, similarity, and difference.' },
    { id: 'final_reveal', label: 'Final reveal', interaction: 'final_reveal', goal: 'Reveal the comparison.', coverage: 'Reveal a concise comparison organized by the chosen axis.' },
  ],
  problem_solution: [
    { id: 'define_problem', label: 'Define the problem', interaction: 'tap_choice', goal: 'Name what must change.', coverage: 'Identify the central problem, harm, or need.' },
    { id: 'causes', label: 'Causes', interaction: 'match', goal: 'Match causes to effects.', coverage: 'Connect causes to visible effects or symptoms.' },
    { id: 'constraints', label: 'Constraints', interaction: 'true_false', goal: 'Test one limit.', coverage: 'Recognize a limit such as cost, time, safety, fairness, materials, or environment.' },
    { id: 'solution_options', label: 'Possible solutions', interaction: 'multiple_choice', goal: 'Choose a fitting action.', coverage: 'Compare possible actions that could address the cause.' },
    { id: 'tradeoffs', label: 'Tradeoffs', interaction: 'match', goal: 'Match action to tradeoff.', coverage: 'Connect solution options to benefits and tradeoffs.' },
    { id: 'test_plan', label: 'Test plan', interaction: 'sort', goal: 'Order a simple test.', coverage: 'Order a small investigation or prototype test.' },
    { id: 'synthesis_challenge', label: 'Synthesis', interaction: 'fill_blanks', goal: 'Complete the solution sentence.', coverage: 'Make a final sentence with problem, cause, action, and expected result.' },
    { id: 'final_reveal', label: 'Final reveal', interaction: 'final_reveal', goal: 'Reveal the solution pattern.', coverage: 'Reveal a concise problem-solution explanation.' },
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
