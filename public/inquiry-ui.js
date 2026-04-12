var USE_LOCAL_LM = window.location.protocol === 'file:' ||
  new URLSearchParams(window.location.search).get('local') === '1';
var API_URL = USE_LOCAL_LM ? 'http://localhost:1234/v1/chat/completions' : '/api/chat';

initLandingCanvas();

/**
 * @typedef {'concept'|'fact'|'mechanism'|'comparison'|'problem_solution'} QuestionType
 * @typedef {'multiple_choice'|'tap_choice'|'true_false'|'match'|'sort'|'fill_blanks'|'short_answer'|'final_reveal'} InteractionType
 * @typedef {'lost'|'emerging'|'developing'|'secure'|'ready_to_synthesize'} MasteryLevel
 * @typedef {{id:string,label:string,interaction:InteractionType,goal:string,coverage:string}} LearningStep
 * @typedef {{questionType:QuestionType,steps:LearningStep[]}} InquiryFlow
 * @typedef {{grade:string,year:string,question:string,questionType:QuestionType,masteryScore:number,masteryLevel:MasteryLevel,stepIndex:number,evidence:Array}} StudentState
 */

var FLOW_LIBRARY = {
  concept: [
    { id: 'identify_kind', label: 'What kind of idea?', interaction: 'multiple_choice', goal: 'Classify what the topic is.', coverage: 'Decide whether the topic is a movement, object, process, event, place, value, or system.' },
    { id: 'core_features', label: 'Core features', interaction: 'tap_choice', goal: 'Find essential traits.', coverage: 'Identify the traits that must be present for the concept to count.' },
    { id: 'examples_boundary', label: 'Examples and limits', interaction: 'match', goal: 'Separate examples from lookalikes.', coverage: 'Use examples and nonexamples to define the boundary of the concept.' },
    { id: 'misconception_check', label: 'Misconception check', interaction: 'true_false', goal: 'Test a common confusion.', coverage: 'Address one likely misconception without giving a lecture.' },
    { id: 'relationships', label: 'Why it matters', interaction: 'multiple_choice', goal: 'Connect the idea to impact.', coverage: 'Connect the concept to cause, purpose, consequence, or real-world context.' },
    { id: 'application', label: 'Use it somewhere', interaction: 'multiple_choice', goal: 'Apply the concept.', coverage: 'Apply the concept in a concrete school, maker, social, environmental, or daily-life situation.' },
    { id: 'micro_synthesis', label: 'Tiny explanation', interaction: 'short_answer', goal: 'Say the idea briefly.', coverage: 'Ask for a five-word-or-less content phrase that shows the student can name the central idea.' },
    { id: 'synthesis_challenge', label: 'Synthesis challenge', interaction: 'fill_blanks', goal: 'Complete the topic sentence.', coverage: 'Make a final sentence that includes the concept type, core traits, and impact.' },
    { id: 'final_reveal', label: 'Final reveal', interaction: 'final_reveal', goal: 'Confirm the earned answer.', coverage: 'Reveal the concise answer and connect it to the student year.' }
  ],
  fact: [
    { id: 'clarify_target', label: 'What fact is needed?', interaction: 'multiple_choice', goal: 'Identify the exact fact target.', coverage: 'Clarify whether the question asks for a name, number, place, date, person, measurement, or category.' },
    { id: 'criterion', label: 'Criterion', interaction: 'multiple_choice', goal: 'Choose the deciding rule.', coverage: 'Identify the rule or criterion that makes the fact valid.' },
    { id: 'candidate_check', label: 'Candidate check', interaction: 'tap_choice', goal: 'Compare possible answers.', coverage: 'Look at plausible candidates and distractors before revealing the fact.' },
    { id: 'evidence_check', label: 'Evidence check', interaction: 'true_false', goal: 'Test one evidence claim.', coverage: 'Check what evidence supports the fact.' },
    { id: 'boundary_case', label: 'Boundary case', interaction: 'multiple_choice', goal: 'Notice a caveat.', coverage: 'Handle a common exception, measurement caveat, or ambiguity.' },
    { id: 'micro_synthesis', label: 'Tiny evidence', interaction: 'short_answer', goal: 'Name the evidence.', coverage: 'Ask for a short phrase naming the criterion or evidence.' },
    { id: 'synthesis_challenge', label: 'Synthesis challenge', interaction: 'fill_blanks', goal: 'Complete the factual sentence.', coverage: 'Make a final sentence with the criterion, answer, and evidence.' },
    { id: 'final_reveal', label: 'Final reveal', interaction: 'final_reveal', goal: 'Reveal the answer.', coverage: 'Reveal the fact plus the criterion that makes it true.' }
  ],
  mechanism: [
    { id: 'input_output', label: 'Input and output', interaction: 'multiple_choice', goal: 'Find what enters and leaves.', coverage: 'Identify the starting input and final output of the mechanism.' },
    { id: 'parts_roles', label: 'Parts and roles', interaction: 'match', goal: 'Match parts to jobs.', coverage: 'Name important parts and what each part does.' },
    { id: 'sequence', label: 'Order the process', interaction: 'sort', goal: 'Put steps in order.', coverage: 'Order the mechanism from first action to result.' },
    { id: 'cause_effect', label: 'Cause and effect', interaction: 'true_false', goal: 'Test the causal link.', coverage: 'Check the cause-effect relationship that makes the mechanism work.' },
    { id: 'variable_change', label: 'What changes?', interaction: 'multiple_choice', goal: 'Spot a variable.', coverage: 'Identify what changes if one input, part, or condition changes.' },
    { id: 'application', label: 'Use the model', interaction: 'multiple_choice', goal: 'Apply the mechanism.', coverage: 'Apply the mechanism to a concrete example or maker analogy.' },
    { id: 'synthesis_challenge', label: 'Synthesis challenge', interaction: 'fill_blanks', goal: 'Complete the mechanism sentence.', coverage: 'Make a final sentence with input, process, and output.' },
    { id: 'final_reveal', label: 'Final reveal', interaction: 'final_reveal', goal: 'Reveal the explanation.', coverage: 'Reveal the full mechanism in a concise sequence.' }
  ],
  comparison: [
    { id: 'comparison_axis', label: 'Comparison axis', interaction: 'tap_choice', goal: 'Choose the shared feature.', coverage: 'Choose a fair feature or criterion for comparing both sides.' },
    { id: 'side_a', label: 'First side', interaction: 'multiple_choice', goal: 'Identify side A.', coverage: 'Identify a key trait, purpose, or role of the first item.' },
    { id: 'side_b', label: 'Second side', interaction: 'multiple_choice', goal: 'Identify side B.', coverage: 'Identify a key trait, purpose, or role of the second item.' },
    { id: 'shared_traits', label: 'Similarities', interaction: 'true_false', goal: 'Test one similarity.', coverage: 'Check what both sides share.' },
    { id: 'differences', label: 'Differences', interaction: 'match', goal: 'Match traits to sides.', coverage: 'Match distinctive traits to the correct side.' },
    { id: 'why_difference_matters', label: 'Why it matters', interaction: 'multiple_choice', goal: 'Explain the importance.', coverage: 'Connect the contrast to meaning, impact, use, or consequence.' },
    { id: 'synthesis_challenge', label: 'Synthesis challenge', interaction: 'fill_blanks', goal: 'Complete the comparison sentence.', coverage: 'Make a final sentence with axis, similarity, and difference.' },
    { id: 'final_reveal', label: 'Final reveal', interaction: 'final_reveal', goal: 'Reveal the comparison.', coverage: 'Reveal a concise comparison organized by the chosen axis.' }
  ],
  problem_solution: [
    { id: 'define_problem', label: 'Define the problem', interaction: 'tap_choice', goal: 'Name what must change.', coverage: 'Identify the central problem, harm, or need.' },
    { id: 'causes', label: 'Causes', interaction: 'match', goal: 'Match causes to effects.', coverage: 'Connect causes to visible effects or symptoms.' },
    { id: 'constraints', label: 'Constraints', interaction: 'true_false', goal: 'Test one limit.', coverage: 'Recognize a limit such as cost, time, safety, fairness, materials, or environment.' },
    { id: 'solution_options', label: 'Possible solutions', interaction: 'multiple_choice', goal: 'Choose a fitting action.', coverage: 'Compare possible actions that could address the cause.' },
    { id: 'tradeoffs', label: 'Tradeoffs', interaction: 'match', goal: 'Match action to tradeoff.', coverage: 'Connect solution options to benefits and tradeoffs.' },
    { id: 'test_plan', label: 'Test plan', interaction: 'sort', goal: 'Order a simple test.', coverage: 'Order a small investigation or prototype test.' },
    { id: 'synthesis_challenge', label: 'Synthesis challenge', interaction: 'fill_blanks', goal: 'Complete the solution sentence.', coverage: 'Make a final sentence with problem, cause, action, and expected result.' },
    { id: 'final_reveal', label: 'Final reveal', interaction: 'final_reveal', goal: 'Reveal the pattern.', coverage: 'Reveal a concise problem-solution explanation.' }
  ]
};

