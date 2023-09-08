kaboom({
  global: true,
  fullscreen: true,
  scale: 2,
  debug: true,
  clearColor: [0, 0, 0, 1],
});

const MOVE_SPEED = 120;
const JUMP_FORCE = 360;
const BIG_JUMP_FORCE = 460;
let CURRENT_JUMP_FORCE = JUMP_FORCE;
let isJumping = true;
const FALL_DEATH = 400;
// loadRoot("");
loadSprite("coin", "./images/coin.png");
loadSprite("goomba", "./images/goomba1.png");
loadSprite("brick", "./images/brick1.png");
loadSprite("block", "./images/brick2.png");

loadSprite("mario", "./images/mario.png");
loadSprite("mushroom", "./images/mushroom.png");
loadSprite("surprise", "./images/surprise1.png");
loadSprite("unboxed", "./images/block.png");
loadSprite("pipe-top-left", "./images/pipe5.png");
loadSprite("pipe-top-right", "./images/pipe4.png");
loadSprite("pipe-bottom-left", "./images/pipe2.png");
loadSprite("pipe-bottom-right", "./images/pipe3.png");

loadSprite("uground-block", "./images/brick_underground2.png");
loadSprite("uground-brick", "./images/brick_underground1.png");
loadSprite("uground-goomba", "./images/goomba_underground.png");
loadSprite("uground-steel", "./images/brick_underground3.png");
loadSprite("uground-surprise", "./images/surprise2.png");
scene("game", ({ level, score }) => {
  layers(["bg", "obj", "ui"], "obj");
  const maps = [
    [
      "                                      ",
      "                                      ",
      "                                      ",
      "                                      ",
      "                                      ",
      "       %  =*=%=                       ",
      "                                      ",
      "                           -+         ",
      "                    ^   ^  ()         ",
      "=============================  =======",
    ],
    [
      "˙                                     ˙",
      "˙                                     ˙",
      "˙                                     ˙",
      "˙                                     ˙",
      "˙                                     ˙",
      "˙         @@@@@@                ~~    ˙",
      "˙                             ~~~     ˙",
      "˙                            ~~~~     ˙",
      "˙                    &   &  ~~~~~   ()˙",
      "???????????????????????????????????????",
    ],
  ];

  const levelCfg = {
    width: 20,
    height: 20,
    "=": [sprite("block"), solid()],
    "!": [sprite("coin"), "coin"],
    "%": [sprite("surprise"), solid(), "coin-surprise"],
    "*": [sprite("surprise"), solid(), "mushroom-surprise"],
    "}": [sprite("unboxed"), solid()],
    "(": [sprite("pipe-bottom-left"), solid(), scale(0.5)],
    ")": [sprite("pipe-bottom-right"), solid(), scale(0.5)],
    "-": [sprite("pipe-top-left"), solid(), scale(0.5), "pipe"],
    "+": [sprite("pipe-top-right"), solid(), scale(0.5), "pipe"],
    "^": [sprite("goomba"), solid(), "dangerous"],
    "#": [sprite("mushroom"), solid(), "mushroom", body()],
    "?": [sprite("uground-block"), solid(), scale(0.5)],
    "˙": [sprite("uground-brick"), solid(), scale(0.5)],
    "~": [sprite("uground-steel"), solid(), scale(0.5)],
    "&": [sprite("uground-goomba"), solid(), scale(0.5), "dangerous"],
    "@": [sprite("uground-surprise"), solid(), scale(0.5), "coin-surprise"],
  };

  const gameLevel = addLevel(maps[level], levelCfg);

  const scoreLabel = add([
    text(score),
    pos(30, 6),
    layer("ui"),
    {
      value: score,
    },
  ]);

  add([text("level" + parseInt(level + 1)), pos(40, 6)]);

  function big() {
    let timer = 0;
    let isBig = false;
    return {
      update() {
        if (isBig) {
          CURRENT_JUMP_FORCE = BIG_JUMP_FORCE;
          timer -= dt();
          if (timer <= 0) {
            this.smallify();
          }
        }
      },
      isBig() {
        return isBig;
      },
      smallify() {
        this.scale = vec2(1);
        CURRENT_JUMP_FORCE = JUMP_FORCE;
        timer = 0;
        isBig = false;
      },
      biggify(time) {
        this.scale = vec2(2);

        timer = time;
        isBig = true;
      },
    };
  }

  const player = add([
    sprite("mario"),
    solid(),
    pos(30, 0),
    body(),
    big(),
    origin("bot"),
  ]);

  action("mushroom", (m) => {
    m.move(30, 0);
  });

  player.on("headbump", (obj) => {
    if (obj.is("coin-surprise")) {
      gameLevel.spawn("!", obj.gridPos.sub(0, 1));
      destroy(obj);
      gameLevel.spawn("}", obj.gridPos.sub(0, 0));
    }
    if (obj.is("mushroom-surprise")) {
      gameLevel.spawn("#", obj.gridPos.sub(0, 1));
      destroy(obj);
      gameLevel.spawn("}", obj.gridPos.sub(0, 0));
    }
  });

  player.collides("mushroom", (m) => {
    destroy(m);
    player.biggify(6);
  });

  player.collides("coin", (c) => {
    destroy(c);
    scoreLabel.value++;
    scoreLabel.text = scoreLabel.value;
  });

  const ENEMY_SPEED = 20;
  action("dangerous", (d) => {
    d.move(-ENEMY_SPEED, 0);
  });

  player.collides("dangerous", (d) => {
    if (isJumping) {
      destroy(d);
    } else {
      go("lose", { score: scoreLabel.value });
    }
  });
  player.action(() => {
    camPos(player.pos);
    if (player.pos.y >= FALL_DEATH) {
      go("lose", { score: scoreLabel.value });
    }
  });

  player.collides("pipe", () => {
    keyPress("down", () => {
      go("game", {
        level: level + (1 % maps.length),
        score: scoreLabel.value,
      });
    });
  });

  keyDown("left", () => {
    player.move(-MOVE_SPEED, 0);
  });
  keyDown("right", () => {
    player.move(MOVE_SPEED, 0);
  });

  player.action(() => {
    if (player.grounded()) {
      isJumping = false;
    }
  });

  keyPress("space", () => {
    if (player.grounded()) {
      isJumping = true;
      player.jump(CURRENT_JUMP_FORCE);
    }
  });
});
scene("lose", ({ score }) => {
  add([text(score, 32), origin("center"), pos(width() / 2, height() / 2)]);
});

start("game", { level: 0, score: 0 });
