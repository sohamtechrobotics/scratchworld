/* =========================================================
   AURA PLUS — SCRATCH GAME LAB
   FINAL SCRIPT
   PART 1 / 3
   ========================================================= */

"use strict";

/* =========================================================
   BASIC HELPERS
   ========================================================= */

const $ = id => document.getElementById(id);

const $$ = selector =>
    [...document.querySelectorAll(selector)];

const qs = selector =>
    document.querySelector(selector);


/* =========================================================
   GLOBAL STATE
   ========================================================= */

let currentMission = 1;
let currentStep = 0;

let selectedSprite = null;
let selectedCategory = "motion";
let selectedAsset = null;
let selectedAssetType = "costumes";
let selectedBackdrop = "space";

let currentEditorTab = "code";

/*
   IMPORTANT:
   Every sprite has its OWN workspace.
   This fixes the original problem where
   AURA's code appeared when SHADOW was selected.
*/

const spriteWorkspaces = {
    aura: [],
    shadow: [],
    orb: [],
    portal: [],
    star: [],
    stage: []
};

let workspaceBlocks = [];

let undoStack = [];
let redoStack = [];

let lastRunCompleted = false;
let lessonRunning = false;
let lessonTimer = null;


/* =========================================================
   GAME STATE
   ========================================================= */

let gameRunning = false;
let gameAnimation = null;
let lastHit = 0;

let auraGame = {
    x: 12,
    y: 50,
    score: 0,
    lives: 3,
    collected: 0,
    shadowX: 72,
    shadowY: 50
};


/* =========================================================
   COMPLETED MISSIONS
   ========================================================= */

let completedMissions =
    JSON.parse(
        localStorage.getItem("auraPlusMissions") || "[]"
    );


/* =========================================================
   SCRATCH BLOCK DEFINITIONS
   ========================================================= */

const scratchBlocks = {

    motion: [
        {
            id: "move",
            text: "move 10 steps",
            color: "motion"
        },
        {
            id: "changex",
            text: "change x by 10",
            color: "motion"
        },
        {
            id: "changey",
            text: "change y by 10",
            color: "motion"
        },
        {
            id: "turn",
            text: "turn 15 degrees",
            color: "motion"
        },
        {
            id: "random",
            text: "go to random position",
            color: "motion"
        },
        {
            id: "setx",
            text: "set x to 0",
            color: "motion"
        },
        {
            id: "sety",
            text: "set y to 0",
            color: "motion"
        },
        {
            id: "bounce",
            text: "if on edge, bounce",
            color: "motion"
        }
    ],

    looks: [
        {
            id: "say",
            text: "say Hello! for 2 seconds",
            color: "looks"
        },
        {
            id: "nextcostume",
            text: "next costume",
            color: "looks"
        },
        {
            id: "costume",
            text: "switch costume to costume1",
            color: "looks"
        },
        {
            id: "size",
            text: "change size by 10",
            color: "looks"
        }
    ],

    sound: [
        {
            id: "soundstart",
            text: "start sound Meow",
            color: "sound"
        },
        {
            id: "soundwait",
            text: "play sound Meow until done",
            color: "sound"
        }
    ],

    events: [
        {
            id: "flag",
            text: "when green flag clicked",
            color: "events"
        },
        {
            id: "spriteclick",
            text: "when this sprite clicked",
            color: "events"
        },
        {
            id: "space",
            text: "when space key pressed",
            color: "events"
        },
        {
            id: "broadcast",
            text: "broadcast message1",
            color: "events"
        }
    ],

    control: [
        {
            id: "wait",
            text: "wait 1 seconds",
            color: "control"
        },
        {
            id: "repeat",
            text: "repeat 10",
            color: "control"
        },
        {
            id: "forever",
            text: "forever",
            color: "control"
        },
        {
            id: "if",
            text: "if then",
            color: "control"
        },
        {
            id: "ifelse",
            text: "if then else",
            color: "control"
        },
        {
            id: "stop",
            text: "stop all",
            color: "control"
        }
    ],

    sensing: [
        {
            id: "touching",
            text: "touching mouse-pointer?",
            color: "sensing"
        },
        {
            id: "touchingorb",
            text: "touching Orb?",
            color: "sensing"
        },
        {
            id: "key",
            text: "key space pressed?",
            color: "sensing"
        },
        {
            id: "mouse",
            text: "mouse down?",
            color: "sensing"
        }
    ],

    operators: [
        {
            id: "add",
            text: "1 + 1",
            color: "operators"
        },
        {
            id: "greater",
            text: "1 > 1",
            color: "operators"
        },
        {
            id: "equals",
            text: "1 = 1",
            color: "operators"
        },
        {
            id: "randomnumber",
            text: "pick random 1 to 10",
            color: "operators"
        }
    ],

    variables: [
        {
            id: "setvar",
            text: "set Score to 0",
            color: "variables"
        },
        {
            id: "changevar",
            text: "change Score by 10",
            color: "variables"
        },
        {
            id: "showvar",
            text: "show variable Score",
            color: "variables"
        }
    ],

    myblocks: [
        {
            id: "define",
            text: "define my block",
            color: "myblocks"
        },
        {
            id: "custom",
            text: "my block",
            color: "myblocks"
        }
    ]
};


/* =========================================================
   SPRITE ASSETS
   ========================================================= */

const spriteAssets = {

    aura: {
        costumes: [
            "AURA",
            "AURA GLOW",
            "AURA RUN"
        ],
        sounds: [
            "Meow",
            "Pop",
            "Collect"
        ]
    },

    shadow: {
        costumes: [
            "Shadow",
            "Shadow Attack"
        ],
        sounds: [
            "Boom",
            "Buzz"
        ]
    },

    orb: {
        costumes: [
            "Orb",
            "Orb Glow"
        ],
        sounds: [
            "Pop",
            "Collect"
        ]
    },

    portal: {
        costumes: [
            "Portal",
            "Portal Open"
        ],
        sounds: [
            "Magic",
            "Win"
        ]
    },

    star: {
        costumes: [
            "Star"
        ],
        sounds: [
            "Pop"
        ]
    }
};


/* =========================================================
   BACKDROPS
   ========================================================= */

const backdropData = {

    space:
        "radial-gradient(circle at 50% 40%, #172554, #07101e 75%)",

    neon:
        "linear-gradient(135deg,#7c3aed,#0891b2)",

    city:
        "linear-gradient(180deg,#38bdf8 0 50%,#334155 50%)"
};


/* =========================================================
   LESSON DATA
   ========================================================= */

