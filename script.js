// ===========================
// QUESTION BANK
// ===========================

const questionBank = {
    'Central Tendency': [
        'The mean of 8 numbers is 25.\nSeven of the numbers are: 15, 20, 22, 24, 26, 28, 30.\nFind the missing number.',
        'Data: 12, 14, 16, 18, 20, 20, 22, 24, 26\nCalculate: Mean plus Median minus Mode.'
    ],
    'Measures of Dispersion': [
        'Data: 5, 10, 15, 20, 25\nHint: Range = Max minus Min\nFind: Range plus Variance (use population variance)',
        'Dataset A: 10, 20, 30, 40, 50\nDataset B: 18, 20, 22, 24, 26\nFind: Variance of A minus Variance of B'
    ],
    'Probability': [
        'A bag has 4 red, 3 blue and 3 green balls.\nOne ball is picked at random.\nMultiply the probability of picking a blue ball by 20.',
        'Two fair dice are rolled.\nMultiply the probability of getting a sum of 7 by 36.'
    ],
    'Graphs & Trends': [
        'A company\'s monthly sales are shown in the bar chart below.\nFind the average monthly increase.',
        'Monthly production levels are shown in the line plot below.\nFind: Highest value minus Average value\n(Round to nearest integer)'
    ],
    'Tabular Analysis': [
        'Student marks are shown in the table below.\nFind: Highest mark  plus  Average marks',
        'Monthly expenses are shown in the table below.\nFind: Total  minus  Food expense'
    ],
    'Permutations & Combinations': [
        'How many different arrangements can be made\nusing the letters of the word  STATISTICS ?',
        'A team of 4 is chosen from 8 people.\nHow many different teams can be formed?'
    ],
    'Simple Maths': [
        'Given that x squared minus 5x equals 84\nand x is greater than 0,\nfind the value of x.',
        'Find the value of:\n( 18 squared  minus  12 squared )  divided by  6'
    ],
    'Distribution Analysis': [
        'Data: 10, 12, 13, 15, 16, 18, 40\n\nCompare the Mean and Median of this data.\nIf Mean is greater than Median, answer is 1.\nIf Mean equals Median, answer is 2.\nIf Mean is less than Median, answer is 3.\n\nWhat is the answer?',
        'Data: 50, 52, 54, 56, 58, 60, 62\n\nLook at the shape of this distribution.\nIf it is Symmetric, answer is 1.\nIf it is Left Skewed, answer is 2.\nIf it is Right Skewed, answer is 3.\n\nEnter the correct code.'
    ],
    'Mysterious Category': [
        'Find the next number in this sequence:\n2,  6,  12,  20,  30,  42,  ?',
        'Sequence: 1,  4,  9,  16,  25,  ?\nFind: Next term plus Previous term'
    ]
};

// ===========================
// ANSWER BANK
// ===========================

const answerBank = {
    'Central Tendency': [
        '35',
        '21.33'
    ],
    'Measures of Dispersion': [
        '20 + 50 = 70',
        '200 − 8 = 192'
    ],
    'Probability': [
        '0.3 × 20 = 6',
        '(1/6) × 36 = 6'
    ],
    'Graphs & Trends': [
        '30',
        '90'
    ],
    'Tabular Analysis': [
        '131',
        '18000'
    ],
    'Permutations & Combinations': [
        '720',
        '70'
    ],
    'Simple Maths': [
        'x = 12',
        '30'
    ],
    'Mysterious Category': [
        '56',
        '61'
    ],
    'Distribution Analysis': [
        'Answer = 1',
        'Answer = 1'
    ]
};



const defaultState = {
    teams: [],
    category: 'No Category',
    selectedTeam: null,
    currentBid: null,
    challenge: false,
    question: '',
    questions: [],
    answers: [],
    showAnswers: false,
    flip: false,
    questionIndex: {},
    projectorPhase: 1,
    timerStart: null,
    logs: []
};

let state = (() => {
    const stored = JSON.parse(localStorage.getItem('auction'));
    if (!stored) return { ...defaultState };
    return {
        ...defaultState,
        ...stored,
        question: stored.question || '',
        questions: stored.questions || [],
        answers: stored.answers || [],
        showAnswers: stored.showAnswers || false,
        flip: !!stored.flip,
        questionIndex: stored.questionIndex || {},
        projectorPhase: stored.projectorPhase || 1,
        timerStart: stored.timerStart || null
    };
})();

