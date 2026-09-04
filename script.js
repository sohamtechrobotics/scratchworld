(() => {
"use strict";

/* =========================================================
   AURA PLUS — SCRATCH GAME LAB
   ========================================================= */

const $ = id => document.getElementById(id);

const screens = {
  intro: $("introScreen"),
  game: $("gameScreen"),
  secret: $("secretScreen"),
  tutorial: $("tutorialScreen"),
  lesson: $("lessonScreen"),
  final: $("finalScreen")
};

function showScreen(name) {
  Object.entries(screens).forEach(([key, el]) => {
    if (!el) return;
    el.classList.toggle("hidden", key !== name);
    el.classList.toggle("active", key === name);
  });
  window.scrollTo(0, 0);
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

const keys = {};

function resetGame() {
  score = 0;
  lives = 3;
  gx = 70;
  gy = 110;

  if (auraScore) auraScore.textContent = "0";
  if (livesEl) livesEl.textContent = "3";

  document.querySelectorAll(".aura-orb").forEach(orb => {
    orb.style.display = "block";
  });

  if (portal) {
    portal.style.opacity = ".35";
    portal.style.boxShadow = "0 0 0 transparent";
  }

  if ($("gameObjective")) {
    $("gameObjective").textContent = "COLLECT THE AURA ORBS!";
  }

  if (gameMessage) {
    gameMessage.classList.add("hidden");
    gameMessage.innerHTML = "";
  }

  if (player) {
    player.style.left = gx + "px";
    player.style.top = gy + "px";
  }

  if (shadow) {
    shadow.style.left = "70%";
    shadow.style.top = "50%";
  }
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
  if (!gameRunning || !gameWorld) return;

  const speed = 4;

  if (keys.ArrowLeft || keys.a) gx -= speed;
  if (keys.ArrowRight || keys.d) gx += speed;
  if (keys.ArrowUp || keys.w) gy -= speed;
  if (keys.ArrowDown || keys.s) gy += speed;

  gx = Math.max(
    0,
    Math.min(gameWorld.clientWidth - player.offsetWidth, gx)
  );

  gy = Math.max(
    45,
    Math.min(gameWorld.clientHeight - player.offsetHeight, gy)
  );

  player.style.left = gx + "px";
  player.style.top = gy + "px";

  /* Shadow follows player */
  const shadowX = parseFloat(shadow.style.left) || 70;
  const shadowY = parseFloat(shadow.style.top) || 50;

  const playerPercentX =
    (gx / Math.max(1, gameWorld.clientWidth)) * 100;

  const playerPercentY =
    (gy / Math.max(1, gameWorld.clientHeight)) * 100;

  let sx = shadowX;
  let sy = shadowY;

  sx += playerPercentX > shadowX ? 0.65 : -0.65;
  sy += playerPercentY > shadowY ? 0.45 : -0.45;

  sx = Math.max(2, Math.min(94, sx));
  sy = Math.max(12, Math.min(88, sy));

  shadow.style.left = sx + "%";
  shadow.style.top = sy + "%";

  /* Collect orbs */
  document.querySelectorAll(".aura-orb").forEach(orb => {
    if (
      orb.style.display !== "none" &&
      rectsTouch(player, orb)
    ) {
      orb.style.display = "none";

      score += 10;

      if (auraScore) {
        auraScore.textContent = score;
      }

      if (score >= 50) {
        if (portal) {
          portal.style.opacity = "1";
          portal.style.boxShadow =
            "0 0 35px rgba(167,139,250,.9)";
        }

        if ($("gameObjective")) {
          $("gameObjective").textContent =
            "PORTAL UNLOCKED — REACH IT!";
        }
      }
    }
  });

  /* Shadow collision */
  if (rectsTouch(player, shadow)) {
    lives--;

    if (livesEl) {
      livesEl.textContent = lives;
    }

    gx = 70;
    gy = 110;

    player.style.left = gx + "px";
    player.style.top = gy + "px";

    if (lives <= 0) {
      gameRunning = false;

      if (gameMessage) {
        gameMessage.innerHTML =
          "GAME OVER 😵<br><small>Click EXIT and try again.</small>";
        gameMessage.classList.remove("hidden");
      }

      return;
    }
  }

  /* Portal */
  if (
    score >= 50 &&
    portal &&
    rectsTouch(player, portal)
  ) {
    gameRunning = false;

    if (gameMessage) {
      gameMessage.innerHTML =
        "🏆 AURA PLUS COMPLETE!";
      gameMessage.classList.remove("hidden");
    }

    setTimeout(() => {
      showScreen("secret");
    }, 900);

    return;
  }

  requestAnimationFrame(updateGame);
}

function startGame() {
  resetGame();
  gameRunning = true;
  requestAnimationFrame(updateGame);
}

function stopGame() {
  gameRunning = false;
}

$("playGameButton")?.addEventListener("click", () => {
  showScreen("game");
  startGame();
});

$("exitGame")?.addEventListener("click", () => {
  stopGame();
  showScreen("intro");
});

window.addEventListener("keydown", event => {
  const key = event.key;

  if (
    [
      "ArrowUp",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "w",
      "a",
      "s",
      "d"
    ].includes(key)
  ) {
    event.preventDefault();
    keys[key] = true;
  }
});

window.addEventListener("keyup", event => {
  keys[event.key] = false;
});

$("tutorialButton")?.addEventListener("click", () => {
  showScreen("tutorial");
  updateProgress();
});

$("revealButton")?.addEventListener("click", () => {
  showScreen("tutorial");
  updateProgress();
});

$("replayButton")?.addEventListener("click", () => {
  completed.clear();
  updateProgress();
  showScreen("tutorial");
});


/* =========================================================
   LESSON DATA
   ========================================================= */

const lessons = {

1: {
  title: "Working with Sprites",
  desc: "Sprites are the characters and objects in Scratch.",
  why: "Each sprite has its own Code, Costumes and Sounds.",
  tip: "A project can contain many sprites.",
  steps: [
    {
      action: "Click the AURA sprite in the Sprite List.",
      why: "Selecting a sprite tells Scratch which sprite you are programming.",
      target: "sprite:Aura"
    },
    {
      action: "Click the + button beside SPRITE LIST.",
      why: "This is where you add another sprite.",
      target: "add-sprite"
    },
    {
      action: "Click the SHADOW sprite.",
      why: "Different sprites can have completely different scripts.",
      target: "sprite:Shadow"
    },
    {
      action: "Click the AURA sprite again.",
      why: "The selected sprite is the one whose code you edit.",
      target: "sprite:Aura"
    }
  ]
},

2: {
  title: "Make a Sprite Move",
  desc: "Motion blocks control where a sprite moves on the Stage.",
  why: "Scratch uses Motion blocks such as move, turn and change x/y.",
  tip: "Motion blocks are blue.",
  steps: [
    {
      action: "Select AURA, then click Motion.",
      why: "Motion is the category for movement.",
      target: "category:motion"
    },
    {
      action: "Tap “move 10 steps” in the palette.",
      why: "This adds a real Motion block to the script.",
      target: "block:move 10 steps"
    },
    {
      action: "Tap “turn ↻ 15 degrees”.",
      why: "Turn changes the sprite's direction.",
      target: "block:turn ↻ 15 degrees"
    },
    {
      action: "Tap “change x by 10”.",
      why: "Changing x moves a sprite left or right.",
      target: "block:change x by 10"
    }
  ]
},

3: {
  title: "Change Costumes",
  desc: "A sprite can have more than one costume.",
  why: "Changing costumes is how Scratch can make a character look animated.",
  tip: "Use the Costumes tab to see and edit a sprite's costumes.",
  steps: [
    {
      action: "Click the Costumes tab at the top.",
      why: "The Costumes tab shows the selected sprite's costumes.",
      target: "tab:costumes"
    },
    {
      action: "Click Costume 2.",
      why: "A sprite can have multiple costumes.",
      target: "costume:Costume 2"
    },
    {
      action: "Click “＋ Choose” in the costume area.",
      why: "Scratch lets you add another costume from its library.",
      target: "choose-costume"
    },
    {
      action: "Click the Code tab to return to scripts.",
      why: "Code, Costumes and Sounds are different editing areas.",
      target: "tab:code"
    }
  ]
},

4: {
  title: "Program Two Sprites",
  desc: "Every sprite can have its own script.",
  why: "AURA can move while SHADOW behaves differently.",
  tip: "Always check which sprite is selected before adding code.",
  steps: [
    {
      action: "Click AURA in the Sprite List.",
      why: "You are now editing AURA's scripts.",
      target: "sprite:Aura"
    },
    {
      action: "Click Code.",
      why: "The Code tab shows AURA's scripts.",
      target: "tab:code"
    },
    {
      action: "Click SHADOW in the Sprite List.",
      why: "Now Scratch is ready to edit SHADOW.",
      target: "sprite:Shadow"
    },
    {
      action: "Tap “when green flag clicked” in Events.",
      why: "An Events block can start SHADOW's script.",
      target: "block:when green flag clicked"
    }
  ]
},

5: {
  title: "Change the Backdrop",
  desc: "The Stage has backdrops instead of costumes.",
  why: "Backdrops change the scene behind every sprite.",
  tip: "Select the Stage to work with backdrops.",
  steps: [
    {
      action: "Click “Select Stage” below the asset panel.",
      why: "The Stage has its own Backdrops area.",
      target: "select-stage"
    },
    {
      action: "Click “＋ Choose Backdrop”.",
      why: "Scratch provides a backdrop library.",
      target: "choose-backdrop"
    },
    {
      action: "Click the Aquarium backdrop thumbnail.",
      why: "A backdrop changes the scene without changing sprites.",
      target: "backdrop:Aquarium"
    },
    {
      action: "Click AURA in the Sprite List.",
      why: "You can return from the Stage to a sprite.",
      target: "sprite:Aura"
    }
  ]
},

6: {
  title: "Working with Sounds",
  desc: "Sprites can have sounds that play during the project.",
  why: "Sounds are added and managed from the Sounds tab.",
  tip: "Use the Sound category for sound blocks.",
  steps: [
    {
      action: "Click AURA, then click the Sounds tab.",
      why: "Sounds belong to the selected sprite.",
      target: "tab:sounds"
    },
    {
      action: "Click “＋ Choose” in the sound area.",
      why: "Scratch lets you choose a sound from its library.",
      target: "choose-sound"
    },
    {
      action: "Click the Sound category on the left.",
      why: "Sound blocks control when sounds play.",
      target: "category:sound"
    },
    {
      action: "Tap “start sound Pop”.",
      why: "This starts a sound without stopping the rest of the script.",
      target: "block:start sound Pop"
    }
  ]
},

7: {
  title: "BUILD AURA PLUS",
  desc: "Put everything together and understand how the game works.",
  why: "AURA PLUS combines sprites, Motion, Control, Sensing, Variables, Sounds and the Stage.",
  tip: "Build the idea piece by piece — then test the actual game.",
  steps: [
    {
      action: "Select AURA and add “when green flag clicked”.",
      why: "The green flag starts the game.",
      target: "block:when green flag clicked"
    },
    {
      action: "Add “forever” from Control.",
      why: "A game needs a loop that keeps checking what is happening.",
      target: "block:forever"
    },
    {
      action: "Add “change x by 10”.",
      why: "This gives AURA horizontal movement.",
      target: "block:change x by 10"
    },
    {
      action: "Select the ORB sprite.",
      why: "The orb is a separate sprite with its own behaviour.",
      target: "sprite:Orb"
    },
    {
      action: "Add “if <> then”.",
      why: "An if block lets Scratch react to a condition.",
      target: "block:if <> then"
    },
    {
      action: "Open Sensing and add “touching AURA?”.",
      why: "Sensing detects whether sprites are touching.",
      target: "block:touching AURA?"
    },
    {
      action: "Open Variables and create/use “AURA”.",
      why: "A variable stores the player's changing score.",
      target: "category:variables"
    },
    {
      action: "Add “change AURA by 10”.",
      why: "Each orb gives the player 10 AURA.",
      target: "block:change AURA by 10"
    },
    {
      action: "Select SHADOW and add its collision logic.",
      why: "The enemy needs to react when it touches AURA.",
      target: "sprite:Shadow"
    },
    {
      action: "Select PORTAL.",
      why: "The portal is the final destination.",
      target: "sprite:Portal"
    },
    {
      action: "Add “start sound Pop”.",
      why: "Sound gives feedback when something happens.",
      target: "block:start sound Pop"
    },
    {
      action: "Click the green flag and test AURA PLUS.",
      why: "Collect all 5 orbs, avoid SHADOW and reach the portal.",
      target: "stage-flag"
    }
  ]
}

};


/* =========================================================
   SCRATCH BLOCK PALETTE
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
  "when [space] key pressed",
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

const colors = {
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
   EDITOR REFERENCES
   ========================================================= */

const palette = $("blockPalette");
const lessonBlocks = $("lessonBlocks");
const workspaceInstruction = $("workspaceInstruction");

const lessonStep = $("lessonStep");
const stepProgressBar = $("stepProgressBar");
const actionText = $("actionText");

const lessonTitle = $("lessonTitle");
const lessonDescription = $("lessonDescription");
const lessonWhy = $("lessonWhy");
const teacherTip = $("teacherTip");

const paletteCategory = $("paletteCategory");
const blockCount = $("blockCount");
const bottomHint = $("bottomHint");
const selectedTarget = $("selectedTarget");

let currentMission = 1;
let currentStep = 0;

const completed = new Set();


/* =========================================================
   HELPERS
   ========================================================= */

function normalize(text) {
  return String(text)
    .toLowerCase()
    .replace(/[“”"']/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function activeCategory() {
  return (
    document.querySelector(".block-category.active")
      ?.dataset.category || "motion"
  );
}

function setStatus(text) {
  if (workspaceInstruction) {
    workspaceInstruction.textContent = text;
  }

  if (bottomHint) {
    bottomHint.textContent = text;
  }
}


/* =========================================================
   EDITABLE SCRATCH FIELDS
   ========================================================= */

function makeEditableBlock(text, category) {

  const block = document.createElement("div");

  block.className =
    `workspace-block ${colors[category] || ""}`;

  block.dataset.text = text;

  const lower = text.toLowerCase();

  /* MOVE */
  if (lower.startsWith("move ")) {

    block.innerHTML = `
      <span>move</span>
      <input class="block-input number-input"
             value="10"
             aria-label="steps">
      <span>steps</span>
    `;

  }

  /* TURN */
  else if (lower.startsWith("turn")) {

    block.innerHTML = `
      <span>turn ↻</span>
      <input class="block-input number-input"
             value="15">
      <span>degrees</span>
    `;

  }

  /* CHANGE X */
  else if (lower.startsWith("change x")) {

    block.innerHTML = `
      <span>change x by</span>
      <input class="block-input number-input"
             value="10">
    `;

  }

  /* CHANGE Y */
  else if (lower.startsWith("change y")) {

    block.innerHTML = `
      <span>change y by</span>
      <input class="block-input number-input"
             value="10">
    `;

  }

  /* SET X */
  else if (lower.startsWith("set x")) {

    block.innerHTML = `
      <span>set x to</span>
      <input class="block-input number-input"
             value="0">
    `;

  }

  /* SET Y */
  else if (lower.startsWith("set y")) {

    block.innerHTML = `
      <span>set y to</span>
      <input class="block-input number-input"
             value="0">
    `;

  }

  /* SAY */
  else if (lower.startsWith("say ")) {

    block.innerHTML = `
      <span>say</span>
      <input class="block-input text-input"
             value="Hello!">
      <span>for</span>
      <input class="block-input number-input"
             value="2">
      <span>seconds</span>
    `;

  }

  /* WAIT */
  else if (lower.startsWith("wait ")) {

    block.innerHTML = `
      <span>wait</span>
      <input class="block-input number-input"
             value="1">
      <span>seconds</span>
    `;

  }

  /* CHANGE VARIABLE */
  else if (lower.startsWith("change aura")) {

    block.innerHTML = `
      <span>change AURA by</span>
      <input class="block-input number-input"
             value="10">
    `;

  }

  /* SET VARIABLE */
  else if (lower.startsWith("set aura")) {

    block.innerHTML = `
      <span>set AURA to</span>
      <input class="block-input number-input"
             value="0">
    `;

  }

  /* REPEAT */
  else if (lower.startsWith("repeat ")) {

    block.innerHTML = `
      <span>repeat</span>
      <input class="block-input number-input"
             value="10">
    `;

  }

  /* IF */
  else if (lower.startsWith("if")) {

    block.innerHTML = `
      <span>if</span>
      <select class="block-select">
        <option>touching AURA?</option>
        <option>touching mouse-pointer?</option>
        <option>AURA = 50</option>
        <option>AURA > 0</option>
      </select>
      <span>then</span>
    `;

  }

  /* SENSING */
  else if (lower.startsWith("touching")) {

    block.innerHTML = `
      <select class="block-select">
        <option>AURA</option>
        <option>mouse-pointer</option>
        <option>SHADOW</option>
        <option>Orb</option>
      </select>
      <span>?</span>
    `;

  }

  /* DEFAULT */
  else {

    block.textContent = text;

  }

  /* Delete button */
  const deleteButton = document.createElement("button");

  deleteButton.className = "workspace-delete";
  deleteButton.textContent = "×";
  deleteButton.title = "Remove block";

  deleteButton.addEventListener("click", event => {
    event.stopPropagation();
    block.remove();

    updateBlockCount();

    setStatus(
      "Block removed. Add it again if you need it."
    );
  });

  block.appendChild(deleteButton);

  return block;
}


/* =========================================================
   RENDER PALETTE
   ========================================================= */

function renderPalette(category = activeCategory()) {

  if (!palette) return;

  paletteCategory.textContent =
    category === "myblocks"
      ? "My Blocks"
      : category.charAt(0).toUpperCase() +
        category.slice(1);

  palette.innerHTML = "";

  (categoryBlocks[category] || []).forEach(text => {

    const block = document.createElement("div");

    block.className =
      `scratch-block ${colors[category]} stack`;

    block.dataset.text = text;

    block.textContent = text;

    block.addEventListener("click", () => {

      addBlock(text, category);

    });

    palette.appendChild(block);

  });

  highlightTarget();
}


/* =========================================================
   ADD BLOCK
   ========================================================= */

function addBlock(text, category) {

  const step =
    lessons[currentMission]?.steps[currentStep];

  if (!step) return;

  const target =
    step.target || "";

  /* Wrong block */
  if (
    target.startsWith("block:") &&
    normalize(target.slice(6)) !== normalize(text)
  ) {

    setStatus(
      "⚠️ Not the highlighted block. Try the yellow one."
    );

    return;
  }

  lessonBlocks
    .querySelector(".workspace-empty")
    ?.remove();

  const block =
    makeEditableBlock(text, category);

  block.classList.add("new-block");

  lessonBlocks.appendChild(block);

  updateBlockCount();

  setStatus(
    "✓ Block added to your script. You can edit its values!"
  );

  /* Automatically keep workspace visible */
  setTimeout(() => {
    block.scrollIntoView({
      behavior: "smooth",
      block: "nearest"
    });
  }, 50);
}


/* =========================================================
   BLOCK COUNT
   ========================================================= */

function updateBlockCount() {

  if (!lessonBlocks || !blockCount) return;

  const count =
    lessonBlocks.querySelectorAll(
      ".workspace-block"
    ).length;

  blockCount.textContent =
    `${count} block${count === 1 ? "" : "s"}`;
}


/* =========================================================
   HIGHLIGHTING
   ========================================================= */

function clearHighlights() {

  document
    .querySelectorAll(".lesson-target")
    .forEach(element => {

      element.classList.remove(
        "lesson-target"
      );

    });
}

function highlight(element) {

  if (!element) return;

  element.classList.add(
    "lesson-target"
  );

}

function highlightTarget() {

  clearHighlights();

  const target =
    lessons[currentMission]
      ?.steps[currentStep]
      ?.target || "";

  if (target.startsWith("category:")) {

    const category =
      target.slice(9);

    highlight(
      document.querySelector(
        `[data-category="${category}"]`
      )
    );

  }

  else if (target.startsWith("block:")) {

    const wanted =
      normalize(target.slice(6));

    const match =
      [...palette.children].find(
        block =>
          normalize(block.dataset.text) ===
          wanted
      );

    highlight(match);

  }

  else if (target.startsWith("sprite:")) {

    highlight(
      document.querySelector(
        `[data-sprite="${target.slice(7)}"]`
      )
    );

  }

  else if (target.startsWith("tab:")) {

    highlight(
      document.querySelector(
        `[data-editor-tab="${target.slice(4)}"]`
      )
    );

  }

  else if (target.startsWith("costume:")) {

    highlight(
      document.querySelector(
        `[data-asset="${target.slice(8)}"]`
      )
    );

  }

  else if (target.startsWith("backdrop:")) {

    highlight(
      document.querySelector(
        `[data-asset="${target.slice(9)}"]`
      )
    );

  }

  else if (target === "add-sprite") {

    highlight(
      $("addSpriteButton")
    );

  }

  else if (target === "choose-costume") {

    openAsset("costumes");

    highlight(
      $("chooseAssetButton")
    );

  }

  else if (target === "choose-sound") {

    openAsset("sounds");

    highlight(
      $("chooseAssetButton")
    );

  }

  else if (target === "choose-backdrop") {

    highlight(
      $("chooseBackdropButton")
    );

  }

  else if (target === "select-stage") {

    highlight(
      $("stageSelectButton")
    );

  }

  else if (target === "stage-flag") {

    highlight(
      $("stageFlag")
    );

  }

}


/* =========================================================
   LOAD STEP
   ========================================================= */

function loadStep() {

  const lesson =
    lessons[currentMission];

  const step =
    lesson.steps[currentStep];

  if (!lesson || !step) return;

  if (lessonStep) {
    lessonStep.textContent =
      `${currentStep + 1}/${lesson.steps.length}`;
  }

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

  setStatus(
    "Follow the highlighted action, then press NEXT."
  );

  /* Automatically select required category */
  if (step.target.startsWith("category:")) {

    const category =
      step.target.slice(9);

    document
      .querySelector(
        `[data-category="${category}"]`
      )
      ?.click();

  }

  /* Automatically select category for blocks */
  if (step.target.startsWith("block:")) {

    const wanted =
      normalize(step.target.slice(6));

    const category =
      Object.keys(categoryBlocks)
        .find(cat =>
          categoryBlocks[cat].some(
            text =>
              normalize(text) === wanted
          )
        );

    if (category) {

      document
        .querySelector(
          `[data-category="${category}"]`
        )
        ?.click();

    }

  }

  renderPalette(activeCategory());
  highlightTarget();
}


/* =========================================================
   OPEN MISSION
   ========================================================= */

function openMission(mission) {

  currentMission = mission;
  currentStep = 0;

  showScreen("lesson");

  if (lessonBlocks) {

    lessonBlocks.innerHTML = `
      <div class="workspace-empty">
        <div class="empty-icon">🧩</div>
        <strong>Your Scratch script starts here</strong>
        <small>
          Follow the yellow highlight and tap a block to add it.
        </small>
      </div>
    `;

  }

  if (blockCount)
    blockCount.textContent = "0 blocks";

  if (selectedTarget)
    selectedTarget.textContent = "AURA";

  document
    .querySelectorAll(".project-tab")
    .forEach(tab =>
      tab.classList.toggle(
        "active",
        tab.dataset.editorTab === "code"
      )
    );

  document
    .querySelectorAll(".block-category")
    .forEach(btn =>
      btn.classList.toggle(
        "active",
        btn.dataset.category ===
        "motion"
      )
    );

  renderPalette("motion");
  loadStep();

}


/* =========================================================
   MISSION BUTTONS
   ========================================================= */

document
  .querySelectorAll(".mission-card")
  .forEach(card => {

    card.addEventListener(
      "click",
      () => {

        openMission(
          Number(card.dataset.mission)
        );

      }
    );

  });

$("backToMissions")
  ?.addEventListener("click", () => {

    showScreen("tutorial");
    updateProgress();

  });


/* =========================================================
   CATEGORIES
   ========================================================= */

document
  .querySelectorAll(".block-category")
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        document
          .querySelectorAll(".block-category")
          .forEach(b =>
            b.classList.remove("active")
          );

        button.classList.add("active");

        renderPalette(
          button.dataset.category
        );

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

        document
          .querySelectorAll(".sprite-card")
          .forEach(x =>
            x.classList.remove("selected")
          );

        card.classList.add("selected");

        const sprite =
          card.dataset.sprite;

        if (selectedTarget) {

          selectedTarget.textContent =
            sprite.toUpperCase();

        }

        setStatus(
          `Selected ${sprite}. This sprite now has focus.`
        );

        highlightTarget();

      }
    );

  });


$("addSpriteButton")
  ?.addEventListener("click", () => {

    setStatus(
      "✨ Sprite Library opened — choose a sprite to add."
    );

  });

$("chooseSpriteButton")
  ?.addEventListener("click", () => {

    setStatus(
      "Choose a Sprite: Library • Paint • Upload • Surprise."
    );

  });


/* =========================================================
   EDITOR TABS
   ========================================================= */

document
  .querySelectorAll(".project-tab")
  .forEach(tab => {

    tab.addEventListener(
      "click",
      () => {

        document
          .querySelectorAll(".project-tab")
          .forEach(x =>
            x.classList.remove("active")
          );

        tab.classList.add("active");

        const type =
          tab.dataset.editorTab;

        if (type === "code") {

          renderPalette(
            activeCategory()
          );

          setStatus(
            "Code selected. Choose a Scratch block."
          );

        } else {

          openAsset(type);

        }

        highlightTarget();

      }
    );

  });


/* =========================================================
   ASSET LIBRARIES
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


function openAsset(type) {

  const assetLibrary =
    $("assetLibrary");

  const backdropLibrary =
    $("backdropLibrary");

  if (!assetLibrary ||
      !backdropLibrary) return;

  const isBackdrop =
    type === "backdrops";

  assetLibrary.style.display =
    isBackdrop ? "none" : "block";

  backdropLibrary.style.display =
    isBackdrop ? "block" : "none";

  const title =
    $("assetLibraryTitle");

  if (title) {

    title.textContent =
      type.toUpperCase();

  }

  const items =
    $(isBackdrop
      ? "backdropItems"
      : "assetLibraryItems"
    );

  if (!items) return;

  items.innerHTML = "";

  (assetData[type] || []).forEach(
    (name, index) => {

      const button =
        document.createElement("button");

      button.className =
        "asset-item" +
        (index === 0
          ? " selected"
          : "");

      button.dataset.asset = name;

      if (type === "sounds") {

        button.textContent = "🔊";

      }

      else if (type === "costumes") {

        button.textContent = "🎭";

      }

      else {

        button.textContent =
          name === "Aquarium"
            ? "🐠"
            : "🌌";

      }

      button.title = name;

      button.addEventListener(
        "click",
        () => {

          items
            .querySelectorAll(".asset-item")
            .forEach(x =>
              x.classList.remove(
                "selected"
              )
            );

          button.classList.add(
            "selected"
          );

          setStatus(
            `Selected ${name}.`
          );

          /* Visual backdrop change */
          if (
            type === "backdrops" &&
            $("stageScene")
          ) {

            $("stageScene")
              .dataset.backdrop = name;

          }

          highlightTarget();

        }
      );

      items.appendChild(button);

    }
  );

}