var state = createStudentState();
var chatHistory = [];
var busy = false;
var sortOrder = [];

function initLandingCanvas() {
  var canvas = document.getElementById('kai-canvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var width = 0;
  var height = 0;
  var tick = 0;

  var blobs = [
    { ox: 0.50, oy: 0.46, r: 0.50, sx: 0.08, sy: 0.07, ph: 0.0, c0: [190,255,165], c1: [24,219,123], c2: [0,130,70], c3: [0,45,22] },
    { ox: 0.38, oy: 0.55, r: 0.36, sx: 0.11, sy: 0.10, ph: 2.0, c0: [24,219,123], c1: [0,110,55], c2: [0,65,30], c3: [0,18,8] },
    { ox: 0.62, oy: 0.40, r: 0.28, sx: 0.13, sy: 0.09, ph: 4.0, c0: [170,255,170], c1: [20,190,95], c2: [0,90,45], c3: [0,28,14] }
  ];

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  function draw() {
    tick += 0.0035;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#07100d';
    ctx.fillRect(0, 0, width, height);

    blobs.forEach(function(blob) {
      var cx = width * (blob.ox + Math.sin(tick * 0.55 + blob.ph) * blob.sx);
      var cy = height * (blob.oy + Math.cos(tick * 0.45 + blob.ph) * blob.sy);
      var rx = width * (blob.r + Math.sin(tick + blob.ph) * 0.022);
      var ry = height * (blob.r * 0.82 + Math.cos(tick * 1.05 + blob.ph) * 0.020);
      var gradient = ctx.createRadialGradient(cx - rx * 0.12, cy - ry * 0.18, 0, cx, cy, Math.max(rx, ry));
      gradient.addColorStop(0, 'rgba(' + blob.c0.join(',') + ',0.88)');
      gradient.addColorStop(0.22, 'rgba(' + blob.c1.join(',') + ',0.65)');
      gradient.addColorStop(0.55, 'rgba(' + blob.c2.join(',') + ',0.30)');
      gradient.addColorStop(1, 'rgba(' + blob.c3.join(',') + ',0)');

      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(1, ry / rx);
      ctx.beginPath();
      ctx.arc(0, 0, rx, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.restore();
    });

    requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener('resize', resize);
  draw();
}


function createStudentState() {
  return {
    grade: '',
    year: '',
    question: '',
    questionType: 'concept',
    masteryScore: 0,
    masteryLevel: 'lost',
    stepIndex: 0,
    evidence: [],
    supportMode: 'normal',
    routeAdjustments: 0,
    currentInteraction: null,
    finalUnlocked: false
  };
}

function handleLandingKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    goToGrade();
  }
}

async function goToGrade() {
  var input = document.getElementById('landing-input');
  var question = input.value.trim();
  if (!question) {
    input.focus();
    input.style.borderColor = 'rgba(244,127,107,0.68)';
    setTimeout(function() { input.style.borderColor = ''; }, 900);
    return;
  }
  state.question = question;
  state.questionType = classifyQuestion(question);
  chatHistory = [{ role: 'user', content: question }];
  await showScreen('screen-grade');
}

async function selectGrade(grade) {
  state.grade = grade;
  state.year = normalizeYear(grade);
  state.stepIndex = 0;
  state.masteryScore = 0;
  state.masteryLevel = 'lost';
  state.evidence = [];
  state.supportMode = 'normal';
  state.routeAdjustments = 0;
  state.finalUnlocked = false;
  document.getElementById('mindmap-track').innerHTML = '';
  document.getElementById('question-subtitle').textContent = state.question;
  addMapNode('student', 'Starting idea', state.question, 'start');
  await showScreen('screen-main');
  buildProgressBar();
  updateHud();
  requestNextInteraction();
}

function showScreen(id) {
  return new Promise(function(resolve) {
    document.querySelectorAll('.screen').forEach(function(screen) {
      screen.classList.toggle('hidden', screen.id !== id);
    });
    setTimeout(resolve, 120);
  });
}

function classifyQuestion(question) {
  var q = question.toLowerCase().trim();
  if (/\b(compare|comparison|versus|vs\.?|difference|different|similar|better|worse)\b/.test(q)) return 'comparison';
  if (/^(how|why)\s+(does|do|did|can|could|would|is|are)\b/.test(q) || /\b(work|works|process|happen|happens|mechanism|function)\b/.test(q)) return 'mechanism';
  if (/\b(problem|solution|solve|fix|prevent|reduce|improve|protect|design|build)\b/.test(q) || /^how can\b/.test(q)) return 'problem_solution';
  if (/\b(tallest|largest|smallest|highest|lowest|oldest|newest|capital|population|date|year|who|where|when|which)\b/.test(q)) return 'fact';
  return 'concept';
}

function normalizeYear(grade) {
  var match = String(grade || '').match(/[6-9]/);
  return match ? match[0] + 'o ano' : '';
}

function getInquiryFlow(questionType) {
  return { questionType: questionType, steps: FLOW_LIBRARY[questionType] || FLOW_LIBRARY.concept };
}

function getCurrentStep() {
  var flow = getInquiryFlow(state.questionType);
  return flow.steps[Math.min(state.stepIndex, flow.steps.length - 1)];
}

function getRequestStep() {
  var step = getCurrentStep();
  if (state.supportMode !== 'reroute') return step;
  return {
    id: step.id,
    label: step.label,
    interaction: simplifyInteraction(step.interaction),
    goal: 'Use a simpler content angle.',
    coverage: step.coverage
  };
}

function simplifyInteraction(interaction) {
  if (interaction === 'final_reveal') return interaction;
  if (interaction === 'fill_blanks') return 'multiple_choice';
  if (interaction === 'match' || interaction === 'sort' || interaction === 'short_answer') return 'true_false';
  return 'multiple_choice';
}

function getMasteryLevel(score) {
  var safe = Math.max(0, Math.min(100, Number(score) || 0));
  if (safe >= 85) return 'ready_to_synthesize';
  if (safe >= 70) return 'secure';
  if (safe >= 45) return 'developing';
  if (safe >= 20) return 'emerging';
  return 'lost';
}

function updateMastery(result) {
  var gain = 0;
  if (result.correct) {
    if (result.type === 'fill_blanks') gain = 24;
    else if (result.type === 'match' || result.type === 'sort') gain = 22;
    else gain = 18;
  } else if (result.partial) {
    gain = 10;
  } else {
    gain = 3;
  }
  state.masteryScore = Math.max(0, Math.min(100, state.masteryScore + gain));
  state.masteryLevel = getMasteryLevel(state.masteryScore);
}

function updateHud() {
  var step = getRequestStep();
  document.getElementById('year-pill').textContent = state.year || state.grade;
  document.getElementById('type-pill').textContent = state.questionType.replace('_', ' ');
  document.getElementById('mastery-pill').textContent = state.masteryLevel.replace(/_/g, ' ');
  document.getElementById('score-pill').textContent = state.masteryScore + '%';
  document.getElementById('step-label').textContent = step.label;
  document.getElementById('step-goal').textContent = step.goal;
  updateProgress();
}

function buildProgressBar() {
  var bar = document.getElementById('progress-bar');
  var steps = getInquiryFlow(state.questionType).steps;
  bar.innerHTML = '';
  bar.style.gridTemplateColumns = 'repeat(' + steps.length + ', 1fr)';
  steps.forEach(function() {
    var seg = document.createElement('div');
    seg.className = 'progress-seg';
    bar.appendChild(seg);
  });
}

function updateProgress() {
  var segs = document.querySelectorAll('.progress-seg');
  segs.forEach(function(seg, index) {
    seg.classList.toggle('filled', index <= state.stepIndex);
  });
}

function addMapNode(kind, title, body, status) {
  var track = document.getElementById('mindmap-track');
  var node = document.createElement('article');
  node.className = 'map-node ' + kind + (status ? ' ' + status : '');
  node.innerHTML =
    '<div class="node-kicker">' + esc(kind) + '</div>' +
    '<div class="node-title">' + esc(title) + '</div>' +
    '<div class="node-body">' + esc(body).replace(/\n/g, '<br>') + '</div>';
  track.appendChild(node);
  setTimeout(function() { track.scrollTop = track.scrollHeight; }, 40);
}

function renderTyping() {
  document.getElementById('interaction-panel').innerHTML =
    '<div class="card-kicker">Kai is building the next step</div>' +
    '<div class="typing"><span class="dot"></span><span class="dot"></span><span class="dot"></span><span>thinking...</span></div>';
}

async function requestNextInteraction() {
  if (busy) return;
  busy = true;
  updateHud();
  renderTyping();
  var step = getCurrentStep();

  try {
    var raw = await callAI(step);
    var interaction = coerceInteraction(parseAIResponse(raw), step);
    state.currentInteraction = interaction;
    chatHistory.push({ role: 'assistant', content: getKaiText(interaction) });
    addMapNode('kai', step.label, getKaiText(interaction), interaction.type === 'final_reveal' ? 'final' : '');
    renderInteraction(interaction);
  } catch (error) {
    var fallback = buildFallbackInteraction(step, error.message);
    state.currentInteraction = fallback;
    addMapNode('kai', step.label, getKaiText(fallback), '');
    renderInteraction(fallback);
  }

  busy = false;
}

function renderInteraction(interaction) {
  sortOrder = [];
  var panel = document.getElementById('interaction-panel');
  var html =
    '<div class="card-kicker">' + esc(interaction.stepLabel || getCurrentStep().label) + ' - ' + esc(labelForType(interaction.type)) + '</div>' +
    '<div class="kai-text">' + esc(interaction.text || 'Try this step.') + '</div>';

  if (interaction.question) {
    html += '<div class="kai-question">' + esc(interaction.question) + '</div>';
  }

  if (interaction.type === 'multiple_choice' || interaction.type === 'tap_choice') {
    html += renderChoices(interaction);
  } else if (interaction.type === 'true_false') {
    html += renderTrueFalse();
  } else if (interaction.type === 'match') {
    html += renderMatch(interaction);
  } else if (interaction.type === 'sort') {
    html += renderSort(interaction);
  } else if (interaction.type === 'fill_blanks') {
    html += renderFillBlanks(interaction);
  } else if (interaction.type === 'short_answer') {
    html += renderShortAnswer();
  } else if (interaction.type === 'final_reveal') {
    html += renderFinalReveal(interaction);
  }

  if (interaction.type !== 'final_reveal') {
    html += '<div class="feedback" id="feedback"></div>';
    html += '<div class="action-row"><button class="primary-btn" id="submit-btn" onclick="submitCurrentInteraction()" disabled>Check</button></div>';
  }

  panel.innerHTML = html;
}

function labelForType(type) {
  var labels = {
    multiple_choice: 'multiple choice',
    tap_choice: 'tap to choose',
    true_false: 'true or false',
    match: 'match',
    sort: 'order',
    fill_blanks: 'fill in the blanks',
    short_answer: 'short answer',
    final_reveal: 'final reveal'
  };
  return labels[type] || 'task';
}

function renderChoices(interaction) {
  var letters = ['A', 'B', 'C', 'D', 'E'];
  var html = '<div class="choice-grid">';
  interaction.options.slice(0, 5).forEach(function(option, index) {
    html += '<button class="choice-btn" data-letter="' + letters[index] + '" data-value="' + esc(option) + '" onclick="selectChoice(this)">' +
      '<span class="choice-letter">' + letters[index] + '</span>' +
      '<span>' + esc(option) + '</span>' +
    '</button>';
  });
  html += '</div>';
  return html;
}

function selectChoice(button) {
  document.querySelectorAll('.choice-btn').forEach(function(item) { item.classList.remove('selected'); });
  button.classList.add('selected');
  enableSubmit(true);
}

function renderTrueFalse() {
  return '<div class="choice-grid">' +
    '<button class="choice-btn" data-letter="true" data-value="true" onclick="selectChoice(this)"><span class="choice-letter">T</span><span>True</span></button>' +
    '<button class="choice-btn" data-letter="false" data-value="false" onclick="selectChoice(this)"><span class="choice-letter">F</span><span>False</span></button>' +
    '</div>';
}

function renderMatch(interaction) {
  var rights = shuffle(interaction.pairs.map(function(pair) { return pair.right; }));
  var html = '<div class="match-list">';
  interaction.pairs.forEach(function(pair) {
    html += '<div class="match-row">' +
      '<div class="match-left">' + esc(pair.left) + '</div>' +
      '<select class="match-select" data-left="' + esc(pair.left) + '" onchange="checkFormReady()">' +
        '<option value="">Choose...</option>' +
        rights.map(function(right) { return '<option value="' + esc(right) + '">' + esc(right) + '</option>'; }).join('') +
      '</select>' +
    '</div>';
  });
  html += '</div>';
  return html;
}

function renderSort(interaction) {
  var html = '<div class="sort-list">';
  interaction.items.forEach(function(item, index) {
    html += '<div class="sort-item" data-index="' + (index + 1) + '" onclick="toggleSortItem(this)">' +
      '<span class="sort-num">?</span><span>' + esc(item) + '</span>' +
    '</div>';
  });
  html += '</div>';
  return html;
}

function toggleSortItem(item) {
  var index = item.getAttribute('data-index');
  if (item.classList.contains('placed')) {
    item.classList.remove('placed');
    sortOrder = sortOrder.filter(function(value) { return value !== index; });
  } else {
    item.classList.add('placed');
    sortOrder.push(index);
  }
  document.querySelectorAll('.sort-item').forEach(function(node) {
    var value = node.getAttribute('data-index');
    var position = sortOrder.indexOf(value);
    node.querySelector('.sort-num').textContent = position === -1 ? '?' : String(position + 1);
  });
  enableSubmit(sortOrder.length === document.querySelectorAll('.sort-item').length);
}

function renderFillBlanks(interaction) {
  var sentence = interaction.sentence || 'I used ___ to build ___.';
  var parts = sentence.split('___');
  var html = '<div class="fill-sentence">';
  parts.forEach(function(part, index) {
    html += esc(part);
    if (index < parts.length - 1) {
      html += '<input class="fill-input" maxlength="28" placeholder="..." oninput="checkFormReady()" onpaste="blockPaste(event)">';
    }
  });
  html += '</div>';
  return html;
}

function renderShortAnswer() {
  return '<textarea class="short-input" maxlength="80" rows="3" placeholder="Use 5 words or less..." oninput="checkFormReady()" onpaste="blockPaste(event)"></textarea>';
}

function renderFinalReveal(interaction) {
  var html = '<div class="final-answer">' + esc(interaction.finalAnswer || interaction.text || 'Answer unlocked.').replace(/\n/g, '<br>') + '</div>';
  if (interaction.connections && interaction.connections.length) {
    html += '<div class="connection-grid">';
    interaction.connections.forEach(function(card) {
      html += '<article class="connection-card">' +
        '<strong>' + esc(card.title) + '</strong>' +
        '<span>' + esc(card.discipline) + '</span>' +
        '<p>' + esc(card.detail) + '</p>' +
      '</article>';
    });
    html += '</div>';
    addMapNode('kai', 'Curriculum connections', interaction.connections.map(function(card) { return card.title; }).join('\n'), 'final');
  }
  return html;
}

function enableSubmit(isReady) {
  var btn = document.getElementById('submit-btn');
  if (btn) btn.disabled = !isReady;
}

function checkFormReady() {
  var interaction = state.currentInteraction;
  if (!interaction) return;
  if (interaction.type === 'match') {
    var selects = Array.from(document.querySelectorAll('.match-select'));
    enableSubmit(selects.length > 0 && selects.every(function(select) { return Boolean(select.value); }));
  } else if (interaction.type === 'fill_blanks') {
    var blanks = Array.from(document.querySelectorAll('.fill-input'));
    enableSubmit(blanks.length > 0 && blanks.every(function(input) { return input.value.trim().length > 0; }));
  } else if (interaction.type === 'short_answer') {
    var input = document.querySelector('.short-input');
    enableSubmit(input && input.value.trim().length > 1);
  }
}

function submitCurrentInteraction() {
  if (busy || !state.currentInteraction) return;
  var answer = collectStudentAnswer(state.currentInteraction);
  var result = evaluateInteraction(state.currentInteraction, answer);
  state.evidence.push(result);
  updateMastery(result);
  updateHud();

  addMapNode('student', getEvidenceTitle(result), result.summary, result.correct ? 'correct' : 'partial');
  chatHistory.push({ role: 'user', content: result.summary });

  if (result.correct) {
    showFeedback('Nice. Kai is building the next step.', 'good');
  } else if (result.partial) {
    showFeedback('Kai will use a narrower next step.', 'warn');
  } else {
    showFeedback('Kai is changing the route.', 'warn');
  }

  setTimeout(function() {
    advanceFlow(result);
    requestNextInteraction();
  }, 520);
}

function getEvidenceTitle(result) {
  if (result.correct) return 'Evidence gained';
  if (result.partial) return 'Useful clue';
  return 'New angle';
}

function collectStudentAnswer(interaction) {
  if (interaction.type === 'multiple_choice' || interaction.type === 'tap_choice' || interaction.type === 'true_false') {
    var selected = document.querySelector('.choice-btn.selected');
    return selected ? { letter: selected.getAttribute('data-letter'), value: selected.getAttribute('data-value') } : {};
  }
  if (interaction.type === 'match') {
    return Array.from(document.querySelectorAll('.match-select')).map(function(select) {
      return { left: select.getAttribute('data-left'), right: select.value };
    });
  }
  if (interaction.type === 'sort') return sortOrder.slice();
  if (interaction.type === 'fill_blanks') {
    return Array.from(document.querySelectorAll('.fill-input')).map(function(input) { return input.value.trim(); });
  }
  if (interaction.type === 'short_answer') {
    var input = document.querySelector('.short-input');
    return input ? input.value.trim() : '';
  }
  return '';
}

function evaluateInteraction(interaction, answer) {
  var correct = false;
  var partial = false;
  var summary = '';

  if (interaction.type === 'multiple_choice' || interaction.type === 'tap_choice') {
    var expected = normalizeAnswer(interaction.answer);
    correct = expected === normalizeAnswer(answer.letter) || expected === normalizeAnswer(answer.value);
    summary = answer.value || answer.letter || 'No choice';
  } else if (interaction.type === 'true_false') {
    correct = normalizeAnswer(interaction.answer) === normalizeAnswer(answer.letter);
    summary = answer.letter === 'true' ? 'True' : 'False';
  } else if (interaction.type === 'match') {
    var matches = 0;
    answer.forEach(function(item) {
      var pair = interaction.pairs.find(function(candidate) { return normalizeAnswer(candidate.left) === normalizeAnswer(item.left); });
      if (pair && normalizeAnswer(pair.right) === normalizeAnswer(item.right)) matches += 1;
    });
    correct = matches === interaction.pairs.length;
    partial = !correct && matches > 0;
    summary = answer.map(function(item) { return item.left + ' -> ' + item.right; }).join(', ');
  } else if (interaction.type === 'sort') {
    var expectedOrder = interaction.order.length ? interaction.order.map(String) : interaction.items.map(function(_, index) { return String(index + 1); });
    correct = expectedOrder.join('|') === answer.map(String).join('|');
    var positionMatches = answer.filter(function(value, index) { return String(value) === expectedOrder[index]; }).length;
    partial = !correct && positionMatches > 0;
    summary = answer.map(function(index) { return interaction.items[Number(index) - 1]; }).join(' -> ');
  } else if (interaction.type === 'fill_blanks') {
    var filled = answer.filter(Boolean).length;
    var expectedBlanks = interaction.blanks || [];
    var matched = 0;
    answer.forEach(function(value, index) {
      if (expectedBlanks[index] && normalizeAnswer(value).includes(normalizeAnswer(expectedBlanks[index]))) matched += 1;
    });
    correct = expectedBlanks.length ? matched >= Math.ceil(expectedBlanks.length * 0.66) : filled === answer.length;
    partial = !correct && (expectedBlanks.length ? matched > 0 : filled > 0);
    summary = answer.join(', ');
  } else if (interaction.type === 'short_answer') {
    var words = String(answer).trim().split(/\s+/).filter(Boolean);
    correct = words.length >= 2 && !/^(idk|dont know|i dont know|no idea)$/i.test(String(answer).trim());
    partial = !correct && words.length > 0;
    summary = String(answer);
  }

  return {
    type: interaction.type,
    step: interaction.stepId,
    correct: correct,
    partial: partial,
    summary: summary,
    masteryAfter: state.masteryScore
  };
}

function showFeedback(message, tone) {
  var feedback = document.getElementById('feedback');
  if (!feedback) return;
  feedback.className = 'feedback show ' + (tone || 'warn');
  feedback.textContent = message;
}

function advanceFlow(result) {
  var flow = getInquiryFlow(state.questionType);
  var step = getCurrentStep();

  if (!result.correct && !result.partial) {
    state.supportMode = 'reroute';
    state.routeAdjustments += 1;
    state.stepIndex = Math.min(state.stepIndex + 1, flow.steps.length - 2);
    return;
  }

  if (result.partial) {
    state.supportMode = 'reroute';
  } else {
    state.supportMode = 'normal';
  }

  if (step.id === 'synthesis_challenge' && (result.correct || state.masteryScore >= 74)) {
    state.finalUnlocked = true;
    state.stepIndex = flow.steps.length - 1;
    return;
  }
  state.stepIndex = Math.min(state.stepIndex + 1, flow.steps.length - 2);
}

async function callAI(step) {
  var body = {
    model: USE_LOCAL_LM ? 'qwen2.5:7b' : 'llama-3.3-70b-versatile',
    kaiContext: {
      grade: state.grade,
      year: state.year,
      firstQuestion: state.question,
      questionType: state.questionType,
      masteryScore: state.masteryScore,
      masteryLevel: state.masteryLevel,
      supportMode: state.supportMode,
      routeAdjustments: state.routeAdjustments,
      stepIndex: state.stepIndex,
      learningStep: step.id,
      preferredInteraction: step.interaction,
      evidence: state.evidence.slice(-5)
    },
    messages: [
      { role: 'system', content: buildLocalSystemPrompt(step) },
      chatHistory.slice(-8)
    ].flat(),
    max_tokens: step.interaction === 'final_reveal' ? 700 : 430,
    temperature: 0.62
  };

  var response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    var error = await response.json().catch(function() { return { error: 'API error ' + response.status }; });
    throw new Error(error.error && error.error.message ? error.error.message : (error.error || 'API error ' + response.status));
  }

  var data = await response.json();
  return data.choices[0].message.content;
}