const lessons = {

    1: {

        title: "Working with Sprites",

        description:
            "Sprites are the characters and objects in Scratch.",

        steps: [

            {
                title: "Select AURA",

                action:
                    "Click the AURA sprite in the Sprite List.",

                target:
                    "sprite-aura"
            },

            {
                title: "Add another sprite",

                action:
                    "Click + Choose a Sprite.",

                target:
                    "choose-sprite"
            },

            {
                title: "Select SHADOW",

                action:
                    "Click SHADOW in the Sprite List.",

                target:
                    "sprite-shadow"
            },

            {
                title: "Return to AURA",

                action:
                    "Click AURA again.",

                target:
                    "sprite-aura"
            }
        ]
    },


    2: {

        title: "Make AURA Move",

        description:
            "Use Motion blocks to control position.",

        steps: [

            {
                title: "Start the script",

                action:
                    "Open Events and click 'when green flag clicked'.",

                category:
                    "events",

                block:
                    "flag"
            },

            {
                title: "Move AURA",

                action:
                    "Open Motion and click 'move 10 steps'.",

                category:
                    "motion",

                block:
                    "move"
            },

            {
                title: "Change X",

                action:
                    "Click 'change x by 10'.",

                category:
                    "motion",

                block:
                    "changex"
            },

            {
                title: "Test it",

                action:
                    "Click the green flag to run your script.",

                run:
                    true
            }
        ]
    },


    3: {

        title: "Change Costumes",

        description:
            "Costumes change how a sprite looks.",

        steps: [

            {
                title: "Open Costumes",

                action:
                    "Click the Costumes tab.",

                tab:
                    "costumes"
            },

            {
                title: "Choose AURA GLOW",

                action:
                    "Click AURA GLOW in the costume library.",

                asset:
                    "costume",

                assetName:
                    "AURA GLOW"
            },

            {
                title: "Add next costume",

                action:
                    "Return to Code → Looks and click 'next costume'.",

                category:
                    "looks",

                block:
                    "nextcostume"
            },

            {
                title: "Test it",

                action:
                    "Click the green flag.",

                run:
                    true
            }
        ]
    },


    4: {

        title: "Program Two Sprites",

        description:
            "Each sprite can have its own script.",

        steps: [

            {
                title: "Select AURA",

                action:
                    "Click AURA.",

                target:
                    "sprite-aura"
            },

            {
                title: "Give AURA an event",

                action:
                    "Open Events and click 'when green flag clicked'.",

                category:
                    "events",

                block:
                    "flag"
            },

            {
                title: "Select SHADOW",

                action:
                    "Click SHADOW.",

                target:
                    "sprite-shadow"
            },

            {
                title: "Give SHADOW movement",

                action:
                    "Open Motion and click 'move 10 steps'.",

                category:
                    "motion",

                block:
                    "move"
            }
        ]
    },


    5: {

        title: "Change Backdrop",

        description:
            "Backdrops create the world of the project.",

        steps: [

            {
                title: "Choose Neon",

                action:
                    "Click the Neon backdrop.",

                backdrop:
                    "neon"
            },

            {
                title: "Try City",

                action:
                    "Click the City backdrop.",

                backdrop:
                    "city"
            },

            {
                title: "Return to Space",

                action:
                    "Click the Space backdrop.",

                backdrop:
                    "space"
            },

            {
                title: "Test it",

                action:
                    "Click the green flag.",

                run:
                    true
            }
        ]
    },


    6: {

        title: "Add Sound",

        description:
            "Sounds make a Scratch project feel alive.",

        steps: [

            {
                title: "Open Sounds",

                action:
                    "Click the Sounds tab.",

                tab:
                    "sounds"
            },

            {
                title: "Choose Meow",

                action:
                    "Click the Meow sound.",

                asset:
                    "sound",

                assetName:
                    "Meow"
            },

            {
                title: "Add the sound block",

                action:
                    "Return to Code → Sound and click 'start sound Meow'.",

                category:
                    "sound",

                block:
                    "soundstart"
            },

            {
                title: "Test it",

                action:
                    "Click the green flag.",

                run:
                    true
            }
        ]
    },


    7: {

        title: "Build AURA PLUS",

        description:
            "Combine Scratch ideas to understand how a real game works.",

        steps: [

            {
                title: "Start the game",

                action:
                    "Select AURA and open Events.",

                target:
                    "sprite-aura"
            },

            {
                title: "Add movement",

                action:
                    "Open Motion and click 'change x by 10'.",

                category:
                    "motion",

                block:
                    "changex"
            },

            {
                title: "Create Score",

                action:
                    "Open Variables and click 'set Score to 0'.",

                category:
                    "variables",

                block:
                    "setvar"
            },

            {
                title: "Collect points",

                action:
                    "Click 'change Score by 10'.",

                category:
                    "variables",

                block:
                    "changevar"
            },

            {
                title: "Sense the Orb",

                action:
                    "Open Sensing and click 'touching Orb?'.",

                category:
                    "sensing",

                block:
                    "touchingorb"
            },

            {
                title: "Make a decision",

                action:
                    "Open Control and click 'if then'.",

                category:
                    "control",

                block:
                    "if"
            },

            {
                title: "Compare values",

                action:
                    "Open Operators and click '1 > 1'.",

                category:
                    "operators",

                block:
                    "greater"
            },

            {
                title: "Select PORTAL",

                action:
                    "Click PORTAL in the Sprite List.",

                target:
                    "sprite-portal"
            },

            {
                title: "Play AURA PLUS",

                action:
                    "Click the green flag to launch the actual AURA PLUS game.",

                runGame:
                    true
            }
        ]
    }
};


/* =========================================================
   SCREEN NAVIGATION
   ========================================================= */

function showScreen(screenId) {

    $$(".screen").forEach(screen => {

        screen.classList.add("hidden");

        screen.classList.remove("active");
    });

    const screen = $(screenId);

    if (!screen) return;

    screen.classList.remove("hidden");

    screen.classList.add("active");
}


/* =========================================================
   OPEN MISSION
   ========================================================= */

function openMission(mission) {

    if (!lessons[mission]) return;

    currentMission = mission;

    currentStep = 0;

    selectedSprite = null;

    selectedCategory = "motion";

    selectedAsset = null;

    selectedAssetType = "costumes";

    selectedBackdrop = "space";

    currentEditorTab = "code";

    lastRunCompleted = false;

    /*
       Completely reset all individual scripts.
    */

    Object.keys(spriteWorkspaces).forEach(sprite => {

        spriteWorkspaces[sprite] = [];
    });

    workspaceBlocks = [];

    undoStack.length = 0;

    redoStack.length = 0;

    showScreen("lessonScreen");

    renderPalette();

    renderWorkspace();

    renderAssets();

    renderBackdrops();

    renderLessonStep();

    updateMissionProgress();
}


/* =========================================================
   SAVE / LOAD INDIVIDUAL SPRITE SCRIPT
   ========================================================= */

function saveCurrentSpriteScript() {

    if (!selectedSprite) return;

    spriteWorkspaces[selectedSprite] =
        JSON.parse(
            JSON.stringify(workspaceBlocks)
        );
}


function loadSpriteScript(sprite) {

    if (!sprite) {

        workspaceBlocks = [];

        return;
    }

    workspaceBlocks =
        JSON.parse(
            JSON.stringify(
                spriteWorkspaces[sprite] || []
            )
        );
}


/* =========================================================
   SELECT SPRITE
   ========================================================= */

function selectSprite(sprite) {

    /*
       FIRST save the script belonging to
       the sprite we were previously editing.
    */

    saveCurrentSpriteScript();

    selectedSprite = sprite;

    /*
       NOW load the newly selected sprite's
       own script.
    */

    loadSpriteScript(sprite);

    updateSpriteSelection();

    renderWorkspace();

    renderAssets();

    updateStageSprite();

    clearHighlights();

    $("stepStatus").textContent =
        `✓ ${capitalize(sprite)} selected. Its own script is shown.`;
}


/* =========================================================
   SPRITE UI
   ========================================================= */

function setupSprites() {

    $$(".sprite-card").forEach(card => {

        card.addEventListener("click", () => {

            selectSprite(
                card.dataset.sprite
            );

        });

    });


    $("chooseSpriteButton")
        ?.addEventListener(
            "click",
            addStarSprite
        );
}


function addStarSprite() {

    if (
        qs(
            '.sprite-card[data-sprite="star"]'
        )
    ) {

        $("stepStatus").textContent =
            "Star is already in the Sprite List.";

        return;
    }

    const list = $("spriteList");

    if (!list) return;

    const card =
        document.createElement("button");

    card.className =
        "sprite-card";

    card.dataset.sprite =
        "star";

    card.innerHTML = `
        <span class="sprite-thumb">
            ★
        </span>

        <span>
            <b>Star</b>
            <small>Sprite</small>
        </span>
    `;

    card.addEventListener(
        "click",
        () => selectSprite("star")
    );

    list.appendChild(card);

    spriteWorkspaces.star = [];

    $("stepStatus").textContent =
        "✓ New Star sprite added.";

    clearHighlights();
}


function updateSpriteSelection() {

    $$(".sprite-card").forEach(card => {

        card.classList.toggle(
            "selected",
            card.dataset.sprite === selectedSprite
        );

    });

    const label =
        $("activeSpriteLabel");

    if (label) {

        label.textContent =
            selectedSprite
                ? `Editing: ${capitalize(selectedSprite)}`
                : "No sprite selected";
    }
}


/* =========================================================
   CATEGORIES
   ========================================================= */