/* =========================================================
   ASSET BUTTONS
   ========================================================= */

$("chooseAssetButton")
  ?.addEventListener("click", () => {

    setStatus(
      "Choose an asset from the Scratch library below."
    );

  });

$("chooseBackdropButton")
  ?.addEventListener("click", () => {

    openAsset("backdrops");

    setStatus(
      "Choose a backdrop from the Backdrop Library."
    );

  });

$("stageSelectButton")
  ?.addEventListener("click", () => {

    openAsset("backdrops");

    setStatus(
      "Stage selected — Backdrops are now shown."
    );

    highlightTarget();

  });

$("paintAssetButton")
  ?.addEventListener("click", () => {

    setStatus(
      "🎨 Paint opens the Scratch Paint Editor."
    );

  });


/* =========================================================
   RUN / STOP
   ========================================================= */

function runWorkspace() {

  const blocks =
    lessonBlocks
      ?.querySelectorAll(".workspace-block");

  if (!blocks || !blocks.length) {

    setStatus(
      "🧩 Add a Scratch block first."
    );

    return;

  }

  /* Mission 7 runs actual game */
  if (currentMission === 7) {

    setStatus(
      "🎮 AURA PLUS is running — collect 5 orbs, avoid SHADOW and reach PORTAL."
    );

    runMiniLessonPreview();

    return;

  }

  runScratchPreview();

}


