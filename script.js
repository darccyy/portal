const canvas = document.createElement("canvas");
canvas.width = 768;
canvas.height = 512;
const ctx = canvas.getContext("2d");
document.getElementById("contain").append(canvas);
F.createListeners();
F.setMouseOffset(canvas.getBoundingClientRect());

// Constants
const camSpeed = 800; // Speed of camera
const ground = 400;

const playerSpeed = 2200; // Speed of player (increase in v * mod)
const playerSlowSpeed = 1800; // Speed of player slowing down (decrease in v * mod)
const playerMaxVel = 400; // Terminal velocity for player (v)
const playerJump = 1000;
const playerFall = 1000;

const portalWidth = 10; // Width of portal (px)
const portalBackWidth = 0.5; // Width of back (relative to portalWidth)
const portalTransition = 100; // Duration of portal transition (ms)
const portalTransitionOpacity = 0.1; // Opacity of player when transitioning (0-1)

// Global variables
var cam, portals, player;

// Prevent page moving on arrow keys
addEventListener("keydown", function (event) {
  event = event || window.event;
  var keyCode = event.keyCode;
  if (keyCode >= 37 && keyCode <= 40) {
    event.preventDefault();
  }
});

function reset() {
  // Reset camera
  cam = { x: 0, y: 0, z: 1 };

  // Reset player
  player = {
    x: 280,
    y: 150,
    w: 40,
    h: 70,
    vx: 0,
    vy: 0,
  };

  // Set portals
  //TODO Move to level file
  portals = [
    {
      blue: {
        x: 80,
        y: ground,
        d: 2,
      },
      orange: {
        x: 200,
        y: ground,
        d: 2,
      },
    },

    {
      blue: {
        x: 400,
        y: ground,
        d: 2,
      },
      orange: {
        x: 400,
        y: 50,
        d: 0,
      },
    },

    {
      blue: {
        x: 550,
        y: ground,
        d: 2,
      },
      orange: {
        x: 620,
        y: 60,
        d: 3,
      },
    },
  ];
  for (var i in portals) {
    for (var color in portals[i]) {
      portals[i][color].l = 100;
    }
  }
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

  // Ground
  ctx.fillStyle = "darkgrey";
  ctx.fillRect(
    0,
    ground,
    canvas.width,
    canvas.height - ground,
  );

  // Canvas box
  ctx.strokeStyle = "grey";
  ctx.strokeRect(0, 0, canvas.width, canvas.height);

  // Portals
  for (var i = 0; i < portals.length; i++) {
    for (var color in portals[i]) {
      var portal = portals[i][color];

      // Draw main color
      ctx.fillStyle =
        color === "blue" ? "#318BF7" : "#F77E0C";
      var box = getPortalBox(portal);
      ctx.fillRect(box.x, box.y, box.w, box.h);

      // Draw dark side
      var x = 0,
        y = 0;
      switch (portal.d) {
        case 0:
          x -= portal.l / 2;
          y -= portalWidth / 2;
          break;
        case 1:
          x -= portalWidth / 2;
          y -= portal.l / 2;
          break;
        case 2:
          x -= portal.l / 2;
          y +=
            portalWidth / 2 - portalWidth * portalBackWidth;
          break;
        case 3:
          x +=
            portalWidth / 2 - portalWidth * portalBackWidth;
          y -= portal.l / 2;
          break;
      }

      ctx.fillStyle =
        color === "blue" ? "#1C70D6" : "#D66800";
      ctx.fillRect(
        portal.x + x,
        portal.y + y,
        !(portal.d % 2)
          ? portal.l
          : portalWidth * portalBackWidth,
        portal.d % 2
          ? portal.l
          : portalWidth * portalBackWidth,
      );
    }
  }

  // Portal connection
  for (var i = 0; i < portals.length; i++) {
    ctx.strokeStyle = "lime";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (
      var j = 0;
      j < Object.keys(portals[i]).length;
      j++
    ) {
      var portal = Object.values(portals[i])[j];
      ctx[j ? "lineTo" : "moveTo"](portal.x, portal.y);
    }
    ctx.stroke();
  }

  // Player
  var { x, y } = player;
  // Portal transition
  if (Date.now() - player.lastPortal < portalTransition) {
    //! Test
    ctx.fillStyle = "red";
    ctx.fillRect(canvas.width - 40 + cam.x, cam.y, 40, 40);

    var transition =
      (Date.now() - player.lastPortal) / portalTransition;
    (x = player.ox - (player.ox - player.x) * transition),
      (y = player.oy - (player.oy - player.y) * transition);
    ctx.globalAlpha = portalTransitionOpacity;
  }

  // Flip player
  ctx.save();
  ctx.translate(x + player.w / 2, y + player.h / 2);
  ctx.scale(player.flipX ? -1 : 1, player.flipY ? -1 : 1);
  ctx.translate(-x - player.w / 2, -y - player.h / 2);

  ctx.fillStyle = "magenta";
  ctx.fillRect(x, y, player.w, player.h);
  ctx.fillStyle = "purple";
  ctx.fillRect(x, y, player.w * 1.3, player.h * 0.1);
  ctx.restore();
}