function setupCategories() {

    $$(".block-category")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    selectedCategory =
                        button.dataset.category;

                    $$(".block-category")
                        .forEach(item => {

                            item.classList.toggle(
                                "active",
                                item === button
                            );

                        });

                    renderPalette();

                    clearHighlights();

                    /*
                       If this is the required category
                       for the current lesson, highlight
                       the required block — but DO NOT
                       click/select it automatically.
                    */

                    const step =
                        lessons[currentMission]
                            ?.steps[currentStep];

                    if (
                        step?.category === selectedCategory &&
                        step?.block
                    ) {

                        highlightBlockOnly(
                            step.block
                        );
                    }
                }
            );

        });
}


/* =========================================================
   PALETTE
   ========================================================= */

function renderPalette() {

    const palette =
        $("blockPalette");

    if (!palette) return;

    palette.innerHTML = "";

    const list =
        scratchBlocks[selectedCategory] || [];

    list.forEach(def => {

        const block =
            document.createElement("button");

        block.className =
            `scratch-block palette-block block-${def.color}`;

        block.dataset.block =
            def.id;

        block.dataset.category =
            selectedCategory;

        block.textContent =
            def.text;

        block.addEventListener(
            "click",
            () => {

                addBlockToWorkspace(
                    def
                );

            }
        );

        palette.appendChild(block);

    });
}


/* =========================================================
   ADD BLOCK
   ========================================================= */

function addBlockToWorkspace(def) {

    if (!selectedSprite) {

        $("stepStatus").textContent =
            "⚠️ Select a sprite before adding code.";

        return;
    }

    undoStack.push(
        JSON.parse(
            JSON.stringify(workspaceBlocks)
        )
    );

    redoStack.length = 0;

    workspaceBlocks.push({

        id: def.id,

        text: def.text,

        category:
            selectedCategory,

        className:
            `block-${def.color}`

    });

    saveCurrentSpriteScript();

    renderWorkspace();

    lastRunCompleted = false;

    clearHighlights();

    $("stepStatus").textContent =
        `✓ "${def.text}" added to ${capitalize(selectedSprite)}.`;
}


/* =========================================================
   WORKSPACE
   ========================================================= */

function renderWorkspace() {

    const workspace =
        $("lessonBlocks");

    if (!workspace) return;

    workspace.innerHTML = "";

    if (!selectedSprite) {

        workspace.innerHTML = `
            <div class="workspace-empty">
                <div style="font-size:36px">👆</div>
                <strong>Select a sprite to see its scripts.</strong>
                <br>
                <small>
                    AURA, SHADOW, ORB and PORTAL each have their own code.
                </small>
            </div>
        `;

        return;
    }


    if (!workspaceBlocks.length) {

        workspace.innerHTML = `
            <div class="workspace-empty">
                <div style="font-size:36px">🧩</div>
                <strong>
                    No blocks in ${capitalize(selectedSprite)}'s script yet.
                </strong>
                <br>
                <small>
                    Click a Scratch block to add it.
                </small>
            </div>
        `;

    } else {

        const wrapper =
            document.createElement("div");

        wrapper.className =
            "workspace-blocks";

        workspaceBlocks.forEach(
            (block,index) => {

                const element =
                    document.createElement("div");

                element.className =
                    `workspace-block ${block.className || ""}`;

                element.dataset.index =
                    index;

                const text =
                    document.createElement("span");

                text.textContent =
                    block.text;

                element.appendChild(text);


                const remove =
                    document.createElement("button");

                remove.className =
                    "block-delete";

                remove.textContent =
                    "×";

                remove.title =
                    "Delete block";


                remove.addEventListener(
                    "click",
                    event => {

                        event.stopPropagation();

                        undoStack.push(
                            JSON.parse(
                                JSON.stringify(
                                    workspaceBlocks
                                )
                            )
                        );

                        redoStack.length = 0;

                        workspaceBlocks.splice(
                            index,
                            1
                        );

                        saveCurrentSpriteScript();

                        renderWorkspace();

                        lastRunCompleted = false;
                    }
                );

                element.appendChild(remove);

                wrapper.appendChild(element);

            }
        );

        workspace.appendChild(wrapper);
    }


    if ($("selectedTarget")) {

        $("selectedTarget").textContent =
            capitalize(selectedSprite);
    }

    if ($("blockCount")) {

        $("blockCount").textContent =
            `${workspaceBlocks.length} block${workspaceBlocks.length === 1 ? "" : "s"}`;
    }
}


/* =========================================================
   EDITOR TABS
   ========================================================= */

function setupEditorTabs() {

    $$(".project-tab")
        .forEach(tab => {

            tab.addEventListener(
                "click",
                () => {

                    switchEditorTab(
                        tab.dataset.editorTab
                    );

                }
            );

        });
}


function switchEditorTab(
    tabName,
    clear = true
) {

    currentEditorTab =
        tabName;

    $$(".project-tab")
        .forEach(tab => {

            tab.classList.toggle(
                "active",
                tab.dataset.editorTab === tabName
            );

        });


    const categories =
        $(".block-categories");

    const palette =
        $(".block-palette");


    if (tabName === "code") {

        categories?.classList.remove("hidden");

        palette?.classList.remove("hidden");

        renderWorkspace();

    } else {

        categories?.classList.add("hidden");

        palette?.classList.add("hidden");

        const workspace =
            $("lessonBlocks");

        if (workspace) {

            workspace.innerHTML = `
                <div class="workspace-empty">

                    <div style="font-size:42px">
                        ${tabName === "costumes" ? "🎭" : "🔊"}
                    </div>

                    <strong>
                        ${capitalize(tabName)}
                    </strong>

                    <br>

                    <small>
                        Choose an asset from the library.
                    </small>

                </div>
            `;
        }
    }


    renderAssets();

    if (clear)
        clearHighlights();
}


/* =========================================================
   ASSET TABS
   ========================================================= */

function setupAssetTabs() {

    $$(".asset-tab")
        .forEach(tab => {

            tab.addEventListener(
                "click",
                () => {

                    selectedAssetType =
                        tab.dataset.asset;

                    $$(".asset-tab")
                        .forEach(item => {

                            item.classList.toggle(
                                "active",
                                item === tab
                            );

                        });

                    renderAssets();

                    clearHighlights();
                }
            );

        });
}


/* =========================================================
   ASSETS
   ========================================================= */

function renderAssets() {

    const library =
        $("assetLibrary");

    if (!library) return;

    const sprite =
        selectedSprite || "aura";

    const data =
        spriteAssets[sprite] ||
        spriteAssets.aura;

    const assets =
        data[selectedAssetType] || [];

    library.innerHTML = "";

    assets.forEach(asset => {

        const button =
            document.createElement("button");

        button.className =
            "asset-item";

        button.dataset.asset =
            asset;

        button.innerHTML = `
            <span class="asset-icon">
                ${selectedAssetType === "sounds" ? "🔊" : "🎭"}
            </span>

            <span>${asset}</span>
        `;

        button.addEventListener(
            "click",
            () => {

                selectedAsset =
                    asset;

                $$(".asset-item")
                    .forEach(item => {

                        item.classList.remove(
                            "selected"
                        );

                    });

                button.classList.add(
                    "selected"
                );

                clearHighlights();

                if (
                    selectedAssetType ===
                    "costumes"
                ) {

                    updateStageCostume(
                        asset
                    );

                } else {

                    playSound(
                        asset
                    );
                }

                $("stepStatus").textContent =
                    `✓ ${asset} selected.`;
            }
        );

        library.appendChild(button);
    });
}


/* =========================================================
   BACKDROPS
   ========================================================= */

function setupBackdrops() {

    renderBackdrops();

    $("backdropLibrary")
        ?.addEventListener(
            "click",
            event => {

                const card =
                    event.target.closest(
                        ".backdrop-card"
                    );

                if (!card) return;

                selectBackdrop(
                    card.dataset.backdrop
                );
            }
        );
}


