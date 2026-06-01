// ============================================
// World Cup 2026 Sweepstake - Kewford South
// ============================================

let state = loadState();
const isAdmin = new URLSearchParams(window.location.search).get("admin") === "true";

// ---- Init ----
document.addEventListener("DOMContentLoaded", () => {
    renderGroups();
    renderBracket();
    setupTabs();
    setupAdmin();
    setupShare();
    updateDrawStatus();
    updateBankDetails();
});

// ---- Tabs ----
function setupTabs() {
    document.querySelectorAll(".tab").forEach(tab => {
        tab.addEventListener("click", () => {
            document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
            document.querySelectorAll(".tab-content").forEach(tc => tc.classList.remove("active"));
            tab.classList.add("active");
            document.getElementById(tab.dataset.tab).classList.add("active");
        });
    });
}

// ---- Render Groups ----
function renderGroups() {
    const grid = document.getElementById("groups-grid");
    grid.innerHTML = "";

    for (const [groupName, teams] of Object.entries(WORLD_CUP_DATA.groups)) {
        const card = document.createElement("div");
        card.className = "group-card";

        let teamsHTML = "";
        for (const team of teams) {
            const owner = state.assignments[team.name];
            const isEliminated = state.eliminated.includes(team.name);
            const ownerDisplay = owner
                ? `<span class="team-owner">${escapeHtml(owner)}</span>`
                : `<span class="team-owner unassigned">Available</span>`;

            teamsHTML += `
                <div class="team-row${isEliminated ? ' eliminated' : ''}">
                    <span class="team-flag">${team.flag}</span>
                    <span class="team-name">${team.name}</span>
                    ${state.drawComplete ? ownerDisplay : ''}
                </div>`;
        }

        card.innerHTML = `
            <div class="group-header">Group ${groupName}</div>
            ${teamsHTML}`;
        grid.appendChild(card);
    }
}