function runScratchPreview() {

  const preview =
    $("previewPlayer");

  if (!preview) {

    setStatus(
      "▶️ Script is ready to run."
    );

    return;

  }

  const blocks =
    [
      ...lessonBlocks
        .querySelectorAll(".workspace-block")
    ];

  let x = 25;
  let y = 45;
  let direction = 0;

  preview.style.left = x + "%";
  preview.style.top = y + "%";
  preview.style.transform =
    "translate(-50%,-50%)";

  let delay = 0;

  blocks.forEach(block => {

    const text =
      block.dataset.text || "";

    const lower =
      text.toLowerCase();

    const numbers =
      [...block.querySelectorAll(
        ".block-input"
      )]
      .map(input =>
        parseFloat(input.value) || 0
      );

    setTimeout(() => {

      if (lower.startsWith("move")) {

        const amount =
          numbers[0] || 10;

        const radians =
          direction * Math.PI / 180;

        x +=
          Math.cos(radians) *
          amount / 4;

        y +=
          Math.sin(radians) *
          amount / 4;

      }

      else if (lower.startsWith("change x")) {

        x += numbers[0] || 10;

      }

      else if (lower.startsWith("change y")) {

        y += numbers[0] || 10;

      }

      else if (lower.startsWith("turn")) {

        direction +=
          numbers[0] || 15;

      }

      else if (lower.startsWith("set x")) {

        x =
          (numbers[0] || 0) / 4 + 50;

      }

      else if (lower.startsWith("set y")) {

        y =
          50 - (numbers[0] || 0) / 4;

      }

      x = Math.max(5, Math.min(95, x));
      y = Math.max(15, Math.min(85, y));

      preview.style.left =
        x + "%";

      preview.style.top =
        y + "%";

      preview.style.transform =
        `translate(-50%,-50%) rotate(${direction}deg)`;

      if (lower.startsWith("say")) {

        showPreviewBubble(
          block.querySelector(".text-input")
            ?.value || "Hello!"
        );

      }

      if (lower.startsWith("start sound")) {

        showPreviewBubble("🔊 POP!");

      }

    }, delay);

    delay += 550;

  });

  setTimeout(() => {

    setStatus(
      "✓ Run complete. Change a value and run again!"
    );

  }, delay + 100);

}