let undoStack = [];

function saveState() {
    // Push deep copy to undo stack before saving
    undoStack.push(JSON.stringify(state));
    if (undoStack.length > 5) undoStack.shift();
    localStorage.setItem('auction', JSON.stringify(state));
    renderAdmin();
}

function undoLastAction() {
    if (undoStack.length === 0) { showAlert('Nothing to undo'); return; }
    const prev = undoStack.pop();
    state = JSON.parse(prev);
    localStorage.setItem('auction', JSON.stringify(state));
    renderAdmin();
}

function log(message) {
    const time = new Date().toLocaleTimeString();
    state.logs.unshift(`${time} — ${message}`);
    if (state.logs.length > 100) state.logs.pop();
}

// ===========================
// MODAL (replaces confirm/alert)
// ===========================

function showModal(message, onConfirm, confirmLabel = 'Confirm', cancelLabel = 'Cancel') {
    const overlay   = document.getElementById('modalOverlay');
    const msg       = document.getElementById('modalMessage');
    const btnCancel = document.getElementById('modalCancel');

    msg.innerText = message;
    overlay.style.display = 'flex';

    // Always restore cancel button
    btnCancel.style.display = '';
    btnCancel.innerText = cancelLabel;

    const btnOk = document.getElementById('modalOk');
    btnOk.innerText = confirmLabel;

    const newOk     = btnOk.cloneNode(true);
    const newCancel = btnCancel.cloneNode(true);
    btnOk.parentNode.replaceChild(newOk, btnOk);
    btnCancel.parentNode.replaceChild(newCancel, btnCancel);

    newOk.addEventListener('click', () => {
        overlay.style.display = 'none';
        onConfirm();
    });
    newCancel.addEventListener('click', () => {
        overlay.style.display = 'none';
    });
}

function showAlert(message) {
    const overlay = document.getElementById('modalOverlay');
    const msg     = document.getElementById('modalMessage');
    const btnCancel = document.getElementById('modalCancel');

    msg.innerText = message;
    btnCancel.style.display = 'none';
    overlay.style.display = 'flex';

    const btnOk = document.getElementById('modalOk');
    btnOk.innerText = 'OK';
    const newOk = btnOk.cloneNode(true);
    btnOk.parentNode.replaceChild(newOk, btnOk);
    newOk.addEventListener('click', () => {
        overlay.style.display = 'none';
        document.getElementById('modalCancel').style.display = '';
    });
}

// ===========================
// INIT QUESTIONS
// ===========================

function initializeQuestionState() {
    const select = document.getElementById('category');
    if (!select) return false;

    const selectedCategory = select.value || Object.keys(questionBank)[0];
    let changed = false;

    // Fix invalid category (e.g. 'No Category' from old state)
    if (!questionBank[state.category]) {
        state.category = selectedCategory;
        changed = true;
    }

    if (!state.questions || state.questions.length === 0) {
        const questions = questionBank[state.category] || [];
        state.questions = questions.slice(0, 2);
        state.question = state.questions[0] || '';
        state.answers = (answerBank[state.category] || []).slice(0, 2);
        changed = true;
    }

    return changed;
}

// ===========================
// PROJECTOR PHASE
// ===========================

function setPhase(n) {
    state.projectorPhase = n;
    if (n === 1) { state.flip = false; state.showAnswers = false; }
    if (n === 2) { state.showAnswers = false; }
    if (n === 3) { state.showAnswers = true; }
    saveState();
}

// ===========================
// TEAM MANAGEMENT
// ===========================

function addTeam() {
    const input = document.getElementById('teamName');
    if (!input) return;
    const name = input.value.trim();
    if (!name) { showAlert('Enter a team name'); return; }
    if (state.teams.length >= 5) { showAlert('Maximum 5 teams allowed'); return; }
    if (state.teams.find(t => t.name === name)) { showAlert('Team name already exists'); return; }

    state.teams.push({ name, coins: 1000, totalSolveMs: 0, solveCount: 0 });
    log(`Team "${name}" added`);
    input.value = '';
    saveState();
}

function removeTeam(name) {
    showModal(`Remove team "${name}"?`, () => {
        state.teams = state.teams.filter(t => t.name !== name);
        if (state.selectedTeam === name) state.selectedTeam = null;
        log(`Team "${name}" removed`);
        saveState();
    }, 'Remove', 'Cancel');
}

// ===========================
// CATEGORY
// ===========================