// ---- Render Bracket ----
function renderBracket() {
    const view = document.getElementById("bracket-view");
    view.innerHTML = "";

    const activeStage = document.querySelector(".stage-btn.active")?.dataset.stage || "groups";

    const allTeams = getAllTeams();
    const filteredTeams = filterTeamsByStage(allTeams, activeStage);

    if (filteredTeams.length === 0) {
        view.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 2rem;">
            No teams at this stage yet. The tournament hasn't reached here!
        </div>`;
        return;
    }

    for (const team of filteredTeams) {
        const isEliminated = state.eliminated.includes(team.name);
        const owner = state.assignments[team.name];
        const stage = state.stages[team.name] || "groups";

        const card = document.createElement("div");
        card.className = `bracket-team ${isEliminated ? 'eliminated' : 'alive'}`;
        card.innerHTML = `
            <span class="team-flag">${team.flag}</span>
            <div class="bracket-team-info">
                <div class="bracket-team-name">${team.name}</div>
                ${owner ? `<div class="bracket-team-owner">${escapeHtml(owner)}</div>` : ''}
            </div>
            <span class="bracket-team-stage">${getStageName(stage)}</span>`;
        view.appendChild(card);
    }

    // Stage button listeners
    document.querySelectorAll(".stage-btn").forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll(".stage-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            renderBracket();
        };
    });
}

function filterTeamsByStage(teams, viewStage) {
    const stageOrder = ["groups", "r32", "r16", "qf", "sf", "final", "winner"];
    const viewIdx = stageOrder.indexOf(viewStage);

    if (viewStage === "groups") return teams;

    return teams.filter(t => {
        const teamStage = state.stages[t.name] || "groups";
        const teamIdx = stageOrder.indexOf(teamStage);
        return teamIdx >= viewIdx || state.eliminated.includes(t.name);
    });
}

function getAllTeams() {
    const teams = [];
    for (const group of Object.values(WORLD_CUP_DATA.groups)) {
        teams.push(...group);
    }
    return teams;
}

function getStageName(stage) {
    const names = {
        groups: "Groups",
        r32: "R32",
        r16: "R16",
        qf: "QF",
        sf: "Semi",
        final: "Final",
        winner: "WINNER!"
    };
    return names[stage] || stage;
}

// ---- Draw Status ----
function updateDrawStatus() {
    const el = document.getElementById("draw-status");
    if (state.drawComplete) {
        el.innerHTML = `<span class="status-badge complete">Draw complete! Good luck everyone!</span>`;
    } else {
        el.innerHTML = `<span class="status-badge pending">Draw not yet made - watch this space!</span>`;
    }
}

// ---- Bank details ----
function updateBankDetails() {
    document.getElementById("sort-code").textContent = state.bankSortCode;
    document.getElementById("account-no").textContent = state.bankAccountNo;
}

// ---- Admin ----
function setupAdmin() {
    if (!isAdmin) return;

    document.getElementById("admin-panel").classList.remove("hidden");
    document.getElementById("bracket-admin").classList.remove("hidden");

    // Draw button
    document.getElementById("run-draw-btn").addEventListener("click", runDraw);
    document.getElementById("clear-draw-btn").addEventListener("click", clearDraw);
    document.getElementById("export-btn").addEventListener("click", exportData);
    document.getElementById("import-btn").addEventListener("click", () => {
        document.getElementById("import-file").click();
    });
    document.getElementById("import-file").addEventListener("change", importData);

    // Bracket admin
    populateTeamSelects();
    document.getElementById("eliminate-btn").addEventListener("click", eliminateTeam);
    document.getElementById("reinstate-btn").addEventListener("click", reinstateTeam);
    document.getElementById("advance-btn").addEventListener("click", advanceTeam);
}

function runDraw() {
    const input = document.getElementById("participants-input").value.trim();
    if (!input) {
        alert("Enter some names first!");
        return;
    }

    const names = input.split("\n").map(n => n.trim()).filter(n => n.length > 0);
    const teams = getAllTeams();

    if (names.length > teams.length) {
        alert(`Too many names! You have ${names.length} names but only ${teams.length} teams.`);
        return;
    }

    // Shuffle teams
    const shuffled = [...teams];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Assign
    state.assignments = {};
    for (let i = 0; i < names.length; i++) {
        state.assignments[shuffled[i].name] = names[i];
    }
    state.drawComplete = true;

    // Initialize stages
    state.stages = {};
    for (const team of teams) {
        state.stages[team.name] = "groups";
    }

    saveState(state);

    // Animate
    animateDraw(names, shuffled).then(() => {
        renderGroups();
        renderBracket();
        updateDrawStatus();
        populateTeamSelects();
        launchConfetti();
    });
}

async function animateDraw(names, shuffledTeams) {
    const animDiv = document.getElementById("draw-animation");
    const slotName = document.getElementById("slot-name");
    const slotTeam = document.getElementById("slot-team");
    animDiv.classList.remove("hidden");

    for (let i = 0; i < names.length; i++) {
        slotName.classList.add("spinning");
        slotTeam.classList.add("spinning");

        // Spin for a bit
        const spinTime = 600 + Math.random() * 400;
        const spinInterval = setInterval(() => {
            slotName.textContent = names[Math.floor(Math.random() * names.length)];
            slotTeam.textContent = shuffledTeams[Math.floor(Math.random() * shuffledTeams.length)].name;
        }, 50);

        await sleep(spinTime);
        clearInterval(spinInterval);

        slotName.classList.remove("spinning");
        slotTeam.classList.remove("spinning");
        slotName.textContent = names[i];
        slotTeam.textContent = shuffledTeams[i].name;

        await sleep(800);
    }
}

function clearDraw() {
    if (!confirm("Clear the entire draw? This cannot be undone!")) return;
    state = getDefaultState();
    saveState(state);
    renderGroups();
    renderBracket();
    updateDrawStatus();
    populateTeamSelects();
}

function exportData() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sweepstake-data.json";
    a.click();
    URL.revokeObjectURL(url);
}

function importData(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
        try {
            const data = JSON.parse(ev.target.result);
            state = { ...getDefaultState(), ...data };
            saveState(state);
            renderGroups();
            renderBracket();
            updateDrawStatus();
            updateBankDetails();
            populateTeamSelects();
            alert("Data imported!");
        } catch {
            alert("Invalid JSON file!");
        }
    };
    reader.readAsText(file);
}

function populateTeamSelects() {
    const teams = getAllTeams();
    const eliminateSelect = document.getElementById("eliminate-team");
    const advanceSelect = document.getElementById("set-stage-team");

    [eliminateSelect, advanceSelect].forEach(sel => {
        const firstOpt = sel.options[0];
        sel.innerHTML = "";
        sel.appendChild(firstOpt);
        for (const team of teams) {
            const opt = document.createElement("option");
            opt.value = team.name;
            const owner = state.assignments[team.name];
            opt.textContent = `${team.flag} ${team.name}${owner ? ` (${owner})` : ''}`;
            sel.appendChild(opt);
        }
    });
}

function eliminateTeam() {
    const name = document.getElementById("eliminate-team").value;
    if (!name) return;
    if (!state.eliminated.includes(name)) {
        state.eliminated.push(name);
        saveState(state);
        const team = findTeam(name);
        playEliminationAnimation(team).then(() => {
            renderGroups();
            renderBracket();
        });
    }
}

function reinstateTeam() {
    const name = document.getElementById("eliminate-team").value;
    if (!name) return;
    state.eliminated = state.eliminated.filter(t => t !== name);
    saveState(state);
    renderGroups();
    renderBracket();
}

function advanceTeam() {
    const name = document.getElementById("set-stage-team").value;
    const stage = document.getElementById("set-stage-to").value;
    if (!name) return;
    const previousStage = state.stages[name] || "groups";
    state.stages[name] = stage;
    state.eliminated = state.eliminated.filter(t => t !== name);
    saveState(state);
    const team = findTeam(name);
    playAdvanceAnimation(team, previousStage, stage).then(() => {
        renderBracket();
    });
}

function findTeam(name) {
    return getAllTeams().find(t => t.name === name);
}

// ---- Share ----
function setupShare() {
    document.getElementById("share-btn").addEventListener("click", () => {
        const url = window.location.href.replace(/\?.*$/, '');
        const text = encodeURIComponent(
            "World Cup 2026 Sweepstake! Just £5 a team. " +
            "Prizes: 1st £50, 2nd £30, 3rd £15. " +
            "Rest goes to the Kewford South Kitty. Are you in? " +
            url
        );
        window.open(`https://wa.me/?text=${text}`, "_blank");
    });
}