function renderBackdrops() {

    const library =
        $("backdropLibrary");

    if (!library) return;

    library.innerHTML = "";

    ["space","neon","city"]
        .forEach(name => {

            const card =
                document.createElement("button");

            card.className =
                "backdrop-card";

            card.dataset.backdrop =
                name;

            card.innerHTML = `
                <div
                    class="backdrop-thumb"
                    style="
                        background:${backdropData[name]}
                    ">
                </div>

                <small>
                    ${capitalize(name)}
                </small>
            `;

            library.appendChild(card);
        });

    selectBackdropVisual(
        selectedBackdrop
    );
}


function selectBackdrop(name) {

    selectedBackdrop =
        name;

    selectBackdropVisual(
        name
    );

    clearHighlights();

    $("stepStatus").textContent =
        `✓ ${capitalize(name)} backdrop selected.`;
}


function selectBackdropVisual(name) {

    $$(".backdrop-card")
        .forEach(card => {

            card.classList.toggle(
                "selected",
                card.dataset.backdrop === name
            );

        });

    const scene =
        $("stageBackground");

    if (scene) {

        scene.style.background =
            backdropData[name] ||
            backdropData.space;
    }
}


/* =========================================================
   HIGHLIGHT SYSTEM
   ========================================================= */

function clearHighlights() {

    $$(".lesson-target")
        .forEach(element => {

            element.classList.remove(
                "lesson-target"
            );

        });
}


function addHighlight(element) {

    if (!element) return;

    element.classList.add(
        "lesson-target"
    );

    element.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest"
    });
}


function highlightTarget(target) {

    clearHighlights();

    const map = {

        "sprite-aura":
            '.sprite-card[data-sprite="aura"]',

        "sprite-shadow":
            '.sprite-card[data-sprite="shadow"]',

        "sprite-orb":
            '.sprite-card[data-sprite="orb"]',

        "sprite-portal":
            '.sprite-card[data-sprite="portal"]',

        "choose-sprite":
            "#chooseSpriteButton",

        "run-button":
            "#stageGreenFlag"
    };

    addHighlight(
        qs(map[target])
    );
}


function highlightCategory(category) {

    clearHighlights();

    addHighlight(
        qs(
            `.block-category[data-category="${category}"]`
        )
    );
}


function highlightBlockOnly(id) {

    addHighlight(
        qs(
            `.scratch-block[data-block="${id}"]`
        )
    );
}


function highlightEditorTab(tab) {

    clearHighlights();

    addHighlight(
        qs(
            `.project-tab[data-editor-tab="${tab}"]`
        )
    );
}


function highlightAsset(name) {

    clearHighlights();

    addHighlight(
        qs(
            `.asset-item[data-asset="${CSS.escape(name)}"]`
        )
    );
}


function highlightBackdrop(name) {

    clearHighlights();

    addHighlight(
        qs(
            `.backdrop-card[data-backdrop="${name}"]`
        )
    );
}


/* =========================================================
   PART 1 ENDS HERE
   ========================================================= */
/* =========================================================
   AURA PLUS — PART 2 / 3
   LESSON ENGINE + VERIFICATION + RUNNER
   ========================================================= */


/* =========================================================
   LESSON STEP RENDERING
   ========================================================= */

function renderLessonStep() {

    const lesson =
        lessons[currentMission];

    if (!lesson) return;

    const step =
        lesson.steps[currentStep];

    if (!step) return;


    /* -----------------------------------------
       Basic lesson text
       ----------------------------------------- */

    if ($("lessonNumber")) {

        $("lessonNumber").textContent =
            `MISSION ${currentMission}`;
    }

    if ($("lessonStep")) {

        $("lessonStep").textContent =
            `STEP ${currentStep + 1}`;
    }

    if ($("lessonTitle")) {

        $("lessonTitle").textContent =
            step.title;
    }

    if ($("lessonDescription")) {

        $("lessonDescription").textContent =
            lesson.description;
    }

    if ($("actionText")) {

        $("actionText").textContent =
            step.action;
    }


    /* -----------------------------------------
       Why / teacher tip
       ----------------------------------------- */

    if ($("lessonWhy")) {

        $("lessonWhy").textContent =
            getWhyText(currentMission);
    }

    if ($("teacherTip")) {

        $("teacherTip").textContent =
            getTeacherTip(currentMission);
    }


    /* -----------------------------------------
       Progress
       ----------------------------------------- */

    const total =
        lesson.steps.length;

    const percent =
        ((currentStep) / total) * 100;

    if ($("stepProgressBar")) {

        $("stepProgressBar").style.width =
            `${percent}%`;
    }


    /* -----------------------------------------
       RESET VISUAL GUIDANCE
       ----------------------------------------- */

    clearHighlights();


    /*
       VERY IMPORTANT:

       renderLessonStep NEVER performs the
       student's action.

       It only tells/highlights what to do.
    */


    if (step.target) {

        highlightTarget(
            step.target
        );
    }


    if (step.tab) {

        highlightEditorTab(
            step.tab
        );
    }


    if (step.category) {

        highlightCategory(
            step.category
        );
    }


    if (step.block) {

        /*
           Only highlight the block if the
           correct category is already open.
        */

        if (
            selectedCategory ===
            step.category &&
            currentEditorTab === "code"
        ) {

            highlightBlockOnly(
                step.block
            );
        }
    }


    if (step.assetName) {

        /*
           Do not select the asset.
           Only guide the student toward it.
        */

        highlightAsset(
            step.assetName
        );
    }


    if (step.backdrop) {

        highlightBackdrop(
            step.backdrop
        );
    }


    /* -----------------------------------------
       Step status
       ----------------------------------------- */

    if ($("stepStatus")) {

        $("stepStatus").textContent =
            "👉 Complete the step, then press NEXT.";
    }


    /* -----------------------------------------
       NEXT button
       ----------------------------------------- */

    const next =
        $("nextLessonStep");

    if (next) {

        next.disabled = false;

        next.textContent =
            currentStep === total - 1
                ? "FINISH ✓"
                : "NEXT →";
    }
}


/* =========================================================
   WHY TEXT
   ========================================================= */

function getWhyText(mission) {

    const why = {

        1:
            "Sprites are the characters and objects that make up a Scratch project.",

        2:
            "Motion blocks control where a sprite moves on the stage.",

        3:
            "A sprite can have multiple costumes, so its appearance can change.",

        4:
            "Every sprite can have its own independent scripts.",

        5:
            "Backdrops create the setting or world of your project.",

        6:
            "Sounds can make actions and events much more exciting.",

        7:
            "A real game combines sprites, movement, sensing, variables and decisions."
    };

    return why[mission] || "";
}


/* =========================================================
   TEACHER TIP
   ========================================================= */

function getTeacherTip(mission) {

    const tips = {

        1:
            "Think of sprites as actors on a stage.",

        2:
            "Change one number and see what happens.",

        3:
            "Costumes change appearance, not the sprite itself.",

        4:
            "Look carefully: SHADOW's script should not be AURA's script.",

        5:
            "A backdrop belongs to the Stage, not to a sprite.",

        6:
            "Try different sounds and notice how they change the feeling.",

        7:
            "Games are built by combining small ideas into one system."
    };

    return tips[mission] || "";
}


/* =========================================================
   LESSON NEXT BUTTON
   ========================================================= */

function setupLessonButton() {

    const button =
        $("nextLessonStep");

    if (!button) return;


    button.addEventListener(
        "click",
        () => {

            const step =
                lessons[currentMission]
                    ?.steps[currentStep];

            if (!step) return;


            /*
               DO NOT ADVANCE until the student
               has actually completed the step.
            */

            const result =
                verifyLessonStep(step);


            if (!result.ok) {

                showStepError(
                    result.message
                );

                return;
            }


            /* ----------------------------------
               Correct!
               ---------------------------------- */

            showStepSuccess(
                result.message ||
                "Excellent! Step complete."
            );


            clearHighlights();


            const total =
                lessons[currentMission]
                    .steps.length;


            if (
                currentStep <
                total - 1
            ) {

                currentStep++;

                lastRunCompleted = false;

                renderLessonStep();

            } else {

                completeMission();
            }

        }
    );
}


