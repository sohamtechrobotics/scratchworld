"use strict";

/* =========================================================
   AURA PLUS — COMPLETE SCRIPT
   Matches current index.html
   ========================================================= */


/* =========================================================
   HELPERS
   ========================================================= */

const $ = id => document.getElementById(id);

const $$ = selector =>
    [...document.querySelectorAll(selector)];

const qs = selector =>
    document.querySelector(selector);

function capitalize(text) {
    if (!text) return "";
    return text.charAt(0).toUpperCase() + text.slice(1);
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}


/* =========================================================
   SCREEN NAVIGATION
   ========================================================= */

function showScreen(id) {

    $$(".screen").forEach(screen => {
        screen.classList.add("hidden");
        screen.classList.remove("active");
    });

    const screen = $(id);

    if (!screen) return;

    screen.classList.remove("hidden");
    screen.classList.add("active");
}


/* =========================================================
   GLOBAL STATE
   ========================================================= */

let currentMission = 1;
let currentStep = 0;

/*
   IMPORTANT:
   Nothing is selected automatically when a lesson opens.
*/

let selectedSprite = null;

let selectedCategory = "motion";

let selectedAssetType = "costumes";

let selectedAsset = null;

let selectedBackdrop = "space";

let currentEditorTab = "code";


/* =========================================================
   SEPARATE SCRIPT FOR EVERY SPRITE
   ========================================================= */

const scriptWorkspaces = {
    Aura: [],
    Shadow: [],
    Orb: [],
    Portal: [],
    Star: [],
    Stage: []
};

let workspaceBlocks = [];


/* =========================================================
   UNDO / REDO
   ========================================================= */

let undoStack = [];
let redoStack = [];


/* =========================================================
   LESSON RUN STATE
   ========================================================= */

let lastRunCompleted = false;
let lessonRunning = false;
let lessonRunTimer = null;


/* =========================================================
   MISSION PROGRESS
   ========================================================= */

let completedMissions = [];

try {
    completedMissions =
        JSON.parse(
            localStorage.getItem("auraPlusMissions") || "[]"
        );
} catch {
    completedMissions = [];
}


/* =========================================================
   BLOCK DEFINITIONS
   ========================================================= */

const blocks = {

    motion: [
        {
            id: "move",
            text: "move 10 steps",
            className: "block-motion",
            inputs: [
                { type: "number", value: "10" }
            ]
        },
        {
            id: "turn",
            text: "turn 15 degrees",
            className: "block-motion",
            inputs: [
                { type: "number", value: "15" }
            ]
        },
        {
            id: "random",
            text: "go to random position",
            className: "block-motion"
        },
        {
            id: "changex",
            text: "change x by 10",
            className: "block-motion",
            inputs: [
                { type: "number", value: "10" }
            ]
        },
        {
            id: "changey",
            text: "change y by 10",
            className: "block-motion",
            inputs: [
                { type: "number", value: "10" }
            ]
        },
        {
            id: "setx",
            text: "set x to 0",
            className: "block-motion",
            inputs: [
                { type: "number", value: "0" }
            ]
        },
        {
            id: "sety",
            text: "set y to 0",
            className: "block-motion",
            inputs: [
                { type: "number", value: "0" }
            ]
        },
        {
            id: "bounce",
            text: "if on edge, bounce",
            className: "block-motion"
        }
    ],

    looks: [
        {
            id: "say",
            text: "say Hello! for 2 seconds",
            className: "block-looks",
            inputs: [
                { type: "text", value: "Hello!" },
                { type: "number", value: "2" }
            ]
        },
        {
            id: "sayforever",
            text: "say Hello!",
            className: "block-looks",
            inputs: [
                { type: "text", value: "Hello!" }
            ]
        },
        {
            id: "costume",
            text: "switch costume to costume1",
            className: "block-looks"
        },
        {
            id: "nextcostume",
            text: "next costume",
            className: "block-looks"
        },
        {
            id: "size",
            text: "change size by 10",
            className: "block-looks",
            inputs: [
                { type: "number", value: "10" }
            ]
        }
    ],

    sound: [
        {
            id: "soundstart",
            text: "start sound Meow",
            className: "block-sound"
        },
        {
            id: "soundwait",
            text: "play sound Meow until done",
            className: "block-sound"
        },
        {
            id: "volume",
            text: "change volume by -10",
            className: "block-sound",
            inputs: [
                { type: "number", value: "-10" }
            ]
        }
    ],

    events: [
        {
            id: "flag",
            text: "when green flag clicked",
            className: "block-events"
        },
        {
            id: "spriteclick",
            text: "when this sprite clicked",
            className: "block-events"
        },
        {
            id: "space",
            text: "when space key pressed",
            className: "block-events"
        },
        {
            id: "receive",
            text: "when I receive message1",
            className: "block-events"
        },
        {
            id: "broadcast",
            text: "broadcast message1",
            className: "block-events"
        }
    ],

    control: [
        {
            id: "wait",
            text: "wait 1 seconds",
            className: "block-control",
            inputs: [
                { type: "number", value: "1" }
            ]
        },
        {
            id: "repeat",
            text: "repeat 10",
            className: "block-control",
            inputs: [
                { type: "number", value: "10" }
            ]
        },
        {
            id: "forever",
            text: "forever",
            className: "block-control"
        },
        {
            id: "if",
            text: "if then",
            className: "block-control"
        },
        {
            id: "ifelse",
            text: "if then else",
            className: "block-control"
        },
        {
            id: "stop",
            text: "stop all",
            className: "block-control"
        }
    ],

    sensing: [
        {
            id: "touching",
            text: "touching mouse-pointer?",
            className: "block-sensing"
        },
        {
            id: "touchingorb",
            text: "touching Orb?",
            className: "block-sensing"
        },
        {
            id: "ask",
            text: "ask What's your name? and wait",
            className: "block-sensing"
        },
        {
            id: "key",
            text: "key space pressed?",
            className: "block-sensing"
        },
        {
            id: "mouse",
            text: "mouse down?",
            className: "block-sensing"
        }
    ],

    operators: [
        {
            id: "add",
            text: "1 + 1",
            className: "block-operators"
        },
        {
            id: "greater",
            text: "1 > 1",
            className: "block-operators"
        },
        {
            id: "equals",
            text: "1 = 1",
            className: "block-operators"
        },
        {
            id: "randomnumber",
            text: "pick random 1 to 10",
            className: "block-operators"
        },
        {
            id: "join",
            text: "join hello world",
            className: "block-operators"
        }
    ],

    variables: [
        {
            id: "setvar",
            text: "set Score to 0",
            className: "block-variables",
            inputs: [
                { type: "number", value: "0" }
            ]
        },
        {
            id: "changevar",
            text: "change Score by 10",
            className: "block-variables",
            inputs: [
                { type: "number", value: "10" }
            ]
        },
        {
            id: "showvar",
            text: "show variable Score",
            className: "block-variables"
        },
        {
            id: "hidevar",
            text: "hide variable Score",
            className: "block-variables"
        }
    ],

    myblocks: [
        {
            id: "define",
            text: "define my block",
            className: "block-myblocks"
        },
        {
            id: "custom",
            text: "my block",
            className: "block-myblocks"
        }
    ]
};


