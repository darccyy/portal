const canvas = document.createElement("canvas");
canvas.width = 768;
canvas.height = 512;
const ctx = canvas.getContext("2d");
document.getElementById("contain").append(canvas);
F.createListeners();

var cam, portals, player;

function reset() {
  cam = { x: 0, y: 0, z: 1 };

  portals = [
    {
      blue: {
        x: 200,
        y: 100,
        d: 1,
        l: 20,
      },
      orange: {
        x: 500,
        y: 300,
        d: 3,
        l: 50,
      },
    },
  ];

  player = {
    x: 400,
    y: 200,
    w: 40,
    h: 70,
  };
}

function render() {
  // Reset canvas
  ctx.restore();
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Adjust for camera
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.scale(cam.z, cam.z);
  ctx.translate(-canvas.width / 2, -canvas.height / 2);
  ctx.translate(-cam.x, -cam.y);

  // Canvas box
  ctx.strokeStyle = "grey";
  ctx.strokeRect(0, 0, canvas.width, canvas.height);

  // Portals
  for (var i = 0; i < portals.length; i++) {
    for (var color = 0; color < portals[i]; color++) {
      var portal = portals[i][color];

      ctx.fillStyle = color === "blue" ? "lightblue" : "orange";
      ctx.fillRect(
        ctx.fill
      );
    }
  }

  // Player
  ctx.fillStyle = "magenta";
  ctx.fillRect(player.x, player.y, player.w, player.h);
  ctx.fillStyle = "purple";
  ctx.fillRect(
    player.x - (player.flip ? player.w * 0.3 : 0),
    player.y,
    player.w * 1.3,
    player.h * 0.1,
  );
}

function update(mod) {
  if (F.keys.r) {
    reset();
  }

  // Camera
  var camSpeed = 800 * mod;
  if (F.keys.ArrowLeft ^ F.keys.ArrowRight) {
    cam.x += camSpeed * (F.keys.ArrowLeft ? -1 : 1);
  }
  if (F.keys.ArrowUp ^ F.keys.ArrowDown) {
    cam.y += camSpeed * (F.keys.ArrowUp ? -1 : 1);
  }
  if (F.keys.Minus ^ F.keys.Equal) {
    cam.z += 2 * mod * cam.z * (F.keys.Minus ? -1 : 1);
  }
  cam.z = F.border(cam.z, 0.1, 100);
  if (F.keys.Digit0) {
    cam.x = 0;
    cam.y = 0;
    cam.z = 1;
  }

  // Player
  var playerSpeed = 300 * mod;
  if (F.keys.a ^ F.keys.d) {
    player.x += playerSpeed * (F.keys.a ? -1 : 1);
    player.flip = F.keys.a;
  }
  if (F.keys.w ^ F.keys.s) {
    player.y += playerSpeed * (F.keys.w ? -1 : 1);
  }
}

function main() {
  render();
  update((Date.now() - then) / 1000);
  then = Date.now();
  requestAnimationFrame(main);
}
var then = Date.now();
reset();
main();