// ---- Confetti ----
function launchConfetti() {
    const canvas = document.getElementById("confetti-canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const pieces = [];
    const colors = ["#FFD700", "#4CAF50", "#e53935", "#1565C0", "#FF9800", "#9C27B0", "#fff"];

    for (let i = 0; i < 150; i++) {
        pieces.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            w: Math.random() * 10 + 5,
            h: Math.random() * 6 + 3,
            color: colors[Math.floor(Math.random() * colors.length)],
            vx: (Math.random() - 0.5) * 3,
            vy: Math.random() * 3 + 2,
            rot: Math.random() * 360,
            rotSpeed: (Math.random() - 0.5) * 10
        });
    }

    let frame = 0;
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let alive = false;

        for (const p of pieces) {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.05;
            p.rot += p.rotSpeed;

            if (p.y < canvas.height + 50) alive = true;

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate((p.rot * Math.PI) / 180);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
            ctx.restore();
        }

        frame++;
        if (alive && frame < 300) {
            requestAnimationFrame(animate);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }
    animate();
}

// ---- Elimination: half-mast flag ----
function playEliminationAnimation(team) {
    if (!team) return Promise.resolve();
    const owner = state.assignments[team.name];
    const overlay = document.createElement("div");
    overlay.className = "anim-overlay elimination";
    overlay.innerHTML = `
        <div class="anim-stage">
            <div class="flagpole">
                <div class="pole-top"></div>
                <div class="pole"></div>
                <div class="pole-base"></div>
                <div class="flag-hoist" id="elim-flag">
                    <div class="flag-cloth">
                        <span class="flag-emoji">${team.flag}</span>
                        <span class="flag-name">${escapeHtml(team.name)}</span>
                    </div>
                </div>
            </div>
            <div class="anim-caption">
                <div class="anim-title">Going Home</div>
                <div class="anim-sub">${escapeHtml(team.name)} eliminated${owner ? ` &mdash; commiserations ${escapeHtml(owner)}` : ''}</div>
            </div>
        </div>
        <button class="anim-close" aria-label="Close">&times;</button>
    `;
    document.body.appendChild(overlay);

    const close = () => overlay.remove();
    overlay.querySelector(".anim-close").addEventListener("click", close);
    overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });

    return new Promise(resolve => {
        // Trigger the descent
        requestAnimationFrame(() => {
            overlay.classList.add("show");
            setTimeout(() => {
                overlay.querySelector("#elim-flag").classList.add("half-mast");
            }, 600);
        });
        setTimeout(() => {
            overlay.classList.add("fade-out");
            setTimeout(() => { close(); resolve(); }, 500);
        }, 4200);
    });
}