/* =========================================================
   ASSETS
   ========================================================= */

const spriteAssets = {

    Aura: {
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

    Shadow: {
        costumes: [
            "Shadow",
            "Shadow Attack"
        ],
        sounds: [
            "Boom",
            "Buzz"
        ]
    },

    Orb: {
        costumes: [
            "Orb",
            "Orb Glow"
        ],
        sounds: [
            "Pop",
            "Collect"
        ]
    },

    Portal: {
        costumes: [
            "Portal",
            "Portal Open"
        ],
        sounds: [
            "Magic",
            "Win"
        ]
    },

    Star: {
        costumes: [
            "Star"
        ],
        sounds: [
            "Pop"
        ]
    }
};


/* =========================================================
   BACKDROP DATA
   ========================================================= */

const backdropData = {

    space:
        "radial-gradient(circle at 50% 45%, #172554, #07101e 75%)",

    neon:
        "linear-gradient(135deg,#7c3aed,#0891b2)",

    city:
        "linear-gradient(180deg,#38bdf8 0 50%,#334155 50%)",

    sunset:
        "linear-gradient(180deg,#f97316,#7c3aed,#111827)"
};


/* =========================================================
   LESSONS
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
                    "Click the SHADOW sprite.",

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

        title: "Make a Sprite Move",

        description:
            "Use Motion blocks to control movement.",

        steps: [

            {
                title: "Start the script",

                action:
                    "Click Events, then click 'when green flag clicked'.",

                category:
                    "events",

                block:
                    "flag"
            },

            {
                title: "Move AURA",

                action:
                    "Click Motion, then click 'move 10 steps'.",

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
                title: "Choose a costume",

                action:
                    "Click a costume in the costume library.",

                asset:
                    "costume"
            },

            {
                title: "Return to Code",

                action:
                    "Click Code, then Looks, then 'next costume'.",

                tab:
                    "code",

                category:
                    "looks",

                block:
                    "nextcostume"
            },

            {
                title: "Run it",

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
            "Different sprites can have different scripts.",

        steps: [

            {
                title: "Select AURA",

                action:
                    "Click AURA in the Sprite List.",

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
                    "Click SHADOW in the Sprite List.",

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

        title: "Change the Backdrop",

        description:
            "Backdrops create the world of your project.",

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
                title: "Test the Stage",

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
                title: "Choose a sound",

                action:
                    "Click a sound in the sound library.",

                asset:
                    "sound"
            },

            {
                title: "Add the sound block",

                action:
                    "Click Code, then Sound, then 'start sound Meow'.",

                tab:
                    "code",

                category:
                    "sound",

                block:
                    "soundstart"
            },

            {
                title: "Test the sound",

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
            "Combine Scratch ideas to understand the actual AURA PLUS game.",

        steps: [

            {
                title: "Start the game script",

                action:
                    "Select AURA, open Events and click 'when green flag clicked'.",

                target:
                    "sprite-aura"
            },

            {
                title: "Add the event block",

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
   SPRITE WORKSPACE MANAGEMENT
   ========================================================= */

function saveCurrentSpriteWorkspace() {

    if (!selectedSprite) return;

    scriptWorkspaces[selectedSprite] =
        JSON.parse(
            JSON.stringify(workspaceBlocks)
        );
}


function loadSpriteWorkspace(sprite) {

    if (!sprite) {

        workspaceBlocks = [];

        return;
    }

    workspaceBlocks =
        JSON.parse(
            JSON.stringify(
                scriptWorkspaces[sprite] || []
            )
        );
}


/* =========================================================
   SPRITE SELECTION
   ========================================================= */

function selectSprite(sprite) {

    saveCurrentSpriteWorkspace();

    selectedSprite = sprite;

    loadSpriteWorkspace(sprite);

    updateSpriteSelection();

    renderWorkspace();

    renderAssets();

    clearHighlights();

    $("stepStatus").textContent =
        `✓ ${sprite} selected. Its own script is shown.`;
}


function updateSpriteSelection() {

    $$(".sprite-card").forEach(card => {

        card.classList.toggle(
            "selected",
            card.dataset.sprite === selectedSprite
        );

    });

    $("selectedTarget").textContent =
        selectedSprite || "No sprite selected";

    updateStageSprite();
}


/* =========================================================
   SPRITE LIST
   ========================================================= */

function setupSprites() {

    $$(".sprite-card").forEach(card => {

        card.addEventListener(
            "click",
            () => {

                selectSprite(
                    card.dataset.sprite
                );
            }
        );

    });


    $("chooseSpriteButton")
        ?.addEventListener(
            "click",
            addStarSprite
        );


    $("addSpriteButton")
        ?.addEventListener(
            "click",
            addStarSprite
        );
}


function addStarSprite() {

    if (
        qs(
            '.sprite-card[data-sprite="Star"]'
        )
    ) {

        $("stepStatus").textContent =
            "Star is already in the Sprite List.";

        return;
    }


    const list =
        $("spriteList");

    if (!list) return;


    const card =
        document.createElement("button");

    card.className =
        "sprite-card";

    card.dataset.sprite =
        "Star";


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
        () => {

            selectSprite("Star");

        }
    );


    list.appendChild(card);

    scriptWorkspaces.Star = [];

    $("stepStatus").textContent =
        "✓ New Star sprite added.";

    clearHighlights();
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


                    const step =
                        lessons[currentMission]
                            ?.steps[currentStep];


                    if (
                        step?.category ===
                        selectedCategory &&
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


    const names = {

        motion: "Motion",
        looks: "Looks",
        sound: "Sound",
        events: "Events",
        control: "Control",
        sensing: "Sensing",
        operators: "Operators",
        variables: "Variables",
        myblocks: "My Blocks"
    };


    $("paletteCategory").textContent =
        names[selectedCategory] ||
        selectedCategory;


    palette.innerHTML = "";


    const categoryBlocks =
        blocks[selectedCategory] || [];


    categoryBlocks.forEach(
        definition => {

            const element =
                document.createElement("button");

            element.className =
                `scratch-block ${definition.className}`;

            element.dataset.block =
                definition.id;

            element.dataset.category =
                selectedCategory;

            element.textContent =
                definition.text;


            element.addEventListener(
                "click",
                () => {

                    addBlockToWorkspace(
                        selectedCategory,
                        definition
                    );
                }
            );


            palette.appendChild(element);
        }
    );
}


/* =========================================================
   ADD BLOCK
   ========================================================= */

function addBlockToWorkspace(
    category,
    definition
) {

    if (!selectedSprite) {

        $("stepStatus").textContent =
            "⚠️ Select a sprite first.";

        return;
    }


    saveUndo();


    workspaceBlocks.push({

        category,

        id:
            definition.id,

        text:
            definition.text,

        className:
            definition.className,

        inputs:
            definition.inputs
                ? definition.inputs.map(
                    input => ({
                        type: input.type,
                        value: input.value
                    })
                )
                : []
    });


    saveCurrentSpriteWorkspace();

    renderWorkspace();

    lastRunCompleted = false;

    clearHighlights();


    $("stepStatus").textContent =
        "✓ Block added! Press NEXT to continue.";

    $("bottomHint").textContent =
        "Block added to your script.";
}


/* =========================================================
   WORKSPACE
   ========================================================= */

function clearWorkspace() {

    workspaceBlocks = [];

    renderWorkspace();
}


function renderWorkspace() {

    const workspace =
        $("lessonBlocks");

    if (!workspace) return;


    workspace.innerHTML = "";


    if (!selectedSprite) {

        workspace.innerHTML = `
            <div class="workspace-empty">
                <div style="font-size:32px">👆</div>
                <strong>Select a sprite</strong>
                <br>
                <small>
                    Each sprite has its own Scratch scripts.
                </small>
            </div>
        `;

    } else if (
        workspaceBlocks.length === 0
    ) {

        workspace.innerHTML = `
            <div class="workspace-empty">
                <div style="font-size:32px">🧩</div>
                <strong>
                    ${selectedSprite}'s script is empty
                </strong>
                <br>
                <small>
                    Tap a Scratch block to add it.
                </small>
            </div>
        `;

    } else {

        workspaceBlocks.forEach(
            (block,index) => {

                const element =
                    document.createElement("div");

                element.className =
                    `workspace-block ${block.className}`;

                element.dataset.index =
                    index;


                buildWorkspaceBlock(
                    element,
                    block
                );


                workspace.appendChild(
                    element
                );
            }
        );
    }


    $("blockCount").textContent =
        `${workspaceBlocks.length} block${workspaceBlocks.length === 1 ? "" : "s"}`;


    updateRunHint();
}


function buildWorkspaceBlock(
    element,
    block
) {

    const span =
        document.createElement("span");

    span.textContent =
        block.text;


    element.appendChild(span);


    if (
        block.inputs &&
        block.inputs.length
    ) {

        block.inputs.forEach(
            (inputData,index) => {

                const input =
                    document.createElement("input");

                input.type =
                    inputData.type === "number"
                        ? "number"
                        : "text";

                input.value =
                    inputData.value;

                input.className =
                    "block-input";


                input.addEventListener(
                    "input",
                    () => {

                        inputData.value =
                            input.value;

                        saveCurrentSpriteWorkspace();

                        lastRunCompleted =
                            false;
                    }
                );


                element.appendChild(
                    input
                );
            }
        );
    }


    const remove =
        document.createElement("button");

    remove.className =
        "workspace-delete";

    remove.textContent =
        "×";

    remove.title =
        "Remove block";


    remove.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            saveUndo();

            const index =
                Number(
                    element.dataset.index
                );

            workspaceBlocks.splice(
                index,
                1
            );

            saveCurrentSpriteWorkspace();

            renderWorkspace();
        }
    );


    element.appendChild(
        remove
    );
}


