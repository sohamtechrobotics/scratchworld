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

    function showScreen(screen) {
        Object.values(screens).forEach(s => {
            if (s) {
                s.classList.remove("active");
                s.classList.add("hidden");
            }
        });

        if (screens[screen]) {
            screens[screen].classList.remove("hidden");
            screens[screen].classList.add("active");
        }
    }


    /* =========================================================
       INTRO
    ========================================================= */

    document.getElementById("playGameButton")?.addEventListener("click", () => {
        startGame();
        showScreen("game");
    });

    document.getElementById("tutorialButton")?.addEventListener("click", () => {
        showScreen("tutorial");
    });

    document.getElementById("revealButton")?.addEventListener("click", () => {
        showScreen("tutorial");
    });

    document.getElementById("exitGame")?.addEventListener("click", () => {
        showScreen("intro");
    });


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

    let gameRunning = false;
    let score = 0;
    let lives = 3;

    let playerX = 80;
    let playerY = 120;

    let shadowX = 500;
    let shadowY = 250;

    let keys = {};
    let gameAnimation;


    function startGame() {

        gameRunning = true;
        score = 0;
        lives = 3;

        playerX = 80;
        playerY = 120;

        shadowX = Math.max(300, window.innerWidth - 500);
        shadowY = 250;

        auraScore.textContent = score;
        livesDisplay.textContent = lives;

        portal?.classList.remove("unlocked");

        document.querySelectorAll(".aura-orb").forEach((orb, index) => {
            orb.style.display = "block";

            const positions = [
                ["20%", "25%"],
                ["45%", "70%"],
                ["70%", "25%"],
                ["78%", "65%"],
                ["35%", "45%"]
            ];

            orb.style.left = positions[index][0];
            orb.style.top = positions[index][1];
        });

        updatePlayer();

        if (gameAnimation) {
            cancelAnimationFrame(gameAnimation);
        }

        gameLoop();
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

        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 10) {

            shadowX += (dx / distance) * 0.65;
            shadowY += (dy / distance) * 0.65;
        }

        shadow.style.left = `${shadowX}px`;
        shadow.style.top = `${shadowY}px`;
    }


    function rectanglesTouch(a, b) {

        if (!a || !b) return false;

        const ar = a.getBoundingClientRect();
        const br = b.getBoundingClientRect();

        return !(
            ar.right < br.left ||
            ar.left > br.right ||
            ar.bottom < br.top ||
            ar.top > br.bottom
        );
    }


    function collectOrbs() {

        document.querySelectorAll(".aura-orb").forEach(orb => {

            if (
                orb.style.display !== "none" &&
                rectanglesTouch(player, orb)
            ) {

                orb.style.display = "none";

                score += Number(orb.dataset.value || 10);

                auraScore.textContent = score;

                if (score >= 50) {

                    portal?.classList.add("unlocked");

                    const objective =
                        document.getElementById("gameObjective");

                    if (objective) {
                        objective.textContent =
                            "PORTAL UNLOCKED! REACH THE PORTAL!";
                    }
                }
            }
        });
    }


    let lastHit = 0;

    function checkShadowCollision() {

        if (!shadow || !player) return;

        if (
            rectanglesTouch(player, shadow) &&
            Date.now() - lastHit > 1500
        ) {

            lastHit = Date.now();

            lives--;

            livesDisplay.textContent = lives;

            playerX = 80;
            playerY = 120;

            if (lives <= 0) {

                gameRunning = false;

                showGameMessage(
                    "GAME OVER 😵<br><small>Press PLAY AURA PLUS again.</small>"
                );
            }
        }
    }


    function checkPortal() {

        if (
            score >= 50 &&
            portal &&
            rectanglesTouch(player, portal)
        ) {

            gameRunning = false;

            showScreen("secret");
        }
    }


    function gameLoop() {

        if (!gameRunning) return;

        const speed = 4;

        if (keys["ArrowLeft"] || keys["a"]) {
            playerX -= speed;
        }

        if (keys["ArrowRight"] || keys["d"]) {
            playerX += speed;
        }

        if (keys["ArrowUp"] || keys["w"]) {
            playerY -= speed;
        }

        if (keys["ArrowDown"] || keys["s"]) {
            playerY += speed;
        }

        const maxX = gameWorld.clientWidth - 65;
        const maxY = gameWorld.clientHeight - 65;

        playerX = Math.max(5, Math.min(maxX, playerX));
        playerY = Math.max(5, Math.min(maxY, playerY));

        updatePlayer();
        updateShadow();
        collectOrbs();
        checkShadowCollision();
        checkPortal();

        gameAnimation = requestAnimationFrame(gameLoop);
    }


    window.addEventListener("keydown", e => {

        keys[e.key] = true;

        if (
            [
                "ArrowUp",
                "ArrowDown",
                "ArrowLeft",
                "ArrowRight"
            ].includes(e.key)
        ) {
            e.preventDefault();
        }
    });


    window.addEventListener("keyup", e => {
        keys[e.key] = false;
    });


    function showGameMessage(message) {

        if (!gameMessage) return;

        gameMessage.innerHTML = message;
        gameMessage.classList.remove("hidden");

        setTimeout(() => {
            gameMessage.classList.add("hidden");
        }, 3000);
    }


    /* =========================================================
       TOUCH / SMARTBOARD PLAYER CONTROL
    ========================================================= */

    let draggingPlayer = false;

    player?.addEventListener("pointerdown", e => {

        draggingPlayer = true;

        player.setPointerCapture?.(e.pointerId);
    });

    gameWorld?.addEventListener("pointermove", e => {

        if (!draggingPlayer) return;

        const rect = gameWorld.getBoundingClientRect();

        playerX = e.clientX - rect.left - player.offsetWidth / 2;
        playerY = e.clientY - rect.top - player.offsetHeight / 2;

        playerX = Math.max(0, Math.min(
            gameWorld.clientWidth - player.offsetWidth,
            playerX
        ));

        playerY = Math.max(0, Math.min(
            gameWorld.clientHeight - player.offsetHeight,
            playerY
        ));

        updatePlayer();
    });

    window.addEventListener("pointerup", () => {
        draggingPlayer = false;
    });


    /* =========================================================
       SCRATCH LESSON DATA
    ========================================================= */

    const lessons = {

        1: {
            title: "Working with Sprites",
            description:
                "Sprites are the characters and objects that we program in Scratch.",
            points: [
                "Add a new sprite from the Sprite pane.",
                "Select a sprite to program it.",
                "Delete a sprite when you don't need it.",
                "Each sprite can have its own scripts."
            ],
            tip:
                "A sprite is a character or object that can be programmed.",
            category: "events",
            blocks: [
                {
                    text: "when green flag clicked",
                    category: "events",
                    action: "event"
                }
            ]
        },

        2: {
            title: "Make a Sprite Move",
            description:
                "Use Motion blocks to control where your sprite moves.",
            points: [
                "Motion blocks are blue.",
                "move 10 steps moves the sprite forward.",
                "change x by 10 moves horizontally.",
                "change y by 10 moves vertically."
            ],
            tip:
                "Blue Motion blocks control the movement of a sprite.",
            category: "motion",
            blocks: [
                {
                    text: "move 10 steps",
                    category: "motion",
                    action: "move"
                },
                {
                    text: "turn ↻ 15 degrees",
                    category: "motion",
                    action: "turn"
                },
                {
                    text: "change x by 10",
                    category: "motion",
                    action: "x"
                },
                {
                    text: "change y by 10",
                    category: "motion",
                    action: "y"
                }
            ]
        },

        3: {
            title: "Change Costumes",
            description:
                "A sprite can have more than one costume. Switching costumes can create animation.",
            points: [
                "Open the Costumes tab.",
                "Add another costume.",
                "Use next costume to switch costumes.",
                "Costumes change how a sprite looks."
            ],
            tip:
                "Costumes are different appearances of the same sprite.",
            category: "looks",
            blocks: [
                {
                    text: "next costume",
                    category: "looks",
                    action: "costume"
                },
                {
                    text: "switch costume to [costume2]",
                    category: "looks",
                    action: "costume"
                }
            ]
        },

        4: {
            title: "Program Two Sprites",
            description:
                "Scratch lets us program different sprites independently.",
            points: [
                "Add another sprite.",
                "Select the sprite you want to program.",
                "Each sprite has its own scripts.",
                "Both sprites can respond to the green flag."
            ],
            tip:
                "One Scratch project can contain many independently programmed sprites.",
            category: "events",
            blocks: [
                {
                    text: "when green flag clicked",
                    category: "events",
                    action: "event"
                },
                {
                    text: "say [Hello!] for 2 seconds",
                    category: "looks",
                    action: "say"
                }
            ]
        },

        5: {
            title: "Change the Backdrop",
            description:
                "The Stage uses backdrops as its background.",
            points: [
                "Click the Stage.",
                "Open the Backdrops tab.",
                "Choose or add a backdrop.",
                "A backdrop belongs to the Stage, not a sprite."
            ],
            tip:
                "Sprite = character or object. Backdrop = Stage background.",
            category: "looks",
            blocks: [
                {
                    text: "switch backdrop to [backdrop1]",
                    category: "looks",
                    action: "backdrop"
                },
                {
                    text: "next backdrop",
                    category: "looks",
                    action: "backdrop"
                }
            ]
        },

        6: {
            title: "Working with Sounds",
            description:
                "Sounds can make your Scratch projects more interactive.",
            points: [
                "Open the Sounds tab.",
                "Choose or add a sound.",
                "Use start sound to play it.",
                "Sound blocks are pink."
            ],
            tip:
                "The Sounds tab lets you add and edit sounds for a sprite.",
            category: "sound",
            blocks: [
                {
                    text: "start sound [Meow]",
                    category: "sound",
                    action: "sound"
                },
                {
                    text: "play sound [Meow] until done",
                    category: "sound",
                    action: "sound"
                }
            ]
        },

        7: {
            title: "Build a Mini Game",
            description:
                "Now combine your Scratch skills to create a simple interactive game.",
            points: [
                "Start the project with the green flag.",
                "Move your sprite.",
                "Use another sprite as an obstacle.",
                "Use costumes, sounds and backdrops.",
                "Test your project and improve it."
            ],
            tip:
                "Good Scratch projects are built by combining small scripts.",
            category: "events",
            blocks: [
                {
                    text: "when green flag clicked",
                    category: "events",
                    action: "event"
                },
                {
                    text: "forever",
                    category: "control",
                    action: "forever"
                },
                {
                    text: "move 10 steps",
                    category: "motion",
                    action: "move"
                },
                {
                    text: "next costume",
                    category: "looks",
                    action: "costume"
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

    const lessonTitle = document.getElementById("lessonTitle");
    const lessonDescription = document.getElementById("lessonDescription");
    const lessonLearningPoints =
        document.getElementById("lessonLearningPoints");

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

    let currentMission = 1;
    let currentStep = 0;
    let completedMissions = new Set();

    let draggedBlock = null;


    /* =========================================================
       MISSION MAP
    ========================================================= */

    document.querySelectorAll(".mission-card").forEach(card => {

        card.addEventListener("click", () => {

            const mission = Number(card.dataset.mission);

            openLesson(mission);
        });
    });


    function openLesson(mission) {

        currentMission = mission;
        currentStep = 0;

        renderLesson();

        showScreen("lesson");
    }


    function renderLesson() {

        const lesson = lessons[currentMission];

        if (!lesson) return;

        lessonTitle.textContent = lesson.title;
        lessonDescription.textContent = lesson.description;
        teacherTip.textContent = lesson.tip;

        lessonNumber.textContent = currentMission;
        lessonStep.textContent = currentStep + 1;

        lessonLearningPoints.innerHTML = "";

        lesson.points.forEach(point => {

            const li = document.createElement("li");

            li.textContent = point;

            lessonLearningPoints.appendChild(li);
        });

        lessonBlocks.innerHTML = "";

        workspaceInstruction.textContent =
            "Choose a Scratch block from the palette and drag it here.";

        blockCount.textContent = "0 blocks";

        renderPalette(lesson.category);

        updateProgress();
    }


    /* =========================================================
       PALETTE RENDERING
    ========================================================= */

    function renderPalette(category) {

        if (!blockPalette) return;

        blockPalette.innerHTML = "";

        paletteCategory.textContent =
            category.charAt(0).toUpperCase() +
            category.slice(1);

        const blocks =
            paletteBlocks[category] || [];

        blocks.forEach(text => {

            const block =
                createScratchBlock(
                    text,
                    category,
                    false
                );

            blockPalette.appendChild(block);
        });
    }


    function createScratchBlock(
        text,
        category,
        workspaceBlock = false
    ) {

        const block =
            document.createElement("div");

        block.className =
            `scratch-block ${category}`;

        block.textContent = text;

        block.dataset.text = text;
        block.dataset.category = category;

        if (!workspaceBlock) {

            block.setAttribute(
                "draggable",
                "true"
            );

            block.addEventListener(
                "dragstart",
                e => {

                    draggedBlock = {
                        text,
                        category
                    };

                    e.dataTransfer.setData(
                        "text/plain",
                        JSON.stringify({
                            text,
                            category
                        })
                    );
                }
            );

            block.addEventListener(
                "pointerdown",
                startTouchDrag
            );
        }

        return block;
    }


    /* =========================================================
       DESKTOP DROP
    ========================================================= */

    lessonBlocks?.addEventListener(
        "dragover",
        e => {
            e.preventDefault();
        }
    );

    lessonBlocks?.addEventListener(
        "drop",
        e => {

            e.preventDefault();

            if (!draggedBlock) return;

            addBlockToWorkspace(
                draggedBlock.text,
                draggedBlock.category
            );

            draggedBlock = null;
        }
    );


    /* =========================================================
       TOUCH / SMARTBOARD BLOCK DRAG
    ========================================================= */

    let touchClone = null;
    let touchData = null;

    function startTouchDrag(e) {

        touchData = {
            text: e.currentTarget.dataset.text,
            category: e.currentTarget.dataset.category
        };

        touchClone =
            e.currentTarget.cloneNode(true);

        touchClone.style.position = "fixed";
        touchClone.style.zIndex = "9999";
        touchClone.style.pointerEvents = "none";
        touchClone.style.width =
            `${e.currentTarget.offsetWidth}px`;

        document.body.appendChild(touchClone);

        moveTouchClone(e);

        e.currentTarget.setPointerCapture?.(
            e.pointerId
        );

        e.currentTarget.addEventListener(
            "pointermove",
            moveTouchClone
        );

        e.currentTarget.addEventListener(
            "pointerup",
            endTouchDrag,
            { once: true }
        );
    }


    function moveTouchClone(e) {

        if (!touchClone) return;

        touchClone.style.left =
            `${e.clientX - 20}px`;

        touchClone.style.top =
            `${e.clientY - 20}px`;
    }


    function endTouchDrag(e) {

        if (!touchClone || !touchData) return;

        const workspaceRect =
            lessonBlocks.getBoundingClientRect();

        const inside =
            e.clientX >= workspaceRect.left &&
            e.clientX <= workspaceRect.right &&
            e.clientY >= workspaceRect.top &&
            e.clientY <= workspaceRect.bottom;

        if (inside) {

            addBlockToWorkspace(
                touchData.text,
                touchData.category
            );
        }

        touchClone.remove();

        touchClone = null;
        touchData = null;
    }


    /* =========================================================
       ADD BLOCK TO WORKSPACE
    ========================================================= */

    function addBlockToWorkspace(text, category) {

        const block =
            createScratchBlock(
                text,
                category,
                true
            );

        block.classList.add("workspace-block");

        lessonBlocks.appendChild(block);

        blockCount.textContent =
            `${lessonBlocks.children.length} blocks`;

        checkLessonProgress(text);
    }


    /* =========================================================
       LESSON PROGRESS
    ========================================================= */

    function checkLessonProgress(text) {

        const lesson = lessons[currentMission];

        if (!lesson) return;

        const expected =
            lesson.blocks[currentStep];

        if (!expected) return;

        if (
            normalizeBlock(text) ===
            normalizeBlock(expected.text)
        ) {

            showWorkspaceSuccess(
                "✅ Correct! That's the Scratch block we need."
            );

            currentStep++;

            lessonStep.textContent =
                Math.min(
                    currentStep + 1,
                    lesson.blocks.length
                );

            if (currentStep >= lesson.blocks.length) {

                completeMission();

            } else {

                const next =
                    lesson.blocks[currentStep];

                workspaceInstruction.textContent =
                    `Great! Now add: ${next.text}`;
            }

        } else {

            showWorkspaceError(
                `❌ Not this block yet. Think about: "${expected.text}"`
            );
        }
    }


    function normalizeBlock(text) {

        return text
            .toLowerCase()
            .replace(/\s+/g, " ")
            .trim();
    }


    function showWorkspaceSuccess(message) {

        workspaceInstruction.textContent =
            message;

        workspaceInstruction.style.color =
            "#16a34a";

        setTimeout(() => {

            workspaceInstruction.style.color =
                "";

        }, 1200);
    }


    function showWorkspaceError(message) {

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
       MISSION COMPLETION
    ========================================================= */

    function completeMission() {

        if (completedMissions.has(currentMission)) {
            return;
        }

        completedMissions.add(currentMission);

        updateProgress();

        workspaceInstruction.textContent =
            "🏆 Mission complete! You learned the Scratch concept.";

        setTimeout(() => {

            if (completedMissions.size >= 7) {

                showScreen("final");

            } else {

                showQuickCheck();
            }

        }, 900);
    }


    function updateProgress() {

        const progress =
            (completedMissions.size / 7) * 100;

        const bar =
            document.getElementById("auraProgress");

        const counter =
            document.getElementById("tutorialAura");

        if (bar) {
            bar.style.width =
                `${progress}%`;
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

                if (completedMissions.has(mission)) {

                    card.classList.add("completed");

                    if (!card.querySelector(".mission-complete")) {

                        const mark =
                            document.createElement("span");

                        mark.className =
                            "mission-complete";

                        mark.textContent = "✓";

                        card.appendChild(mark);
                    }
                }
            });
    }


    /* =========================================================
       QUICK CHECK
    ========================================================= */

    const quickCheck =
        document.getElementById("quickCheck");

    const checkQuestion =
        document.getElementById("checkQuestion");

    const checkBlock =
        document.getElementById("checkBlock");

    const checkOptions =
        document.querySelectorAll(".check-option");

    const checkResult =
        document.getElementById("checkResult");


    function showQuickCheck() {

        if (!quickCheck) return;

        const checks = [

            {
                block: "move 10 steps",
                answer: "Motion"
            },

            {
                block: "say [Hello!]",
                answer: "Looks"
            },

            {
                block: "start sound [Meow]",
                answer: "Sound"
            },

            {
                block: "when green flag clicked",
                answer: "Events"
            },

            {
                block: "forever",
                answer: "Control"
            },

            {
                block: "touching [mouse-pointer]?",
                answer: "Sensing"
            },

            {
                block: "pick random 1 to 10",
                answer: "Operators"
            }

        ];

        const check =
            checks[
                Math.floor(
                    Math.random() * checks.length
                )
            ];

        checkQuestion.textContent =
            "Which Scratch category contains this block?";

        checkBlock.innerHTML = "";

        const block =
            createScratchBlock(
                check.block,
                check.answer.toLowerCase(),
                true
            );

        checkBlock.appendChild(block);

        checkResult.textContent = "";

        checkOptions.forEach(option => {

            option.onclick = () => {

                if (
                    option.textContent.trim() ===
                    check.answer
                ) {

                    checkResult.textContent =
                        "✅ Correct! You know your Scratch blocks!";

                    checkResult.style.color =
                        "#16a34a";

                    setTimeout(() => {

                        quickCheck.classList.add(
                            "hidden"
                        );

                        quickCheck.classList.remove(
                            "active"
                        );

                    }, 900);

                } else {

                    checkResult.textContent =
                        `💡 Hint: "${check.block}" belongs to ${check.answer}.`;

                    checkResult.style.color =
                        "#dc2626";
                }
            };
        });

        quickCheck.classList.remove("hidden");
        quickCheck.classList.add("active");
    }


    /* =========================================================
       CATEGORY BUTTONS
    ========================================================= */

    document
        .querySelectorAll(".block-category")
        .forEach(button => {

            button.addEventListener("click", () => {

                document
                    .querySelectorAll(".block-category")
                    .forEach(b =>
                        b.classList.remove("active")
                    );

                button.classList.add("active");

                renderPalette(
                    button.dataset.category
                );
            });
        });


    /* =========================================================
       SHOW NEXT BLOCK
    ========================================================= */

    document
        .getElementById("showBlockButton")
        ?.addEventListener("click", () => {

            const lesson =
                lessons[currentMission];

            if (!lesson) return;

            const expected =
                lesson.blocks[currentStep];

            if (!expected) {

                workspaceInstruction.textContent =
                    "🏆 You already completed this mission.";

                return;
            }

            workspaceInstruction.textContent =
                `👀 Find this exact Scratch block: ${expected.text}`;

            renderPalette(expected.category);

            document
                .querySelectorAll(".scratch-block")
                .forEach(block => {

                    if (
                        normalizeBlock(
                            block.dataset.text || ""
                        ) ===
                        normalizeBlock(
                            expected.text
                        )
                    ) {

                        block.style.outline =
                            "4px solid #facc15";

                        block.style.transform =
                            "scale(1.05)";

                        setTimeout(() => {

                            block.style.outline = "";
                            block.style.transform = "";

                        }, 2200);
                    }
                });
        });


    /* =========================================================
       RUN LESSON
    ========================================================= */

    document
        .getElementById("runLessonButton")
        ?.addEventListener("click", runWorkspace);


    function runWorkspace() {

        const blocks =
            [...lessonBlocks.children];

        if (!blocks.length) {

            workspaceInstruction.textContent =
                "🧩 Drag a Scratch block into the workspace first.";

            return;
        }

        const preview =
            document.getElementById("previewPlayer");

        if (!preview) return;

        let delay = 0;

        blocks.forEach(block => {

            const action =
                findAction(
                    block.textContent
                );

            setTimeout(() => {

                executeAction(
                    action,
                    preview
                );

            }, delay);

            delay += 700;
        });
    }


    function findAction(text) {

        const lower =
            text.toLowerCase();

        if (lower.includes("move")) return "move";
        if (lower.includes("change x")) return "x";
        if (lower.includes("change y")) return "y";
        if (lower.includes("turn")) return "turn";
        if (lower.includes("costume")) return "costume";
        if (lower.includes("say")) return "say";
        if (lower.includes("sound")) return "sound";
        if (lower.includes("backdrop")) return "backdrop";

        return "none";
    }


    function executeAction(action, preview) {

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

                showLessonBubble(
                    preview,
                    "Hello!"
                );

                break;

            case "sound":

                showLessonBubble(
                    preview,
                    "🔊 Sound!"
                );

                break;

            case "backdrop":

                document
                    .getElementById("previewStage")
                    ?.classList.toggle(
                        "alternate-backdrop"
                    );

                break;
        }
    }


    function showLessonBubble(target, text) {

        const bubble =
            document.createElement("div");

        bubble.textContent = text;

        bubble.style.position = "absolute";
        bubble.style.left = "55%";
        bubble.style.top = "30%";
        bubble.style.background = "white";
        bubble.style.color = "#111827";
        bubble.style.padding = "7px 10px";
        bubble.style.borderRadius = "10px";
        bubble.style.fontSize = "11px";
        bubble.style.fontWeight = "700";
        bubble.style.zIndex = "20";
        bubble.style.boxShadow =
            "0 3px 12px rgba(0,0,0,.2)";

        const stage =
            document.getElementById("previewStage");

        if (!stage) return;

        stage.appendChild(bubble);

        setTimeout(() => {
            bubble.remove();
        }, 1200);
    }


    /* =========================================================
       NEXT LESSON STEP
    ========================================================= */

    document
        .getElementById("nextLessonStep")
        ?.addEventListener("click", () => {

            const lesson =
                lessons[currentMission];

            if (!lesson) return;

            if (
                currentStep <
                lesson.blocks.length
            ) {

                const expected =
                    lesson.blocks[currentStep];

                workspaceInstruction.textContent =
                    `👉 Now find and drag: ${expected.text}`;

                renderPalette(expected.category);

                lessonStep.textContent =
                    currentStep + 1;

            } else {

                completeMission();
            }
        });


    /* =========================================================
       BACK TO MISSIONS
    ========================================================= */

    document
        .getElementById("backToMissions")
        ?.addEventListener("click", () => {

            showScreen("tutorial");
        });


    /* =========================================================
       FINAL REPLAY
    ========================================================= */

    document
        .getElementById("replayButton")
        ?.addEventListener("click", () => {

            completedMissions.clear();

            updateProgress();

            showScreen("tutorial");
        });


    /* =========================================================
       INITIALIZE
    ========================================================= */

    renderPalette("motion");
    updateProgress();

    showScreen("intro");

});