/* =========================================================
   VERIFY LESSON STEP
   ========================================================= */

function verifyLessonStep(step) {


    /* -----------------------------------------
       Sprite selection
       ----------------------------------------- */

    if (step.target) {

        const required =
            step.target
                .replace("sprite-", "");

        if (
            selectedSprite !==
            required
        ) {

            return {
                ok: false,

                message:
                    `Not yet! Select ${capitalize(required)} first.`
            };
        }

        return {
            ok: true,
            message:
                `✓ ${capitalize(required)} selected.`
        };
    }


    /* -----------------------------------------
       Editor tab
       ----------------------------------------- */

    if (step.tab) {

        if (
            currentEditorTab !==
            step.tab
        ) {

            return {
                ok: false,

                message:
                    `Click the ${capitalize(step.tab)} tab first.`
            };
        }

        return {
            ok: true,
            message:
                `✓ ${capitalize(step.tab)} tab opened.`
        };
    }


    /* -----------------------------------------
       Backdrop
       ----------------------------------------- */

    if (step.backdrop) {

        if (
            selectedBackdrop !==
            step.backdrop
        ) {

            return {
                ok: false,

                message:
                    `Choose the ${capitalize(step.backdrop)} backdrop first.`
            };
        }

        return {
            ok: true,
            message:
                `✓ ${capitalize(step.backdrop)} backdrop selected.`
        };
    }


    /* -----------------------------------------
       Asset
       ----------------------------------------- */

    if (step.assetName) {

        if (
            selectedAsset !==
            step.assetName
        ) {

            return {
                ok: false,

                message:
                    `Click "${step.assetName}" in the asset library first.`
            };
        }

        return {
            ok: true,
            message:
                `✓ ${step.assetName} selected.`
        };
    }


    /* -----------------------------------------
       Block
       ----------------------------------------- */

    if (step.block) {

        if (
            currentEditorTab !==
            "code"
        ) {

            return {
                ok: false,

                message:
                    "Open the Code tab first."
            };
        }


        if (
            selectedCategory !==
            step.category
        ) {

            return {
                ok: false,

                message:
                    `Open the ${capitalize(step.category)} category first.`
            };
        }


        const found =
            workspaceBlocks.some(
                block =>
                    block.id ===
                    step.block
            );


        if (!found) {

            const definition =
                (
                    scratchBlocks[
                        step.category
                    ] || []
                ).find(
                    block =>
                        block.id ===
                        step.block
                );


            return {
                ok: false,

                message:
                    `Click "${definition?.text || step.block}" to add it.`
            };
        }


        return {
            ok: true,

            message:
                "✓ Correct Scratch block added."
        };
    }


    /* -----------------------------------------
       Run requirement
       ----------------------------------------- */

    if (step.run) {

        if (!lastRunCompleted) {

            return {
                ok: false,

                message:
                    "Click the green flag and let the project run first."
            };
        }

        return {
            ok: true,

            message:
                "✓ Project tested successfully."
        };
    }


    /* -----------------------------------------
       Final game
       ----------------------------------------- */

    if (step.runGame) {

        if (!gameRunning) {

            return {
                ok: false,

                message:
                    "Launch AURA PLUS with the green flag first."
            };
        }


        if (
            auraGame.score <
            50
        ) {

            return {
                ok: false,

                message:
                    `Collect all 5 Aura Orbs first. Score: ${auraGame.score}/50`
            };
        }


        return {
            ok: true,

            message:
                "🏆 AURA PLUS completed!"
        };
    }


    return {
        ok: true,
        message:
            "✓ Step complete."
    };
}


/* =========================================================
   STEP FEEDBACK
   ========================================================= */

function showStepError(message) {

    const status =
        $("stepStatus");

    if (!status) return;

    status.textContent =
        `⚠️ ${message}`;

    status.classList.remove(
        "success"
    );

    status.classList.add(
        "error"
    );

    setTimeout(
        () => {

            status.classList.remove(
                "error"
            );

        },
        1800
    );
}


function showStepSuccess(message) {

    const status =
        $("stepStatus");

    if (!status) return;

    status.textContent =
        message;

    status.classList.remove(
        "error"
    );

    status.classList.add(
        "success"
    );
}


/* =========================================================
   MISSION COMPLETION
   ========================================================= */

function completeMission() {

    if (
        !completedMissions.includes(
            currentMission
        )
    ) {

        completedMissions.push(
            currentMission
        );

        localStorage.setItem(
            "auraPlusMissions",
            JSON.stringify(
                completedMissions
            )
        );
    }


    const progress =
        $("stepProgressBar");

    if (progress) {

        progress.style.width =
            "100%";
    }


    if ($("stepStatus")) {

        $("stepStatus").textContent =
            `🏆 MISSION ${currentMission} COMPLETE!`;
    }


    const next =
        $("nextLessonStep");

    if (next) {

        next.textContent =
            "MISSION COMPLETE ✓";
    }


    clearHighlights();

    updateMissionProgress();
}


/* =========================================================
   MISSION PROGRESS
   ========================================================= */

function updateMissionProgress() {

    $$(".mission-card")
        .forEach(card => {

            const number =
                Number(
                    card.dataset.mission
                );

            card.classList.toggle(
                "completed",
                completedMissions.includes(
                    number
                )
            );

        });
}


/* =========================================================
   BLOCK HIGHLIGHT FIX
   ========================================================= */

function highlightBlock(id) {

    /*
       Older code may call highlightBlock().
       Keep it safe, but NEVER change category
       automatically.
    */

    if (
        selectedCategory !==
        "motion"
    ) {

        /* intentionally do nothing */
    }

    highlightBlockOnly(id);
}


/* =========================================================
   RUN CURRENT WORKSPACE
   ========================================================= */

function runWorkspace() {

    if (!selectedSprite) {

        showStepError(
            "Select a sprite first."
        );

        return;
    }


    saveCurrentSpriteScript();

    lessonRunning = true;

    lastRunCompleted = false;


    const blocks =
        workspaceBlocks.slice();


    /*
       Simple Scratch-like execution.
       This does not fake completion:
       it actually processes the blocks.
    */

    let index = 0;


    function executeNext() {

        if (
            index >=
            blocks.length
        ) {

            lessonRunning = false;

            lastRunCompleted = true;

            $("stepStatus").textContent =
                "▶️ Script finished running.";

            return;
        }


        const block =
            blocks[index];


        executeBlock(
            block
        );


        index++;


        lessonTimer =
            setTimeout(
                executeNext,
                350
            );
    }


    executeNext();
}


/* =========================================================
   EXECUTE SCRATCH-LIKE BLOCK
   ========================================================= */

function executeBlock(block) {

    if (!block) return;


    const text =
        block.text.toLowerCase();


    /* -----------------------------------------
       MOVE
       ----------------------------------------- */

    if (
        block.id ===
        "move"
    ) {

        movePreviewSprite(
            10,
            0
        );

        return;
    }


    /* -----------------------------------------
       CHANGE X
       ----------------------------------------- */

    if (
        block.id ===
        "changex"
    ) {

        movePreviewSprite(
            10,
            0
        );

        return;
    }


    /* -----------------------------------------
       CHANGE Y
       ----------------------------------------- */

    if (
        block.id ===
        "changey"
    ) {

        movePreviewSprite(
            0,
            10
        );

        return;
    }


    /* -----------------------------------------
       TURN
       ----------------------------------------- */

    if (
        block.id ===
        "turn"
    ) {

        const player =
            $("previewPlayer");

        if (player) {

            const current =
                Number(
                    player.dataset.rotation ||
                    0
                );

            player.dataset.rotation =
                current + 15;

            player.style.transform =
                `rotate(${current + 15}deg)`;
        }

        return;
    }


    /* -----------------------------------------
       SAY
       ----------------------------------------- */

    if (
        block.id ===
        "say"
    ) {

        showPreviewMessage(
            "Hello!"
        );

        return;
    }


    /* -----------------------------------------
       NEXT COSTUME
       ----------------------------------------- */

    if (
        block.id ===
        "nextcostume"
    ) {

        cyclePreviewCostume();

        return;
    }


    /* -----------------------------------------
       SOUND
       ----------------------------------------- */

    if (
        block.id ===
        "soundstart" ||
        block.id ===
        "soundwait"
    ) {

        playSound(
            "Meow"
        );

        return;
    }


    /* -----------------------------------------
       SCORE
       ----------------------------------------- */

    if (
        block.id ===
        "changevar"
    ) {

        auraGame.score += 10;

        updateGameHUD();

        return;
    }


    /* -----------------------------------------
       SET SCORE
       ----------------------------------------- */

    if (
        block.id ===
        "setvar"
    ) {

        auraGame.score = 0;

        updateGameHUD();

        return;
    }
}


