/* =========================================================
   AURA PLUS — FINAL SCRIPT
   Works with the supplied index.html + style.css
   ========================================================= */

"use strict";

/* =========================================================
   HELPERS
   ========================================================= */

const $ = id => document.getElementById(id);
const $$ = selector => [...document.querySelectorAll(selector)];

function showScreen(id) {
    $$(".screen").forEach(s => {
        s.classList.add("hidden");
        s.classList.remove("active");
    });

    const screen = $(id);

    if (screen) {
        screen.classList.remove("hidden");
        screen.classList.add("active");
    }
}

function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
}


/* =========================================================
   GLOBAL STATE
   ========================================================= */

let currentMission = 1;
let currentStep = 0;

let selectedSprite = "aura";
let selectedCategory = "motion";
let selectedAsset = "costumes";

let completedMissions =
    JSON.parse(localStorage.getItem("auraPlusMissions") || "[]");

let workspaceBlocks = [];

let undoStack = [];
let redoStack = [];

let gameRunning = false;
let gameAnimation = null;

let auraGame = {
    x: 10,
    y: 50,
    score: 0,
    lives: 3,
    collected: 0,
    running: false,
    shadowX: 72,
    shadowY: 50
};


/* =========================================================
   BLOCK DEFINITIONS
   ========================================================= */

const blocks = {

    motion: [
        {
            text: "move 10 steps",
            className: "block-motion",
            id: "move",
            inputs: [
                { type: "number", value: "10" }
            ]
        },
        {
            text: "turn 15 degrees",
            className: "block-motion",
            id: "turn",
            inputs: [
                { type: "number", value: "15" }
            ]
        },
        {
            text: "go to random position",
            className: "block-motion",
            id: "random"
        },
        {
            text: "change x by 10",
            className: "block-motion",
            id: "changex",
            inputs: [
                { type: "number", value: "10" }
            ]
        },
        {
            text: "change y by 10",
            className: "block-motion",
            id: "changey",
            inputs: [
                { type: "number", value: "10" }
            ]
        },
        {
            text: "set x to 0",
            className: "block-motion",
            id: "setx",
            inputs: [
                { type: "number", value: "0" }
            ]
        },
        {
            text: "set y to 0",
            className: "block-motion",
            id: "sety",
            inputs: [
                { type: "number", value: "0" }
            ]
        },
        {
            text: "if on edge, bounce",
            className: "block-motion",
            id: "bounce"
        },
        {
            text: "point in direction 90",
            className: "block-motion",
            id: "direction",
            inputs: [
                { type: "number", value: "90" }
            ]
        }
    ],

    looks: [
        {
            text: "say Hello! for 2 seconds",
            className: "block-looks",
            id: "say",
            inputs: [
                { type: "text", value: "Hello!" },
                { type: "number", value: "2" }
            ]
        },
        {
            text: "say Hello!",
            className: "block-looks",
            id: "sayforever",
            inputs: [
                { type: "text", value: "Hello!" }
            ]
        },
        {
            text: "switch costume to costume1",
            className: "block-looks",
            id: "costume"
        },
        {
            text: "next costume",
            className: "block-looks",
            id: "nextcostume"
        },
        {
            text: "change size by 10",
            className: "block-looks",
            id: "size",
            inputs: [
                { type: "number", value: "10" }
            ]
        }
    ],

    sound: [
        {
            text: "start sound Meow",
            className: "block-sound",
            id: "soundstart"
        },
        {
            text: "play sound Meow until done",
            className: "block-sound",
            id: "soundwait"
        },
        {
            text: "change volume by -10",
            className: "block-sound",
            id: "volume",
            inputs: [
                { type: "number", value: "-10" }
            ]
        }
    ],

    events: [
        {
            text: "when green flag clicked",
            className: "block-events",
            id: "flag"
        },
        {
            text: "when this sprite clicked",
            className: "block-events",
            id: "spriteclick"
        },
        {
            text: "when space key pressed",
            className: "block-events",
            id: "space"
        },
        {
            text: "when I receive message1",
            className: "block-events",
            id: "receive"
        },
        {
            text: "broadcast message1",
            className: "block-events",
            id: "broadcast"
        },
        {
            text: "broadcast message1 and wait",
            className: "block-events",
            id: "broadcastwait"
        }
    ],

    control: [
        {
            text: "wait 1 seconds",
            className: "block-control",
            id: "wait",
            inputs: [
                { type: "number", value: "1" }
            ]
        },
        {
            text: "repeat 10",
            className: "block-control",
            id: "repeat",
            inputs: [
                { type: "number", value: "10" }
            ]
        },
        {
            text: "forever",
            className: "block-control",
            id: "forever"
        },
        {
            text: "if then",
            className: "block-control",
            id: "if"
        },
        {
            text: "if then else",
            className: "block-control",
            id: "ifelse"
        },
        {
            text: "stop all",
            className: "block-control",
            id: "stop"
        }
    ],

    sensing: [
        {
            text: "touching mouse-pointer?",
            className: "block-sensing",
            id: "touching"
        },
        {
            text: "ask What's your name? and wait",
            className: "block-sensing",
            id: "ask"
        },
        {
            text: "key space pressed?",
            className: "block-sensing",
            id: "key"
        },
        {
            text: "mouse down?",
            className: "block-sensing",
            id: "mouse"
        },
        {
            text: "timer",
            className: "block-sensing",
            id: "timer"
        }
    ],

    operators: [
        {
            text: "1 + 1",
            className: "block-operators",
            id: "add"
        },
        {
            text: "1 > 1",
            className: "block-operators",
            id: "greater"
        },
        {
            text: "1 = 1",
            className: "block-operators",
            id: "equals"
        },
        {
            text: "pick random 1 to 10",
            className: "block-operators",
            id: "randomnumber"
        },
        {
            text: "join hello world",
            className: "block-operators",
            id: "join"
        }
    ],

    variables: [
        {
            text: "set my variable to 0",
            className: "block-variables",
            id: "setvar",
            inputs: [
                { type: "number", value: "0" }
            ]
        },
        {
            text: "change my variable by 1",
            className: "block-variables",
            id: "changevar",
            inputs: [
                { type: "number", value: "1" }
            ]
        },
        {
            text: "show variable my variable",
            className: "block-variables",
            id: "showvar"
        },
        {
            text: "hide variable my variable",
            className: "block-variables",
            id: "hidevar"
        }
    ],

    myblocks: [
        {
            text: "define my block",
            className: "block-myblocks",
            id: "define"
        },
        {
            text: "my block",
            className: "block-myblocks",
            id: "custom"
        }
    ]
};


/* =========================================================
   LESSON DATA
   ========================================================= */

