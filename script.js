document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       SCREEN REFERENCES
    ====================================================== */

    const introScreen = document.getElementById("introScreen");
    const gameScreen = document.getElementById("gameScreen");
    const secretScreen = document.getElementById("secretScreen");
    const tutorialScreen = document.getElementById("tutorialScreen");
    const lessonScreen = document.getElementById("lessonScreen");
    const codeLabScreen = document.getElementById("codeLabScreen");
    const finalScreen = document.getElementById("finalScreen");

    const screens = [
        introScreen,
        gameScreen,
        secretScreen,
        tutorialScreen,
        lessonScreen,
        codeLabScreen,
        finalScreen
    ];


    function showScreen(screen) {
        screens.forEach(s => {
            if (s) s.classList.add("hidden");
        });

        if (screen) {
            screen.classList.remove("hidden");
        }
    }


    /* =====================================================
       INTRO BUTTONS
    ====================================================== */

    const playGameButton = document.getElementById("playGameButton");
    const tutorialButton = document.getElementById("tutorialButton");

    playGameButton?.addEventListener("click", () => {
        resetGame();
        showScreen(gameScreen);
        setTimeout(() => {
            gameWorld?.focus();
        }, 100);
    });

    tutorialButton?.addEventListener("click", () => {
        showScreen(tutorialScreen);
    });


    /* =====================================================
       GAME
    ====================================================== */

    const gameWorld = document.getElementById("gameWorld");
    const player = document.getElementById("player");
    const shadow = document.getElementById("shadow");
    const portal = document.getElementById("portal");

    const auraScoreDisplay = document.getElementById("auraScore");
    const livesDisplay = document.getElementById("lives");
    const gameMessage = document.getElementById("gameMessage");
    const gameObjective = document.getElementById("gameObjective");

    const exitGame = document.getElementById("exitGame");

    let auraScore = 0;
    let lives = 3;

    let playerX = 12;
    let playerY = 70;

    let gameRunning = false;
    let playerInvincible = false;

    const pressedKeys = new Set();


    function resetGame() {

        auraScore = 0;
        lives = 3;

        playerX = 12;
        playerY = 70;

        gameRunning = true;
        playerInvincible = false;

        if (player) {
            player.style.left = playerX + "%";
            player.style.top = playerY + "%";
            player.style.bottom = "auto";
            player.style.display = "grid";
        }

        document.querySelectorAll(".aura-orb").forEach(orb => {
            orb.style.display = "grid";
            orb.dataset.collected = "false";
        });

        if (portal) {
            portal.classList.add("locked");
            portal.classList.remove("active");

            const text = portal.querySelector("span");

            if (text) {
                text.textContent = "LOCKED";
            }
        }

        updateGameUI();

        if (gameObjective) {
            gameObjective.textContent = "COLLECT THE AURA ORBS";
        }
    }


    function updateGameUI() {

        if (auraScoreDisplay) {
            auraScoreDisplay.textContent = auraScore;
        }

        if (livesDisplay) {

            if (lives <= 0) {
                livesDisplay.textContent = "💀";
            } else {
                livesDisplay.textContent = "❤️".repeat(lives);
            }
        }
    }


    function showGameMessage(text, duration = 1200) {

        if (!gameMessage) return;

        gameMessage.textContent = text;
        gameMessage.classList.add("show");

        clearTimeout(showGameMessage.timer);

        showGameMessage.timer = setTimeout(() => {
            gameMessage.classList.remove("show");
        }, duration);
    }


    /* =====================================================
       KEYBOARD MOVEMENT
    ====================================================== */

    document.addEventListener("keydown", event => {

        if (!gameScreen || gameScreen.classList.contains("hidden")) {
            return;
        }

        const validKeys = [
            "ArrowUp",
            "ArrowDown",
            "ArrowLeft",
            "ArrowRight",
            "w",
            "a",
            "s",
            "d"
        ];

        if (validKeys.includes(event.key)) {
            event.preventDefault();
            pressedKeys.add(event.key.toLowerCase());
        }
    });


    document.addEventListener("keyup", event => {
        pressedKeys.delete(event.key.toLowerCase());
    });


    function movePlayer() {

        if (!gameRunning || !player) return;

        const speed = 0.55;

        if (
            pressedKeys.has("arrowleft") ||
            pressedKeys.has("a")
        ) {
            playerX -= speed;
        }

        if (
            pressedKeys.has("arrowright") ||
            pressedKeys.has("d")
        ) {
            playerX += speed;
        }

        if (
            pressedKeys.has("arrowup") ||
            pressedKeys.has("w")
        ) {
            playerY -= speed;
        }

        if (
            pressedKeys.has("arrowdown") ||
            pressedKeys.has("s")
        ) {
            playerY += speed;
        }

        playerX = Math.max(0, Math.min(92, playerX));
        playerY = Math.max(0, Math.min(86, playerY));

        player.style.left = playerX + "%";
        player.style.top = playerY + "%";
    }


    /* =====================================================
       COLLISION
    ====================================================== */

    function isColliding(elementA, elementB) {

        if (!elementA || !elementB) return false;

        if (
            elementA.style.display === "none" ||
            elementB.style.display === "none"
        ) {
            return false;
        }

        const a = elementA.getBoundingClientRect();
        const b = elementB.getBoundingClientRect();

        const padding = 10;

        return !(
            a.right - padding < b.left + padding ||
            a.left + padding > b.right - padding ||
            a.bottom - padding < b.top + padding ||
            a.top + padding > b.bottom - padding
        );
    }


    function checkOrbCollisions() {

        document.querySelectorAll(".aura-orb").forEach(orb => {

            if (
                orb.dataset.collected !== "true" &&
                isColliding(player, orb)
            ) {

                orb.dataset.collected = "true";
                orb.style.display = "none";

                auraScore += Number(orb.dataset.aura || 10);

                updateGameUI();

                showGameMessage("⚡ +10 AURA");

                pulsePlayer();

                if (auraScore >= 50) {
                    activatePortal();
                }
            }
        });
    }


    function pulsePlayer() {

        if (!player) return;

        player.animate(
            [
                { transform: "scale(1)" },
                { transform: "scale(1.35)" },
                { transform: "scale(1)" }
            ],
            {
                duration: 350,
                easing: "ease"
            }
        );
    }


    /* =====================================================
       PORTAL
    ====================================================== */

    function activatePortal() {

        if (!portal) return;

        if (!portal.classList.contains("active")) {

            portal.classList.remove("locked");
            portal.classList.add("active");

            const text = portal.querySelector("span");

            if (text) {
                text.textContent = "ENTER";
            }

            if (gameObjective) {
                gameObjective.textContent = "⚡ PORTAL UNLOCKED — REACH IT!";
            }

            showGameMessage("🌀 PORTAL UNLOCKED!", 1800);
        }
    }


    function checkPortalCollision() {

        if (
            auraScore >= 50 &&
            portal?.classList.contains("active") &&
            isColliding(player, portal)
        ) {

            gameRunning = false;

            showGameMessage("⚡ AURA PLUS!", 1200);

            setTimeout(() => {
                showScreen(secretScreen);
            }, 1000);
        }
    }


    /* =====================================================
       SHADOW
    ====================================================== */

    let shadowAngle = 0;


    function moveShadow() {

        if (!gameRunning || !shadow || !gameWorld) return;

        shadowAngle += 0.018;

        const x = 72 + Math.sin(shadowAngle) * 12;
        const y = 54 + Math.cos(shadowAngle * 1.3) * 20;

        shadow.style.left = x + "%";
        shadow.style.top = y + "%";

        shadow.style.right = "auto";
        shadow.style.bottom = "auto";
    }


    function checkShadowCollision() {

        if (
            !gameRunning ||
            playerInvincible ||
            !isColliding(player, shadow)
        ) {
            return;
        }

        playerInvincible = true;

        lives--;

        updateGameUI();

        showGameMessage("💥 SHADOW HIT!");

        if (player) {
            player.style.opacity = "0.35";

            setTimeout(() => {
                player.style.opacity = "1";
            }, 700);
        }

        playerX = 8;
        playerY = 75;

        if (lives <= 0) {

            gameRunning = false;

            if (gameObjective) {
                gameObjective.textContent = "GAME OVER";
            }

            showGameMessage("💀 GAME OVER", 2000);

            setTimeout(() => {
                resetGame();
            }, 2200);

            return;
        }

        setTimeout(() => {
            playerInvincible = false;
        }, 1200);
    }


    /* =====================================================
       GAME LOOP
    ====================================================== */

    function gameLoop() {

        if (
            gameScreen &&
            !gameScreen.classList.contains("hidden")
        ) {

            movePlayer();
            moveShadow();

            checkOrbCollisions();
            checkShadowCollision();
            checkPortalCollision();
        }

        requestAnimationFrame(gameLoop);
    }

    gameLoop();


    /* =====================================================
       EXIT GAME
    ====================================================== */

    exitGame?.addEventListener("click", () => {
        gameRunning = false;
        showScreen(introScreen);
    });


    /* =====================================================
       TOUCH / SMARTBOARD PLAYER CONTROL
    ====================================================== */

    let draggingPlayer = false;


    player?.addEventListener("pointerdown", event => {

        if (
            !gameScreen ||
            gameScreen.classList.contains("hidden")
        ) {
            return;
        }

        draggingPlayer = true;

        player.setPointerCapture?.(event.pointerId);

        event.preventDefault();
    });


    player?.addEventListener("pointermove", event => {

        if (!draggingPlayer || !gameWorld) return;

        const rect = gameWorld.getBoundingClientRect();

        let x =
            ((event.clientX - rect.left) / rect.width) * 100;

        let y =
            ((event.clientY - rect.top) / rect.height) * 100;

        x -= 3;
        y -= 5;

        playerX = Math.max(0, Math.min(92, x));
        playerY = Math.max(0, Math.min(86, y));

        player.style.left = playerX + "%";
        player.style.top = playerY + "%";

        event.preventDefault();
    });


    player?.addEventListener("pointerup", event => {

        draggingPlayer = false;

        player.releasePointerCapture?.(event.pointerId);
    });


    player?.addEventListener("pointercancel", () => {
        draggingPlayer = false;
    });


    /* =====================================================
       SECRET SCREEN
    ====================================================== */

    const revealButton = document.getElementById("revealButton");

    revealButton?.addEventListener("click", () => {
        showScreen(tutorialScreen);
    });


    /* =====================================================
       TUTORIAL DATA
    ====================================================== */

    const lessons = {

        1: {
            number: "MISSION 01",
            title: "CREATE AURA",
            heading: "CREATE YOUR PLAYER",
            description:
                "Every game needs a hero. In Scratch, characters and objects are called sprites.",
            concept:
                "Adding, selecting and deleting sprites",
            aura: 10,
            blocks: [
                {
                    className: "event-block",
                    text: "🟢 when green flag clicked"
                },
                {
                    className: "looks-block",
                    text: "show"
                }
            ]
        },

        2: {
            number: "MISSION 02",
            title: "MAKE IT MOVE",
            heading: "PROGRAM THE PLAYER",
            description:
                "Movement happens by changing the sprite's position. X controls left and right. Y controls up and down.",
            concept:
                "Motion blocks and sprite movement",
            aura: 20,
            blocks: [
                {
                    className: "event-block",
                    text: "🟢 when green flag clicked"
                },
                {
                    className: "control-block",
                    text: "forever"
                },
                {
                    className: "sensing-block",
                    text: "if key → pressed?"
                },
                {
                    className: "motion-block",
                    text: "change x by 10"
                }
            ]
        },

        3: {
            number: "MISSION 03",
            title: "AURA ORBS",
            heading: "ADD MULTIPLE SPRITES",
            description:
                "A game world feels alive when several sprites interact with each other.",
            concept:
                "Working with multiple sprites",
            aura: 35,
            blocks: [
                {
                    className: "event-block",
                    text: "🟢 when green flag clicked"
                },
                {
                    className: "control-block",
                    text: "forever"
                },
                {
                    className: "sensing-block",
                    text: "if touching Aura?"
                },
                {
                    className: "looks-block",
                    text: "hide"
                }
            ]
        },

        4: {
            number: "MISSION 04",
            title: "THE SHADOW",
            heading: "PROGRAM A SECOND SPRITE",
            description:
                "Each sprite can have its own script. The player can move one way while another sprite follows a different program.",
            concept:
                "Programming two sprites",
            aura: 50,
            blocks: [
                {
                    className: "event-block",
                    text: "🟢 when green flag clicked"
                },
                {
                    className: "control-block",
                    text: "forever"
                },
                {
                    className: "motion-block",
                    text: "move 5 steps"
                }
            ]
        },

        5: {
            number: "MISSION 05",
            title: "LIVES",
            heading: "CREATE A CHALLENGE",
            description:
                "Games become exciting when actions have consequences. Touching the Shadow removes a life.",
            concept:
                "Sprite interaction and variables",
            aura: 65,
            blocks: [
                {
                    className: "sensing-block",
                    text: "if touching Shadow?"
                },
                {
                    className: "control-block",
                    text: "change Lives by -1"
                }
            ]
        },

        6: {
            number: "MISSION 06",
            title: "THE PORTAL",
            heading: "CREATE THE GOAL",
            description:
                "When enough Aura is collected, the portal activates and gives the player a final destination.",
            concept:
                "Conditions and game goals",
            aura: 80,
            blocks: [
                {
                    className: "control-block",
                    text: "if Aura = 50"
                },
                {
                    className: "looks-block",
                    text: "show Portal"
                }
            ]
        },

        7: {
            number: "MISSION 07",
            title: "AURA PLUS",
            heading: "TRANSFORM THE GAME",
            description:
                "Costumes, backdrops and sounds can completely change how a Scratch project feels.",
            concept:
                "Costumes, backdrops and sounds",
            aura: 100,
            blocks: [
                {
                    className: "looks-block",
                    text: "switch costume to AURA PLUS"
                },
                {
                    className: "sound-block",
                    text: "start sound Power Up"
                },
                {
                    className: "looks-block",
                    text: "switch backdrop to Victory"
                }
            ]
        }

    };


    /* =====================================================
       MISSIONS
    ====================================================== */

    const missionCards =
        document.querySelectorAll(".mission-card");

    const lessonNumber =
        document.getElementById("lessonNumber");

    const lessonTitle =
        document.getElementById("lessonTitle");

    const lessonHeading =
        document.getElementById("lessonHeading");

    const lessonDescription =
        document.getElementById("lessonDescription");

    const lessonConcept =
        document.getElementById("lessonConcept");

    const lessonBlocks =
        document.getElementById("lessonBlocks");

    const lessonAura =
        document.querySelector(".lesson-aura");

    const auraProgress =
        document.getElementById("auraProgress");

    const tutorialAura =
        document.getElementById("tutorialAura");

    let tutorialProgress = 0;
    let currentMission = 1;


    missionCards.forEach(card => {

        card.addEventListener("click", () => {

            const mission =
                Number(card.dataset.mission);

            openMission(mission);
        });
    });


    function openMission(number) {

        currentMission = number;

        const lesson = lessons[number];

        if (!lesson) return;

        if (lessonNumber) {
            lessonNumber.textContent = lesson.number;
        }

        if (lessonTitle) {
            lessonTitle.textContent = lesson.title;
        }

        if (lessonHeading) {
            lessonHeading.textContent = lesson.heading;
        }

        if (lessonDescription) {
            lessonDescription.textContent =
                lesson.description;
        }

        if (lessonConcept) {
            lessonConcept.textContent =
                lesson.concept;
        }

        if (lessonAura) {
            lessonAura.textContent =
                `+${lesson.aura}% AURA`;
        }

        renderLessonBlocks(lesson.blocks);

        resetGuessBox();

        showScreen(lessonScreen);
    }


    function renderLessonBlocks(blocks) {

        if (!lessonBlocks) return;

        lessonBlocks.innerHTML = "";

        blocks.forEach((block, index) => {

            const element =
                document.createElement("div");

            element.className =
                `scratch-block ${block.className}`;

            element.textContent =
                block.text;

            element.style.opacity = "0";
            element.style.transform =
                "translateX(-20px)";

            lessonBlocks.appendChild(element);

            setTimeout(() => {

                element.style.transition =
                    "0.35s ease";

                element.style.opacity = "1";
                element.style.transform =
                    "translateX(0)";

            }, 120 * index);

        });
    }


    /* =====================================================
       BACK TO MISSIONS
    ====================================================== */

    const backToMissions =
        document.getElementById("backToMissions");

    backToMissions?.addEventListener("click", () => {
        showScreen(tutorialScreen);
    });


    /* =====================================================
       SHOW BLOCK BUTTON
    ====================================================== */

    const showBlockButton =
        document.getElementById("showBlockButton");

    showBlockButton?.addEventListener("click", () => {

        const blocks =
            lessonBlocks?.querySelectorAll(".scratch-block");

        blocks?.forEach((block, index) => {

            setTimeout(() => {

                block.animate(
                    [
                        { transform: "scale(1)" },
                        { transform: "scale(1.08)" },
                        { transform: "scale(1)" }
                    ],
                    {
                        duration: 420
                    }
                );

            }, index * 110);
        });
    });


    /* =====================================================
       GUESS THE BLOCK
    ====================================================== */

    const guessButtons =
        document.querySelectorAll(
            ".guess-options button"
        );

    const guessResult =
        document.getElementById("guessResult");


    guessButtons.forEach(button => {

        button.addEventListener("click", () => {

            const answer =
                button.dataset.answer;

            if (answer === "correct") {

                if (guessResult) {

                    guessResult.textContent =
                        "⚡ CORRECT! +10 AURA";

                    guessResult.style.color =
                        "#c084fc";
                }

                tutorialProgress =
                    Math.max(
                        tutorialProgress,
                        lessons[currentMission]?.aura || 0
                    );

                updateTutorialProgress();

                button.style.borderColor =
                    "#a855f7";

                button.style.background =
                    "rgba(168,85,247,.16)";


                setTimeout(() => {

                    if (currentMission < 7) {

                        showScreen(tutorialScreen);

                    } else {

                        showScreen(finalScreen);
                    }

                }, 1200);

            } else {

                if (guessResult) {

                    guessResult.textContent =
                        "Not quite — look at what X controls 👀";

                    guessResult.style.color =
                        "#fca5a5";
                }

                button.animate(
                    [
                        { transform: "translateX(0)" },
                        { transform: "translateX(-5px)" },
                        { transform: "translateX(5px)" },
                        { transform: "translateX(0)" }
                    ],
                    {
                        duration: 250
                    }
                );
            }
        });
    });


    function resetGuessBox() {

        if (guessResult) {
            guessResult.textContent = "";
        }

        guessButtons.forEach(button => {
            button.style.borderColor = "";
            button.style.background = "";
        });
    }


    function updateTutorialProgress() {

        if (auraProgress) {
            auraProgress.style.width =
                tutorialProgress + "%";
        }

        if (tutorialAura) {
            tutorialAura.textContent =
                tutorialProgress + "%";
        }

        missionCards.forEach(card => {

            const number =
                Number(card.dataset.mission);

            const required =
                lessons[number]?.aura || 0;

            if (tutorialProgress >= required) {
                card.classList.add("active");
            }
        });
    }


    /* =====================================================
       CODE LAB
    ====================================================== */

    const blockPalette =
        document.getElementById("blockPalette");

    const blockCategories =
        document.querySelectorAll(
            ".block-category"
        );

    const workspace =
        document.getElementById("workspace");

    const runCode =
        document.getElementById("runCode");

    const clearCode =
        document.getElementById("clearCode");

    const previewPlayer =
        document.getElementById("previewPlayer");


    const paletteData = {

        motion: [
            {
                text: "move 10 steps",
                className: "motion-block",
                type: "move"
            },
            {
                text: "change x by 10",
                className: "motion-block",
                type: "right"
            },
            {
                text: "change y by 10",
                className: "motion-block",
                type: "up"
            }
        ],

        looks: [
            {
                text: "say Hello!",
                className: "looks-block",
                type: "say"
            },
            {
                text: "switch costume",
                className: "looks-block",
                type: "costume"
            }
        ],

        sound: [
            {
                text: "play sound Power Up",
                className: "sound-block",
                type: "sound"
            }
        ],

        events: [
            {
                text: "🟢 when green flag clicked",
                className: "event-block",
                type: "flag"
            }
        ],

        control: [
            {
                text: "wait 1 seconds",
                className: "control-block",
                type: "wait"
            },
            {
                text: "repeat 5",
                className: "control-block",
                type: "repeat"
            }
        ]
    };


    function renderPalette(category = "motion") {

        if (!blockPalette) return;

        blockPalette.innerHTML = "";

        const blocks =
            paletteData[category] || [];

        blocks.forEach(block => {

            const element =
                createInteractiveBlock(block);

            blockPalette.appendChild(element);
        });
    }


    function createInteractiveBlock(block) {

        const element =
            document.createElement("div");

        element.className =
            `scratch-block ${block.className}`;

        element.textContent =
            block.text;

        element.dataset.type =
            block.type;

        element.dataset.blockClass =
            block.className;

        element.style.touchAction =
            "none";

        enablePalettePointerDrag(element);

        element.addEventListener("dblclick", () => {
            addBlockToWorkspace(block);
        });

        return element;
    }


    blockCategories.forEach(button => {

        button.addEventListener("click", () => {

            blockCategories.forEach(b =>
                b.classList.remove("active")
            );

            button.classList.add("active");

            renderPalette(
                button.dataset.category
            );
        });
    });


    /* =====================================================
       MOUSE + TOUCH BLOCK DRAGGING
    ====================================================== */

    let dragGhost = null;
    let draggedBlockData = null;


    function enablePalettePointerDrag(element) {

        element.addEventListener(
            "pointerdown",
            event => {

                if (
                    event.pointerType === "mouse" &&
                    event.button !== 0
                ) {
                    return;
                }

                const rect =
                    element.getBoundingClientRect();

                draggedBlockData = {
                    text: element.textContent,
                    className:
                        element.dataset.blockClass,
                    type:
                        element.dataset.type
                };

                dragGhost =
                    element.cloneNode(true);

                dragGhost.style.position =
                    "fixed";

                dragGhost.style.left =
                    rect.left + "px";

                dragGhost.style.top =
                    rect.top + "px";

                dragGhost.style.width =
                    rect.width + "px";

                dragGhost.style.zIndex =
                    "99999";

                dragGhost.style.pointerEvents =
                    "none";

                dragGhost.style.opacity =
                    "0.92";

                dragGhost.style.transform =
                    "scale(1.05) rotate(-1deg)";

                dragGhost.style.boxShadow =
                    "0 18px 50px rgba(0,0,0,.45)";

                document.body.appendChild(
                    dragGhost
                );

                element.setPointerCapture?.(
                    event.pointerId
                );

                event.preventDefault();
            }
        );


        element.addEventListener(
            "pointermove",
            event => {

                if (!dragGhost) return;

                dragGhost.style.left =
                    event.clientX -
                    dragGhost.offsetWidth / 2 +
                    "px";

                dragGhost.style.top =
                    event.clientY -
                    dragGhost.offsetHeight / 2 +
                    "px";

                event.preventDefault();
            }
        );


        element.addEventListener(
            "pointerup",
            event => {

                if (!dragGhost) return;

                const workspaceRect =
                    workspace?.getBoundingClientRect();

                const insideWorkspace =
                    workspaceRect &&
                    event.clientX >=
                        workspaceRect.left &&
                    event.clientX <=
                        workspaceRect.right &&
                    event.clientY >=
                        workspaceRect.top &&
                    event.clientY <=
                        workspaceRect.bottom;

                if (
                    insideWorkspace &&
                    draggedBlockData
                ) {

                    addBlockToWorkspace(
                        draggedBlockData
                    );
                }

                dragGhost.remove();

                dragGhost = null;
                draggedBlockData = null;

                element.releasePointerCapture?.(
                    event.pointerId
                );
            }
        );


        element.addEventListener(
            "pointercancel",
            () => {

                dragGhost?.remove();

                dragGhost = null;
                draggedBlockData = null;
            }
        );
    }


    function addBlockToWorkspace(block) {

        if (!workspace) return;

        const element =
            document.createElement("div");

        element.className =
            `scratch-block ${block.className}`;

        element.textContent =
            block.text;

        element.dataset.type =
            block.type;

        element.style.marginBottom =
            "6px";

        element.style.width =
            "fit-content";

        element.style.touchAction =
            "manipulation";


        element.addEventListener(
            "dblclick",
            () => {

                if (
                    element.dataset.type !==
                    "flag"
                ) {
                    element.remove();
                }
            }
        );


        element.addEventListener(
            "contextmenu",
            event => {

                event.preventDefault();

                if (
                    element.dataset.type !==
                    "flag"
                ) {
                    element.remove();
                }
            }
        );


        const hint =
            workspace.querySelector(
                ".workspace-hint"
            );

        if (hint) {

            workspace.insertBefore(
                element,
                hint
            );

        } else {

            workspace.appendChild(element);
        }

        element.animate(
            [
                {
                    opacity: 0,
                    transform: "scale(.9)"
                },
                {
                    opacity: 1,
                    transform: "scale(1)"
                }
            ],
            {
                duration: 220
            }
        );
    }


    /* =====================================================
       RUN CODE LAB
    ====================================================== */

    runCode?.addEventListener("click", async () => {

        if (!workspace || !previewPlayer) return;

        const blocks =
            Array.from(
                workspace.querySelectorAll(
                    ".scratch-block"
                )
            );

        let x = 45;
        let y = 45;

        previewPlayer.style.left =
            x + "%";

        previewPlayer.style.top =
            y + "%";

        previewPlayer.textContent =
            "🧙";


        for (const block of blocks) {

            const type =
                block.dataset.type;

            block.style.filter =
                "brightness(1.4)";

            await sleep(300);


            if (type === "move") {

                x += 8;

            } else if (type === "right") {

                x += 10;

            } else if (type === "up") {

                y -= 10;

            } else if (type === "say") {

                previewPlayer.textContent =
                    "💬";

                await sleep(700);

                previewPlayer.textContent =
                    "🧙";

            } else if (type === "costume") {

                previewPlayer.textContent =
                    "🦸";

            } else if (type === "sound") {

                playPowerSound();

            } else if (type === "wait") {

                await sleep(1000);

            } else if (type === "repeat") {

                for (let i = 0; i < 5; i++) {

                    x += 3;

                    previewPlayer.style.left =
                        x + "%";

                    await sleep(100);
                }
            }


            x = Math.max(
                0,
                Math.min(85, x)
            );

            y = Math.max(
                0,
                Math.min(85, y)
            );

            previewPlayer.style.left =
                x + "%";

            previewPlayer.style.top =
                y + "%";

            block.style.filter = "";

            await sleep(170);
        }

        previewPlayer.animate(
            [
                { transform: "scale(1)" },
                { transform: "scale(1.18)" },
                { transform: "scale(1)" }
            ],
            {
                duration: 350
            }
        );
    });


    function sleep(ms) {

        return new Promise(resolve =>
            setTimeout(resolve, ms)
        );
    }


    /* =====================================================
       SIMPLE SOUND
    ====================================================== */

    function playPowerSound() {

        try {

            const AudioContext =
                window.AudioContext ||
                window.webkitAudioContext;

            const audioContext =
                new AudioContext();

            const oscillator =
                audioContext.createOscillator();

            const gain =
                audioContext.createGain();

            oscillator.type =
                "sine";

            oscillator.frequency.setValueAtTime(
                420,
                audioContext.currentTime
            );

            oscillator.frequency.exponentialRampToValueAtTime(
                900,
                audioContext.currentTime + 0.25
            );

            gain.gain.setValueAtTime(
                0.13,
                audioContext.currentTime
            );

            gain.gain.exponentialRampToValueAtTime(
                0.001,
                audioContext.currentTime + 0.35
            );

            oscillator.connect(gain);

            gain.connect(
                audioContext.destination
            );

            oscillator.start();

            oscillator.stop(
                audioContext.currentTime +
                0.35
            );

        } catch (error) {

            console.log(
                "Audio unavailable",
                error
            );
        }
    }


    /* =====================================================
       CLEAR CODE
    ====================================================== */

    clearCode?.addEventListener("click", () => {

        if (!workspace) return;

        workspace
            .querySelectorAll(
                ".scratch-block"
            )
            .forEach(block => {

                if (
                    block.dataset.type !==
                    "flag"
                ) {
                    block.remove();
                }
            });
    });


    /* =====================================================
       FINAL SCREEN
    ====================================================== */

    const replayButton =
        document.getElementById("replayButton");

    replayButton?.addEventListener("click", () => {

        tutorialProgress = 0;

        updateTutorialProgress();

        showScreen(introScreen);
    });


    /* =====================================================
       INITIALIZE
    ====================================================== */

    renderPalette("motion");
    updateGameUI();
    updateTutorialProgress();

});