/* =========================================================
   PREVIEW MOVEMENT
   ========================================================= */

function movePreviewSprite(
    dx,
    dy
) {

    const player =
        $("previewPlayer");

    if (!player) return;


    let x =
        Number(
            player.dataset.x || 50
        );

    let y =
        Number(
            player.dataset.y || 50
        );


    x += dx;

    y += dy;


    x =
        Math.max(
            5,
            Math.min(
                95,
                x
            )
        );

    y =
        Math.max(
            5,
            Math.min(
                95,
                y
            )
        );


    player.dataset.x =
        x;

    player.dataset.y =
        y;


    player.style.left =
        `${x}%`;

    player.style.top =
        `${y}%`;
}


/* =========================================================
   PREVIEW COSTUMES
   ========================================================= */

function updateStageCostume(
    costume
) {

    selectedAsset =
        costume;

    const player =
        $("previewPlayer");

    if (!player) return;


    player.dataset.costume =
        costume;


    /*
       Visual costume changes without
       automatically choosing the costume.
    */

    if (
        costume
            .toLowerCase()
            .includes("glow")
    ) {

        player.classList.add(
            "glowing"
        );

    } else {

        player.classList.remove(
            "glowing"
        );
    }
}


function cyclePreviewCostume() {

    const data =
        spriteAssets[
            selectedSprite ||
            "aura"
        ];


    const costumes =
        data?.costumes || [];


    if (!costumes.length)
        return;


    let current =
        playerCostumeIndex();


    current =
        (current + 1) %
        costumes.length;


    updateStageCostume(
        costumes[current]
    );
}


function playerCostumeIndex() {

    const player =
        $("previewPlayer");

    if (!player)
        return 0;


    const current =
        player.dataset.costume;


    const costumes =
        spriteAssets[
            selectedSprite ||
            "aura"
        ]?.costumes || [];


    const index =
        costumes.indexOf(
            current
        );


    return index >= 0
        ? index
        : 0;
}


/* =========================================================
   PREVIEW MESSAGE
   ========================================================= */

function showPreviewMessage(
    message
) {

    const player =
        $("previewPlayer");

    if (!player) return;


    let bubble =
        qs(".preview-speech");


    if (!bubble) {

        bubble =
            document.createElement(
                "div"
            );

        bubble.className =
            "preview-speech";

        player.parentElement
            ?.appendChild(
                bubble
            );
    }


    bubble.textContent =
        message;


    bubble.classList.add(
        "show"
    );


    setTimeout(
        () => {

            bubble.classList.remove(
                "show"
            );

        },
        1800
    );
}


/* =========================================================
   SOUND
   ========================================================= */

function playSound(name) {

    /*
       Browser audio may require a user
       interaction. We therefore create
       a tiny oscillator only after a
       real click.
    */

    try {

        const AudioContext =
            window.AudioContext ||
            window.webkitAudioContext;

        if (!AudioContext)
            return;

        const context =
            new AudioContext();

        const oscillator =
            context.createOscillator();

        const gain =
            context.createGain();


        const frequencies = {

            Meow: 660,

            Pop: 880,

            Collect: 1040,

            Boom: 130,

            Buzz: 220,

            Magic: 740,

            Win: 1200
        };


        oscillator.frequency.value =
            frequencies[name] ||
            600;


        oscillator.type =
            name === "Boom"
                ? "sawtooth"
                : "sine";


        gain.gain.setValueAtTime(
            0.001,
            context.currentTime
        );

        gain.gain.exponentialRampToValueAtTime(
            0.15,
            context.currentTime + 0.02
        );

        gain.gain.exponentialRampToValueAtTime(
            0.001,
            context.currentTime + 0.25
        );


        oscillator.connect(
            gain
        );

        gain.connect(
            context.destination
        );


        oscillator.start();

        oscillator.stop(
            context.currentTime +
            0.25
        );

    } catch (error) {

        console.log(
            "Sound unavailable:",
            error
        );
    }
}


/* =========================================================
   CAPITALIZE
   ========================================================= */

function capitalize(value) {

    if (!value)
        return "";

    return value.charAt(0)
        .toUpperCase() +
        value.slice(1);
}


/* =========================================================
   UNDO
   ========================================================= */

function undoWorkspace() {

    if (!selectedSprite)
        return;


    if (!undoStack.length)
        return;


    redoStack.push(
        JSON.parse(
            JSON.stringify(
                workspaceBlocks
            )
        )
    );


    workspaceBlocks =
        undoStack.pop();


    saveCurrentSpriteScript();

    renderWorkspace();
}


function redoWorkspace() {

    if (!selectedSprite)
        return;


    if (!redoStack.length)
        return;


    undoStack.push(
        JSON.parse(
            JSON.stringify(
                workspaceBlocks
            )
        )
    );


    workspaceBlocks =
        redoStack.pop();


    saveCurrentSpriteScript();

    renderWorkspace();
}


/* =========================================================
   TOOLBAR
   ========================================================= */

function setupToolbar() {

    const undo =
        qs(
            '[title*="Undo"]'
        );

    const redo =
        qs(
            '[title*="Redo"]'
        );


    undo?.addEventListener(
        "click",
        undoWorkspace
    );

    redo?.addEventListener(
        "click",
        redoWorkspace
    );


    $("lessonFlag")
        ?.addEventListener(
            "click",
            () => {

                runWorkspace();
            }
        );


    $("lessonStop")
        ?.addEventListener(
            "click",
            () => {

                stopWorkspace();
            }
        );


    $("stageFlag")
        ?.addEventListener(
            "click",
            () => {

                runWorkspace();
            }
        );


    $("stageStop")
        ?.addEventListener(
            "click",
            () => {

                stopWorkspace();
            }
        );
}


/* =========================================================
   STOP WORKSPACE
   ========================================================= */

function stopWorkspace() {

    if (lessonTimer) {

        clearTimeout(
            lessonTimer
        );

        lessonTimer = null;
    }

    lessonRunning = false;

    $("stepStatus").textContent =
        "⏹ Script stopped.";
}


/* =========================================================
   STAGE SPRITE UPDATE
   ========================================================= */

function updateStageSprite() {

    const player =
        $("previewPlayer");

    if (!player) return;


    player.dataset.sprite =
        selectedSprite || "";


    const names = {

        aura: "A",

        shadow: "S",

        orb: "✦",

        portal: "◎",

        star: "★"
    };


    player.textContent =
        names[selectedSprite] ||
        "?";
}


/* =========================================================
   INIT
   ========================================================= */

function initializeAuraPlus() {

    setupSprites();

    setupCategories();

    setupEditorTabs();

    setupAssetTabs();

    setupBackdrops();

    setupLessonButton();

    setupToolbar();

    renderPalette();

    renderWorkspace();

    renderAssets();

    renderBackdrops();

    updateMissionProgress();


    /*
       IMPORTANT:
       No sprite is automatically selected.
       No category is automatically selected
       for a lesson.
       No backdrop is automatically selected.
       No costume/sound is automatically
       selected.
    */

    selectedSprite = null;

    updateSpriteSelection();

    renderWorkspace();
}


/* =========================================================
   DOM READY
   ========================================================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeAuraPlus
    );

} else {

    initializeAuraPlus();
}


/* =========================================================
   PART 2 ENDS HERE
   ========================================================= */
