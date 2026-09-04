(() => {
    "use strict";

    /* =========================================================
       AURA PLUS — SCRATCH GAME LAB
       COMPLETE SCRIPT
       ========================================================= */

    /* =========================================================
       DOM HELPERS
       ========================================================= */

    const $ = (id) => document.getElementById(id);

    const $$ = (selector) =>
        Array.from(document.querySelectorAll(selector));

    const normalize = (text = "") =>
        String(text)
            .replace(/\s+/g, " ")
            .trim()
            .toLowerCase();

    const capitalize = (text = "") =>
        text.charAt(0).toUpperCase() + text.slice(1);


    /* =========================================================
       GLOBAL STATE
       ========================================================= */

    let currentMission = 1;
    let currentStep = 0;

    let selectedSprite = "Aura";
    let selectedCategory = "motion";

    let currentEditorTab = "code";

    const completed = new Set();

    /*
       IMPORTANT:
       Every sprite has its OWN workspace.
       This makes AURA and SHADOW behave like
       separate Scratch sprite scripts.
    */

    const spriteWorkspaces = {
        Aura: [],
        Shadow: [],
        Orb: [],
        Portal: [],
        Star: []
    };

    const stageWorkspace = [];

    const assetSelections = {
        costumes: {},
        sounds: {},
        backdrops: {}
    };


    /* =========================================================
       SCREEN HELPERS
       ========================================================= */

    const screenMap = {
        intro: "introScreen",
        game: "gameScreen",
        secret: "secretScreen",
        tutorial: "tutorialScreen",
        lesson: "lessonScreen",
        final: "finalScreen"
    };

    function showScreen(name) {

        Object.entries(screenMap).forEach(([key, id]) => {

            const el = $(id);

            if (!el) return;

            const active = key === name;

            el.classList.toggle("hidden", !active);
            el.classList.toggle("active", active);
        });

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }


    /* =========================================================
       AURA PLUS GAME
       ========================================================= */

    const gameWorld = $("gameWorld");
    const player = $("player");
    const shadow = $("shadow");
    const portal = $("portal");

    const auraScore = $("auraScore");
    const livesEl = $("lives");
    const gameMessage = $("gameMessage");

    let gx = 70;
    let gy = 110;

    let score = 0;
    let lives = 3;

    let gameRunning = false;
    let gameFrame = null;

    const keys = {};


    function resetGame() {

        score = 0;
        lives = 3;

        gx = 70;
        gy = 110;

        if (auraScore)
            auraScore.textContent = "0";

        if (livesEl)
            livesEl.textContent = "3";

        $$(".aura-orb").forEach((orb) => {
            orb.style.display = "block";
        });

        if (portal) {
            portal.style.opacity = ".35";
            portal.style.boxShadow = "0 0 0 #a78bfa";
        }

        if (gameMessage)
            gameMessage.classList.add("hidden");

        if (player) {
            player.style.left = gx + "px";
            player.style.top = gy + "px";
        }

        if (shadow) {
            shadow.style.left = "70%";
            shadow.style.top = "50%";
        }

        if ($("gameObjective"))
            $("gameObjective").textContent =
                "COLLECT THE AURA ORBS!";
    }


    function rectsTouch(a, b) {

        if (!a || !b) return false;

        const A = a.getBoundingClientRect();
        const B = b.getBoundingClientRect();

        return !(
            A.right < B.left ||
            A.left > B.right ||
            A.bottom < B.top ||
            A.top > B.bottom
        );
    }


    function updateGame() {

        if (!gameRunning || !gameWorld || !player)
            return;

        const speed = 4;

        if (keys.ArrowLeft || keys.a)
            gx -= speed;

        if (keys.ArrowRight || keys.d)
            gx += speed;

        if (keys.ArrowUp || keys.w)
            gy -= speed;

        if (keys.ArrowDown || keys.s)
            gy += speed;

        gx = Math.max(
            0,
            Math.min(
                gameWorld.clientWidth - player.offsetWidth,
                gx
            )
        );

        gy = Math.max(
            45,
            Math.min(
                gameWorld.clientHeight - player.offsetHeight,
                gy
            )
        );

        player.style.left = gx + "px";
        player.style.top = gy + "px";


        /* SHADOW CHASE */

        if (shadow) {

            const targetX =
                gx > shadow.offsetLeft ? 1 : -1;

            const targetY =
                gy > shadow.offsetTop ? 1 : -1;

            shadow.style.left =
                Math.max(
                    0,
                    shadow.offsetLeft + targetX * 1.05
                ) + "px";

            shadow.style.top =
                Math.max(
                    45,
                    shadow.offsetTop + targetY * 0.8
                ) + "px";
        }


        /* ORB COLLECTION */

        $$(".aura-orb").forEach((orb) => {

            if (
                orb.style.display !== "none" &&
                rectsTouch(player, orb)
            ) {

                orb.style.display = "none";

                score += 10;

                if (auraScore)
                    auraScore.textContent = score;


                if (score >= 50 && portal) {

                    portal.style.opacity = "1";

                    portal.style.boxShadow =
                        "0 0 35px #a78bfa";

                    if ($("gameObjective"))
                        $("gameObjective").textContent =
                            "PORTAL UNLOCKED — REACH IT!";
                }
            }
        });


        /* SHADOW COLLISION */

        if (shadow && rectsTouch(player, shadow)) {

            lives--;

            if (livesEl)
                livesEl.textContent = lives;

            gx = 70;
            gy = 110;

            player.style.left = gx + "px";
            player.style.top = gy + "px";


            if (lives <= 0) {

                stopGame();

                if (gameMessage) {

                    gameMessage.innerHTML =
                        "GAME OVER 😵<br><small>Click EXIT and play again.</small>";

                    gameMessage.classList.remove("hidden");
                }

                return;
            }
        }


        /* PORTAL */

        if (
            score >= 50 &&
            portal &&
            rectsTouch(player, portal)
        ) {

            stopGame();

            showScreen("secret");

            return;
        }


        gameFrame =
            requestAnimationFrame(updateGame);
    }


    function startGame() {

        resetGame();

        gameRunning = true;

        cancelAnimationFrame(gameFrame);

        gameFrame =
            requestAnimationFrame(updateGame);
    }


    function stopGame() {

        gameRunning = false;

        if (gameFrame)
            cancelAnimationFrame(gameFrame);

        gameFrame = null;
    }


    /* =========================================================
       LESSON DATA
       ========================================================= */

    const lessons = {

        1: {

            title: "Working with Sprites",

            desc:
                "Sprites are the characters and objects in Scratch.",

            why:
                "Each sprite has its own Code, Costumes and Sounds.",

            tip:
                "A project can contain many sprites.",

            steps: [

                {
                    action:
                        "Click the AURA sprite in the Sprite List.",

                    why:
                        "Selecting a sprite tells Scratch which sprite you are programming.",

                    target:
                        "sprite:Aura"
                },

                {
                    action:
                        "Click the + button beside SPRITE LIST.",

                    why:
                        "This is where you add another sprite.",

                    target:
                        "add-sprite"
                },

                {
                    action:
                        "Click the SHADOW sprite.",

                    why:
                        "Different sprites can have completely different scripts.",

                    target:
                        "sprite:Shadow"
                },

                {
                    action:
                        "Click the AURA sprite again.",

                    why:
                        "The selected sprite is the one whose code you edit.",

                    target:
                        "sprite:Aura"
                }
            ]
        },


        2: {

            title:
                "Make a Sprite Move",

            desc:
                "Motion blocks control where a sprite moves on the Stage.",

            why:
                "Scratch uses Motion blocks such as move, turn and change x/y.",

            tip:
                "Motion blocks are blue.",

            steps: [

                {
                    action:
                        "Click AURA in the Sprite List.",

                    why:
                        "First choose the sprite you want to program.",

                    target:
                        "sprite:Aura"
                },

                {
                    action:
                        "Click Motion.",

                    why:
                        "Motion is the category for movement.",

                    target:
                        "category:motion"
                },

                {
                    action:
                        "Tap “move 10 steps” in the palette.",

                    why:
                        "This adds a real Motion block to the script.",

                    target:
                        "block:move 10 steps"
                },

                {
                    action:
                        "Tap “turn ↻ 15 degrees”.",

                    why:
                        "Turn changes the sprite's direction.",

                    target:
                        "block:turn ↻ 15 degrees"
                },

                {
                    action:
                        "Tap “change x by 10”.",

                    why:
                        "Changing x moves a sprite left or right.",

                    target:
                        "block:change x by 10"
                }
            ]
        },


        3: {

            title:
                "Change Costumes",

            desc:
                "A sprite can have more than one costume.",

            why:
                "Changing costumes is how Scratch can make a character look animated.",

            tip:
                "Use the Costumes tab to see and edit a sprite's costumes.",

            steps: [

                {
                    action:
                        "Click AURA in the Sprite List.",

                    why:
                        "Costumes belong to the selected sprite.",

                    target:
                        "sprite:Aura"
                },

                {
                    action:
                        "Click the Costumes tab at the top.",

                    why:
                        "The Costumes tab shows the selected sprite's costumes.",

                    target:
                        "tab:costumes"
                },

                {
                    action:
                        "Click Costume 2.",

                    why:
                        "A sprite can have multiple costumes.",

                    target:
                        "costume:Costume 2"
                },

                {
                    action:
                        "Click “＋ Choose” in the costume area.",

                    why:
                        "Scratch lets you add another costume from its library.",

                    target:
                        "choose-costume"
                },

                {
                    action:
                        "Click the Code tab to return to scripts.",

                    why:
                        "Code, Costumes and Sounds are different editing areas.",

                    target:
                        "tab:code"
                }
            ]
        },


        4: {

            title:
                "Program Two Sprites",

            desc:
                "Every sprite can have its own script.",

            why:
                "AURA can move while SHADOW follows or behaves differently.",

            tip:
                "Always check which sprite is selected before adding code.",

            steps: [

                {
                    action:
                        "Click AURA in the Sprite List.",

                    why:
                        "You are now editing AURA's scripts.",

                    target:
                        "sprite:Aura"
                },

                {
                    action:
                        "Click Code.",

                    why:
                        "The Code tab shows AURA's scripts.",

                    target:
                        "tab:code"
                },

                {
                    action:
                        "Click SHADOW in the Sprite List.",

                    why:
                        "Now Scratch is ready to edit SHADOW.",

                    target:
                        "sprite:Shadow"
                },

                {
                    action:
                        "Click Events.",

                    why:
                        "Events contain blocks that can start a script.",

                    target:
                        "category:events"
                },

                {
                    action:
                        "Tap “when green flag clicked”.",

                    why:
                        "This starts SHADOW's script when the project starts.",

                    target:
                        "block:when green flag clicked"
                }
            ]
        },


        5: {

            title:
                "Change the Backdrop",

            desc:
                "The Stage has backdrops instead of costumes.",

            why:
                "Backdrops change the scene behind every sprite.",

            tip:
                "Select the Stage to work with backdrops.",

            steps: [

                {
                    action:
                        "Click “Select Stage” below the asset panel.",

                    why:
                        "The Stage has its own Backdrops area.",

                    target:
                        "select-stage"
                },

                {
                    action:
                        "Click “＋ Choose Backdrop”.",

                    why:
                        "Scratch provides a backdrop library.",

                    target:
                        "choose-backdrop"
                },

                {
                    action:
                        "Click the Aquarium backdrop thumbnail.",

                    why:
                        "A backdrop changes the scene without changing the sprites.",

                    target:
                        "backdrop:Aquarium"
                },

                {
                    action:
                        "Click AURA in the Sprite List.",

                    why:
                        "You can return from the Stage to a sprite at any time.",

                    target:
                        "sprite:Aura"
                }
            ]
        },


        6: {

            title:
                "Working with Sounds",

            desc:
                "Sprites can have sounds that play during the project.",

            why:
                "Sounds are added and managed from the Sounds tab.",

            tip:
                "Use the Sound category for sound blocks.",

            steps: [

                {
                    action:
                        "Click AURA in the Sprite List.",

                    why:
                        "Sounds belong to the selected sprite.",

                    target:
                        "sprite:Aura"
                },

                {
                    action:
                        "Click the Sounds tab.",

                    why:
                        "The Sounds tab shows sounds belonging to the selected sprite.",

                    target:
                        "tab:sounds"
                },

                {
                    action:
                        "Click “＋ Choose” in the sound area.",

                    why:
                        "Scratch lets you choose a sound from its library.",

                    target:
                        "choose-sound"
                },

                {
                    action:
                        "Click the Sound category on the left.",

                    why:
                        "Sound blocks control when sounds play.",

                    target:
                        "category:sound"
                },

                {
                    action:
                        "Tap “start sound Pop”.",

                    why:
                        "This starts a sound without stopping the rest of the script.",

                    target:
                        "block:start sound Pop"
                }
            ]
        },


        7: {

            title:
                "Build AURA PLUS",

            desc:
                "Now put the Scratch ideas together to build the same game you played at the beginning.",

            why:
                "AURA PLUS uses sprites, Motion, Sensing, Control, Variables, Backdrops and Sounds.",

            tip:
                "Build the game in small pieces: start → movement → orbs → enemy → score → portal → sound.",

            steps: [

                {
                    action:
                        "Click AURA in the Sprite List.",

                    why:
                        "AURA is the main player sprite.",

                    target:
                        "sprite:Aura"
                },

                {
                    action:
                        "Click Events.",

                    why:
                        "Every Scratch game needs a starting event.",

                    target:
                        "category:events"
                },

                {
                    action:
                        "Tap “when green flag clicked”.",

                    why:
                        "This tells AURA when the game should start.",

                    target:
                        "block:when green flag clicked"
                },

                {
                    action:
                        "Click Control.",

                    why:
                        "Control blocks manage repeated game behaviour.",

                    target:
                        "category:control"
                },

                {
                    action:
                        "Tap “forever”.",

                    why:
                        "A forever loop keeps the game running.",

                    target:
                        "block:forever"
                },

                {
                    action:
                        "Click Motion.",

                    why:
                        "Motion blocks make AURA move.",

                    target:
                        "category:motion"
                },

                {
                    action:
                        "Tap “change x by 10”.",

                    why:
                        "Changing x creates horizontal movement.",

                    target:
                        "block:change x by 10"
                },

                {
                    action:
                        "Click the ORB sprite.",

                    why:
                        "The ORB gets its own script.",

                    target:
                        "sprite:Orb"
                },

                {
                    action:
                        "Click Control.",

                    why:
                        "The ORB needs a decision for collection.",

                    target:
                        "category:control"
                },

                {
                    action:
                        "Tap “if <> then”.",

                    why:
                        "An if block lets the game react to a condition.",

                    target:
                        "block:if <> then"
                },

                {
                    action:
                        "Click Sensing.",

                    why:
                        "Sensing can detect whether sprites are touching.",

                    target:
                        "category:sensing"
                },

                {
                    action:
                        "Tap “touching AURA?”.",

                    why:
                        "This detects whether AURA has collected the orb.",

                    target:
                        "block:touching AURA?"
                },

                {
                    action:
                        "Click Variables.",

                    why:
                        "Variables store changing information such as score.",

                    target:
                        "category:variables"
                },

                {
                    action:
                        "Tap “change AURA by 10”.",

                    why:
                        "Each collected orb can add 10 points.",

                    target:
                        "block:change AURA by 10"
                },

                {
                    action:
                        "Click SHADOW in the Sprite List.",

                    why:
                        "SHADOW needs its own separate script.",

                    target:
                        "sprite:Shadow"
                },

                {
                    action:
                        "Click Events.",

                    why:
                        "SHADOW also needs its own starting event.",

                    target:
                        "category:events"
                },

                {
                    action:
                        "Tap “when green flag clicked”.",

                    why:
                        "This starts SHADOW's separate script.",

                    target:
                        "block:when green flag clicked"
                },

                {
                    action:
                        "Click the PORTAL sprite.",

                    why:
                        "The portal is the final destination.",

                    target:
                        "sprite:Portal"
                },

                {
                    action:
                        "Click Control.",

                    why:
                        "The portal needs a condition before it becomes useful.",

                    target:
                        "category:control"
                },

                {
                    action:
                        "Tap “if <> then”.",

                    why:
                        "The portal can react when the player reaches the required score.",

                    target:
                        "block:if <> then"
                },

                {
                    action:
                        "Click Sound.",

                    why:
                        "Sound gives feedback when something happens.",

                    target:
                        "category:sound"
                },

                {
                    action:
                        "Tap “start sound Pop”.",

                    why:
                        "A sound can make collecting an orb feel rewarding.",

                    target:
                        "block:start sound Pop"
                },

                {
                    action:
                        "Click the green flag on the Stage to test your AURA PLUS build.",

                    why:
                        "The final test is to collect the orbs, survive SHADOW and reach the portal.",

                    target:
                        "stage-flag"
                }
            ]
        }
    };


    /* =========================================================
       BLOCK PALETTE
       ========================================================= */

    const categoryBlocks = {

        motion: [
            "move 10 steps",
            "turn ↻ 15 degrees",
            "go to random position",
            "change x by 10",
            "change y by 10",
            "set x to 0",
            "set y to 0",
            "if on edge, bounce",
            "point in direction 90"
        ],

        looks: [
            "say Hello! for 2 seconds",
            "say Hello!",
            "switch costume to Costume 2",
            "next costume",
            "change size by 10",
            "show",
            "hide",
            "switch backdrop to backdrop1",
            "next backdrop"
        ],

        sound: [
            "start sound Pop",
            "play sound Pop until done",
            "stop all sounds",
            "change volume by -10",
            "set volume to 100%"
        ],

        events: [
            "when green flag clicked",
            "when this sprite clicked",
            "when I receive message1",
            "broadcast message1",
            "broadcast message1 and wait"
        ],

        control: [
            "wait 1 seconds",
            "repeat 10",
            "forever",
            "if <> then",
            "if <> then else",
            "wait until <>",
            "repeat until <>",
            "stop all"
        ],

        sensing: [
            "touching mouse-pointer?",
            "touching AURA?",
            "ask What's your name? and wait",
            "mouse x",
            "mouse y",
            "distance to mouse-pointer",
            "timer",
            "reset timer"
        ],

        operators: [
            "() + ()",
            "() - ()",
            "() * ()",
            "() / ()",
            "pick random 1 to 10",
            "() < ()",
            "() = ()",
            "() > ()",
            "() and ()",
            "() or ()",
            "not ()"
        ],

        variables: [
            "change AURA by 10",
            "set AURA to 0",
            "show variable AURA",
            "hide variable AURA",
            "change lives by -1",
            "set lives to 3"
        ],

        myblocks: [
            "define my block",
            "my block",
            "my block (input)"
        ]
    };


    const blockColors = {

        motion: "block-motion",
        looks: "block-looks",
        sound: "block-sound",
        events: "block-events",
        control: "block-control",
        sensing: "block-sensing",
        operators: "block-operators",
        variables: "block-variables",
        myblocks: "block-myblocks"
    };


    /* =========================================================
       LESSON ELEMENTS
       ========================================================= */

    const palette = $("blockPalette");
    const lessonBlocks = $("lessonBlocks");

    const workspaceInstruction =
        $("workspaceInstruction");

    const lessonStepEl =
        $("lessonStep");

    const stepProgressBar =
        $("stepProgressBar");

    const actionText =
        $("actionText");

    const lessonTitle =
        $("lessonTitle");

    const lessonDescription =
        $("lessonDescription");

    const lessonWhy =
        $("lessonWhy");

    const teacherTip =
        $("teacherTip");

    const paletteCategory =
        $("paletteCategory");

    const blockCount =
        $("blockCount");

    const bottomHint =
        $("bottomHint");

    const selectedTargetEl =
        $("selectedTarget");


    /* =========================================================
       STATUS
       ========================================================= */

    function setStatus(message) {

        if (workspaceInstruction)
            workspaceInstruction.textContent = message;

        if (bottomHint)
            bottomHint.textContent = message;

        if ($("stepStatus"))
            $("stepStatus").textContent = message;
    }


    /* =========================================================
       CURRENT SPRITE WORKSPACE
       ========================================================= */

    function getCurrentWorkspace() {

        if (selectedSprite === "Stage")
            return stageWorkspace;

        if (!spriteWorkspaces[selectedSprite])
            spriteWorkspaces[selectedSprite] = [];

        return spriteWorkspaces[selectedSprite];
    }


    function renderWorkspace() {

        if (!lessonBlocks)
            return;

        const blocks =
            getCurrentWorkspace();

        lessonBlocks.innerHTML = "";

        if (!blocks.length) {

            lessonBlocks.innerHTML =
                `
                <div class="workspace-empty">
                    Drag a block here<br>
                    <small>or tap a block to add it</small>
                </div>
                `;

        } else {

            blocks.forEach((block) => {

                const el =
                    document.createElement("div");

                el.className =
                    `workspace-block ${blockColors[block.category] || ""}`;

                el.textContent =
                    block.text;

                lessonBlocks.appendChild(el);
            });
        }

        if (blockCount)
            blockCount.textContent =
                `${blocks.length} blocks`;
    }


    /* =========================================================
       PALETTE
       ========================================================= */

    function renderPalette(category = selectedCategory) {

        if (!palette)
            return;

        selectedCategory = category;

        if (paletteCategory) {

            paletteCategory.textContent =
                category === "myblocks"
                    ? "My Blocks"
                    : capitalize(category);
        }

        palette.innerHTML = "";

        const blocks =
            categoryBlocks[category] || [];

        blocks.forEach((text) => {

            const block =
                document.createElement("div");

            block.className =
                `scratch-block ${blockColors[category]} stack`;

            block.dataset.text = text;

            block.textContent = text;

            block.addEventListener(
                "click",
                () => addBlock(text, category)
            );

            palette.appendChild(block);
        });

        highlightTarget();
    }


    /* =========================================================
       ADD BLOCK
       ========================================================= */

    function addBlock(text, category) {

        const workspace =
            getCurrentWorkspace();

        workspace.push({
            text,
            category
        });

        renderWorkspace();

        const expected =
            lessons[currentMission]
                ?.steps[currentStep]
                ?.target || "";

        if (
            expected.startsWith("block:") &&
            normalize(
                expected.slice(6)
            ) === normalize(text)
        ) {

            setStatus(
                "✓ Correct block added! Now press NEXT."
            );

        } else {

            setStatus(
                "Block added. Read the instruction and continue."
            );
        }

        highlightTarget();
    }


    /* =========================================================
       HIGHLIGHTS
       ========================================================= */

    function clearHighlights() {

        $$(".lesson-target")
            .forEach((el) =>
                el.classList.remove("lesson-target")
            );
    }


    function highlight(element) {

        if (!element)
            return;

        element.classList.add("lesson-target");

        try {

            element.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
                inline: "nearest"
            });

        } catch (_) {}
    }


    function findSprite(name) {

        return document.querySelector(
            `.sprite-card[data-sprite="${name}"]`
        );
    }


    function findEditorTab(name) {

        return document.querySelector(
            `[data-editor-tab="${name}"]`
        );
    }


    function findAsset(name) {

        return document.querySelector(
            `[data-asset="${name}"]`
        );
    }


    function highlightTarget() {

        clearHighlights();

        const target =
            lessons[currentMission]
                ?.steps[currentStep]
                ?.target || "";

        if (!target)
            return;


        /* CATEGORY */

        if (target.startsWith("category:")) {

            const category =
                target.slice(9);

            highlight(
                document.querySelector(
                    `[data-category="${category}"]`
                )
            );

            return;
        }


        /* BLOCK */

        if (target.startsWith("block:")) {

            const wanted =
                normalize(target.slice(6));

            const element =
                [...(palette?.children || [])]
                    .find(
                        (el) =>
                            normalize(el.dataset.text) === wanted
                    );

            highlight(element);

            return;
        }


        /* SPRITE */

        if (target.startsWith("sprite:")) {

            const sprite =
                target.slice(7);

            highlight(findSprite(sprite));

            return;
        }


        /* TAB */

        if (target.startsWith("tab:")) {

            highlight(
                findEditorTab(
                    target.slice(4)
                )
            );

            return;
        }


        /* COSTUME */

        if (target.startsWith("costume:")) {

            const costume =
                target.slice(8);

            const element =
                [...document.querySelectorAll(
                    "[data-asset]"
                )]
                .find(
                    (el) =>
                        normalize(el.dataset.asset) ===
                        normalize(costume)
                );

            highlight(element);

            return;
        }


        /* BACKDROP */

        if (target.startsWith("backdrop:")) {

            const backdrop =
                target.slice(9);

            const element =
                [...document.querySelectorAll(
                    "[data-asset]"
                )]
                .find(
                    (el) =>
                        normalize(el.dataset.asset) ===
                        normalize(backdrop)
                );

            highlight(element);

            return;
        }


        if (target === "add-sprite") {

            highlight(
                $("addSpriteButton")
            );

            return;
        }


        if (target === "choose-costume") {

            openAssetPanel("costumes");

            highlight(
                $("chooseAssetButton")
            );

            return;
        }


        if (target === "choose-sound") {

            openAssetPanel("sounds");

            highlight(
                $("chooseAssetButton")
            );

            return;
        }


        if (target === "choose-backdrop") {

            highlight(
                $("chooseBackdropButton")
            );

            return;
        }


        if (target === "select-stage") {

            highlight(
                $("stageSelectButton")
            );

            return;
        }


        if (target === "stage-flag") {

            highlight(
                $("stageFlag")
            );

            return;
        }
    }


    /* =========================================================
       LOAD LESSON STEP
       ========================================================= */

    function loadStep() {

        const lesson =
            lessons[currentMission];

        if (!lesson)
            return;

        const step =
            lesson.steps[currentStep];

        if (!step)
            return;


        if (lessonStepEl)
            lessonStepEl.textContent =
                `${currentStep + 1}`;


        if (stepProgressBar) {

            stepProgressBar.style.width =
                `${((currentStep + 1) / lesson.steps.length) * 100}%`;
        }


        if (lessonTitle)
            lessonTitle.textContent =
                lesson.title;


        if (lessonDescription)
            lessonDescription.textContent =
                lesson.desc;


        if (actionText)
            actionText.textContent =
                step.action;


        if (lessonWhy)
            lessonWhy.textContent =
                step.why;


        if (teacherTip)
            teacherTip.textContent =
                lesson.tip;


        if (selectedTargetEl)
            selectedTargetEl.textContent =
                selectedSprite.toUpperCase();


        setStatus(
            "👉 Follow the highlighted action, then press NEXT."
        );

        renderWorkspace();

        renderPalette(selectedCategory);

        highlightTarget();
    }


    /* =========================================================
       MISSION OPEN
       ========================================================= */

    function openMission(number) {

        if (!lessons[number])
            return;

        currentMission = number;
        currentStep = 0;

        selectedSprite = "Aura";
        selectedCategory = "motion";
        currentEditorTab = "code";


        /*
           IMPORTANT:
           Do NOT destroy all sprite scripts here.
           Each sprite has its own workspace.
        */

        Object.keys(spriteWorkspaces)
            .forEach(
                key => spriteWorkspaces[key] = []
            );

        stageWorkspace.length = 0;


        showScreen("lesson");


        updateSpriteSelection(false);

        activateEditorTab("code", false);

        renderWorkspace();

        renderPalette("motion");

        loadStep();
    }


    /* =========================================================
       VERIFY CURRENT STEP
       ========================================================= */

    function currentStepCompleted() {

        const step =
            lessons[currentMission]
                ?.steps[currentStep];

        if (!step)
            return true;


        const target =
            step.target || "";


        /* SPRITE */

        if (target.startsWith("sprite:")) {

            return (
                selectedSprite ===
                target.slice(7)
            );
        }


        /* CATEGORY */

        if (target.startsWith("category:")) {

            return (
                selectedCategory ===
                target.slice(9)
            );
        }


        /* BLOCK */

        if (target.startsWith("block:")) {

            const wanted =
                normalize(
                    target.slice(6)
                );

            return getCurrentWorkspace()
                .some(
                    block =>
                        normalize(block.text) === wanted
                );
        }


        /* TAB */

        if (target.startsWith("tab:")) {

            return (
                currentEditorTab ===
                target.slice(4)
            );
        }


        /* COSTUME */

        if (target.startsWith("costume:")) {

            const wanted =
                normalize(
                    target.slice(8)
                );

            return Object.values(
                assetSelections.costumes
            )
            .some(
                name =>
                    normalize(name) === wanted
            );
        }


        /* BACKDROP */

        if (target.startsWith("backdrop:")) {

            const wanted =
                normalize(
                    target.slice(9)
                );

            return Object.values(
                assetSelections.backdrops
            )
            .some(
                name =>
                    normalize(name) === wanted
            );
        }


        /* ADD SPRITE */

        if (target === "add-sprite") {

            return Boolean(
                findSprite("Star")
            );
        }


        /* CHOOSE COSTUME */

        if (target === "choose-costume") {

            return Object.keys(
                assetSelections.costumes
            ).length > 0;
        }


        /* CHOOSE SOUND */

        if (target === "choose-sound") {

            return Object.keys(
                assetSelections.sounds
            ).length > 0;
        }


        /* CHOOSE BACKDROP */

        if (target === "choose-backdrop") {

            return Object.keys(
                assetSelections.backdrops
            ).length > 0;
        }


        /* STAGE */

        if (target === "select-stage") {

            return selectedSprite === "Stage";
        }


        if (target === "stage-flag") {

            return true;
        }


        return true;
    }


    /* =========================================================
       NEXT BUTTON
       ========================================================= */

    function goNext() {

        const lesson =
            lessons[currentMission];

        if (!lesson)
            return;


        if (!currentStepCompleted()) {

            setStatus(
                "⚠️ Do the highlighted action first, then press NEXT."
            );

            return;
        }


        if (
            currentStep <
            lesson.steps.length - 1
        ) {

            currentStep++;

            /*
               IMPORTANT:
               NEXT ONLY MOVES TO THE NEXT STEP.
               It does NOT click controls automatically.
            */

            loadStep();

            return;
        }


        completeMission();
    }


    /* =========================================================
       COMPLETE MISSION
       ========================================================= */

    function completeMission() {

        completed.add(currentMission);

        updateProgress();


        if (currentMission === 7) {

            setStatus(
                "🏆 AURA PLUS BUILD COMPLETE — YOU ARE A SCRATCH BUILDER!"
            );

            setTimeout(
                () => showScreen("final"),
                500
            );

            return;
        }


        showQuickCheck();
    }


    /* =========================================================
       PROGRESS
       ========================================================= */

    function updateProgress() {

        const percentage =
            (completed.size / 7) * 100;


        const progress =
            $("auraProgress");

        const aura =
            $("tutorialAura");


        if (progress)
            progress.style.width =
                percentage + "%";


        if (aura)
            aura.textContent =
                `${completed.size} / 7`;


        $$(".mission-card")
            .forEach(card => {

                card.classList.toggle(
                    "completed",
                    completed.has(
                        Number(card.dataset.mission)
                    )
                );
            });
    }


    /* =========================================================
       SPRITE SELECTION
       ========================================================= */

    function updateSpriteSelection(updateAssets = true) {

        $$(".sprite-card")
            .forEach(card => {

                card.classList.toggle(
                    "selected",
                    card.dataset.sprite === selectedSprite
                );
            });


        if (selectedTargetEl) {

            selectedTargetEl.textContent =
                selectedSprite.toUpperCase();
        }


        if (updateAssets)
            renderAssetsForSprite();


        renderWorkspace();
    }


    function selectSprite(name) {

        selectedSprite = name;

        updateSpriteSelection();

        setStatus(
            `✓ ${name} selected.`
        );

        highlightTarget();
    }


    /* =========================================================
       ADD SPRITE
       ========================================================= */

    function addStarSprite() {

        if (findSprite("Star")) {

            selectSprite("Star");

            return;
        }


        const list =
            $("spriteList");

        if (!list)
            return;


        const card =
            document.createElement("button");

        card.className =
            "sprite-card";

        card.dataset.sprite =
            "Star";

        card.innerHTML =
            `
            <div class="sprite-thumb portal-thumb">
                ★
            </div>

            <div class="sprite-meta">
                <strong>Star</strong>
                <small>Sprite</small>
            </div>
            `;


        card.addEventListener(
            "click",
            () => selectSprite("Star")
        );


        list.appendChild(card);

        spriteWorkspaces.Star = [];

        selectSprite("Star");

        setStatus(
            "✓ New Star sprite added!"
        );

        highlightTarget();
    }


    /* =========================================================
       EDITOR TABS
       ========================================================= */

    function activateEditorTab(
        type,
        updateStatus = true
    ) {

        currentEditorTab = type;


        $$(".project-tab")
            .forEach(tab => {

                tab.classList.toggle(
                    "active",
                    tab.dataset.editorTab === type
                );
            });


        if (type === "code") {

            if (updateStatus)
                setStatus(
                    "Code tab selected."
                );

            renderPalette(selectedCategory);

        } else {

            openAssetPanel(type);

            if (updateStatus)
                setStatus(
                    `${capitalize(type)} tab selected.`
                );
        }


        highlightTarget();
    }


    /* =========================================================
       ASSETS
       ========================================================= */

    const assetData = {

        costumes: [
            "Costume 1",
            "Costume 2",
            "Glow",
            "Walk 1",
            "Walk 2"
        ],

        sounds: [
            "Pop",
            "Meow",
            "Collect",
            "Jump",
            "Win"
        ],

        backdrops: [
            "Space",
            "Aquarium",
            "School",
            "Blue Sky",
            "Night"
        ]
    };


    function openAssetPanel(type) {

        const assetLibrary =
            $("assetLibrary");

        const backdropLibrary =
            $("backdropLibrary");

        if (type === "backdrops") {

            if (assetLibrary)
                assetLibrary.style.display =
                    "none";

            if (backdropLibrary)
                backdropLibrary.style.display =
                    "block";

            renderBackdropLibrary();

            return;
        }


        if (assetLibrary)
            assetLibrary.style.display =
                "block";

        if (backdropLibrary)
            backdropLibrary.style.display =
                "none";


        renderAssetLibrary(type);
    }


    function renderAssetLibrary(type) {

        const container =
            $("assetLibraryItems");

        if (!container)
            return;


        const title =
            $("assetLibraryTitle");

        if (title)
            title.textContent =
                type.toUpperCase();


        container.innerHTML = "";


        (assetData[type] || [])
            .forEach((name, index) => {

                const item =
                    document.createElement("button");

                item.className =
                    "asset-item";

                item.dataset.asset =
                    name;


                let icon = "🎭";

                if (type === "sounds")
                    icon = "🔊";


                item.innerHTML =
                    `
                    <span>${icon}</span>
                    <strong>${name}</strong>
                    `;


                item.addEventListener(
                    "click",
                    () => {

                        container
                            .querySelectorAll(
                                ".asset-item"
                            )
                            .forEach(
                                x =>
                                    x.classList.remove(
                                        "selected"
                                    )
                            );

                        item.classList.add(
                            "selected"
                        );


                        assetSelections[type][
                            selectedSprite
                        ] = name;


                        setStatus(
                            `✓ ${name} selected.`
                        );


                        highlightTarget();
                    }
                );


                container.appendChild(item);
            });
    }


    function renderBackdropLibrary() {

        const container =
            $("backdropItems");

        if (!container)
            return;


        container.innerHTML = "";


        assetData.backdrops
            .forEach(name => {

                const item =
                    document.createElement("button");

                item.className =
                    "asset-item";

                item.dataset.asset =
                    name;


                const icon =
                    name === "Aquarium"
                        ? "🐠"
                        : "🌄";


                item.innerHTML =
                    `
                    <span>${icon}</span>
                    <strong>${name}</strong>
                    `;


                item.addEventListener(
                    "click",
                    () => {

                        container
                            .querySelectorAll(
                                ".asset-item"
                            )
                            .forEach(
                                x =>
                                    x.classList.remove(
                                        "selected"
                                    )
                            );

                        item.classList.add(
                            "selected"
                        );


                        assetSelections.backdrops[
                            "Stage"
                        ] = name;


                        setStatus(
                            `✓ ${name} backdrop selected.`
                        );


                        highlightTarget();
                    }
                );


                container.appendChild(item);
            });
    }


    function renderAssetsForSprite() {

        if (
            currentEditorTab === "costumes" ||
            currentEditorTab === "sounds"
        ) {

            renderAssetLibrary(
                currentEditorTab
            );
        }
    }


    /* =========================================================
       QUICK CHECK
       ========================================================= */

    function showQuickCheck() {

        const box =
            $("quickCheck");

        if (!box)
            return;


        box.classList.remove("hidden");


        const checks = {

            1: [
                "What is a sprite?",
                "Motion",
                "Events",
                "Looks",
                "Sound",
                "Sprites are characters or objects."
            ],

            2: [
                "Which category moves a sprite?",
                "Motion",
                "Looks",
                "Sound",
                "Events",
                "Motion blocks control movement."
            ],

            3: [
                "Where do you edit costumes?",
                "Motion",
                "Looks",
                "Sound",
                "Events",
                "Use the Costumes tab."
            ],

            4: [
                "Can two sprites have different scripts?",
                "Yes",
                "No",
                "Only AURA",
                "Only SHADOW",
                "Yes — each sprite has its own scripts."
            ],

            5: [
                "What changes the scene behind sprites?",
                "Motion",
                "Backdrop",
                "Sound",
                "Costume",
                "A backdrop changes the Stage scene."
            ],

            6: [
                "Which category controls sounds?",
                "Motion",
                "Looks",
                "Sound",
                "Events",
                "Sound blocks play and control audio."
            ]
        };


        const q =
            checks[currentMission] ||
            checks[1];


        const question =
            $("checkQuestion");

        const result =
            $("checkResult");


        if (question)
            question.textContent =
                q[0];

        if (result)
            result.textContent = "";


        $$(".check-option")
            .forEach((button, index) => {

                button.textContent =
                    q[index + 1];

                button.className =
                    "check-option";


                button.onclick =
                    () => {

                        $$(".check-option")
                            .forEach(
                                x =>
                                    x.classList.remove(
                                        "correct",
                                        "wrong"
                                    )
                            );


                        /*
                           Correct answer is q[3]
                        */

                        if (
                            button.textContent ===
                            q[3]
                        ) {

                            button.classList.add(
                                "correct"
                            );


                            if (result)
                                result.textContent =
                                    "✓ Correct!";


                            setTimeout(
                                () => {

                                    box.classList.add(
                                        "hidden"
                                    );

                                    showScreen(
                                        "tutorial"
                                    );

                                    updateProgress();

                                },
                                600
                            );

                        } else {

                            button.classList.add(
                                "wrong"
                            );


                            if (result)
                                result.textContent =
                                    "Try again — think about what you just learned.";
                        }
                    };
            });
    }


    /* =========================================================
       NAVIGATION SETUP
       ========================================================= */

    function setupNavigation() {

        $("playGameButton")
            ?.addEventListener(
                "click",
                () => {

                    showScreen("game");

                    startGame();
                }
            );


        $("tutorialButton")
            ?.addEventListener(
                "click",
                () => {

                    stopGame();

                    showScreen("tutorial");

                    updateProgress();
                }
            );


        $("exitGame")
            ?.addEventListener(
                "click",
                () => {

                    stopGame();

                    showScreen("intro");
                }
            );


        $("revealButton")
            ?.addEventListener(
                "click",
                () => {

                    showScreen("tutorial");

                    updateProgress();
                }
            );


        $("secretContinue")
            ?.addEventListener(
                "click",
                () => {

                    showScreen("tutorial");

                    updateProgress();
                }
            );


        $("replayButton")
            ?.addEventListener(
                "click",
                () => {

                    completed.clear();

                    updateProgress();

                    showScreen("intro");
                }
            );


        $("backToMissions")
            ?.addEventListener(
                "click",
                () => {

                    stopGame();

                    showScreen("tutorial");

                    updateProgress();
                }
            );


        $$(".mission-card")
            .forEach(card => {

                card.addEventListener(
                    "click",
                    () => {

                        const mission =
                            Number(
                                card.dataset.mission
                            );

                        openMission(mission);
                    }
                );
            });
    }


    /* =========================================================
       SPRITE SETUP
       ========================================================= */

    function setupSprites() {

        $$(".sprite-card")
            .forEach(card => {

                card.addEventListener(
                    "click",
                    () => {

                        const name =
                            card.dataset.sprite;

                        selectSprite(name);
                    }
                );
            });


        $("addSpriteButton")
            ?.addEventListener(
                "click",
                () => {

                    /*
                       Clicking + does NOT silently
                       select a sprite.
                    */

                    addStarSprite();

                    setStatus(
                        "✓ Choose a sprite from the Sprite List."
                    );
                }
            );


        $("chooseSpriteButton")
            ?.addEventListener(
                "click",
                () => {

                    setStatus(
                        "Choose a Sprite: Library • Paint • Upload • Surprise."
                    );
                }
            );
    }


    /* =========================================================
       CATEGORY SETUP
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
                            .forEach(
                                x =>
                                    x.classList.remove(
                                        "active"
                                    )
                            );

                        button.classList.add(
                            "active"
                        );


                        renderPalette(
                            selectedCategory
                        );


                        setStatus(
                            `${capitalize(selectedCategory)} category selected.`
                        );


                        highlightTarget();
                    }
                );
            });
    }


    /* =========================================================
       EDITOR TAB SETUP
       ========================================================= */

    function setupEditorTabs() {

        $$(".project-tab")
            .forEach(tab => {

                tab.addEventListener(
                    "click",
                    () => {

                        activateEditorTab(
                            tab.dataset.editorTab
                        );
                    }
                );
            });
    }


    /* =========================================================
       ASSET BUTTONS
       ========================================================= */

    function setupAssets() {

        $("chooseAssetButton")
            ?.addEventListener(
                "click",
                () => {

                    setStatus(
                        "Choose an asset from the library."
                    );
                }
            );


        $("paintAssetButton")
            ?.addEventListener(
                "click",
                () => {

                    setStatus(
                        "🎨 Paint opens the Scratch Paint Editor."
                    );
                }
            );


        $("uploadAssetButton")
            ?.addEventListener(
                "click",
                () => {

                    setStatus(
                        "⬆️ Upload lets you add your own asset."
                    );
                }
            );


        $("chooseBackdropButton")
            ?.addEventListener(
                "click",
                () => {

                    openAssetPanel(
                        "backdrops"
                    );

                    setStatus(
                        "Choose a backdrop from the library."
                    );

                    highlightTarget();
                }
            );


        $("stageSelectButton")
            ?.addEventListener(
                "click",
                () => {

                    selectedSprite = "Stage";

                    updateSpriteSelection(
                        false
                    );

                    openAssetPanel(
                        "backdrops"
                    );

                    setStatus(
                        "✓ Stage selected. Backdrops are now shown."
                    );

                    highlightTarget();
                }
            );


        $("addBackdropButton")
            ?.addEventListener(
                "click",
                () => {

                    openAssetPanel(
                        "backdrops"
                    );

                    setStatus(
                        "Choose a backdrop from the library."
                    );
                }
            );
    }


    /* =========================================================
       RUN / STAGE BUTTONS
       ========================================================= */

    function setupRunButtons() {

        $("stageFlag")
            ?.addEventListener(
                "click",
                () => {

                    setStatus(
                        "🟢 AURA PLUS test run: collect 5 orbs → survive SHADOW → reach PORTAL."
                    );

                    /*
                       If Mission 7 is on screen,
                       run the actual game.
                    */

                    if (
                        currentMission === 7
                    ) {

                        showScreen("game");

                        startGame();
                    }
                }
            );


        $("lessonFlag")
            ?.addEventListener(
                "click",
                () => {

                    setStatus(
                        "🟢 Project started."
                    );
                }
            );


        $("lessonStop")
            ?.addEventListener(
                "click",
                () => {

                    setStatus(
                        "🛑 Project stopped."
                    );
                }
            );


        $("stageStop")
            ?.addEventListener(
                "click",
                () => {

                    setStatus(
                        "🛑 Stage stopped."
                    );
                }
            );
    }


    /* =========================================================
       NEXT BUTTON
       ========================================================= */

    function setupLessonButton() {

        $("nextLessonStep")
            ?.addEventListener(
                "click",
                goNext
            );
    }


    /* =========================================================
       KEYBOARD CONTROLS
       ========================================================= */

    window.addEventListener(
        "keydown",
        (event) => {

            const allowed =
                [
                    "ArrowUp",
                    "ArrowDown",
                    "ArrowLeft",
                    "ArrowRight"
                ].includes(event.key) ||
                event.key === "w" ||
                event.key === "a" ||
                event.key === "s" ||
                event.key === "d";


            if (allowed) {

                event.preventDefault();

                keys[event.key] = true;
            }
        }
    );


    window.addEventListener(
        "keyup",
        (event) => {

            keys[event.key] = false;
        }
    );


    /* =========================================================
       INITIALIZE
       ========================================================= */

    function initialize() {

        /*
           Everything starts AFTER the DOM exists.
           This prevents null element crashes.
        */

        setupNavigation();

        setupCategories();

        setupEditorTabs();

        setupSprites();

        setupAssets();

        setupRunButtons();

        setupLessonButton();


        /*
           Default sprite
        */

        selectedSprite = "Aura";

        selectedCategory = "motion";

        currentEditorTab = "code";


        /*
           Default active category
        */

        const firstCategory =
            document.querySelector(
                `.block-category[data-category="motion"]`
            );

        if (firstCategory)
            firstCategory.classList.add(
                "active"
            );


        /*
           Default selected sprite
        */

        updateSpriteSelection(false);


        /*
           Default palette
        */

        renderPalette("motion");

        renderWorkspace();

        updateProgress();


        /*
           Start at intro
        */

        showScreen("intro");
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
            initialize
        );

    } else {

        initialize();
    }

})();