const lessons = {

    1: {
        title: "Working with Sprites",
        description:
            "Sprites are the characters and objects in Scratch.",
        why:
            "Selecting a sprite tells Scratch which object you are programming.",
        tip:
            "A project can contain many sprites.",
        steps: [

            {
                title: "Select AURA",
                action:
                    "Click the AURA sprite in the Sprite List.",
                why:
                    "You must select a sprite before writing its script.",
                tip:
                    "Each sprite can have its own code.",
                target: "sprite-aura"
            },

            {
                title: "Add another sprite",
                action:
                    "Click the + button beside SPRITE LIST.",
                why:
                    "The + button lets you add another character or object.",
                tip:
                    "Games often use many sprites.",
                target: "choose-sprite"
            },

            {
                title: "Select SHADOW",
                action:
                    "Click the SHADOW sprite.",
                why:
                    "Different sprites can have completely different scripts.",
                tip:
                    "AURA and SHADOW can behave differently.",
                target: "sprite-shadow"
            },

            {
                title: "Return to AURA",
                action:
                    "Click AURA again.",
                why:
                    "Now we are ready to program the player.",
                tip:
                    "Always check which sprite is selected.",
                target: "sprite-aura"
            }
        ]
    },


    2: {
        title: "Make AURA Move",
        description:
            "Use Motion blocks to control position and movement.",
        why:
            "Motion blocks tell a sprite where and how to move.",
        tip:
            "X controls left/right. Y controls up/down.",
        steps: [

            {
                title: "Start the script",
                action:
                    "Open Events and click 'when green flag clicked'.",
                why:
                    "The green flag starts the game.",
                tip:
                    "Event blocks tell Scratch when a script starts.",
                category: "events",
                block: "flag"
            },

            {
                title: "Move AURA",
                action:
                    "Open Motion and click 'move 10 steps'.",
                why:
                    "This makes AURA move forward.",
                tip:
                    "You can change 10 to another number.",
                category: "motion",
                block: "move"
            },

            {
                title: "Change X",
                action:
                    "Click 'change x by 10'.",
                why:
                    "Changing X moves the sprite left or right.",
                tip:
                    "Try changing 10 to 50.",
                category: "motion",
                block: "changex"
            },

            {
                title: "Test it",
                action:
                    "Click the green RUN button.",
                why:
                    "Running the script lets you see your code in action.",
                tip:
                    "Build → run → observe → modify.",
                run: true
            }
        ]
    },


    3: {
        title: "Change Costumes",
        description:
            "Costumes change how a sprite looks.",
        why:
            "Changing costumes can create animation.",
        tip:
            "One sprite can have many costumes.",
        steps: [

            {
                title: "Open Costumes",
                action:
                    "Click the Costumes tab at the top.",
                why:
                    "The Costumes tab lets you manage how the sprite looks.",
                tip:
                    "Costumes belong to the selected sprite.",
                tab: "costumes"
            },

            {
                title: "Choose a costume",
                action:
                    "Click a costume in the costume library.",
                why:
                    "Selecting a costume changes the sprite's appearance.",
                tip:
                    "Try different costumes.",
                asset: "costume"
            },

            {
                title: "Add a costume block",
                action:
                    "Return to Code → Looks and click 'next costume'.",
                why:
                    "The next costume block can create animation.",
                tip:
                    "Put it inside a repeat or forever loop for animation.",
                category: "looks",
                block: "nextcostume"
            },

            {
                title: "Run the costume change",
                action:
                    "Click 🟢 RUN.",
                why:
                    "You can now test the costume change.",
                tip:
                    "Animation is just a sequence of costume changes.",
                run: true
            }
        ]
    },


    4: {
        title: "Program Two Sprites",
        description:
            "Different sprites can have different scripts.",
        why:
            "This lets a game give each character its own behaviour.",
        tip:
            "Select the sprite before adding its blocks.",
        steps: [

            {
                title: "Select AURA",
                action:
                    "Click AURA in the Sprite List.",
                why:
                    "We will create AURA's movement script.",
                tip:
                    "The blue outline shows the selected sprite.",
                target: "sprite-aura"
            },

            {
                title: "Add AURA's event",
                action:
                    "Open Events → click 'when green flag clicked'.",
                why:
                    "AURA's script starts when the game starts.",
                tip:
                    "Event blocks are usually at the top of a script.",
                category: "events",
                block: "flag"
            },

            {
                title: "Select SHADOW",
                action:
                    "Click SHADOW in the Sprite List.",
                why:
                    "Now we can give SHADOW different code.",
                tip:
                    "The selected sprite owns the script.",
                target: "sprite-shadow"
            },

            {
                title: "Give SHADOW behaviour",
                action:
                    "Open Motion → click 'move 10 steps'.",
                why:
                    "SHADOW now has its own movement behaviour.",
                tip:
                    "Two sprites can use different blocks.",
                category: "motion",
                block: "move"
            }
        ]
    },


    5: {
        title: "Change the Backdrop",
        description:
            "Backdrops create the world where your game happens.",
        why:
            "A good backdrop makes the game easier to understand.",
        tip:
            "The Stage has backdrops instead of costumes.",
        steps: [

            {
                title: "Choose a backdrop",
                action:
                    "Click the Neon backdrop.",
                why:
                    "The Stage background can be changed.",
                tip:
                    "Try different backgrounds for different game levels.",
                backdrop: "neon"
            },

            {
                title: "Try the City backdrop",
                action:
                    "Click the City backdrop.",
                why:
                    "You can switch between different game worlds.",
                tip:
                    "Backdrops belong to the Stage.",
                backdrop: "city"
            },

            {
                title: "Return to Space",
                action:
                    "Click the Space backdrop.",
                why:
                    "Space will be our AURA PLUS game world.",
                tip:
                    "A consistent backdrop helps your game look polished.",
                backdrop: "space"
            },

            {
                title: "Test the Stage",
                action:
                    "Click 🟢 RUN.",
                why:
                    "The Stage is where players see the final project.",
                tip:
                    "Always test your project before showing it.",
                run: true
            }
        ]
    },


    6: {
        title: "Add Sound",
        description:
            "Sounds make a Scratch project feel alive.",
        why:
            "Games use sounds to give feedback to players.",
        tip:
            "Scratch has Sound blocks and a Sounds tab.",
        steps: [

            {
                title: "Open Sounds",
                action:
                    "Click the Sounds tab.",
                why:
                    "The Sounds tab is where sprite sounds are managed.",
                tip:
                    "Different sprites can have different sounds.",
                tab: "sounds"
            },

            {
                title: "Choose a sound",
                action:
                    "Click the Meow sound.",
                why:
                    "Selecting a sound prepares it for the project.",
                tip:
                    "You can add and manage sounds here.",
                asset: "sound"
            },

            {
                title: "Add the sound block",
                action:
                    "Return to Code → Sound and click 'start sound Meow'.",
                why:
                    "This block starts a sound.",
                tip:
                    "Sound can be used when collecting an orb or winning.",
                category: "sound",
                block: "soundstart"
            },

            {
                title: "Test the sound",
                action:
                    "Click 🟢 RUN.",
                why:
                    "Testing helps you check whether your project behaves correctly.",
                tip:
                    "Small sound effects make games much more exciting.",
                run: true
            }
        ]
    },


    7: {
        title: "Build AURA PLUS",
        description:
            "Now combine sprites, movement, variables, sensing and events into the actual game.",
        why:
            "Real Scratch games are made by combining many simple ideas.",
        tip:
            "Build one idea at a time, then test the complete game.",
        steps: [

            {
                title: "Start AURA PLUS",
                action:
                    "Open Events and click 'when green flag clicked'.",
                why:
                    "The green flag starts the complete game.",
                tip:
                    "This is the beginning of the actual AURA PLUS script.",
                category: "events",
                block: "flag"
            },

            {
                title: "Move the player",
                action:
                    "Open Motion and click 'change x by 10'.",
                why:
                    "Movement lets the player explore the game world.",
                tip:
                    "Change the value to control movement distance.",
                category: "motion",
                block: "changex"
            },

            {
                title: "Create the score",
                action:
                    "Open Variables and click 'set my variable to 0'.",
                why:
                    "A variable can store a game's score.",
                tip:
                    "In a real Scratch project, name this variable Score.",
                category: "variables",
                block: "setvar"
            },

            {
                title: "Increase the score",
                action:
                    "Click 'change my variable by 1'.",
                why:
                    "The score changes when the player collects something.",
                tip:
                    "For AURA PLUS, each orb is worth 10 points.",
                category: "variables",
                block: "changevar"
            },

            {
                title: "Detect an object",
                action:
                    "Open Sensing and click 'touching mouse-pointer?'.",
                why:
                    "Sensing blocks let Scratch detect what is happening.",
                tip:
                    "A real game can use touching [Orb]? instead.",
                category: "sensing",
                block: "touching"
            },

            {
                title: "Make a decision",
                action:
                    "Open Control and click 'if then'.",
                why:
                    "An if block lets the game react to a condition.",
                tip:
                    "Example: IF touching Orb → change Score by 10.",
                category: "control",
                block: "if"
            },

            {
                title: "Use a comparison",
                action:
                    "Open Operators and click '1 > 1'.",
                why:
                    "Operators compare values and help games make decisions.",
                tip:
                    "Example: IF Score > 40 → unlock the portal.",
                category: "operators",
                block: "greater"
            },

            {
                title: "Add the portal idea",
                action:
                    "Select the PORTAL sprite in the Sprite List.",
                why:
                    "The portal can become the final destination.",
                tip:
                    "Different sprites make the game world feel real.",
                target: "sprite-portal"
            },

            {
                title: "Run the real game",
                action:
                    "Click 🟢 RUN to launch AURA PLUS.",
                why:
                    "Now you get to experience the game you just learned to build.",
                tip:
                    "Collect all 5 orbs, avoid SHADOW and reach the portal.",
                runGame: true
            }
        ]
    }
};


