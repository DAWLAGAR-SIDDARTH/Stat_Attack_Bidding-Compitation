// ===========================
// QUESTION BANK
// ===========================

const questionBank = {
    'Central Tendency': [
        'The mean of 8 numbers is 25.\nSeven of the numbers are: 15, 20, 22, 24, 26, 28, 30.\nFind the missing number.',
        'Data: 12, 14, 16, 18, 20, 20, 22, 24, 26\nCalculate: Mean + Median - Mode.'
    ],
    'Measures of Dispersion': [
        'Data: 5, 10, 15, 20, 25\nHint: Range = Max - Min\nFind: Range + Variance (use population variance)',
        'Dataset A: 10, 20, 30, 40, 50\nDataset B: 18, 20, 22, 24, 26\nFind: Variance of(A) - Variance of(B)'
    ],
    'Probability': [
        'A bag has 4 red, 3 blue and 3 green balls.\nOne ball is picked at random.\nMultiply the probability of picking a blue ball by 20.',
        'Two fair dice are rolled.\nMultiply the probability of getting a sum of 7 by 36.'
    ],
    'Graphs & Trends': [
        'A company\'s monthly sales are shown in the bar chart below.\nFind the average monthly increase.',
        'Monthly production levels are shown in the line plot below.\nFind: Highest value - Average value\n(Round to nearest integer)'
    ],
    'Tabular Analysis': [
        'Student marks are shown in the table below.\nFind: Highest mark  +  Average marks',
        'Monthly expenses are shown in the table below.\nFind: Total  -  Food expense'
    ],
    'Permutations & Combinations': [
        'How many different arrangements can be made\nusing the letters of the word  MEDIAN ?',
        'A team of 4 is chosen from 8 people.\nHow many different teams can be formed?'
    ],
    'Simple Maths': [
        'Given that x^2 - 5x = 84\nand x is greater than 0,\nfind the value of x.',
        'Find the value of:\n( 18^2  -  12^2 ) / 6'
    ],
    'Distribution Analysis': [
        'Data: 10, 12, 13, 15, 16, 18, 40\n\nCompare the Mean and Median of this data.\nIf Mean is greater than Median, answer is 1.\nIf Mean equals Median, answer is 2.\nIf Mean is less than Median, answer is 3.\n\nWhat is the answer?',
        'Data: 50, 52, 54, 56, 58, 60, 62\n\nLook at the shape of this distribution.\nIf it is Symmetric, answer is 1.\nIf it is Left Skewed, answer is 2.\nIf it is Right Skewed, answer is 3.\n\nEnter the correct code.'
    ],
    'Mysterious Category': [
        'Find the next number in this sequence:\n2,  6,  12,  20,  30,  42,  ?',
        'Sequence: 1,  4,  9,  16,  25,  ?\nFind: Next term + Previous term'
    ]
};

// ===========================
// STATE
// ===========================

const defaultState = {
    teams: [],
    category: 'No Category',
    selectedTeam: null,
    currentBid: null,
    challenge: false,
    question: '',
    questions: [],
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
        flip: !!stored.flip,
        questionIndex: stored.questionIndex || {},
        projectorPhase: stored.projectorPhase || 1,
        timerStart: stored.timerStart || null
    };
})();

function saveState() {
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
    const overlay = document.getElementById('modalOverlay');
    const msg     = document.getElementById('modalMessage');
    const btnOk   = document.getElementById('modalOk');
    const btnCancel = document.getElementById('modalCancel');

    msg.innerText = message;
    btnOk.innerText = confirmLabel;
    btnCancel.innerText = cancelLabel;
    overlay.style.display = 'flex';

    // Clone to remove old listeners
    const newOk = btnOk.cloneNode(true);
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
    const btnOk   = document.getElementById('modalOk');
    const btnCancel = document.getElementById('modalCancel');

    msg.innerText = message;
    btnOk.innerText = 'OK';
    btnCancel.style.display = 'none';
    overlay.style.display = 'flex';

    const newOk = btnOk.cloneNode(true);
    btnOk.parentNode.replaceChild(newOk, btnOk);
    newOk.addEventListener('click', () => {
        overlay.style.display = 'none';
        btnCancel.style.display = '';
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

    if (!questionBank[state.category]) {
        state.category = selectedCategory;
        changed = true;
    }

    if (!state.questions || state.questions.length === 0) {
        const questions = questionBank[state.category] || [];
        state.questions = questions.slice(0, 2);
        state.question = state.questions[0] || '';
        changed = true;
    }

    return changed;
}

// ===========================
// PROJECTOR PHASE
// ===========================

function setPhase(n) {
    state.projectorPhase = n;
    if (n === 1) state.flip = false;
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

    state.flip = false;
    state.projectorPhase = 1;
    log(`CATEGORY UPDATED: ${state.category}`);
    saveState();
}

// ===========================
// TEAM SELECTION
// ===========================

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

function _endRound() {
    state.currentBid = null;
    state.challenge = false;
    state.flip = false;
    state.question = '';
    state.questions = [];
    state.projectorPhase = 3;
    state.timerStart = null;
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

    [1, 2, 3].forEach(n => {
        const ids = { 1: 'phaseBtnCat', 2: 'phaseBtnQ', 3: 'phaseBtnLb' };
        const btn = document.getElementById(ids[n]);
        if (btn) btn.classList.toggle('active-phase', state.projectorPhase === n);
    });
}

// ===========================
// RESET
// ===========================

function resetAuction() {
    showModal('Delete ALL teams and reset the entire auction?', () => {
        state = {
            ...defaultState,
            category: document.getElementById('category')?.value || Object.keys(questionBank)[0],
            logs: []
        };
        initializeQuestionState();
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