function showPreviewBubble(text) {

  const stage =
    $("previewStage");

  if (!stage) return;

  let bubble =
    stage.querySelector(
      ".preview-bubble"
    );

  if (!bubble) {

    bubble =
      document.createElement("div");

    bubble.className =
      "preview-bubble";

    stage.appendChild(bubble);

  }

  bubble.textContent = text;

  setTimeout(() => {

    bubble.remove();

  }, 1600);

}


/* =========================================================
   MINI AURA PLUS PREVIEW
   ========================================================= */

function runMiniLessonPreview() {

  const stage =
    $("previewStage");

  if (!stage) return;

  stage.classList.add(
    "running-game"
  );

  setStatus(
    "🎮 Game test started — this is the same AURA PLUS idea."
  );

  let orbCount = 0;

  const orbs =
    stage.querySelectorAll(
      ".stage-orb"
    );

  orbs.forEach((orb, index) => {

    setTimeout(() => {

      orb.style.opacity = "0";
      orb.style.transform =
        "scale(1.8)";

      orbCount++;

      if (orbCount >= 2) {

        const portal =
          stage.querySelector(
            ".stage-portal"
          );

        if (portal) {

          portal.style.opacity = "1";
          portal.style.textShadow =
            "0 0 20px #a78bfa";

        }

      }

    }, 700 * (index + 1));

  });

  setTimeout(() => {

    stage.classList.remove(
      "running-game"
    );

    setStatus(
      "🏆 Test complete — now try changing a block value."
    );

  }, 3500);

}