/* =========================================================
   AURA PLUS — PART 3 / 3
   GAME ENGINE + NAVIGATION + TOUCH + FINAL POLISH
   ========================================================= */


/* =========================================================
   AURA PLUS GAME
   ========================================================= */

const gameWorld =
    () => $("gameWorld");


const playerElement =
    () => $("player");


const shadowElement =
    () => $("shadow");


const portalElement =
    () => $("portal");


/* =========================================================
   RESET GAME
   ========================================================= */

function resetGameObjects() {

    const world =
        gameWorld();

    if (!world) return;


    /*
       Remove old generated game objects.
    */

    world
        .querySelectorAll(
            ".aura-orb,.game-portal,.game-shadow"
        )
        .forEach(
            element =>
                element.remove()
        );


    /*
       Create 5 Aura Orbs.
    */

    const orbPositions = [

        { x: 20, y: 20 },

        { x: 48, y: 22 },

        { x: 75, y: 30 },

        { x: 32, y: 68 },

        { x: 70, y: 72 }
    ];


    orbPositions.forEach(
        (position,index) => {

            const orb =
                document.createElement("div");

            orb.className =
                "aura-orb";

            orb.dataset.index =
                index;

            orb.dataset.collected =
                "false";

            orb.style.left =
                `${position.x}%`;

            orb.style.top =
                `${position.y}%`;

            orb.innerHTML =
                "✦";

            world.appendChild(
                orb
            );
        }
    );


    /*
       Create portal.
    */

    const portal =
        document.createElement("div");

    portal.id =
        "portal";

    portal.className =
        "game-portal";

    portal.style.left =
        "88%";

    portal.style.top =
        "50%";

    portal.innerHTML =
        "◎";

    portal.style.opacity =
        "0.25";

    world.appendChild(
        portal
    );


    /*
       Create Shadow.
    */

    const shadow =
        document.createElement("div");

    shadow.id =
        "shadow";

    shadow.className =
        "game-shadow";

    shadow.style.left =
        "72%";

    shadow.style.top =
        "50%";

    shadow.innerHTML =
        "☠";

    world.appendChild(
        shadow
    );


    /*
       Reset player.
    */

    const player =
        playerElement();

    if (player) {

        player.style.left =
            "10%";

        player.style.top =
            "50%";

        player.dataset.x =
            "10";

        player.dataset.y =
            "50";
    }


    auraGame = {

        x: 10,

        y: 50,

        score: 0,

        lives: 3,

        collected: 0,

        shadowX: 72,

        shadowY: 50
    };


    updateGameHUD();

    gameRunning = false;
}


/* =========================================================
   GAME HUD
   ========================================================= */

function updateGameHUD() {

    const score =
        $("gameScore");

    const lives =
        $("gameLives");

    const collected =
        $("gameCollected");


    if (score) {

        score.textContent =
            auraGame.score;
    }


    if (lives) {

        lives.textContent =
            auraGame.lives;
    }


    if (collected) {

        collected.textContent =
            `${auraGame.collected}/5`;
    }


    /*
       Support alternative IDs too.
    */

    qs("#scoreValue") &&
        (qs("#scoreValue").textContent =
            auraGame.score);

    qs("#livesValue") &&
        (qs("#livesValue").textContent =
            auraGame.lives);

    qs("#orbCount") &&
        (qs("#orbCount").textContent =
            `${auraGame.collected}/5`);
}


/* =========================================================
   START GAME
   ========================================================= */

function startAuraPlusGame() {

    resetGameObjects();

    gameRunning = true;

    lastHit = 0;


    const world =
        gameWorld();

    if (!world) return;


    /*
       Start animation loop.
    */

    if (gameAnimation) {

        cancelAnimationFrame(
            gameAnimation
        );
    }


    gameLoop();
}


/* =========================================================
   GAME LOOP
   ========================================================= */

function gameLoop() {

    if (!gameRunning)
        return;


    moveShadow();

    checkOrbCollisions();

    checkShadowCollision();

    checkPortalCollision();


    gameAnimation =
        requestAnimationFrame(
            gameLoop
        );
}


/* =========================================================
   MOVE PLAYER
   ========================================================= */

function moveGamePlayer(
    dx,
    dy
) {

    if (!gameRunning)
        return;


    auraGame.x += dx;

    auraGame.y += dy;


    /*
       Keep player inside game area.
    */

    auraGame.x =
        Math.max(
            4,
            Math.min(
                94,
                auraGame.x
            )
        );


    auraGame.y =
        Math.max(
            8,
            Math.min(
                88,
                auraGame.y
            )
        );


    const player =
        playerElement();

    if (!player) return;


    player.style.left =
        `${auraGame.x}%`;

    player.style.top =
        `${auraGame.y}%`;


    player.dataset.x =
        auraGame.x;

    player.dataset.y =
        auraGame.y;
}


/* =========================================================
   KEYBOARD CONTROLS
   ========================================================= */

function setupGameControls() {

    document.addEventListener(
        "keydown",
        event => {

            if (!gameRunning)
                return;


            let dx = 0;

            let dy = 0;


            switch (
                event.key.toLowerCase()
            ) {

                case "arrowleft":
                case "a":
                    dx = -2;
                    break;

                case "arrowright":
                case "d":
                    dx = 2;
                    break;

                case "arrowup":
                case "w":
                    dy = -2;
                    break;

                case "arrowdown":
                case "s":
                    dy = 2;
                    break;

                default:
                    return;
            }


            event.preventDefault();

            moveGamePlayer(
                dx,
                dy
            );
        }
    );


    /*
       Touch / smartboard controls.
    */

    $$(".game-control")
        .forEach(button => {

            const direction =
                button.dataset.direction;


            const move =
                () => {

                    const movement = {

                        left: [-3, 0],

                        right: [3, 0],

                        up: [0, -3],

                        down: [0, 3]
                    };


                    const [dx,dy] =
                        movement[
                            direction
                        ] || [0,0];


                    moveGamePlayer(
                        dx,
                        dy
                    );
                };


            button.addEventListener(
                "pointerdown",
                event => {

                    event.preventDefault();

                    move();
                }
            );

        });
}


/* =========================================================
   SHADOW AI
   ========================================================= */

function moveShadow() {

    const shadow =
        shadowElement();

    if (!shadow)
        return;


    /*
       Simple chasing AI.
    */

    const differenceX =
        auraGame.x -
        auraGame.shadowX;


    const differenceY =
        auraGame.y -
        auraGame.shadowY;


    const distance =
        Math.sqrt(
            differenceX * differenceX +
            differenceY * differenceY
        );


    /*
       Shadow becomes more dangerous
       as the game progresses.
    */

    const speed =
        auraGame.collected >= 3
            ? 0.18
            : 0.10;


    if (distance > 0) {

        auraGame.shadowX +=
            (differenceX / distance) *
            speed;

        auraGame.shadowY +=
            (differenceY / distance) *
            speed;
    }


    shadow.style.left =
        `${auraGame.shadowX}%`;

    shadow.style.top =
        `${auraGame.shadowY}%`;
}


/* =========================================================
   ORB COLLISION
   ========================================================= */

function checkOrbCollisions() {

    const orbs =
        $$(".aura-orb");


    orbs.forEach(
        orb => {

            if (
                orb.dataset.collected ===
                "true"
            )
                return;


            const x =
                parseFloat(
                    orb.style.left
                );

            const y =
                parseFloat(
                    orb.style.top
                );


            const distance =
                Math.sqrt(
                    Math.pow(
                        auraGame.x - x,
                        2
                    ) +
                    Math.pow(
                        auraGame.y - y,
                        2
                    )
                );


            if (
                distance <
                7
            ) {

                collectOrb(
                    orb
                );
            }
        }
    );
}


/* =========================================================
   COLLECT ORB
   ========================================================= */