function buildLocalSystemPrompt(step) {
  return [
    'You are Kai, an inquiry engine for middle school students.',
    'Do not answer immediately. Guide with one short interaction.',
    'Kai chooses the scaffold. Never ask the student which path, lens, move, activity, or interaction helps most.',
    'All visible choices must be about the student topic itself: meanings, examples, causes, evidence, steps, claims, or actions.',
    'If support mode is reroute, silently change tactics. Avoid negative labels and do not ask for the same task again.',
    'Final answers are allowed only at final_reveal.',
    'Use these tags only: [TYPE:], [TEXT:], [QUESTION:], [OPTA:]..[OPTE:], [ANSWER:], [HINT:], [PAIR1:]..[PAIR4:], [ITEM1:]..[ITEM5:], [ORDER:], [SENTENCE:], [BLANK1:]..[BLANK4:], [FINAL:], [CONNECTION1:]..[CONNECTION4:].',
    'Current step: ' + step.id + '. Preferred interaction: ' + step.interaction + '.',
    'Coverage focus: ' + (step.coverage || step.goal) + '.',
    'Question type: ' + state.questionType + '. Mastery: ' + state.masteryLevel + '. Support mode: ' + state.supportMode + '.'
  ].join('\n');
}

function parseAIResponse(raw) {
  var currentStep = getCurrentStep();
  var result = {
    type: readTag(raw, 'TYPE') || 'short_answer',
    stepId: currentStep.id,
    stepLabel: currentStep.label,
    text: readTag(raw, 'TEXT') || '',
    question: readTag(raw, 'QUESTION') || '',
    options: [],
    answer: readTag(raw, 'ANSWER') || '',
    hint: readTag(raw, 'HINT') || '',
    pairs: [],
    items: [],
    order: [],
    sentence: readTag(raw, 'SENTENCE') || '',
    blanks: [],
    finalAnswer: readTag(raw, 'FINAL') || '',
    connections: []
  };

  ['A', 'B', 'C', 'D', 'E'].forEach(function(letter) {
    var option = readTag(raw, 'OPT' + letter);
    if (option) result.options.push(option);
  });

  for (var p = 1; p <= 4; p++) {
    var pair = readTag(raw, 'PAIR' + p);
    if (pair && pair.indexOf('|') !== -1) {
      var pairParts = pair.split('|');
      result.pairs.push({ left: pairParts[0].trim(), right: pairParts.slice(1).join('|').trim() });
    }
  }

  for (var i = 1; i <= 5; i++) {
    var item = readTag(raw, 'ITEM' + i);
    if (item) result.items.push(item);
    var blank = readTag(raw, 'BLANK' + i);
    if (blank) result.blanks.push(blank);
    var connection = readTag(raw, 'CONNECTION' + i);
    if (connection) {
      var parts = connection.split('|');
      result.connections.push({
        title: (parts[0] || 'Connection').trim(),
        discipline: (parts[1] || 'Curriculum').trim(),
        detail: parts.slice(2).join('|').trim() || 'Use this idea in your year.'
      });
    }
  }

  var order = readTag(raw, 'ORDER');
  if (order) result.order = order.split(',').map(function(value) { return value.trim(); }).filter(Boolean);

  if (result.type === 'quiz') result.type = 'multiple_choice';
  if (result.type === 'open') result.type = 'short_answer';
  if (result.type === 'rearrange') result.type = 'sort';
  return result;
}

