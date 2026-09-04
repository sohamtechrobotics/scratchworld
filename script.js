from pathlib import Path

src = Path("/mnt/data/Pasted text(20260904-004833).txt")
text = src.read_text()

start = text.index('    /* =========================================================\n       LESSON DATA')
end = text.index('    /* =========================================================\n       QUICK CHECK', start)

new_lesson = r'''    /* =========================================================
       AURA PLUS — FULL SCRATCH LESSON ENGINE
       LEARN → SEE → DO → RUN → MODIFY → CHALLENGE
    ========================================================= */

    /*
      The game at the beginning is the final target.
      Missions 1–6 teach the exact skills needed to rebuild it.
      Mission 7 rebuilds AURA PLUS itself.
    */

    const lessons = {
        1: {
            title: "Working with Sprites",
            description: "Learn what sprites are, how to add/select/delete them, and how each sprite gets its own script.",
            tip: "Think of a sprite as a character or object on the Stage. Select the sprite first, then write its script.",
            category: "events",
            steps: [
                {
                    title: "What is a Sprite?",
                    learn: "A sprite is a character or object that you can program. In our final game, AURA and SHADOW are sprites.",
                    see: "Look at the Stage and the sprite list. The selected sprite is the one whose script you are editing.",
                    blocks: [],
                    observe: "No block is needed yet. First understand the Stage + sprite relationship.",
                    modify: "Click a different sprite in the sprite list and notice that the selected sprite changes.",
                    challenge: "Which part is the character/object you program? → Sprite"
                },
                {
                    title: "Start a Script",
                    learn: "A script needs an event to tell Scratch when to start. The green flag block starts a script when the green flag is clicked.",
                    see: "The yellow Events block sits at the top of a script. Other blocks attach underneath it.",
                    blocks: [{text:"when green flag clicked", category:"events"}],
                    observe: "The script now has a clear starting point.",
                    modify: "Imagine replacing the event with another event such as 'when this sprite clicked'.",
                    challenge: "Which category contains 'when green flag clicked'? → Events"
                },
                {
                    title: "Add a New Sprite",
                    learn: "Use the Choose a Sprite button below the Stage to add another character/object.",
                    see: "In Scratch, the sprite chooser adds a new sprite to the sprite list. The new sprite can have its own script.",
                    blocks: [],
                    observe: "A second sprite does not share the first sprite's script automatically.",
                    modify: "Select the second sprite and imagine giving it a completely different script.",
                    challenge: "Can two sprites have different scripts? → Yes"
                },
                {
                    title: "Select vs Delete",
                    learn: "Selecting a sprite means choosing which sprite you are editing. Deleting removes that sprite from the project.",
                    see: "The selected sprite is highlighted in the sprite list. The delete/trash control removes it.",
                    blocks: [],
                    observe: "Always check which sprite is selected before adding code.",
                    modify: "Switch between AURA and SHADOW before editing.",
                    challenge: "If you want to edit SHADOW, what must you do first? → Select SHADOW"
                }
            ]
        },

        2: {
            title: "Motion — Make AURA Move",
            description: "Build a real movement script using Motion blocks and observe exactly what each block changes.",
            tip: "Blue = Motion. X controls left/right. Y controls up/down.",
            category: "motion",
            steps: [
                {
                    title: "Move Forward",
                    learn: "The 'move 10 steps' block moves the selected sprite forward in its current direction.",
                    see: "It is a blue Motion block. Put it below the green-flag event.",
                    blocks: [
                        {text:"when green flag clicked", category:"events"},
                        {text:"move 10 steps", category:"motion"}
                    ],
                    observe: "Run the script: AURA moves.",
                    modify: "Change 10 to 30. A larger number means a larger movement.",
                    challenge: "Which category is 'move 10 steps'? → Motion"
                },
                {
                    title: "Move Horizontally with X",
                    learn: "Changing X moves a sprite left or right. Positive X moves right; negative X moves left.",
                    see: "The block 'change x by 10' changes the sprite's horizontal position.",
                    blocks: [{text:"change x by 10", category:"motion"}],
                    observe: "Run it and compare the horizontal position before and after.",
                    modify: "Try change x by -10 to move in the opposite direction.",
                    challenge: "Which value controls left/right? → X"
                },
                {
                    title: "Move Vertically with Y",
                    learn: "Changing Y moves a sprite up or down. Y controls the vertical position.",
                    see: "The block 'change y by 10' changes vertical position.",
                    blocks: [{text:"change y by 10", category:"motion"}],
                    observe: "Run it and watch AURA move vertically.",
                    modify: "Try change y by -20 and compare.",
                    challenge: "Which value controls up/down? → Y"
                },
                {
                    title: "Build a Movement Sequence",
                    learn: "Scratch scripts run from top to bottom. Several Motion blocks can be connected to create a sequence.",
                    see: "A real movement script can contain multiple Motion blocks under one event.",
                    blocks: [
                        {text:"when green flag clicked", category:"events"},
                        {text:"move 10 steps", category:"motion"},
                        {text:"change x by 10", category:"motion"},
                        {text:"change y by 10", category:"motion"}
                    ],
                    observe: "The sprite performs the actions in order.",
                    modify: "Change one number and run again. Predict first, then test.",
                    challenge: "Do Scratch blocks run top-to-bottom? → Yes"
                }
            ]
        },

        3: {
            title: "Costumes — Change AURA's Look",
            description: "Learn the difference between a sprite and its costumes, then animate AURA by changing costumes.",
            tip: "A sprite stays the same object; costumes are different appearances of that sprite.",
            category: "looks",
            steps: [
                {
                    title: "Sprite vs Costume",
                    learn: "One sprite can have multiple costumes. Changing a costume changes appearance, not the identity of the sprite.",
                    see: "Open the Costumes tab in Scratch to see the different appearances attached to the selected sprite.",
                    blocks: [],
                    observe: "AURA can look different while remaining the same sprite.",
                    modify: "Think of two costumes as AURA standing normally and AURA powered-up.",
                    challenge: "Are two costumes automatically two different sprites? → No"
                },
                {
                    title: "Next Costume",
                    learn: "The 'next costume' block changes the sprite to the next costume in its costume list.",
                    see: "This purple Looks block is useful for simple animation.",
                    blocks: [
                        {text:"when green flag clicked", category:"events"},
                        {text:"next costume", category:"looks"}
                    ],
                    observe: "Run the script and watch the appearance change.",
                    modify: "Click/run the block again. Each run advances to the next costume.",
                    challenge: "Which category contains 'next costume'? → Looks"
                },
                {
                    title: "Choose a Specific Costume",
                    learn: "Use 'switch costume to [costume2]' when you want a particular appearance instead of simply moving to the next one.",
                    see: "The costume dropdown lets you choose the exact costume.",
                    blocks: [{text:"switch costume to [costume2]", category:"looks"}],
                    observe: "The sprite changes directly to the selected costume.",
                    modify: "Imagine changing costume2 to costume1. The target appearance changes.",
                    challenge: "Which block is better for choosing one exact costume? → switch costume to"
                },
                {
                    title: "Create a Tiny Animation",
                    learn: "Putting costume changes into a script lets a sprite appear animated.",
                    see: "Animation is simply a sequence of different appearances shown over time.",
                    blocks: [
                        {text:"next costume", category:"looks"},
                        {text:"wait 1 seconds", category:"control"},
                        {text:"next costume", category:"looks"}
                    ],
                    observe: "The sprite changes, pauses, then changes again.",
                    modify: "Change the wait time and observe the animation speed.",
                    challenge: "What changes when you change the wait time? → Animation timing"
                }
            ]
        },

        4: {
            title: "Two Sprites — Two Scripts",
            description: "Learn how AURA and SHADOW can each run their own scripts at the same time.",
            tip: "Every sprite has its own scripts. Select the sprite before writing its code.",
            category: "events",
            steps: [
                {
                    title: "Give AURA a Script",
                    learn: "Select AURA, then attach an Events block to start AURA's script.",
                    see: "The script appears for the currently selected sprite.",
                    blocks: [
                        {text:"when green flag clicked", category:"events"},
                        {text:"move 10 steps", category:"motion"}
                    ],
                    observe: "When the green flag starts, AURA moves.",
                    modify: "Change the movement amount and run again.",
                    challenge: "Whose script are you editing? → The selected sprite"
                },
                {
                    title: "Give SHADOW Its Own Script",
                    learn: "Select SHADOW and create a separate script. It can do something completely different.",
                    see: "The same green-flag event can start SHADOW's script too.",
                    blocks: [
                        {text:"when green flag clicked", category:"events"},
                        {text:"say [Hello!] for 2 seconds", category:"looks"}
                    ],
                    observe: "AURA and SHADOW can both react to one green flag.",
                    modify: "Change the message to something like 'I am SHADOW!'.",
                    challenge: "Can both sprites respond to the same green flag? → Yes"
                },
                {
                    title: "Compare the Two Scripts",
                    learn: "Scripts belong to sprites. Selecting another sprite shows that sprite's scripts.",
                    see: "AURA's movement code does not automatically appear on SHADOW.",
                    blocks: [],
                    observe: "Each sprite is independently programmable.",
                    modify: "Give SHADOW a different Looks block and compare.",
                    challenge: "Where does a sprite's script belong? → To that sprite"
                },
                {
                    title: "Coordinate the Characters",
                    learn: "Multiple sprites let you create interactions and stories. This is the foundation of our AURA + SHADOW game.",
                    see: "One sprite can move while another speaks, changes costume, or reacts.",
                    blocks: [
                        {text:"when green flag clicked", category:"events"},
                        {text:"say [Ready?] for 2 seconds", category:"looks"}
                    ],
                    observe: "You are no longer making a one-object project.",
                    modify: "Plan one action for AURA and a different action for SHADOW.",
                    challenge: "What is the big idea? → Different sprites can have different scripts"
                }
            ]
        },

        5: {
            title: "Backdrops — Build the Game World",
            description: "Learn how the Stage uses backdrops and prepare the visual world for AURA PLUS.",
            tip: "Sprites live on the Stage. The Stage uses backdrops as its background.",
            category: "looks",
            steps: [
                {
                    title: "Stage vs Sprite",
                    learn: "The Stage is the area where the project appears. Backdrops belong to the Stage, not to a sprite.",
                    see: "Click the Stage to work with backdrops instead of selecting AURA or SHADOW.",
                    blocks: [],
                    observe: "The editor changes because you are now editing the Stage.",
                    modify: "Switch from a sprite to the Stage and notice the selection.",
                    challenge: "Where do backdrops belong? → Stage"
                },
                {
                    title: "Switch to a Backdrop",
                    learn: "The Looks category contains blocks for changing the Stage backdrop.",
                    see: "Use 'switch backdrop to [backdrop1]' to choose a specific backdrop.",
                    blocks: [{text:"switch backdrop to [backdrop1]", category:"looks"}],
                    observe: "The Stage changes to the selected background.",
                    modify: "Choose another backdrop from the dropdown.",
                    challenge: "Which category contains backdrop blocks? → Looks"
                },
                {
                    title: "Cycle Backdrops",
                    learn: "The 'next backdrop' block moves to the next backdrop in the Stage's list.",
                    see: "This works like 'next costume', but for the Stage.",
                    blocks: [{text:"next backdrop", category:"looks"}],
                    observe: "Run it repeatedly and watch the Stage change.",
                    modify: "Add a wait between backdrop changes.",
                    challenge: "Costume belongs to what? → Sprite. Backdrop belongs to what? → Stage"
                },
                {
                    title: "Prepare the AURA World",
                    learn: "Our final game needs a game world. A backdrop gives the project its visual setting before we add characters and gameplay.",
                    see: "Imagine the final Stage as the arena where AURA collects orbs and reaches the portal.",
                    blocks: [
                        {text:"when green flag clicked", category:"events"},
                        {text:"switch backdrop to [backdrop1]", category:"looks"}
                    ],
                    observe: "The project now has a deliberate starting world.",
                    modify: "Choose a backdrop that feels like an arcade/game arena.",
                    challenge: "What creates the Stage background? → Backdrop"
                }
            ]
        },

        6: {
            title: "Sounds — Make It Feel Alive",
            description: "Add sounds to sprites and understand the difference between starting a sound and waiting for it to finish.",
            tip: "Sound blocks are pink/magenta. Use them to make events feel responsive.",
            category: "sound",
            steps: [
                {
                    title: "Choose a Sound",
                    learn: "A sprite can have sounds. Open the Sounds tab to choose or add one.",
                    see: "The sound list belongs to the selected sprite.",
                    blocks: [],
                    observe: "Different sprites can have different sounds too.",
                    modify: "Imagine giving AURA a collection sound and SHADOW a warning sound.",
                    challenge: "Where do you manage a sprite's sounds? → Sounds tab"
                },
                {
                    title: "Start a Sound",
                    learn: "'start sound [Meow]' starts the sound and immediately continues to the next block.",
                    see: "This is useful when you want sound and other actions to happen without waiting.",
                    blocks: [
                        {text:"when green flag clicked", category:"events"},
                        {text:"start sound [Meow]", category:"sound"}
                    ],
                    observe: "The sound starts while the script can continue.",
                    modify: "Replace Meow with another available sound in real Scratch.",
                    challenge: "Which category contains start sound? → Sound"
                },
                {
                    title: "Play Until Done",
                    learn: "'play sound [Meow] until done' waits until the sound finishes before the next block runs.",
                    see: "The difference is timing: start sound = don't wait; play until done = wait.",
                    blocks: [{text:"play sound [Meow] until done", category:"sound"}],
                    observe: "The next action would wait for the audio to finish.",
                    modify: "Decide which version you would use for a short collection effect.",
                    challenge: "Which sound block waits for completion? → play sound until done"
                },
                {
                    title: "Game Feedback",
                    learn: "In AURA PLUS, sounds can confirm important actions: collecting an orb, getting hit, or reaching the portal.",
                    see: "A sound is a feedback signal. It tells the player that something happened.",
                    blocks: [
                        {text:"start sound [Meow]", category:"sound"},
                        {text:"wait 1 seconds", category:"control"}
                    ],
                    observe: "You can combine Sound and Control to create timing.",
                    modify: "Plan: collection sound = quick; portal sound = dramatic.",
                    challenge: "Why use sound in a game? → Feedback"
                }
            ]
        },

        7: {
            title: "AURA PLUS — BUILD THE ACTUAL GAME",
            description: "Now rebuild the same AURA PLUS game you played at the beginning. This mission combines sprites, Motion, Control, Sensing, Variables, Operators, Looks, Backdrops and Sound.",
            tip: "This is the final build. Do not memorize it—understand what every part is doing.",
            category: "events",
            finalGame: true,
            steps: [
                {
                    title: "1 · Build the World",
                    learn: "Create the five game ingredients: AURA, SHADOW, AURA ORBS, a Stage backdrop, and the PORTAL. Each object is a sprite except the backdrop.",
                    see: "Your Scratch project should now have separate objects that can be programmed independently.",
                    blocks: [],
                    observe: "This is the same world you saw in the opening game.",
                    modify: "Rename sprites clearly: AURA, SHADOW, ORB1…ORB5, PORTAL.",
                    challenge: "Which game object is a Stage backdrop rather than a sprite? → The background"
                },
                {
                    title: "2 · Start AURA",
                    learn: "The green flag starts the game. AURA needs a starting position before movement begins.",
                    see: "Use an Events block followed by Motion position blocks.",
                    blocks: [
                        {text:"when green flag clicked", category:"events"},
                        {text:"go to x: 0 y: 0", category:"motion"}
                    ],
                    observe: "Every run begins from a predictable starting point.",
                    modify: "Change the starting X/Y values and run again.",
                    challenge: "Why set a starting position? → So every game starts consistently"
                },
                {
                    title: "3 · Give AURA Movement",
                    learn: "The player needs continuous movement. A forever loop repeats the movement code while the game is running.",
                    see: "The basic structure is: green flag → forever → movement.",
                    blocks: [
                        {text:"forever", category:"control"},
                        {text:"move 10 steps", category:"motion"}
                    ],
                    observe: "A loop repeats an action instead of running it only once.",
                    modify: "Change the movement amount to change speed.",
                    challenge: "Which block repeats the code forever? → forever"
                },
                {
                    title: "4 · Detect the Orbs",
                    learn: "Sensing lets a sprite ask questions about what is happening. The game needs to know when AURA touches an orb.",
                    see: "A sensing condition can be placed inside an if block.",
                    blocks: [
                        {text:"if < > then", category:"control"},
                        {text:"touching [mouse-pointer]?", category:"sensing"}
                    ],
                    observe: "The condition is the decision: IF something is touched, THEN perform the collection action.",
                    modify: "In real Scratch, change the sensing dropdown to the ORB sprite.",
                    challenge: "Which category asks questions such as 'touching …?' → Sensing"
                },
                {
                    title: "5 · Count the Aura",
                    learn: "Variables store changing information. Our game needs an AURA score that increases whenever an orb is collected.",
                    see: "Create a variable named 'Aura Score'. Start it at 0, then change it when an orb is collected.",
                    blocks: [
                        {text:"set [my variable] to 0", category:"variables"},
                        {text:"change [my variable] by 1", category:"variables"}
                    ],
                    observe: "The score has memory: it can keep its value as the game continues.",
                    modify: "For the final game, make each orb add 10 instead of 1.",
                    challenge: "Which category stores changing values? → Variables"
                },
                {
                    title: "6 · Make the SHADOW Dangerous",
                    learn: "SHADOW should move toward AURA and reduce a life when they touch. This combines movement, sensing and variables.",
                    see: "The important idea is not one magic block—it is a system: move → detect → change lives → reset.",
                    blocks: [
                        {text:"forever", category:"control"},
                        {text:"move 10 steps", category:"motion"},
                        {text:"if < > then", category:"control"},
                        {text:"change [my variable] by 1", category:"variables"}
                    ],
                    observe: "A repeated loop can make an enemy behave continuously.",
                    modify: "In the real project, use a Lives variable and decrease it by 1 after touching SHADOW.",
                    challenge: "What should change when AURA is hit? → Lives"
                },
                {
                    title: "7 · Unlock the Portal",
                    learn: "The portal should only work after the player has collected enough Aura. This is a condition: IF score reaches the target, THEN unlock/allow the exit.",
                    see: "Operators compare values. A condition can check whether Aura Score is greater than or equal to 50.",
                    blocks: [
                        {text:"if < > then", category:"control"},
                        {text:"1 > 1", category:"operators"},
                        {text:"say [Hello!]", category:"looks"}
                    ],
                    observe: "The comparison controls whether the action happens.",
                    modify: "Change the target number. In the final game the portal unlocks at 50.",
                    challenge: "Which category performs comparisons such as >, < and = ? → Operators"
                },
                {
                    title: "8 · Add Game Sounds",
                    learn: "Now connect Sound to gameplay: collection, danger and victory should have feedback.",
                    see: "A sound block can sit inside the same event/condition that handles a game action.",
                    blocks: [
                        {text:"start sound [Meow]", category:"sound"},
                        {text:"play sound [Meow] until done", category:"sound"}
                    ],
                    observe: "The game now communicates through audio as well as visuals.",
                    modify: "In real Scratch, replace the sample sound with collection/hit/win sounds.",
                    challenge: "Which Sound block lets the script continue immediately? → start sound"
                },
                {
                    title: "9 · FINAL RUN — AURA PLUS",
                    learn: "You have now combined the skills. The finished project is the same game from the opening: collect 5 orbs for 50 Aura, avoid SHADOW, unlock the portal, and reach it.",
                    see: "Run the project. Use the preview game on the right. The goal is not to watch—it is to test your own logic.",
                    blocks: [
                        {text:"when green flag clicked", category:"events"},
                        {text:"forever", category:"control"},
                        {text:"move 10 steps", category:"motion"},
                        {text:"if < > then", category:"control"},
                        {text:"change [my variable] by 1", category:"variables"},
                        {text:"start sound [Meow]", category:"sound"}
                    ],
                    observe: "If the logic is correct, the same AURA PLUS gameplay loop works: collect → survive → unlock → escape.",
                    modify: "Challenge yourself: change the score target, enemy speed, or number of lives.",
                    challenge: "Can you explain what Events + Control + Motion + Sensing + Variables + Sound each do in the final game?"
                }
            ]
        }
    };

    const paletteBlocks = {
        motion: [
            "move 10 steps","turn ↻ 15 degrees","turn ↺ 15 degrees",
            "go to random position","go to x: 0 y: 0","change x by 10",
            "set x to 0","change y by 10","set y to 0"
        ],
        looks: [
            "say [Hello!] for 2 seconds","say [Hello!]","think [Hmm...] for 2 seconds",
            "switch costume to [costume2]","next costume",
            "switch backdrop to [backdrop1]","next backdrop"
        ],
        sound: [
            "start sound [Meow]","play sound [Meow] until done","stop all sounds",
            "change volume by -10","set volume to 100%"
        ],
        events: [
            "when green flag clicked","when [space] key pressed",
            "when this sprite clicked","broadcast [message1]",
            "broadcast [message1] and wait"
        ],
        control: [
            "wait 1 seconds","repeat 10","forever","if < > then",
            "if < > then else","wait until < >","stop [all]"
        ],
        sensing: [
            "touching [mouse-pointer]?","touching color [ ]?",
            "ask [What's your name?] and wait","key [space] pressed?",
            "mouse down?","distance to [mouse-pointer]"
        ],
        operators: [
            "pick random 1 to 10","join [hello] [world]","1 + 1",
            "1 > 1","1 = 1","1 < 1"
        ],
        variables: [
            "set [my variable] to 0","change [my variable] by 1",
            "show variable [my variable]","hide variable [my variable]"
        ]
    };

    /* =========================================================
       LESSON ELEMENTS + STATE
    ========================================================= */

    const lessonTitle = document.getElementById("lessonTitle");
    const lessonDescription = document.getElementById("lessonDescription");
    const lessonLearningPoints = document.getElementById("lessonLearningPoints");
    const teacherTip = document.getElementById("teacherTip");
    const lessonNumber = document.getElementById("lessonNumber");
    const lessonStep = document.getElementById("lessonStep");
    const paletteCategory = document.getElementById("paletteCategory");
    const blockPalette = document.getElementById("blockPalette");
    const lessonBlocks = document.getElementById("lessonBlocks");
    const workspaceInstruction = document.getElementById("workspaceInstruction");
    const blockCount = document.getElementById("blockCount");
    const workspaceHint = document.getElementById("workspaceHint");
    const nextButton = document.getElementById("nextLessonStep");
    const showBlockButton = document.getElementById("showBlockButton");
    const runLessonButton = document.getElementById("runLessonButton");

    let currentMission = 1;
    let currentStepIndex = 0;
    let currentExpectedIndex = 0;
    let lessonPhase = 0; // 0 Learn, 1 See, 2 Do
    let completedMissions = new Set();
    let lessonStartedAt = 0;

    function normalize(text) {
        return String(text).toLowerCase().replace(/\s+/g, " ").trim();
    }

    function getCurrentLesson() {
        return lessons[currentMission];
    }

    function getCurrentStep() {
        return getCurrentLesson()?.steps?.[currentStepIndex];
    }

    function openLesson(mission) {
        if (!lessons[mission]) return;

        currentMission = mission;
        currentStepIndex = 0;
        currentExpectedIndex = 0;
        lessonPhase = 0;
        lessonStartedAt = Date.now();

        if (lessonBlocks) lessonBlocks.innerHTML = "";
        showScreen("lesson");
        renderLesson();
    }

    document.querySelectorAll(".mission-card").forEach(card => {
        card.addEventListener("click", () => {
            openLesson(Number(card.dataset.mission));
        });
    });

    function renderLesson() {
        const lesson = getCurrentLesson();
        const step = getCurrentStep();
        if (!lesson || !step) return;

        lessonTitle.textContent = lesson.title;
        lessonDescription.textContent = lesson.description;
        teacherTip.textContent = lesson.tip;
        lessonNumber.textContent = currentMission;
        lessonStep.textContent = `${currentStepIndex + 1}/${lesson.steps.length}`;

        lessonLearningPoints.innerHTML = "";
        lesson.steps.forEach((s, i) => {
            const li = document.createElement("li");
            li.textContent = `${i + 1}. ${s.title}`;
            li.style.fontWeight = i === currentStepIndex ? "800" : "500";
            li.style.opacity = i === currentStepIndex ? "1" : "0.72";
            lessonLearningPoints.appendChild(li);
        });

        currentExpectedIndex = 0;
        lessonPhase = 0;
        if (lessonBlocks) lessonBlocks.innerHTML = "";
        updateBlockCount();
        renderCurrentPhase();
        updateProgress();
        renderMission7PreviewIfNeeded();
    }

    function renderCurrentPhase() {
        const lesson = getCurrentLesson();
        const step = getCurrentStep();
        if (!lesson || !step) return;

        const target = step.blocks?.[currentExpectedIndex];

        if (lessonPhase === 0) {
            workspaceInstruction.textContent =
                `🧠 LEARN — ${step.learn}`;
            workspaceHint.textContent =
                `STEP ${currentStepIndex + 1}: ${step.title}`;
            nextButton.textContent = "SEE IT IN SCRATCH →";
            showBlockButton.textContent = "SHOW EXACT BLOCK";
            renderPalette(lesson.category || "events", false);
            return;
        }

        if (lessonPhase === 1) {
            workspaceInstruction.textContent =
                `👀 SEE — ${step.see}`;
            workspaceHint.textContent =
                target
                    ? `Exact block ${currentExpectedIndex + 1} of ${step.blocks.length}: ${target.text}`
                    : "No block needed for this step — move to TRY.";
            nextButton.textContent = "TRY IT →";
            showBlockButton.textContent = target ? "HIGHLIGHT BLOCK" : "NO BLOCK NEEDED";
            renderPalette(target?.category || lesson.category || "events", Boolean(target));
            return;
        }

        workspaceInstruction.textContent = target
            ? `🧩 DO — Add block ${currentExpectedIndex + 1}/${step.blocks.length}: ${target.text}`
            : `🎯 CHALLENGE — ${step.challenge}`;

        workspaceHint.textContent = target
            ? "Drag OR tap the highlighted block into SCRIPTS. Then run it."
            : "Read the challenge, then press RUN to test the step.";

        nextButton.textContent = target ? "WAITING FOR BLOCK…" : "RUN & TEST →";
        renderPalette(target?.category || lesson.category || "events", Boolean(target));
        if (target) highlightExpectedBlock();
    }

    function renderPalette(category, highlightTarget) {
        if (!blockPalette) return;

        blockPalette.innerHTML = "";
        paletteCategory.textContent =
            category.charAt(0).toUpperCase() + category.slice(1);

        document.querySelectorAll(".block-category").forEach(button => {
            button.classList.toggle("active", button.dataset.category === category);
        });

        (paletteBlocks[category] || []).forEach(text => {
            blockPalette.appendChild(createPaletteBlock(text, category));
        });

        if (highlightTarget) highlightExpectedBlock();
    }

    function createScratchBlock(text, category, workspace = false) {
        const block = document.createElement("div");
        block.className = `scratch-block ${category}`;
        block.textContent = text;
        block.dataset.text = text;
        block.dataset.category = category;

        if (workspace) {
            block.classList.add("workspace-block");
            block.style.cursor = "default";
        }

        return block;
    }

    function createPaletteBlock(text, category) {
        const block = createScratchBlock(text, category, false);
        block.draggable = false;
        block.style.touchAction = "none";

        let pointerId = null;
        let startX = 0;
        let startY = 0;
        let dragging = false;
        let ghost = null;

        const cleanup = () => {
            block.removeEventListener("pointermove", move);
            block.removeEventListener("pointerup", end);
            block.removeEventListener("pointercancel", cancel);
            if (ghost) ghost.remove();
            ghost = null;
            dragging = false;
            pointerId = null;
            clearDropZone();
        };

        const move = ev => {
            if (ev.pointerId !== pointerId) return;
            ev.preventDefault();

            const distance = Math.hypot(ev.clientX - startX, ev.clientY - startY);
            if (!dragging && distance < 8) return;

            if (!dragging) {
                dragging = true;
                ghost = block.cloneNode(true);
                ghost.classList.add("drag-ghost");
                Object.assign(ghost.style, {
                    position: "fixed",
                    zIndex: "99999",
                    pointerEvents: "none",
                    opacity: "0.9",
                    margin: "0",
                    width: `${Math.min(block.getBoundingClientRect().width, 240)}px`
                });
                document.body.appendChild(ghost);
            }

            ghost.style.left = `${ev.clientX - 20}px`;
            ghost.style.top = `${ev.clientY - 20}px`;
            highlightDropZone(ev.clientX, ev.clientY);
        };

        const end = ev => {
            if (ev.pointerId !== pointerId) return;
            ev.preventDefault();

            const wasDragging = dragging;
            const rect = lessonBlocks.getBoundingClientRect();
            const inside =
                ev.clientX >= rect.left && ev.clientX <= rect.right &&
                ev.clientY >= rect.top && ev.clientY <= rect.bottom;

            cleanup();

            if (wasDragging && inside) {
                addBlockToWorkspace(text, category);
            } else if (!wasDragging) {
                addBlockToWorkspace(text, category);
            }
        };

        const cancel = ev => {
            if (ev.pointerId !== pointerId) return;
            cleanup();
        };

        block.addEventListener("pointerdown", event => {
            if (event.pointerType === "mouse" && event.button !== 0) return;
            event.preventDefault();

            pointerId = event.pointerId;
            startX = event.clientX;
            startY = event.clientY;
            dragging = false;

            try { block.setPointerCapture(pointerId); } catch (_) {}

            block.addEventListener("pointermove", move, { passive: false });
            block.addEventListener("pointerup", end, { passive: false });
            block.addEventListener("pointercancel", cancel, { passive: false });
        }, { passive: false });

        return block;
    }

    function highlightDropZone(x, y) {
        if (!lessonBlocks) return;
        const rect = lessonBlocks.getBoundingClientRect();
        const inside =
            x >= rect.left && x <= rect.right &&
            y >= rect.top && y <= rect.bottom;

        lessonBlocks.style.outline = inside ? "4px solid #4c97ff" : "";
        lessonBlocks.style.outlineOffset = inside ? "-4px" : "";
    }

    function clearDropZone() {
        if (!lessonBlocks) return;
        lessonBlocks.style.outline = "";
        lessonBlocks.style.outlineOffset = "";
    }

    function highlightExpectedBlock() {
        const step = getCurrentStep();
        const target = step?.blocks?.[currentExpectedIndex];
        if (!target) return;

        document.querySelectorAll("#blockPalette .scratch-block").forEach(block => {
            const match = normalize(block.dataset.text) === normalize(target.text);
            block.style.outline = match ? "3px solid #facc15" : "";
            block.style.outlineOffset = match ? "2px" : "";
        });
    }

    function addBlockToWorkspace(text, category) {
        const step = getCurrentStep();
        const target = step?.blocks?.[currentExpectedIndex];

        if (lessonPhase !== 2) {
            workspaceInstruction.textContent =
                "👀 First move through LEARN → SEE → TRY. The page will tell you exactly when to add a block.";
            return;
        }

        if (!target) {
            workspaceInstruction.textContent =
                "🎯 This step has no block to add. Press RUN & TEST.";
            return;
        }

        if (normalize(text) !== normalize(target.text)) {
            workspaceInstruction.textContent =
                `❌ Not this one yet. Read the explanation again. We need: "${target.text}"`;
            workspaceHint.textContent =
                `💡 Hint: this step is using the ${target.category.toUpperCase()} category.`;
            highlightExpectedBlock();
            return;
        }

        lessonBlocks.appendChild(createScratchBlock(text, category, true));
        currentExpectedIndex++;
        updateBlockCount();

        workspaceInstruction.textContent =
            `✅ Correct! "${text}" is now in your script.`;

        if (currentExpectedIndex < step.blocks.length) {
            lessonPhase = 1;
            setTimeout(renderCurrentPhase, 450);
        } else {
            lessonPhase = 2;
            setTimeout(() => {
                workspaceInstruction.textContent =
                    `🚀 SCRIPT PART COMPLETE — ${step.observe}`;
                workspaceHint.textContent =
                    `Now MODIFY it: ${step.modify}`;
                nextButton.textContent = "RUN / CONTINUE →";
                renderMission7PreviewIfNeeded();
            }, 350);
        }
    }

    nextButton?.addEventListener("click", () => {
        const step = getCurrentStep();
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

        if (step.blocks?.length && currentExpectedIndex < step.blocks.length) {
            workspaceInstruction.textContent =
                "🧩 Add the highlighted block first. You can tap it on a Smartboard.";
            highlightExpectedBlock();
            return;
        }

        runStepAndContinue();
    });

    showBlockButton?.addEventListener("click", () => {
        const step = getCurrentStep();
        const target = step?.blocks?.[currentExpectedIndex];
        if (!target) {
            workspaceInstruction.textContent = "ℹ️ No Scratch block is required for this step.";
            return;
        }

        lessonPhase = 1;
        renderCurrentPhase();
        highlightExpectedBlock();

        const targetBlock = [...document.querySelectorAll("#blockPalette .scratch-block")]
            .find(block => normalize(block.dataset.text) === normalize(target.text));

        targetBlock?.scrollIntoView({behavior:"smooth", block:"nearest"});
    });

    document.querySelectorAll(".block-category").forEach(button => {
        button.addEventListener("click", () => {
            renderPalette(button.dataset.category, false);
        });
    });

    function runStepAndContinue() {
        const step = getCurrentStep();
        if (!step) return;

        workspaceInstruction.textContent = `▶️ RUNNING — ${step.observe}`;
        runWorkspace();

        setTimeout(() => {
            const lesson = getCurrentLesson();

            if (currentStepIndex < lesson.steps.length - 1) {
                currentStepIndex++;
                currentExpectedIndex = 0;
                lessonPhase = 0;
                if (lessonBlocks) lessonBlocks.innerHTML = "";
                updateBlockCount();
                renderCurrentPhase();
                renderMission7PreviewIfNeeded();
            } else {
                completeMission();
            }
        }, 1200);
    }

    function updateBlockCount() {
        if (!blockCount || !lessonBlocks) return;
        const count = lessonBlocks.children.length;
        blockCount.textContent = `${count} block${count === 1 ? "" : "s"}`;
    }

    /* =========================================================
       MISSION 7 — REAL AURA PLUS PREVIEW
    ========================================================= */

    let auraPlusPreview = null;

    function renderMission7PreviewIfNeeded() {
        const stage = document.getElementById("previewStage");
        if (!stage) return;

        if (currentMission !== 7) {
            auraPlusPreview = null;
            stage.innerHTML = '<div id="previewPlayer">A</div>';
            return;
        }

        if (auraPlusPreview) return;

        stage.innerHTML = `
            <div class="aura-preview-hud">
                <span>⚡ AURA: <b id="apScore">0</b>/50</span>
                <span>❤️ LIVES: <b id="apLives">3</b></span>
            </div>
            <div class="aura-preview-object" id="apPlayer">A</div>
            <div class="aura-preview-shadow" id="apShadow">S</div>
            <div class="aura-preview-portal" id="apPortal">✦</div>
            <div class="aura-preview-orb" style="left:18%;top:25%">✦</div>
            <div class="aura-preview-orb" style="left:40%;top:68%">✦</div>
            <div class="aura-preview-orb" style="left:68%;top:25%">✦</div>
            <div class="aura-preview-orb" style="left:78%;top:65%">✦</div>
            <div class="aura-preview-orb" style="left:48%;top:45%">✦</div>
            <div id="apMessage" class="aura-preview-message">COLLECT 5 ORBS → PORTAL UNLOCKS</div>
        `;

        const playerEl = document.getElementById("apPlayer");
        const shadowEl = document.getElementById("apShadow");
        const portalEl = document.getElementById("apPortal");
        const messageEl = document.getElementById("apMessage");

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
            orbs: [...stage.querySelectorAll(".aura-preview-orb")]
        };

        const keydown = e => {
            if (!auraPlusPreview) return;
            if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","w","a","s","d","W","A","S","D"].includes(e.key)) {
                e.preventDefault();
                auraPlusPreview.keys[e.key.toLowerCase()] = true;
            }
        };

        const keyup = e => {
            if (!auraPlusPreview) return;
            delete auraPlusPreview.keys[e.key.toLowerCase()];
        };

        window.addEventListener("keydown", keydown, {passive:false});
        window.addEventListener("keyup", keyup);

        auraPlusPreview.cleanup = () => {
            window.removeEventListener("keydown", keydown);
            window.removeEventListener("keyup", keyup);
        };

        stage.addEventListener("pointerdown", e => {
            if (!auraPlusPreview) return;
            const r = stage.getBoundingClientRect();
            auraPlusPreview.x = ((e.clientX-r.left)/r.width)*100;
            auraPlusPreview.y = ((e.clientY-r.top)/r.height)*100;
            updateAuraPreview();
        });

        updateAuraPreview();
    }

    function updateAuraPreview() {
        const g = auraPlusPreview;
        if (!g || !g.player) return;

        g.player.style.left = `${g.x}%`;
        g.player.style.top = `${g.y}%`;

        const unlocked = g.score >= 50;
        g.portal.classList.toggle("unlocked", unlocked);
        document.getElementById("apScore").textContent = g.score;
        document.getElementById("apLives").textContent = g.lives;

        if (unlocked) {
            g.message.textContent = "⚡ PORTAL UNLOCKED — REACH IT!";
        } else {
            g.message.textContent = "COLLECT THE AURA ORBS!";
        }
    }

    function runAuraPlusPreview() {
        renderMission7PreviewIfNeeded();
        const g = auraPlusPreview;
        if (!g) return;

        g.running = true;
        g.score = 0;
        g.lives = 3;
        g.x = 12;
        g.y = 50;
        g.orbs.forEach(o => o.style.display = "block");

        const tick = () => {
            if (!g || !g.running) return;

            const speed = 0.8;
            if (g.keys.arrowleft || g.keys.a) g.x -= speed;
            if (g.keys.arrowright || g.keys.d) g.x += speed;
            if (g.keys.arrowup || g.keys.w) g.y -= speed;
            if (g.keys.arrowdown || g.keys.s) g.y += speed;

            g.x = Math.max(4, Math.min(96, g.x));
            g.y = Math.max(10, Math.min(90, g.y));

            g.orbs.forEach(orb => {
                if (orb.style.display === "none") return;
                const ox = parseFloat(orb.style.left);
                const oy = parseFloat(orb.style.top);
                if (Math.hypot(g.x-ox, g.y-oy) < 7) {
                    orb.style.display = "none";
                    g.score += 10;
                }
            });

            const sx = 82 + Math.sin(Date.now()/900)*8;
            const sy = 45 + Math.cos(Date.now()/1100)*25;
            g.shadow.style.left = `${sx}%`;
            g.shadow.style.top = `${sy}%`;

            if (Math.hypot(g.x-sx, g.y-sy) < 7) {
                g.lives--;
                g.x = 12;
                g.y = 50;
                if (g.lives <= 0) {
                    g.running = false;
                    g.message.textContent = "GAME OVER — RUN IT AGAIN";
                }
            }

            if (g.score >= 50 && Math.hypot(g.x-90, g.y-50) < 9) {
                g.running = false;
                g.message.textContent = "🏆 AURA PLUS COMPLETE!";
            }

            updateAuraPreview();
            requestAnimationFrame(tick);
        };

        requestAnimationFrame(tick);
    }

    /* =========================================================
       RUN WORKSPACE
    ========================================================= */

    runLessonButton?.addEventListener("click", runWorkspace);

    function runWorkspace() {
        if (currentMission === 7) {
            runAuraPlusPreview();
            workspaceInstruction.textContent =
                "🎮 PLAY THE SAME AURA PLUS GAME — collect all 5 orbs, avoid SHADOW, then reach the portal.";
            return;
        }

        const blocks = [...(lessonBlocks?.children || [])];
        const preview = document.getElementById("previewPlayer");
        const stage = document.getElementById("previewStage");

        if (!blocks.length || !preview) {
            workspaceInstruction.textContent =
                "🧩 Add the Scratch blocks for this step first.";
            return;
        }

        preview.textContent = "A";
        preview.style.left = "50%";
        preview.style.top = "50%";
        preview.style.transform = "translate(-50%, -50%) rotate(0deg)";
        stage?.querySelector(".js-bubble")?.remove();

        blocks.forEach((block, i) => {
            setTimeout(() => {
                executeAction(getAction(block.textContent), preview);
            }, i * 550);
        });
    }

    function getAction(text) {
        const t = text.toLowerCase();

        if (t.includes("change x")) return "x";
        if (t.includes("change y")) return "y";
        if (t.includes("go to x")) return "goto";
        if (t.includes("move")) return "move";
        if (t.includes("turn")) return "turn";
        if (t.includes("costume")) return "costume";
        if (t.includes("backdrop")) return "backdrop";
        if (t.includes("sound")) return "sound";
        if (t.includes("say")) return "say";
        if (t.includes("variable")) return "variable";
        if (t.includes("forever")) return "loop";
        if (t.includes("if")) return "condition";
        return "none";
    }

    function executeAction(action, preview) {
        switch (action) {
            case "move":
            case "x":
                preview.style.left = "70%";
                break;
            case "y":
                preview.style.top = "30%";
                break;
            case "goto":
                preview.style.left = "50%";
                preview.style.top = "50%";
                break;
            case "turn":
                preview.style.transform =
                    "translate(-50%, -50%) rotate(25deg)";
                break;
            case "costume":
                preview.textContent = preview.textContent === "A" ? "★" : "A";
                break;
            case "say":
                showBubble("Hello!", "previewStage");
                break;
            case "sound":
                showBubble("🔊 Sound!", "previewStage");
                break;
            case "backdrop":
                document.getElementById("previewStage")
                    ?.classList.toggle("alternate-backdrop");
                break;
            case "variable":
                showBubble("⚡ Score +10", "previewStage");
                break;
            case "loop":
                showBubble("↻ Repeats", "previewStage");
                break;
            case "condition":
                showBubble("IF condition checked", "previewStage");
                break;
        }
    }

    function showBubble(text, stageId) {
        const stage = document.getElementById(stageId);
        if (!stage) return;

        stage.querySelector(".js-bubble")?.remove();

        const bubble = document.createElement("div");
        bubble.className = "js-bubble";
        bubble.textContent = text;

        Object.assign(bubble.style, {
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
            boxShadow: "0 3px 12px rgba(0,0,0,.2)"
        });

        stage.appendChild(bubble);
        setTimeout(() => bubble.remove(), 1200);
    }

    /* =========================================================
       MISSION COMPLETE / PROGRESS
    ========================================================= */

    function completeMission() {
        if (completedMissions.has(currentMission)) return;

        completedMissions.add(currentMission);
        updateProgress();

        workspaceInstruction.textContent =
            currentMission === 7
                ? "🏆 AURA PLUS COMPLETE! You rebuilt the final game."
                : `🏆 MISSION ${currentMission} COMPLETE! You learned the skill needed for the final game.`;

        setTimeout(() => {
            if (completedMissions.size >= 7) {
                showScreen("final");
            } else {
                showQuickCheck();
            }
        }, 800);
    }

    function updateProgress() {
        const percentage = (completedMissions.size / 7) * 100;
        const progress = document.getElementById("auraProgress");
        const counter = document.getElementById("tutorialAura");

        if (progress) progress.style.width = `${percentage}%`;
        if (counter) counter.textContent = `${completedMissions.size} / 7`;

        document.querySelectorAll(".mission-card").forEach(card => {
            const mission = Number(card.dataset.mission);
            card.classList.toggle("completed", completedMissions.has(mission));
        });
    }

    /* =========================================================
       NAVIGATION
    ========================================================= */

    document.getElementById("backToMissions")?.addEventListener("click", () => {
        showScreen("tutorial");
    });

    document.getElementById("replayButton")?.addEventListener("click", () => {
        completedMissions.clear();
        currentMission = 1;
        currentStepIndex = 0;
        currentExpectedIndex = 0;
        updateProgress();
        showScreen("tutorial");
    });

    updateProgress();

'''
updated = text[:start] + new_lesson + text[end:]

out = Path("/mnt/data/script_updated_aura_plus.js")
out.write_text(updated)
print(f"Created {out}")
print(f"Lines: {len(updated.splitlines())}")