function collectOrb(orb) {

    if (
        orb.dataset.collected ===
        "true"
    )
        return;


    orb.dataset.collected =
        "true";


    orb.classList.add(
        "collected"
    );


    auraGame.collected++;

    auraGame.score += 10;


    playSound(
        "Collect"
    );


    updateGameHUD();


    /*
       Unlock portal after all 5.
    */

    if (
        auraGame.collected >= 5
    ) {

        unlockPortal();
    }
}


/* =========================================================
   PORTAL UNLOCK
   ========================================================= */

function unlockPortal() {

    const portal =
        portalElement();

    if (!portal)
        return;


    portal.classList.add(
        "unlocked"
    );


    portal.style.opacity =
        "1";


    portal.style.pointerEvents =
        "auto";


    portal.innerHTML =
        "✦";


    showGameMessage(
        "PORTAL UNLOCKED! ✨"
    );
}


/* =========================================================
   SHADOW COLLISION
   ========================================================= */

function checkShadowCollision() {

    const now =
        Date.now();


    if (
        now - lastHit <
        1200
    )
        return;


    const distance =
        Math.sqrt(
            Math.pow(
                auraGame.x -
                auraGame.shadowX,
                2
            ) +
            Math.pow(
                auraGame.y -
                auraGame.shadowY,
                2
            )
        );


    if (
        distance <
        7
    ) {

        lastHit =
            now;

        loseLife();
    }
}


/* =========================================================
   LOSE LIFE
   ========================================================= */

function loseLife() {

    auraGame.lives--;

    updateGameHUD();


    const player =
        playerElement();

    player?.classList.add(
        "hit"
    );


    setTimeout(
        () => {

            player?.classList.remove(
                "hit"
            );

        },
        400
    );


    if (
        auraGame.lives <= 0
    ) {

        gameOver();

        return;
    }


    /*
       Respawn player away from Shadow.
    */

    auraGame.x =
        10;

    auraGame.y =
        50;


    moveGamePlayer(
        0,
        0
    );


    showGameMessage(
        `⚡ HIT! ${auraGame.lives} lives left`
    );
}


/* =========================================================
   PORTAL COLLISION
   ========================================================= */

function checkPortalCollision() {

    if (
        auraGame.collected <
        5
    )
        return;


    const distance =
        Math.sqrt(
            Math.pow(
                auraGame.x - 88,
                2
            ) +
            Math.pow(
                auraGame.y - 50,
                2
            )
        );


    if (
        distance <
        8
    ) {

        winAuraPlus();
    }
}


/* =========================================================
   WIN
   ========================================================= */

function winAuraPlus() {

    if (!gameRunning)
        return;


    gameRunning = false;


    if (gameAnimation) {

        cancelAnimationFrame(
            gameAnimation
        );

        gameAnimation = null;
    }


    playSound(
        "Win"
    );


    showGameMessage(
        "🏆 AURA PLUS COMPLETE!"
    );


    /*
       Mark Mission 7 complete.
    */

    if (
        !completedMissions.includes(7)
    ) {

        completedMissions.push(7);

        localStorage.setItem(
            "auraPlusMissions",
            JSON.stringify(
                completedMissions
            )
        );
    }


    lastRunCompleted = true;

    updateMissionProgress();


    /*
       Allow the lesson's final NEXT
       to finish.
    */

    setTimeout(
        () => {

            if (
                currentMission === 7
            ) {

                $("stepStatus").textContent =
                    "🏆 You built and completed AURA PLUS!";

            }

        },
        500
    );
}


/* =========================================================
   GAME OVER
   ========================================================= */

function gameOver() {

    gameRunning = false;


    if (gameAnimation) {

        cancelAnimationFrame(
            gameAnimation
        );

        gameAnimation = null;
    }


    showGameMessage(
        "💥 GAME OVER — Press the flag to retry."
    );
}


/* =========================================================
   GAME MESSAGE
   ========================================================= */

function showGameMessage(
    message
) {

    let messageBox =
        $("gameMessage");


    if (!messageBox) {

        const world =
            gameWorld();

        if (!world)
            return;


        messageBox =
            document.createElement(
                "div"
            );

        messageBox.id =
            "gameMessage";

        messageBox.className =
            "game-message";

        world.appendChild(
            messageBox
        );
    }


    messageBox.textContent =
        message;


    messageBox.classList.add(
        "show"
    );


    setTimeout(
        () => {

            messageBox.classList.remove(
                "show"
            );

        },
        2200
    );
}


/* =========================================================
   GAME BUTTON
   ========================================================= */

function setupGameButtons() {

    const flag =
        $("gameFlag");


    flag?.addEventListener(
        "click",
        () => {

            startAuraPlusGame();
        }
    );


    /*
       Existing stage green flag
       should also launch the actual
       game when Mission 7 is active.
    */

    $("stageFlag")
        ?.addEventListener(
            "click",
            () => {

                if (
                    currentMission ===
                    7
                ) {

                    startAuraPlusGame();

                } else {

                    runWorkspace();
                }
            }
        );


    $("lessonFlag")
        ?.addEventListener(
            "click",
            () => {

                if (
                    currentMission ===
                    7 &&
                    currentStep ===
                    lessons[7].steps.length - 1
                ) {

                    startAuraPlusGame();

                } else {

                    runWorkspace();
                }
            }
        );
}


/* =========================================================
   BACK TO MISSIONS
   ========================================================= */

function setupNavigation() {

    $("backToMissions")
        ?.addEventListener(
            "click",
            () => {

                stopWorkspace();

                gameRunning =
                    false;

                if (gameAnimation) {

                    cancelAnimationFrame(
                        gameAnimation
                    );

                    gameAnimation =
                        null;
                }

                showScreen(
                    "missionsScreen"
                );

                updateMissionProgress();
            }
        );


    /*
       Reveal button
    */

    $("revealButton")
        ?.addEventListener(
            "click",
            () => {

                showScreen(
                    "missionsScreen"
                );

                updateMissionProgress();
            }
        );


    /*
       Start / enter button.
    */

    $("startButton")
        ?.addEventListener(
            "click",
            () => {

                showScreen(
                    "missionsScreen"
                );
            }
        );


    /*
       Mission cards.
    */

    $$(".mission-card")
        .forEach(card => {

            card.addEventListener(
                "click",
                () => {

                    const mission =
                        Number(
                            card.dataset.mission
                        );

                    if (!mission)
                        return;

                    openMission(
                        mission
                    );
                }
            );

        });
}


/* =========================================================
   GAME INITIALIZATION
   ========================================================= */

function initializeGame() {

    resetGameObjects();

    setupGameControls();

    setupGameButtons();
}


/* =========================================================
   FINAL INITIALIZATION
   ========================================================= */

function finalAuraInitialization() {

    initializeGame();

    setupNavigation();

    updateMissionProgress();

    /*
       Make sure the lesson starts
       with no accidental sprite selection.
    */

    selectedSprite = null;

    updateSpriteSelection();

    renderWorkspace();


    /*
       Default backdrop visual only.
       It is NOT counted as a student action.
    */

    selectBackdropVisual(
        selectedBackdrop
    );
}


/* =========================================================
   SAFE FINAL START
   ========================================================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        finalAuraInitialization
    );

} else {

    finalAuraInitialization();
}


/* =========================================================
   TOUCH FRIENDLY EXTRA
   ========================================================= */

document.addEventListener(
    "pointerdown",
    event => {

        const target =
            event.target.closest(
                ".scratch-block,.sprite-card,.asset-item,.backdrop-card,.project-tab"
            );


        if (!target)
            return;


        /*
           Prevent accidental double activation
           on touch screens.
        */

        target.style.transform =
            "scale(.97)";


        setTimeout(
            () => {

                target.style.transform =
                    "";

            },
            100
        );
    }
);


/* =========================================================
   FINAL SAFETY
   ========================================================= */

window.addEventListener(
    "beforeunload",
    () => {

        saveCurrentSpriteScript();

        localStorage.setItem(
            "auraPlusMissions",
            JSON.stringify(
                completedMissions
            )
        );
    }
);


/* =========================================================
   AURA PLUS — END
   ========================================================= */
