let state = JSON.parse(localStorage.getItem("auction")) || {
    teams: [],
    category: "No Category",
    selectedTeam: null,
    currentBid: null,
    challenge: false,
    logs: []
};

function saveState() {
    localStorage.setItem(
        "auction",
        JSON.stringify(state)
    );

    renderAdmin();
}

function log(message) {
    state.logs.unshift(message);

    if(state.logs.length > 100) {
        state.logs.pop();
    }
}

/* =========================
   TEAM MANAGEMENT
========================= */

function addTeam(){

    const input =
    document.getElementById("teamName");

    if(!input) return;

    const name =
    input.value.trim();

    if(!name) return;

    if(state.teams.length >= 5){
        alert("Maximum 5 teams");
        return;
    }

    state.teams.push({
        name:name,
        coins:1000
    });

    log(`Team ${name} added`);

    input.value = "";

    saveState();
}

function removeTeam(name){

    if(
        !confirm(
            `Remove ${name}?`
        )
    ) return;

    state.teams =
    state.teams.filter(
        t => t.name !== name
    );

    log(`Team ${name} removed`);

    saveState();
}

/* =========================
   CATEGORY
========================= */

function updateCategory(){

    const select =
    document.getElementById("category");

    if(!select) return;

    state.category =
    select.value;

    log(
        `Category changed to ${state.category}`
    );

    saveState();
}

/* =========================
   TEAM SELECTION
========================= */

function selectTeam(name){

    state.selectedTeam = name || null;

    saveState();
}

/* =========================
   SOLD
========================= */

function sold(){

    const bid =
    Number(
        document.getElementById(
            "bidAmount"
        ).value
    );

    if(!state.selectedTeam){
        alert("Select a team");
        return;
    }

    if(!bid || bid <= 0){
        alert("Enter valid bid");
        return;
    }

    const team =
    state.teams.find(
        t => t.name === state.selectedTeam
    );

    if(!team){
        alert("Team not found");
        return;
    }

    if(team.coins < bid){
        alert("Not enough coins");
        return;
    }

    team.coins -= bid;

    state.currentBid = {
        team:team.name,
        bid:bid
    };

    state.challenge = false;

    log(
        `SOLD to ${team.name} for ${bid} coins`
    );

    saveState();
}

/* =========================
   CORRECT
========================= */

function correct(){

    if(
        !confirm(
            "Mark answer as CORRECT?"
        )
    ) return;

    if(!state.currentBid){
        alert("No Active Bid");
        return;
    }

    const team =
    state.teams.find(
        t => t.name === state.currentBid.team
    );

    if(!team) return;

    team.coins +=
    state.currentBid.bid * 2;

    log(
        `${team.name} answered CORRECT`
    );

    state.currentBid = null;
    state.challenge = false;

    saveState();
}

function exportResults(){
    if(
        !confirm(
            "Export Results and delete all teams?"
        )
    ) return;

    state.teams = [];
    state.selectedTeam = null;
    state.currentBid = null;
    state.challenge = false;
    state.logs.unshift(
        `${new Date().toLocaleTimeString()} - Results exported and teams removed`
    );
    saveState();
}

/* =========================
   WRONG
========================= */
function wrong(){

    if(
    !confirm(
    "Mark answer as WRONG?"
    )
    )return;

    if(!state.currentBid){
        alert("No Active Bid");
        return;
    }

    state.challenge = true;

    log(
        `${state.currentBid.team} answered WRONG`
    );

    saveState();
}

/* =========================
   CHALLENGE CORRECT
========================= */

function challengeCorrect(){

    const challenger =
    document.getElementById(
        "challenger"
    ).value;

    if(!challenger){
        alert("Select Challenger");
        return;
    }

    const team =
    state.teams.find(
        t => t.name === challenger
    );

    if(!team) return;

    team.coins +=
    state.currentBid.bid;

    log(
        `${challenger} won challenge (+${state.currentBid.bid})`
    );

    state.currentBid = null;
    state.challenge = false;

    saveState();
}

/* =========================
   CHALLENGE WRONG
========================= */

function challengeWrong(){

    const challenger =
    document.getElementById(
        "challenger"
    ).value;

    if(!challenger){
        alert("Select Challenger");
        return;
    }

    const team =
    state.teams.find(
        t => t.name === challenger
    );

    if(!team) return;

    team.coins -=
    state.currentBid.bid;

    log(
        `${challenger} lost challenge (-${state.currentBid.bid})`
    );

    state.currentBid = null;
    state.challenge = false;

    saveState();
}

/* =========================
   RENDER ADMIN
========================= */

function renderAdmin(){

    const teamList =
    document.getElementById(
        "teamList"
    );

    if(!teamList) return;

    teamList.innerHTML = "";

    state.teams.forEach(team=>{

        teamList.innerHTML += `
        <div class="team-item">
            <span>
                ${team.name}
            </span>

            <span>
                ${team.coins}
            </span>
        </div>
        `;
    });

    const teamButtons =
    document.getElementById(
        "teamButtons"
    );

    teamButtons.innerHTML = "";

    state.teams.forEach(team=>{

        teamButtons.innerHTML += `
        <button
        class="team-btn ${
        state.selectedTeam === team.name
        ? 'selected'
        : ''
        }"
        onclick="selectTeam('${team.name}')">

        ${team.name}

        </button>
        `;
    });

    const challenger =
    document.getElementById(
        "challenger"
    );

    challenger.innerHTML =
    `<option value="">
    Select Challenger
    </option>`;

    state.teams.forEach(team=>{

        if(
            state.currentBid &&
            team.name !== state.currentBid.team
        ){

            challenger.innerHTML += `
            <option value="${team.name}">
            ${team.name}
            </option>
            `;
        }
    });

    const teamPicker =
    document.getElementById(
        "selectedTeamPicker"
    );

    if(teamPicker){
        teamPicker.innerHTML =
        `<option value="">
        Select Team
        </option>`;

        state.teams.forEach(team=>{
            teamPicker.innerHTML += `
            <option value="${team.name}">
                ${team.name}
            </option>
            `;
        });

        teamPicker.value = state.selectedTeam || "";
    }

    document.getElementById(
        "currentCategory"
    ).innerText =
    state.category;

    document.getElementById(
        "selectedTeamStatus"
    ).innerText =
    state.selectedTeam || "-";

    document.getElementById(
        "currentBidStatus"
    ).innerText =
    state.currentBid
    ?
    `${state.currentBid.team}
     (${state.currentBid.bid})`
    :
    "-";

    document.getElementById(
        "challengeStatus"
    ).innerText =
    state.challenge
    ? "Available"
    : "Inactive";

    document.getElementById(
        "logs"
    ).innerHTML =
    state.logs.map(
        l => `<div class="log">${l}</div>`
    ).join("");
}

/* =========================
   START
========================= */

if(
    document.getElementById(
        "teamList"
    )
){
    renderAdmin();
}
function resetAuction(){

if(
!confirm(
"Delete ALL teams and reset auction?"
)
)return;

state={
teams:[],
category:"No Category",
selectedTeam:null,
currentBid:null,
challenge:false,
logs:[]
};

saveState();

}