/* =========================================================
   UNDO / REDO
   ========================================================= */

function saveUndo() {

    undoStack.push(
        JSON.parse(
            JSON.stringify(
                workspaceBlocks
            )
        )
    );


    if (
        undoStack.length > 30
    ) {

        undoStack.shift();
    }


    redoStack = [];
}


function undoWorkspace() {

    if (
        !selectedSprite ||
        !undoStack.length
    )
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

    saveCurrentSpriteWorkspace();

    renderWorkspace();
}


function redoWorkspace() {

    if (
        !selectedSprite ||
        !redoStack.length
    )
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

    saveCurrentSpriteWorkspace();

    renderWorkspace();
}


function setupUndoRedo() {

    const buttons =
        $$(".toolbar-icon");


    buttons.forEach(button => {

        if (
            button.title ===
            "Undo"
        ) {

            button.addEventListener(
                "click",
                undoWorkspace
            );
        }


        if (
            button.title ===
            "Redo"
        ) {

            button.addEventListener(
                "click",
                redoWorkspace
            );
        }

    });
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
    tabName
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


    if (
        tabName === "costumes"
    ) {

        selectedAssetType =
            "costumes";

        renderAssets();

        clearHighlights();

        highlightEditorTab(
            "costumes"
        );

        return;
    }


    if (
        tabName === "sounds"
    ) {

        selectedAssetType =
            "sounds";

        renderAssets();

        clearHighlights();

        highlightEditorTab(
            "sounds"
        );

        return;
    }


    clearHighlights();

    renderPalette();

    renderWorkspace();
}


/* =========================================================
   ASSETS
   ========================================================= */

function setupAssets() {

    renderAssets();


    $("assetLibraryAdd")
        ?.addEventListener(
            "click",
            () => {

                $("stepStatus").textContent =
                    "Choose an asset from the library.";
            }
        );


    $("chooseAssetButton")
        ?.addEventListener(
            "click",
            () => {

                $("stepStatus").textContent =
                    "Choose an asset from the library.";
            }
        );


    $("uploadAssetButton")
        ?.addEventListener(
            "click",
            () => {

                $("stepStatus").textContent =
                    "Upload is simulated in this learning lab.";
            }
        );


    $("paintAssetButton")
        ?.addEventListener(
            "click",
            () => {

                $("stepStatus").textContent =
                    "Paint mode is simulated in this learning lab.";
            }
        );
}