/* =========================================================
   INITIALIZE
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    setupNavigation();
    setupCategories();
    setupEditorTabs();
    setupSprites();
    setupAssets();
    setupBackdrops();
    setupRunButtons();
    setupLessonButton();
    setupUndoRedo();

    renderPalette();
    renderAssets();
    updateMissionProgress();

    showScreen("introScreen");
});


/* =========================================================
   NAVIGATION
   ========================================================= */

function setupNavigation() {

    $("playGameButton")?.addEventListener("click", () => {
        startGame();
        showScreen("gameScreen");
    });

    $("tutorialButton")?.addEventListener("click", () => {
        showScreen("tutorialScreen");
    });

    $("exitGame")?.addEventListener("click", () => {
        stopGame();
        showScreen("introScreen");
    });

    $("secretContinue")?.addEventListener("click", () => {
        showScreen("tutorialScreen");
    });

    $("backToMissions")?.addEventListener("click", () => {
        stopLessonPreview();
        showScreen("tutorialScreen");
    });

    $("replayButton")?.addEventListener("click", () => {
        showScreen("introScreen");
    });

    $$(".mission-card").forEach(card => {

        card.addEventListener("click", () => {

            const mission =
                Number(card.dataset.mission);

            openMission(mission);
        });

    });
}


/* =========================================================
   MISSION
   ========================================================= */

function openMission(mission) {

    currentMission = mission;
    currentStep = 0;

    workspaceBlocks = [];
    undoStack = [];
    redoStack = [];

    selectedSprite = "aura";
    selectedCategory = "motion";

    clearWorkspace();

    showScreen("lessonScreen");

    updateSpriteSelection();
    renderPalette();
    renderAssets();

    renderLessonStep();
}


function renderLessonStep() {

    const lesson = lessons[currentMission];

    if (!lesson) return;

    const step =
        lesson.steps[currentStep];

    if (!step) return;

    const total = lesson.steps.length;

    $("lessonNumber").textContent =
        currentMission;

    $("lessonStep").textContent =
        `${currentStep + 1}/${total}`;

    $("lessonTitle").textContent =
        step.title || lesson.title;

    $("lessonDescription").textContent =
        lesson.description;

    $("actionText").textContent =
        step.action;

    $("lessonWhy").textContent =
        step.why || lesson.why;

    $("teacherTip").textContent =
        step.tip || lesson.tip;

    $("workspaceInstruction").textContent =
        "Follow the highlighted action, then press NEXT.";

    $("bottomHint").textContent =
        step.action;

    $("stepProgressBar").style.width =
        `${((currentStep + 1) / total) * 100}%`;

    $("nextLessonStep").innerHTML =
        currentStep === total - 1
            ? `FINISH <span>✓</span>`
            : `NEXT <span>→</span>`;

    clearHighlights();

    /* Choose the correct category automatically */

    if (step.category) {
        selectedCategory = step.category;
        renderPalette();
    }

    if (step.tab) {
        switchEditorTab(step.tab);
    }

    if (step.asset) {
        renderAssets(step.asset);
    }

    if (step.backdrop) {
        selectBackdrop(step.backdrop);
    }

    if (step.target) {
        highlightTarget(step.target);
    }

    if (step.block) {
        highlightBlock(step.category, step.block);
    }

    if (step.run) {
        highlightTarget("run-button");
    }

    if (step.runGame) {
        highlightTarget("run-button");
    }

    updateStatus();
}


/* =========================================================
   NEXT BUTTON
   ========================================================= */

function setupLessonButton() {

    $("nextLessonStep")?.addEventListener("click", () => {

        const lesson = lessons[currentMission];

        if (!lesson) return;

        const step =
            lesson.steps[currentStep];

        /* If this step launches the real game */

        if (step?.runGame) {

            launchAuraPlusFromLesson();

            return;
        }

        /* If this is a normal run step */

        if (step?.run) {
            runWorkspace();
        }

        if (currentStep < lesson.steps.length - 1) {

            currentStep++;

            renderLessonStep();

        } else {

            completeMission();

        }

    });
}


/* =========================================================
   PALETTE
   ========================================================= */

function setupCategories() {

    $$(".block-category").forEach(button => {

        button.addEventListener("click", () => {

            selectedCategory =
                button.dataset.category;

            $$(".block-category").forEach(b =>
                b.classList.remove("active")
            );

            button.classList.add("active");

            renderPalette();

        });

    });
}