function update(mod) {
  if (F.keys.r_) {
    reset();
  }

  // Camera
  if (F.keys.ArrowLeft ^ F.keys.ArrowRight) {
    cam.x += camSpeed * mod * (F.keys.ArrowLeft ? -1 : 1);
  }
  if (F.keys.ArrowUp ^ F.keys.ArrowDown) {
    cam.y += camSpeed * mod * (F.keys.ArrowUp ? -1 : 1);
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
  if (
    !(Date.now() - player.lastPortal < portalTransition)
  ) {
    // Move
    if (F.keys.a_ ^ F.keys.d_) {
      player.vx += playerSpeed * mod * (F.keys.a_ ? -1 : 1);
    } else {
      if (Math.abs(player.vx) < playerSlowSpeed * mod) {
        player.vx = 0;
      } else {
        player.vx -=
          playerSlowSpeed * mod * Math.sign(player.vx);
      }
    }

    // Jump
    if (F.keys.Space || F.keys.w_) {
      if (player.y >= ground - player.h) {
        player.vy -= playerJump;
      }
    }

    // Fall
    player.vy += playerFall * mod;

    // Max velocity
    player.vx = F.border(
      player.vx,
      -playerMaxVel,
      playerMaxVel,
    );
    player.vy = F.border(
      player.vy,
      -playerMaxVel,
      playerMaxVel,
    );

    // Apply velocity
    player.x += player.vx * mod;
    player.y += player.vy * mod;
    // Flip x to direction
    if (player.vx !== 0) {
      player.flipX = player.vx < 0;
    }
    // Unflip y at peak
    if (player.vy >= 0) {
      player.flipY = false;
    }

    // Stop falling at floor
    if (player.y > ground - player.h) {
      player.y = ground - player.h;
      player.vy = 0;
    }

    // Move player with mouse
    if (F.keys.z_ && F.mouse.left) {
      player.x = F.mouse.x + cam.x;
      player.y = F.mouse.y + cam.y;
    }
  }

  // Portals
  var hasCollided = false;
  I: for (var i = 0; i < portals.length; i++) {
    for (var color in portals[i]) {
      var portal = portals[i][color];

      if (
        F.collide.rect2rect(player, getPortalBox(portal))
      ) {
        hasCollided = true;

        if (player.hasLeftPortal) {
          var other =
            portals[i][
              color === "blue" ? "orange" : "blue"
            ];
          if (other) {
            // Set old x,y and last portal time
            player.ox = player.x;
            player.oy = player.y;
            player.lastPortal = Date.now();

            // Set position
            if (portal.d % 2 === other.d % 2) {
              // Same axis
              player.x = other.x - (portal.x - player.x);
              player.y = other.y - (portal.y - player.y);
            } else {
              // Different axis
              var { x, y, vx, vy } = player;
              player.x = other.x - (portal.y - y);
              player.y = other.y - (portal.x - x);
              player.vx = vy;
              player.vy = vx;
            }

            // Fix position and velocity
            const directions = "uldr";
            switch (
              directions[portal.d] + directions[other.d]
            ) {
              // Change velocity, adjust position (Same axis)
              case "uu":
              case "dd":
                player.vy *= -1;
                player.flipY = true;
                break;
              case "ud":
              case "du":
                player.y +=
                  (player.h + portalWidth) *
                  Math.sign(player.vy);
                break;
              case "ll":
              case "rr":
                player.vx *= -1;
                break;
              case "lr":
              case "rl":
                player.x +=
                  (player.w + portalWidth) *
                  Math.sign(player.vx);
                break;

              // Adjust position (Different axis)
              case "ul":
              case "dr":
                player.x +=
                  (player.h - player.w) *
                  (player.vx < 0 ? 0 : 1);
                player.vx *= -1;
                player.vy *= -1;
                break;
              case "ur":
              case "dl":
                player.x +=
                  player.vx > 0
                    ? player.h + portalWidth
                    : -player.w - portalWidth;
                break;
              case "lu":
              case "rd":
                player.y +=
                  (player.w - player.h) *
                  (player.vy < 0 ? 0 : 1);
                player.vx *= -1;
                player.vy *= -1;
                break;
              case "ld":
              case "ru":
                player.y +=
                  player.vy > 0
                    ? player.w + portalWidth
                    : -player.h - portalWidth;
                break;
            }
          }
        }

        player.hasLeftPortal = false;
        continue I;
      }
    }
  }
  if (!hasCollided) {
    player.hasLeftPortal = true;
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

// Convert portal object to xywh format box
function getPortalBox(portal) {
  if (portal.d % 2) {
    return {
      x: portal.x - portalWidth / 2,
      y: portal.y - portal.l / 2,
      w: portalWidth,
      h: portal.l,
    };
  }

  return {
    x: portal.x - portal.l / 2,
    y: portal.y - portalWidth / 2,
    w: portal.l,
    h: portalWidth,
  };
}