function renderAssets() {

    const items =
        $("assetLibraryItems");

    if (!items) return;


    const sprite =
        selectedSprite ||
        "Aura";


    const data =
        spriteAssets[sprite] ||
        spriteAssets.Aura;


    const assets =
        data[selectedAssetType] ||
        [];


    $("assetLibraryTitle").textContent =
        selectedAssetType === "sounds"
            ? "SOUNDS"
            : "COSTUMES";


    items.innerHTML = "";


    assets.forEach(
        (asset,index) => {

            const button =
                document.createElement("button");

            button.className =
                "asset-item";

            button.dataset.asset =
                asset;


            button.innerHTML =
                selectedAssetType === "sounds"
                    ? "🔊"
                    : index === 0
                        ? "A"
                        : "🎭";


            button.title =
                asset;


            button.addEventListener(
                "click",
                () => {

                    selectedAsset =
                        asset;


                    $$(".asset-item")
                        .forEach(
                            item =>
                                item.classList.remove(
                                    "selected"
                                )
                        );


                    button.classList.add(
                        "selected"
                    );


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


                    clearHighlights();


                    $("stepStatus").textContent =
                        `✓ ${asset} selected.`;
                }
            );


            items.appendChild(
                button
            );
        }
    );
}


/* =========================================================
   BACKDROPS
   ========================================================= */

function setupBackdrops() {

    renderBackdrops();


    $("addBackdropButton")
        ?.addEventListener(
            "click",
            addSunsetBackdrop
        );


    $("chooseBackdropButton")
        ?.addEventListener(
            "click",
            () => {

                $("stepStatus").textContent =
                    "Choose a backdrop from the library.";
            }
        );


    $("uploadBackdropButton")
        ?.addEventListener(
            "click",
            () => {

                $("stepStatus").textContent =
                    "Upload is simulated in this learning lab.";
            }
        );


    $("paintBackdropButton")
        ?.addEventListener(
            "click",
            () => {

                $("stepStatus").textContent =
                    "Paint mode is simulated in this learning lab.";
            }
        );
}


function renderBackdrops() {

    const items =
        $("backdropItems");

    if (!items) return;


    items.innerHTML = "";


    Object.keys(
        backdropData
    ).forEach(
        name => {

            const button =
                document.createElement("button");

            button.className =
                "backdrop-card";

            button.dataset.backdrop =
                name;


            button.innerHTML = `
                <div
                    class="backdrop-thumb"
                    style="background:${backdropData[name]}"
                ></div>

                <small>
                    ${capitalize(name)}
                </small>
            `;


            button.addEventListener(
                "click",
                () => {

                    selectBackdrop(
                        name
                    );
                }
            );


            items.appendChild(
                button
            );
        }
    );


    updateBackdropVisual();
}


function addSunsetBackdrop() {

    if (
        qs(
            '.backdrop-card[data-backdrop="sunset"]'
        )
    )
        return;


    renderBackdrops();


    $("stepStatus").textContent =
        "✓ Sunset backdrop added.";
}


function selectBackdrop(name) {

    selectedBackdrop =
        name;


    updateBackdropVisual();

    clearHighlights();


    $("stepStatus").textContent =
        `✓ ${capitalize(name)} backdrop selected.`;
}


function updateBackdropVisual() {

    $$(".backdrop-card")
        .forEach(card => {

            card.classList.toggle(
                "selected",
                card.dataset.backdrop ===
                selectedBackdrop
            );

        });


    const scene =
        qs(".stage-scene");


    if (scene) {

        scene.style.background =
            backdropData[
                selectedBackdrop
            ] ||
            backdropData.space;
    }
}


/* =========================================================
   HIGHLIGHTS
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

    try {

        element.scrollIntoView({
            behavior: "smooth",
            block: "nearest"
        });

    } catch {}
}


function highlightTarget(target) {

    clearHighlights();


    const map = {

        "sprite-aura":
            '.sprite-card[data-sprite="Aura"]',

        "sprite-shadow":
            '.sprite-card[data-sprite="Shadow"]',

        "sprite-orb":
            '.sprite-card[data-sprite="Orb"]',

        "sprite-portal":
            '.sprite-card[data-sprite="Portal"]',

        "choose-sprite":
            "#chooseSpriteButton",

        "run-button":
            "#lessonFlag"
    };


    addHighlight(
        qs(
            map[target]
        )
    );
}


function highlightEditorTab(tab) {

    const element =
        qs(
            `.project-tab[data-editor-tab="${tab}"]`
        );

    addHighlight(
        element
    );
}


function highlightBlockOnly(blockId) {

    addHighlight(
        qs(
            `.scratch-block[data-block="${blockId}"]`
        )
    );
}


function highlightBackdrop(name) {

    addHighlight(
        qs(
            `.backdrop-card[data-backdrop="${name}"]`
        )
    );
}


/* =========================================================
   LESSON ENGINE
   ========================================================= */

function openMission(mission) {

    if (!lessons[mission])
        return;


    currentMission =
        mission;

    currentStep =
        0;


    /*
       IMPORTANT:
       Do not auto-select AURA.
    */

    selectedSprite =
        null;


    selectedCategory =
        "motion";


    selectedAsset =
        null;


    selectedAssetType =
        "costumes";


    selectedBackdrop =
        "space";


    currentEditorTab =
        "code";


    workspaceBlocks =
        [];


    undoStack =
        [];


    redoStack =
        [];


    lastRunCompleted =
        false;


    showScreen(
        "lessonScreen"
    );


    updateSpriteSelection();

    renderPalette();

    renderAssets();

    renderBackdrops();

    renderWorkspace();

    renderLessonStep();
}