function renderPalette() {

    const palette = $("blockPalette");

    if (!palette) return;

    const categoryBlocks =
        blocks[selectedCategory] || [];

    const categoryNames = {
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
        categoryNames[selectedCategory] ||
        selectedCategory;

    palette.innerHTML = "";

    categoryBlocks.forEach(block => {

        const element =
            document.createElement("button");

        element.className =
            `scratch-block ${block.className}`;

        element.dataset.block =
            block.id;

        element.dataset.category =
            selectedCategory;

        element.textContent =
            block.text;

        element.addEventListener("click", () => {

            addBlockToWorkspace(
                selectedCategory,
                block
            );

        });

        palette.appendChild(element);
    });

    /* Reapply current lesson highlight */

    const lesson = lessons[currentMission];

    const step =
        lesson?.steps[currentStep];

    if (
        step?.category === selectedCategory &&
        step?.block
    ) {
        highlightBlock(
            step.category,
            step.block
        );
    }
}


/* =========================================================
   ADD BLOCK
   ========================================================= */

function addBlockToWorkspace(category, definition) {

    saveUndo();

    const block = {
        category,
        id: definition.id,
        text: definition.text,
        className: definition.className,
        inputs: definition.inputs
            ? definition.inputs.map(x => ({
                type: x.type,
                value: x.value
            }))
            : []
    };

    workspaceBlocks.push(block);

    renderWorkspace();

    $("stepStatus").textContent =
        "✓ Block added! Press NEXT to continue.";

    $("bottomHint").textContent =
        "Block added to your script.";

    clearHighlights();

    /* Auto-focus first input */

    setTimeout(() => {

        const last =
            $("lessonBlocks")
                ?.lastElementChild;

        const input =
            last?.querySelector("input");

        input?.focus();

    }, 50);
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

    if (workspaceBlocks.length === 0) {

        workspace.innerHTML = `
            <div class="empty-workspace" id="emptyWorkspace">
                <div class="empty-icon">🧩</div>
                <strong>Your Scratch script starts here</strong>
                <p>Click the highlighted Scratch block.</p>
            </div>
        `;

    } else {

        workspaceBlocks.forEach((block, index) => {

            const el =
                document.createElement("div");

            el.className =
                `workspace-block ${block.className}`;

            el.dataset.index =
                index;

            buildWorkspaceBlock(el, block);

            workspace.appendChild(el);

        });

    }

    const count =
        workspaceBlocks.length;

    $("blockCount").textContent =
        `${count} block${count === 1 ? "" : "s"}`;

    $("bottomBlockCount").textContent =
        count;

    updateRunHint();
}


function buildWorkspaceBlock(el, block) {

    /*
       Build a visual Scratch-style block.
       Inputs are REAL editable HTML inputs.
    */

    const textParts =
        block.text.split(/(\d+|Hello!|my variable)/g);

    let inputIndex = 0;

    textParts.forEach(part => {

        if (
            /^\d+$/.test(part) &&
            block.inputs?.[inputIndex]?.type === "number"
        ) {

            const input =
                document.createElement("input");

            input.type = "number";

            input.className =
                "block-input number-input";

            input.value =
                block.inputs[inputIndex].value;

            const index =
                inputIndex;

            input.addEventListener("input", () => {

                block.inputs[index].value =
                    input.value;

            });

            el.appendChild(input);

            inputIndex++;

        } else if (
            part === "Hello!" &&
            block.inputs?.[inputIndex]?.type === "text"
        ) {

            const input =
                document.createElement("input");

            input.type = "text";

            input.className =
                "block-input text-input";

            input.value =
                block.inputs[inputIndex].value;

            const index =
                inputIndex;

            input.addEventListener("input", () => {

                block.inputs[index].value =
                    input.value;

            });

            el.appendChild(input);

            inputIndex++;

        } else if (
            part.trim() !== ""
        ) {

            const span =
                document.createElement("span");

            span.textContent =
                part;

            el.appendChild(span);

        }

    });

    const deleteButton =
        document.createElement("button");

    deleteButton.className =
        "workspace-delete";

    deleteButton.innerHTML =
        "×";

    deleteButton.title =
        "Remove block";

    deleteButton.addEventListener("click", event => {

        event.stopPropagation();

        saveUndo();

        const index =
            Number(el.dataset.index);

        workspaceBlocks.splice(index, 1);

        renderWorkspace();

    });

    el.appendChild(deleteButton);
}


/* =========================================================
   UNDO / REDO
   ========================================================= */

function saveUndo() {

    undoStack.push(
        JSON.parse(
            JSON.stringify(workspaceBlocks)
        )
    );

    if (undoStack.length > 30)
        undoStack.shift();

    redoStack = [];
}


function setupUndoRedo() {

    $("undoButton")?.addEventListener(
        "click",
        () => {

            if (!undoStack.length)
                return;

            redoStack.push(
                JSON.parse(
                    JSON.stringify(workspaceBlocks)
                )
            );

            workspaceBlocks =
                undoStack.pop();

            renderWorkspace();
        }
    );

    $("redoButton")?.addEventListener(
        "click",
        () => {

            if (!redoStack.length)
                return;

            undoStack.push(
                JSON.parse(
                    JSON.stringify(workspaceBlocks)
                )
            );

            workspaceBlocks =
                redoStack.pop();

            renderWorkspace();
        }
    );
}


/* =========================================================
   HIGHLIGHTING
   ========================================================= */

function clearHighlights() {

    $$(".lesson-target").forEach(el => {
        el.classList.remove("lesson-target");
    });
}


function highlightTarget(target) {

    clearHighlights();

    let element = null;

    switch (target) {

        case "sprite-aura":
            element =
                qs('.sprite-card[data-sprite="aura"]');
            break;

        case "sprite-shadow":
            element =
                qs('.sprite-card[data-sprite="shadow"]');
            break;

        case "sprite-portal":
            element =
                qs('.sprite-card[data-sprite="portal"]');
            break;

        case "sprite-orb":
            element =
                qs('.sprite-card[data-sprite="orb"]');
            break;

        case "choose-sprite":
            element =
                $("chooseSpriteButton");
            break;

        case "run-button":
            element =
                $("runLessonButton");
            break;

        default:
            break;
    }

    if (element) {

        element.classList.add("lesson-target");

        element.scrollIntoView({
            behavior: "smooth",
            block: "nearest"
        });

    }
}


function highlightBlock(category, blockId) {

    clearHighlights();

    if (selectedCategory !== category) {
        selectedCategory = category;
        renderPalette();
    }

    const element =
        qs(
            `.scratch-block[data-block="${blockId}"]`
        );

    if (element) {

        element.classList.add("lesson-target");

        element.scrollIntoView({
            behavior: "smooth",
            block: "nearest"
        });

    }
}


function updateStatus() {

    const lesson =
        lessons[currentMission];

    const step =
        lesson?.steps[currentStep];

    if (!step) return;

    $("stepStatus").textContent =
        "Follow the highlighted action.";

}


/* =========================================================
   SPRITES
   ========================================================= */

function setupSprites() {

    $$(".sprite-card").forEach(card => {

        card.addEventListener("click", () => {

            selectedSprite =
                card.dataset.sprite;

            updateSpriteSelection();

            renderAssets();

            $("stepStatus").textContent =
                `✓ ${capitalize(selectedSprite)} selected.`;

            clearHighlights();

        });

    });

    $("chooseSpriteButton")?.addEventListener(
        "click",
        () => {

            /*
               Simulated Scratch sprite picker.
               Adds a new sprite visually.
            */

            if (
                qs(
                    '.sprite-card[data-sprite="star"]'
                )
            ) return;

            const list =
                $("spriteList");

            const card =
                document.createElement("button");

            card.className =
                "sprite-card";

            card.dataset.sprite =
                "star";

            card.innerHTML = `
                <div class="sprite-thumb portal-thumb">
                    ★
                </div>
                <div class="sprite-meta">
                    <strong>Star</strong>
                    <small>Sprite</small>
                </div>
            `;

            card.addEventListener("click", () => {

                selectedSprite = "star";

                updateSpriteSelection();
                renderAssets();

            });

            list.appendChild(card);

            $("stepStatus").textContent =
                "✓ New sprite added!";

            clearHighlights();
        }
    );
}


function updateSpriteSelection() {

    $$(".sprite-card").forEach(card => {

        card.classList.toggle(
            "selected",
            card.dataset.sprite === selectedSprite
        );

    });

    updateStageSprite();
}


/* =========================================================
   EDITOR TABS
   ========================================================= */

function setupEditorTabs() {

    $$(".editor-tab").forEach(tab => {

        tab.addEventListener("click", () => {

            switchEditorTab(
                tab.dataset.tab
            );

        });

    });

    $$(".asset-tab").forEach(tab => {

        tab.addEventListener("click", () => {

            selectedAsset =
                tab.dataset.asset;

            $$(".asset-tab").forEach(t =>
                t.classList.remove("active")
            );

            tab.classList.add("active");

            renderAssets();

        });

    });
}


function switchEditorTab(tabName) {

    // Update top tabs
    $$(".editor-tab").forEach(tab => {
        tab.classList.toggle(
            "active",
            tab.dataset.tab === tabName
        );
    });

    const editorBody = document.querySelector(".scratch-editor-body");
    if (!editorBody) return;

    const categories = editorBody.querySelector(".block-categories");
    const palette = editorBody.querySelector(".block-palette");
    const workspace = editorBody.querySelector(".script-workspace");
    const rightPanel = editorBody.querySelector(".scratch-right-panel");

    // CODE MODE
    if (tabName === "code") {

        editorBody.classList.remove(
            "costume-mode",
            "sound-mode"
        );

        categories?.classList.remove("editor-hidden");
        palette?.classList.remove("editor-hidden");
        workspace?.classList.remove("editor-hidden");

        renderAssetEditor(null);

        clearHighlights();
        return;
    }

    // COSTUME MODE
    if (tabName === "costumes") {

        editorBody.classList.remove("sound-mode");
        editorBody.classList.add("costume-mode");

        categories?.classList.add("editor-hidden");
        palette?.classList.add("editor-hidden");
        workspace?.classList.add("editor-hidden");

        renderAssetEditor("costumes");

        selectedAsset = "costumes";
        renderAssets("costumes");

        clearHighlights();
        return;
    }

   function renderAssetEditor(type) {

    const editorBody =
        document.querySelector(".scratch-editor-body");

    if (!editorBody) return;

    let panel =
        document.getElementById("assetEditorWorkspace");

    if (!type) {
        panel?.remove();
        return;
    }

    if (!panel) {

        panel = document.createElement("section");

        panel.id = "assetEditorWorkspace";
        panel.className = "asset-editor-workspace";

        const rightPanel =
            editorBody.querySelector(".scratch-right-panel");

        editorBody.insertBefore(panel, rightPanel);
    }

    const data =
        spriteAssets[selectedSprite] ||
        spriteAssets.aura;

    const assets =
        data[type] || [];

    const title =
        type === "costumes"
            ? "Costumes"
            : "Sounds";

    const icon =
        type === "costumes"
            ? "🎭"
            : "🔊";

    panel.innerHTML = `
        <div class="asset-editor-top">

            <div>
                <div class="asset-editor-eyebrow">
                    SCRATCH 3 • ${title.toUpperCase()}
                </div>

                <h2>
                    ${icon} ${title}
                </h2>

                <p>
                    ${type === "costumes"
                        ? "Choose a costume for the selected sprite."
                        : "Choose a sound for the selected sprite."}
                </p>
            </div>

            <div class="asset-editor-sprite">
                <span class="asset-editor-sprite-icon">
                    ${getSpriteIcon(selectedSprite)}
                </span>

                <strong>
                    ${capitalize(selectedSprite)}
                </strong>

                <small>
                    Selected Sprite
                </small>
            </div>

        </div>

        <div class="asset-editor-canvas">

            ${
                type === "costumes"
                    ? `
                        <div class="costume-canvas">
                            <div class="costume-grid"></div>

                            <div
                                id="costumePreview"
                                class="big-costume-preview"
                            >
                                ${getSpriteIcon(selectedSprite)}
                            </div>

                            <div class="canvas-label">
                                COSTUME EDITOR
                            </div>
                        </div>
                    `
                    : `
                        <div class="sound-editor">

                            <div class="sound-icon">
                                🔊
                            </div>

                            <div class="sound-wave">
                                ${Array.from(
                                    {length: 42},
                                    (_, i) =>
                                        `<i style="height:${12 + ((i * 17) % 38)}px"></i>`
                                ).join("")}
                            </div>

                            <div class="canvas-label">
                                SOUND EDITOR
                            </div>

                        </div>
                    `
            }

        </div>

        <div class="asset-editor-library">

            <div class="asset-library-heading">
                <strong>
                    ${title.toUpperCase()}
                </strong>

                <span>
                    ${assets.length} ${type === "costumes"
                        ? "costumes"
                        : "sounds"}
                </span>
            </div>

            <div
                id="centralAssetLibrary"
                class="central-asset-library"
            >
                ${assets.map((asset, index) => `
                    <button
                        class="central-asset-card ${index === 0 ? "selected" : ""}"
                        data-central-asset="${asset}"
                    >

                        <div class="central-asset-thumb">
                            ${
                                type === "sounds"
                                    ? "🔊"
                                    : getCostumeIcon(
                                        selectedSprite,
                                        index
                                    )
                            }
                        </div>

                        <strong>
                            ${asset}
                        </strong>

                    </button>
                `).join("")}

                <button
                    class="central-add-asset"
                    id="centralAddAsset"
                >
                    +
                    <span>
                        Choose a ${type === "costumes"
                            ? "Costume"
                            : "Sound"}
                    </span>
                </button>

            </div>

        </div>
    `;

    $$(".central-asset-card").forEach(card => {

        card.addEventListener("click", () => {

            $$(".central-asset-card").forEach(c =>
                c.classList.remove("selected")
            );

            card.classList.add("selected");

            const asset =
                card.dataset.centralAsset;

            if (type === "costumes") {

                updateStageCostume(asset);

                const preview =
                    document.getElementById(
                        "costumePreview"
                    );

                if (preview) {
                    preview.textContent =
                        getCostumeIcon(
                            selectedSprite,
                            assets.indexOf(asset)
                        );
                }

            } else {

                playSound(asset);
            }

            if ($("stepStatus")) {
                $("stepStatus").textContent =
                    `✓ ${asset} selected.`;
            }
        });
    });

    document
        .getElementById("centralAddAsset")
        ?.addEventListener("click", () => {

            if ($("stepStatus")) {
                $("stepStatus").textContent =
                    `✓ Choose a ${type === "costumes"
                        ? "costume"
                        : "sound"} for ${capitalize(selectedSprite)}.`;
            }
        });
}


function getSpriteIcon(sprite) {

    const icons = {
        aura: "A",
        shadow: "👾",
        orb: "●",
        portal: "✦",
        star: "★"
    };

    return icons[sprite] || "●";
}


function getCostumeIcon(sprite, index) {

    const icons = {
        aura: ["A", "✨", "🏃"],
        shadow: ["👾", "😈"],
        orb: ["●", "💫"],
        portal: ["✦", "🌀"],
        star: ["★"]
    };

    return (
        icons[sprite]?.[index] ||
        getSpriteIcon(sprite)
    );
}


function capitalize(text) {

    return text.charAt(0).toUpperCase() +
           text.slice(1);
}
   
    // SOUND MODE
    if (tabName === "sounds") {

        editorBody.classList.remove("costume-mode");
        editorBody.classList.add("sound-mode");

        categories?.classList.add("editor-hidden");
        palette?.classList.add("editor-hidden");
        workspace?.classList.add("editor-hidden");

        renderAssetEditor("sounds");

        selectedAsset = "sounds";
        renderAssets("sounds");

        clearHighlights();
    }
}


/* =========================================================
   ASSETS
   ========================================================= */

const spriteAssets = {

    aura: {
        costumes: ["AURA", "AURA GLOW", "AURA RUN"],
        sounds: ["Meow", "Pop", "Collect"]
    },

    shadow: {
        costumes: ["Shadow", "Shadow Attack"],
        sounds: ["Boom", "Buzz"]
    },

    orb: {
        costumes: ["Orb", "Orb Glow"],
        sounds: ["Pop", "Collect"]
    },

    portal: {
        costumes: ["Portal", "Portal Open"],
        sounds: ["Magic", "Win"]
    },

    star: {
        costumes: ["Star"],
        sounds: ["Pop"]
    }
};


function setupAssets() {
    renderAssets();
}


function renderAssets(forceType = null) {

    const library =
        $("assetLibrary");

    if (!library) return;

    let type =
        forceType === "costume"
            ? "costumes"
            : forceType === "sound"
                ? "sounds"
                : selectedAsset;

    if (type !== "costumes" && type !== "sounds")
        type = "costumes";

    selectedAsset = type;

    const data =
        spriteAssets[selectedSprite] ||
        spriteAssets.aura;

    const assets =
        data[type] || [];

    library.innerHTML = "";

    assets.forEach((asset, index) => {

        const button =
            document.createElement("button");

        button.className =
            "asset-item";

        button.dataset.asset =
            asset;

        button.innerHTML =
            type === "sounds"
                ? "🔊"
                : index === 0
                    ? "A"
                    : "🎭";

        button.title =
            asset;

        button.addEventListener("click", () => {

            $$(".asset-item").forEach(a =>
                a.classList.remove("selected")
            );

            button.classList.add("selected");

            $("stepStatus").textContent =
                `✓ ${asset} selected.`;

            if (type === "costumes") {
                updateStageCostume(asset);
            }

            if (type === "sounds") {
                playSound(asset);
            }

            clearHighlights();
        });

        library.appendChild(button);
    });

    $$(".asset-tab").forEach(tab => {

        tab.classList.toggle(
            "active",
            tab.dataset.asset === type
        );

    });
}


/* =========================================================
   BACKDROPS
   ========================================================= */

function setupBackdrops() {

    $$(".backdrop-card").forEach(card => {

        card.addEventListener("click", () => {

            selectBackdrop(
                card.dataset.backdrop
            );

        });

    });

    $("chooseBackdropButton")?.addEventListener(
        "click",
        () => {

            const library =
                $("backdropLibrary");

            if (
                qs(
                    '.backdrop-card[data-backdrop="sunset"]'
                )
            ) return;

            const card =
                document.createElement("button");

            card.className =
                "backdrop-card";

            card.dataset.backdrop =
                "sunset";

            card.innerHTML = `
                <div class="backdrop-thumb"
                     style="background:linear-gradient(#f97316,#7c3aed,#111827)">
                </div>
                <small>Sunset</small>
            `;

            card.addEventListener("click", () => {
                selectBackdrop("sunset");
            });

            library.appendChild(card);
        }
    );
}


function selectBackdrop(name) {

    $$(".backdrop-card").forEach(card => {

        card.classList.toggle(
            "selected",
            card.dataset.backdrop === name
        );

    });

    const stage =
        $("previewStage");

    const bg =
        stage?.querySelector(".stage-background");

    if (!bg) return;

    const backgrounds = {

        space:
            "radial-gradient(circle at 50% 45%, #172554, #07101e 75%)",

        neon:
            "linear-gradient(135deg,#7c3aed,#0891b2)",

        city:
            "linear-gradient(180deg,#38bdf8 0 50%,#334155 50%)",

        sunset:
            "linear-gradient(180deg,#f97316,#7c3aed,#111827)"
    };

    bg.style.background =
        backgrounds[name] ||
        backgrounds.space;

    $("stepStatus").textContent =
        `✓ ${capitalize(name)} backdrop selected.`;

    clearHighlights();
}


/* =========================================================
   RUN BUTTONS
   ========================================================= */

function setupRunButtons() {

    $("runLessonButton")?.addEventListener(
        "click",
        () => runWorkspace()
    );

    $("lessonFlag")?.addEventListener(
        "click",
        () => runWorkspace()
    );

    $("lessonStop")?.addEventListener(
        "click",
        () => stopLessonPreview()
    );

    $("stageGreenFlag")?.addEventListener(
        "click",
        () => runWorkspace()
    );

    $("stageStop")?.addEventListener(
        "click",
        () => stopLessonPreview()
    );
}


function updateRunHint() {

    const count =
        workspaceBlocks.length;

    if ($("bottomHint")) {

        $("bottomHint").textContent =
            count
                ? `${count} block${count === 1 ? "" : "s"} ready — click RUN to test.`
                : "Click the highlighted block to add it to your script.";
    }
}


/* =========================================================
   WORKSPACE RUNNER
   ========================================================= */

function runWorkspace() {

    const preview =
        $("previewPlayer");

    if (!preview) return;

    stopLessonPreview();

    let x = 50;
    let y = 50;

    let direction = 90;
    let size = 100;

    let stepIndex = 0;

    const blocksToRun =
        [...workspaceBlocks];

    function executeNext() {

        if (stepIndex >= blocksToRun.length) {

            $("stepStatus").textContent =
                "✓ Script finished running.";

            return;
        }

        const block =
            blocksToRun[stepIndex];

        const value =
            Number(block.inputs?.[0]?.value || 10);

        switch (block.id) {

            case "move":
                x += value / 2;
                break;

            case "changex":
                x += value / 2;
                break;

            case "changey":
                y -= value / 2;
                break;

            case "setx":
                x = 50 + value / 2;
                break;

            case "sety":
                y = 50 - value / 2;
                break;

            case "random":
                x = 15 + Math.random() * 70;
                y = 15 + Math.random() * 70;
                break;

            case "turn":
                direction += value;
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
                updateStageCostume("AURA GLOW");
                break;

            case "say":
                showStageBubble(
                    block.inputs?.[0]?.value ||
                    "Hello!"
                );
                break;

            case "soundstart":
            case "soundwait":
                playSound("Pop");
                break;

            case "flag":
                resetPreview();
                break;

            case "setvar":
            case "changevar":
                pulseStage();
                break;

            case "bounce":
                x = clamp(x, 10, 90);
                y = clamp(y, 10, 90);
                break;

            default:
                break;
        }

        x = clamp(x, 8, 92);
        y = clamp(y, 10, 88);

        preview.style.left =
            `${x}%`;

        preview.style.top =
            `${y}%`;

        stepIndex++;

        setTimeout(
            executeNext,
            300
        );
    }

    executeNext();
}


function resetPreview() {

    const preview =
        $("previewPlayer");

    if (!preview) return;

    preview.style.left = "50%";
    preview.style.top = "50%";

    preview.style.width = "30px";
    preview.style.height = "30px";

    preview.style.transform =
        "translate(-50%,-50%)";

    hideStageBubble();
}


function stopLessonPreview() {

    if (gameAnimation) {
        cancelAnimationFrame(gameAnimation);
        gameAnimation = null;
    }

    resetPreview();
}


/* =========================================================
   STAGE EFFECTS
   ========================================================= */

function updateStageSprite() {

    const preview =
        $("previewPlayer");

    if (!preview) return;

    const sprites = {

        aura: {
            text: "A",
            background:
                "radial-gradient(circle,#fff,#a78bfa 45%,#7c3aed)"
        },

        shadow: {
            text: "👾",
            background:
                "linear-gradient(135deg,#111827,#7f1d1d)"
        },

        orb: {
            text: "●",
            background:
                "radial-gradient(circle,#fff,#22d3ee)"
        },

        portal: {
            text: "✦",
            background:
                "radial-gradient(circle,#fff,#8b5cf6)"
        },

        star: {
            text: "★",
            background:
                "radial-gradient(circle,#fff,#facc15)"
        }
    };

    const data =
        sprites[selectedSprite] ||
        sprites.aura;

    preview.textContent =
        data.text;

    preview.style.background =
        data.background;
}


function updateStageCostume(costume) {

    const preview =
        $("previewPlayer");

    if (!preview) return;

    if (
        costume.toLowerCase().includes("glow")
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


function showStageBubble(text) {

    const stage =
        $("previewStage");

    if (!stage) return;

    let bubble =
        stage.querySelector(".stage-speech");

    if (!bubble) {

        bubble =
            document.createElement("div");

        bubble.className =
            "stage-speech";

        Object.assign(
            bubble.style,
            {
                position: "absolute",
                zIndex: "20",
                left: "50%",
                top: "25%",
                transform: "translateX(-50%)",
                padding: "8px 12px",
                background: "#fff",
                color: "#111827",
                borderRadius: "10px",
                fontSize: "9px",
                fontWeight: "800",
                boxShadow: "0 4px 15px rgba(0,0,0,.2)"
            }
        );

        stage.appendChild(bubble);
    }

    bubble.textContent =
        text;

    setTimeout(
        hideStageBubble,
        1800
    );
}


function hideStageBubble() {

    const bubble =
        $("previewStage")
            ?.querySelector(".stage-speech");

    bubble?.remove();
}


function pulseStage() {

    const stage =
        $("previewStage");

    if (!stage) return;

    stage.animate(
        [
            { transform: "scale(1)" },
            { transform: "scale(1.025)" },
            { transform: "scale(1)" }
        ],
        {
            duration: 350
        }
    );
}


/* =========================================================
   SIMPLE SOUND ENGINE
   ========================================================= */

function playSound(name) {

    try {

        const AudioContext =
            window.AudioContext ||
            window.webkitAudioContext;

        if (!AudioContext) return;

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
            frequencies[name] || 600;

        oscillator.type =
            name === "Boom"
                ? "sawtooth"
                : "sine";

        gain.gain.setValueAtTime(
            .0001,
            ctx.currentTime
        );

        gain.gain.exponentialRampToValueAtTime(
            .12,
            ctx.currentTime + .01
        );

        gain.gain.exponentialRampToValueAtTime(
            .0001,
            ctx.currentTime + .18
        );

        oscillator.connect(gain);
        gain.connect(ctx.destination);

        oscillator.start();

        oscillator.stop(
            ctx.currentTime + .2
        );

    } catch (error) {

        console.log(
            "Sound unavailable:",
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

        localStorage.setItem(
            "auraPlusMissions",
            JSON.stringify(
                completedMissions
            )
        );
    }

    updateMissionProgress();

    $("stepStatus").textContent =
        "🏆 Mission complete!";

    setTimeout(() => {

        showScreen("tutorialScreen");

    }, 700);
}


function updateMissionProgress() {

    $$(".mission-card").forEach(card => {

        const mission =
            Number(card.dataset.mission);

        card.classList.toggle(
            "completed",
            completedMissions.includes(mission)
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
   ACTUAL AURA PLUS GAME
   ========================================================= */

function launchAuraPlusFromLesson() {

    stopLessonPreview();

    startGame();

    showScreen("gameScreen");

    $("gameObjective").textContent =
        "COLLECT 5 AURA ORBS → REACH THE PORTAL";

    $("stepStatus").textContent =
        "AURA PLUS launched!";
}


function startGame() {

    stopGame();

    gameRunning = true;

    auraGame = {
        x: 12,
        y: 50,
        score: 0,
        lives: 3,
        collected: 0,
        running: true,
        shadowX: 72,
        shadowY: 50
    };

    updateGameHUD();
    resetGameObjects();

    const player =
        $("player");

    if (player) {

        player.style.left =
            `${auraGame.x}%`;

        player.style.top =
            `${auraGame.y}%`;
    }

    const message =
        $("gameMessage");

    message?.classList.add("hidden");

    requestAnimationFrame(gameLoop);
}


function stopGame() {

    gameRunning = false;
    auraGame.running = false;

    if (gameAnimation) {

        cancelAnimationFrame(
            gameAnimation
        );

        gameAnimation = null;
    }
}


function resetGameObjects() {

    const positions = [
        [18, 25],
        [38, 72],
        [57, 28],
        [72, 68],
        [84, 34]
    ];

    $$(".aura-orb").forEach((orb, index) => {

        orb.classList.remove("collected");

        orb.style.display = "block";

        orb.style.left =
            `${positions[index][0]}%`;

        orb.style.top =
            `${positions[index][1]}%`;
    });

    const portal =
        $("portal");

    if (portal) {

        portal.style.opacity =
            ".35";

        portal.style.borderColor =
            "#475569";
    }

    const shadow =
        $("shadow");

    if (shadow) {

        shadow.style.left = "72%";
        shadow.style.top = "50%";
    }
}


function updateGameHUD() {

    if ($("auraScore"))
        $("auraScore").textContent =
            auraGame.score;

    if ($("lives"))
        $("lives").textContent =
            auraGame.lives;
}


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
   GAME — SHADOW
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

    if (distance > 2) {

        auraGame.shadowX +=
            (dx / distance) * .06;

        auraGame.shadowY +=
            (dy / distance) * .06;
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
   GAME — ORBS
   ========================================================= */

function checkOrbCollisions() {

    const player =
        $("player");

    if (!player) return;

    const playerRect =
        player.getBoundingClientRect();

    $$(".aura-orb").forEach(orb => {

        if (
            orb.style.display === "none"
        ) return;

        const orbRect =
            orb.getBoundingClientRect();

        if (
            rectanglesTouch(
                playerRect,
                orbRect
            )
        ) {

            collectOrb(orb);
        }
    });
}


function collectOrb(orb) {

    orb.style.display =
        "none";

    auraGame.score +=
        Number(
            orb.dataset.value || 10
        );

    auraGame.collected++;

    updateGameHUD();

    playSound("Collect");

    if (
        auraGame.collected >= 5
    ) {

        unlockPortal();

    } else {

        $("gameObjective").textContent =
            `COLLECT ${5 - auraGame.collected} MORE ORB${5 - auraGame.collected === 1 ? "" : "S"}`;
    }
}


/* =========================================================
   GAME — PORTAL
   ========================================================= */

function unlockPortal() {

    const portal =
        $("portal");

    if (!portal) return;

    portal.style.opacity =
        "1";

    portal.style.borderColor =
        "#a78bfa";

    portal.style.boxShadow =
        "0 0 35px rgba(167,139,250,.8)";

    $("gameObjective").textContent =
        "PORTAL UNLOCKED → REACH IT!";

    playSound("Magic");
}


/* =========================================================
   GAME — SHADOW COLLISION
   ========================================================= */

let lastHit = 0;

function checkShadowCollision() {

    const player =
        $("player");

    const shadow =
        $("shadow");

    if (!player || !shadow)
        return;

    const p =
        player.getBoundingClientRect();

    const s =
        shadow.getBoundingClientRect();

    if (
        rectanglesTouch(p, s)
    ) {

        const now =
            Date.now();

        if (
            now - lastHit < 1500
        ) return;

        lastHit = now;

        auraGame.lives--;

        updateGameHUD();

        playSound("Boom");

        auraGame.x = 12;
        auraGame.y = 50;

        player.style.left =
            `${auraGame.x}%`;

        player.style.top =
            `${auraGame.y}%`;

        if (
            auraGame.lives <= 0
        ) {

            gameOver();
        }
    }
}


/* =========================================================
   GAME — PORTAL COLLISION
   ========================================================= */

function checkPortal() {

    if (
        auraGame.collected < 5
    ) return;

    const player =
        $("player");

    const portal =
        $("portal");

    if (!player || !portal)
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


function rectanglesTouch(a, b) {

    return !(
        a.right < b.left ||
        a.left > b.right ||
        a.bottom < b.top ||
        a.top > b.bottom
    );
}


/* =========================================================
   GAME — WIN / LOSE
   ========================================================= */

function winGame() {

    if (!gameRunning)
        return;

    gameRunning = false;

    if (gameAnimation)
        cancelAnimationFrame(
            gameAnimation
        );

    playSound("Win");

    const message =
        $("gameMessage");

    message.innerHTML = `
        <div>
            <div style="font-size:14px;color:#a78bfa;letter-spacing:3px;">
                AURA PLUS
            </div>

            <div style="font-size:42px;margin:10px 0;">
                🏆 YOU WIN!
            </div>

            <div style="font-size:15px;color:#cbd5e1;">
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
                ">
                CONTINUE →
            </button>
        </div>
    `;

    message.classList.remove("hidden");
}


function gameOver() {

    gameRunning = false;

    const message =
        $("gameMessage");

    message.innerHTML = `
        <div>

            <div style="font-size:42px;">
                💥 GAME OVER
            </div>

            <div style="font-size:15px;color:#cbd5e1;margin-top:10px;">
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
                ">
                TRY AGAIN
            </button>

        </div>
    `;

    message.classList.remove("hidden");
}


/* =========================================================
   GLOBAL GAME FINISH
   ========================================================= */

window.finishGame = function() {

    stopGame();

    completedMissions =
        completedMissions.includes(7)
            ? completedMissions
            : [...completedMissions, 7];

    localStorage.setItem(
        "auraPlusMissions",
        JSON.stringify(
            completedMissions
        )
    );

    updateMissionProgress();

    showScreen("finalScreen");
};


/* =========================================================
   KEYBOARD CONTROLS
   ========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            !gameRunning
        ) return;

        const allowed =
            [
                "ArrowLeft",
                "ArrowRight",
                "ArrowUp",
                "ArrowDown",
                "w",
                "a",
                "s",
                "d",
                "W",
                "A",
                "S",
                "D"
            ];

        if (
            !allowed.includes(
                event.key
            )
        ) return;

        event.preventDefault();

        const speed = 1.2;

        switch (event.key) {

            case "ArrowLeft":
            case "a":
            case "A":
                auraGame.x -= speed;
                break;

            case "ArrowRight":
            case "d":
            case "D":
                auraGame.x += speed;
                break;

            case "ArrowUp":
            case "w":
            case "W":
                auraGame.y -= speed;
                break;

            case "ArrowDown":
            case "s":
            case "S":
                auraGame.y += speed;
                break;
        }

        auraGame.x =
            clamp(
                auraGame.x,
                4,
                96
            );

        auraGame.y =
            clamp(
                auraGame.y,
                10,
                90
            );

        const player =
            $("player");

        if (player) {

            player.style.left =
                `${auraGame.x}%`;

            player.style.top =
                `${auraGame.y}%`;
        }
    }
);


/* =========================================================
   TOUCH / SMARTBOARD GAME CONTROL
   ========================================================= */

$("gameWorld")?.addEventListener(
    "pointermove",
    event => {

        if (!gameRunning)
            return;

        /*
           Touch / pointer movement is especially useful
           on a smartboard.
        */

        if (
            event.pointerType === "touch" ||
            event.buttons
        ) {

            const world =
                $("gameWorld");

            const rect =
                world.getBoundingClientRect();

            auraGame.x =
                clamp(
                    (
                        (event.clientX - rect.left)
                        / rect.width
                    ) * 100,
                    4,
                    96
                );

            auraGame.y =
                clamp(
                    (
                        (event.clientY - rect.top)
                        / rect.height
                    ) * 100,
                    10,
                    90
                );

            const player =
                $("player");

            if (player) {

                player.style.left =
                    `${auraGame.x}%`;

                player.style.top =
                    `${auraGame.y}%`;
            }
        }
    }
);


/* =========================================================
   UTILITY
   ========================================================= */

function capitalize(value) {

    if (!value) return "";

    return value.charAt(0).toUpperCase() +
        value.slice(1);
}


/* =========================================================
   DEBUG / RESET
   ========================================================= */

window.resetAuraProgress = function() {

    localStorage.removeItem(
        "auraPlusMissions"
    );

    completedMissions = [];

    updateMissionProgress();

    alert(
        "AURA PLUS progress reset."
    );
};


/* =========================================================
   INITIAL VISUAL STATE
   ========================================================= */

setTimeout(() => {

    updateStageSprite();

    renderWorkspace();

}, 100);