function readTag(raw, tag) {
  var match = String(raw || '').match(new RegExp('\\[' + tag + ':([\\s\\S]*?)\\]'));
  return match ? match[1].trim() : '';
}

function coerceInteraction(interaction, step) {
  interaction.stepId = step.id;
  interaction.stepLabel = step.label;
  if (step.interaction === 'final_reveal') interaction.type = 'final_reveal';
  if (!interaction.text && interaction.type !== 'final_reveal') interaction.text = 'Small step.';

  if ((interaction.type === 'multiple_choice' || interaction.type === 'tap_choice') && (interaction.options.length < 2 || isMetaInteraction(interaction))) {
    return buildFallbackInteraction(step);
  }
  if (interaction.type === 'true_false' && isMetaInteraction(interaction)) return buildFallbackInteraction(step);
  if (interaction.type === 'true_false' && !interaction.answer) interaction.answer = 'true';
  if (interaction.type === 'match' && (interaction.pairs.length < 2 || isMetaInteraction(interaction))) return buildFallbackInteraction(step);
  if (interaction.type === 'sort' && (interaction.items.length < 3 || isMetaInteraction(interaction))) return buildFallbackInteraction(step);
  if (interaction.type === 'fill_blanks' && (!interaction.sentence || isMetaInteraction(interaction))) return buildFallbackInteraction(step);
  if (interaction.type === 'final_reveal' && !interaction.finalAnswer) {
    interaction.finalAnswer = 'You built the reasoning path. The final answer is ready to confirm with Kai.';
  }
  return interaction;
}