function updateCategory() {
    const select = document.getElementById('category');
    if (!select) return;

    const selectedCategory = select.value;
    state.category = selectedCategory;

    const questions = questionBank[selectedCategory] || [];
    state.questions = questions.slice(0, 2);
    state.question = state.questions[0] || 'No questions in this category.';
    state.answers = (answerBank[selectedCategory] || []).slice(0, 2);
    state.showAnswers = false;

    state.flip = false;
    state.projectorPhase = 1;
    log(`CATEGORY UPDATED: ${state.category}`);
    saveState();
}

// ===========================
// REVEAL ANSWERS
// ===========================

function revealAnswers() {
    if (!state.currentBid && !state.challenge) {
        showAlert('No active round to reveal answers for');
        return;
    }
    state.showAnswers = true;
    log('ANSWERS REVEALED');
    saveState();
}



function selectTeam(name) {
    state.selectedTeam = name || null;
    saveState();
}

// ===========================
// BIDDING
// ===========================

function sold() {
    const bid = Number(document.getElementById('bidAmount').value);
    if (!state.selectedTeam) { showAlert('Select a team first'); return; }
    if (!bid || bid <= 0) { showAlert('Enter a valid bid amount'); return; }
    if (!state.questions || state.questions.length === 0) { showAlert('Update category first to load questions'); return; }

    const team = state.teams.find(t => t.name === state.selectedTeam);
    if (!team) { showAlert('Team not found'); return; }
    if (team.coins < bid) { showAlert(`${team.name} only has ${team.coins} coins`); return; }

    team.coins -= bid;
    state.currentBid = { team: team.name, bid };
    state.challenge = false;
    state.flip = true;
    state.projectorPhase = 2;
    state.timerStart = Date.now();

    log(`SOLD — ${team.name} for ${bid} coins`);
    log('QUESTION REVEALED');
    saveState();
}

// ===========================
// ANSWER EVALUATION
// ===========================

function correct() {
    if (!state.currentBid) { showAlert('No active bid'); return; }
    showModal(`Mark ${state.currentBid.team}'s answer as CORRECT?\nThey will receive ${state.currentBid.bid * 2} coins.`, () => {
        const team = state.teams.find(t => t.name === state.currentBid.team);
        if (!team) return;
        team.coins += state.currentBid.bid * 2;
        if (state.timerStart) {
            team.totalSolveMs = (team.totalSolveMs || 0) + (Date.now() - state.timerStart);
            team.solveCount = (team.solveCount || 0) + 1;
        }
        log(`CORRECT — ${team.name} wins ${state.currentBid.bid * 2} coins`);
        _endRound();
    }, '✅ Confirm Correct', 'Cancel');
}

function wrong() {
    if (!state.currentBid) { showAlert('No active bid'); return; }
    showModal(`Mark ${state.currentBid.team}'s answer as WRONG?\nChallenge will open for other teams.`, () => {
        state.challenge = true;
        log(`WRONG — ${state.currentBid.team}`);
        saveState();
    }, '❌ Confirm Wrong', 'Cancel');
}

function exportResults() {
    showModal('Export results and remove all teams?', () => {
        log('--- RESULTS EXPORTED ---');
        state.teams.forEach(t => log(`${t.name}: ${t.coins} coins`));
        state.teams = [];
        state.selectedTeam = null;
        state.currentBid = null;
        state.challenge = false;
        state.timerStart = null;
        saveState();
    }, '📤 Export & Clear', 'Cancel');
}

// ===========================
// CHALLENGE
// ===========================

function challengeCorrect() {
    const challenger = document.getElementById('challenger').value;
    if (!challenger) { showAlert('Select a challenger first'); return; }
    if (!state.currentBid) { showAlert('No active bid'); return; }

    showModal(`Mark ${challenger}'s challenge as CORRECT?\nThey will receive ${state.currentBid.bid} coins.`, () => {
        const team = state.teams.find(t => t.name === challenger);
        if (!team) return;
        team.coins += state.currentBid.bid;
        if (state.timerStart) {
            team.totalSolveMs = (team.totalSolveMs || 0) + (Date.now() - state.timerStart);
            team.solveCount = (team.solveCount || 0) + 1;
        }
        log(`CHALLENGE CORRECT — ${challenger} wins ${state.currentBid.bid} coins`);
        _endRound();
    }, '🏆 Confirm', 'Cancel');
}