function renderLessonStep() {

    const lesson =
        lessons[currentMission];


    if (!lesson)
        return;


    const step =
        lesson.steps[currentStep];


    if (!step)
        return;


    const total =
        lesson.steps.length;


    $("lessonNumber").textContent =
        currentMission;


    $("lessonStep").textContent =
        `${currentStep + 1}/${total}`;


    $("lessonTitle").textContent =
        step.title;


    $("lessonDescription").textContent =
        lesson.description;


    $("actionText").textContent =
        step.action;


    $("lessonWhy").textContent =
        getLessonWhy(
            currentMission
        );


    $("teacherTip").textContent =
        getTeacherTip(
            currentMission
        );


    $("workspaceInstruction").textContent =
        "Do the highlighted action yourself, then press NEXT.";


    $("bottomHint").textContent =
        step.action;


    $("stepProgressBar").style.width =
        `${((currentStep + 1) / total) * 100}%`;


    $("nextLessonStep").innerHTML =
        currentStep === total - 1
            ? "FINISH <span>✓</span>"
            : "NEXT <span>→</span>";


    clearHighlights();


    /*
       NEVER perform the action automatically.
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


    if (
        step.category &&
        !step.tab
    ) {

        addHighlight(
            qs(
                `.block-category[data-category="${step.category}"]`
            )
        );
    }


    if (
        step.block &&
        selectedCategory ===
        step.category &&
        currentEditorTab ===
        "code"
    ) {

        highlightBlockOnly(
            step.block
        );
    }


    if (step.backdrop) {

        highlightBackdrop(
            step.backdrop
        );
    }


    $("stepStatus").textContent =
        "👉 Complete this step yourself, then press NEXT.";
}


function getLessonWhy(mission) {

    const text = {

        1:
            "Sprites are the characters and objects in a Scratch project.",

        2:
            "Motion blocks control where a sprite moves.",

        3:
            "A sprite can have multiple costumes.",

        4:
            "Each sprite can have its own independent scripts.",

        5:
            "Backdrops create the setting of the project.",

        6:
            "Sounds give feedback and make projects more exciting.",

        7:
            "Real games combine sprites, movement, sensing, variables and decisions."
    };


    return text[mission] || "";
}


function getTeacherTip(mission) {

    const text = {

        1:
            "Think of sprites as actors on a stage.",

        2:
            "Try changing the number inside a Motion block.",

        3:
            "Costumes change appearance, not the identity of the sprite.",

        4:
            "Watch the selected sprite — its script belongs only to it.",

        5:
            "The Stage uses backdrops.",

        6:
            "Different sounds can create completely different moods.",

        7:
            "Build small ideas, then combine them into a game."
    };


    return text[mission] || "";
}


/* =========================================================
   STEP VERIFICATION
   ========================================================= */

function verifyLessonStep(step) {


    /* -----------------------------------------
       SPRITE
       ----------------------------------------- */

    if (step.target) {

        const required =
            step.target
                .replace(
                    "sprite-",
                    ""
                );


        const expected =
            capitalize(
                required
            );


        if (
            selectedSprite !==
            expected
        ) {

            return {

                ok: false,

                message:
                    `Select ${expected} first.`
            };
        }


        return {

            ok: true,

            message:
                `✓ ${expected} selected.`
        };
    }


    /* -----------------------------------------
       TAB
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
    }


    /* -----------------------------------------
       ASSET
       ----------------------------------------- */

    if (step.asset) {

        const requiredType =
            step.asset === "sound"
                ? "sounds"
                : "costumes";


        if (
            selectedAssetType !==
            requiredType
        ) {

            return {

                ok: false,

                message:
                    `Open ${capitalize(requiredType)} first.`
            };
        }


        if (!selectedAsset) {

            return {

                ok: false,

                message:
                    "Choose an asset from the library first."
            };
        }
    }


    /* -----------------------------------------
       BACKDROP
       ----------------------------------------- */

    if (step.backdrop) {

        if (
            selectedBackdrop !==
            step.backdrop
        ) {

            return {

                ok: false,

                message:
                    `Click the ${capitalize(step.backdrop)} backdrop first.`
            };
        }


        return {

            ok: true,

            message:
                "✓ Backdrop selected."
        };
    }


    /* -----------------------------------------
       BLOCK
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
                    `Open ${capitalize(step.category)} first.`
            };
        }


        const exists =
            workspaceBlocks.some(
                block =>
                    block.id ===
                    step.block
            );


        if (!exists) {

            const definition =
                (
                    blocks[
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
                    `Click "${definition?.text || step.block}" first.`
            };
        }


        return {

            ok: true,

            message:
                "✓ Correct Scratch block added."
        };
    }


    /* -----------------------------------------
       RUN
       ----------------------------------------- */

    if (step.run) {

        if (!lastRunCompleted) {

            return {

                ok: false,

                message:
                    "Click the green flag and let your script finish."
            };
        }


        return {

            ok: true,

            message:
                "✓ Script tested successfully."
        };
    }


    /* -----------------------------------------
       GAME
       ----------------------------------------- */

    if (step.runGame) {

        return {

            ok: true,

            message:
                "Launching AURA PLUS..."
        };
    }


    return {

        ok: true,

        message:
            "✓ Step complete."
    };
}


/* =========================================================
   NEXT BUTTON
   ========================================================= */

function setupLessonButton() {

    $("nextLessonStep")
        ?.addEventListener(
            "click",
            () => {

                const lesson =
                    lessons[currentMission];


                const step =
                    lesson?.steps[
                        currentStep
                    ];


                if (!step)
                    return;


                /*
                   Final game step:
                   NEXT launches the actual game.
                */

                if (
                    step.runGame
                ) {

                    launchAuraPlusFromLesson();

                    return;
                }


                const result =
                    verifyLessonStep(
                        step
                    );


                if (!result.ok) {

                    showStepError(
                        result.message
                    );

                    return;
                }


                showStepSuccess(
                    result.message
                );


                if (
                    currentStep <
                    lesson.steps.length - 1
                ) {

                    currentStep++;

                    lastRunCompleted =
                        false;

                    renderLessonStep();

                } else {

                    completeMission();
                }
            }
        );
}


/* =========================================================
   FEEDBACK
   ========================================================= */

function showStepError(message) {

    const status =
        $("stepStatus");

    if (!status)
        return;


    status.textContent =
        `⚠️ ${message}`;


    status.classList.add(
        "error"
    );


    setTimeout(
        () => {

            status.classList.remove(
                "error"
            );

        },
        1500
    );
}


function showStepSuccess(message) {

    const status =
        $("stepStatus");

    if (!status)
        return;


    status.textContent =
        message;


    status.classList.add(
        "success"
    );


    setTimeout(
        () => {

            status.classList.remove(
                "success"
            );

        },
        1200
    );
}


/* =========================================================
   RUNNER
   ========================================================= */

function setupRunButtons() {

    $("lessonFlag")
        ?.addEventListener(
            "click",
            runWorkspace
        );


    $("stageFlag")
        ?.addEventListener(
            "click",
            () => {

                if (
                    currentMission ===
                    7
                ) {

                    startGame();

                } else {

                    runWorkspace();
                }
            }
        );


    $("lessonStop")
        ?.addEventListener(
            "click",
            stopLessonPreview
        );


    $("stageStop")
        ?.addEventListener(
            "click",
            stopLessonPreview
        );
}


function runWorkspace() {

    if (!selectedSprite) {

        showStepError(
            "Select a sprite first."
        );

        return;
    }


    saveCurrentSpriteWorkspace();


    if (lessonRunTimer) {

        clearTimeout(
            lessonRunTimer
        );
    }


    lastRunCompleted =
        false;

    lessonRunning =
        true;


    const preview =
        $("previewPlayer");


    if (!preview)
        return;


    let x = 50;

    let y = 50;

    let direction = 90;

    let size = 100;

    let index = 0;


    const runBlocks =
        JSON.parse(
            JSON.stringify(
                workspaceBlocks
            )
        );


    function executeNext() {

        if (
            index >=
            runBlocks.length
        ) {

            lessonRunning =
                false;

            lastRunCompleted =
                true;

            $("stepStatus").textContent =
                "✓ Script finished running.";

            return;
        }


        const block =
            runBlocks[index];


        const value =
            Number(
                block.inputs?.find(
                    input =>
                        input.type ===
                        "number"
                )?.value ||
                10
            );


        switch (
            block.id
        ) {

            case "flag":

                x = 50;
                y = 50;

                break;


            case "move":

                x +=
                    value / 2;

                break;


            case "changex":

                x +=
                    value / 2;

                break;


            case "changey":

                y -=
                    value / 2;

                break;


            case "setx":

                x =
                    50 +
                    value / 2;

                break;


            case "sety":

                y =
                    50 -
                    value / 2;

                break;


            case "random":

                x =
                    15 +
                    Math.random() *
                    70;

                y =
                    15 +
                    Math.random() *
                    70;

                break;


            case "turn":

                direction +=
                    value;

                preview.style.transform =
                    `translate(-50%,-50%) rotate(${direction}deg)`;

                break;


            case "size":

                size =
                    clamp(
                        size + value,
                        40,
                        180
                    );

                preview.style.width =
                    `${30 * size / 100}px`;

                preview.style.height =
                    `${30 * size / 100}px`;

                break;


            case "nextcostume":

                updateStageCostume(
                    "AURA GLOW"
                );

                break;


            case "say":

                showStageBubble(
                    block.inputs?.find(
                        input =>
                            input.type ===
                            "text"
                    )?.value ||
                    "Hello!"
                );

                break;


            case "soundstart":
            case "soundwait":

                playSound(
                    "Meow"
                );

                break;


            case "setvar":
            case "changevar":

                pulseStage();

                break;


            case "bounce":

                x =
                    clamp(
                        x,
                        10,
                        90
                    );

                y =
                    clamp(
                        y,
                        10,
                        90
                    );

                break;
        }


        x =
            clamp(
                x,
                8,
                92
            );


        y =
            clamp(
                y,
                10,
                88
            );


        preview.style.left =
            `${x}%`;

        preview.style.top =
            `${y}%`;


        index++;


        lessonRunTimer =
            setTimeout(
                executeNext,
                300
            );
    }


    executeNext();
}


function stopLessonPreview() {

    if (lessonRunTimer) {

        clearTimeout(
            lessonRunTimer
        );

        lessonRunTimer =
            null;
    }


    lessonRunning =
        false;


    resetPreview();
}


function resetPreview() {

    const preview =
        $("previewPlayer");

    if (!preview)
        return;


    preview.style.left =
        "50%";

    preview.style.top =
        "50%";

    preview.style.width =
        "30px";

    preview.style.height =
        "30px";

    preview.style.transform =
        "translate(-50%,-50%)";


    hideStageBubble();
}


/* =========================================================
   STAGE
   ========================================================= */

function updateStageSprite() {

    const preview =
        $("previewPlayer");

    if (!preview)
        return;


    const data = {

        Aura: {
            text: "A",
            background:
                "radial-gradient(circle,#fff,#a78bfa 45%,#7c3aed)"
        },

        Shadow: {
            text: "◆",
            background:
                "linear-gradient(135deg,#111827,#7f1d1d)"
        },

        Orb: {
            text: "●",
            background:
                "radial-gradient(circle,#fff,#22d3ee)"
        },

        Portal: {
            text: "✦",
            background:
                "radial-gradient(circle,#fff,#8b5cf6)"
        },

        Star: {
            text: "★",
            background:
                "radial-gradient(circle,#fff,#facc15)"
        }
    };


    const sprite =
        data[selectedSprite] ||
        data.Aura;


    preview.textContent =
        sprite.text;


    preview.style.background =
        sprite.background;
}


function updateStageCostume(
    costume
) {

    const preview =
        $("previewPlayer");

    if (!preview)
        return;


    if (
        costume
            .toLowerCase()
            .includes("glow")
    ) {

        preview.style.boxShadow =
            "0 0 35px #c4b5fd";

    } else {

        preview.style.boxShadow =
            "0 0 18px #8b5cf6";
    }


    $("stepStatus").textContent =
        `✓ Costume changed to ${costume}.`;
}


function showStageBubble(
    text
) {

    const stage =
        $("previewStage");

    if (!stage)
        return;


    let bubble =
        stage.querySelector(
            ".stage-speech"
        );


    if (!bubble) {

        bubble =
            document.createElement(
                "div"
            );

        bubble.className =
            "stage-speech";


        Object.assign(
            bubble.style,
            {

                position:
                    "absolute",

                zIndex:
                    "20",

                left:
                    "50%",

                top:
                    "25%",

                transform:
                    "translateX(-50%)",

                padding:
                    "8px 12px",

                background:
                    "#fff",

                color:
                    "#111827",

                borderRadius:
                    "10px",

                fontSize:
                    "10px",

                fontWeight:
                    "800"
            }
        );


        stage.appendChild(
            bubble
        );
    }


    bubble.textContent =
        text;


    setTimeout(
        hideStageBubble,
        1800
    );
}


function hideStageBubble() {

    $(
        "previewStage"
    )
        ?.querySelector(
            ".stage-speech"
        )
        ?.remove();
}


function pulseStage() {

    const stage =
        $("previewStage");

    if (!stage)
        return;


    stage.animate(
        [
            {
                transform:
                    "scale(1)"
            },

            {
                transform:
                    "scale(1.025)"
            },

            {
                transform:
                    "scale(1)"
            }
        ],
        {
            duration:
                350
        }
    );
}


/* =========================================================
   SOUND
   ========================================================= */

function playSound(name) {

    try {

        const AudioContext =
            window.AudioContext ||
            window.webkitAudioContext;


        if (!AudioContext)
            return;


        const ctx =
            new AudioContext();


        const oscillator =
            ctx.createOscillator();


        const gain =
            ctx.createGain();


        const frequencies = {

            Pop: 650,

            Collect: 880,

            Magic: 520,

            Win: 1040,

            Meow: 500,

            Boom: 120,

            Buzz: 180
        };


        oscillator.frequency.value =
            frequencies[name] ||
            600;


        oscillator.type =
            name === "Boom"
                ? "sawtooth"
                : "sine";


        gain.gain.setValueAtTime(
            0.0001,
            ctx.currentTime
        );


        gain.gain.exponentialRampToValueAtTime(
            0.12,
            ctx.currentTime + 0.01
        );


        gain.gain.exponentialRampToValueAtTime(
            0.0001,
            ctx.currentTime + 0.18
        );


        oscillator.connect(
            gain
        );


        gain.connect(
            ctx.destination
        );


        oscillator.start();


        oscillator.stop(
            ctx.currentTime + 0.2
        );

    } catch (error) {

        console.log(
            "Sound unavailable",
            error
        );
    }
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
    }


    localStorage.setItem(
        "auraPlusMissions",
        JSON.stringify(
            completedMissions
        )
    );


    updateMissionProgress();


    $("stepStatus").textContent =
        "🏆 Mission complete!";


    setTimeout(
        () => {

            showScreen(
                "tutorialScreen"
            );

        },
        700
    );
}


