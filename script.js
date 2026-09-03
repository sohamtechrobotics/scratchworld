document.addEventListener("DOMContentLoaded", () => {

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
        Object.entries(screens).forEach(([key, screen]) => {
            if (!screen) return;

            screen.classList.toggle("hidden", key !== name);
            screen.classList.toggle("active", key === name);
        });

        document.body.dataset.screen = name;
    }


    /* =========================================================
       INTRO
    ========================================================= */

    document.getElementById("playGameButton")?.addEventListener("click", () => {
        startGame();
        showScreen("game");

        // Important: make keyboard controls work immediately
        gameWorld?.focus();
    });

    document.getElementById("tutorialButton")?.addEventListener("click", () => {
        showScreen("tutorial");
    });

    document.getElementById("revealButton")?.addEventListener("click", () => {
        showScreen("tutorial");
    });

    document.getElementById("exitGame")?.addEventListener("click", () => {
        stopGame();
        showScreen("intro");
    });


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

    let gameRunning = false;
    let gameFrame = null;

    let score = 0;
    let lives = 3;

    let playerX = 70;
    let playerY = 100;

    let shadowX = 500;
    let shadowY = 200;

    const keys = {};

    const orbPositions = [
        ["18%", "25%"],
        ["40%", "68%"],
        ["68%", "25%"],
        ["78%", "65%"],
        ["48%", "45%"]
    ];


    function startGame() {

        gameRunning = true;

        score = 0;
        lives = 3;

        playerX = 70;
        playerY = 100;

        shadowX = Math.max(300, gameWorld.clientWidth - 180);
        shadowY = 180;

        auraScore.textContent = score;
        livesDisplay.textContent = lives;

        if (gameMessage) {
            gameMessage.classList.add("hidden");
        }

        portal?.classList.remove("unlocked");

        const objective =
            document.getElementById("gameObjective");

        if (objective) {
            objective.textContent =
                "COLLECT THE AURA ORBS!";
        }

        document.querySelectorAll(".aura-orb").forEach((orb, i) => {

            orb.style.display = "block";

            orb.style.left = orbPositions[i][0];
            orb.style.top = orbPositions[i][1];
        });

        updatePlayer();
        updateShadow();

        cancelAnimationFrame(gameFrame);

        gameLoop();
    }


    function stopGame() {

        gameRunning = false;

        cancelAnimationFrame(gameFrame);

        Object.keys(keys).forEach(key => {
            keys[key] = false;
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

        // Arrow keys
        if (keys.ArrowLeft) {
            playerX -= speed;
        }

        if (keys.ArrowRight) {
            playerX += speed;
        }

        if (keys.ArrowUp) {
            playerY -= speed;
        }

        if (keys.ArrowDown) {
            playerY += speed;
        }

        // WASD
        if (keys.a) {
            playerX -= speed;
        }

        if (keys.d) {
            playerX += speed;
        }

        if (keys.w) {
            playerY -= speed;
        }

        if (keys.s) {
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
            Math.sqrt(dx * dx + dy * dy);

        if (distance > 5) {

            const shadowSpeed = 0.45;

            shadowX +=
                (dx / distance) *
                shadowSpeed;

            shadowY +=
                (dy / distance) *
                shadowSpeed;
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

                    orb.style.display = "none";

                    score +=
                        Number(
                            orb.dataset.value || 10
                        );

                    auraScore.textContent =
                        score;

                    if (score >= 50) {

                        portal?.classList.add(
                            "unlocked"
                        );

                        const objective =
                            document.getElementById(
                                "gameObjective"
                            );

                        if (objective) {
                            objective.textContent =
                                "⚡ PORTAL UNLOCKED — REACH IT!";
                        }
                    }
                }
            });
    }


    let lastHitTime = 0;

    function checkShadowCollision() {

        if (
            !touching(player, shadow) ||
            Date.now() - lastHitTime < 1500
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

        if (lives <= 0) {

            stopGame();

            showGameMessage(
                "GAME OVER 😵<br><small>Click EXIT and play again.</small>"
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
       KEYBOARD — FIXED
    ========================================================= */

    window.addEventListener("keydown", event => {

        const gameActive =
            !screens.game?.classList.contains("hidden");

        if (!gameActive) return;

        const allowedKeys = [
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

        if (allowedKeys.includes(event.key)) {

            event.preventDefault();

            if (
                event.key === "W" ||
                event.key === "A" ||
                event.key === "S" ||
                event.key === "D"
            ) {
                keys[event.key.toLowerCase()] = true;
            } else {
                keys[event.key] = true;
            }
        }
    });


    window.addEventListener("keyup", event => {

        keys[event.key] = false;

        if (
            ["W", "A", "S", "D"].includes(event.key)
        ) {
            keys[event.key.toLowerCase()] = false;
        }
    });


    /* =========================================================
       GAME TOUCH CONTROL
    ========================================================= */

    let playerPointerActive = false;

    player?.addEventListener(
        "pointerdown",
        event => {

            event.preventDefault();

            playerPointerActive = true;

            player.setPointerCapture?.(
                event.pointerId
            );
        }
    );

    gameWorld?.addEventListener(
        "pointermove",
        event => {

            if (!playerPointerActive) return;

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
        }
    );

    window.addEventListener(
        "pointerup",
        () => {
            playerPointerActive = false;
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
            category: "events",
            blocks: [
                {
                    text: "when green flag clicked",
                    category: "events"
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
            category: "motion",
            blocks: [
                {
                    text: "move 10 steps",
                    category: "motion"
                },
                {
                    text: "change x by 10",
                    category: "motion"
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
            category: "looks",
            blocks: [
                {
                    text: "next costume",
                    category: "looks"
                },
                {
                    text: "switch costume to [costume2]",
                    category: "looks"
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
            category: "events",
            blocks: [
                {
                    text: "when green flag clicked",
                    category: "events"
                },
                {
                    text: "say [Hello!] for 2 seconds",
                    category: "looks"
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
            category: "looks",
            blocks: [
                {
                    text: "switch backdrop to [backdrop1]",
                    category: "looks"
                },
                {
                    text: "next backdrop",
                    category: "looks"
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
            category: "sound",
            blocks: [
                {
                    text: "start sound [Meow]",
                    category: "sound"
                },
                {
                    text: "play sound [Meow] until done",
                    category: "sound"
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
            category: "events",
            blocks: [
                {
                    text: "when green flag clicked",
                    category: "events"
                },
                {
                    text: "forever",
                    category: "control"
                },
                {
                    text: "move 10 steps",
                    category: "motion"
                }
            ]
        }
    };


    /* =========================================================
       PALETTE
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
        document.getElementById("lessonTitle");

    const lessonDescription =
        document.getElementById("lessonDescription");

    const lessonLearningPoints =
        document.getElementById(
            "lessonLearningPoints"
        );

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
        document.getElementById(
            "workspaceInstruction"
        );

    const blockCount =
        document.getElementById("blockCount");

    let currentMission = 1;
    let currentStep = 0;

    const completedMissions =
        new Set();


    /* =========================================================
       MISSION BUTTONS
    ========================================================= */

    document
        .querySelectorAll(".mission-card")
        .forEach(card => {

            card.addEventListener("click", () => {

                openLesson(
                    Number(card.dataset.mission)
                );
            });
        });


    function openLesson(mission) {

        currentMission = mission;
        currentStep = 0;

        renderLesson();

        showScreen("lesson");
    }


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

        lessonLearningPoints.innerHTML = "";

        lesson.points.forEach(point => {

            const li =
                document.createElement("li");

            li.textContent = point;

            lessonLearningPoints.appendChild(li);
        });

        lessonBlocks.innerHTML = "";

        blockCount.textContent =
            "0 blocks";

        lessonStep.textContent = "1";

        workspaceInstruction.textContent =
            `👉 Find and drag: ${lesson.blocks[0].text}`;

        renderPalette(
            lesson.blocks[0].category
        );

        updateProgress();
    }


    /* =========================================================
       SCRATCH BLOCK CREATION
    ========================================================= */

    function createScratchBlock(
        text,
        category,
        workspace = false
    ) {

        const block =
            document.createElement("div");

        block.className =
            `scratch-block ${category}`;

        block.textContent =
            text;

        block.dataset.text =
            text;

        block.dataset.category =
            category;

        if (!workspace) {

            block.draggable = true;

            block.addEventListener(
                "dragstart",
                event => {

                    event.dataTransfer.effectAllowed =
                        "copy";

                    event.dataTransfer.setData(
                        "text/plain",
                        JSON.stringify({
                            text,
                            category
                        })
                    );

                    block.classList.add(
                        "dragging"
                    );
                }
            );

            block.addEventListener(
                "dragend",
                () => {
                    block.classList.remove(
                        "dragging"
                    );
                }
            );

            setupTouchDrag(block);
        }

        return block;
    }


    function renderPalette(category) {

        blockPalette.innerHTML = "";

        paletteCategory.textContent =
            category.charAt(0).toUpperCase() +
            category.slice(1);

        const blocks =
            paletteBlocks[category] || [];

        blocks.forEach(text => {

            blockPalette.appendChild(
                createScratchBlock(
                    text,
                    category
                )
            );
        });

        highlightExpectedBlock();
    }


    /* =========================================================
       DESKTOP DROP
    ========================================================= */

    lessonBlocks.addEventListener(
        "dragenter",
        event => {

            event.preventDefault();

            lessonBlocks.style.background =
                "rgba(76,151,255,0.10)";
        }
    );

    lessonBlocks.addEventListener(
        "dragover",
        event => {

            event.preventDefault();

            event.dataTransfer.dropEffect =
                "copy";
        }
    );

    lessonBlocks.addEventListener(
        "dragleave",
        event => {

            if (
                event.target === lessonBlocks
            ) {
                lessonBlocks.style.background =
                    "";
            }
        }
    );

    lessonBlocks.addEventListener(
        "drop",
        event => {

            event.preventDefault();

            lessonBlocks.style.background =
                "";

            const raw =
                event.dataTransfer.getData(
                    "text/plain"
                );

            if (!raw) return;

            try {

                const data =
                    JSON.parse(raw);

                addBlockToWorkspace(
                    data.text,
                    data.category
                );

            } catch (error) {

                console.error(
                    "Block drop error:",
                    error
                );
            }
        }
    );


    /* =========================================================
       TOUCH DRAG — SMARTBOARD
    ========================================================= */

    let touchDragging = false;
    let touchBlock = null;
    let touchData = null;
    let touchPointerId = null;

    function setupTouchDrag(block) {

        block.addEventListener(
            "pointerdown",
            event => {

                if (
                    event.pointerType === "mouse" &&
                    event.button !== 0
                ) {
                    return;
                }

                event.preventDefault();

                touchDragging = true;

                touchPointerId =
                    event.pointerId;

                touchData = {
                    text: block.dataset.text,
                    category: block.dataset.category
                };

                touchBlock =
                    block.cloneNode(true);

                touchBlock.style.position =
                    "fixed";

                touchBlock.style.zIndex =
                    "99999";

                touchBlock.style.pointerEvents =
                    "none";

                touchBlock.style.width =
                    `${block.getBoundingClientRect().width}px`;

                touchBlock.style.opacity =
                    "0.92";

                touchBlock.style.margin =
                    "0";

                document.body.appendChild(
                    touchBlock
                );

                moveTouchBlock(event);

                block.setPointerCapture?.(
                    event.pointerId
                );
            }
        );

        block.addEventListener(
            "pointermove",
            event => {

                if (
                    !touchDragging ||
                    event.pointerId !==
                    touchPointerId
                ) {
                    return;
                }

                event.preventDefault();

                moveTouchBlock(event);

                highlightDropArea(
                    event.clientX,
                    event.clientY
                );
            }
        );

        block.addEventListener(
            "pointerup",
            event => {

                if (
                    !touchDragging ||
                    event.pointerId !==
                    touchPointerId
                ) {
                    return;
                }

                finishTouchDrag(event);
            }
        );

        block.addEventListener(
            "pointercancel",
            () => {
                cancelTouchDrag();
            }
        );
    }


    function moveTouchBlock(event) {

        if (!touchBlock) return;

        touchBlock.style.left =
            `${event.clientX - 25}px`;

        touchBlock.style.top =
            `${event.clientY - 20}px`;
    }


    function highlightDropArea(x, y) {

        const rect =
            lessonBlocks.getBoundingClientRect();

        const inside =
            x >= rect.left &&
            x <= rect.right &&
            y >= rect.top &&
            y <= rect.bottom;

        lessonBlocks.style.outline =
            inside
                ? "4px solid #4c97ff"
                : "";

        lessonBlocks.style.outlineOffset =
            inside
                ? "-4px"
                : "";
    }


    function finishTouchDrag(event) {

        const rect =
            lessonBlocks.getBoundingClientRect();

        const inside =
            event.clientX >= rect.left &&
            event.clientX <= rect.right &&
            event.clientY >= rect.top &&
            event.clientY <= rect.bottom;

        if (inside && touchData) {

            addBlockToWorkspace(
                touchData.text,
                touchData.category
            );
        }

        cancelTouchDrag();
    }


    function cancelTouchDrag() {

        if (touchBlock) {
            touchBlock.remove();
        }

        touchBlock = null;
        touchData = null;
        touchDragging = false;
        touchPointerId = null;

        lessonBlocks.style.outline = "";
        lessonBlocks.style.outlineOffset = "";
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

        const expected =
            lesson.blocks[currentStep];

        // Correct block
        if (
            expected &&
            normalize(text) ===
            normalize(expected.text)
        ) {

            const block =
                createScratchBlock(
                    text,
                    category,
                    true
                );

            block.classList.add(
                "workspace-block"
            );

            lessonBlocks.appendChild(
                block
            );

            blockCount.textContent =
                `${lessonBlocks.children.length} blocks`;

            currentStep++;

            showSuccess(
                "✅ Correct! Great job."
            );

            if (
                currentStep >=
                lesson.blocks.length
            ) {

                completeMission();

            } else {

                const next =
                    lesson.blocks[currentStep];

                lessonStep.textContent =
                    currentStep + 1;

                workspaceInstruction.textContent =
                    `👉 Now find and drag: ${next.text}`;

                renderPalette(
                    next.category
                );
            }

        } else {

            showError(
                `❌ Not that one. Look for: ${expected.text}`
            );

            highlightExpectedBlock();
        }
    }


    function normalize(text) {

        return text
            .toLowerCase()
            .replace(/\s+/g, " ")
            .trim();
    }


    function showSuccess(message) {

        workspaceInstruction.textContent =
            message;

        workspaceInstruction.style.color =
            "#16a34a";

        setTimeout(() => {

            workspaceInstruction.style.color =
                "";

        }, 1200);
    }


    function showError(message) {

        workspaceInstruction.textContent =
            message;

        workspaceInstruction.style.color =
            "#dc2626";

        setTimeout(() => {

            workspaceInstruction.style.color =
                "";

        }, 1800);
    }


    /* =========================================================
       HIGHLIGHT EXPECTED BLOCK
    ========================================================= */

    function highlightExpectedBlock() {

        const lesson =
            lessons[currentMission];

        const expected =
            lesson?.blocks[currentStep];

        if (!expected) return;

        document
            .querySelectorAll(
                "#blockPalette .scratch-block"
            )
            .forEach(block => {

                const matches =
                    normalize(
                        block.dataset.text
                    ) ===
                    normalize(
                        expected.text
                    );

                block.style.outline =
                    matches
                        ? "3px solid #facc15"
                        : "";

                block.style.outlineOffset =
                    matches
                        ? "2px"
                        : "";
            });
    }


    /* =========================================================
       COMPLETE MISSION
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
            "🏆 Mission complete! You learned this Scratch concept.";

        setTimeout(() => {

            if (
                completedMissions.size >= 7
            ) {

                showScreen("final");

            } else {

                showQuickCheck();
            }

        }, 1000);
    }


    /* =========================================================
       PROGRESS
    ========================================================= */

    function updateProgress() {

        const percentage =
            (completedMissions.size / 7) * 100;

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
            .querySelectorAll(".mission-card")
            .forEach(card => {

                const mission =
                    Number(card.dataset.mission);

                if (
                    completedMissions.has(
                        mission
                    )
                ) {

                    card.classList.add(
                        "completed"
                    );
                }
            });
    }


    /* =========================================================
       NEXT BUTTON — FIXED
    ========================================================= */

    document
        .getElementById("nextLessonStep")
        ?.addEventListener(
            "click",
            () => {

                const lesson =
                    lessons[currentMission];

                if (!lesson) return;

                // If all blocks are already done
                if (
                    currentStep >=
                    lesson.blocks.length
                ) {

                    completeMission();

                    return;
                }

                const expected =
                    lesson.blocks[currentStep];

                // Directly teach the next block
                workspaceInstruction.textContent =
                    `👉 Find this Scratch block: ${expected.text}`;

                lessonStep.textContent =
                    currentStep + 1;

                // Automatically open correct category
                document
                    .querySelectorAll(
                        ".block-category"
                    )
                    .forEach(button => {

                        button.classList.toggle(
                            "active",
                            button.dataset.category ===
                            expected.category
                        );
                    });

                renderPalette(
                    expected.category
                );

                highlightExpectedBlock();

                // Scroll palette to top
                blockPalette.scrollTop = 0;
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
                        .forEach(b =>
                            b.classList.remove(
                                "active"
                            )
                        );

                    button.classList.add(
                        "active"
                    );

                    renderPalette(
                        button.dataset.category
                    );
                }
            );
        });


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

        if (!blocks.length) {

            showError(
                "🧩 Drag a Scratch block into the workspace first."
            );

            return;
        }

        const preview =
            document.getElementById(
                "previewPlayer"
            );

        if (!preview) return;

        let delay = 0;

        blocks.forEach(block => {

            const action =
                getAction(
                    block.textContent
                );

            setTimeout(() => {

                executeAction(
                    action,
                    preview
                );

            }, delay);

            delay += 650;
        });
    }


    function getAction(text) {

        const lower =
            text.toLowerCase();

        if (lower.includes("move"))
            return "move";

        if (lower.includes("change x"))
            return "x";

        if (lower.includes("change y"))
            return "y";

        if (lower.includes("turn"))
            return "turn";

        if (lower.includes("costume"))
            return "costume";

        if (lower.includes("say"))
            return "say";

        if (lower.includes("sound"))
            return "sound";

        if (lower.includes("backdrop"))
            return "backdrop";

        return "none";
    }


    function executeAction(
        action,
        preview
    ) {

        switch (action) {

            case "move":

                preview.style.left =
                    "65%";

                break;

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
                    preview
                );

                break;

            case "sound":

                showBubble(
                    "🔊 Meow!",
                    preview
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


    function showBubble(
        text,
        preview
    ) {

        const stage =
            document.getElementById(
                "previewStage"
            );

        if (!stage) return;

        const bubble =
            document.createElement("div");

        bubble.textContent = text;

        bubble.style.position =
            "absolute";

        bubble.style.left =
            "52%";

        bubble.style.top =
            "25%";

        bubble.style.padding =
            "7px 10px";

        bubble.style.background =
            "white";

        bubble.style.color =
            "#111827";

        bubble.style.borderRadius =
            "10px";

        bubble.style.fontSize =
            "11px";

        bubble.style.fontWeight =
            "700";

        bubble.style.zIndex =
            "50";

        bubble.style.boxShadow =
            "0 3px 12px rgba(0,0,0,.2)";

        stage.appendChild(
            bubble
        );

        setTimeout(() => {
            bubble.remove();
        }, 1200);
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
        document.querySelectorAll(
            ".check-option"
        );


    function showQuickCheck() {

        if (!quickCheck) return;

        const checks = [

            {
                block: "move 10 steps",
                category: "motion",
                answer: "Motion"
            },

            {
                block: "say [Hello!]",
                category: "looks",
                answer: "Looks"
            },

            {
                block: "start sound [Meow]",
                category: "sound",
                answer: "Sound"
            },

            {
                block: "when green flag clicked",
                category: "events",
                answer: "Events"
            },

            {
                block: "forever",
                category: "control",
                answer: "Control"
            },

            {
                block: "touching [mouse-pointer]?",
                category: "sensing",
                answer: "Sensing"
            },

            {
                block: "pick random 1 to 10",
                category: "operators",
                answer: "Operators"
            }

        ];

        const selected =
            checks[
                Math.floor(
                    Math.random() *
                    checks.length
                )
            ];

        checkQuestion.textContent =
            "Which Scratch category contains this block?";

        checkBlock.innerHTML = "";

        checkBlock.appendChild(
            createScratchBlock(
                selected.block,
                selected.category,
                true
            )
        );

        checkResult.textContent = "";

        // RANDOMIZE ANSWER POSITIONS
        const answers = [
            "Motion",
            "Looks",
            "Sound",
            "Events"
        ];

        if (
            !answers.includes(
                selected.answer
            )
        ) {
            answers[
                Math.floor(
                    Math.random() *
                    answers.length
                )
            ] = selected.answer;
        }

        answers.sort(
            () => Math.random() - 0.5
        );

        checkOptions.forEach(
            (button, index) => {

                button.textContent =
                    answers[index] || "";

                button.onclick = () => {

                    if (
                        button.textContent ===
                        selected.answer
                    ) {

                        checkResult.textContent =
                            "✅ Correct!";

                        checkResult.style.color =
                            "#16a34a";

                        setTimeout(() => {

                            quickCheck.classList.add(
                                "hidden"
                            );

                            quickCheck.classList.remove(
                                "active"
                            );

                        }, 700);

                    } else {

                        checkResult.textContent =
                            `💡 Hint: ${selected.block} belongs to ${selected.answer}.`;

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
       BACK TO MISSIONS
    ========================================================= */

    document
        .getElementById(
            "backToMissions"
        )
        ?.addEventListener(
            "click",
            () => {

                showScreen("tutorial");
            }
        );


    /* =========================================================
       REPLAY
    ========================================================= */

    document
        .getElementById(
            "replayButton"
        )
        ?.addEventListener(
            "click",
            () => {

                completedMissions.clear();

                updateProgress();

                showScreen("tutorial");
            }
        );


    /* =========================================================
       INITIALIZE
    ========================================================= */

    renderPalette("motion");
    updateProgress();

    showScreen("intro");

});