function challengeWrong() {
    const challenger = document.getElementById('challenger').value;
    if (!challenger) { showAlert('Select a challenger first'); return; }
    if (!state.currentBid) { showAlert('No active bid'); return; }

    showModal(`Mark ${challenger}'s challenge as WRONG?\nThey will lose ${state.currentBid.bid} coins.`, () => {
        const team = state.teams.find(t => t.name === challenger);
        if (!team) return;
        team.coins -= state.currentBid.bid;
        log(`CHALLENGE WRONG — ${challenger} loses ${state.currentBid.bid} coins`);
        _endRound();
    }, '❌ Confirm', 'Cancel');
}

function noChallenge() {
    state.challenge = false;
    state.showAnswers = true;
    state.projectorPhase = 3;
    state.timerStart = null;
    log('NO CHALLENGE — answers revealed');
    saveState();
}

function _endRound() {
    state.currentBid = null;
    state.challenge = false;
    state.flip = false;
    state.showAnswers = true;
    state.projectorPhase = 3;
    state.timerStart = null;
    saveState();
}

function endRound() {
    state.currentBid = null;
    state.challenge = false;
    state.flip = false;
    state.question = '';
    state.questions = [];
    state.answers = [];
    state.showAnswers = false;
    state.projectorPhase = 4;
    state.timerStart = null;
    log('ROUND ENDED — leaderboard shown');
    saveState();
}

// ===========================
// RENDERING
// ===========================

function renderAdmin() {
    const teamList = document.getElementById('teamList');
    if (!teamList) return;

    teamList.innerHTML = state.teams.length
        ? state.teams.map(team => `
            <div class="team-item">
                <span>${team.name}</span>
                <span>${team.coins} coins</span>
            </div>`).join('')
        : '<div style="color:#64748b; padding:12px 0; font-size:13px;">No teams added yet</div>';

    const teamButtons = document.getElementById('teamButtons');
    teamButtons.innerHTML = state.teams.map(team => `
        <button class="team-btn ${state.selectedTeam === team.name ? 'selected' : ''}" onclick="selectTeam('${team.name}')">
            ${team.name}
        </button>`).join('');

    const challenger = document.getElementById('challenger');
    challenger.innerHTML = '<option value="">Select Challenger</option>';
    state.teams.forEach(team => {
        if (state.currentBid && team.name !== state.currentBid.team) {
            challenger.innerHTML += `<option value="${team.name}">${team.name}</option>`;
        }
    });

    const categorySelect = document.getElementById('category');
    if (categorySelect && questionBank[state.category]) {
        categorySelect.value = state.category;
    }

    document.getElementById('currentCategory').innerText = state.category;
    document.getElementById('currentQuestion').innerText = state.questions && state.questions.length
        ? `✅ ${state.questions.length} questions ready`
        : '⚠️ None loaded';
    document.getElementById('selectedTeamStatus').innerText = state.selectedTeam || '-';
    document.getElementById('currentBidStatus').innerText = state.currentBid
        ? `${state.currentBid.team} (${state.currentBid.bid})`
        : '-';
    document.getElementById('challengeStatus').innerText = state.challenge ? 'Available' : 'Inactive';
    document.getElementById('logs').innerHTML = state.logs.map(l => `<div class="log">${l}</div>`).join('');

    [1, 2, 3, 4].forEach(n => {
        const ids = { 1: 'phaseBtnCat', 2: 'phaseBtnQ', 3: 'phaseBtnAns', 4: 'phaseBtnLb' };
        const btn = document.getElementById(ids[n]);
        if (btn) btn.classList.toggle('active-phase', state.projectorPhase === n);
    });
}

// ===========================
// RESET
// ===========================

function resetAuction() {
    showModal('Delete ALL teams and reset the entire auction?', () => {
        localStorage.removeItem('auction');
        const cat = document.getElementById('category')?.value || Object.keys(questionBank)[0];
        state = {
            ...defaultState,
            category: cat,
            questions: (questionBank[cat] || []).slice(0, 2),
            question: (questionBank[cat] || [])[0] || '',
            answers: (answerBank[cat] || []).slice(0, 2),
            logs: []
        };
        saveState();
    }, '🗑 Reset Everything', 'Cancel');
}

// ===========================
// INIT
// ===========================

if (document.getElementById('teamList')) {
    const changed = initializeQuestionState();
    if (changed) saveState();
    else renderAdmin();
}