function updateMissionProgress() {

    $$(".mission-card")
        .forEach(card => {

            const mission =
                Number(
                    card.dataset.mission
                );


            card.classList.toggle(
                "completed",
                completedMissions.includes(
                    mission
                )
            );
        });


    const completed =
        completedMissions.length;


    if ($("tutorialAura")) {

        $("tutorialAura").textContent =
            `${completed} / 7`;
    }


    if ($("auraProgress")) {

        $("auraProgress").style.width =
            `${(completed / 7) * 100}%`;
    }
}


/* =========================================================
   RUN HINT
   ========================================================= */

function updateRunHint() {

    const count =
        workspaceBlocks.length;


    if (!$("bottomHint"))
        return;


    $("bottomHint").textContent =
        count
            ? `${count} block${count === 1 ? "" : "s"} ready — click RUN to test.`
            : "Do the highlighted action.";
}


/* =========================================================
   REAL AURA PLUS GAME
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
   GAME START
   ========================================================= */

function startGame() {

    stopGame();


    gameRunning =
        true;


    auraGame = {

        x: 12,

        y: 50,

        score: 0,

        lives: 3,

        collected: 0,

        shadowX: 72,

        shadowY: 50
    };


    resetGameObjects();

    updateGameHUD();


    $("gameObjective").textContent =
        "COLLECT 5 AURA ORBS → REACH THE PORTAL";


    $("gameMessage")
        ?.classList.add(
            "hidden"
        );


    gameAnimation =
        requestAnimationFrame(
            gameLoop
        );
}