function buildFallbackInteraction(step, errorMessage) {
  var fallback = getContentFallback();
  var base = {
    type: step.interaction,
    stepId: step.id,
    stepLabel: step.label,
    text: errorMessage ? 'Kai will use a smaller step.' : fallback.text,
    question: fallback.question,
    options: fallback.options.slice(),
    answer: 'A',
    hint: fallback.hint,
    pairs: fallback.pairs.slice(),
    items: fallback.items.slice(),
    order: ['1', '2', '3', '4'],
    sentence: fallback.sentence,
    blanks: fallback.blanks.slice(),
    finalAnswer: '',
    connections: []
  };
  if (step.interaction === 'true_false') {
    base.text = fallback.claim;
    base.question = 'True or false?';
    base.answer = 'true';
  }
  if (step.interaction === 'short_answer') {
    base.text = fallback.text;
    base.question = fallback.shortQuestion;
  }
  if (step.interaction === 'final_reveal') {
    base.type = 'final_reveal';
    base.text = 'Answer unlocked';
    base.finalAnswer = 'You completed the inquiry path. Kai could not reach the live model, so try once more to reveal the exact answer.';
  }
  return base;
}

function getContentFallback() {
  var topic = getQuestionTopic();
  var topicLabel = topic.length > 32 ? 'this topic' : topic;
  var knownFallback = getKnownTopicFallback(topic);
  if (knownFallback) return knownFallback;
  var bank = {
    concept: {
      text: 'Look at the idea itself.',
      question: 'Which meaning fits ' + topicLabel + '?',
      options: ['A bigger idea', 'Only one object', 'A random number', 'A place name'],
      claim: topicLabel + ' can be an idea with examples.',
      hint: 'A concept has meaning and examples.',
      pairs: [
        { left: topicLabel, right: 'main idea' },
        { left: 'example', right: 'real case' },
        { left: 'use', right: 'where it appears' }
      ],
      items: ['idea', 'example', 'pattern', 'meaning'],
      sentence: topicLabel + ' means ___ connected to ___.',
      blanks: ['idea', 'examples'],
      shortQuestion: 'Name one example.'
    },
    fact: {
      text: 'Find the deciding evidence.',
      question: 'Which clue proves the fact?',
      options: ['A measurement', 'A guess', 'A mood', 'A color'],
      claim: 'A fact needs evidence.',
      hint: 'Facts need a checkable clue.',
      pairs: [
        { left: 'fact', right: 'evidence' },
        { left: 'measure', right: 'number or rule' },
        { left: 'source', right: 'where to check' }
      ],
      items: ['question', 'measure', 'evidence', 'answer'],
      sentence: 'The fact is supported by ___ and ___.',
      blanks: ['evidence', 'measurement'],
      shortQuestion: 'Name the evidence clue.'
    },
    mechanism: {
      text: 'Follow the change.',
      question: 'What starts the process?',
      options: ['Input', 'Decoration', 'Opinion', 'Random label'],
      claim: 'A mechanism links input to output.',
      hint: 'Mechanisms show how change happens.',
      pairs: [
        { left: 'input', right: 'starts' },
        { left: 'process', right: 'changes' },
        { left: 'output', right: 'result' }
      ],
      items: ['input', 'process', 'output', 'effect'],
      sentence: topicLabel + ' works by turning ___ into ___.',
      blanks: ['input', 'output'],
      shortQuestion: 'Name the output.'
    },
    comparison: {
      text: 'Compare one feature.',
      question: 'Which feature can we compare?',
      options: ['Purpose', 'Random mood', 'Spelling only', 'Noise'],
      claim: 'A fair comparison uses one feature.',
      hint: 'Compare the same feature on both sides.',
      pairs: [
        { left: 'similar', right: 'same feature' },
        { left: 'different', right: 'contrast' },
        { left: 'feature', right: 'comparison point' }
      ],
      items: ['choose feature', 'side A', 'side B', 'contrast'],
      sentence: 'A fair comparison uses ___ to show ___.',
      blanks: ['feature', 'difference'],
      shortQuestion: 'Name one feature.'
    },
    problem_solution: {
      text: 'Start with the problem.',
      question: 'Which part should a solution target?',
      options: ['Cause', 'Random detail', 'Color only', 'Name only'],
      claim: 'A useful solution matches a cause.',
      hint: 'Good solutions target causes.',
      pairs: [
        { left: 'problem', right: 'what hurts' },
        { left: 'cause', right: 'why it happens' },
        { left: 'solution', right: 'what changes it' }
      ],
      items: ['problem', 'cause', 'action', 'result'],
      sentence: 'A solution changes ___ by acting on ___.',
      blanks: ['problem', 'cause'],
      shortQuestion: 'Name one cause.'
    }
  };
  return bank[state.questionType] || bank.concept;
}