// ---- Advancement: march toward the trophy ----
const STAGE_PROGRESS = {
    groups: 0,
    r32: 1,
    r16: 2,
    qf: 3,
    sf: 4,
    final: 5,
    winner: 6
};

function playAdvanceAnimation(team, fromStage, toStage) {
    if (!team) return Promise.resolve();
    const owner = state.assignments[team.name];
    const fromIdx = STAGE_PROGRESS[fromStage] ?? 0;
    const toIdx = STAGE_PROGRESS[toStage] ?? 0;
    if (toIdx <= fromIdx) return Promise.resolve();

    const stagesPath = ["Groups", "R32", "R16", "QF", "Semi", "Final", "🏆"];
    const totalSteps = 6;
    const startPct = (fromIdx / totalSteps) * 100;
    const endPct = (toIdx / totalSteps) * 100;
    const isWinner = toStage === "winner";

    const overlay = document.createElement("div");
    overlay.className = "anim-overlay advance" + (isWinner ? " winner" : "");
    overlay.innerHTML = `
        <div class="anim-stage advance-stage">
            <div class="march-track">
                <div class="march-pitch"></div>
                <div class="march-checkpoints">
                    ${stagesPath.map((s, i) => `
                        <div class="checkpoint${i <= toIdx ? ' reached' : ''}${i === toIdx ? ' active' : ''}">
                            <div class="checkpoint-dot"></div>
                            <div class="checkpoint-label">${s}</div>
                        </div>
                    `).join("")}
                </div>
                <div class="trophy-target">
                    <div class="trophy-glow"></div>
                    <div class="trophy-icon">🏆</div>
                </div>
                <div class="march-lane">
                    <div class="marcher" id="adv-marcher" style="--start: ${startPct}%; --end: ${endPct}%;">
                        <div class="marcher-flag">${team.flag}</div>
                        <div class="marcher-name">${escapeHtml(team.name)}</div>
                    </div>
                </div>
            </div>
            <div class="anim-caption">
                <div class="anim-title">${isWinner ? 'CHAMPIONS!' : 'Through to the next round!'}</div>
                <div class="anim-sub">
                    ${escapeHtml(team.name)} ${isWinner ? 'lift the Jules Rimet!' : `march on to the ${getStageName(toStage)}`}
                    ${owner ? ` &mdash; well played ${escapeHtml(owner)}!` : ''}
                </div>
            </div>
        </div>
        <button class="anim-close" aria-label="Close">&times;</button>
    `;
    document.body.appendChild(overlay);

    const close = () => overlay.remove();
    overlay.querySelector(".anim-close").addEventListener("click", close);
    overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });

    return new Promise(resolve => {
        requestAnimationFrame(() => {
            overlay.classList.add("show");
            setTimeout(() => {
                overlay.querySelector("#adv-marcher").classList.add("marching");
            }, 400);
            if (isWinner) {
                setTimeout(() => launchConfetti(), 1800);
            }
        });
        const duration = isWinner ? 5200 : 4200;
        setTimeout(() => {
            overlay.classList.add("fade-out");
            setTimeout(() => { close(); resolve(); }, 500);
        }, duration);
    });
}

// ---- Helpers ----
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}
