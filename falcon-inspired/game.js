const config = {
  type: Phaser.AUTO,
  width: 480,
  height: 720,
  backgroundColor: "#000",
  physics: {
    default: "arcade",
    arcade: { debug: false }
  },
  scene: { preload, create, update }
};

const game = new Phaser.Game(config);
let player, cursors, bullets, enemies, lastFired = 0;
let score = 0;
let scoreText;
let pointerDown = false;

function preload() {
  this.load.image('player', 'assets/player.png');
  this.load.image('bullet', 'assets/bullet.png');
  this.load.image('enemy', 'assets/enemy.png');
  this.load.image('starfield', 'assets/starfield.png');
}

function create() {
  this.add.tileSprite(0, 0, 480, 720, 'starfield').setOrigin(0).setScrollFactor(0);
  player = this.physics.add.sprite(240, 660, 'player').setCollideWorldBounds(true);
  bullets = this.physics.add.group();
  enemies = this.physics.add.group();

  for (let i = 0; i < 6; i++) {
    let e = enemies.create(60 + i * 70, 100, 'enemy');
    e.setVelocityY(40 + Math.random() * 40);
  }

  this.physics.add.overlap(bullets, enemies, hitEnemy, null, this);
  this.physics.add.overlap(player, enemies, hitPlayer, null, this);

  cursors = this.input.keyboard.createCursorKeys();

  this.input.on('pointerdown', pointer => { pointerDown = true; player.x = pointer.x; });
  this.input.on('pointermove', pointer => { if (pointerDown) player.x = pointer.x; });
  this.input.on('pointerup', () => { pointerDown = false; });

  scoreText = document.getElementById("score");
}

function update(time) {
  let moveLeft = cursors.left.isDown;
  let moveRight = cursors.right.isDown;
  let shootKey = cursors.space.isDown;

  if (moveLeft) player.setVelocityX(-200);
  else if (moveRight) player.setVelocityX(200);
  else if (!pointerDown && !moveLeft && !moveRight) {
    player.setVelocityX(0);
  }

  if ((shootKey || pointerDown) && time > lastFired) {
    let b = bullets.create(player.x, player.y - 20, 'bullet');
    b.setVelocityY(-400);
    lastFired = time + 300;
  }

  bullets.children.each(b => { if (b.y < 0) b.destroy(); });
  enemies.children.each(e => {
    if (e.y > 750) {
      e.y = -50; e.x = Phaser.Math.Between(50, 430);
    }
  });
}

function hitEnemy(bullet, enemy) {
  bullet.destroy(); enemy.destroy();
  score += 10;
  scoreText.innerText = "Poeng: " + score;
}

function hitPlayer(player, enemy) {
  player.setTint(0xff0000);
  player.setVelocity(0);
  game.scene.pause();
  scoreText.innerText += " - GAME OVER";
}
