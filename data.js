// World Cup 2026 - 48 Teams in 12 Groups
// Update this file to manage the draw and tournament state

const WORLD_CUP_DATA = {
    groups: {
        "A": [
            { name: "Canada", flag: "\u{1F1E8}\u{1F1E6}" },
            { name: "Argentina", flag: "\u{1F1E6}\u{1F1F7}" },
            { name: "Morocco", flag: "\u{1F1F2}\u{1F1E6}" },
            { name: "Uzbekistan", flag: "\u{1F1FA}\u{1F1FF}" }
        ],
        "B": [
            { name: "Mexico", flag: "\u{1F1F2}\u{1F1FD}" },
            { name: "Ecuador", flag: "\u{1F1EA}\u{1F1E8}" },
            { name: "Bolivia", flag: "\u{1F1E7}\u{1F1F4}" },
            { name: "Croatia", flag: "\u{1F1ED}\u{1F1F7}" }
        ],
        "C": [
            { name: "USA", flag: "\u{1F1FA}\u{1F1F8}" },
            { name: "England", flag: "\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}" },
            { name: "Panama", flag: "\u{1F1F5}\u{1F1E6}" },
            { name: "Serbia", flag: "\u{1F1F7}\u{1F1F8}" }
        ],
        "D": [
            { name: "Brazil", flag: "\u{1F1E7}\u{1F1F7}" },
            { name: "Italy", flag: "\u{1F1EE}\u{1F1F9}" },
            { name: "Albania", flag: "\u{1F1E6}\u{1F1F1}" },
            { name: "Paraguay", flag: "\u{1F1F5}\u{1F1FE}" }
        ],
        "E": [
            { name: "Colombia", flag: "\u{1F1E8}\u{1F1F4}" },
            { name: "Senegal", flag: "\u{1F1F8}\u{1F1F3}" },
            { name: "Australia", flag: "\u{1F1E6}\u{1F1FA}" },
            { name: "Bahrain", flag: "\u{1F1E7}\u{1F1ED}" }
        ],
        "F": [
            { name: "Germany", flag: "\u{1F1E9}\u{1F1EA}" },
            { name: "Uruguay", flag: "\u{1F1FA}\u{1F1FE}" },
            { name: "Poland", flag: "\u{1F1F5}\u{1F1F1}" },
            { name: "Kenya", flag: "\u{1F1F0}\u{1F1EA}" }
        ],
        "G": [
            { name: "France", flag: "\u{1F1EB}\u{1F1F7}" },
            { name: "South Korea", flag: "\u{1F1F0}\u{1F1F7}" },
            { name: "Saudi Arabia", flag: "\u{1F1F8}\u{1F1E6}" },
            { name: "New Zealand", flag: "\u{1F1F3}\u{1F1FF}" }
        ],
        "H": [
            { name: "Portugal", flag: "\u{1F1F5}\u{1F1F9}" },
            { name: "Iran", flag: "\u{1F1EE}\u{1F1F7}" },
            { name: "Cameroon", flag: "\u{1F1E8}\u{1F1F2}" },
            { name: "Honduras", flag: "\u{1F1ED}\u{1F1F3}" }
        ],
        "I": [
            { name: "Spain", flag: "\u{1F1EA}\u{1F1F8}" },
            { name: "Nigeria", flag: "\u{1F1F3}\u{1F1EC}" },
            { name: "Peru", flag: "\u{1F1F5}\u{1F1EA}" },
            { name: "Indonesia", flag: "\u{1F1EE}\u{1F1E9}" }
        ],
        "J": [
            { name: "Belgium", flag: "\u{1F1E7}\u{1F1EA}" },
            { name: "Turkey", flag: "\u{1F1F9}\u{1F1F7}" },
            { name: "Chile", flag: "\u{1F1E8}\u{1F1F1}" },
            { name: "Costa Rica", flag: "\u{1F1E8}\u{1F1F7}" }
        ],
        "K": [
            { name: "Japan", flag: "\u{1F1EF}\u{1F1F5}" },
            { name: "Denmark", flag: "\u{1F1E9}\u{1F1F0}" },
            { name: "Trinidad & Tobago", flag: "\u{1F1F9}\u{1F1F9}" },
            { name: "Scotland", flag: "\u{1F3F4}\u{E0067}\u{E0062}\u{E0073}\u{E0063}\u{E0074}\u{E007F}" }
        ],
        "L": [
            { name: "Netherlands", flag: "\u{1F1F3}\u{1F1F1}" },
            { name: "Switzerland", flag: "\u{1F1E8}\u{1F1ED}" },
            { name: "Ghana", flag: "\u{1F1EC}\u{1F1ED}" },
            { name: "Jamaica", flag: "\u{1F1EF}\u{1F1F2}" }
        ]
    }
};

// ---- State management via localStorage ----
const STORAGE_KEY = "kewford_sweepstake_2026";

function loadState() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return JSON.parse(saved);
    } catch (e) {}
    return getDefaultState();
}

function saveState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function getDefaultState() {
    return {
        drawComplete: false,
        assignments: {},       // { "teamName": "ownerName" }
        eliminated: [],        // ["teamName", ...]
        stages: {},            // { "teamName": "groups" | "r32" | "r16" | "qf" | "sf" | "final" | "winner" }
        bankSortCode: "XX-XX-XX",
        bankAccountNo: "XXXXXXXX"
    };
}
