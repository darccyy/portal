if (F.keys.w_ ^ F.keys.s_) {
  player.vy += playerSpeed * mod * (F.keys.w_ ? -1 : 1);
} else {
  if (Math.abs(player.vy) < playerSlowSpeed * mod) {
    player.vy = 0;
  } else {
    player.vy -=
      playerSlowSpeed * mod * Math.sign(player.vy);
  }
}