/* =========================================================
   BUTTONS
   ========================================================= */

$("lessonFlag")
  ?.addEventListener("click", () => {

    runWorkspace();

  });

$("stageFlag")
  ?.addEventListener("click", () => {

    if (currentMission === 7) {

      setStatus(
        "🎮 AURA PLUS test running!"
      );

      runMiniLessonPreview();

    } else {

      runScratchPreview();

    }

  });

$("lessonStop")
  ?.addEventListener("click", () => {

    setStatus(
      "🛑 Project stopped."
    );

  });

$("stageStop")
  ?.addEventListener("click", () => {

    setStatus(
      "🛑 Stage stopped."
    );

  });


/* Existing run button if present */
$("runLessonButton")
  ?.addEventListener(
    "click",
    runWorkspace
  );


/* =========================================================
   NEXT BUTTON
   ========================================================= */

$("nextLessonStep")
  ?.addEventListener("click", () => {

    const lesson =
      lessons[currentMission];

    if (!lesson) return;

    if (
      currentStep <
      lesson.steps.length - 1
    ) {

      currentStep++;

      loadStep();

      setStatus(
        "Follow the highlighted action, then press NEXT."
      );

      return;

    }

    completeMission();

  });


/* =========================================================
   COMPLETE MISSION
   ========================================================= */

