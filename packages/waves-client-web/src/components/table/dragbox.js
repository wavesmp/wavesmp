export default function getDragCanvas(numSelected, theme) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = DRAG_BOX_WIDTH;
  canvas.height = DRAG_BOX_HEIGHT;

  ctx.fillStyle = "DRAG_BOX_BORDER_COLOR";
  fillRoundRect(
    ctx,
    0,
    0,
    DRAG_BOX_WIDTH,
    DRAG_BOX_HEIGHT,
    DRAG_BOX_BORDER_RADIUS,
  );

  ctx.fillStyle = getBackgroundColor(theme);
  ctx.fillRect(
    DRAG_BOX_BORDER_WIDTH,
    DRAG_BOX_BORDER_WIDTH,
    DRAG_BOX_WIDTH - 2 * DRAG_BOX_BORDER_WIDTH,
    DRAG_BOX_HEIGHT - 2 * DRAG_BOX_BORDER_WIDTH,
  );

  ctx.fillStyle = getTextColor(theme);
  ctx.textBaseline = "middle";

  ctx.font = '17px/1.42857143 "Open Sans", sans-serif';
  ctx.fillText("♫", 22, 25);

  ctx.font = '14px/1.42857143 "Open Sans", sans-serif';
  ctx.fillText(`Add ${numSelected} tracks`, 60, 25);
  return canvas;
}

// Based on: https://stackoverflow.com/questions/1255512/
// how-to-draw-a-rounded-rectangle-on-html-canvas
function fillRoundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();

  ctx.fill();
}

function getBackgroundColor(theme) {
  if (theme === "dark") {
    return "DARK_DRAG_BOX_BACKGROUND_COLOR";
  }
  return "LIGHT_DRAG_BOX_BACKGROUND_COLOR";
}

function getTextColor(theme) {
  if (theme === "dark") {
    return "DARK_DRAG_BOX_TEXT_COLOR";
  }
  return "LIGHT_DRAG_BOX_TEXT_COLOR";
}
