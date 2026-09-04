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
       FULL AURA PLUS LESSON DATA
    ========================================================= */

    const lessons = {

        1: {
            title: "Working with Sprites",

            description:
                "Learn what sprites are, how to add, select and delete them, and how each sprite gets its own script.",

            tip:
                "A sprite is a character or object that you can program.",

            category: "events",

            steps: [

                {
                    title: "What is a Sprite?",

                    learn:
                        "A sprite is a character or object that you can program. In our final game, AURA and SHADOW are sprites.",

                    see:
                        "Look at the Stage and sprite list. The selected sprite is the one whose script you are editing.",

                    blocks: [],

                    observe:
                        "First understand the Stage and sprite relationship.",

                    modify:
                        "Click another sprite and notice that the selected sprite changes.",

                    challenge:
                        "Which part is the character or object you program? → Sprite"
                },

                {
                    title: "Start a Script",

                    learn:
                        "A script needs an event to tell Scratch when to start. The green flag block starts a script when the green flag is clicked.",

                    see:
                        "The yellow Events block sits at the top of a script. Other blocks attach underneath it.",

                    blocks: [
                        {
                            text: "when green flag clicked",
                            category: "events"
                        }
                    ],

                    observe:
                        "The script now has a clear starting point.",

                    modify:
                        "Imagine replacing the event with 'when this sprite clicked'.",

                    challenge:
                        "Which category contains 'when green flag clicked'? → Events"
                },

                {
                    title: "Add a New Sprite",

                    learn:
                        "Use the Choose a Sprite button in Scratch to add another character or object.",

                    see:
                        "A new sprite appears in the sprite list and can have its own script.",

                    blocks: [],

                    observe:
                        "A second sprite does not automatically share the first sprite's script.",

                    modify:
                        "Select the second sprite and imagine giving it a different script.",

                    challenge:
                        "Can two sprites have different scripts? → Yes"
                },

                {
                    title: "Select vs Delete",

                    learn:
                        "Selecting means choosing which sprite you are editing. Deleting removes that sprite from the project.",

                    see:
                        "The selected sprite is highlighted in the sprite list.",

                    blocks: [],

                    observe:
                        "Always check which sprite is selected before writing code.",

                    modify:
                        "Switch between AURA and SHADOW before editing.",

                    challenge:
                        "If you want to edit SHADOW, what must you do first? → Select SHADOW"
                }
            ]
        },


        2: {
            title: "Motion — Make AURA Move",

            description:
                "Build a real movement script using Motion blocks and observe what each block changes.",

            tip:
                "Blue = Motion. X controls left/right. Y controls up/down.",

            category: "motion",

            steps: [

                {
                    title: "Move Forward",

                    learn:
                        "The 'move 10 steps' block moves the selected sprite forward in its current direction.",

                    see:
                        "It is a blue Motion block. Put it below the green-flag event.",

                    blocks: [
                        {
                            text: "when green flag clicked",
                            category: "events"
                        },
                        {
                            text: "move 10 steps",
                            category: "motion"
                        }
                    ],

                    observe:
                        "Run the script: AURA moves.",

                    modify:
                        "Change 10 to 30. A larger number means more movement.",

                    challenge:
                        "Which category is 'move 10 steps'? → Motion"
                },

                {
                    title: "Move Horizontally with X",

                    learn:
                        "Changing X moves a sprite left or right. Positive X moves right and negative X moves left.",

                    see:
                        "The 'change x by 10' block changes the horizontal position.",

                    blocks: [
                        {
                            text: "change x by 10",
                            category: "motion"
                        }
                    ],

                    observe:
                        "Run it and compare the horizontal position.",

                    modify:
                        "Try change x by -10.",

                    challenge:
                        "Which value controls left/right? → X"
                },

                {
                    title: "Move Vertically with Y",

                    learn:
                        "Changing Y moves a sprite vertically.",

                    see:
                        "The 'change y by 10' block changes vertical position.",

                    blocks: [
                        {
                            text: "change y by 10",
                            category: "motion"
                        }
                    ],

                    observe:
                        "Run it and watch AURA move vertically.",

                    modify:
                        "Try change y by -20.",

                    challenge:
                        "Which value controls up/down? → Y"
                },

                {
                    title: "Build a Movement Sequence",

                    learn:
                        "Scratch scripts run from top to bottom. Multiple Motion blocks can be connected to create a sequence.",

                    see:
                        "A movement script can contain several Motion blocks under one event.",

                    blocks: [
                        {
                            text: "when green flag clicked",
                            category: "events"
                        },
                        {
                            text: "move 10 steps",
                            category: "motion"
                        },
                        {
                            text: "change x by 10",
                            category: "motion"
                        },
                        {
                            text: "change y by 10",
                            category: "motion"
                        }
                    ],

                    observe:
                        "The sprite performs the actions in order.",

                    modify:
                        "Change one number and run again.",

                    challenge:
                        "Do Scratch blocks run top-to-bottom? → Yes"
                }
            ]
        },


        3: {
            title: "Costumes — Change AURA's Look",

            description:
                "Learn the difference between a sprite and its costumes, then animate AURA by changing costumes.",

            tip:
                "A sprite stays the same object. Costumes are different appearances of that sprite.",

            category: "looks",

            steps: [

                {
                    title: "Sprite vs Costume",

                    learn:
                        "One sprite can have multiple costumes. Changing a costume changes appearance, not the identity of the sprite.",

                    see:
                        "Open the Costumes tab to see the appearances attached to the selected sprite.",

                    blocks: [],

                    observe:
                        "AURA can look different while remaining the same sprite.",

                    modify:
                        "Imagine two costumes: normal AURA and powered-up AURA.",

                    challenge:
                        "Are two costumes automatically two different sprites? → No"
                },

                {
                    title: "Next Costume",

                    learn:
                        "The 'next costume' block changes the sprite to the next costume in its costume list.",

                    see:
                        "This purple Looks block is useful for simple animation.",

                    blocks: [
                        {
                            text: "when green flag clicked",
                            category: "events"
                        },
                        {
                            text: "next costume",
                            category: "looks"
                        }
                    ],

                    observe:
                        "Run the script and watch the appearance change.",

                    modify:
                        "Run the block again. Each run advances to the next costume.",

                    challenge:
                        "Which category contains 'next costume'? → Looks"
                },

                {
                    title: "Choose a Specific Costume",

                    learn:
                        "Use 'switch costume to [costume2]' when you want one exact appearance.",

                    see:
                        "The costume dropdown lets you select the exact costume.",

                    blocks: [
                        {
                            text: "switch costume to [costume2]",
                            category: "looks"
                        }
                    ],

                    observe:
                        "The sprite changes directly to the selected costume.",

                    modify:
                        "Change costume2 to costume1.",

                    challenge:
                        "Which block chooses one exact costume? → switch costume to"
                },

                {
                    title: "Create a Tiny Animation",

                    learn:
                        "Putting costume changes into a sequence lets a sprite appear animated.",

                    see:
                        "Animation is a sequence of different appearances shown over time.",

                    blocks: [
                        {
                            text: "next costume",
                            category: "looks"
                        },
                        {
                            text: "wait 1 seconds",
                            category: "control"
                        },
                        {
                            text: "next costume",
                            category: "looks"
                        }
                    ],

                    observe:
                        "The sprite changes, pauses, then changes again.",

                    modify:
                        "Change the wait time and observe the animation speed.",

                    challenge:
                        "What changes when you change the wait time? → Animation timing"
                }
            ]
        },


        4: {
            title: "Two Sprites — Two Scripts",

            description:
                "Learn how AURA and SHADOW can each run their own scripts.",

            tip:
                "Every sprite has its own scripts. Select the sprite before writing its code.",

            category: "events",

            steps: [

                {
                    title: "Give AURA a Script",

                    learn:
                        "Select AURA, then attach an Events block to start AURA's script.",

                    see:
                        "The script appears for the currently selected sprite.",

                    blocks: [
                        {
                            text: "when green flag clicked",
                            category: "events"
                        },
                        {
                            text: "move 10 steps",
                            category: "motion"
                        }
                    ],

                    observe:
                        "When the green flag starts, AURA moves.",

                    modify:
                        "Change the movement amount.",

                    challenge:
                        "Whose script are you editing? → The selected sprite"
                },

                {
                    title: "Give SHADOW Its Own Script",

                    learn:
                        "Select SHADOW and create a separate script.",

                    see:
                        "The same green flag can start SHADOW's script too.",

                    blocks: [
                        {
                            text: "when green flag clicked",
                            category: "events"
                        },
                        {
                            text: "say [Hello!] for 2 seconds",
                            category: "looks"
                        }
                    ],

                    observe:
                        "AURA and SHADOW can both react to one green flag.",

                    modify:
                        "Change the message to 'I am SHADOW!'.",

                    challenge:
                        "Can both sprites respond to the same green flag? → Yes"
                },

                {
                    title: "Compare the Two Scripts",

                    learn:
                        "Scripts belong to sprites. Selecting another sprite shows that sprite's scripts.",

                    see:
                        "AURA's movement code does not automatically appear on SHADOW.",

                    blocks: [],

                    observe:
                        "Each sprite is independently programmable.",

                    modify:
                        "Give SHADOW a different Looks block.",

                    challenge:
                        "Where does a sprite's script belong? → To that sprite"
                },

                {
                    title: "Coordinate the Characters",

                    learn:
                        "Multiple sprites let you create interactions and stories.",

                    see:
                        "One sprite can move while another speaks, changes costume, or reacts.",

                    blocks: [
                        {
                            text: "when green flag clicked",
                            category: "events"
                        },
                        {
                            text: "say [Ready?] for 2 seconds",
                            category: "looks"
                        }
                    ],

                    observe:
                        "You are no longer making a one-object project.",

                    modify:
                        "Plan one action for AURA and another for SHADOW.",

                    challenge:
                        "What is the big idea? → Different sprites can have different scripts"
                }
            ]
        },


        5: {
            title: "Backdrops — Build the Game World",

            description:
                "Learn how the Stage uses backdrops and prepare the visual world for AURA PLUS.",

            tip:
                "Sprites live on the Stage. The Stage uses backdrops as its background.",

            category: "looks",

            steps: [

                {
                    title: "Stage vs Sprite",

                    learn:
                        "The Stage is where the project appears. Backdrops belong to the Stage.",

                    see:
                        "Click the Stage to work with backdrops.",

                    blocks: [],

                    observe:
                        "The editor changes because you are editing the Stage.",

                    modify:
                        "Switch from a sprite to the Stage.",

                    challenge:
                        "Where do backdrops belong? → Stage"
                },

                {
                    title: "Switch to a Backdrop",

                    learn:
                        "Looks contains blocks for changing the Stage backdrop.",

                    see:
                        "Use 'switch backdrop to [backdrop1]'.",

                    blocks: [
                        {
                            text: "switch backdrop to [backdrop1]",
                            category: "looks"
                        }
                    ],

                    observe:
                        "The Stage changes to the selected background.",

                    modify:
                        "Choose another backdrop.",

                    challenge:
                        "Which category contains backdrop blocks? → Looks"
                },

                {
                    title: "Cycle Backdrops",

                    learn:
                        "The 'next backdrop' block moves to the next backdrop in the Stage's list.",

                    see:
                        "This works like 'next costume', but for the Stage.",

                    blocks: [
                        {
                            text: "next backdrop",
                            category: "looks"
                        }
                    ],

                    observe:
                        "Run it repeatedly and watch the Stage change.",

                    modify:
                        "Add a wait between backdrop changes.",

                    challenge:
                        "Costume belongs to what? → Sprite. Backdrop belongs to what? → Stage"
                },

                {
                    title: "Prepare the AURA World",

                    learn:
                        "Our final game needs a game world where AURA collects orbs and reaches the portal.",

                    see:
                        "The Stage becomes the visual arena for AURA PLUS.",

                    blocks: [
                        {
                            text: "when green flag clicked",
                            category: "events"
                        },
                        {
                            text: "switch backdrop to [backdrop1]",
                            category: "looks"
                        }
                    ],

                    observe:
                        "The project now has a deliberate starting world.",

                    modify:
                        "Choose a backdrop that feels like an arcade/game arena.",

                    challenge:
                        "What creates the Stage background? → Backdrop"
                }
            ]
        },


        6: {
            title: "Sounds — Make It Feel Alive",

            description:
                "Add sounds to sprites and understand the difference between starting a sound and waiting for it to finish.",

            tip:
                "Sound blocks are pink/magenta. They make gameplay feel responsive.",

            category: "sound",

            steps: [

                {
                    title: "Choose a Sound",

                    learn:
                        "A sprite can have sounds. Open the Sounds tab to choose or add one.",

                    see:
                        "The sound list belongs to the selected sprite.",

                    blocks: [],

                    observe:
                        "Different sprites can have different sounds.",

                    modify:
                        "Give AURA a collection sound and SHADOW a warning sound.",

                    challenge:
                        "Where do you manage a sprite's sounds? → Sounds tab"
                },

                {
                    title: "Start a Sound",

                    learn:
                        "'start sound [Meow]' starts the sound and immediately continues to the next block.",

                    see:
                        "This is useful when sound and another action should happen without waiting.",

                    blocks: [
                        {
                            text: "when green flag clicked",
                            category: "events"
                        },
                        {
                            text: "start sound [Meow]",
                            category: "sound"
                        }
                    ],

                    observe:
                        "The sound starts while the script can continue.",

                    modify:
                        "Replace the sample sound with another sound in real Scratch.",

                    challenge:
                        "Which category contains start sound? → Sound"
                },

                {
                    title: "Play Until Done",

                    learn:
                        "'play sound [Meow] until done' waits until the sound finishes.",

                    see:
                        "The important difference is timing.",

                    blocks: [
                        {
                            text: "play sound [Meow] until done",
                            category: "sound"
                        }
                    ],

                    observe:
                        "The next action would wait for the audio to finish.",

                    modify:
                        "Decide which version is better for a short collection effect.",

                    challenge:
                        "Which sound block waits for completion? → play sound until done"
                },

                {
                    title: "Game Feedback",

                    learn:
                        "AURA PLUS can use sounds for collecting an orb, getting hit and winning.",

                    see:
                        "A sound can act as feedback that something happened.",

                    blocks: [
                        {
                            text: "start sound [Meow]",
                            category: "sound"
                        },
                        {
                            text: "wait 1 seconds",
                            category: "control"
                        }
                    ],

                    observe:
                        "Sound and Control can create timing.",

                    modify:
                        "Plan a quick collection sound and dramatic portal sound.",

                    challenge:
                        "Why use sound in a game? → Feedback"
                }
            ]
        },


        /* =====================================================
           MISSION 7 — ACTUAL AURA PLUS GAME
        ===================================================== */

        7: {
            title: "AURA PLUS — BUILD THE ACTUAL GAME",

            description:
                "Rebuild the same AURA PLUS game you played at the beginning. Combine everything you learned.",

            tip:
                "This is the final build. Don't memorize it — understand what every part is doing.",

            category: "events",

            finalGame: true,

            steps: [

                {
                    title: "1 · Build the World",

                    learn:
                        "Create AURA, SHADOW, AURA ORBS, a Stage backdrop and the PORTAL.",

                    see:
                        "Each object can be independently controlled. The background is a Stage backdrop.",

                    blocks: [],

                    observe:
                        "This is the same world you saw in the opening game.",

                    modify:
                        "Rename the sprites clearly: AURA, SHADOW, ORB1…ORB5, PORTAL.",

                    challenge:
                        "Which game object is the Stage background? → Backdrop"
                },

                {
                    title: "2 · Start AURA",

                    learn:
                        "The green flag starts the game. AURA should begin at a predictable position.",

                    see:
                        "Use an Events block followed by a Motion position block.",

                    blocks: [
                        {
                            text: "when green flag clicked",
                            category: "events"
                        },
                        {
                            text: "go to x: 0 y: 0",
                            category: "motion"
                        }
                    ],

                    observe:
                        "Every run starts from the same position.",

                    modify:
                        "Change the starting X/Y values.",

                    challenge:
                        "Why set a starting position? → Consistency"
                },

                {
                    title: "3 · Give AURA Movement",

                    learn:
                        "A forever loop repeats movement while the game is running.",

                    see:
                        "The structure is: green flag → forever → movement.",

                    blocks: [
                        {
                            text: "forever",
                            category: "control"
                        },
                        {
                            text: "move 10 steps",
                            category: "motion"
                        }
                    ],

                    observe:
                        "A loop repeats an action instead of running it once.",

                    modify:
                        "Change the movement amount to change speed.",

                    challenge:
                        "Which block repeats the code forever? → forever"
                },

                {
                    title: "4 · Detect the Orbs",

                    learn:
                        "Sensing lets a sprite ask questions. We need to know when AURA touches an orb.",

                    see:
                        "A sensing condition can be placed inside an if block.",

                    blocks: [
                        {
                            text: "if < > then",
                            category: "control"
                        },
                        {
                            text: "touching [mouse-pointer]?",
                            category: "sensing"
                        }
                    ],

                    observe:
                        "IF something is touched, THEN the collection action can happen.",

                    modify:
                        "In real Scratch, change the sensing dropdown to the ORB sprite.",

                    challenge:
                        "Which category asks 'touching …?' → Sensing"
                },

                {
                    title: "5 · Count the Aura",

                    learn:
                        "Variables store changing information. The game needs an Aura Score.",

                    see:
                        "Create an Aura Score variable, set it to 0, then change it when an orb is collected.",

                    blocks: [
                        {
                            text: "set [my variable] to 0",
                            category: "variables"
                        },
                        {
                            text: "change [my variable] by 1",
                            category: "variables"
                        }
                    ],

                    observe:
                        "The score remembers its value as the game continues.",

                    modify:
                        "For the final game, make each orb add 10 instead of 1.",

                    challenge:
                        "Which category stores changing values? → Variables"
                },

                {
                    title: "6 · Make SHADOW Dangerous",

                    learn:
                        "SHADOW should move toward AURA and reduce a life when they touch.",

                    see:
                        "The system is: move → detect → change lives → reset.",

                    blocks: [
                        {
                            text: "forever",
                            category: "control"
                        },
                        {
                            text: "move 10 steps",
                            category: "motion"
                        },
                        {
                            text: "if < > then",
                            category: "control"
                        },
                        {
                            text: "change [my variable] by 1",
                            category: "variables"
                        }
                    ],

                    observe:
                        "A repeated loop can make an enemy behave continuously.",

                    modify:
                        "In real Scratch, use a Lives variable and decrease it by 1 after touching SHADOW.",

                    challenge:
                        "What should change when AURA is hit? → Lives"
                },

                {
                    title: "7 · Unlock the Portal",

                    learn:
                        "The portal should only work after enough Aura is collected.",

                    see:
                        "Operators compare values. A condition can check whether Aura Score reaches 50.",

                    blocks: [
                        {
                            text: "if < > then",
                            category: "control"
                        },
                        {
                            text: "1 > 1",
                            category: "operators"
                        },
                        {
                            text: "say [Hello!]",
                            category: "looks"
                        }
                    ],

                    observe:
                        "The comparison controls whether the action happens.",

                    modify:
                        "Change the target number. The final game unlocks at 50.",

                    challenge:
                        "Which category performs comparisons? → Operators"
                },

                {
                    title: "8 · Add Game Sounds",

                    learn:
                        "Connect Sound to gameplay: collection, danger and victory should have feedback.",

                    see:
                        "A sound block can run when a game event happens.",

                    blocks: [
                        {
                            text: "start sound [Meow]",
                            category: "sound"
                        },
                        {
                            text: "play sound [Meow] until done",
                            category: "sound"
                        }
                    ],

                    observe:
                        "The game communicates through audio as well as visuals.",

                    modify:
                        "Replace the sample sounds with collection, hit and win sounds.",

                    challenge:
                        "Which Sound block lets the script continue immediately? → start sound"
                },

                {
                    title: "9 · FINAL RUN — AURA PLUS",

                    learn:
                        "You have combined the skills. The finished game is the same game from the opening: collect 5 orbs for 50 Aura, avoid SHADOW, unlock the portal and reach it.",

                    see:
                        "Run the project. Don't just watch — test your logic.",

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
                        },
                        {
                            text: "if < > then",
                            category: "control"
                        },
                        {
                            text: "change [my variable] by 1",
                            category: "variables"
                        },
                        {
                            text: "start sound [Meow]",
                            category: "sound"
                        }
                    ],

                    observe:
                        "The gameplay loop is collect → survive → unlock → escape.",

                    modify:
                        "Change the score target, enemy speed or number of lives.",

                    challenge:
                        "Can you explain what Events, Control, Motion, Sensing, Variables and Sound each do?"
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
        document.getElementById("lessonTitle");

    const lessonDescription =
        document.getElementById("lessonDescription");

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

    const workspaceHint =
        document.getElementById("workspaceHint");

    const nextButton =
        document.getElementById("nextLessonStep");

    const showBlockButton =
        document.getElementById("showBlockButton");

    const runLessonButton =
        document.getElementById("runLessonButton");


    let currentMission = 1;

    let currentStepIndex = 0;

    let currentExpectedIndex = 0;

    let lessonPhase = 0;

    let completedMissions = new Set();

    let auraPlusPreview = null;


    /* =========================================================
       HELPERS
    ========================================================= */

    function normalize(text) {

        return String(text)
            .toLowerCase()
            .replace(/\s+/g, " ")
            .trim();
    }


    function getCurrentLesson() {
        return lessons[currentMission];
    }


    function getCurrentStep() {
        return getCurrentLesson()?.steps?.[
            currentStepIndex
        ];
    }


    /* =========================================================
       OPEN LESSON
    ========================================================= */

    function openLesson(mission) {

        if (!lessons[mission]) return;

        currentMission = mission;

        currentStepIndex = 0;

        currentExpectedIndex = 0;

        lessonPhase = 0;

        if (lessonBlocks) {
            lessonBlocks.innerHTML = "";
        }

        showScreen("lesson");

        renderLesson();
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
            getCurrentLesson();

        const step =
            getCurrentStep();

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
            `${currentStepIndex + 1}/${lesson.steps.length}`;


        lessonLearningPoints.innerHTML =
            "";

        lesson.steps.forEach(
            (s, i) => {

                const li =
                    document.createElement(
                        "li"
                    );

                li.textContent =
                    `${i + 1}. ${s.title}`;

                li.style.fontWeight =
                    i === currentStepIndex
                        ? "800"
                        : "500";

                li.style.opacity =
                    i === currentStepIndex
                        ? "1"
                        : "0.72";

                lessonLearningPoints
                    .appendChild(li);
            }
        );


        currentExpectedIndex = 0;

        lessonPhase = 0;

        lessonBlocks.innerHTML = "";

        updateBlockCount();

        renderCurrentPhase();

        updateProgress();

        renderMission7PreviewIfNeeded();
    }


    /* =========================================================
       LEARN → SEE → DO
    ========================================================= */

    function renderCurrentPhase() {

        const lesson =
            getCurrentLesson();

        const step =
            getCurrentStep();

        if (!lesson || !step) return;

        const target =
            step.blocks?.[
                currentExpectedIndex
            ];


        if (lessonPhase === 0) {

            workspaceInstruction.textContent =
                `🧠 LEARN — ${step.learn}`;

            workspaceHint.textContent =
                `STEP ${currentStepIndex + 1}: ${step.title}`;

            nextButton.textContent =
                "SEE IT IN SCRATCH →";

            showBlockButton.textContent =
                "SHOW EXACT BLOCK";

            renderPalette(
                lesson.category || "events",
                false
            );

            return;
        }


        if (lessonPhase === 1) {

            workspaceInstruction.textContent =
                `👀 SEE — ${step.see}`;

            workspaceHint.textContent =
                target
                    ? `Exact block ${currentExpectedIndex + 1} of ${step.blocks.length}: ${target.text}`
                    : "No block needed for this step — move to TRY.";

            nextButton.textContent =
                "TRY IT →";

            showBlockButton.textContent =
                target
                    ? "HIGHLIGHT BLOCK"
                    : "NO BLOCK NEEDED";

            renderPalette(
                target?.category ||
                lesson.category ||
                "events",
                Boolean(target)
            );

            return;
        }


        workspaceInstruction.textContent =
            target
                ? `🧩 DO — Add block ${currentExpectedIndex + 1}/${step.blocks.length}: ${target.text}`
                : `🎯 CHALLENGE — ${step.challenge}`;

        workspaceHint.textContent =
            target
                ? "Drag OR tap the highlighted block into SCRIPTS."
                : "Read the challenge, then press RUN to test the step.";

        nextButton.textContent =
            target
                ? "WAITING FOR BLOCK…"
                : "RUN & CONTINUE →";

        renderPalette(
            target?.category ||
            lesson.category ||
            "events",
            Boolean(target)
        );

        if (target) {
            highlightExpectedBlock();
        }
    }


    /* =========================================================
       PALETTE
    ========================================================= */

    function renderPalette(
        category,
        highlightTarget
    ) {

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
       POINTER DRAG / TAP
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

        block.draggable = false;

        block.style.touchAction =
            "none";


        let pointerId = null;

        let startX = 0;

        let startY = 0;

        let dragging = false;

        let ghost = null;


        const cleanup = () => {

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

            ghost = null;

            dragging = false;

            pointerId = null;

            clearDropZone();
        };


        const move = ev => {

            if (
                ev.pointerId !==
                pointerId
            ) {
                return;
            }

            ev.preventDefault();


            const distance =
                Math.hypot(
                    ev.clientX - startX,
                    ev.clientY - startY
                );


            if (
                !dragging &&
                distance < 8
            ) {
                return;
            }


            if (!dragging) {

                dragging = true;

                ghost =
                    block.cloneNode(true);

                ghost.classList.add(
                    "drag-ghost"
                );


                Object.assign(
                    ghost.style,
                    {
                        position: "fixed",
                        zIndex: "99999",
                        pointerEvents: "none",
                        opacity: "0.9",
                        margin: "0",
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


        const end = ev => {

            if (
                ev.pointerId !==
                pointerId
            ) {
                return;
            }

            ev.preventDefault();


            const wasDragging =
                dragging;


            const rect =
                lessonBlocks
                    .getBoundingClientRect();


            const inside =
                ev.clientX >= rect.left &&
                ev.clientX <= rect.right &&
                ev.clientY >= rect.top &&
                ev.clientY <= rect.bottom;


            cleanup();


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
        };


        const cancel = ev => {

            if (
                ev.pointerId !==
                pointerId
            ) {
                return;
            }

            cleanup();
        };


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

                dragging = false;


                try {
                    block.setPointerCapture(
                        pointerId
                    );
                } catch (_) {}


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
            lessonBlocks
                .getBoundingClientRect();


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


    function clearDropZone() {

        if (!lessonBlocks) return;

        lessonBlocks.style.outline =
            "";

        lessonBlocks.style.outlineOffset =
            "";
    }


    /* =========================================================
       HIGHLIGHT EXPECTED BLOCK
    ========================================================= */

    function highlightExpectedBlock() {

        const step =
            getCurrentStep();

        const target =
            step?.blocks?.[
                currentExpectedIndex
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

        const step =
            getCurrentStep();

        const target =
            step?.blocks?.[
                currentExpectedIndex
            ];


        if (lessonPhase !== 2) {

            workspaceInstruction.textContent =
                "👀 First go through LEARN → SEE → TRY.";

            return;
        }


        if (!target) {

            workspaceInstruction.textContent =
                "🎯 No block is required for this step. Press RUN.";

            return;
        }


        if (
            normalize(text) !==
            normalize(target.text)
        ) {

            workspaceInstruction.textContent =
                `❌ Not this one yet. We need: "${target.text}"`;

            workspaceHint.textContent =
                `💡 Hint: this step uses the ${target.category.toUpperCase()} category.`;

            highlightExpectedBlock();

            return;
        }


        lessonBlocks.appendChild(
            createScratchBlock(
                text,
                category,
                true
            )
        );


        currentExpectedIndex++;

        updateBlockCount();


        workspaceInstruction.textContent =
            `✅ Correct! "${text}" added to your script.`;


        if (
            currentExpectedIndex <
            step.blocks.length
        ) {

            lessonPhase = 1;

            setTimeout(
                renderCurrentPhase,
                450
            );

            return;
        }


        lessonPhase = 2;


        setTimeout(
            () => {

                workspaceInstruction.textContent =
                    `🚀 SCRIPT PART COMPLETE — ${step.observe}`;

                workspaceHint.textContent =
                    `🔧 MODIFY IT — ${step.modify}`;

                nextButton.textContent =
                    "RUN / CONTINUE →";

                renderMission7PreviewIfNeeded();

            },
            350
        );
    }


    /* =========================================================
       NEXT BUTTON
    ========================================================= */

    nextButton?.addEventListener(
        "click",
        () => {

            const step =
                getCurrentStep();

            if (!step) return;


            if (lessonPhase === 0) {

                lessonPhase = 1;

                renderCurrentPhase();

                return;
            }


            if (lessonPhase === 1) {

                lessonPhase = 2;

                renderCurrentPhase();

                return;
            }


            if (
                step.blocks?.length &&
                currentExpectedIndex <
                step.blocks.length
            ) {

                workspaceInstruction.textContent =
                    "🧩 Add the highlighted block first.";

                highlightExpectedBlock();

                return;
            }


            runStepAndContinue();
        }
    );


    /* =========================================================
       SHOW BLOCK
    ========================================================= */

    showBlockButton?.addEventListener(
        "click",
        () => {

            const step =
                getCurrentStep();

            const target =
                step?.blocks?.[
                    currentExpectedIndex
                ];


            if (!target) {

                workspaceInstruction.textContent =
                    "ℹ️ No Scratch block is required for this step.";

                return;
            }


            lessonPhase = 1;

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

                    renderPalette(
                        button.dataset.category,
                        false
                    );
                }
            );
        });


    /* =========================================================
       RUN STEP
    ========================================================= */

    function runStepAndContinue() {

        const step =
            getCurrentStep();

        if (!step) return;


        workspaceInstruction.textContent =
            `▶️ RUNNING — ${step.observe}`;


        runWorkspace();


        setTimeout(
            () => {

                const lesson =
                    getCurrentLesson();


                if (
                    currentStepIndex <
                    lesson.steps.length - 1
                ) {

                    currentStepIndex++;

                    currentExpectedIndex = 0;

                    lessonPhase = 0;

                    lessonBlocks.innerHTML =
                        "";

                    updateBlockCount();

                    renderCurrentPhase();

                    renderMission7PreviewIfNeeded();

                } else {

                    completeMission();
                }

            },
            1200
        );
    }


    function updateBlockCount() {

        if (
            !blockCount ||
            !lessonBlocks
        ) {
            return;
        }


        const count =
            lessonBlocks.children.length;


        blockCount.textContent =
            `${count} block${count === 1 ? "" : "s"}`;
    }


    /* =========================================================
       MISSION 7 REAL GAME PREVIEW
    ========================================================= */

    function renderMission7PreviewIfNeeded() {

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

            stage.innerHTML =
                '<div id="previewPlayer">A</div>';

            return;
        }


        if (auraPlusPreview) return;


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

            keys:
                Object.create(null),

            orbs:
                [
                    ...stage.querySelectorAll(
                        ".aura-preview-orb"
                    )
                ]
        };


        const keydown =
            event => {

                if (
                    !auraPlusPreview
                ) {
                    return;
                }


                const allowed =
                    [
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

                    auraPlusPreview
                        .keys[
                            event.key.toLowerCase()
                        ] = true;
                }
            };


        const keyup =
            event => {

                if (
                    !auraPlusPreview
                ) {
                    return;
                }


                delete auraPlusPreview
                    .keys[
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


        stage.addEventListener(
            "pointerdown",
            event => {

                if (
                    !auraPlusPreview
                ) {
                    return;
                }


                const r =
                    stage.getBoundingClientRect();


                auraPlusPreview.x =
                    (
                        (event.clientX -
                        r.left) /
                        r.width
                    ) * 100;


                auraPlusPreview.y =
                    (
                        (event.clientY -
                        r.top) /
                        r.height
                    ) * 100;


                updateAuraPreview();
            }
        );


        updateAuraPreview();
    }


    function updateAuraPreview() {

        const g =
            auraPlusPreview;


        if (
            !g ||
            !g.player
        ) {
            return;
        }


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


        if (unlocked) {

            g.message.textContent =
                "⚡ PORTAL UNLOCKED — REACH IT!";

        } else {

            g.message.textContent =
                "COLLECT THE AURA ORBS!";
        }
    }


    function runAuraPlusPreview() {

        renderMission7PreviewIfNeeded();


        const g =
            auraPlusPreview;


        if (!g) return;


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


        const tick =
            () => {

                if (
                    !g ||
                    !g.running
                ) {
                    return;
                }


                const speed =
                    0.8;


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
                        4,
                        Math.min(
                            96,
                            g.x
                        )
                    );


                g.y =
                    Math.max(
                        10,
                        Math.min(
                            90,
                            g.y
                        )
                    );


                g.orbs.forEach(
                    orb => {

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
                            ) < 7
                        ) {

                            orb.style.display =
                                "none";

                            g.score += 10;
                        }
                    }
                );


                const sx =
                    82 +
                    Math.sin(
                        Date.now() / 900
                    ) * 8;


                const sy =
                    45 +
                    Math.cos(
                        Date.now() / 1100
                    ) * 25;


                g.shadow.style.left =
                    `${sx}%`;

                g.shadow.style.top =
                    `${sy}%`;


                if (
                    Math.hypot(
                        g.x - sx,
                        g.y - sy
                    ) < 7
                ) {

                    g.lives--;

                    g.x = 12;

                    g.y = 50;


                    if (
                        g.lives <= 0
                    ) {

                        g.running =
                            false;

                        g.message.textContent =
                            "GAME OVER — RUN IT AGAIN";
                    }
                }


                if (
                    g.score >= 50 &&
                    Math.hypot(
                        g.x - 90,
                        g.y - 50
                    ) < 9
                ) {

                    g.running =
                        false;

                    g.message.textContent =
                        "🏆 AURA PLUS COMPLETE!";
                }


                updateAuraPreview();

                requestAnimationFrame(
                    tick
                );
            };


        requestAnimationFrame(
            tick
        );
    }


    /* =========================================================
       RUN WORKSPACE
    ========================================================= */

    runLessonButton?.addEventListener(
        "click",
        runWorkspace
    );


    function runWorkspace() {

        if (
            currentMission === 7
        ) {

            runAuraPlusPreview();

            workspaceInstruction.textContent =
                "🎮 PLAY THE SAME AURA PLUS GAME — collect all 5 orbs, avoid SHADOW, then reach the portal.";

            return;
        }


        const blocks =
            [
                ...(lessonBlocks?.children || [])
            ];


        const preview =
            document.getElementById(
                "previewPlayer"
            );


        const stage =
            document.getElementById(
                "previewStage"
            );


        if (
            !blocks.length ||
            !preview
        ) {

            workspaceInstruction.textContent =
                "🧩 Add the Scratch blocks for this step first.";

            return;
        }


        preview.textContent =
            "A";

        preview.style.left =
            "50%";

        preview.style.top =
            "50%";

        preview.style.transform =
            "translate(-50%, -50%) rotate(0deg)";


        stage
            ?.querySelector(
                ".js-bubble"
            )
            ?.remove();


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
                    i * 550
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
            t.includes("go to x")
        ) {
            return "goto";
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


        if (
            t.includes("variable")
        ) {
            return "variable";
        }


        if (
            t.includes("forever")
        ) {
            return "loop";
        }


        if (
            t.includes("if")
        ) {
            return "condition";
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


            case "goto":

                preview.style.left =
                    "50%";

                preview.style.top =
                    "50%";

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
                    "🔊 Sound!",
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


            case "variable":

                showBubble(
                    "⚡ Score +10",
                    "previewStage"
                );

                break;


            case "loop":

                showBubble(
                    "↻ Repeats",
                    "previewStage"
                );

                break;


            case "condition":

                showBubble(
                    "IF condition checked",
                    "previewStage"
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


        stage
            .querySelector(
                ".js-bubble"
            )
            ?.remove();


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

                position: "absolute",

                left: "52%",

                top: "25%",

                padding: "7px 10px",

                background: "white",

                color: "#111827",

                borderRadius: "10px",

                fontSize: "11px",

                fontWeight: "700",

                zIndex: "50",

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
            currentMission === 7
                ? "🏆 AURA PLUS COMPLETE! You rebuilt the final game."
                : `🏆 MISSION ${currentMission} COMPLETE! You learned the skill needed for the final game.`;


        setTimeout(
            () => {

                if (
                    completedMissions.size >=
                    7
                ) {

                    showScreen(
                        "final"
                    );

                } else {

                    showQuickCheck();
                }

            },
            800
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
            .forEach(
                card => {

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
                }
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


                                    showScreen(
                                        "tutorial"
                                    );


                                    const nextMission =
                                        currentMission +
                                        1;


                                    if (
                                        nextMission <=
                                        7
                                    ) {

                                        const nextCard =
                                            document.querySelector(
                                                `.mission-card[data-mission="${nextMission}"]`
                                            );


                                        if (
                                            nextCard
                                        ) {

                                            nextCard.scrollIntoView(
                                                {
                                                    behavior:
                                                        "smooth",

                                                    block:
                                                        "center"
                                                }
                                            );


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

                currentMission = 1;

                currentStepIndex = 0;

                currentExpectedIndex = 0;

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