function completeMission() {

  completed.add(
    currentMission
  );

  updateProgress();

  if (currentMission === 7) {

    setStatus(
      "🏆 AURA PLUS BUILD COMPLETE — YOU ARE A SCRATCH BUILDER!"
    );

    setTimeout(() => {

      showScreen("final");

    }, 900);

    return;

  }

  showQuickCheck();

}


/* =========================================================
   PROGRESS
   ========================================================= */

function updateProgress() {

  const percent =
    completed.size / 7 * 100;

  const progress =
    $("auraProgress");

  const counter =
    $("tutorialAura");

  if (progress) {

    progress.style.width =
      percent + "%";

  }

  if (counter) {

    counter.textContent =
      `${completed.size} / 7`;

  }

  document
    .querySelectorAll(".mission-card")
    .forEach(card => {

      const number =
        Number(card.dataset.mission);

      card.classList.toggle(
        "completed",
        completed.has(number)
      );

    });

}


/* =========================================================
   QUICK CHECK
   ========================================================= */

function showQuickCheck() {

  const modal =
    $("quickCheck");

  if (!modal) {

    showScreen("tutorial");
    return;

  }

  modal.classList.remove(
    "hidden"
  );

  const checks = {

    1: [
      "What is a sprite?",
      "Motion",
      "Events",
      "Looks",
      "Sound",
      "A sprite is a character or object."
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
      "Costumes",
      "Motion",
      "Sound",
      "Events",
      "Use the Costumes tab."
    ],

    4: [
      "Can two sprites have different scripts?",
      "Yes",
      "No",
      "Only one",
      "Never",
      "Yes — each sprite has its own scripts."
    ],

    5: [
      "What changes the scene behind sprites?",
      "Backdrop",
      "Costume",
      "Variable",
      "Sound",
      "A backdrop changes the Stage scene."
    ],

    6: [
      "Which category controls sounds?",
      "Sound",
      "Motion",
      "Looks",
      "Events",
      "Sound blocks control audio."
    ]

  };

  const q =
    checks[currentMission] ||
    checks[1];

  if ($("checkQuestion"))
    $("checkQuestion").textContent =
      q[0];

  if ($("checkResult"))
    $("checkResult").textContent =
      "";

  document
    .querySelectorAll(".check-option")
    .forEach((button, index) => {

      button.textContent =
        q[index + 1];

      button.className =
        "check-option";

      button.onclick = () => {

        document
          .querySelectorAll(".check-option")
          .forEach(x =>
            x.classList.remove(
              "correct",
              "wrong"
            )
          );

        /*
          Correct answer is always q[1]
        */
        if (
          button.textContent ===
          q[1]
        ) {

          button.classList.add(
            "correct"
          );

          if ($("checkResult"))
            $("checkResult").textContent =
              "✓ Correct!";

          setTimeout(() => {

            modal.classList.add(
              "hidden"
            );

            showScreen(
              "tutorial"
            );

          }, 650);

        } else {

          button.classList.add(
            "wrong"
          );

          if ($("checkResult"))
            $("checkResult").textContent =
              "Try again! Think about the lesson.";

        }

      };

    });

}


/* =========================================================
   INITIALISE
   ========================================================= */

updateProgress();

if (palette) {
  renderPalette("motion");
}

})();