function getKnownTopicFallback(topic) {
  var normalized = normalizeAnswer(topic);
  if (/solar\s*punk|solarpunk/.test(normalized)) {
    return {
      text: 'Start with the future.',
      question: 'Which clue fits solarpunk?',
      options: ['Nature plus technology', 'Only old machines', 'A mountain height', 'A winter war'],
      claim: 'Solarpunk connects nature and technology.',
      hint: 'Look for hope, design, and sustainability.',
      pairs: [
        { left: 'solar', right: 'clean energy' },
        { left: 'gardens', right: 'living cities' },
        { left: 'community', right: 'shared future' }
      ],
      items: ['imagine future', 'use clean tech', 'protect nature', 'improve community'],
      sentence: 'Solarpunk imagines ___ with ___ and ___.',
      blanks: ['future', 'nature', 'technology'],
      shortQuestion: 'Name one solarpunk clue.'
    };
  }
  if (/cold war/.test(normalized)) {
    return {
      text: 'Look for tension.',
      question: 'Which clue fits the Cold War?',
      options: ['USA versus USSR', 'Only cold weather', 'One mountain', 'Plant reproduction'],
      claim: 'The Cold War was not about weather.',
      hint: 'Think rivalry, power, and ideas.',
      pairs: [
        { left: 'USA', right: 'one superpower' },
        { left: 'USSR', right: 'rival superpower' },
        { left: 'proxy war', right: 'indirect conflict' }
      ],
      items: ['World War II ends', 'rival blocs grow', 'arms race expands', 'proxy conflicts happen'],
      sentence: 'The Cold War was a ___ between the ___ and ___.',
      blanks: ['rivalry', 'USA', 'USSR'],
      shortQuestion: 'Name one rival.'
    };
  }
  if (/tallest mountain|highest mountain|mount everest|everest/.test(normalized)) {
    return {
      text: 'Check the measurement.',
      question: 'Which clue decides tallest?',
      options: ['Height above sea level', 'Color of the rock', 'Age of the name', 'Number of climbers'],
      claim: 'Tallest depends on the measurement rule.',
      hint: 'Facts need a measuring rule.',
      pairs: [
        { left: 'above sea level', right: 'Everest' },
        { left: 'base to peak', right: 'Mauna Kea debate' },
        { left: 'measurement', right: 'evidence rule' }
      ],
      items: ['choose measurement', 'compare heights', 'check evidence', 'name mountain'],
      sentence: 'Using height above ___, the mountain is ___.',
      blanks: ['sea level', 'Everest'],
      shortQuestion: 'Name the measurement rule.'
    };
  }
  return null;
}

