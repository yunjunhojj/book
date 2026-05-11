import type { LayoutBox } from "./layout";

export function paint(ctx: CanvasRenderingContext2D, box: LayoutBox) {
  drawBackground(ctx, box);
  drawBorder(ctx, box);
  drawText(ctx, box);

  for (const child of box.children) {
    paint(ctx, child);
  }
}

function drawBackground(ctx: CanvasRenderingContext2D, box: LayoutBox) {
  const color = box.node.styledNode.style.backgroundColor;
  if (typeof color !== "string") return;

  ctx.fillStyle = color;
  ctx.fillRect(box.x, box.y, box.width, box.height);
}

function drawBorder(ctx: CanvasRenderingContext2D, box: LayoutBox) {
  const borderColor = box.node.styledNode.style.borderColor;
  if (typeof borderColor !== "string") return;

  ctx.strokeStyle = borderColor;
  ctx.strokeRect(box.x, box.y, box.width, box.height);
}

function drawText(ctx: CanvasRenderingContext2D, box: LayoutBox) {
  const node = box.node.styledNode.node;
  if (node.type !== "text") return;

  const style = box.node.styledNode.style;
  const fontSize = typeof style.fontSize === "number" ? style.fontSize : parseFontSize(style.fontSize);

  ctx.fillStyle = typeof style.color === "string" ? style.color : "black";
  ctx.font = `${fontSize}px sans-serif`;
  ctx.fillText(node.text, box.x, box.y + fontSize);
}

function parseFontSize(value: unknown) {
  if (typeof value === "string" && value.endsWith("px")) {
    return Number(value.slice(0, -2));
  }
  return 16;
}
