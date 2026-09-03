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
       GAME
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


    /* Make game focusable */
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

        document
            .querySelectorAll(".aura-orb")
            .forEach((orb, i) => {

                orb.style.display = "block";

                if (orbPositions[i]) {
                    orb.style.left =
                        orbPositions[i][0];

                    orb.style.top =
                        orbPositions[i][1];
                }
            });

        updatePlayer();
        updateShadow();

        cancelAnimationFrame(gameFrame);

        gameFrame =
            requestAnimationFrame(gameLoop);

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

        gameFrame =
            requestAnimationFrame(gameLoop);
    }


    function movePlayer() {

        const speed = 5;

        if (keys.ArrowLeft || keys.a) {
            playerX -= speed;
        }

        if (keys.ArrowRight || keys.d) {
            playerX += speed;
        }

        if (keys.ArrowUp || keys.w) {
            playerY -= speed;
        }

        if (keys.ArrowDown || keys.s) {
            playerY += speed;
        }
    }


    function keepPlayerInside() {

        if (!gameWorld || !player) return;

        const maxX =
            Math.max(
                0,
                gameWorld.clientWidth -
                player.offsetWidth
            );

        const maxY =
            Math.max(
                0,
                gameWorld.clientHeight -
                player.offsetHeight
            );

        playerX =
            Math.max(
                0,
                Math.min(maxX, playerX)
            );

        playerY =
            Math.max(
                0,
                Math.min(maxY, playerY)
            );
    }


    function updatePlayer() {

        if (!player) return;

        player.style.left =
            `${playerX}px`;

        player.style.top =
            `${playerY}px`;
    }


    function updateShadow() {

        if (!shadow) return;

        const dx =
            playerX - shadowX;

        const dy =
            playerY - shadowY;

        const distance =
            Math.hypot(dx, dy);

        if (distance > 5) {

            const speed = 0.45;

            shadowX +=
                (dx / distance) *
                speed;

            shadowY +=
                (dy / distance) *
                speed;
        }

        shadow.style.left =
            `${shadowX}px`;

        shadow.style.top =
            `${shadowY}px`;
    }


    function touching(element1, element2) {

        if (!element1 || !element2) {
            return false;
        }

        const a =
            element1.getBoundingClientRect();

        const b =
            element2.getBoundingClientRect();

        return !(
            a.right < b.left ||
            a.left > b.right ||
            a.bottom < b.top ||
            a.top > b.bottom
        );
    }


    function collectOrbs() {

        document
            .querySelectorAll(".aura-orb")
            .forEach(orb => {

                if (
                    orb.style.display !== "none" &&
                    touching(player, orb)
                ) {

                    orb.style.display =
                        "none";

                    score += Number(
                        orb.dataset.value || 10
                    );

                    auraScore.textContent =
                        score;

                    if (score >= 50) {

                        portal?.classList.add(
                            "unlocked"
                        );

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

        lastHitTime =
            Date.now();

        lives--;

        livesDisplay.textContent =
            lives;

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

        gameMessage.innerHTML =
            message;

        gameMessage.classList.remove(
            "hidden"
        );
    }


    /* =========================================================
       KEYBOARD CONTROLS
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


    window.addEventListener(
        "keydown",
        event => {

            if (!gameRunning) return;

            if (gameKeys.has(event.key)) {

                event.preventDefault();

                const key =
                    event.key.length === 1
                        ? event.key.toLowerCase()
                        : event.key;

                keys[key] = true;
            }
        },
        { passive: false }
    );


    window.addEventListener(
        "keyup",
        event => {

            const key =
                event.key.length === 1
                    ? event.key.toLowerCase()
                    : event.key;

            delete keys[key];
        }
    );


    window.addEventListener(
        "blur",
        () => {

            Object.keys(keys).forEach(
                key => delete keys[key]
            );
        }
    );


    /* =========================================================
       SMARTBOARD / TOUCH GAME CONTROL
    ========================================================= */

    gameWorld?.addEventListener(
        "pointerdown",
        event => {

            if (!gameRunning) return;

            if (event.target === player) {
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
        },
        { passive: false }
    );


    /* =========================================================
       INTRO / NAVIGATION
    ========================================================= */

    document
        .getElementById("playGameButton")
        ?.addEventListener(
            "click",
            () => {

                /*
                 IMPORTANT:
                 Show the game FIRST.
                 Then calculate its dimensions.
                */

                showScreen("game");

                requestAnimationFrame(
                    startGame
                );
            }
        );


    document
        .getElementById("tutorialButton")
        ?.addEventListener(
            "click",
            () => {
                showScreen("tutorial");
            }
        );


    document
        .getElementById("exitGame")
        ?.addEventListener(
            "click",
            () => {

                stopGame();

                showScreen("intro");
            }
        );


    document
        .getElementById("revealButton")
        ?.addEventListener(
            "click",
            () => {
                showScreen("tutorial");
            }
        );


    /* =========================================================
       LESSON DATA
    ========================================================= */

    const lessons = {

        1: {
            title: "Working with Sprites",

            description:
                "Sprites are the characters and objects that we program in Scratch.",

            points: [
                "Add a new sprite.",
                "Select a sprite.",
                "Delete a sprite.",
                "Each sprite can have its own scripts."
            ],

            tip:
                "A sprite is a character or object that can be programmed.",

            blocks: [
                {
                    text:
                        "when green flag clicked",
                    category:
                        "events"
                }
            ]
        },


        2: {
            title: "Make a Sprite Move",

            description:
                "Motion blocks control the movement of a sprite.",

            points: [
                "Motion blocks are blue.",
                "move 10 steps moves the sprite.",
                "change x by 10 moves horizontally.",
                "change y by 10 moves vertically."
            ],

            tip:
                "Blue Motion blocks control sprite movement.",

            blocks: [
                {
                    text:
                        "move 10 steps",
                    category:
                        "motion"
                },

                {
                    text:
                        "change x by 10",
                    category:
                        "motion"
                }
            ]
        },


        3: {
            title: "Change Costumes",

            description:
                "A sprite can have different costumes.",

            points: [
                "Open the Costumes tab.",
                "Add another costume.",
                "Use next costume.",
                "Costumes change the appearance of a sprite."
            ],

            tip:
                "Costumes are different appearances of the same sprite.",

            blocks: [
                {
                    text:
                        "next costume",
                    category:
                        "looks"
                },

                {
                    text:
                        "switch costume to [costume2]",
                    category:
                        "looks"
                }
            ]
        },


        4: {
            title: "Program Two Sprites",

            description:
                "Different sprites can have different scripts.",

            points: [
                "Add another sprite.",
                "Select the sprite.",
                "Create its own script.",
                "Both sprites can react to the green flag."
            ],

            tip:
                "Every sprite can have its own scripts.",

            blocks: [
                {
                    text:
                        "when green flag clicked",
                    category:
                        "events"
                },

                {
                    text:
                        "say [Hello!] for 2 seconds",
                    category:
                        "looks"
                }
            ]
        },


        5: {
            title: "Change the Backdrop",

            description:
                "The Stage uses backdrops as its background.",

            points: [
                "Click the Stage.",
                "Open Backdrops.",
                "Choose a backdrop.",
                "Backdrops belong to the Stage."
            ],

            tip:
                "Sprite = character/object. Backdrop = Stage background.",

            blocks: [
                {
                    text:
                        "switch backdrop to [backdrop1]",
                    category:
                        "looks"
                },

                {
                    text:
                        "next backdrop",
                    category:
                        "looks"
                }
            ]
        },


        6: {
            title: "Working with Sounds",

            description:
                "Sounds make Scratch projects interactive.",

            points: [
                "Open the Sounds tab.",
                "Choose or add a sound.",
                "Use a Sound block.",
                "Sound blocks are pink."
            ],

            tip:
                "Sounds can be added to sprites and played by scripts.",

            blocks: [
                {
                    text:
                        "start sound [Meow]",
                    category:
                        "sound"
                },

                {
                    text:
                        "play sound [Meow] until done",
                    category:
                        "sound"
                }
            ]
        },


        7: {
            title: "Build a Mini Game",

            description:
                "Combine your Scratch skills to build an interactive project.",

            points: [
                "Start with the green flag.",
                "Move your sprite.",
                "Use another sprite.",
                "Use costumes and sounds.",
                "Test your project."
            ],

            tip:
                "Scratch projects are made by combining small scripts.",

            blocks: [
                {
                    text:
                        "when green flag clicked",
                    category:
                        "events"
                },

                {
                    text:
                        "forever",
                    category:
                        "control"
                },

                {
                    text:
                        "move 10 steps",
                    category:
                        "motion"
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
        ]
    };


    /* =========================================================
       LESSON ELEMENTS
    ========================================================= */

    const lessonTitle =
        document.getElementById(
            "lessonTitle"
        );

    const lessonDescription =
        document.getElementById(
            "lessonDescription"
        );

    const lessonLearningPoints =
        document.getElementById(
            "lessonLearningPoints"
        );

    const teacherTip =
        document.getElementById(
            "teacherTip"
        );

    const lessonNumber =
        document.getElementById(
            "lessonNumber"
        );

    const lessonStep =
        document.getElementById(
            "lessonStep"
        );

    const paletteCategory =
        document.getElementById(
            "paletteCategory"
        );

    const blockPalette =
        document.getElementById(
            "blockPalette"
        );

    const lessonBlocks =
        document.getElementById(
            "lessonBlocks"
        );

    const workspaceInstruction =
        document.getElementById(
            "workspaceInstruction"
        );

    const blockCount =
        document.getElementById(
            "blockCount"
        );

    const workspaceHint =
        document.getElementById(
            "workspaceHint"
        );

    const nextButton =
        document.getElementById(
            "nextLessonStep"
        );

    const showBlockButton =
        document.getElementById(
            "showBlockButton"
        );


    let currentMission = 1;

    let currentBlockIndex = 0;

    /*
       0 = LEARN
       1 = SEE
       2 = DO
    */
    let lessonPhase = 0;

    const completedMissions =
        new Set();


    /* =========================================================
       HELPERS
    ========================================================= */

    function normalize(text) {

        return String(text)
            .toLowerCase()
            .replace(/\s+/g, " ")
            .trim();
    }


    /* =========================================================
       OPEN LESSON
    ========================================================= */

    function openLesson(mission) {

        if (!lessons[mission]) {
            return;
        }

        currentMission =
            mission;

        currentBlockIndex =
            0;

        lessonPhase =
            0;

        renderLesson();

        showScreen("lesson");
    }


    document
        .querySelectorAll(".mission-card")
        .forEach(card => {

            card.addEventListener(
                "click",
                () => {

                    openLesson(
                        Number(
                            card.dataset.mission
                        )
                    );
                }
            );
        });


    /* =========================================================
       RENDER LESSON
    ========================================================= */

    function renderLesson() {

        const lesson =
            lessons[currentMission];

        if (!lesson) return;

        lessonTitle.textContent =
            lesson.title;

        lessonDescription.textContent =
            lesson.description;

        teacherTip.textContent =
            lesson.tip;

        lessonNumber.textContent =
            currentMission;


        lessonLearningPoints.innerHTML =
            "";

        lesson.points.forEach(point => {

            const li =
                document.createElement(
                    "li"
                );

            li.textContent =
                point;

            lessonLearningPoints.appendChild(
                li
            );
        });


        lessonBlocks.innerHTML =
            "";

        blockCount.textContent =
            "0 blocks";


        currentBlockIndex =
            0;

        lessonPhase =
            0;


        renderCurrentPhase();

        updateProgress();
    }


    function renderCurrentPhase() {

        const lesson =
            lessons[currentMission];

        const target =
            lesson.blocks[
                currentBlockIndex
            ];


        if (!target) {

            completeMission();

            return;
        }


        lessonStep.textContent =
            currentBlockIndex + 1;


        /* =========================
           LEARN
        ========================= */

        if (lessonPhase === 0) {

            workspaceInstruction.textContent =
                "🧠 LEARN: Read the explanation, then press NEXT to see the exact Scratch block.";

            workspaceHint.textContent =
                "Learning";

            nextButton.textContent =
                "SEE THE BLOCK →";

            showBlockButton.textContent =
                "SHOW NEXT BLOCK";

            renderPalette(
                lesson.category ||
                target.category,
                false
            );
        }


        /* =========================
           SEE
        ========================= */

        if (lessonPhase === 1) {

            workspaceInstruction.textContent =
                `👀 THIS IS THE EXACT BLOCK: ${target.text}`;

            workspaceHint.textContent =
                "Look carefully";

            nextButton.textContent =
                "TRY IT →";

            renderPalette(
                target.category,
                true
            );

            highlightExpectedBlock();
        }


        /* =========================
           DO
        ========================= */

        if (lessonPhase === 2) {

            workspaceInstruction.textContent =
                "🧩 DRAG or TAP the highlighted block into SCRIPTS.";

            workspaceHint.textContent =
                "Drop the block here";

            nextButton.textContent =
                "NEXT →";

            renderPalette(
                target.category,
                true
            );

            highlightExpectedBlock();
        }
    }


    /* =========================================================
       RENDER PALETTE
    ========================================================= */

    function renderPalette(
        category,
        highlightTarget
    ) {

        if (!blockPalette) return;

        blockPalette.innerHTML =
            "";

        paletteCategory.textContent =
            category.charAt(0).toUpperCase() +
            category.slice(1);


        document
            .querySelectorAll(".block-category")
            .forEach(button => {

                button.classList.toggle(
                    "active",
                    button.dataset.category ===
                    category
                );
            });


        (
            paletteBlocks[category] ||
            []
        ).forEach(text => {

            blockPalette.appendChild(
                createPaletteBlock(
                    text,
                    category
                )
            );
        });


        if (highlightTarget) {
            highlightExpectedBlock();
        }
    }


    /* =========================================================
       SCRATCH BLOCK
    ========================================================= */

    function createScratchBlock(
        text,
        category,
        workspace = false
    ) {

        const block =
            document.createElement(
                "div"
            );

        block.className =
            `scratch-block ${category}`;

        block.textContent =
            text;

        block.dataset.text =
            text;

        block.dataset.category =
            category;


        if (workspace) {

            block.classList.add(
                "workspace-block"
            );

            block.style.cursor =
                "default";
        }


        return block;
    }


    /* =========================================================
       ROBUST POINTER DRAG
    ========================================================= */

    function createPaletteBlock(
        text,
        category
    ) {

        const block =
            createScratchBlock(
                text,
                category,
                false
            );

        block.draggable =
            false;

        block.style.touchAction =
            "none";


        let pointerId =
            null;

        let startX =
            0;

        let startY =
            0;

        let dragging =
            false;

        let ghost =
            null;


        block.addEventListener(
            "pointerdown",
            event => {

                if (
                    event.pointerType ===
                    "mouse" &&
                    event.button !== 0
                ) {
                    return;
                }


                event.preventDefault();


                pointerId =
                    event.pointerId;

                startX =
                    event.clientX;

                startY =
                    event.clientY;

                dragging =
                    false;


                try {
                    block.setPointerCapture(
                        pointerId
                    );
                } catch (_) {}


                const move =
                    ev => {

                        if (
                            ev.pointerId !==
                            pointerId
                        ) {
                            return;
                        }


                        ev.preventDefault();


                        const distance =
                            Math.hypot(
                                ev.clientX -
                                startX,

                                ev.clientY -
                                startY
                            );


                        if (
                            !dragging &&
                            distance < 8
                        ) {
                            return;
                        }


                        if (!dragging) {

                            dragging =
                                true;

                            ghost =
                                block.cloneNode(
                                    true
                                );

                            ghost.classList.add(
                                "drag-ghost"
                            );


                            Object.assign(
                                ghost.style,
                                {
                                    position:
                                        "fixed",

                                    zIndex:
                                        "99999",

                                    pointerEvents:
                                        "none",

                                    opacity:
                                        "0.9",

                                    margin:
                                        "0",

                                    width:
                                        `${Math.min(
                                            block.getBoundingClientRect().width,
                                            240
                                        )}px`
                                }
                            );


                            document.body.appendChild(
                                ghost
                            );
                        }


                        ghost.style.left =
                            `${ev.clientX - 20}px`;

                        ghost.style.top =
                            `${ev.clientY - 20}px`;


                        highlightDropZone(
                            ev.clientX,
                            ev.clientY
                        );
                    };


                const end =
                    ev => {

                        if (
                            ev.pointerId !==
                            pointerId
                        ) {
                            return;
                        }


                        ev.preventDefault();


                        block.removeEventListener(
                            "pointermove",
                            move
                        );

                        block.removeEventListener(
                            "pointerup",
                            end
                        );

                        block.removeEventListener(
                            "pointercancel",
                            cancel
                        );


                        const wasDragging =
                            dragging;


                        if (ghost) {
                            ghost.remove();
                        }

                        ghost =
                            null;


                        clearDropZone();


                        const rect =
                            lessonBlocks.getBoundingClientRect();


                        const inside =
                            ev.clientX >= rect.left &&
                            ev.clientX <= rect.right &&
                            ev.clientY >= rect.top &&
                            ev.clientY <= rect.bottom;


                        /*
                           Desktop:
                           actual drag must end inside workspace.

                           Smartboard:
                           simple TAP also adds block.
                        */

                        if (
                            wasDragging &&
                            inside
                        ) {

                            addBlockToWorkspace(
                                text,
                                category
                            );

                        } else if (
                            !wasDragging
                        ) {

                            addBlockToWorkspace(
                                text,
                                category
                            );
                        }


                        dragging =
                            false;

                        pointerId =
                            null;
                    };


                const cancel =
                    ev => {

                        if (
                            ev.pointerId !==
                            pointerId
                        ) {
                            return;
                        }


                        block.removeEventListener(
                            "pointermove",
                            move
                        );

                        block.removeEventListener(
                            "pointerup",
                            end
                        );

                        block.removeEventListener(
                            "pointercancel",
                            cancel
                        );


                        if (ghost) {
                            ghost.remove();
                        }

                        ghost =
                            null;


                        clearDropZone();


                        dragging =
                            false;

                        pointerId =
                            null;
                    };


                block.addEventListener(
                    "pointermove",
                    move,
                    { passive: false }
                );

                block.addEventListener(
                    "pointerup",
                    end,
                    { passive: false }
                );

                block.addEventListener(
                    "pointercancel",
                    cancel,
                    { passive: false }
                );
            },
            { passive: false }
        );


        return block;
    }


    /* =========================================================
       DROP ZONE
    ========================================================= */

    function highlightDropZone(
        x,
        y
    ) {

        if (!lessonBlocks) return;

        const rect =
            lessonBlocks.getBoundingClientRect();


        const inside =
            x >= rect.left &&
            x <= rect.right &&
            y >= rect.top &&
            y <= rect.bottom;


        if (inside) {

            lessonBlocks.style.outline =
                "4px solid #4c97ff";

            lessonBlocks.style.outlineOffset =
                "-4px";

        } else {

            lessonBlocks.style.outline =
                "";

            lessonBlocks.style.outlineOffset =
                "";
        }
    }


    function clearDropZone() {

        if (!lessonBlocks) return;

        lessonBlocks.style.outline =
            "";

        lessonBlocks.style.outlineOffset =
            "";
    }


    /* =========================================================
       HIGHLIGHT CORRECT BLOCK
    ========================================================= */

    function highlightExpectedBlock() {

        const lesson =
            lessons[currentMission];

        const target =
            lesson.blocks[
                currentBlockIndex
            ];


        if (!target) return;


        document
            .querySelectorAll(
                "#blockPalette .scratch-block"
            )
            .forEach(block => {

                const match =
                    normalize(
                        block.dataset.text
                    ) ===
                    normalize(
                        target.text
                    );


                block.style.outline =
                    match
                        ? "3px solid #facc15"
                        : "";

                block.style.outlineOffset =
                    match
                        ? "2px"
                        : "";
            });
    }


    /* =========================================================
       ADD BLOCK
    ========================================================= */

    function addBlockToWorkspace(
        text,
        category
    ) {

        const lesson =
            lessons[currentMission];

        const target =
            lesson.blocks[
                currentBlockIndex
            ];


        if (!target) return;


        if (lessonPhase !== 2) {

            workspaceInstruction.textContent =
                "👀 First press NEXT until the page says DRAG or TAP the highlighted block.";

            return;
        }


        /* WRONG BLOCK */

        if (
            normalize(text) !==
            normalize(target.text)
        ) {

            workspaceInstruction.textContent =
                `❌ Not that block. The correct one is: ${target.text}`;

            highlightExpectedBlock();

            return;
        }


        /* CORRECT BLOCK */

        const block =
            createScratchBlock(
                text,
                category,
                true
            );


        lessonBlocks.appendChild(
            block
        );


        blockCount.textContent =
            `${lessonBlocks.children.length} block${
                lessonBlocks.children.length === 1
                    ? ""
                    : "s"
            }`;


        workspaceInstruction.textContent =
            "✅ Correct! Scratch block added.";


        currentBlockIndex++;


        /* More blocks needed */

        if (
            currentBlockIndex <
            lesson.blocks.length
        ) {

            lessonPhase =
                0;

            setTimeout(
                () => {
                    renderCurrentPhase();
                },
                500
            );

            return;
        }


        /* Mission finished */

        setTimeout(
            completeMission,
            450
        );
    }


    /* =========================================================
       NEXT BUTTON
    ========================================================= */

    nextButton?.addEventListener(
        "click",
        () => {

            const lesson =
                lessons[currentMission];

            if (!lesson) return;


            /*
               LEARN → SEE
            */

            if (
                lessonPhase === 0
            ) {

                lessonPhase =
                    1;

                renderCurrentPhase();

                return;
            }


            /*
               SEE → DO
            */

            if (
                lessonPhase === 1
            ) {

                lessonPhase =
                    2;

                renderCurrentPhase();

                return;
            }


            /*
               DO → wait for correct block
            */

            workspaceInstruction.textContent =
                "🧩 Put the highlighted block into SCRIPTS first.";

            highlightExpectedBlock();
        }
    );


    /* =========================================================
       SHOW NEXT BLOCK
    ========================================================= */

    showBlockButton?.addEventListener(
        "click",
        () => {

            const lesson =
                lessons[currentMission];

            const target =
                lesson.blocks[
                    currentBlockIndex
                ];


            if (!target) return;


            lessonPhase =
                1;

            renderCurrentPhase();

            highlightExpectedBlock();


            const targetBlock =
                [
                    ...document.querySelectorAll(
                        "#blockPalette .scratch-block"
                    )
                ].find(
                    block =>
                        normalize(
                            block.dataset.text
                        ) ===
                        normalize(
                            target.text
                        )
                );


            targetBlock?.scrollIntoView({
                behavior: "smooth",
                block: "nearest"
            });
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

                    document
                        .querySelectorAll(
                            ".block-category"
                        )
                        .forEach(
                            b =>
                                b.classList.remove(
                                    "active"
                                )
                        );


                    button.classList.add(
                        "active"
                    );


                    renderPalette(
                        button.dataset.category,
                        false
                    );
                }
            );
        });


    /* =========================================================
       MISSION COMPLETE
    ========================================================= */

    function completeMission() {

        if (
            completedMissions.has(
                currentMission
            )
        ) {
            return;
        }


        completedMissions.add(
            currentMission
        );


        updateProgress();


        workspaceInstruction.textContent =
            "🏆 MISSION COMPLETE!";


        setTimeout(
            () => {

                if (
                    completedMissions.size >= 7
                ) {

                    showScreen("final");

                } else {

                    showQuickCheck();
                }

            },
            650
        );
    }


    /* =========================================================
       PROGRESS
    ========================================================= */

    function updateProgress() {

        const percentage =
            (
                completedMissions.size /
                7
            ) * 100;


        const progress =
            document.getElementById(
                "auraProgress"
            );

        const counter =
            document.getElementById(
                "tutorialAura"
            );


        if (progress) {
            progress.style.width =
                `${percentage}%`;
        }


        if (counter) {
            counter.textContent =
                `${completedMissions.size} / 7`;
        }


        document
            .querySelectorAll(
                ".mission-card"
            )
            .forEach(card => {

                const mission =
                    Number(
                        card.dataset.mission
                    );


                card.classList.toggle(
                    "completed",
                    completedMissions.has(
                        mission
                    )
                );
            });
    }


    /* =========================================================
       RUN BUTTON
    ========================================================= */

    document
        .getElementById("runLessonButton")
        ?.addEventListener(
            "click",
            runWorkspace
        );


    function runWorkspace() {

        const blocks =
            [
                ...lessonBlocks.children
            ];

        const preview =
            document.getElementById(
                "previewPlayer"
            );


        if (
            !blocks.length ||
            !preview
        ) {

            workspaceInstruction.textContent =
                "🧩 Add a Scratch block first.";

            return;
        }


        preview.style.left =
            "50%";

        preview.style.top =
            "50%";

        preview.style.transform =
            "translate(-50%, -50%)";


        blocks.forEach(
            (block, i) => {

                setTimeout(
                    () => {

                        executeAction(
                            getAction(
                                block.textContent
                            ),
                            preview
                        );

                    },
                    i * 600
                );
            }
        );
    }


    function getAction(text) {

        const t =
            text.toLowerCase();


        if (
            t.includes("change x")
        ) {
            return "x";
        }


        if (
            t.includes("change y")
        ) {
            return "y";
        }


        if (
            t.includes("move")
        ) {
            return "move";
        }


        if (
            t.includes("turn")
        ) {
            return "turn";
        }


        if (
            t.includes("costume")
        ) {
            return "costume";
        }


        if (
            t.includes("backdrop")
        ) {
            return "backdrop";
        }


        if (
            t.includes("sound")
        ) {
            return "sound";
        }


        if (
            t.includes("say")
        ) {
            return "say";
        }


        return "none";
    }


    function executeAction(
        action,
        preview
    ) {

        switch (action) {

            case "move":

            case "x":

                preview.style.left =
                    "70%";

                break;


            case "y":

                preview.style.top =
                    "30%";

                break;


            case "turn":

                preview.style.transform =
                    "translate(-50%, -50%) rotate(25deg)";

                break;


            case "costume":

                preview.textContent =
                    preview.textContent === "A"
                        ? "★"
                        : "A";

                break;


            case "say":

                showBubble(
                    "Hello!",
                    "previewStage"
                );

                break;


            case "sound":

                showBubble(
                    "🔊 Meow!",
                    "previewStage"
                );

                break;


            case "backdrop":

                document
                    .getElementById(
                        "previewStage"
                    )
                    ?.classList.toggle(
                        "alternate-backdrop"
                    );

                break;
        }
    }


    /* =========================================================
       SPEECH BUBBLE
    ========================================================= */

    function showBubble(
        text,
        stageId
    ) {

        const stage =
            document.getElementById(
                stageId
            );


        if (!stage) return;


        const old =
            stage.querySelector(
                ".js-bubble"
            );


        old?.remove();


        const bubble =
            document.createElement(
                "div"
            );


        bubble.className =
            "js-bubble";

        bubble.textContent =
            text;


        Object.assign(
            bubble.style,
            {
                position:
                    "absolute",

                left:
                    "52%",

                top:
                    "25%",

                padding:
                    "7px 10px",

                background:
                    "white",

                color:
                    "#111827",

                borderRadius:
                    "10px",

                fontSize:
                    "11px",

                fontWeight:
                    "700",

                zIndex:
                    "50",

                boxShadow:
                    "0 3px 12px rgba(0,0,0,.2)"
            }
        );


        stage.appendChild(
            bubble
        );


        setTimeout(
            () => bubble.remove(),
            1200
        );
    }


    /* =========================================================
       QUICK CHECK
    ========================================================= */

    const quickCheck =
        document.getElementById(
            "quickCheck"
        );

    const checkQuestion =
        document.getElementById(
            "checkQuestion"
        );

    const checkBlock =
        document.getElementById(
            "checkBlock"
        );

    const checkResult =
        document.getElementById(
            "checkResult"
        );

    const checkOptions =
        [
            ...document.querySelectorAll(
                ".check-option"
            )
        ];


    const checks = [

        {
            block:
                "move 10 steps",

            category:
                "motion",

            answer:
                "Motion"
        },

        {
            block:
                "say [Hello!]",

            category:
                "looks",

            answer:
                "Looks"
        },

        {
            block:
                "start sound [Meow]",

            category:
                "sound",

            answer:
                "Sound"
        },

        {
            block:
                "when green flag clicked",

            category:
                "events",

            answer:
                "Events"
        },

        {
            block:
                "forever",

            category:
                "control",

            answer:
                "Control"
        },

        {
            block:
                "touching [mouse-pointer]?",

            category:
                "sensing",

            answer:
                "Sensing"
        },

        {
            block:
                "pick random 1 to 10",

            category:
                "operators",

            answer:
                "Operators"
        }
    ];


    function showQuickCheck() {

        if (!quickCheck) return;


        const selected =
            checks[
                Math.floor(
                    Math.random() *
                    checks.length
                )
            ];


        checkQuestion.textContent =
            "Which Scratch category contains this block?";


        checkBlock.innerHTML =
            "";


        checkBlock.appendChild(
            createScratchBlock(
                selected.block,
                selected.category,
                true
            )
        );


        checkResult.textContent =
            "";


        const allCategories = [

            "Motion",
            "Looks",
            "Sound",
            "Events",
            "Control",
            "Sensing",
            "Operators",
            "Variables"

        ];


        const distractors =
            allCategories
                .filter(
                    category =>
                        category !==
                        selected.answer
                )
                .sort(
                    () =>
                        Math.random() -
                        0.5
                )
                .slice(
                    0,
                    3
                );


        const answers =
            [
                selected.answer,
                ...distractors
            ].sort(
                () =>
                    Math.random() -
                    0.5
            );


        checkOptions.forEach(
            (button, i) => {

                button.textContent =
                    answers[i] || "";

                button.style.display =
                    answers[i]
                        ? ""
                        : "none";


                button.onclick =
                    () => {

                        if (
                            button.textContent ===
                            selected.answer
                        ) {

                            checkResult.textContent =
                                "✅ Correct!";

                            checkResult.style.color =
                                "#16a34a";


                            setTimeout(
    () => {

        quickCheck.classList.add(
            "hidden"
        );

        quickCheck.classList.remove(
            "active"
        );

        // Go back to Mission Map
        showScreen("tutorial");

        // Highlight next mission
        const nextMission =
            currentMission + 1;

        if (nextMission <= 7) {

            const nextCard =
                document.querySelector(
                    `.mission-card[data-mission="${nextMission}"]`
                );

            if (nextCard) {

                nextCard.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });

                nextCard.classList.add(
                    "next-mission"
                );

                setTimeout(
                    () => {
                        nextCard.classList.remove(
                            "next-mission"
                        );
                    },
                    1800
                );
            }
        }

    },
    650
);
                        } else {

                            checkResult.textContent =
                                `💡 Hint: ${selected.block} is in ${selected.answer}.`;

                            checkResult.style.color =
                                "#dc2626";
                        }
                    };
            }
        );


        quickCheck.classList.remove(
            "hidden"
        );

        quickCheck.classList.add(
            "active"
        );
    }


    /* =========================================================
       NAVIGATION
    ========================================================= */

    document
        .getElementById("backToMissions")
        ?.addEventListener(
            "click",
            () => {

                showScreen(
                    "tutorial"
                );
            }
        );


    document
        .getElementById("replayButton")
        ?.addEventListener(
            "click",
            () => {

                completedMissions.clear();

                updateProgress();

                showScreen(
                    "tutorial"
                );
            }
        );


    /* =========================================================
       INITIAL STATE
    ========================================================= */

    updateProgress();

    showScreen("intro");

});
