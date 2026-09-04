document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    /* =========================================================
       SCREEN SYSTEM
    ========================================================= */

    const screens = {
        intro: document.getElementById("introScreen"),
        game: document.getElementById("gameScreen"),
        secret: document.getElementById("secretScreen"),
        tutorial: document.getElementById("tutorialScreen"),
        lesson: document.getElementById("lessonScreen"),
        final: document.getElementById("finalScreen")
    };

    function showScreen(name) {
        Object.entries(screens).forEach(([key, el]) => {
            if (!el) return;

            el.classList.toggle("hidden", key !== name);
            el.classList.toggle("active", key === name);
        });

        document.body.dataset.screen = name;
    }


    /* =========================================================
       AURA PLUS GAME
    ========================================================= */

    const gameWorld = document.getElementById("gameWorld");
    const player = document.getElementById("player");
    const shadow = document.getElementById("shadow");
    const portal = document.getElementById("portal");

    const auraScore = document.getElementById("auraScore");
    const livesDisplay = document.getElementById("lives");
    const gameMessage = document.getElementById("gameMessage");
    const gameObjective = document.getElementById("gameObjective");

    let gameRunning = false;
    let gameFrame = 0;

    let score = 0;
    let lives = 3;

    let playerX = 70;
    let playerY = 100;

    let shadowX = 500;
    let shadowY = 180;

    let lastHitTime = 0;

    const keys = Object.create(null);

    const orbPositions = [
        ["18%", "25%"],
        ["40%", "68%"],
        ["68%", "25%"],
        ["78%", "65%"],
        ["48%", "45%"]
    ];

    if (gameWorld) {
        gameWorld.setAttribute("tabindex", "0");
        gameWorld.style.touchAction = "none";
    }


    function startGame() {
        if (!gameWorld || !player) return;

        gameRunning = true;

        score = 0;
        lives = 3;
        lastHitTime = 0;

        const width = gameWorld.clientWidth;
        const height = gameWorld.clientHeight;

        playerX = 70;

        playerY = Math.max(
            70,
            Math.min(120, height - 100)
        );

        shadowX = Math.max(
            260,
            width - 180
        );

        shadowY = Math.max(
            120,
            Math.min(220, height - 180)
        );

        auraScore.textContent = score;
        livesDisplay.textContent = lives;

        gameMessage?.classList.add("hidden");
        portal?.classList.remove("unlocked");

        if (gameObjective) {
            gameObjective.textContent =
                "COLLECT THE AURA ORBS!";
        }

        document.querySelectorAll(".aura-orb").forEach((orb, i) => {
            orb.style.display = "block";

            if (orbPositions[i]) {
                orb.style.left = orbPositions[i][0];
                orb.style.top = orbPositions[i][1];
            }
        });

        updatePlayer();
        updateShadow();

        cancelAnimationFrame(gameFrame);
        gameFrame = requestAnimationFrame(gameLoop);

        setTimeout(() => {
            gameWorld.focus();
        }, 50);
    }


    function stopGame() {
        gameRunning = false;

        cancelAnimationFrame(gameFrame);

        Object.keys(keys).forEach(key => {
            delete keys[key];
        });
    }


    function gameLoop() {
        if (!gameRunning) return;

        movePlayer();
        keepPlayerInside();
        updatePlayer();
        updateShadow();
        collectOrbs();
        checkShadowCollision();
        checkPortal();

        gameFrame = requestAnimationFrame(gameLoop);
    }


    function movePlayer() {
        const speed = 5;

        if (keys.ArrowLeft || keys.a) playerX -= speed;
        if (keys.ArrowRight || keys.d) playerX += speed;
        if (keys.ArrowUp || keys.w) playerY -= speed;
        if (keys.ArrowDown || keys.s) playerY += speed;
    }


    function keepPlayerInside() {
        if (!gameWorld || !player) return;

        const maxX = Math.max(
            0,
            gameWorld.clientWidth - player.offsetWidth
        );

        const maxY = Math.max(
            0,
            gameWorld.clientHeight - player.offsetHeight
        );

        playerX = Math.max(0, Math.min(maxX, playerX));
        playerY = Math.max(0, Math.min(maxY, playerY));
    }


    function updatePlayer() {
        if (!player) return;

        player.style.left = `${playerX}px`;
        player.style.top = `${playerY}px`;
    }


    function updateShadow() {
        if (!shadow) return;

        const dx = playerX - shadowX;
        const dy = playerY - shadowY;

        const distance = Math.hypot(dx, dy);

        if (distance > 5) {
            const speed = 0.45;

            shadowX += (dx / distance) * speed;
            shadowY += (dy / distance) * speed;
        }

        shadow.style.left = `${shadowX}px`;
        shadow.style.top = `${shadowY}px`;
    }


    function touching(a, b) {
        if (!a || !b) return false;

        const r1 = a.getBoundingClientRect();
        const r2 = b.getBoundingClientRect();

        return !(
            r1.right < r2.left ||
            r1.left > r2.right ||
            r1.bottom < r2.top ||
            r1.top > r2.bottom
        );
    }


    function collectOrbs() {
        document.querySelectorAll(".aura-orb").forEach(orb => {

            if (
                orb.style.display !== "none" &&
                touching(player, orb)
            ) {
                orb.style.display = "none";

                score += Number(
                    orb.dataset.value || 10
                );

                auraScore.textContent = score;

                if (score >= 50) {
                    portal?.classList.add("unlocked");

                    if (gameObjective) {
                        gameObjective.textContent =
                            "⚡ PORTAL UNLOCKED — REACH IT!";
                    }
                }
            }
        });
    }


    function checkShadowCollision() {
        if (
            !touching(player, shadow) ||
            Date.now() - lastHitTime < 1200
        ) {
            return;
        }

        lastHitTime = Date.now();

        lives--;
        livesDisplay.textContent = lives;

        playerX = 70;
        playerY = 100;

        updatePlayer();

        if (lives <= 0) {
            stopGame();

            showGameMessage(
                "GAME OVER 😵<br><small>Press EXIT and play again.</small>"
            );
        }
    }


    function checkPortal() {
        if (
            score >= 50 &&
            touching(player, portal)
        ) {
            stopGame();
            showScreen("secret");
        }
    }


    function showGameMessage(message) {
        if (!gameMessage) return;

        gameMessage.innerHTML = message;
        gameMessage.classList.remove("hidden");
    }


    /* =========================================================
       KEYBOARD
    ========================================================= */

    const gameKeys = new Set([
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
        "w",
        "a",
        "s",
        "d",
        "W",
        "A",
        "S",
        "D"
    ]);


    window.addEventListener("keydown", event => {
        if (!gameRunning) return;

        if (gameKeys.has(event.key)) {
            event.preventDefault();

            const key =
                event.key.length === 1
                    ? event.key.toLowerCase()
                    : event.key;

            keys[key] = true;
        }
    }, { passive: false });


    window.addEventListener("keyup", event => {
        const key =
            event.key.length === 1
                ? event.key.toLowerCase()
                : event.key;

        delete keys[key];
    });


    window.addEventListener("blur", () => {
        Object.keys(keys).forEach(
            key => delete keys[key]
        );
    });


    /* =========================================================
       SMARTBOARD / TOUCH
    ========================================================= */

    gameWorld?.addEventListener("pointerdown", event => {
        if (!gameRunning) return;

        if (
            event.target === player ||
            event.target.closest?.("#gameObjective")
        ) {
            return;
        }

        event.preventDefault();

        const rect =
            gameWorld.getBoundingClientRect();

        playerX =
            event.clientX -
            rect.left -
            player.offsetWidth / 2;

        playerY =
            event.clientY -
            rect.top -
            player.offsetHeight / 2;

        keepPlayerInside();
        updatePlayer();
    }, { passive: false });


    /* =========================================================
       NAVIGATION
    ========================================================= */

    document
        .getElementById("playGameButton")
        ?.addEventListener("click", () => {
            showScreen("game");

            requestAnimationFrame(startGame);
        });


    document
        .getElementById("tutorialButton")
        ?.addEventListener("click", () => {
            showScreen("tutorial");
        });


    document
        .getElementById("exitGame")
        ?.addEventListener("click", () => {
            stopGame();
            showScreen("intro");
        });


    document
        .getElementById("revealButton")
        ?.addEventListener("click", () => {
            showScreen("tutorial");
        });


    document
        .getElementById("replayButton")
        ?.addEventListener("click", () => {
            showScreen("game");

            requestAnimationFrame(startGame);
        });


    /* =========================================================
       LESSON DATA
       
       ONE SIMPLE FLOW:
       READ → DO THE HIGHLIGHTED ACTION → NEXT
    ========================================================= */

    const lessons = {

        1: {
            title: "Working with Sprites",
            description:
                "Learn how sprites are added, selected and programmed.",
            tip:
                "A sprite is a character or object that you can program.",
            steps: [

                {
                    title: "Select AURA",
                    action:
                        "Click AURA in the Sprite List on the right.",
                    why:
                        "The selected sprite is the one whose code, costumes and sounds you edit.",
                    target: "sprite:Aura"
                },

                {
                    title: "Select SHADOW",
                    action:
                        "Click SHADOW in the Sprite List.",
                    why:
                        "Different sprites can have different scripts.",
                    target: "sprite:Shadow"
                },

                {
                    title: "Add a Sprite",
                    action:
                        "Click ＋ Choose a Sprite.",
                    why:
                        "A project can contain many sprites.",
                    target: "chooseSprite"
                },

                {
                    title: "Remember",
                    action:
                        "Click AURA again. You are now ready to program AURA.",
                    why:
                        "Always check which sprite is selected before writing code.",
                    target: "sprite:Aura"
                }
            ]
        },


        2: {
            title: "Motion — Make AURA Move",
            description:
                "Use blue Motion blocks to control position and movement.",
            tip:
                "X controls left/right. Y controls up/down.",
            steps: [

                {
                    title: "Green Flag",
                    action:
                        "Click Events in the Blocks column, then click 'when green flag clicked'.",
                    why:
                        "Events tell Scratch when a script should start.",
                    block:
                        "when green flag clicked",
                    category:
                        "events"
                },

                {
                    title: "Move AURA",
                    action:
                        "Click Motion, then click 'move 10 steps'.",
                    why:
                        "The blue Motion block moves the selected sprite.",
                    block:
                        "move 10 steps",
                    category:
                        "motion"
                },

                {
                    title: "Change X",
                    action:
                        "Click Motion, then click 'change x by 10'.",
                    why:
                        "Changing X moves a sprite left or right.",
                    block:
                        "change x by 10",
                    category:
                        "motion"
                },

                {
                    title: "Change Y",
                    action:
                        "Click Motion, then click 'change y by 10'.",
                    why:
                        "Changing Y moves a sprite up or down.",
                    block:
                        "change y by 10",
                    category:
                        "motion"
                }
            ]
        },


        3: {
            title: "Costumes — Change AURA's Look",
            description:
                "Learn how one sprite can have many different appearances.",
            tip:
                "A sprite is the object. Costumes are its different looks.",
            steps: [

                {
                    title: "Open Costumes",
                    action:
                        "Click the Costumes tab at the top of the Scratch editor.",
                    why:
                        "Costumes are the different appearances of a sprite.",
                    target:
                        "tab:costumes"
                },

                {
                    title: "Next Costume",
                    action:
                        "Click Code, choose Looks, then click 'next costume'.",
                    why:
                        "Next costume changes the sprite to the next appearance.",
                    block:
                        "next costume",
                    category:
                        "looks"
                },

                {
                    title: "Choose a Costume",
                    action:
                        "Click the Costumes tab again and look at the costume area.",
                    why:
                        "One sprite can contain multiple costumes.",
                    target:
                        "tab:costumes"
                },

                {
                    title: "Back to Code",
                    action:
                        "Click Code to return to the programming area.",
                    why:
                        "Code controls what the sprite does.",
                    target:
                        "tab:code"
                }
            ]
        },


        4: {
            title: "Two Sprites — Two Scripts",
            description:
                "Give different sprites their own instructions.",
            tip:
                "Every sprite can have its own scripts.",
            steps: [

                {
                    title: "Select AURA",
                    action:
                        "Click AURA in the Sprite List.",
                    why:
                        "You are now editing AURA's scripts.",
                    target:
                        "sprite:Aura"
                },

                {
                    title: "Give AURA an Event",
                    action:
                        "Click Events and choose 'when green flag clicked'.",
                    why:
                        "The green flag can start AURA's script.",
                    block:
                        "when green flag clicked",
                    category:
                        "events"
                },

                {
                    title: "Select SHADOW",
                    action:
                        "Click SHADOW in the Sprite List.",
                    why:
                        "Selecting another sprite switches to that sprite's scripts.",
                    target:
                        "sprite:Shadow"
                },

                {
                    title: "Give SHADOW Its Own Code",
                    action:
                        "Click Looks and choose 'say [Hello!] for 2 seconds'.",
                    why:
                        "SHADOW can have completely different instructions from AURA.",
                    block:
                        "say [Hello!] for 2 seconds",
                    category:
                        "looks"
                }
            ]
        },


        5: {
            title: "Backdrops — Build the Game World",
            description:
                "Learn how the Stage uses backdrops.",
            tip:
                "Sprites live on the Stage. The Stage uses backdrops.",
            steps: [

                {
                    title: "Select the Stage",
                    action:
                        "Click ▣ Select Stage.",
                    why:
                        "Backdrops belong to the Stage, not to sprites.",
                    target:
                        "stage"
                },

                {
                    title: "Open Backdrop",
                    action:
                        "Click the Backdrops area on the right.",
                    why:
                        "The Stage can have multiple backdrops.",
                    target:
                        "backdrops"
                },

                {
                    title: "Switch Backdrop",
                    action:
                        "Click Code, choose Looks, then click 'switch backdrop to [backdrop1]'.",
                    why:
                        "Looks blocks can change the Stage backdrop.",
                    block:
                        "switch backdrop to [backdrop1]",
                    category:
                        "looks"
                },

                {
                    title: "Next Backdrop",
                    action:
                        "Click Looks and choose 'next backdrop'.",
                    why:
                        "Next backdrop moves to the next backdrop in the Stage list.",
                    block:
                        "next backdrop",
                    category:
                        "looks"
                }
            ]
        },


        6: {
            title: "Sounds — Make It Feel Alive",
            description:
                "Add sound and understand how sound blocks work.",
            tip:
                "Sound gives feedback when something happens in a game.",
            steps: [

                {
                    title: "Open Sounds",
                    action:
                        "Click the Sounds tab at the top.",
                    why:
                        "Sounds are managed separately from code and costumes.",
                    target:
                        "tab:sounds"
                },

                {
                    title: "Start a Sound",
                    action:
                        "Click Code, choose Sound, then click 'start sound [Meow]'.",
                    why:
                        "Start sound begins the audio and lets the script continue.",
                    block:
                        "start sound [Meow]",
                    category:
                        "sound"
                },

                {
                    title: "Play Until Done",
                    action:
                        "Click Sound and choose 'play sound [Meow] until done'.",
                    why:
                        "This version waits for the sound to finish.",
                    block:
                        "play sound [Meow] until done",
                    category:
                        "sound"
                },

                {
                    title: "Game Feedback",
                    action:
                        "Click Sound and choose 'start sound [Meow]' once more.",
                    why:
                        "Games use sound for collecting, danger and victory feedback.",
                    block:
                        "start sound [Meow]",
                    category:
                        "sound"
                }
            ]
        },


        /* =====================================================
           MISSION 7 — ACTUAL AURA PLUS
        ===================================================== */

        7: {
            title: "AURA PLUS — BUILD THE ACTUAL GAME",
            description:
                "Now combine everything you learned to understand the exact game you played.",
            tip:
                "The final game loop is: COLLECT → SURVIVE → UNLOCK → ESCAPE.",
            finalGame: true,

            steps: [

                {
                    title: "Build the World",
                    action:
                        "Check the Sprite List: AURA, SHADOW, Orb and Portal. Then select the Stage.",
                    why:
                        "A game is made from sprites plus a Stage backdrop.",
                    target:
                        "gameWorld"
                },

                {
                    title: "Start AURA",
                    action:
                        "Select AURA, choose Events, then add 'when green flag clicked'.",
                    why:
                        "The green flag starts the game.",
                    block:
                        "when green flag clicked",
                    category:
                        "events"
                },

                {
                    title: "Set AURA's Position",
                    action:
                        "Choose Motion and add 'go to x: 0 y: 0'.",
                    why:
                        "A predictable starting position makes every game run consistent.",
                    block:
                        "go to x: 0 y: 0",
                    category:
                        "motion"
                },

                {
                    title: "Create the Game Loop",
                    action:
                        "Choose Control and add 'forever'.",
                    why:
                        "Forever repeats the game behaviour continuously.",
                    block:
                        "forever",
                    category:
                        "control"
                },

                {
                    title: "Detect an Orb",
                    action:
                        "Choose Control and add 'if < > then'.",
                    why:
                        "IF lets the game perform an action only when a condition is true.",
                    block:
                        "if < > then",
                    category:
                        "control"
                },

                {
                    title: "Sense Touch",
                    action:
                        "Choose Sensing and add 'touching [mouse-pointer]?'.",
                    why:
                        "Sensing lets Scratch check whether something is touching something else.",
                    block:
                        "touching [mouse-pointer]?",
                    category:
                        "sensing"
                },

                {
                    title: "Count Aura",
                    action:
                        "Choose Variables and add 'set [my variable] to 0'.",
                    why:
                        "Variables remember changing information such as the Aura Score.",
                    block:
                        "set [my variable] to 0",
                    category:
                        "variables"
                },

                {
                    title: "Increase the Score",
                    action:
                        "Choose Variables and add 'change [my variable] by 1'.",
                    why:
                        "Changing a variable updates the score when an orb is collected.",
                    block:
                        "change [my variable] by 1",
                    category:
                        "variables"
                },

                {
                    title: "Make SHADOW Dangerous",
                    action:
                        "Select SHADOW and choose Control → 'forever'.",
                    why:
                        "An enemy can continuously perform actions.",
                    block:
                        "forever",
                    category:
                        "control"
                },

                {
                    title: "Unlock the Portal",
                    action:
                        "Choose Operators and click '1 > 1'.",
                    why:
                        "Operators compare values. The real game checks whether Aura reaches 50.",
                    block:
                        "1 > 1",
                    category:
                        "operators"
                },

                {
                    title: "Add Game Sound",
                    action:
                        "Choose Sound and add 'start sound [Meow]'.",
                    why:
                        "Sound tells the player that something happened.",
                    block:
                        "start sound [Meow]",
                    category:
                        "sound"
                },

                {
                    title: "FINAL RUN",
                    action:
                        "Click the green flag in the Scratch editor and explain the game loop: collect 5 orbs → 50 Aura → portal unlocks → escape SHADOW.",
                    why:
                        "You have now connected Sprites, Motion, Control, Sensing, Variables, Looks and Sound.",
                    target:
                        "flag"
                }
            ]
        }
    };


    /* =========================================================
       SCRATCH PALETTE
    ========================================================= */

    const paletteBlocks = {

        motion: [
            "move 10 steps",
            "turn ↻ 15 degrees",
            "turn ↺ 15 degrees",
            "go to random position",
            "go to x: 0 y: 0",
            "change x by 10",
            "set x to 0",
            "change y by 10",
            "set y to 0"
        ],

        looks: [
            "say [Hello!] for 2 seconds",
            "say [Hello!]",
            "think [Hmm...] for 2 seconds",
            "switch costume to [costume2]",
            "next costume",
            "switch backdrop to [backdrop1]",
            "next backdrop"
        ],

        sound: [
            "start sound [Meow]",
            "play sound [Meow] until done",
            "stop all sounds",
            "change volume by -10",
            "set volume to 100%"
        ],

        events: [
            "when green flag clicked",
            "when [space] key pressed",
            "when this sprite clicked",
            "broadcast [message1]",
            "broadcast [message1] and wait"
        ],

        control: [
            "wait 1 seconds",
            "repeat 10",
            "forever",
            "if < > then",
            "if < > then else",
            "wait until < >",
            "stop [all]"
        ],

        sensing: [
            "touching [mouse-pointer]?",
            "touching color [ ]?",
            "ask [What's your name?] and wait",
            "key [space] pressed?",
            "mouse down?",
            "distance to [mouse-pointer]"
        ],

        operators: [
            "pick random 1 to 10",
            "join [hello] [world]",
            "1 + 1",
            "1 > 1",
            "1 = 1",
            "1 < 1"
        ],

        variables: [
            "set [my variable] to 0",
            "change [my variable] by 1",
            "show variable [my variable]",
            "hide variable [my variable]"
        ],

        myblocks: []
    };


    /* =========================================================
       LESSON STATE
    ========================================================= */

    let currentMission = 1;
    let currentStep = 0;

    let completedMissions = new Set();

    let selectedSprite = "Aura";


    /* =========================================================
       ELEMENTS
    ========================================================= */

    const lessonTitle =
        document.getElementById("lessonTitle");

    const lessonDescription =
        document.getElementById("lessonDescription");

    const teacherTip =
        document.getElementById("teacherTip");

    const lessonNumber =
        document.getElementById("lessonNumber");

    const lessonStep =
        document.getElementById("lessonStep");

    const paletteCategory =
        document.getElementById("paletteCategory");

    const blockPalette =
        document.getElementById("blockPalette");

    const lessonBlocks =
        document.getElementById("lessonBlocks");

    const workspaceInstruction =
        document.getElementById("workspaceInstruction");

    const blockCount =
        document.getElementById("blockCount");

    const nextButton =
        document.getElementById("nextLessonStep");

    const stepStatus =
        document.getElementById("stepStatus");

    const auraProgress =
        document.getElementById("auraProgress");

    const tutorialAura =
        document.getElementById("tutorialAura");

    const quickCheck =
        document.getElementById("quickCheck");


    /* =========================================================
       HELPERS
    ========================================================= */

    function getLesson() {
        return lessons[currentMission];
    }


    function getStep() {
        return getLesson()?.steps?.[currentStep];
    }


    function normalize(text) {
        return String(text)
            .toLowerCase()
            .replace(/\s+/g, " ")
            .trim();
    }


    function updateBlockCount() {
        if (!blockCount || !lessonBlocks) return;

        const count = lessonBlocks.children.length;

        blockCount.textContent =
            `${count} block${count === 1 ? "" : "s"}`;
    }


    function updateProgress() {
        const total =
            Object.keys(lessons).length;

        const done =
            completedMissions.size;

        const percent =
            (done / total) * 100;

        if (auraProgress) {
            auraProgress.style.width =
                `${percent}%`;
        }

        if (tutorialAura) {
            tutorialAura.textContent =
                `${done} / ${total}`;
        }
    }


    /* =========================================================
       OPEN LESSON
    ========================================================= */

    function openLesson(mission) {
        if (!lessons[mission]) return;

        currentMission = mission;
        currentStep = 0;

        if (lessonBlocks) {
            lessonBlocks.innerHTML = "";
        }

        showScreen("lesson");

        renderLesson();
    }


    document
        .querySelectorAll(".mission-card")
        .forEach(card => {

            card.addEventListener("click", () => {

                openLesson(
                    Number(card.dataset.mission)
                );

            });

        });


    /* =========================================================
       RENDER LESSON
    ========================================================= */

    function renderLesson() {

        const lesson = getLesson();
        const step = getStep();

        if (!lesson || !step) return;

        lessonTitle.textContent =
            lesson.title;

        lessonDescription.textContent =
            lesson.description;

        teacherTip.textContent =
            lesson.tip;

        lessonNumber.textContent =
            currentMission;

        lessonStep.textContent =
            `${currentStep + 1}/${lesson.steps.length}`;

        if (lessonBlocks) {
            lessonBlocks.innerHTML = "";
        }

        updateBlockCount();

        renderStep();

        renderMission7Preview();
    }


    /* =========================================================
       SIMPLE ONE-BUTTON STEP SYSTEM
    ========================================================= */

    function renderStep() {

        const lesson = getLesson();
        const step = getStep();

        if (!lesson || !step) return;

        clearHighlights();

        if (step.block) {

            const category =
                step.category || "events";

            renderPalette(category);

            highlightBlock(step.block);

            workspaceInstruction.textContent =
                `👉 ${step.action}`;

        } else {

            renderPalette(
                lesson.finalGame
                    ? "events"
                    : lesson.steps[currentStep]?.category || "events"
            );

            workspaceInstruction.textContent =
                `👉 ${step.action}`;
        }

        if (stepStatus) {
            stepStatus.textContent =
                `💡 ${step.why}`;
        }

        if (nextButton) {
            nextButton.textContent =
                currentStep <
                lesson.steps.length - 1
                    ? "NEXT →"
                    : "COMPLETE MISSION →";
        }

        updateBlockCount();
    }


    /* =========================================================
       PALETTE
    ========================================================= */

    function renderPalette(category) {

        if (!blockPalette) return;

        blockPalette.innerHTML = "";

        paletteCategory.textContent =
            category.charAt(0).toUpperCase() +
            category.slice(1);

        document
            .querySelectorAll(".block-category")
            .forEach(button => {

                button.classList.toggle(
                    "active",
                    button.dataset.category === category
                );

            });

        (
            paletteBlocks[category] || []
        ).forEach(text => {

            const block =
                createPaletteBlock(
                    text,
                    category
                );

            blockPalette.appendChild(block);

        });
    }


    function createScratchBlock(
        text,
        category,
        workspace = false
    ) {

        const block =
            document.createElement("div");

        block.className =
            `scratch-block ${category}`;

        block.textContent = text;

        block.dataset.text = text;
        block.dataset.category = category;

        if (workspace) {
            block.classList.add(
                "workspace-block"
            );

            block.style.cursor = "default";
        }

        return block;
    }


    function createPaletteBlock(
        text,
        category
    ) {

        const block =
            createScratchBlock(
                text,
                category
            );

        block.addEventListener(
            "click",
            () => {

                addBlockToWorkspace(
                    text,
                    category
                );

            }
        );

        return block;
    }


    /* =========================================================
       ADD BLOCK
    ========================================================= */

    function addBlockToWorkspace(
        text,
        category
    ) {

        const step = getStep();

        if (!step?.block) {

            workspaceInstruction.textContent =
                "ℹ️ This step is about the Scratch interface. Follow the highlighted control.";

            return;
        }

        if (
            normalize(text) !==
            normalize(step.block)
        ) {

            workspaceInstruction.textContent =
                `❌ Not that block. Look for "${step.block}".`;

            highlightBlock(step.block);

            return;
        }

        if (lessonBlocks) {

            lessonBlocks.appendChild(
                createScratchBlock(
                    text,
                    category,
                    true
                )
            );

        }

        clearHighlights();

        workspaceInstruction.textContent =
            `✅ Correct! You added "${text}".`;

        if (stepStatus) {
            stepStatus.textContent =
                "Great! Press NEXT → to continue.";
        }

        if (nextButton) {
            nextButton.disabled = false;
        }

        updateBlockCount();
    }


    /* =========================================================
       HIGHLIGHTING
    ========================================================= */

    function clearHighlights() {

        document
            .querySelectorAll(".aura-highlight")
            .forEach(el => {

                el.classList.remove(
                    "aura-highlight"
                );

                el.style.outline = "";
                el.style.outlineOffset = "";
            });

        document
            .querySelectorAll(
                "#blockPalette .scratch-block"
            )
            .forEach(block => {

                block.style.outline = "";
                block.style.outlineOffset = "";

            });
    }


    function highlightBlock(text) {

        document
            .querySelectorAll(
                "#blockPalette .scratch-block"
            )
            .forEach(block => {

                if (
                    normalize(block.dataset.text) ===
                    normalize(text)
                ) {

                    block.style.outline =
                        "4px solid #facc15";

                    block.style.outlineOffset =
                        "3px";

                    block.scrollIntoView({
                        behavior: "smooth",
                        block: "nearest"
                    });
                }
            });
    }


    function highlightElement(element) {

        if (!element) return;

        element.classList.add(
            "aura-highlight"
        );

        element.style.outline =
            "4px solid #facc15";

        element.style.outlineOffset =
            "3px";

        element.scrollIntoView?.({
            behavior: "smooth",
            block: "nearest"
        });
    }


    /* =========================================================
       INTERFACE TARGETS
    ========================================================= */

    function handleInterfaceTarget(target) {

        if (!target) return;

        if (target === "stage") {

            highlightElement(
                document.getElementById(
                    "stageSelectButton"
                )
            );

            return;
        }

        if (target === "chooseSprite") {

            highlightElement(
                document.getElementById(
                    "chooseSpriteButton"
                )
            );

            return;
        }

        if (target === "backdrops") {

            highlightElement(
                document.getElementById(
                    "backdropLibrary"
                )
            );

            return;
        }

        if (target === "gameWorld") {

            highlightElement(
                document.getElementById(
                    "previewStage"
                )
            );

            return;
        }

        if (target === "flag") {

            highlightElement(
                document.getElementById(
                    "lessonFlag"
                )
            );

            highlightElement(
                document.getElementById(
                    "stageFlag"
                )
            );

            return;
        }

        if (target.startsWith("sprite:")) {

            const name =
                target.split(":")[1];

            document
                .querySelectorAll(".sprite-card")
                .forEach(card => {

                    if (
                        normalize(
                            card.dataset.sprite
                        ) ===
                        normalize(name)
                    ) {

                        highlightElement(card);
                    }

                });

            return;
        }

        if (target.startsWith("tab:")) {

            const tab =
                target.split(":")[1];

            document
                .querySelectorAll(".project-tab")
                .forEach(button => {

                    if (
                        button.dataset.editorTab ===
                        tab
                    ) {

                        highlightElement(button);
                    }

                });
        }
    }


    /* =========================================================
       NEXT BUTTON
    ========================================================= */

    nextButton?.addEventListener(
        "click",
        () => {

            const lesson = getLesson();
            const step = getStep();

            if (!lesson || !step) return;


            /* -------------------------------------------------
               BLOCK STEP
            ------------------------------------------------- */

            if (step.block) {

                const blocks =
                    lessonBlocks
                        ? [
                            ...lessonBlocks.children
                        ]
                        : [];

                const correctBlock =
                    blocks.some(block =>
                        normalize(
                            block.dataset.text
                        ) ===
                        normalize(step.block)
                    );

                if (!correctBlock) {

                    workspaceInstruction.textContent =
                        `🧩 First add "${step.block}" to the script.`;

                    highlightBlock(
                        step.block
                    );

                    return;
                }
            }


            /* -------------------------------------------------
               INTERFACE STEP
            ------------------------------------------------- */

            if (step.target) {

                clearHighlights();

                handleInterfaceTarget(
                    step.target
                );
            }


            /* -------------------------------------------------
               NEXT STEP
            ------------------------------------------------- */

            if (
                currentStep <
                lesson.steps.length - 1
            ) {

                currentStep++;

                if (lessonBlocks) {
                    lessonBlocks.innerHTML = "";
                }

                updateBlockCount();

                renderStep();

                renderMission7Preview();

                return;
            }


            /* -------------------------------------------------
               MISSION COMPLETE
            ------------------------------------------------- */

            completeMission();
        }
    );


    /* =========================================================
       CATEGORY BUTTONS
    ========================================================= */

    document
        .querySelectorAll(".block-category")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    renderPalette(
                        button.dataset.category
                    );

                    const step =
                        getStep();

                    if (
                        step?.block &&
                        step.category ===
                        button.dataset.category
                    ) {

                        highlightBlock(
                            step.block
                        );
                    }

                }
            );

        });


    /* =========================================================
       SCRATCH PROJECT TABS
    ========================================================= */

    document
        .querySelectorAll(".project-tab")
        .forEach(tab => {

            tab.addEventListener(
                "click",
                () => {

                    document
                        .querySelectorAll(
                            ".project-tab"
                        )
                        .forEach(t =>
                            t.classList.remove(
                                "active"
                            )
                        );

                    tab.classList.add("active");

                    const type =
                        tab.dataset.editorTab;

                    if (
                        type === "code"
                    ) {

                        renderPalette(
                            getStep()?.category ||
                            "events"
                        );

                    } else {

                        clearHighlights();

                        workspaceInstruction.textContent =
                            type === "costumes"
                                ? "🎭 You are viewing COSTUMES."
                                : "🔊 You are viewing SOUNDS.";
                    }

                }
            );

        });


    /* =========================================================
       SPRITE SELECTION
    ========================================================= */

    document
        .querySelectorAll(".sprite-card")
        .forEach(card => {

            card.addEventListener(
                "click",
                () => {

                    selectedSprite =
                        card.dataset.sprite ||
                        "Aura";

                    document
                        .querySelectorAll(
                            ".sprite-card"
                        )
                        .forEach(c =>
                            c.classList.remove(
                                "selected"
                            )
                        );

                    card.classList.add(
                        "selected"
                    );

                    const selectedTarget =
                        document.getElementById(
                            "selectedTarget"
                        );

                    if (selectedTarget) {
                        selectedTarget.textContent =
                            selectedSprite.toUpperCase();
                    }

                    clearHighlights();

                    workspaceInstruction.textContent =
                        `🎯 ${selectedSprite} selected.`;

                }
            );

        });


    /* =========================================================
       CHOOSE SPRITE
    ========================================================= */

    document
        .getElementById("chooseSpriteButton")
        ?.addEventListener(
            "click",
            () => {

                const names = [
                    "Star",
                    "Coin",
                    "Robot",
                    "Cat",
                    "Rocket"
                ];

                const name =
                    names[
                        Math.floor(
                            Math.random() *
                            names.length
                        )
                    ];

                const list =
                    document.getElementById(
                        "spriteList"
                    );

                if (!list) return;

                const card =
                    document.createElement(
                        "button"
                    );

                card.className =
                    "sprite-card";

                card.dataset.sprite =
                    name;

                card.innerHTML = `
                    <span class="sprite-thumb">
                        ✦
                    </span>
                    <span>
                        <b>${name}</b>
                        <small>Sprite</small>
                    </span>
                `;

                list.appendChild(card);

                card.addEventListener(
                    "click",
                    () => {

                        document
                            .querySelectorAll(
                                ".sprite-card"
                            )
                            .forEach(c =>
                                c.classList.remove(
                                    "selected"
                                )
                            );

                        card.classList.add(
                            "selected"
                        );

                        selectedSprite =
                            name;

                    }
                );

                workspaceInstruction.textContent =
                    `✨ ${name} was added to the Sprite List.`;
            }
        );


    /* =========================================================
       STAGE
    ========================================================= */

    document
        .getElementById("stageSelectButton")
        ?.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(
                        ".sprite-card"
                    )
                    .forEach(c =>
                        c.classList.remove(
                            "selected"
                        )
                    );

                workspaceInstruction.textContent =
                    "🌄 Stage selected — this is where Backdrops belong.";

                renderPalette("looks");
            }
        );


    /* =========================================================
       BACKDROP BUTTON
    ========================================================= */

    document
        .getElementById("chooseBackdropButton")
        ?.addEventListener(
            "click",
            () => {

                workspaceInstruction.textContent =
                    "🌄 Backdrop chosen! The Stage now has a background.";

            }
        );


    /* =========================================================
       COSTUME / SOUND ASSET BUTTONS
    ========================================================= */

    document
        .getElementById("chooseAssetButton")
        ?.addEventListener(
            "click",
            () => {

                workspaceInstruction.textContent =
                    "🎨 Asset chooser opened — choose an asset for the selected sprite.";

            }
        );


    document
        .getElementById("assetLibraryAdd")
        ?.addEventListener(
            "click",
            () => {

                workspaceInstruction.textContent =
                    "＋ Add another costume or sound to the selected sprite.";

            }
        );


    document
        .getElementById("uploadAssetButton")
        ?.addEventListener(
            "click",
            () => {

                workspaceInstruction.textContent =
                    "⬆ Upload lets you bring your own asset into Scratch.";

            }
        );


    document
        .getElementById("paintAssetButton")
        ?.addEventListener(
            "click",
            () => {

                workspaceInstruction.textContent =
                    "🎨 Paint lets you create your own costume.";

            }
        );


    document
        .getElementById("addBackdropButton")
        ?.addEventListener(
            "click",
            () => {

                workspaceInstruction.textContent =
                    "🌄 Add another backdrop to the Stage.";

            }
        );


    document
        .getElementById("uploadBackdropButton")
        ?.addEventListener(
            "click",
            () => {

                workspaceInstruction.textContent =
                    "⬆ Upload a custom backdrop.";

            }
        );


    document
        .getElementById("paintBackdropButton")
        ?.addEventListener(
            "click",
            () => {

                workspaceInstruction.textContent =
                    "🎨 Paint your own backdrop.";

            }
        );


    /* =========================================================
       GREEN FLAG / STOP
    ========================================================= */

    document
        .getElementById("lessonFlag")
        ?.addEventListener(
            "click",
            () => {

                runLessonPreview();

            }
        );


    document
        .getElementById("stageFlag")
        ?.addEventListener(
            "click",
            () => {

                runLessonPreview();

            }
        );


    document
        .getElementById("lessonStop")
        ?.addEventListener(
            "click",
            () => {

                stopLessonPreview();

            }
        );


    document
        .getElementById("stageStop")
        ?.addEventListener(
            "click",
            () => {

                stopLessonPreview();

            }
        );


    /* =========================================================
       SIMPLE LESSON PREVIEW
    ========================================================= */

    let previewRunning = false;

    function runLessonPreview() {

        previewRunning = true;

        const sprite =
            document.getElementById(
                "previewPlayer"
            );

        if (sprite) {

            sprite.style.transition =
                "transform 0.35s ease";

            sprite.style.transform =
                "translate(-50%, -50%) scale(1.15)";

            setTimeout(() => {

                if (!previewRunning) return;

                sprite.style.transform =
                    "translate(-50%, -50%) scale(1)";

            }, 400);
        }

        workspaceInstruction.textContent =
            "🟢 RUNNING — watch the Stage and observe what the script changes.";
    }


    function stopLessonPreview() {

        previewRunning = false;

        const sprite =
            document.getElementById(
                "previewPlayer"
            );

        if (sprite) {
            sprite.style.transform =
                "translate(-50%, -50%) scale(1)";
        }

        workspaceInstruction.textContent =
            "🛑 Project stopped.";
    }


    /* =========================================================
       MISSION 7 — REAL AURA PLUS PREVIEW
    ========================================================= */

    let auraPlusPreview = null;


    function renderMission7Preview() {

        const stage =
            document.getElementById(
                "previewStage"
            );

        if (!stage) return;

        if (currentMission !== 7) {

            if (
                auraPlusPreview?.cleanup
            ) {
                auraPlusPreview.cleanup();
            }

            auraPlusPreview = null;

            stage.innerHTML = `
                <div class="stage-scene">
                    <div
                        id="previewPlayer"
                        class="preview-sprite"
                    >
                        A
                    </div>
                </div>
            `;

            return;
        }


        stage.innerHTML = `

            <div class="aura-preview-hud">

                <span>
                    ⚡ AURA:
                    <b id="apScore">0</b>/50
                </span>

                <span>
                    ❤️ LIVES:
                    <b id="apLives">3</b>
                </span>

            </div>


            <div
                class="aura-preview-object"
                id="apPlayer"
            >
                A
            </div>


            <div
                class="aura-preview-shadow"
                id="apShadow"
            >
                S
            </div>


            <div
                class="aura-preview-portal"
                id="apPortal"
            >
                ✦
            </div>


            <div
                class="aura-preview-orb"
                style="left:18%;top:25%"
            >
                ✦
            </div>

            <div
                class="aura-preview-orb"
                style="left:40%;top:68%"
            >
                ✦
            </div>

            <div
                class="aura-preview-orb"
                style="left:68%;top:25%"
            >
                ✦
            </div>

            <div
                class="aura-preview-orb"
                style="left:78%;top:65%"
            >
                ✦
            </div>

            <div
                class="aura-preview-orb"
                style="left:48%;top:45%"
            >
                ✦
            </div>


            <div
                id="apMessage"
                class="aura-preview-message"
            >
                COLLECT 5 ORBS → PORTAL UNLOCKS
            </div>
        `;


        const playerEl =
            document.getElementById(
                "apPlayer"
            );

        const shadowEl =
            document.getElementById(
                "apShadow"
            );

        const portalEl =
            document.getElementById(
                "apPortal"
            );

        const messageEl =
            document.getElementById(
                "apMessage"
            );


        auraPlusPreview = {

            player: playerEl,
            shadow: shadowEl,
            portal: portalEl,
            message: messageEl,

            score: 0,
            lives: 3,

            x: 12,
            y: 50,

            running: false,

            keys: Object.create(null),

            orbs: [
                ...stage.querySelectorAll(
                    ".aura-preview-orb"
                )
            ]

        };


        function updatePreview() {

            const g =
                auraPlusPreview;

            if (!g) return;

            g.player.style.left =
                `${g.x}%`;

            g.player.style.top =
                `${g.y}%`;

            const unlocked =
                g.score >= 50;

            g.portal.classList.toggle(
                "unlocked",
                unlocked
            );

            document.getElementById(
                "apScore"
            ).textContent =
                g.score;

            document.getElementById(
                "apLives"
            ).textContent =
                g.lives;

            g.message.textContent =
                unlocked
                    ? "⚡ PORTAL UNLOCKED — REACH IT!"
                    : "COLLECT THE AURA ORBS!";
        }


        function previewTick() {

            const g =
                auraPlusPreview;

            if (
                !g ||
                !g.running
            ) {
                return;
            }

            const speed = 0.9;

            if (
                g.keys.arrowleft ||
                g.keys.a
            ) {
                g.x -= speed;
            }

            if (
                g.keys.arrowright ||
                g.keys.d
            ) {
                g.x += speed;
            }

            if (
                g.keys.arrowup ||
                g.keys.w
            ) {
                g.y -= speed;
            }

            if (
                g.keys.arrowdown ||
                g.keys.s
            ) {
                g.y += speed;
            }

            g.x =
                Math.max(
                    5,
                    Math.min(95, g.x)
                );

            g.y =
                Math.max(
                    8,
                    Math.min(92, g.y)
                );


            g.orbs.forEach(orb => {

                if (
                    orb.style.display ===
                    "none"
                ) {
                    return;
                }

                const ox =
                    parseFloat(
                        orb.style.left
                    );

                const oy =
                    parseFloat(
                        orb.style.top
                    );

                if (
                    Math.hypot(
                        g.x - ox,
                        g.y - oy
                    ) < 8
                ) {

                    orb.style.display =
                        "none";

                    g.score += 10;

                    updatePreview();
                }

            });


            updatePreview();

            requestAnimationFrame(
                previewTick
            );
        }


        const keydown =
            event => {

                if (!auraPlusPreview) {
                    return;
                }

                const allowed = [
                    "ArrowUp",
                    "ArrowDown",
                    "ArrowLeft",
                    "ArrowRight",
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
                    allowed.includes(
                        event.key
                    )
                ) {

                    event.preventDefault();

                    auraPlusPreview.keys[
                        event.key.toLowerCase()
                    ] = true;
                }
            };


        const keyup =
            event => {

                if (!auraPlusPreview) {
                    return;
                }

                delete auraPlusPreview.keys[
                    event.key.toLowerCase()
                ];
            };


        window.addEventListener(
            "keydown",
            keydown,
            { passive: false }
        );

        window.addEventListener(
            "keyup",
            keyup
        );


        stage.addEventListener(
            "pointerdown",
            event => {

                if (!auraPlusPreview) {
                    return;
                }

                const rect =
                    stage.getBoundingClientRect();

                auraPlusPreview.x =
                    (
                        (event.clientX -
                            rect.left) /
                        rect.width
                    ) * 100;

                auraPlusPreview.y =
                    (
                        (event.clientY -
                            rect.top) /
                        rect.height
                    ) * 100;

                updatePreview();
            }
        );


        auraPlusPreview.cleanup =
            () => {

                window.removeEventListener(
                    "keydown",
                    keydown
                );

                window.removeEventListener(
                    "keyup",
                    keyup
                );
            };


        updatePreview();


        if (
            currentStep >=
            lessons[7].steps.length - 1
        ) {
            runAuraPreview();
        }
    }


    function runAuraPreview() {

        if (!auraPlusPreview) {
            renderMission7Preview();

            if (!auraPlusPreview) {
                return;
            }
        }

        const g =
            auraPlusPreview;

        g.running = true;
        g.score = 0;
        g.lives = 3;
        g.x = 12;
        g.y = 50;

        g.orbs.forEach(
            orb =>
                orb.style.display =
                    "block"
        );

        updatePreviewFallback(g);

        requestAnimationFrame(
            previewLoop
        );
    }


    function updatePreviewFallback(g) {

        if (!g) return;

        if (g.player) {
            g.player.style.left =
                `${g.x}%`;

            g.player.style.top =
                `${g.y}%`;
        }

        if (g.portal) {
            g.portal.classList.toggle(
                "unlocked",
                g.score >= 50
            );
        }

        const scoreEl =
            document.getElementById(
                "apScore"
            );

        const livesEl =
            document.getElementById(
                "apLives"
            );

        if (scoreEl) {
            scoreEl.textContent =
                g.score;
        }

        if (livesEl) {
            livesEl.textContent =
                g.lives;
        }
    }


    function previewLoop() {

        const g =
            auraPlusPreview;

        if (
            !g ||
            !g.running
        ) {
            return;
        }

        const speed = 0.8;

        if (
            g.keys.arrowleft ||
            g.keys.a
        ) {
            g.x -= speed;
        }

        if (
            g.keys.arrowright ||
            g.keys.d
        ) {
            g.x += speed;
        }

        if (
            g.keys.arrowup ||
            g.keys.w
        ) {
            g.y -= speed;
        }

        if (
            g.keys.arrowdown ||
            g.keys.s
        ) {
            g.y += speed;
        }

        g.x =
            Math.max(
                5,
                Math.min(95, g.x)
            );

        g.y =
            Math.max(
                8,
                Math.min(92, g.y)
            );


        g.orbs.forEach(orb => {

            if (
                orb.style.display ===
                "none"
            ) {
                return;
            }

            const ox =
                parseFloat(
                    orb.style.left
                );

            const oy =
                parseFloat(
                    orb.style.top
                );

            if (
                Math.hypot(
                    g.x - ox,
                    g.y - oy
                ) < 8
            ) {

                orb.style.display =
                    "none";

                g.score += 10;
            }

        });


        updatePreviewFallback(g);

        requestAnimationFrame(
            previewLoop
        );
    }


    /* =========================================================
       COMPLETE MISSION
    ========================================================= */

    function completeMission() {

        completedMissions.add(
            currentMission
        );

        updateProgress();

        const cards =
            document.querySelectorAll(
                ".mission-card"
            );

        cards.forEach(card => {

            if (
                Number(card.dataset.mission) ===
                currentMission
            ) {

                card.classList.add(
                    "completed"
                );
            }

        });


        if (
            currentMission <
            Object.keys(lessons).length
        ) {

            const nextMission =
                currentMission + 1;

            cards.forEach(card => {

                if (
                    Number(
                        card.dataset.mission
                    ) === nextMission
                ) {

                    card.classList.add(
                        "next-mission"
                    );
                }

            });

            showScreen("tutorial");

        } else {

            showScreen("final");
        }
    }


    /* =========================================================
       BACK TO MISSIONS
    ========================================================= */

    document
        .getElementById("backToMissions")
        ?.addEventListener(
            "click",
            () => {

                if (
                    auraPlusPreview?.cleanup
                ) {
                    auraPlusPreview.cleanup();
                }

                auraPlusPreview = null;

                showScreen("tutorial");
            }
        );


    /* =========================================================
       INITIAL STATE
    ========================================================= */

    showScreen("intro");

    updateProgress();

});
