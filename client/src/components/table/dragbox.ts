const DRAG_BOX_WIDTH = 180;
const DRAG_BOX_HEIGHT = 50;
const DRAG_BOX_BORDER_RADIUS = 5;
const DRAG_BOX_BORDER_WIDTH = 5;

/* A color from the CSS custom properties (see src/styles/constants.css).
 * The theme colors follow the theme class on the root element */
function getCssColor(name: string): string {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
}

/* The image shown while dragging tracks */
function getDragCanvas(numSelected: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return canvas;
  }

  canvas.width = DRAG_BOX_WIDTH;
  canvas.height = DRAG_BOX_HEIGHT;

  ctx.fillStyle = getCssColor("--drag-box-border-color");
  fillRoundRect(
    ctx,
    0,
    0,
    DRAG_BOX_WIDTH,
    DRAG_BOX_HEIGHT,
    DRAG_BOX_BORDER_RADIUS,
  );

  ctx.fillStyle = getCssColor("--drag-box-background-color");
  ctx.fillRect(
    DRAG_BOX_BORDER_WIDTH,
    DRAG_BOX_BORDER_WIDTH,
    DRAG_BOX_WIDTH - 2 * DRAG_BOX_BORDER_WIDTH,
    DRAG_BOX_HEIGHT - 2 * DRAG_BOX_BORDER_WIDTH,
  );

  ctx.fillStyle = getCssColor("--drag-box-text-color");
  ctx.textBaseline = "middle";

  ctx.font = '17px/1.42857143 "Open Sans", sans-serif';
  ctx.fillText("♫", 22, 25);

  ctx.font = '14px/1.42857143 "Open Sans", sans-serif';
  ctx.fillText(`Add ${numSelected.toString()} tracks`, 60, 25);
  return canvas;
}

// Based on: https://stackoverflow.com/questions/1255512/
// how-to-draw-a-rounded-rectangle-on-html-canvas
function fillRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): void {
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

export { getDragCanvas };
