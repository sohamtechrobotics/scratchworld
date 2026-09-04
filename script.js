(() => {
"use strict";

/* ---------- screen helpers ---------- */
const $ = id => document.getElementById(id);
const screens = {
  intro:$("introScreen"), game:$("gameScreen"), secret:$("secretScreen"),
  tutorial:$("tutorialScreen"), lesson:$("lessonScreen"), final:$("finalScreen")
};

function showScreen(name){
  Object.entries(screens).forEach(([k,el])=>{
    if(el) el.classList.toggle("hidden", k!==name);
    if(el) el.classList.toggle("active", k===name);
  });
  window.scrollTo(0,0);
}

/* ---------- AURA PLUS game ---------- */
const gameWorld=$("gameWorld"), player=$("player"), shadow=$("shadow"), portal=$("portal");
const auraScore=$("auraScore"), livesEl=$("lives"), gameMessage=$("gameMessage");

let gx=70, gy=110, score=0, lives=3, gameRunning=false, gameTimer=null;
const keys={};

function resetGame(){
  score=0;
  lives=3;
  gx=70;
  gy=110;

  auraScore.textContent="0";
  livesEl.textContent="3";

  document.querySelectorAll(".aura-orb").forEach(o=>o.style.display="block");

  portal.style.opacity=".35";
  portal.style.boxShadow="0 0 0 #a78bfa";

  gameMessage.classList.add("hidden");

  player.style.left=gx+"px";
  player.style.top=gy+"px";

  shadow.style.left="70%";
  shadow.style.top="50%";
}

function rectsTouch(a,b){
  const A=a.getBoundingClientRect(),B=b.getBoundingClientRect();

  return !(
    A.right<B.left ||
    A.left>B.right ||
    A.bottom<B.top ||
    A.top>B.bottom
  );
}

function updateGame(){
  if(!gameRunning)return;

  const speed=4;

  if(keys.ArrowLeft||keys.a)gx-=speed;
  if(keys.ArrowRight||keys.d)gx+=speed;
  if(keys.ArrowUp||keys.w)gy-=speed;
  if(keys.ArrowDown||keys.s)gy+=speed;

  gx=Math.max(
    0,
    Math.min(gameWorld.clientWidth-player.offsetWidth,gx)
  );

  gy=Math.max(
    45,
    Math.min(gameWorld.clientHeight-player.offsetHeight,gy)
  );

  player.style.left=gx+"px";
  player.style.top=gy+"px";

  const targetX=gx>shadow.offsetLeft?1:-1;
  const targetY=gy>shadow.offsetTop?1:-1;

  shadow.style.left=Math.max(
    0,
    shadow.offsetLeft+targetX*1.05
  )+"px";

  shadow.style.top=Math.max(
    45,
    shadow.offsetTop+targetY*.8
  )+"px";

  document.querySelectorAll(".aura-orb").forEach(o=>{
    if(o.style.display!=="none"&&rectsTouch(player,o)){
      o.style.display="none";
      score+=10;
      auraScore.textContent=score;

      if(score>=50){
        portal.style.opacity="1";
        portal.style.boxShadow="0 0 35px #a78bfa";
        $("gameObjective").textContent="PORTAL UNLOCKED — REACH IT!";
      }
    }
  });

  if(rectsTouch(player,shadow)){
    lives--;
    livesEl.textContent=lives;

    gx=70;
    gy=110;

    if(lives<=0){
      stopGame();

      gameMessage.innerHTML=
        "GAME OVER 😵<br><small>Click EXIT and play again.</small>";

      gameMessage.classList.remove("hidden");
    }
  }

  if(score>=50&&rectsTouch(player,portal)){
    stopGame();
    showScreen("secret");
  }

  requestAnimationFrame(updateGame);
}

function startGame(){
  resetGame();
  gameRunning=true;
  requestAnimationFrame(updateGame);
}

function stopGame(){
  gameRunning=false;
}

$("playGameButton")?.addEventListener("click",()=>{
  showScreen("game");
  startGame();
});

$("exitGame")?.addEventListener("click",()=>{
  stopGame();
  showScreen("intro");
});

window.addEventListener("keydown",e=>{
  if(
    e.key in keys ||
    ["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key)
  ){
    e.preventDefault();
    keys[e.key]=true;
  }
});

window.addEventListener("keyup",e=>keys[e.key]=false);

$("tutorialButton")?.addEventListener("click",()=>{
  showScreen("tutorial");
  updateProgress();
});

$("revealButton")?.addEventListener("click",()=>{
  showScreen("tutorial");
  updateProgress();
});

$("replayButton")?.addEventListener("click",()=>{
  completed.clear();
  updateProgress();
  showScreen("tutorial");
});


/* ---------- lesson model ---------- */

const lessons={

1:{
  title:"Working with Sprites",

  desc:"Sprites are the characters and objects in Scratch.",

  why:"Each sprite has its own Code, Costumes and Sounds.",

  tip:"A project can contain many sprites.",

  steps:[
    {
      action:"Click the AURA sprite in the Sprite List.",
      why:"Selecting a sprite tells Scratch which sprite you are programming.",
      target:"sprite:Aura"
    },

    {
      action:"Click the + button beside SPRITE LIST.",
      why:"This is where you add another sprite.",
      target:"add-sprite"
    },

    {
      action:"Click the SHADOW sprite.",
      why:"Different sprites can have completely different scripts.",
      target:"sprite:Shadow"
    },

    {
      action:"Click the AURA sprite again.",
      why:"The selected sprite is the one whose code you edit.",
      target:"sprite:Aura"
    }
  ]
},

2:{
  title:"Make a Sprite Move",

  desc:"Motion blocks control where a sprite moves on the Stage.",

  why:"Scratch uses Motion blocks such as move, turn and change x/y.",

  tip:"Motion blocks are blue.",

  steps:[
    {
      action:"Select AURA, then click Motion.",
      why:"Motion is the category for movement.",
      target:"category:motion"
    },

    {
      action:"Tap “move 10 steps” in the palette.",
      why:"This adds a real Motion block to the script.",
      target:"block:move 10 steps"
    },

    {
      action:"Tap “turn ↻ 15 degrees”.",
      why:"Turn changes the sprite's direction.",
      target:"block:turn ↻ 15 degrees"
    },

    {
      action:"Tap “change x by 10”.",
      why:"Changing x moves a sprite left or right.",
      target:"block:change x by 10"
    }
  ]
},

3:{
  title:"Change Costumes",

  desc:"A sprite can have more than one costume.",

  why:"Changing costumes is how Scratch can make a character look animated.",

  tip:"Use the Costumes tab to see and edit a sprite's costumes.",

  steps:[
    {
      action:"Click the Costumes tab at the top.",
      why:"The Costumes tab shows the selected sprite's costumes.",
      target:"tab:costumes"
    },

    {
      action:"Click Costume 2.",
      why:"A sprite can have multiple costumes.",
      target:"costume:2"
    },

    {
      action:"Click “＋ Choose” in the costume area.",
      why:"Scratch lets you add another costume from its library.",
      target:"choose-costume"
    },

    {
      action:"Click the Code tab to return to scripts.",
      why:"Code, Costumes and Sounds are different editing areas for the selected sprite.",
      target:"tab:code"
    }
  ]
},

4:{
  title:"Program Two Sprites",

  desc:"Every sprite can have its own script.",

  why:"AURA can move while SHADOW follows or behaves differently.",

  tip:"Always check which sprite is selected before adding code.",

  steps:[
    {
      action:"Click AURA in the Sprite List.",
      why:"You are now editing AURA's scripts.",
      target:"sprite:Aura"
    },

    {
      action:"Click Code.",
      why:"The Code tab shows AURA's scripts.",
      target:"tab:code"
    },

    {
      action:"Click SHADOW in the Sprite List.",
      why:"Now Scratch is ready to edit SHADOW.",
      target:"sprite:Shadow"
    },

    {
      action:"Tap “when green flag clicked” in Events.",
      why:"An Events block can start SHADOW's script when the project starts.",
      target:"block:when green flag clicked"
    }
  ]
},

5:{
  title:"Change the Backdrop",

  desc:"The Stage has backdrops instead of costumes.",

  why:"Backdrops change the scene behind every sprite.",

  tip:"Select the Stage to work with backdrops.",

  steps:[
    {
      action:"Click “Select Stage” below the asset panel.",
      why:"The Stage has its own Backdrops area.",
      target:"select-stage"
    },

    {
      action:"Click “＋ Choose Backdrop”.",
      why:"Scratch provides a backdrop library.",
      target:"choose-backdrop"
    },

    {
      action:"Click the Aquarium backdrop thumbnail.",
      why:"A backdrop changes the scene without changing the sprites.",
      target:"backdrop:Aquarium"
    },

    {
      action:"Click AURA in the Sprite List.",
      why:"You can return from the Stage to a sprite at any time.",
      target:"sprite:Aura"
    }
  ]
},

6:{
  title:"Working with Sounds",

  desc:"Sprites can have sounds that play during the project.",

  why:"Sounds are added and managed from the Sounds tab.",

  tip:"Use the Sound category for sound blocks.",

  steps:[
    {
      action:"Click AURA, then click the Sounds tab.",
      why:"Sounds belong to the selected sprite.",
      target:"tab:sounds"
    },

    {
      action:"Click “＋ Choose” in the sound area.",
      why:"Scratch lets you choose a sound from its library.",
      target:"choose-sound"
    },

    {
      action:"Click the Sound category on the left.",
      why:"Sound blocks control when sounds play.",
      target:"category:sound"
    },

    {
      action:"Tap “start sound Pop”.",
      why:"This starts a sound without stopping the rest of the script.",
      target:"block:start sound Pop"
    }
  ]
},

7:{
  title:"Build AURA PLUS",

  desc:"Now put the Scratch ideas together to build the same game you played at the beginning.",

  why:"AURA PLUS uses sprites, Motion, Sensing, Control, Variables, Backdrops and Sounds.",

  tip:"Build the game in small pieces: world → movement → orbs → shadow → score/lives → portal → sound.",

  steps:[
    {
      action:"Select AURA and add the Events block “when green flag clicked”.",
      why:"The game needs a clear starting event.",
      target:"block:when green flag clicked"
    },

    {
      action:"Add “forever” from Control.",
      why:"A game loop keeps checking what is happening.",
      target:"block:forever"
    },

    {
      action:"Add “change x by 10” from Motion.",
      why:"This gives AURA horizontal movement.",
      target:"block:change x by 10"
    },

    {
      action:"Select the ORB sprite.",
      why:"The orb needs its own script for collection behaviour.",
      target:"sprite:Orb"
    },

    {
      action:"Add “if then” from Control.",
      why:"An if block lets the game react to a condition.",
      target:"block:if <> then"
    },

    {
      action:"Open Sensing and add “touching AURA?”.",
      why:"Sensing detects whether sprites are touching.",
      target:"block:touching AURA?"
    },

    {
      action:"Open Variables and create/use “AURA”.",
      why:"A variable stores the player's score.",
      target:"category:variables"
    },

    {
      action:"Add “change AURA by 10”.",
      why:"Each collected orb is worth 10 AURA points.",
      target:"block:change AURA by 10"
    },

    {
      action:"Select SHADOW and add “if then” + “touching AURA?”.",
      why:"The enemy needs collision logic.",
      target:"sprite:Shadow"
    },

    {
      action:"Select the Portal and add an if condition for AURA = 50.",
      why:"The portal should unlock only after all five orbs are collected.",
      target:"sprite:Portal"
    },

    {
      action:"Open Sound and add “start sound Pop” when an orb is collected.",
      why:"Sound gives feedback when the player succeeds.",
      target:"block:start sound Pop"
    },

    {
      action:"Click the green flag and run your AURA PLUS build.",
      why:"Running the project is the final test: collect 5 orbs, survive SHADOW, then reach the portal.",
      target:"stage-flag"
    }
  ]
}
};


let currentMission=1,currentStep=0;
const completed=new Set();

const categoryBlocks={

motion:[
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

looks:[
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

sound:[
  "start sound Pop",
  "play sound Pop until done",
  "stop all sounds",
  "change volume by -10",
  "set volume to 100%"
],

events:[
  "when green flag clicked",
  "when this sprite clicked",
  "when I receive message1",
  "broadcast message1",
  "broadcast message1 and wait"
],

control:[
  "wait 1 seconds",
  "repeat 10",
  "forever",
  "if <> then",
  "if <> then else",
  "wait until <>",
  "repeat until <>",
  "stop all"
],

sensing:[
  "touching mouse-pointer?",
  "touching AURA?",
  "ask What's your name? and wait",
  "mouse x",
  "mouse y",
  "distance to mouse-pointer",
  "timer",
  "reset timer"
],

operators:[
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

variables:[
  "change AURA by 10",
  "set AURA to 0",
  "show variable AURA",
  "hide variable AURA",
  "change lives by -1",
  "set lives to 3"
],

myblocks:[
  "define my block",
  "my block",
  "my block (input)"
]
};


const colors={
  motion:"block-motion",
  looks:"block-looks",
  sound:"block-sound",
  events:"block-events",
  control:"block-control",
  sensing:"block-sensing",
  operators:"block-operators",
  variables:"block-variables",
  myblocks:"block-myblocks"
};


const palette=$("blockPalette"),
lessonBlocks=$("lessonBlocks"),
workspaceInstruction=$("workspaceInstruction");

const lessonStep=$("lessonStep"),
stepProgressBar=$("stepProgressBar"),
actionText=$("actionText");

const lessonTitle=$("lessonTitle"),
lessonDescription=$("lessonDescription"),
lessonWhy=$("lessonWhy"),
teacherTip=$("teacherTip");

const paletteCategory=$("paletteCategory"),
blockCount=$("blockCount"),
bottomHint=$("bottomHint"),
selectedTarget=$("selectedTarget");


function activeCategory(){
  return document.querySelector(".block-category.active")?.dataset.category||"motion";
}


function normalize(s){
  return s.toLowerCase().replace(/\s+/g," ").trim();
}


function renderPalette(cat=activeCategory()){

  paletteCategory.textContent=
    cat==="myblocks"
      ?"My Blocks"
      :cat[0].toUpperCase()+cat.slice(1);

  palette.innerHTML="";

  (categoryBlocks[cat]||[]).forEach(text=>{

    const b=document.createElement("div");

    b.className=
      `scratch-block ${colors[cat]} stack`;

    b.dataset.text=text;
    b.textContent=text;

    b.addEventListener("click",()=>{
      addBlock(text,cat);
    });

    palette.appendChild(b);
  });

  highlightTarget();
}


function addBlock(text,cat){

  const expected=
    lessons[currentMission].steps[currentStep]?.target||"";

  const b=document.createElement("div");

  b.className=
    `workspace-block ${colors[cat]}`;

  b.textContent=text;
  b.dataset.text=text;

  lessonBlocks.querySelector(".workspace-empty")?.remove();

  lessonBlocks.appendChild(b);

  blockCount.textContent=
    `${lessonBlocks.children.length} blocks`;

  if(
    expected.startsWith("block:") &&
    normalize(expected.slice(6))===normalize(text)
  ){
    setStatus("✓ Correct block added. Now press NEXT.");
  }else{
    setStatus("Block added. Read the instruction and continue.");
  }
}


function setStatus(text){
  workspaceInstruction.textContent=text;
  bottomHint.textContent=text;
}


function clearHighlights(){

  document
    .querySelectorAll(".lesson-target")
    .forEach(e=>e.classList.remove("lesson-target"));
}


function highlight(el){

  if(!el)return;

  el.classList.add("lesson-target");

  el.scrollIntoView?.({
    block:"nearest",
    inline:"nearest"
  });
}


function highlightTarget(){

  clearHighlights();

  const target=
    lessons[currentMission]?.steps[currentStep]?.target||"";

  if(target.startsWith("category:")){

    highlight(
      document.querySelector(
        `[data-category="${target.slice(9)}"]`
      )
    );

  }else if(target.startsWith("block:")){

    const t=normalize(target.slice(6));

    [
      ...palette.children
    ].find(
      b=>normalize(b.dataset.text)===t
    ) &&
    highlight(
      [...palette.children].find(
        b=>normalize(b.dataset.text)===t
      )
    );

  }else if(target.startsWith("sprite:")){

    highlight(
      document.querySelector(
        `[data-sprite="${target.slice(7)}"]`
      )
    );

  }else if(target.startsWith("tab:")){

    highlight(
      document.querySelector(
        `[data-editor-tab="${target.slice(4)}"]`
      )
    );

  }else if(target.startsWith("costume:")){

    highlight(
      document.querySelector(
        `[data-asset="${target.slice(8)}"]`
      )
    );

  }else if(target.startsWith("backdrop:")){

    highlight(
      document.querySelector(
        `[data-asset="${target.slice(9)}"]`
      )
    );

  }else if(target==="add-sprite"){

    highlight($("addSpriteButton"));

  }else if(target==="choose-costume"){

    openAsset("costumes");
    highlight($("chooseAssetButton"));

  }else if(target==="choose-sound"){

    openAsset("sounds");
    highlight($("chooseAssetButton"));

  }else if(target==="choose-backdrop"){

    highlight($("chooseBackdropButton"));

  }else if(target==="select-stage"){

    highlight($("stageSelectButton"));

  }else if(target==="stage-flag"){

    highlight($("stageFlag"));
  }
}


function loadStep(){

  const l=lessons[currentMission],
        s=l.steps[currentStep];

  lessonStep.textContent=currentStep+1;

  stepProgressBar.style.width=
    ((currentStep+1)/l.steps.length*100)+"%";

  lessonTitle.textContent=l.title;
  lessonDescription.textContent=l.desc;

  actionText.textContent=s.action;
  lessonWhy.textContent=s.why;
  teacherTip.textContent=l.tip;

  setStatus(
    "Follow the highlighted area, then press NEXT."
  );

  renderPalette(activeCategory());
  highlightTarget();
}


function openMission(n){

  currentMission=n;
  currentStep=0;

  showScreen("lesson");

  lessonBlocks.innerHTML=
    '<div class="workspace-empty">Drag a block here<br><small>or tap a block to add it</small></div>';

  blockCount.textContent="0 blocks";

  selectedTarget.textContent="AURA";

  document
    .querySelectorAll(".project-tab")
    .forEach(
      x=>x.classList.toggle(
        "active",
        x.dataset.editorTab==="code"
      )
    );

  renderPalette("motion");
  loadStep();
}


document
  .querySelectorAll(".mission-card")
  .forEach(
    c=>c.addEventListener(
      "click",
      ()=>openMission(
        Number(c.dataset.mission)
      )
    )
  );


$("backToMissions")?.addEventListener(
  "click",
  ()=>{
    showScreen("tutorial");
    updateProgress();
  }
);


document
  .querySelectorAll(".block-category")
  .forEach(
    btn=>btn.addEventListener(
      "click",
      ()=>{
        document
          .querySelectorAll(".block-category")
          .forEach(
            x=>x.classList.remove("active")
          );

        btn.classList.add("active");

        renderPalette(btn.dataset.category);
      }
    )
  );


/* sprite selection */

document
  .querySelectorAll(".sprite-card")
  .forEach(
    card=>card.addEventListener(
      "click",
      ()=>{

        document
          .querySelectorAll(".sprite-card")
          .forEach(
            x=>x.classList.remove("selected")
          );

        card.classList.add("selected");

        selectedTarget.textContent=
          card.dataset.sprite.toUpperCase();

        openAsset("costumes");

        setStatus(
          `Selected ${card.dataset.sprite}.`
        );
      }
    )
  );


$("addSpriteButton")?.addEventListener(
  "click",
  ()=>{
    setStatus(
      "Scratch opens the Sprite Library here. Choose a sprite to add it."
    );
  }
);


$("chooseSpriteButton")?.addEventListener(
  "click",
  ()=>{
    setStatus(
      "Choose a Sprite: Library • Paint • Upload • Surprise."
    );
  }
);


/* editor tabs */

document
  .querySelectorAll(".project-tab")
  .forEach(
    tab=>tab.addEventListener(
      "click",
      ()=>{

        document
          .querySelectorAll(".project-tab")
          .forEach(
            x=>x.classList.remove("active")
          );

        tab.classList.add("active");

        const type=tab.dataset.editorTab;

        if(type==="code"){

          renderPalette(activeCategory());

          setStatus(
            "Code tab selected. Choose a block category."
          );

        }else{

          openAsset(type);
        }
      }
    )
  );


/* asset libraries */

const assetData={

  costumes:[
    "Costume 1",
    "Costume 2",
    "Glow",
    "Walk 1",
    "Walk 2"
  ],

  sounds:[
    "Pop",
    "Meow",
    "Collect",
    "Jump",
    "Win"
  ],

  backdrops:[
    "Space",
    "Aquarium",
    "School",
    "Blue Sky",
    "Night"
  ]
};


function openAsset(type){

  $("assetLibrary").style.display=
    type==="backdrops"?"none":"block";

  $("backdropLibrary").style.display=
    type==="backdrops"?"block":"none";

  $("assetLibraryTitle").textContent=
    type.toUpperCase();

  const items=
    $(type==="backdrops"
      ?"backdropItems"
      :"assetLibraryItems");

  items.innerHTML="";

  assetData[type].forEach((name,i)=>{

    const b=document.createElement("button");

    b.className=
      "asset-item"+(i===0?" selected":"");

    b.dataset.asset=name;

    b.textContent=
      type==="sounds"
        ?"🔊"
        :type==="costumes"
          ?"🎭"
          :name==="Aquarium"
            ?"🐠"
            :"🌄";

    b.title=name;

    b.addEventListener(
      "click",
      ()=>{
        items
          .querySelectorAll(".asset-item")
          .forEach(
            x=>x.classList.remove("selected")
          );

        b.classList.add("selected");

        setStatus(
          `Selected ${name}.`
        );
      }
    );

    items.appendChild(b);
  });
}


$("chooseAssetButton")?.addEventListener(
  "click",
  ()=>{
    setStatus(
      "Scratch would open its library here. Pick an asset from the thumbnails."
    );
  }
);


$("chooseBackdropButton")?.addEventListener(
  "click",
  ()=>{
    openAsset("backdrops");

    setStatus(
      "Choose a backdrop from the Backdrop Library."
    );
  }
);


$("stageSelectButton")?.addEventListener(
  "click",
  ()=>{
    openAsset("backdrops");

    setStatus(
      "Stage selected. Backdrops are now shown."
    );
  }
);


$("chooseBlockAsset")?.addEventListener(
  "click",
  ()=>{
    setStatus(
      "Scratch's Code area is where blocks are selected and arranged."
    );
  }
);


$("stageFlag")?.addEventListener(
  "click",
  ()=>{
    setStatus(
      "🟢 AURA PLUS test run: collect 5 orbs → survive SHADOW → reach PORTAL."
    );
  }
);


$("lessonFlag")?.addEventListener(
  "click",
  ()=>{
    setStatus("🟢 Project started.");
  }
);


$("lessonStop")?.addEventListener(
  "click",
  ()=>{
    setStatus("🛑 Project stopped.");
  }
);


$("stageStop")?.addEventListener(
  "click",
  ()=>{
    setStatus("🛑 Stage stopped.");
  }
);


$("paintAssetButton")?.addEventListener(
  "click",
  ()=>{
    setStatus(
      "Paint opens the Scratch Paint Editor."
    );
  }
);


/* next = the only navigation inside a lesson */

$("nextLessonStep")?.addEventListener(
  "click",
  ()=>{

    const l=lessons[currentMission];

    if(currentStep<l.steps.length-1){

      currentStep++;

      const target=
        l.steps[currentStep].target;

      if(target.startsWith("category:")){

        const cat=target.slice(9);

        document
          .querySelector(
            `[data-category="${cat}"]`
          )
          ?.click();

      }else if(target.startsWith("block:")){

        const block=target.slice(6);

        const cat=
          Object.keys(categoryBlocks)
            .find(
              c=>categoryBlocks[c]
                .some(
                  x=>normalize(x)===normalize(block)
                )
            );

        if(cat){

          document
            .querySelector(
              `[data-category="${cat}"]`
            )
            ?.click();
        }

      }else if(target.startsWith("tab:")){

        document
          .querySelector(
            `[data-editor-tab="${target.slice(4)}"]`
          )
          ?.click();

      }else if(target.startsWith("sprite:")){

        document
          .querySelector(
            `[data-sprite="${target.slice(7)}"]`
          )
          ?.click();
      }

      loadStep();

    }else{

      completeMission();
    }
  }
);


function completeMission(){

  completed.add(currentMission);

  updateProgress();

  if(currentMission===7){

    setStatus(
      "🏆 AURA PLUS BUILD COMPLETE — you are a Scratch Builder!"
    );

    setTimeout(
      ()=>showScreen("final"),
      500
    );

  }else{

    showQuickCheck();
  }
}


function updateProgress(){

  const pct=
    completed.size/7*100;

  $("auraProgress").style.width=
    pct+"%";

  $("tutorialAura").textContent=
    `${completed.size} / 7`;

  document
    .querySelectorAll(".mission-card")
    .forEach(
      c=>c.classList.toggle(
        "completed",
        completed.has(
          Number(c.dataset.mission)
        )
      )
    );
}


function showQuickCheck(){

  $("quickCheck").classList.remove("hidden");

  const checks={

    1:[
      "What is a sprite?",
      "Motion",
      "Events",
      "Looks",
      "Sound",
      "Sprites are characters or objects."
    ],

    2:[
      "Which category moves a sprite?",
      "Motion",
      "Looks",
      "Sound",
      "Events",
      "Motion blocks control movement."
    ],

    3:[
      "Where do you edit costumes?",
      "Motion",
      "Looks",
      "Sound",
      "Events",
      "Use the Costumes tab."
    ],

    4:[
      "Can two sprites have different scripts?",
      "Motion",
      "Looks",
      "Sound",
      "Events",
      "Yes — each sprite has its own scripts."
    ],

    5:[
      "What changes the scene behind sprites?",
      "Motion",
      "Looks",
      "Sound",
      "Events",
      "A backdrop changes the Stage scene."
    ],

    6:[
      "Which category controls sounds?",
      "Motion",
      "Looks",
      "Sound",
      "Events",
      "Sound blocks play and control audio."
    ]
  };

  const q=
    checks[currentMission]||checks[1];

  $("checkQuestion").textContent=q[0];
  $("checkBlock").textContent="";
  $("checkResult").textContent="";

  document
    .querySelectorAll(".check-option")
    .forEach(
      (b,i)=>{

        b.textContent=q[i+1];

        b.className="check-option";

        b.onclick=()=>{

          document
            .querySelectorAll(".check-option")
            .forEach(
              x=>x.classList.remove(
                "correct",
                "wrong"
              )
            );

          if(b.textContent===q[3]){

            b.classList.add("correct");

            $("checkResult").textContent=
              "✓ Correct!";

            setTimeout(
              ()=>{
                $("quickCheck")
                  .classList.add("hidden");

                showScreen("tutorial");

                updateProgress();
              },
              500
            );

          }else{

            b.classList.add("wrong");

            $("checkResult").textContent=
              "Try again — think about the Scratch tab/category you just used.";
          }
        };
      }
    );
}


updateProgress();
renderPalette("motion");

})();