function stopGame() {

    gameRunning =
        false;


    if (gameAnimation) {

        cancelAnimationFrame(
            gameAnimation
        );

        gameAnimation =
            null;
    }
}


/* =========================================================
   GAME OBJECTS
   ========================================================= */

function resetGameObjects() {

    const positions = [

        [18,25],

        [38,72],

        [57,28],

        [72,68],

        [84,34]
    ];


    $$(".aura-orb")
        .forEach(
            (orb,index) => {

                const position =
                    positions[index];


                orb.classList.remove(
                    "collected"
                );


                orb.style.display =
                    "block";


                orb.style.left =
                    `${position[0]}%`;


                orb.style.top =
                    `${position[1]}%`;
            }
        );


    const player =
        $("player");


    if (player) {

        player.style.left =
            `${auraGame.x}%`;

        player.style.top =
            `${auraGame.y}%`;
    }


    const portal =
        $("portal");


    if (portal) {

        portal.style.opacity =
            "0.35";

        portal.style.borderColor =
            "#475569";

        portal.style.boxShadow =
            "";
    }


    const shadow =
        $("shadow");


    if (shadow) {

        shadow.style.left =
            "72%";

        shadow.style.top =
            "50%";
    }
}


/* =========================================================
   GAME HUD
   ========================================================= */

function updateGameHUD() {

    if ($("auraScore")) {

        $("auraScore").textContent =
            auraGame.score;
    }


    if ($("lives")) {

        $("lives").textContent =
            auraGame.lives;
    }
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

    checkPortal();


    gameAnimation =
        requestAnimationFrame(
            gameLoop
        );
}


/* =========================================================
   MOVE PLAYER
   ========================================================= */

function movePlayer(
    dx,
    dy
) {

    if (!gameRunning)
        return;


    auraGame.x =
        clamp(
            auraGame.x + dx,
            5,
            94
        );


    auraGame.y =
        clamp(
            auraGame.y + dy,
            8,
            90
        );


    const player =
        $("player");


    if (!player)
        return;


    player.style.left =
        `${auraGame.x}%`;


    player.style.top =
        `${auraGame.y}%`;
}


/* =========================================================
   KEYBOARD
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
                event.key
            ) {

                case "ArrowLeft":
                case "a":
                case "A":

                    dx = -2;

                    break;


                case "ArrowRight":
                case "d":
                case "D":

                    dx = 2;

                    break;


                case "ArrowUp":
                case "w":
                case "W":

                    dy = -2;

                    break;


                case "ArrowDown":
                case "s":
                case "S":

                    dy = 2;

                    break;


                default:

                    return;
            }


            event.preventDefault();


            movePlayer(
                dx,
                dy
            );
        }
    );
}


/* =========================================================
   SHADOW AI
   ========================================================= */

function moveShadow() {

    const dx =
        auraGame.x -
        auraGame.shadowX;


    const dy =
        auraGame.y -
        auraGame.shadowY;


    const distance =
        Math.sqrt(
            dx * dx +
            dy * dy
        );


    if (
        distance >
        2
    ) {

        auraGame.shadowX +=
            (dx / distance) *
            0.06;


        auraGame.shadowY +=
            (dy / distance) *
            0.06;
    }


    const shadow =
        $("shadow");


    if (shadow) {

        shadow.style.left =
            `${auraGame.shadowX}%`;


        shadow.style.top =
            `${auraGame.shadowY}%`;
    }
}


/* =========================================================
   ORB COLLISION
   ========================================================= */

function checkOrbCollisions() {

    const player =
        $("player");


    if (!player)
        return;


    const playerRect =
        player.getBoundingClientRect();


    $$(".aura-orb")
        .forEach(
            orb => {

                if (
                    orb.style.display ===
                    "none"
                )
                    return;


                if (
                    rectanglesTouch(
                        playerRect,
                        orb.getBoundingClientRect()
                    )
                ) {

                    collectOrb(
                        orb
                    );
                }
            }
        );
}


function collectOrb(orb) {

    orb.style.display =
        "none";


    auraGame.score +=
        Number(
            orb.dataset.value ||
            10
        );


    auraGame.collected++;


    updateGameHUD();

    playSound(
        "Collect"
    );


    if (
        auraGame.collected >=
        5
    ) {

        unlockPortal();

    } else {

        $("gameObjective").textContent =
            `COLLECT ${5 - auraGame.collected} MORE ORB${5 - auraGame.collected === 1 ? "" : "S"}`;
    }
}


/* =========================================================
   PORTAL
   ========================================================= */

function unlockPortal() {

    const portal =
        $("portal");


    if (!portal)
        return;


    portal.style.opacity =
        "1";


    portal.style.borderColor =
        "#a78bfa";


    portal.style.boxShadow =
        "0 0 35px rgba(167,139,250,.8)";


    $("gameObjective").textContent =
        "PORTAL UNLOCKED → REACH IT!";


    playSound(
        "Magic"
    );
}


