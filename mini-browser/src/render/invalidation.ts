const layoutProperties = new Set(["width", "height", "margin", "padding", "display"]);
const paintProperties = new Set(["color", "backgroundColor", "borderColor"]);

export type RenderWork = "layout" | "paint";

export function getInvalidation(property: string): RenderWork[] {
  if (layoutProperties.has(property)) {
    return ["layout", "paint"];
  }

  if (paintProperties.has(property)) {
    return ["paint"];
  }

  return ["layout", "paint"];
}
