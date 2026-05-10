import type { RenderNode } from "./renderTree";

export interface LayoutBox {
  node: RenderNode;
  x: number;
  y: number;
  width: number;
  height: number;
  children: LayoutBox[];
}

export interface LayoutContext {
  x: number;
  y: number;
  width: number;
}

function numberValue(value: unknown, fallback: number) {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.endsWith("px")) {
    return Number(value.slice(0, -2));
  }
  return fallback;
}

export function layout(renderNode: RenderNode, context: LayoutContext): LayoutBox {
  const style = renderNode.styledNode.style;
  const width = numberValue(style.width, context.width);
  const fontSize = numberValue(style.fontSize, 16);
  const margin = numberValue(style.margin, 0);
  const padding = numberValue(style.padding, 0);

  let currentY = context.y + margin + padding;
  const children: LayoutBox[] = [];

  for (const child of renderNode.children) {
    const childBox = layout(child, {
      x: context.x + margin + padding,
      y: currentY,
      width: Math.max(0, width - margin * 2 - padding * 2),
    });
    children.push(childBox);
    currentY += childBox.height;
  }

  const node = renderNode.styledNode.node;
  const textHeight = node.type === "text" ? fontSize * 1.5 : 0;
  const childrenHeight = children.reduce((sum, child) => sum + child.height, 0);
  const height = numberValue(style.height, Math.max(textHeight, childrenHeight + margin + padding * 2, fontSize * 1.5));

  return {
    node: renderNode,
    x: context.x + margin,
    y: context.y + margin,
    width: Math.max(0, width - margin * 2),
    height,
    children,
  };
}