function checkPortal() {

    if (
        auraGame.collected <
        5
    )
        return;


    const player =
        $("player");


    const portal =
        $("portal");


    if (
        !player ||
        !portal
    )
        return;


    if (
        rectanglesTouch(
            player.getBoundingClientRect(),
            portal.getBoundingClientRect()
        )
    ) {

        winGame();
    }
}


/* =========================================================
   SHADOW COLLISION
   ========================================================= */

function checkShadowCollision() {

    const player =
        $("player");


    const shadow =
        $("shadow");


    if (
        !player ||
        !shadow
    )
        return;


    if (
        !rectanglesTouch(
            player.getBoundingClientRect(),
            shadow.getBoundingClientRect()
        )
    )
        return;


    const now =
        Date.now();


    if (
        now - lastHit <
        1500
    )
        return;


    lastHit =
        now;


    auraGame.lives--;


    updateGameHUD();

    playSound(
        "Boom"
    );


    auraGame.x =
        12;

    auraGame.y =
        50;


    player.style.left =
        "12%";


    player.style.top =
        "50%";


    if (
        auraGame.lives <=
        0
    ) {

        gameOver();
    }
}


function rectanglesTouch(
    a,
    b
) {

    return !(
        a.right < b.left ||
        a.left > b.right ||
        a.bottom < b.top ||
        a.top > b.bottom
    );
}


/* =========================================================
   WIN
   ========================================================= */

function winGame() {

    if (!gameRunning)
        return;


    gameRunning =
        false;


    if (gameAnimation) {

        cancelAnimationFrame(
            gameAnimation
        );

        gameAnimation =
            null;
    }


    playSound(
        "Win"
    );


    const message =
        $("gameMessage");


    if (!message)
        return;


    message.innerHTML = `
        <div>

            <div
                style="
                    font-size:14px;
                    color:#a78bfa;
                    letter-spacing:3px;
                "
            >
                AURA PLUS
            </div>

            <div
                style="
                    font-size:42px;
                    margin:10px 0;
                "
            >
                🏆 YOU WIN!
            </div>

            <div
                style="
                    font-size:15px;
                    color:#cbd5e1;
                "
            >
                50 AURA collected • Portal reached
            </div>

            <button
                onclick="finishGame()"
                style="
                    margin-top:22px;
                    padding:12px 22px;
                    border:0;
                    border-radius:8px;
                    background:#7c3aed;
                    color:white;
                    font-weight:900;
                    cursor:pointer;
                "
            >
                CONTINUE →
            </button>

        </div>
    `;


    message.classList.remove(
        "hidden"
    );
}


function gameOver() {

    gameRunning =
        false;


    const message =
        $("gameMessage");


    if (!message)
        return;


    message.innerHTML = `
        <div>

            <div
                style="
                    font-size:42px;
                "
            >
                💥 GAME OVER
            </div>

            <div
                style="
                    font-size:15px;
                    color:#cbd5e1;
                    margin-top:10px;
                "
            >
                Don't worry — every game can be improved.
            </div>

            <button
                onclick="startGame()"
                style="
                    margin-top:22px;
                    padding:12px 22px;
                    border:0;
                    border-radius:8px;
                    background:#4c97ff;
                    color:white;
                    font-weight:900;
                    cursor:pointer;
                "
            >
                TRY AGAIN
            </button>

        </div>
    `;


    message.classList.remove(
        "hidden"
    );
}


/* =========================================================
   LESSON → ACTUAL GAME
   ========================================================= */

function launchAuraPlusFromLesson() {

    stopLessonPreview();

    startGame();

    showScreen(
        "gameScreen"
    );


    $("gameObjective").textContent =
        "COLLECT 5 AURA ORBS → REACH THE PORTAL";
}


/* =========================================================
   FINISH GAME
   ========================================================= */

window.finishGame =
    function () {

        stopGame();


        if (
            !completedMissions.includes(
                7
            )
        ) {

            completedMissions.push(
                7
            );
        }


        localStorage.setItem(
            "auraPlusMissions",
            JSON.stringify(
                completedMissions
            )
        );


        updateMissionProgress();


        showScreen(
            "finalScreen"
        );
    };


/* =========================================================
   NAVIGATION
   ========================================================= */

function setupNavigation() {

    $("playGameButton")
        ?.addEventListener(
            "click",
            () => {

                startGame();

                showScreen(
                    "gameScreen"
                );
            }
        );


    $("tutorialButton")
        ?.addEventListener(
            "click",
            () => {

                showScreen(
                    "tutorialScreen"
                );

                updateMissionProgress();
            }
        );


    $("exitGame")
        ?.addEventListener(
            "click",
            () => {

                stopGame();

                showScreen(
                    "introScreen"
                );
            }
        );


    $("revealButton")
        ?.addEventListener(
            "click",
            () => {

                showScreen(
                    "tutorialScreen"
                );

                updateMissionProgress();
            }
        );


    $("secretContinue")
        ?.addEventListener(
            "click",
            () => {

                showScreen(
                    "tutorialScreen"
                );
            }
        );


    $("backToMissions")
        ?.addEventListener(
            "click",
            () => {

                stopLessonPreview();

                showScreen(
                    "tutorialScreen"
                );
            }
        );


    $("replayButton")
        ?.addEventListener(
            "click",
            () => {

                showScreen(
                    "introScreen"
                );
            }
        );


    $$(".mission-card")
        .forEach(
            card => {

                card.addEventListener(
                    "click",
                    () => {

                        openMission(
                            Number(
                                card.dataset.mission
                            )
                        );
                    }
                );
            }
        );
}


/* =========================================================
   INITIALIZATION
   ========================================================= */

function initialize() {

    setupNavigation();

    setupCategories();

    setupEditorTabs();

    setupSprites();

    setupAssets();

    setupBackdrops();

    setupRunButtons();

    setupLessonButton();

    setupUndoRedo();

    setupGameControls();


    /*
       Initial UI only.
       NO lesson action is performed.
    */

    selectedSprite =
        null;


    selectedCategory =
        "motion";


    selectedAssetType =
        "costumes";


    selectedBackdrop =
        "space";


    currentEditorTab =
        "code";


    renderPalette();

    renderAssets();

    renderBackdrops();

    renderWorkspace();

    updateSpriteSelection();

    updateMissionProgress();


    showScreen(
        "introScreen"
    );
}


/* =========================================================
   START
   ========================================================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initialize
    );

} else {

    initialize();
}


/* =========================================================
   END
   ========================================================= */