function isMetaInteraction(interaction) {
  var text = [
    interaction.text,
    interaction.question,
    (interaction.options || []).join(' '),
    (interaction.items || []).join(' '),
    (interaction.pairs || []).map(function(pair) { return pair.left + ' ' + pair.right; }).join(' ')
  ].join(' ').toLowerCase();
  return /which (move|path|interaction|activity|strategy)|move helps|path should|best lens|which lens|find a clue|test a claim|match examples|build a sentence|max \d+ words|content question|content match question|content order question|topic option|one content clue|one short content claim|topic word|meaning\/example|topic step|expected word|short sentence with|answer in 5 words/.test(text);
}

function getQuestionTopic() {
  return String(state.question || 'this topic')
    .replace(/^(what|who|where|when|why|how)\s+(is|are|was|were|do|does|did|can|could|would|should)\s+/i, '')
    .replace(/^(what|who|where|when|why|how)\s+/i, '')
    .replace(/[?.!]+$/g, '')
    .trim() || 'this topic';
}

function getKaiText(interaction) {
  var text = interaction.text || '';
  if (interaction.question) text += (text ? '\n' : '') + interaction.question;
  if (interaction.type === 'final_reveal' && interaction.finalAnswer) text += (text ? '\n' : '') + interaction.finalAnswer;
  return text || interaction.stepLabel || 'Kai step';
}

function normalizeAnswer(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function shuffle(items) {
  var copy = items.slice();
  for (var i = copy.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = copy[i];
    copy[i] = copy[j];
    copy[j] = tmp;
  }
  return copy;
}

function esc(value) {
  var div = document.createElement('div');
  div.textContent = value == null ? '' : String(value);
  return div.innerHTML;
}

function autoResize(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 160) + 'px';
}

function blockPaste(e) {
  e.preventDefault();
}
